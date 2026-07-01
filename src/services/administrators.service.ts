import { handleUnauthorizedResponse } from '@/services/auth-redirect';

interface ApiMutationResponse {
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

export type AdministratorType = 'senior' | 'condominium_admin';
export type AdministratorStatus = 'pending' | 'active' | 'suspended';
export type AdministratorAccessStatus = 'Activo' | 'Inactivo';
export type AdministratorInvitationStatus =
  | 'Pendiente'
  | 'Aceptada'
  | 'Expirada'
  | 'Cancelada'
  | 'Sin invitacion';

export interface SaveAdministratorPayload {
  firstName: string;
  lastName: string;
  documentTypeId: number;
  documentNumber: string;
  email: string;
  phone: string;
  type: AdministratorType;
  condominiumId: number | null;
}

export interface SaveAdministratorResult {
  success: boolean;
  message: string;
  data: unknown;
}

export interface AdministratorListItem {
  id: number;
  name: string;
  email: string;
  type: 'Senior' | 'Administrador de condominio';
  scope: string;
  status: AdministratorAccessStatus;
  invitationStatus: AdministratorInvitationStatus;
  initials: string;
}

export interface AdministratorDetail {
  id: number;
  firstName: string;
  lastName: string;
  documentTypeId: number | null;
  documentNumber: string;
  email: string;
  phone: string;
  type: AdministratorType;
  condominiumId: number | null;
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

function buildFullName(record: Record<string, unknown>) {
  const directName = pickFirstText(record, ['name', 'full_name', 'fullName']);
  if (directName) {
    return directName;
  }

  const firstName = pickFirstText(record, ['first_name', 'firstName', 'names']);
  const lastName = pickFirstText(record, ['last_name', 'lastName', 'surnames']);
  return [firstName, lastName].filter(Boolean).join(' ').trim();
}

function splitName(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return {
      firstName: parts[0] ?? '',
      lastName: '',
    };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1) ?? '',
  };
}

