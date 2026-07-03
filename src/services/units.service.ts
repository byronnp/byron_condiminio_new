import { handleUnauthorizedResponse } from '@/services/auth-redirect';

export interface UnitListItem {
  id: number;
  code: string;
  number: string;
  areaM2: number;
  isAssignable: boolean;
  isActive: boolean;
  parentUnitId: number | null;
  blockName: string;
  ownerName: string;
  peopleCount: number;
  parkingCount: number;
}

export interface UnitPersonItem {
  id: number;
  name: string;
  email: string;
  relationship: string;
  isPrimary: boolean;
  isBillingResponsible: boolean;
  isActive: boolean;
}

export interface CreateUnitPersonPayload {
  firstName: string;
  lastName: string;
  documentTypeId: number;
  documentNumber: string;
  phone: string;
  secondaryPhone: string;
  relationshipTypeId: number;
  startedAt: string;
  endedAt: string;
  isPrimary: boolean;
  isBillingResponsible: boolean;
}

export interface UnitPersonProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  documentTypeId: number | null;
  documentTypeName: string;
  documentNumber: string;
  phone: string;
  secondaryPhone: string;
  isAccessEnabled: boolean;
}
export interface UnitsPageResult {
  items: UnitListItem[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface CondominiumBlockOption {
  id: number;
  name: string;
}

export interface CreateHousePayload {
  blockId: number | null;
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
  if (value === null || value === undefined || value === '') return null;
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

export async function fetchUnitsPage(
  condominiumId: number,
  page: number,
  perPage: number,
  token: string | null,
): Promise<UnitsPageResult> {
  const url = new URL(`/api/condominiums/${condominiumId}/units`, apiHost);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  const response = await fetch(url.toString(), {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (handleUnauthorizedResponse(response, token)) {
    return { items: [], page: 1, perPage, total: 0, lastPage: 1 };
  }
  if (!response.ok) throw new Error(`No fue posible cargar las casas (${response.status})`);
  const payload = (await response.json()) as unknown;
  const items = extractItems(payload).flatMap((item): UnitListItem[] => {
    if (!isRecord(item)) return [];
    const id = toNumber(item.id);
    const code = toText(item.code);
    const block = isRecord(item.block)
      ? item.block
      : isRecord(item.condominium_block)
        ? item.condominium_block
        : null;
    const owner = isRecord(item.owner)
      ? item.owner
      : isRecord(item.primary_owner)
        ? item.primary_owner
        : null;
    if (id === null || !code) return [];
    return [
      {
        id,
        code,
        number: toText(item.number),
        areaM2: toNumber(item.area_m2) ?? 0,
        isAssignable: item.is_assignable !== false,
        isActive: item.is_active !== false,
        parentUnitId: toNumber(item.parent_unit_id),
        blockName: toText(block?.name ?? block?.code) || toText(item.block_name) || 'Sin bloque',
        ownerName:
          toText(owner?.name) ||
          toText(item.owner_name ?? item.primary_owner_name) ||
          'Sin propietario',
        peopleCount: toNumber(item.people_count ?? item.users_count ?? item.residents_count) ?? 0,
        parkingCount:
          toNumber(item.parking_units_count ?? item.parkings_count) ??
          (Array.isArray(item.parking_units) ? item.parking_units.length : 0),
      },
    ];
  });
  const root = isRecord(payload) ? payload : {};
  const meta = isRecord(root.meta)
    ? root.meta
    : isRecord(root.data) && isRecord(root.data.meta)
      ? root.data.meta
      : {};
  const total = toNumber(meta.total) ?? items.length;
  const currentPage = toNumber(meta.current_page ?? meta.currentPage) ?? page;
  const currentPerPage = toNumber(meta.per_page ?? meta.perPage) ?? perPage;
  const lastPage =
    toNumber(meta.last_page ?? meta.lastPage) ?? Math.max(1, Math.ceil(total / currentPerPage));
  return { items, page: currentPage, perPage: currentPerPage, total, lastPage };
}

export async function fetchUnits(condominiumId: number, token: string | null) {
  return (await fetchUnitsPage(condominiumId, 1, 100, token)).items;
}

export async function fetchUnitById(condominiumId: number, unitId: number, token: string | null) {
  const response = await fetch(apiUrl(`/api/condominiums/${condominiumId}/units/${unitId}`), {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (handleUnauthorizedResponse(response, token)) return null;
  if (!response.ok) throw new Error(`No fue posible cargar la casa (${response.status})`);
  const payload = (await response.json()) as unknown;
  const item = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
  if (!isRecord(item)) return null;
  const id = toNumber(item.id);
  const code = toText(item.code);
  if (id === null || !code) return null;
  const block = isRecord(item.block)
    ? item.block
    : isRecord(item.condominium_block)
      ? item.condominium_block
      : null;
  const owner = isRecord(item.owner)
    ? item.owner
    : isRecord(item.primary_owner)
      ? item.primary_owner
      : null;
  return {
    id,
    code,
    number: toText(item.number),
    areaM2: toNumber(item.area_m2) ?? 0,
    isAssignable: item.is_assignable !== false,
    isActive: item.is_active !== false,
    parentUnitId: toNumber(item.parent_unit_id),
    blockName: toText(block?.name ?? block?.code) || toText(item.block_name) || 'Sin bloque',
    ownerName:
      toText(owner?.name) ||
      toText(item.owner_name ?? item.primary_owner_name) ||
      'Sin propietario',
    peopleCount: toNumber(item.people_count ?? item.users_count ?? item.residents_count) ?? 0,
    parkingCount:
      toNumber(item.parking_units_count ?? item.parkings_count) ??
      (Array.isArray(item.parking_units) ? item.parking_units.length : 0),
  } satisfies UnitListItem;
}

export async function fetchUnitPeople(condominiumId: number, unitId: number, token: string | null) {
  const response = await fetch(apiUrl(`/api/condominiums/${condominiumId}/units/${unitId}/users`), {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (handleUnauthorizedResponse(response, token)) return [];
  if (!response.ok) throw new Error(`No fue posible cargar las personas (${response.status})`);
  const payload = (await response.json()) as unknown;
  return extractItems(payload).flatMap((item): UnitPersonItem[] => {
    if (!isRecord(item)) return [];
    const id = toNumber(item.id);
    const name = toText(item.name);
    return id !== null && name
      ? [
          {
            id,
            name,
            email: toText(item.email),
            relationship: toText(item.relationship_code) || 'persona',
            isPrimary: item.is_primary === true,
            isBillingResponsible: item.is_billing_responsible === true,
            isActive: item.is_active !== false,
          },
        ]
      : [];
  });
}

export async function fetchUnitPersonProfile(userId: number, token: string | null) {
  const response = await fetch(apiUrl(`/api/users/${userId}`), {
    headers: { Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (handleUnauthorizedResponse(response, token)) return null;
  if (!response.ok) throw new Error(`No fue posible cargar la persona (${response.status})`);
  const payload = (await response.json()) as unknown;
  const item = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
  if (!isRecord(item)) return null;
  const id = toNumber(item.id);
  if (id === null) return null;
  const documentType = isRecord(item.document_type) ? item.document_type : null;
  return {
    id,
    firstName: toText(item.first_name ?? item.name),
    lastName: toText(item.last_name),
    email: toText(item.email),
    country: toText(item.country) || 'EC',
    documentTypeId: toNumber(documentType?.id),
    documentTypeName: toText(documentType?.name),
    documentNumber: toText(item.document_number),
    phone: toText(item.phone),
    secondaryPhone: toText(item.secondary_phone),
    isAccessEnabled: item.is_access_enabled === true,
  } satisfies UnitPersonProfile;
}

export async function createUnitPerson(
  condominiumId: number,
  unitId: number,
  payload: CreateUnitPersonPayload,
  token: string | null,
) {
  const response = await fetch(apiUrl(`/api/condominiums/${condominiumId}/units/${unitId}/users`), {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      name: [payload.firstName.trim(), payload.lastName.trim()].filter(Boolean).join(' '),
      first_name: payload.firstName.trim(),
      last_name: payload.lastName.trim(),
      country: 'EC',
      document_type_id: payload.documentTypeId,
      document_number: payload.documentNumber.trim(),
      phone: payload.phone.trim() || null,
      secondary_phone: payload.secondaryPhone.trim() || null,
      relationship_type_id: payload.relationshipTypeId,
      started_at: payload.startedAt || null,
      ended_at: payload.endedAt || null,
      is_primary: payload.isPrimary,
      is_billing_responsible: payload.isBillingResponsible,
    }),
  });
  if (handleUnauthorizedResponse(response, token)) throw new Error('Sesión expirada.');
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    throw new Error(
      typeof body?.message === 'string'
        ? body.message
        : `No fue posible agregar la persona (${response.status})`,
    );
  }
  return body;
}

export async function updateUnitPerson(
  userId: number,
  payload: CreateUnitPersonPayload,
  token: string | null,
) {
  const response = await fetch(apiUrl(`/api/users/${userId}`), {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      name: [payload.firstName.trim(), payload.lastName.trim()].filter(Boolean).join(' '),
      first_name: payload.firstName.trim(),
      last_name: payload.lastName.trim(),
      country: 'EC',
      document_type_id: payload.documentTypeId,
      document_number: payload.documentNumber.trim(),
      phone: payload.phone.trim() || null,
      secondary_phone: payload.secondaryPhone.trim() || null,
      relationship_type_id: payload.relationshipTypeId,
      started_at: payload.startedAt || null,
      ended_at: payload.endedAt || null,
      is_primary: payload.isPrimary,
      is_billing_responsible: payload.isBillingResponsible,
    }),
  });
  if (handleUnauthorizedResponse(response, token)) throw new Error('Sesión expirada.');
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok) {
    throw new Error(
      typeof body?.message === 'string'
        ? body.message
        : `No fue posible actualizar la persona (${response.status})`,
    );
  }
  return body;
}

export async function createParkingUnit(
  condominiumId: number,
  parentUnitId: number,
  unitTypeId: number,
  payload: { number: string; code: string; areaM2: number | null },
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
      condominium_block_id: null,
      parent_unit_id: parentUnitId,
      unit_type_id: unitTypeId,
      number: payload.number.trim(),
      code: payload.code.trim().toUpperCase(),
      floor: null,
      area_m2: payload.areaM2,
      is_assignable: false,
      is_active: true,
      parking_units: [],
    }),
  });
  if (handleUnauthorizedResponse(response, token)) throw new Error('Sesión expirada.');
  const body = (await response.json().catch(() => null)) as Record<string, unknown> | null;
  if (!response.ok)
    throw new Error(
      typeof body?.message === 'string'
        ? body.message
        : `No fue posible crear el parqueadero (${response.status})`,
    );
  return body;
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
    throw new Error(
      typeof body?.message === 'string'
        ? body.message
        : `No fue posible crear la casa (${response.status})`,
    );
  }
  return body;
}
