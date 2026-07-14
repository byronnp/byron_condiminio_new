import { buildApiUrl, http } from '@/services/api/http';
import { isRecord, toNumber, toText } from '@/utils/api/common';

export interface UnitListItem {
  id: number;
  code: string;
  number: string;
  areaM2: number;
  unitTypeId: number | null;
  unitTypeCode: string;
  unitTypeName: string;
  blockId: number | null;
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
  relationshipCode: string;
  isPrimary: boolean;
  isBillingResponsible: boolean;
  isActive: boolean;
}

export interface CreateUnitPersonPayload {
  firstName: string;
  lastName: string;
  country: string;
  documentTypeId: number;
  documentNumber: string;
  phone: string;
  relationshipTypeId: number;
  startedAt: string;
  isPrimary: boolean;
  isBillingResponsible: boolean;
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
  areaM2: number | null;
  isAssignable: boolean;
  isActive: boolean;
}

export type UpdateHousePayload = Partial<CreateHousePayload>;

export interface CreateParkingUnitPayload {
  kind: 'parking' | 'storage';
  number: string;
  code: string;
  areaM2: number | null;
}

function extractItems(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.data)) return payload.data;
  return isRecord(payload.data) && Array.isArray(payload.data.data) ? payload.data.data : [];
}

function normalizeUnitItem(item: unknown): UnitListItem | null {
  if (!isRecord(item)) return null;
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
  const unitType = isRecord(item.unit_type)
    ? item.unit_type
    : isRecord(item.unitType)
      ? item.unitType
      : null;
  if (id === null || !code) return null;
  return {
    id,
    code,
    number: toText(item.number),
    areaM2: toNumber(item.area_m2) ?? 0,
    unitTypeId: toNumber(item.unit_type_id) ?? toNumber(unitType?.id),
    unitTypeCode: toText(unitType?.code ?? item.unit_type_code),
    unitTypeName: toText(unitType?.name ?? item.unit_type_name),
    blockId:
      toNumber(item.condominium_block_id) ??
      toNumber(item.block_id) ??
      (isRecord(block) ? toNumber(block.id) : null),
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
  };
}

function normalizeUnitDetail(payload: unknown): UnitListItem | null {
  const item = isRecord(payload) && isRecord(payload.data) ? payload.data : payload;
  return normalizeUnitItem(item);
}

function normalizePersonItem(item: unknown): UnitPersonItem | null {
  if (!isRecord(item)) return null;
  const id = toNumber(item.id);
  const name = toText(item.name);
  const relationshipType = isRecord(item.relationship_type)
    ? item.relationship_type
    : isRecord(item.relationshipType)
      ? item.relationshipType
      : null;
  const relationshipCode =
    toText(item.relationship_code) || toText(relationshipType?.code) || 'ocupante';
  const relationship =
    toText(item.relationship) || toText(relationshipType?.name) || relationshipCode;
  return id !== null && name
    ? {
        id,
        name,
        email: toText(item.email),
        relationship,
        relationshipCode,
        isPrimary: item.is_primary === true,
        isBillingResponsible: item.is_billing_responsible === true,
        isActive: item.is_active !== false,
      }
    : null;
}

function buildPersonBody(payload: CreateUnitPersonPayload) {
  return {
    first_name: payload.firstName.trim(),
    last_name: payload.lastName.trim(),
    country: payload.country.trim().toUpperCase(),
    document_type_id: payload.documentTypeId,
    document_number: payload.documentNumber.trim(),
    phone: payload.phone.trim() || null,
    relationship_type_id: payload.relationshipTypeId,
    started_at: payload.startedAt || null,
    is_primary: payload.isPrimary,
    is_billing_responsible: payload.isBillingResponsible,
  };
}

function buildHouseCreateBody(payload: CreateHousePayload) {
  return {
    condominium_block_id: payload.blockId,
    unit_type_id: payload.unitTypeId,
    code: payload.code.trim().toUpperCase(),
    number: payload.number.trim(),
    area_m2: payload.areaM2,
    is_assignable: payload.isAssignable,
    is_active: payload.isActive,
  };
}

