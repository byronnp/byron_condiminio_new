import { http } from '@/services/api/http';
import { isRecord, toNumber, toText } from '@/utils/api/common';

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
  const { response, data, unauthorized } = await http.get<ApiRolesResponse>(
    `/api/condominiums/${encodeURIComponent(String(condominiumId))}/roles`,
    { token },
  );

  if (unauthorized) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar los roles del condominio (${response.status})`);
  }

  const items = extractRoleItems(data);

  return items
    .map(normalizeRoleItem)
    .filter((item): item is CondominiumRoleItem => item !== null && item.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
}
