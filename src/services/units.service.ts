import { handleUnauthorizedResponse } from '@/services/auth-redirect';

export interface UnitListItem {
  id: number;
  code: string;
  number: string;
  areaM2: number;
  isAssignable: boolean;
  isActive: boolean;
}

export interface CondominiumBlockOption {
  id: number;
  name: string;
}

export interface CreateHousePayload {
  blockId: number;
  unitTypeId: number;
  number: string;
  code: string;
  areaM2: number;
  isAssignable: boolean;
  isActive: boolean;
}

const apiHost = import.meta.env.VITE_API_HOST ?? 'http://localhost:8001/';
const apiUrl = (path: string) => new URL(path, apiHost).toString();
const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value && typeof value === 'object');
const toNumber = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const toText = (value: unknown) => (typeof value === 'string' ? value.trim() : '');

function extractItems(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  return isRecord(payload.data) && Array.isArray(payload.data.data) ? payload.data.data : [];
}

export async function fetchUnits(condominiumId: number, token: string | null) {
  const response = await fetch(apiUrl(`/api/condominiums/${condominiumId}/units`), {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (handleUnauthorizedResponse(response, token)) return [];
  if (!response.ok) throw new Error(`No fue posible cargar las casas (${response.status})`);
  const payload = (await response.json()) as unknown;
  return extractItems(payload).flatMap((item): UnitListItem[] => {
    if (!isRecord(item)) return [];
    const id = toNumber(item.id);
    const code = toText(item.code);
    if (id === null || !code) return [];
    return [{
      id,
      code,
      number: toText(item.number),
      areaM2: toNumber(item.area_m2) ?? 0,
      isAssignable: item.is_assignable !== false,
      isActive: item.is_active !== false,
    }];
  });
}

export async function fetchCondominiumBlocks(condominiumId: number, token: string | null) {
  const response = await fetch(apiUrl(`/api/condominiums/${condominiumId}/blocks`), {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (handleUnauthorizedResponse(response, token)) return [];
  if (!response.ok) throw new Error(`No fue posible cargar los bloques (${response.status})`);
  const payload = (await response.json()) as unknown;
  return extractItems(payload).flatMap((item): CondominiumBlockOption[] => {
    if (!isRecord(item)) return [];
    const id = toNumber(item.id);
    const name = toText(item.name ?? item.label ?? item.code);
    return id !== null && name ? [{ id, name }] : [];
  });
}

export async function createHouse(
  condominiumId: number,
  payload: CreateHousePayload,
  token: string | null,
) {
  const response = await fetch(apiUrl(`/api/condominiums/${condominiumId}/units`), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      condominium_block_id: payload.blockId,
      parent_unit_id: null,
      unit_type_id: payload.unitTypeId,
      number: payload.number.trim(),
      code: payload.code.trim().toUpperCase(),
      floor: null,
      area_m2: payload.areaM2,
      is_assignable: payload.isAssignable,
      is_active: payload.isActive,
      parking_units: [],
    }),
  });
  if (handleUnauthorizedResponse(response, token)) throw new Error('Sesión expirada.');
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    throw new Error(typeof body?.message === 'string' ? body.message : `No fue posible crear la casa (${response.status})`);
  }
  return body;
}
