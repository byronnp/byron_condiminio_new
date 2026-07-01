import { handleUnauthorizedResponse } from '@/services/auth-redirect';

interface ApiCreateResponse {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
}

interface ApiListResponse {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
}

export interface CreateCondominiumPayload {
  name: string;
  ruc: string;
  type: string;
  description: string;
  status: string;
  countryCode: string;
  provinceId: number | null;
  cityId: number | null;
  direction: string;
  reference: string;
  latitude?: number | null;
  longitude?: number | null;
  currency: string;
  towers: string;
  houses: string;
  characteristics: number[];
  adminName: string;
  adminLastName: string;
  adminDocumentType: string;
  adminIdNumber: string;
  adminEmail: string;
  adminPhone: string;
  adminStatus: string;
  logo: File | null;
}

export interface CreateCondominiumResult {
  success: boolean;
  message: string;
  data: unknown;
}

export interface CondominiumListItem {
  id: number;
  name: string;
  location: string;
  type: string;
  country: string;
  province: string;
  city: string;
  units: number;
  principal: string;
  status: 'Activo' | 'Inactivo';
  image: string;
}

export interface CondominiumsPageResult {
  items: CondominiumListItem[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface CondominiumOptionItem {
  id: number;
  name: string;
}

export interface CondominiumFeatureItem {
  id: number;
  code?: string | null;
  name?: string | null;
}

export interface CondominiumDetail {
  id: number;
  name: string;
  ruc: string;
  type: string;
  description: string;
  status: string;
  countryCode: string;
  provinceId: number | null;
  cityId: number | null;
  direction: string;
  reference: string;
  latitude: number | null;
  longitude: number | null;
  currency: string;
  towers: string;
  houses: string;
  characteristics: CondominiumFeatureItem[];
  logoUrl: string;
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

function pickFirstText(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = toText(record[key]);
    if (value) {
      return value;
    }
  }

  return '';
}

function pickFirstNumber(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = toNumber(record[key]);
    if (value !== null) {
      return value;
    }
  }

  return 0;
}

function buildLocationLabel(record: Record<string, unknown>) {
  const directLocation = pickFirstText(record, ['location', 'full_location']);
  if (directLocation) {
    return directLocation;
  }

  const cityRecord = isRecord(record.city) ? record.city : null;
  const provinceRecord = isRecord(record.province) ? record.province : null;
  const city =
    pickFirstText(cityRecord ?? {}, ['name', 'label']) || pickFirstText(record, ['city_name', 'city']);
  const province =
    pickFirstText(provinceRecord ?? {}, ['name', 'label']) ||
    pickFirstText(record, ['province_name', 'province']);

  if (city && province) {
    return `${city}, ${province}`;
  }

  return city || province || 'Sin ubicación';
}

function buildPersonLabel(record: Record<string, unknown>) {
  const nestedAdmin = isRecord(record.administrator)
    ? record.administrator
    : isRecord(record.admin)
      ? record.admin
      : isRecord(record.manager)
        ? record.manager
        : null;

  const fullName =
    pickFirstText(record, [
      'principal',
      'principal_name',
      'admin_name',
      'administrator_name',
      'manager_name',
      'admin_full_name',
      'administrator_full_name',
      'manager_full_name',
      'principal_full_name',
    ]) ||
    pickFirstText(nestedAdmin ?? {}, [
      'name',
      'full_name',
      'fullName',
      'principal',
      'principal_name',
      'administrator_name',
      'manager_name',
    ]);

  if (fullName) {
    return fullName;
  }

  const firstName = pickFirstText(record, [
    'admin_first_name',
    'administrator_first_name',
    'manager_first_name',
  ]);
  const lastName = pickFirstText(record, [
    'admin_last_name',
    'administrator_last_name',
    'manager_last_name',
  ]);

  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

function buildPrincipalLabel(record: Record<string, unknown>) {
  return buildPersonLabel(record) || 'Sin administrador';
}

function buildStatusLabel(record: Record<string, unknown>) {
  const rawStatus = pickFirstText(record, ['status']);
  if (rawStatus === 'Activo' || rawStatus === 'Inactivo') {
    return rawStatus;
  }

  const rawActive = record.is_active ?? record.active;
  if (rawActive === false) {
    return 'Inactivo';
  }

  return 'Activo';
}

function buildImageLabel(record: Record<string, unknown>) {
  return pickFirstText(record, ['image', 'image_url', 'logo_url', 'logo']);
}

function normalizeFeatureItem(item: unknown): CondominiumFeatureItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id);
  if (id === null) {
    return null;
  }

  return {
    id,
    code: toText(item.code) || null,
    name: toText(item.name) || null,
  };
}

function extractFirstRecord(payload: unknown) {
  if (isRecord(payload) && isRecord(payload.data)) {
    return payload.data;
  }

  if (isRecord(payload)) {
    return payload;
  }

  return null;
}

