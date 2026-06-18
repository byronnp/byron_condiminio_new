import type { CondoOption, SessionUser, UserRole } from '@/stores/session.store';

export interface LoginCredentials {
  email: string;
  password: string;
}

interface ApiErrorPayload {
  message?: string;
  error?: string;
}

interface ApiUser {
  name?: string;
  email?: string;
  role?: string;
  roles?: unknown[];
  condominium?: unknown;
  condominiums?: unknown[];
  activeCondominium?: unknown;
  active_condominium?: unknown;
}

interface LoginResponseShape {
  access_token?: string;
  accessToken?: string;
  token?: string;
  refresh_token?: string;
  refreshToken?: string;
  user?: unknown;
  data?: unknown;
  condominiums?: unknown[];
  condominium?: unknown;
  activeCondominium?: unknown;
  active_condominium?: unknown;
  roles?: unknown[];
}

export interface AuthSessionPayload {
  user: SessionUser;
  accessToken: string | null;
  refreshToken: string | null;
  allowedCondominiums: CondoOption[];
  activeCondoId: string | null;
}

const apiHost = import.meta.env.VITE_API_HOST ?? 'http://localhost:8001/';

function buildApiUrl(path: string) {
  return new URL(path, apiHost).toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function normalizeRole(role: string | undefined): UserRole {
  const normalized = role?.trim().toLowerCase() ?? '';
  const normalizedKey = normalized
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  const seniorCodes = new Set([
    'senior',
    'senior_admin',
    'admin_senior',
    'administrador_senior',
    'super_admin',
    'superadministrador',
    'super_administrador',
    'root',
  ]);

  return seniorCodes.has(normalizedKey) ||
    normalizedKey.includes('senior') ||
    normalizedKey.includes('super_admin') ||
    normalizedKey.includes('superadministrador')
    ? 'senior'
    : 'admin';
}

function normalizeCondominium(item: unknown): CondoOption | null {
  if (!isRecord(item)) {
    return null;
  }

  const rawId = item.id;
  if (rawId === undefined || rawId === null) {
    return null;
  }

  if (typeof rawId !== 'string' && typeof rawId !== 'number') {
    return null;
  }

  const id = String(rawId);
  const name = typeof item.name === 'string' && item.name.trim() ? item.name : 'Condominio';
  const city = typeof item.city === 'string' ? item.city : '';
  const rawUnits = item.units ?? item.total_units;
  const units = typeof rawUnits === 'number' && Number.isFinite(rawUnits) ? rawUnits : 0;
  const rawActive = item.active ?? item.is_active;
  const active = rawActive !== false;

  return {
    id,
    name,
    city,
    units,
    active,
  };
}

function extractCondominiums(...sources: unknown[]): CondoOption[] {
  const condensed = new Map<string, CondoOption>();

  for (const source of sources) {
    const singleCondo = normalizeCondominium(source);
    if (singleCondo) {
      condensed.set(singleCondo.id, singleCondo);
      continue;
    }

    if (!Array.isArray(source)) {
      continue;
    }

    for (const item of source) {
      const normalized = normalizeCondominium(item);
      if (normalized) {
        condensed.set(normalized.id, normalized);
      }
    }
  }

  return [...condensed.values()];
}

function extractRoleFromRoles(source: unknown) {
  if (!Array.isArray(source)) {
    return null;
  }

  for (const role of source) {
    if (!isRecord(role)) {
      continue;
    }

    const code = role.code;
    if (typeof code === 'string' && code.trim()) {
      return code;
    }

    const name = role.name;
    if (typeof name === 'string' && name.trim()) {
      return name;
    }
  }

  return null;
}

function extractActiveCondoId(user: ApiUser, condominiums: CondoOption[], fallback: string | null) {
  const candidates = [
    user.activeCondominium,
    user.active_condominium,
    user.condominium,
    fallback ? condominiums.find((item) => item.id === fallback) : null,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeCondominium(candidate);
    if (normalized) {
      return normalized.id;
    }
  }

  return condominiums[0]?.id ?? null;
}

function extractToken(payload: unknown, keys: string[]) {
  if (!isRecord(payload)) {
    return null;
  }

  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value.trim()) {
      return value;
    }
  }

  return null;
}