function buildInitials(name: string, email: string) {
  const source = name || email;
  const parts = source
    .split(/[.\s_-]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  const first = parts[0]?.charAt(0) ?? 'A';
  const second = parts.length > 1 ? (parts[1]?.charAt(0) ?? '') : (parts[0]?.charAt(1) ?? 'D');

  return `${first}${second}`.toUpperCase();
}

function normalizeAdministratorType(record: Record<string, unknown>) {
  const rawType = pickFirstText(record, ['type', 'role', 'administrator_type', 'admin_type'])
    .toLowerCase()
    .replace(/\s+/g, '_');

  if (['senior', 'super_admin', 'global_admin'].includes(rawType)) {
    return 'Senior' as const;
  }

  return 'Administrador de condominio' as const;
}

function normalizeAdministratorPayloadType(record: Record<string, unknown>): AdministratorType {
  return normalizeAdministratorType(record) === 'Senior' ? 'senior' : 'condominium_admin';
}

function normalizeAdministratorStatus(record: Record<string, unknown>) {
  const accessEnabled = record.is_access_enabled ?? record.isAccessEnabled ?? record.access_enabled;
  const rawStatus = pickFirstText(record, ['status', 'state'])
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  if (['suspended', 'suspendido', 'inactive', 'inactivo', 'blocked', 'bloqueado'].includes(rawStatus)) {
    return 'Inactivo' as const;
  }

  if (accessEnabled === false) return 'Inactivo' as const;
  return 'Activo' as const;
}

export interface AdministratorsPageResult {
  items: AdministratorListItem[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface FetchAdministratorsPageParams {
  page: number;
  perPage: number;
  search?: string;
  status?: 'active' | 'inactive';
}

function normalizeAdministratorInvitationStatus(
  record: Record<string, unknown>,
): AdministratorInvitationStatus {
  const invitation = isRecord(record.invitation) ? record.invitation : null;
  const rawStatus = (
    pickFirstText(record, [
      'invitation_status',
      'invitationStatus',
      'invite_status',
      'invitation_state',
    ]) ||
    pickFirstText(invitation ?? {}, ['status', 'state']) ||
    pickFirstText(record, ['status', 'state'])
  )
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  if (['pending', 'pendiente', 'invited', 'invitation_pending', 'sent'].includes(rawStatus)) {
    return 'Pendiente';
  }
  if (['accepted', 'aceptada', 'completed', 'active', 'activo'].includes(rawStatus)) {
    return 'Aceptada';
  }
  if (['expired', 'expirada', 'vencida'].includes(rawStatus)) return 'Expirada';
  if (['cancelled', 'canceled', 'cancelada', 'revoked'].includes(rawStatus)) return 'Cancelada';

  return 'Sin invitacion';
}

function normalizeAdministratorScope(record: Record<string, unknown>, type: AdministratorListItem['type']) {
  if (type === 'Senior') {
    return 'Vista global';
  }

  const condominium = isRecord(record.condominium) ? record.condominium : null;
  const condominiumNames = Array.isArray(record.condominiums)
    ? record.condominiums
        .filter(isRecord)
        .map((item) => pickFirstText(item, ['name', 'title']))
        .filter(Boolean)
    : [];

  return (
    pickFirstText(record, ['scope', 'condominium_name', 'condo_name']) ||
    pickFirstText(condominium ?? {}, ['name', 'title']) ||
    condominiumNames.join(', ') ||
    'Sin condominio asignado'
  );
}

function normalizeAdministratorListItem(item: unknown): AdministratorListItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id ?? item.user_id ?? item.administrator_id);
  const email = pickFirstText(item, ['email', 'mail']);
  const name = buildFullName(item);

  if (id === null || !email || !name) {
    return null;
  }

  const type = normalizeAdministratorType(item);

  return {
    id,
    name,
    email,
    type,
    scope: normalizeAdministratorScope(item, type),
    status: normalizeAdministratorStatus(item),
    invitationStatus: normalizeAdministratorInvitationStatus(item),
    initials: buildInitials(name, email),
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

function normalizeAdministratorDetail(payload: unknown): AdministratorDetail | null {
  const record = extractFirstRecord(payload);
  if (!record) {
    return null;
  }

  const id = toNumber(record.id ?? record.user_id ?? record.administrator_id);
  const directFirstName = pickFirstText(record, ['first_name', 'firstName', 'names']);
  const directLastName = pickFirstText(record, ['last_name', 'lastName', 'surnames']);
  const fallbackName = splitName(buildFullName(record));
  const firstName = directFirstName || fallbackName.firstName;
  const lastName = directLastName || fallbackName.lastName;
  const email = pickFirstText(record, ['email', 'mail']);

  if (id === null || !firstName || !email) {
    return null;
  }

  const condominium = isRecord(record.condominium) ? record.condominium : null;
  const firstCondominium = Array.isArray(record.condominiums)
    ? record.condominiums.find(isRecord) ?? null
    : null;
  const condominiumId = toNumber(
    record.condominium_id ??
      record.condominiumId ??
      record.condo_id ??
      condominium?.id ??
      firstCondominium?.id,
  );
  const documentType = isRecord(record.document_type)
    ? record.document_type
    : isRecord(record.documentType)
      ? record.documentType
      : null;

  return {
    id,
    firstName,
    lastName,
    documentTypeId: toNumber(
      record.document_type_id ?? record.documentTypeId ?? documentType?.id,
    ),
    documentNumber: pickFirstText(record, [
      'document_number',
      'documentNumber',
      'id_number',
      'identification',
    ]),
    email,
    phone: pickFirstText(record, ['phone', 'phone_number', 'mobile']),
    type: normalizeAdministratorPayloadType(record),
    condominiumId,
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

function buildAdministratorBody(payload: SaveAdministratorPayload) {
  const condominiumIds =
    payload.type === 'condominium_admin' && payload.condominiumId !== null
      ? [payload.condominiumId]
      : [];

  return {
    name: [payload.firstName.trim(), payload.lastName.trim()].filter(Boolean).join(' '),
    first_name: payload.firstName.trim(),
    last_name: payload.lastName.trim(),
    country: 'EC',
    document_type_id: payload.documentTypeId,
    document_number: payload.documentNumber.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
    is_access_enabled: false,
    condominium_ids: condominiumIds,
  };
}

function buildAdministratorUpdateBody(payload: SaveAdministratorPayload) {
  const updateBody = buildAdministratorBody(payload);
  delete (updateBody as Partial<typeof updateBody>).condominium_ids;
  delete (updateBody as Partial<typeof updateBody>).is_access_enabled;
  return updateBody;
}

async function submitAdministratorRequest(
  path: string,
  method: 'POST' | 'PUT',
  payload: SaveAdministratorPayload,
  token: string | null,
): Promise<SaveAdministratorResult> {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(
      method === 'POST' ? buildAdministratorBody(payload) : buildAdministratorUpdateBody(payload),
    ),
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
    ? ((await response.json()) as ApiMutationResponse)
    : null;

  if (!response.ok) {
    const responseData = isRecord(body?.data) ? body.data : null;
    const message =
      (responseData && typeof responseData.message === 'string' && responseData.message) ||
      (typeof body?.message === 'string' && body.message) ||
      `No fue posible guardar el administrador (${response.status})`;

    throw new Error(message);
  }

  return {
    success: body?.success !== false,
    message:
      typeof body?.message === 'string' ? body.message : 'Administrador guardado correctamente.',
    data: body?.data ?? null,
  };
}

async function submitAdministratorActionRequest(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  token: string | null,
  fallbackMessage: string,
  requestBody?: Record<string, unknown>,
): Promise<SaveAdministratorResult> {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      Accept: 'application/json',
      ...(requestBody ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(requestBody ? { body: JSON.stringify(requestBody) } : {}),
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
    ? ((await response.json()) as ApiMutationResponse)
    : null;

  if (!response.ok) {
    const responseData = isRecord(body?.data) ? body.data : null;
    const message =
      (responseData && typeof responseData.message === 'string' && responseData.message) ||
      (typeof body?.message === 'string' && body.message) ||
      `${fallbackMessage} (${response.status})`;

    throw new Error(message);
  }

  return {
    success: body?.success !== false,
    message: typeof body?.message === 'string' ? body.message : fallbackMessage,
    data: body?.data ?? null,
  };
}

export async function createAdministrator(
  payload: SaveAdministratorPayload,
  token: string | null,
): Promise<SaveAdministratorResult> {
  return submitAdministratorRequest('/api/administrators', 'POST', payload, token);
}

export async function updateAdministrator(
  id: number,
  payload: SaveAdministratorPayload,
  token: string | null,
): Promise<SaveAdministratorResult> {
  return submitAdministratorRequest(
    `/api/administrators/${encodeURIComponent(String(id))}`,
    'PUT',
    payload,
    token,
  );
}

export async function fetchAdministratorsPage(
  params: FetchAdministratorsPageParams,
  token: string | null,
): Promise<AdministratorsPageResult> {
  const url = new URL('/api/administrators', apiHost);
  url.searchParams.set('page', String(params.page));
  url.searchParams.set('per_page', String(params.perPage));
  if (params.search?.trim()) url.searchParams.set('search', params.search.trim());
  if (params.status) url.searchParams.set('status', params.status);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (handleUnauthorizedResponse(response, token)) {
    return { items: [], page: 1, perPage: params.perPage, total: 0, lastPage: 1 };
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar los administradores (${response.status})`);
  }

  const payload = (await response.json()) as ApiListResponse;
  const items = extractListItems(payload)
    .map(normalizeAdministratorListItem)
    .filter((item): item is AdministratorListItem => item !== null);
  const meta = isRecord(payload.meta)
    ? payload.meta
    : isRecord(payload.data) && isRecord(payload.data.meta)
      ? payload.data.meta
      : {};
  const total = toNumber(meta.total) ?? items.length;
  const page = toNumber(meta.current_page ?? meta.currentPage) ?? params.page;
  const perPage = toNumber(meta.per_page ?? meta.perPage) ?? params.perPage;
  const lastPage =
    toNumber(meta.last_page ?? meta.lastPage) ?? Math.max(1, Math.ceil(total / perPage));

  return { items, page, perPage, total, lastPage };
}

export async function fetchAdministrators(token: string | null): Promise<AdministratorListItem[]> {
  const result = await fetchAdministratorsPage({ page: 1, perPage: 100 }, token);
  return result.items;
}

export async function fetchAdministratorById(
  id: number,
  token: string | null,
): Promise<AdministratorDetail | null> {
  const response = await fetch(buildApiUrl(`/api/administrators/${encodeURIComponent(String(id))}`), {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (handleUnauthorizedResponse(response, token)) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar el administrador (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  return normalizeAdministratorDetail(payload);
}

export async function resendAdministratorInvitation(
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult> {
  void id;
  void token;
  return Promise.reject(new Error('El contrato Swagger no expone una ruta para reenviar invitaciones.'));
}

async function updateAdministratorStatus(
  id: number,
  isAccessEnabled: boolean,
  token: string | null,
  fallbackMessage: string,
): Promise<SaveAdministratorResult> {
  return submitAdministratorActionRequest(
    `/api/administrators/${encodeURIComponent(String(id))}/status`,
    'PATCH',
    token,
    fallbackMessage,
    {
      is_access_enabled: isAccessEnabled,
    },
  );
}

export async function suspendAdministrator(
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult> {
  return updateAdministratorStatus(id, false, token, 'Administrador suspendido correctamente.');
}

export async function reactivateAdministrator(
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult> {
  return updateAdministratorStatus(id, true, token, 'Administrador reactivado correctamente.');
}

export async function deleteAdministrator(
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult> {
  return submitAdministratorActionRequest(
    `/api/administrators/${encodeURIComponent(String(id))}`,
    'DELETE',
    token,
    'Administrador eliminado correctamente.',
  );
}
