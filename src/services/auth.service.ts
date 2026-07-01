import type { CondoOption, SessionUser, UserRole } from '@/stores/session.store';
import { handleUnauthorizedResponse } from '@/services/auth-redirect';

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
  is_platform_admin?: boolean | undefined;
  isPlatformAdmin?: boolean | undefined;
  condominium?: unknown;
  condominiums?: unknown[];
  activeCondominium?: unknown;
  active_condominium?: unknown;
  platform_role?: unknown;
  platformRole?: unknown;
}

interface LoginResponseShape {
  access_token?: string;
  accessToken?: string;
  token?: string;
  refresh_token?: string;
  refreshToken?: string;
  user?: unknown;
  data?: unknown;
  is_platform_admin?: unknown;
  isPlatformAdmin?: unknown;
  condominiums?: unknown[];
  condominium?: unknown;
  activeCondominium?: unknown;
  active_condominium?: unknown;
  roles?: unknown[];
  platform_role?: unknown;
  platformRole?: unknown;
}

export interface ActivateAccessPayload {
  token: string;
  password: string;
  passwordConfirmation: string;
}

export interface AuthServiceFieldErrors {
  token?: string;
  password?: string;
  passwordConfirmation?: string;
}

export class AuthServiceError extends Error {
  fieldErrors: AuthServiceFieldErrors;
  status: number;