function resolveUser(payload: unknown, fallbackEmail: string): ApiUser {
  const record = isRecord(payload) ? payload : {};
  const dataRecord = isRecord(record.data) ? record.data : {};
  const userRecord = isRecord(record.user) ? record.user : {};
  const dataUserRecord = isRecord(dataRecord.user) ? dataRecord.user : {};
  const user = {
    ...dataUserRecord,
    ...userRecord,
  };
  const resolvedName: string = typeof user.name === 'string' && user.name.trim() ? user.name : fallbackEmail;
  const resolvedEmail: string = typeof user.email === 'string' && user.email.trim() ? user.email : fallbackEmail;
  const roles = Array.isArray(user.roles)
    ? user.roles
    : Array.isArray(record.roles)
      ? record.roles
      : Array.isArray(dataRecord.roles)
        ? dataRecord.roles
        : [];
  const resolvedRole: string =
    typeof user.role === 'string'
      ? user.role
      : (extractRoleFromRoles(roles) ?? 'admin');

  return {
    name: resolvedName,
    email: resolvedEmail,
    role: resolvedRole,
    roles,
    condominium: user.condominium ?? record.condominium ?? dataRecord.condominium ?? null,
    condominiums: [
      ...(Array.isArray(user.condominiums) ? user.condominiums : []),
      ...(Array.isArray(record.condominiums) ? record.condominiums : []),
      ...(Array.isArray(dataRecord.condominiums) ? dataRecord.condominiums : []),
    ],
    activeCondominium:
      user.activeCondominium ?? record.activeCondominium ?? dataRecord.activeCondominium ?? null,
    active_condominium:
      user.active_condominium ?? record.active_condominium ?? dataRecord.active_condominium ?? null,
  };
}

async function fetchCondominiumsForSenior(token: string | null) {
  if (!token) {
    return [];
  }

  try {
    const { response, data } = await requestJson<Record<string, unknown>>('/api/condominiums', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok || !data) {
      return [];
    }

    return extractCondominiums(isRecord(data) ? data.data : data);
  } catch {
    return [];
  }
}

async function parseJsonResponse<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return (await response.json()) as T;
}

async function requestJson<T>(
  path: string,
  init?: RequestInit,
): Promise<{ response: Response; data: T | null }> {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  return {
    response,
    data: await parseJsonResponse<T>(response),
  };
}

async function hydrateUserSession(
  token: string | null,
  fallbackEmail: string,
  initialPayload: Partial<LoginResponseShape> | null,
) {
  const userFromPayload = resolveUser(initialPayload, fallbackEmail);
  const payloadCondominiums = extractCondominiums(userFromPayload.condominiums);

  if (token) {
    try {
      const { response, data } = await requestJson<Record<string, unknown>>('/api/auth/me', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok && data && typeof data === 'object') {
        const meUser = resolveUser(data, fallbackEmail);
        const userRole = normalizeRole(meUser.role);
        const meCondominiums = extractCondominiums(
          meUser.condominium,
          meUser.activeCondominium,
          meUser.active_condominium,
          meUser.condominiums,
          payloadCondominiums,
        );
        const seniorCondominiums =
          userRole === 'senior' ? await fetchCondominiumsForSenior(token) : [];
        const allowedCondominiums = extractCondominiums(seniorCondominiums, meCondominiums);

        return {
          user: {
            name: meUser.name ?? fallbackEmail,
            email: meUser.email ?? fallbackEmail,
            role: userRole,
          },
          allowedCondominiums,
          activeCondoId:
            userRole === 'senior' && !meUser.activeCondominium && !meUser.active_condominium
              ? null
              : extractActiveCondoId(meUser, allowedCondominiums, null),
        };
      }
    } catch {
      // If `/api/auth/me` is not reachable right away, keep the login response data.
    }
  }

  const normalizedCondominiums = payloadCondominiums;
  return {
    user: {
      name: userFromPayload.name ?? fallbackEmail,
      email: userFromPayload.email ?? fallbackEmail,
      role: normalizeRole(userFromPayload.role),
    },
    allowedCondominiums: normalizedCondominiums,
    activeCondoId: extractActiveCondoId(userFromPayload, normalizedCondominiums, null),
  };
}

export async function login(credentials: LoginCredentials): Promise<AuthSessionPayload> {
  const { response, data } = await requestJson<LoginResponseShape>('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
    }),
  });

  if (!response.ok) {
    const errorMessage =
      (data as ApiErrorPayload | null)?.message ??
      (data as ApiErrorPayload | null)?.error ??
      `Error al iniciar sesión (${response.status})`;

    throw new Error(errorMessage);
  }

  const accessToken =
    extractToken(data, ['access_token', 'accessToken', 'token']) ??
    extractToken(data?.data, ['access_token', 'accessToken', 'token']);
  const refreshToken =
    extractToken(data, ['refresh_token', 'refreshToken']) ??
    extractToken(data?.data, ['refresh_token', 'refreshToken']);

  const session = await hydrateUserSession(accessToken, credentials.email.trim(), data);

  return {
    ...session,
    accessToken,
    refreshToken,
  };
}
