import { buildApiUrl, http } from '@/services/api/http';
import { isRecord, toNumber, toText } from '@/utils/api/common';

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
  email: string;
  phone: string;
  countryCode: string;
  provinceId: number | null;
  cityId: number | null;
  address: string;
  reference: string;
  latitude?: number | null;
  longitude?: number | null;
  currency: string;
  towers: string;
  houses: string;
  totalUnits: string;
  isActive: boolean;
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
  email: string;
  phone: string;
  isActive: boolean;
  countryCode: string;
  provinceId: number | null;
  cityId: number | null;
  address: string;
  reference: string;
  latitude: number | null;
  longitude: number | null;
  currency: string;
  towers: string;
  houses: string;
  totalUnits: string;
  characteristics: CondominiumFeatureItem[];
  logoUrl: string;
}

export class CondominiumServiceError extends Error {
  status: number;
  fieldErrors: Record<string, string>;

  constructor(message: string, status: number, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'CondominiumServiceError';
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
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
    pickFirstText(cityRecord ?? {}, ['name', 'label']) ||
    pickFirstText(record, ['city_name', 'city']);
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
  if (rawActive === false || rawActive === 0 || rawActive === '0') {
    return 'Inactivo';
  }

  return 'Activo';
}

function resolveIsActive(record: Record<string, unknown>) {
  const rawActive = record.is_active ?? record.active;
  if (rawActive === false || rawActive === 0 || rawActive === '0') {
    return false;
  }

  const rawStatus = pickFirstText(record, ['status']).trim().toLowerCase();
  if (rawStatus === 'inactivo' || rawStatus === 'inactive') {
    return false;
  }

  return true;
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
    email: pickFirstText(record, ['email']) || '',
    phone: pickFirstText(record, ['phone']) || '',
    isActive: resolveIsActive(record),
    countryCode:
      pickFirstText(record, ['country_code']) || pickFirstText(countryRecord ?? record, ['code']),
    provinceId: toNumber(record.province_id),
    cityId: toNumber(record.city_id),
    address: pickFirstText(record, ['address', 'direction']) || '',
    reference: pickFirstText(record, ['reference', 'address_reference']) || '',
    latitude: toNumber(record.latitude),
    longitude: toNumber(record.longitude),
    currency: pickFirstText(record, ['currency']) || '',
    towers: String(pickFirstNumber(record, ['towers_count', 'towers'])),
    houses: String(pickFirstNumber(record, ['houses_count', 'houses'])),
    totalUnits: String(pickFirstNumber(record, ['total_units', 'units', 'units_count'])),
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

function appendBoolean(formData: FormData, key: string, value: boolean) {
  formData.append(key, value ? '1' : '0');
}

function appendNullableNumber(formData: FormData, key: string, value: number | null | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    formData.append(key, String(value));
    return;
  }

  formData.append(key, '');
}

function appendNumberArray(formData: FormData, key: string, values: number[]) {
  for (const value of values) {
    if (Number.isFinite(value)) {
      formData.append(key, String(value));
    }
  }
}

function extractFirstMessage(value: unknown): string | null {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const message = extractFirstMessage(item);
      if (message) {
        return message;
      }
    }
  }

  return null;
}

function extractFieldErrors(payload: unknown) {
  const source = isRecord(payload) ? payload : {};
  const data = isRecord(source.data) ? source.data : {};
  const errors = isRecord(source.errors)
    ? source.errors
    : isRecord(data.errors)
      ? data.errors
      : {};
  const fieldErrors: Record<string, string> = {};

  for (const [key, value] of Object.entries(errors)) {
    const message = extractFirstMessage(value);
    if (message) {
      fieldErrors[key] = message;
    }
  }

  return fieldErrors;
}

function extractResponseMessage(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  return extractFirstMessage(payload.message) ?? extractFirstMessage(payload.error);
}

function buildFallbackMessage(status: number, action: 'listar' | 'cargar' | 'guardar' | 'eliminar' | 'estado') {
  switch (status) {
    case 401:
      return 'Tu sesión expiró. Vuelve a iniciar sesión.';
    case 403:
      return 'No tienes permisos para gestionar condominios.';
    case 404:
      return 'El condominio solicitado no existe o ya no está disponible.';
    case 422:
      return 'Revisa los campos marcados antes de continuar.';
    case 429:
      return 'Demasiados intentos. Espera un momento e intenta nuevamente.';
    case 500:
      return 'Ocurrió un error en el servidor. Intenta nuevamente más tarde.';
    default:
      return `No fue posible ${action} el condominio (${status}).`;
  }
}

function buildServiceError(payload: unknown, status: number, action: 'listar' | 'cargar' | 'guardar' | 'eliminar' | 'estado') {
  const message = extractResponseMessage(payload) ?? buildFallbackMessage(status, action);
  return new CondominiumServiceError(message, status, extractFieldErrors(payload));
}