function buildHouseUpdateBody(payload: UpdateHousePayload) {
  const body: Record<string, unknown> = {};
  if (payload.blockId !== undefined) body.condominium_block_id = payload.blockId;
  if (payload.unitTypeId !== undefined) body.unit_type_id = payload.unitTypeId;
  if (payload.code !== undefined) body.code = payload.code.trim().toUpperCase();
  if (payload.number !== undefined) body.number = payload.number.trim();
  if (payload.areaM2 !== undefined) body.area_m2 = payload.areaM2;
  if (payload.isAssignable !== undefined) body.is_assignable = payload.isAssignable;
  if (payload.isActive !== undefined) body.is_active = payload.isActive;
  return body;
}

function extractMeta(payload: unknown, page: number, perPage: number, itemsLength: number) {
  const root = isRecord(payload) ? payload : {};
  const meta = isRecord(root.meta)
    ? root.meta
    : isRecord(root.data) && isRecord(root.data.meta)
      ? root.data.meta
      : {};
  const total = toNumber(meta.total) ?? itemsLength;
  const currentPage = toNumber(meta.current_page ?? meta.currentPage) ?? page;
  const currentPerPage = toNumber(meta.per_page ?? meta.perPage) ?? perPage;
  const lastPage =
    toNumber(meta.last_page ?? meta.lastPage) ?? Math.max(1, Math.ceil(total / currentPerPage));

  return { total, currentPage, currentPerPage, lastPage };
}

export async function fetchUnitsPage(
  condominiumId: number,
  page: number,
  perPage: number,
  token: string | null,
): Promise<UnitsPageResult> {
  const url = new URL(buildApiUrl(`/api/condominiums/${condominiumId}/units`));
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));

  const { response, data, unauthorized } = await http.get<unknown>(url.toString(), { token });

  if (unauthorized) {
    return { items: [], page: 1, perPage, total: 0, lastPage: 1 };
  }

  if (!response.ok) throw new Error(`No fue posible cargar las casas (${response.status})`);

  const items = extractItems(data).flatMap((item): UnitListItem[] => {
    const normalized = normalizeUnitItem(item);
    return normalized ? [normalized] : [];
  });
  const meta = extractMeta(data, page, perPage, items.length);
  return {
    items,
    page: meta.currentPage,
    perPage: meta.currentPerPage,
    total: meta.total,
    lastPage: meta.lastPage,
  };
}

export async function fetchUnits(condominiumId: number, token: string | null) {
  return (await fetchUnitsPage(condominiumId, 1, 100, token)).items;
}

export async function fetchUnitById(condominiumId: number, unitId: number, token: string | null) {
  const { response, data, unauthorized } = await http.get<unknown>(
    `/api/condominiums/${condominiumId}/units/${unitId}`,
    { token },
  );
  if (unauthorized) return null;
  if (!response.ok) throw new Error(`No fue posible cargar la casa (${response.status})`);
  return normalizeUnitDetail(data);
}

export async function fetchUnitPeople(condominiumId: number, unitId: number, token: string | null) {
  const { response, data, unauthorized } = await http.get<unknown>(
    `/api/condominiums/${condominiumId}/units/${unitId}/users`,
    { token },
  );
  if (unauthorized) return [];
  if (!response.ok) throw new Error(`No fue posible cargar las personas (${response.status})`);
  return extractItems(data).flatMap((item): UnitPersonItem[] => {
    const normalized = normalizePersonItem(item);
    return normalized ? [normalized] : [];
  });
}

export async function createUnitPerson(
  condominiumId: number,
  unitId: number,
  payload: CreateUnitPersonPayload,
  token: string | null,
) {
  const { response, data, unauthorized } = await http.post<Record<string, unknown>>(
    `/api/condominiums/${condominiumId}/units/${unitId}/users`,
    {
      token,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: buildPersonBody(payload),
    },
  );
  if (unauthorized) throw new Error('Sesión expirada.');
  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `No fue posible agregar la persona (${response.status})`,
    );
  }
  return data;
}