function normalizeCondominiumListItem(item: unknown): CondominiumListItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id);
  const name = pickFirstText(item, ['name', 'condominium_name', 'title']);

  if (id === null || !name) {
    return null;
  }

  const type = isRecord(item.type) ? item.type : null;
  const country = isRecord(item.country) ? item.country : null;
  const province = isRecord(item.province) ? item.province : null;
  const city = isRecord(item.city) ? item.city : null;

  return {
    id,
    name,
    location: buildLocationLabel(item),
    type:
      pickFirstText(type ?? {}, ['name', 'label']) ||
      pickFirstText(item, ['type', 'condominium_type', 'category']) ||
      'Sin tipo',
    country:
      pickFirstText(country ?? {}, ['name', 'label']) ||
      pickFirstText(item, ['country_name', 'country']) ||
      'Sin país',
    province:
      pickFirstText(province ?? {}, ['name', 'label']) ||
      pickFirstText(item, ['province_name', 'province']) ||
      'Sin provincia',
    city:
      pickFirstText(city ?? {}, ['name', 'label']) ||
      pickFirstText(item, ['city_name', 'city']) ||
      'Sin ciudad',
    units: pickFirstNumber(item, ['units', 'total_units', 'units_count', 'apartments_count']),
    principal: buildPrincipalLabel(item),
    status: buildStatusLabel(item),
    image: buildImageLabel(item),
  };
}

function normalizeCondominiumOptionItem(item: unknown): CondominiumOptionItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id ?? item.key);
  const name = toText(item.name ?? item.value);

  if (id === null || !name) {
    return null;
  }

  return { id, name };
}

function normalizeCondominiumDetail(payload: unknown): CondominiumDetail | null {
  const record = extractFirstRecord(payload);
  if (!record) {
    return null;
  }

  const id = toNumber(record.id);
  const name = pickFirstText(record, ['name', 'condominium_name', 'title']);
  if (id === null || !name) {
    return null;
  }

  const typeRecord = isRecord(record.type) ? record.type : null;
  const countryRecord = isRecord(record.country) ? record.country : null;

  return {
    id,
    name,
    ruc: pickFirstText(record, ['ruc']) || '',
    type: pickFirstText(typeRecord ?? record, ['name']) || pickFirstText(record, ['type']),
    description: pickFirstText(record, ['description']) || '',
    status: pickFirstText(record, ['status']) || 'Activo',
    countryCode:
      pickFirstText(record, ['country_code']) || pickFirstText(countryRecord ?? record, ['code']),
    provinceId: toNumber(record.province_id),
    cityId: toNumber(record.city_id),
    direction: pickFirstText(record, ['direction', 'address']) || '',
    reference: pickFirstText(record, ['reference', 'address_reference']) || '',
    latitude: toNumber(record.latitude),
    longitude: toNumber(record.longitude),
    currency: pickFirstText(record, ['currency']) || '',
    towers: String(pickFirstNumber(record, ['towers_count', 'towers'])),
    houses: String(pickFirstNumber(record, ['houses_count', 'houses'])),
    characteristics: Array.isArray(record.features)
      ? record.features
          .map(normalizeFeatureItem)
          .filter((item): item is CondominiumFeatureItem => item !== null)
      : [],
    logoUrl: pickFirstText(record, ['logo_url', 'logo_path']) || '',
  };
}

function extractListItems(payload: unknown): unknown[] {
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
    isRecord(payload.data) ? payload.data.records : null,
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

function appendIfPresent(formData: FormData, key: string, value: unknown) {
  if (value === undefined || value === null) {
    return;
  }

  if (typeof value === 'string') {
    const text = value.trim();
    if (text) {
      formData.append(key, text);
    }
    return;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    formData.append(key, String(value));
  }
}

function appendNumberArray(formData: FormData, key: string, values: number[]) {
  for (const value of values) {
    if (Number.isFinite(value)) {
      formData.append(key, String(value));
    }
  }
}

function buildCondominiumFormData(payload: CreateCondominiumPayload) {
  const formData = new FormData();

  appendIfPresent(formData, 'name', payload.name);
  appendIfPresent(formData, 'ruc', payload.ruc);
  appendIfPresent(formData, 'type', payload.type);
  appendIfPresent(formData, 'description', payload.description);
  appendIfPresent(formData, 'status', payload.status);
  appendIfPresent(formData, 'country_code', payload.countryCode);
  appendIfPresent(formData, 'province_id', payload.provinceId);
  appendIfPresent(formData, 'city_id', payload.cityId);
  appendIfPresent(formData, 'direction', payload.direction);
  appendIfPresent(formData, 'reference', payload.reference);
  appendIfPresent(formData, 'latitude', payload.latitude ?? null);
  appendIfPresent(formData, 'longitude', payload.longitude ?? null);
  appendIfPresent(formData, 'currency', payload.currency);
  appendIfPresent(formData, 'towers', payload.towers);
  appendIfPresent(formData, 'houses', payload.houses);
  appendIfPresent(formData, 'admin_name', payload.adminName);
  appendIfPresent(formData, 'admin_last_name', payload.adminLastName);
  appendIfPresent(formData, 'admin_document_type', payload.adminDocumentType);
  appendIfPresent(formData, 'admin_id_number', payload.adminIdNumber);
  appendIfPresent(formData, 'admin_email', payload.adminEmail);
  appendIfPresent(formData, 'admin_phone', payload.adminPhone);
  appendIfPresent(formData, 'admin_status', payload.adminStatus);

  appendNumberArray(formData, 'characteristics[]', payload.characteristics);

  if (payload.logo) {
    formData.append('logo', payload.logo);
  }

  return formData;
}

async function submitCondominiumRequest(
  path: string,
  method: 'POST' | 'PUT' | 'DELETE',
  payload: CreateCondominiumPayload,
  token: string | null,
): Promise<CreateCondominiumResult> {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: buildCondominiumFormData(payload),
  });

  if (handleUnauthorizedResponse(response, token)) {
    return {
      success: false,
      message: 'Sesión expirada.',
      data: null,
    };
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as ApiCreateResponse)
    : null;

  if (!response.ok) {
    const responseData = isRecord(body?.data) ? body.data : null;
    const message =
      (responseData && typeof responseData.message === 'string' && responseData.message) ||
      (typeof body?.message === 'string' && body.message) ||
      `No fue posible guardar el condominio (${response.status})`;

    throw new Error(message);
  }

  return {
    success: body?.success !== false,
    message:
      typeof body?.message === 'string' ? body.message : 'Condominio guardado correctamente.',
    data: body?.data ?? null,
  };
}

