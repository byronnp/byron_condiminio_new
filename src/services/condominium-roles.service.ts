import { handleUnauthorizedResponse } from '@/services/auth-redirect';

export interface CondominiumRoleItem {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

interface ApiRolesResponse {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
}

const apiHost = import.meta.env.VITE_API_HOST ?? 'http://localhost:8001/';

function buildApiUrl(path: string) {
  return new URL(path, apiHost).toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function toText(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function toNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : null;
  }

  return null;
}

function normalizeRoleItem(item: unknown): CondominiumRoleItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id ?? item.role_id ?? item.roleId);
  const code = toText(item.code ?? item.slug ?? item.key);
  const name = toText(item.name ?? item.label ?? item.title);
  const description = toText(item.description ?? item.description_text ?? item.meta);
  const isActive = item.is_active !== false && item.active !== false;

  if (id === null || !code || !name) {
    return null;
  }

  return {
    id,
    code,
    name,
    description,
    isActive,
  };
}

function extractRoleItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const candidates = [
    payload.data,
    isRecord(payload.data) ? payload.data.data : null,
    isRecord(payload.data) ? payload.data.items : null,
    payload.items,
    payload.records,
    payload.results,
  ];

  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  return [];
}

export async function fetchCondominiumRoles(
  condominiumId: number,
  token: string | null,
): Promise<CondominiumRoleItem[]> {
  const response = await fetch(buildApiUrl(`/api/condominiums/${encodeURIComponent(String(condominiumId))}/roles`), {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (handleUnauthorizedResponse(response, token)) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar los roles del condominio (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return [];
  }

  const payload = (await response.json()) as ApiRolesResponse;
  const items = extractRoleItems(payload);

  return items
    .map(normalizeRoleItem)
    .filter((item): item is CondominiumRoleItem => item !== null && item.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
}