export async function createParkingUnit(
  condominiumId: number,
  parentUnitId: number,
  unitTypeId: number,
  payload: CreateParkingUnitPayload,
  token: string | null,
) {
  const { response, data, unauthorized } = await http.post<Record<string, unknown>>(
    `/api/condominiums/${condominiumId}/units`,
    {
      token,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: {
        parent_unit_id: parentUnitId,
        unit_type_id: unitTypeId,
        code: payload.code.trim().toUpperCase(),
        number: payload.number.trim(),
        area_m2: payload.areaM2 ?? 0,
        is_assignable: false,
        is_active: true,
      },
    },
  );
  if (unauthorized) throw new Error('Sesión expirada.');
  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `No fue posible crear el parqueadero (${response.status})`,
    );
  }
  return data;
}

export async function fetchCondominiumBlocks(condominiumId: number, token: string | null) {
  const { response, data, unauthorized } = await http.get<unknown>(
    `/api/condominiums/${condominiumId}/blocks`,
    { token },
  );
  if (unauthorized) return [];
  if (!response.ok) throw new Error(`No fue posible cargar los bloques (${response.status})`);
  return extractItems(data).flatMap((item): CondominiumBlockOption[] => {
    if (!isRecord(item)) return [];
    const id = toNumber(item.id);
    const name = toText(item.name ?? item.label ?? item.code);
    return id !== null && name ? [{ id, name }] : [];
  });
}

export async function createCondominiumBlock(
  condominiumId: number,
  name: string,
  token: string | null,
) {
  const { response, data, unauthorized } = await http.post<Record<string, unknown>>(
    `/api/condominiums/${condominiumId}/blocks`,
    {
      token,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: { name: name.trim() },
    },
  );
  if (unauthorized) throw new Error('Sesión expirada.');
  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `No fue posible crear el bloque (${response.status})`,
    );
  }
  return data;
}

export async function createHouse(
  condominiumId: number,
  payload: CreateHousePayload,
  token: string | null,
) {
  const { response, data, unauthorized } = await http.post<Record<string, unknown>>(
    `/api/condominiums/${condominiumId}/units`,
    {
      token,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: buildHouseCreateBody(payload),
    },
  );
  if (unauthorized) throw new Error('Sesión expirada.');
  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `No fue posible crear la casa (${response.status})`,
    );
  }
  return data;
}

export async function updateHouse(
  condominiumId: number,
  unitId: number,
  payload: UpdateHousePayload,
  token: string | null,
) {
  const { response, data, unauthorized } = await http.patch<Record<string, unknown>>(
    `/api/condominiums/${condominiumId}/units/${unitId}`,
    {
      token,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: buildHouseUpdateBody(payload),
    },
  );
  if (unauthorized) throw new Error('Sesión expirada.');
  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `No fue posible actualizar la casa (${response.status})`,
    );
  }
  return data;
}

export async function setUnitBillingResponsible(
  condominiumId: number,
  unitId: number,
  userId: number,
  token: string | null,
) {
  const { response, data, unauthorized } = await http.patch<Record<string, unknown>>(
    `/api/condominiums/${condominiumId}/units/${unitId}/users/${userId}/billing-responsible`,
    {
      token,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: {},
    },
  );
  if (unauthorized) throw new Error('Sesión expirada.');
  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `No fue posible cambiar el responsable de facturación (${response.status})`,
    );
  }
  return data;
}

export async function deactivateUnitPerson(
  condominiumId: number,
  unitId: number,
  userId: number,
  disableAccess: boolean,
  token: string | null,
) {
  const { response, data, unauthorized } = await http.patch<Record<string, unknown>>(
    `/api/condominiums/${condominiumId}/units/${unitId}/users/${userId}/deactivate`,
    {
      token,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: { disable_access: disableAccess },
    },
  );
  if (unauthorized) throw new Error('Sesión expirada.');
  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `No fue posible desactivar la relación (${response.status})`,
    );
  }
  return data;
}

export async function createUnitAccessInvitation(
  condominiumId: number,
  unitId: number,
  userId: number,
  token: string | null,
) {
  const { response, data, unauthorized } = await http.post<Record<string, unknown>>(
    `/api/condominiums/${condominiumId}/units/${unitId}/users/${userId}/access-invitations`,
    {
      token,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: {},
    },
  );
  if (unauthorized) throw new Error('Sesión expirada.');
  if (!response.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `No fue posible enviar la invitación (${response.status})`,
    );
  }
  return data;
}