function buildCondominiumFormData(
  payload: CreateCondominiumPayload,
  options: { spoofPut?: boolean } = {},
) {
  const formData = new FormData();

  if (options.spoofPut) {
    formData.append('_method', 'PUT');
  }

  appendIfPresent(formData, 'name', payload.name);
  appendIfPresent(formData, 'ruc', payload.ruc);
  appendIfPresent(formData, 'type', payload.type);
  appendIfPresent(formData, 'description', payload.description);
  appendIfPresent(formData, 'email', payload.email);
  appendIfPresent(formData, 'phone', payload.phone);
  appendIfPresent(formData, 'country_code', payload.countryCode);
  appendIfPresent(formData, 'province_id', payload.provinceId);
  appendIfPresent(formData, 'city_id', payload.cityId);
  appendIfPresent(formData, 'address', payload.address);
  appendIfPresent(formData, 'reference', payload.reference);
  appendNullableNumber(formData, 'latitude', payload.latitude ?? null);
  appendNullableNumber(formData, 'longitude', payload.longitude ?? null);
  appendIfPresent(formData, 'currency', payload.currency);
  appendIfPresent(formData, 'towers', payload.towers);
  appendIfPresent(formData, 'houses', payload.houses);
  appendIfPresent(formData, 'total_units', payload.totalUnits);
  appendBoolean(formData, 'is_active', payload.isActive);
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
  method: 'POST' | 'PUT',
  payload: CreateCondominiumPayload,
  token: string | null,
): Promise<CreateCondominiumResult> {
  const spoofPut = method === 'PUT' && payload.logo !== null;
  const requestOptions = {
    token,
    headers: {
      Accept: 'application/json',
    },
    body: buildCondominiumFormData(payload, { spoofPut }),
  };
  const { response, data, unauthorized } =
    method === 'POST'
      ? await http.post<ApiCreateResponse>(path, requestOptions)
      : spoofPut
        ? await http.post<ApiCreateResponse>(path, requestOptions)
        : await http.put<ApiCreateResponse>(path, requestOptions);

  if (unauthorized) {
    return {
      success: false,
      message: 'Sesión expirada.',
      data: null,
    };
  }

  if (!response.ok) {
    throw buildServiceError(data, response.status, 'guardar');
  }

  return {
    success: data?.success !== false,
    message:
      typeof data?.message === 'string' ? data.message : 'Condominio guardado correctamente.',
    data: data?.data ?? null,
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
  const { response, data, unauthorized } = await http.delete<ApiCreateResponse>(
    `/api/condominiums/${encodeURIComponent(String(id))}`,
    {
      token,
      headers: {
        Accept: 'application/json',
      },
    },
  );

  if (unauthorized) {
    return {
      success: false,
      message: 'Sesión expirada.',
      data: null,
    };
  }

  if (!response.ok) {
    throw buildServiceError(data, response.status, 'eliminar');
  }

  return {
    success: data?.success !== false,
    message:
      typeof data?.message === 'string' ? data.message : 'Condominio eliminado correctamente.',
    data: data?.data ?? null,
  };
}

export async function fetchCondominiumById(
  id: number,
  token: string | null,
): Promise<CondominiumDetail | null> {
  const { response, data, unauthorized } = await http.get<unknown>(
    `/api/condominiums/${encodeURIComponent(String(id))}`,
    {
      token,
    },
  );

  if (unauthorized) {
    return null;
  }

  if (!response.ok) {
    throw buildServiceError(data, response.status, 'cargar');
  }

  return normalizeCondominiumDetail(data);
}

export async function fetchCondominiumsPage(
  page: number,
  perPage: number,
  token: string | null,
): Promise<CondominiumsPageResult> {
  const url = new URL(buildApiUrl('/api/condominiums'));
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));

  const { response, data, unauthorized } = await http.get<ApiListResponse>(url.toString(), {
    token,
  });

  if (unauthorized) {
    return { items: [], page: 1, perPage, total: 0, lastPage: 1 };
  }

  if (!response.ok) {
    throw buildServiceError(data, response.status, 'listar');
  }

  const items = extractListItems(data)
    .map(normalizeCondominiumListItem)
    .filter((item): item is CondominiumListItem => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
  const meta = isRecord(data?.meta)
    ? data.meta
    : isRecord(data?.data) && isRecord(data.data.meta)
      ? data.data.meta
      : {};
  const total = toNumber(meta.total) ?? items.length;
  const currentPage = toNumber(meta.current_page ?? meta.currentPage) ?? page;
  const currentPerPage = toNumber(meta.per_page ?? meta.perPage) ?? perPage;
  const lastPage =
    toNumber(meta.last_page ?? meta.lastPage) ?? Math.max(1, Math.ceil(total / currentPerPage));

  return { items, page: currentPage, perPage: currentPerPage, total, lastPage };
}

export async function fetchCondominiums(token: string | null): Promise<CondominiumListItem[]> {
  const result = await fetchCondominiumsPage(1, 100, token);
  return result.items;
}

export async function updateCondominiumStatus(
  id: number,
  isActive: boolean,
  token: string | null,
): Promise<CreateCondominiumResult> {
  const { response, data, unauthorized } = await http.patch<ApiCreateResponse>(
    `/api/condominiums/${encodeURIComponent(String(id))}/status`,
    {
      token,
      headers: {
        Accept: 'application/json',
      },
      body: {
        is_active: isActive,
      },
    },
  );

  if (unauthorized) {
    return {
      success: false,
      message: 'Tu sesión expiró. Vuelve a iniciar sesión.',
      data: null,
    };
  }

  if (!response.ok) {
    throw buildServiceError(data, response.status, 'estado');
  }

  return {
    success: data?.success !== false,
    message:
      typeof data?.message === 'string' ? data.message : 'Estado actualizado correctamente.',
    data: data?.data ?? null,
  };
}

export async function fetchCondominiumOptions(
  token: string | null,
  search = '',
): Promise<CondominiumOptionItem[]> {
  const url = new URL(buildApiUrl('/api/condominiums/options'));
  const normalizedSearch = search.trim();

  if (normalizedSearch) {
    url.searchParams.set('search', normalizedSearch);
  }

  const { response, data, unauthorized } = await http.get<ApiListResponse>(url.toString(), {
    token,
  });

  if (unauthorized) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar las opciones de condominios (${response.status})`);
  }

  const items = extractListItems(data);

  return items
    .map(normalizeCondominiumOptionItem)
    .filter((item): item is CondominiumOptionItem => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