export async function createCondominium(
  payload: CreateCondominiumPayload,
  token: string | null,
): Promise<CreateCondominiumResult> {
  return submitCondominiumRequest('/api/condominiums', 'POST', payload, token);
}

export async function updateCondominium(
  id: number,
  payload: CreateCondominiumPayload,
  token: string | null,
): Promise<CreateCondominiumResult> {
  return submitCondominiumRequest(
    `/api/condominiums/${encodeURIComponent(String(id))}`,
    'PUT',
    payload,
    token,
  );
}

export async function deleteCondominium(
  id: number,
  token: string | null,
): Promise<CreateCondominiumResult> {
  const response = await fetch(buildApiUrl(`/api/condominiums/${encodeURIComponent(String(id))}`), {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (handleUnauthorizedResponse(response, token)) {
    return {
      success: false,
      message: 'Sesión expirada.',
      data: null,
    };
  }

  const contentType = response.headers.get('content-type') ?? '';
  const body = contentType.includes('application/json')
    ? ((await response.json()) as ApiCreateResponse)
    : null;

  if (!response.ok) {
    const responseData = isRecord(body?.data) ? body.data : null;
    const message =
      (responseData && typeof responseData.message === 'string' && responseData.message) ||
      (typeof body?.message === 'string' && body.message) ||
      `No fue posible eliminar el condominio (${response.status})`;

    throw new Error(message);
  }

  return {
    success: body?.success !== false,
    message:
      typeof body?.message === 'string' ? body.message : 'Condominio eliminado correctamente.',
    data: body?.data ?? null,
  };
}

export async function fetchCondominiumById(
  id: number,
  token: string | null,
): Promise<CondominiumDetail | null> {
  const response = await fetch(buildApiUrl(`/api/condominiums/${encodeURIComponent(String(id))}`), {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (handleUnauthorizedResponse(response, token)) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar el condominio (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  return normalizeCondominiumDetail(payload);
}

export async function fetchCondominiumsPage(
  page: number,
  perPage: number,
  token: string | null,
): Promise<CondominiumsPageResult> {
  const url = new URL('/api/condominiums', apiHost);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (handleUnauthorizedResponse(response, token)) {
    return { items: [], page: 1, perPage, total: 0, lastPage: 1 };
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar los condominios (${response.status})`);
  }

  const payload = (await response.json()) as ApiListResponse;
  const items = extractListItems(payload)
    .map(normalizeCondominiumListItem)
    .filter((item): item is CondominiumListItem => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
  const meta = isRecord(payload.meta)
    ? payload.meta
    : isRecord(payload.data) && isRecord(payload.data.meta)
      ? payload.data.meta
      : {};
  const total = toNumber(meta.total) ?? items.length;
  const currentPage = toNumber(meta.current_page ?? meta.currentPage) ?? page;
  const currentPerPage = toNumber(meta.per_page ?? meta.perPage) ?? perPage;
  const lastPage =
    toNumber(meta.last_page ?? meta.lastPage) ??
    Math.max(1, Math.ceil(total / currentPerPage));

  return { items, page: currentPage, perPage: currentPerPage, total, lastPage };
}

export async function fetchCondominiums(token: string | null): Promise<CondominiumListItem[]> {
  const result = await fetchCondominiumsPage(1, 100, token);
  return result.items;
}

export async function fetchCondominiumOptions(
  token: string | null,
  search = '',
): Promise<CondominiumOptionItem[]> {
  const url = new URL('/api/condominiums/options', apiHost);
  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    url.searchParams.set('search', normalizedSearch);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (handleUnauthorizedResponse(response, token)) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar las opciones de condominios (${response.status})`);
  }

  const payload = (await response.json()) as ApiListResponse;
  const items = extractListItems(payload);

  return items
    .map(normalizeCondominiumOptionItem)
    .filter((item): item is CondominiumOptionItem => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