  constructor(message: string, status: number, fieldErrors: AuthServiceFieldErrors = {}) {
    super(message);
    this.name = 'AuthServiceError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

export interface AuthSessionPayload {
  user: SessionUser;
  accessToken: string | null;
  refreshToken: string | null;
  allowedCondominiums: CondoOption[];
  activeCondoId: string | null;
}

type HydratedSession = Omit<AuthSessionPayload, 'accessToken' | 'refreshToken'>;

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

function resolveUserRole(user: ApiUser): UserRole {
  if (typeof user.is_platform_admin === 'boolean') {
    return user.is_platform_admin ? 'senior' : 'admin';
  }

  if (typeof user.isPlatformAdmin === 'boolean') {
    return user.isPlatformAdmin ? 'senior' : 'admin';
  }

  return normalizeRole(user.role);
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

function extractActiveCondoId(
  user: ApiUser,
  condominiums: CondoOption[],
  fallback: string | null,
  allowDefaultFirstCondo = true,
) {
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

  return allowDefaultFirstCondo ? (condominiums[0]?.id ?? null) : null;
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

function firstTextValue(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text: string | null = firstTextValue(item);
      if (text) {
        return text;
      }
    }
  }

  return null;
}

function extractServiceFieldErrors(payload: unknown): AuthServiceFieldErrors {
  if (!isRecord(payload)) {
    return {};
  }

  const rawErrors = isRecord(payload.errors)
    ? payload.errors
    : (isRecord(payload.field_errors) ? payload.field_errors : null);
  if (!rawErrors) {
    return {};
  }

  const fieldErrors: AuthServiceFieldErrors = {};
  const entries = Object.entries(rawErrors);

  for (const [key, value] of entries) {
    const message = firstTextValue(value);
    if (!message) {
      continue;
    }

    if (key === 'password_confirmation' || key === 'passwordConfirmation') {
      fieldErrors.passwordConfirmation = message;
      continue;
    }

    if (key === 'password') {
      fieldErrors.password = message;
      continue;
    }

    if (key === 'token') {
      fieldErrors.token = message;
      continue;
    }
  }

  return fieldErrors;
}

function extractServiceErrorMessage(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  return firstTextValue(payload.message) ?? firstTextValue(payload.error);
}

function mapActivateAccessFallbackMessage(status: number) {
  switch (status) {
    case 400:
    case 401:
    case 403:
    case 404:
      return 'El enlace de activación no es válido.';
    case 409:
      return 'Esta invitación ya fue utilizada.';
    case 410:
      return 'El enlace de activación expiró. Solicita una nueva invitación.';
    case 422:
      return 'Revisa los campos marcados.';
    default:
      return 'No fue posible activar tu acceso. Intenta nuevamente.';
  }
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
  const resolvedName: string =
    typeof user.name === 'string' && user.name.trim() ? user.name : fallbackEmail;
  const resolvedEmail: string =
    typeof user.email === 'string' && user.email.trim() ? user.email : fallbackEmail;
  const roles = Array.isArray(user.roles)
    ? user.roles
    : Array.isArray(record.roles)
      ? record.roles
      : Array.isArray(dataRecord.roles)
        ? dataRecord.roles
        : [];
  const resolvedRole: string =
    typeof user.role === 'string' ? user.role : (extractRoleFromRoles(roles) ?? 'admin');
  const platformAdminValue = user.is_platform_admin ?? record.is_platform_admin ?? dataRecord.is_platform_admin;
  const platformAdminCamelValue =
    user.isPlatformAdmin ?? record.isPlatformAdmin ?? dataRecord.isPlatformAdmin;

  return {
    name: resolvedName,
    email: resolvedEmail,
    role: resolvedRole,
    is_platform_admin:
      typeof platformAdminValue === 'boolean'
        ? platformAdminValue
        : (typeof platformAdminCamelValue === 'boolean' ? platformAdminCamelValue : undefined),
    isPlatformAdmin:
      typeof platformAdminCamelValue === 'boolean'
        ? platformAdminCamelValue
        : (typeof platformAdminValue === 'boolean' ? platformAdminValue : undefined),
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
    platform_role: user.platform_role ?? record.platform_role ?? dataRecord.platform_role ?? null,
    platformRole: user.platformRole ?? record.platformRole ?? dataRecord.platformRole ?? null,
  };
}

function extractPlatformRoleId(user: ApiUser) {
  const role = isRecord(user.platform_role)
    ? user.platform_role
    : isRecord(user.platformRole)
      ? user.platformRole
      : null;
  const id = Number(role?.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function extractPlatformRoleIdFromPayload(payload: unknown) {
  if (!isRecord(payload)) return null;

  const data = isRecord(payload.data) ? payload.data : null;
  const user = isRecord(payload.user) ? payload.user : null;
  const dataUser = data && isRecord(data.user) ? data.user : null;
  const candidates = [
    payload.platform_role,
    payload.platformRole,
    data?.platform_role,
    data?.platformRole,
    user?.platform_role,
    user?.platformRole,
    dataUser?.platform_role,
    dataUser?.platformRole,
  ];

  for (const candidate of candidates) {
    if (!isRecord(candidate)) continue;
    const id = Number(candidate.id);
    if (Number.isInteger(id) && id > 0) return id;
  }

  return null;
}

export async function fetchCurrentPlatformRoleId(token: string | null) {
  if (!token) return null;

  const { response, data, unauthorized } = await requestJson<Record<string, unknown>>(
    '/api/auth/me',
    {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    },
    token,
  );

  if (unauthorized || !response.ok || !data) return null;
  return extractPlatformRoleIdFromPayload(data) ?? extractPlatformRoleId(resolveUser(data, ''));
}

async function fetchCondominiumsForSenior(token: string | null): Promise<CondoOption[] | null> {
  if (!token) {
    return [];
  }

  try {
    const { response, data, unauthorized } = await requestJson<Record<string, unknown>>(
      '/api/condominiums',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      token,
    );

    if (unauthorized) {
      return null;
    }

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
  accessToken?: string | null,
): Promise<{ response: Response; data: T | null; unauthorized: boolean }> {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  const unauthorized = handleUnauthorizedResponse(response, accessToken ?? null);

  return {
    response,
    data: await parseJsonResponse<T>(response),
    unauthorized,
  };
}

async function hydrateUserSession(
  token: string | null,
  fallbackEmail: string,
  initialPayload: Partial<LoginResponseShape> | null,
): Promise<HydratedSession | null> {
  const userFromPayload = resolveUser(initialPayload, fallbackEmail);
  const payloadCondominiums = extractCondominiums(userFromPayload.condominiums);

  if (token) {
    try {
      const { response, data, unauthorized } = await requestJson<Record<string, unknown>>(
        '/api/auth/me',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        token,
      );

      if (unauthorized) {
        return null;
      }

      if (response.ok && data && typeof data === 'object') {
        const meUser = resolveUser(data, fallbackEmail);
        const userRole = resolveUserRole(meUser);
        const meCondominiums = extractCondominiums(
          meUser.condominium,
          meUser.activeCondominium,
          meUser.active_condominium,
          meUser.condominiums,
          payloadCondominiums,
        );
        const seniorCondominiums =
          userRole === 'senior' ? await fetchCondominiumsForSenior(token) : [];
        if (seniorCondominiums === null) {
          return null;
        }
        const allowedCondominiums = extractCondominiums(seniorCondominiums, meCondominiums);

        return {
          user: {
            name: meUser.name ?? fallbackEmail,
            email: meUser.email ?? fallbackEmail,
            role: userRole,
            platformRoleId: extractPlatformRoleId(meUser),
          },
          allowedCondominiums,
          activeCondoId:
            userRole === 'senior'
              ? null
              : extractActiveCondoId(meUser, allowedCondominiums, null, true),
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
      role: resolveUserRole(userFromPayload),
      platformRoleId: extractPlatformRoleId(userFromPayload),
    },
    allowedCondominiums: normalizedCondominiums,
    activeCondoId: resolveUserRole(userFromPayload) === 'senior'
      ? null
      : extractActiveCondoId(userFromPayload, normalizedCondominiums, null, true),
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
  if (!session) {
    throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
  }

  return {
    ...session,
    accessToken,
    refreshToken,
  };
}

export async function activateAccess(payload: ActivateAccessPayload): Promise<void> {
  const { response, data } = await requestJson<Record<string, unknown>>('/api/auth/activate-access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: payload.token,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
    }),
  });

  if (!response.ok) {
    const fieldErrors = extractServiceFieldErrors(data);
    const message = extractServiceErrorMessage(data) ?? mapActivateAccessFallbackMessage(response.status);
    throw new AuthServiceError(message, response.status, fieldErrors);
  }
}
