import { buildApiUrl, http } from '@/services/api/http';
import { useSessionStore } from '@/stores/session.store';
import { isRecord, toNumber, toText } from '@/utils/api/common';

interface ApiMutationResponse {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
  code?: unknown;
  error?: unknown;
  errors?: unknown;
}

interface ApiListResponse {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
  code?: unknown;
  error?: unknown;
  errors?: unknown;
}

type ApiErrorCode =
  | 'access_token_required'
  | 'access_token_expired'
  | 'access_token_invalid'
  | 'user_access_disabled'
  | 'condominium_forbidden'
  | 'condominium_inactive'
  | 'not_found'
  | 'validation_failed';

export type AdministratorType = 'senior' | 'condominium_admin';

export class AdministratorServiceError extends Error {
  status: number;
  code: string;
  errors: unknown;

  constructor(message: string, status: number, code = '', errors: unknown = null) {
    super(message);
    this.name = 'AdministratorServiceError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export type AdministratorAccessStatus =
  | 'active'
  | 'pending_activation'
  | 'invitation_expired'
  | 'invitation_revoked'
  | 'inactive'
  | 'Activo'
  | 'Inactivo';

export interface SaveAdministratorPayload {
  firstName: string;
  lastName: string;
  email: string;
  country: string;
  documentTypeId: number;
  documentNumber: string;
  phone: string;
  secondaryPhone?: string;
}

export type UpdateAdministratorPayload = Partial<SaveAdministratorPayload>;

export interface SaveAdministratorResult {
  success: boolean;
  message: string;
  data: unknown;
}

export interface AdministratorInvitationInfo {
  status: string;
  sentAt: string;
  expiresAt: string;
  acceptedAt: string;
  revokedAt: string;
}

export interface AdministratorListItem {
  id: number;
  name: string;
  email: string;
  type: 'Senior' | 'Administrador de condominio';
  scope: string;
  status: AdministratorAccessStatus;
  invitationStatus: string;
  invitationInfo: string;
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
  secondaryPhone: string;
  country: string;
  type: AdministratorType;
  condominiumId: number | null;
  accessStatus: AdministratorAccessStatus;
  invitation: AdministratorInvitationInfo | null;
}

export interface AdministratorsPageResult {
  items: AdministratorListItem[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface FetchAdministratorsPageParams {
  condominiumId: number;
  page: number;
  perPage: number;
  search?: string;
  status?: 'active' | 'inactive';
}

function administratorBasePath(condominiumId: number) {
  return `/api/condominiums/${encodeURIComponent(String(condominiumId))}/administrators`;
}

function administratorPath(condominiumId: number, userId: number) {
  return `${administratorBasePath(condominiumId)}/${encodeURIComponent(String(userId))}`;
}

function resolveActiveCondominiumId() {
  const session = useSessionStore();
  const id = Number(session.activeCondoId);
  if (Number.isInteger(id) && id > 0) {
    return id;
  }

  throw new AdministratorServiceError(
    'Selecciona un condominio activo para gestionar administradores.',
    400,
    'missing_condominium_context',
  );
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

function normalizeAccessStatus(record: Record<string, unknown>): AdministratorAccessStatus {
  const rawStatus = pickFirstText(record, ['access_status', 'accessStatus', 'status', 'state'])
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (rawStatus === 'pending_activation' || rawStatus === 'pending') {
    return 'pending_activation';
  }
  if (rawStatus === 'invitation_expired' || rawStatus === 'expired') {
    return 'invitation_expired';
  }
  if (rawStatus === 'invitation_revoked' || rawStatus === 'revoked' || rawStatus === 'cancelled') {
    return 'invitation_revoked';
  }
  if (rawStatus === 'inactive' || rawStatus === 'disabled' || rawStatus === 'suspended') {
    return 'inactive';
  }

  return 'active';
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

function normalizeInvitation(record: Record<string, unknown>): AdministratorInvitationInfo | null {
  const invitation = isRecord(record.invitation) ? record.invitation : record;
  const status = pickFirstText(invitation, [
    'status',
    'invitation_status',
    'invitationStatus',
    'state',
  ]);
  const sentAt = pickFirstText(invitation, ['sent_at', 'sentAt', 'created_at', 'createdAt']);
  const expiresAt = pickFirstText(invitation, ['expires_at', 'expiresAt', 'expired_at', 'expiredAt']);
  const acceptedAt = pickFirstText(invitation, ['accepted_at', 'acceptedAt']);
  const revokedAt = pickFirstText(invitation, ['revoked_at', 'revokedAt', 'cancelled_at']);

  if (!status && !sentAt && !expiresAt && !acceptedAt && !revokedAt) {
    return null;
  }

  return { status, sentAt, expiresAt, acceptedAt, revokedAt };
}

function buildInvitationInfo(invitation: AdministratorInvitationInfo | null) {
  if (!invitation) {
    return '';
  }

  const parts = [
    invitation.sentAt ? `Enviada: ${invitation.sentAt}` : '',
    invitation.expiresAt ? `Expira: ${invitation.expiresAt}` : '',
    invitation.acceptedAt ? `Aceptada: ${invitation.acceptedAt}` : '',
    invitation.revokedAt ? `Revocada: ${invitation.revokedAt}` : '',
  ].filter(Boolean);

  return parts.join(' · ');
}

function normalizeAdministratorScope(record: Record<string, unknown>) {
  const condominium = isRecord(record.condominium) ? record.condominium : null;

  return (
    pickFirstText(record, ['scope', 'condominium_name', 'condo_name']) ||
    pickFirstText(condominium ?? {}, ['name', 'title']) ||
    'Condominio activo'
  );
}

function normalizeAdministratorListItem(item: unknown): AdministratorListItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id ?? item.user_id ?? item.userId ?? item.administrator_id);
  const email = pickFirstText(item, ['email', 'mail']);
  const name = buildFullName(item);

  if (id === null || !email || !name) {
    return null;
  }

  const invitation = normalizeInvitation(item);

  return {
    id,
    name,
    email,
    type: normalizeAdministratorType(item),
    scope: normalizeAdministratorScope(item),
    status: normalizeAccessStatus(item),
    invitationStatus: invitation?.status || '',
    invitationInfo: buildInvitationInfo(invitation),
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

  const id = toNumber(record.id ?? record.user_id ?? record.userId ?? record.administrator_id);
  const directFirstName = pickFirstText(record, ['first_name', 'firstName', 'names']);
  const directLastName = pickFirstText(record, ['last_name', 'lastName', 'surnames']);
  const fallbackName = splitName(buildFullName(record));
  const firstName = directFirstName || fallbackName.firstName;
  const lastName = directLastName || fallbackName.lastName;
  const email = pickFirstText(record, ['email', 'mail']);
  const documentType = isRecord(record.document_type)
    ? record.document_type
    : isRecord(record.documentType)
      ? record.documentType
      : null;
  const condominium = isRecord(record.condominium) ? record.condominium : null;

  if (id === null || !firstName || !email) {
    return null;
  }

  return {
    id,
    firstName,
    lastName,
    documentTypeId: toNumber(record.document_type_id ?? record.documentTypeId ?? documentType?.id),
    documentNumber: pickFirstText(record, [
      'document_number',
      'documentNumber',
      'id_number',
      'identification',
    ]),
    email,
    phone: pickFirstText(record, ['phone', 'phone_number', 'mobile']),
    secondaryPhone: pickFirstText(record, ['secondary_phone', 'secondaryPhone']),
    country: pickFirstText(record, ['country']) || 'EC',
    type: normalizeAdministratorPayloadType(record),
    condominiumId: toNumber(record.condominium_id ?? record.condominiumId ?? condominium?.id),
    accessStatus: normalizeAccessStatus(record),
    invitation: normalizeInvitation(record),
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

function firstTextValue(value: unknown): string {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = firstTextValue(item);
      if (text) {
        return text;
      }
    }
  }

  return '';
}

function extractErrorCode(data: unknown, responseStatus: number): string {
  if (!isRecord(data)) {
    if (responseStatus === 404) return 'not_found';
    if (responseStatus === 422) return 'validation_failed';
    return '';
  }

  const nestedData = isRecord(data.data) ? data.data : null;
  return (
    firstTextValue(data.code) ||
    firstTextValue(data.error) ||
    firstTextValue(nestedData?.code) ||
    firstTextValue(nestedData?.error) ||
    (responseStatus === 404 ? 'not_found' : '') ||
    (responseStatus === 422 ? 'validation_failed' : '')
  );
}

function mapErrorMessage(status: number, code: string, fallback: string) {
  const normalizedCode = code as ApiErrorCode;

  if (normalizedCode === 'access_token_required') {
    return 'Tu sesión no fue enviada. Inicia sesión nuevamente.';
  }
  if (normalizedCode === 'access_token_expired') {
    return 'Tu sesión expiró. Inicia sesión nuevamente.';
  }
  if (normalizedCode === 'access_token_invalid') {
    return 'Tu sesión no es válida. Inicia sesión nuevamente.';
  }
  if (normalizedCode === 'user_access_disabled') {
    return 'Tu acceso de usuario está deshabilitado. Contacta a un administrador.';
  }
  if (normalizedCode === 'condominium_forbidden') {
    return 'No tienes permisos para administrar usuarios en este condominio.';
  }
  if (normalizedCode === 'condominium_inactive') {
    return 'El condominio está inactivo. Las acciones de administradores están bloqueadas.';
  }
  if (normalizedCode === 'not_found' || status === 404) {
    return 'No se encontró el administrador solicitado.';
  }
  if (normalizedCode === 'validation_failed' || status === 422) {
    return 'Revisa los campos marcados. El backend rechazó la información enviada.';
  }
  if (status === 429) {
    return 'Hay demasiados intentos. Espera unos minutos antes de volver a intentar.';
  }
  if (status >= 500) {
    return 'El servidor no pudo procesar la solicitud. Intenta nuevamente.';
  }

  return fallback;
}

function extractResponseMessage(data: unknown) {
  if (!isRecord(data)) {
    return '';
  }

  const nestedData = isRecord(data.data) ? data.data : null;
  return firstTextValue(data.message) || firstTextValue(nestedData?.message);
}

function throwServiceError(response: Response, data: unknown, fallback: string): never {
  const code = extractErrorCode(data, response.status);
  const backendMessage = extractResponseMessage(data);
  const message = backendMessage || mapErrorMessage(response.status, code, fallback);
  const errors = isRecord(data) ? data.errors : null;
  throw new AdministratorServiceError(message, response.status, code, errors);
}

function buildAdministratorBody(payload: SaveAdministratorPayload) {
  return {
    first_name: payload.firstName.trim(),
    last_name: payload.lastName.trim(),
    email: payload.email.trim().toLowerCase(),
    country: payload.country.trim().toUpperCase(),
    document_type_id: payload.documentTypeId,
    document_number: payload.documentNumber.trim(),
    phone: payload.phone.trim(),
    secondary_phone: payload.secondaryPhone?.trim() || null,
  };
}

function buildAdministratorUpdateBody(payload: UpdateAdministratorPayload) {
  const body: Record<string, unknown> = {};

  if (payload.firstName !== undefined) body.first_name = payload.firstName.trim();
  if (payload.lastName !== undefined) body.last_name = payload.lastName.trim();
  if (payload.email !== undefined) body.email = payload.email.trim().toLowerCase();
  if (payload.country !== undefined) body.country = payload.country.trim().toUpperCase();
  if (payload.documentTypeId !== undefined) body.document_type_id = payload.documentTypeId;
  if (payload.documentNumber !== undefined) body.document_number = payload.documentNumber.trim();
  if (payload.phone !== undefined) body.phone = payload.phone.trim();
  if (payload.secondaryPhone !== undefined) {
    body.secondary_phone = payload.secondaryPhone.trim() || null;
  }

  return body;
}

async function submitAdministratorRequest(
  path: string,
  method: 'POST' | 'PUT',
  body: Record<string, unknown>,
  token: string | null,
): Promise<SaveAdministratorResult> {
  const requestOptions = {
    token,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body,
  };
  const { response, data, unauthorized } =
    method === 'POST'
      ? await http.post<ApiMutationResponse>(path, requestOptions)
      : await http.put<ApiMutationResponse>(path, requestOptions);

  if (unauthorized) {
    return {
      success: false,
      message: 'Sesión expirada.',
      data: null,
    };
  }

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible guardar el administrador.');
  }

  return {
    success: data?.success !== false,
    message:
      typeof data?.message === 'string' ? data.message : 'Administrador guardado correctamente.',
    data: data?.data ?? null,
  };
}

async function submitAdministratorActionRequest(
  path: string,
  method: 'PATCH' | 'DELETE',
  token: string | null,
  fallbackMessage: string,
): Promise<SaveAdministratorResult> {
  const requestOptions = {
    token,
    headers: {
      Accept: 'application/json',
    },
  };
  const { response, data, unauthorized } =
    method === 'PATCH'
      ? await http.patch<ApiMutationResponse>(path, requestOptions)
      : await http.delete<ApiMutationResponse>(path, requestOptions);

  if (unauthorized) {
    return {
      success: false,
      message: 'Sesión expirada.',
      data: null,
    };
  }

  if (!response.ok) {
    throwServiceError(response, data, fallbackMessage);
  }

  return {
    success: data?.success !== false,
    message: typeof data?.message === 'string' ? data.message : fallbackMessage,
    data: data?.data ?? null,
  };
}

export async function createAdministrator(
  condominiumId: number,
  payload: SaveAdministratorPayload,
  token: string | null,
): Promise<SaveAdministratorResult> {
  return submitAdministratorRequest(
    administratorBasePath(condominiumId),
    'POST',
    buildAdministratorBody(payload),
    token,
  );
}

export async function updateAdministrator(
  condominiumId: number,
  id: number,
  payload: UpdateAdministratorPayload,
  token: string | null,
): Promise<SaveAdministratorResult> {
  return submitAdministratorRequest(
    administratorPath(condominiumId, id),
    'PUT',
    buildAdministratorUpdateBody(payload),
    token,
  );
}

export async function fetchAdministratorsPage(
  params: FetchAdministratorsPageParams,
  token: string | null,
): Promise<AdministratorsPageResult> {
  const url = new URL(buildApiUrl(administratorBasePath(params.condominiumId)));
  url.searchParams.set('page', String(params.page));
  url.searchParams.set('per_page', String(params.perPage));
  if (params.search?.trim()) url.searchParams.set('search', params.search.trim());
  if (params.status) url.searchParams.set('status', params.status);

  const { response, data, unauthorized } = await http.get<ApiListResponse>(url.toString(), {
    token,
  });

  if (unauthorized) {
    return { items: [], page: 1, perPage: params.perPage, total: 0, lastPage: 1 };
  }

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible cargar los administradores.');
  }

  const items = extractListItems(data)
    .map(normalizeAdministratorListItem)
    .filter((item): item is AdministratorListItem => item !== null);
  const meta = isRecord(data?.meta)
    ? data.meta
    : isRecord(data?.data) && isRecord(data.data.meta)
      ? data.data.meta
      : {};
  const total = toNumber(meta.total) ?? items.length;
  const page = toNumber(meta.current_page ?? meta.currentPage) ?? params.page;
  const perPage = toNumber(meta.per_page ?? meta.perPage) ?? params.perPage;
  const lastPage =
    toNumber(meta.last_page ?? meta.lastPage) ?? Math.max(1, Math.ceil(total / perPage));

  return { items, page, perPage, total, lastPage };
}

export async function fetchAdministrators(token: string | null): Promise<AdministratorListItem[]> {
  const result = await fetchAdministratorsPage(
    { condominiumId: resolveActiveCondominiumId(), page: 1, perPage: 100 },
    token,
  );
  return result.items;
}

export async function fetchAdministratorById(
  condominiumId: number,
  id: number,
  token: string | null,
): Promise<AdministratorDetail | null>;
export async function fetchAdministratorById(
  id: number,
  token: string | null,
): Promise<AdministratorDetail | null>;
export async function fetchAdministratorById(
  first: number,
  second: number | string | null,
  third?: string | null,
): Promise<AdministratorDetail | null> {
  const condominiumId = typeof second === 'number' ? first : resolveActiveCondominiumId();
  const id = typeof second === 'number' ? second : first;
  const token = typeof second === 'number' ? (third ?? null) : second;
  const { response, data, unauthorized } = await http.get<unknown>(
    administratorPath(condominiumId, id),
    { token },
  );

  if (unauthorized) {
    return null;
  }

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible cargar el administrador.');
  }

  return normalizeAdministratorDetail(data);
}

export async function suspendAdministrator(
  condominiumId: number,
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult>;
export async function suspendAdministrator(
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult>;
export async function suspendAdministrator(
  first: number,
  second: number | string | null,
  third?: string | null,
): Promise<SaveAdministratorResult> {
  const condominiumId = typeof second === 'number' ? first : resolveActiveCondominiumId();
  const id = typeof second === 'number' ? second : first;
  const token = typeof second === 'number' ? (third ?? null) : second;
  return submitAdministratorActionRequest(
    `${administratorPath(condominiumId, id)}/status`,
    'PATCH',
    token,
    'Administrador deshabilitado correctamente.',
  );
}

export async function reactivateAdministrator(
  condominiumId: number,
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult>;
export async function reactivateAdministrator(
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult>;
export async function reactivateAdministrator(
  first: number,
  second: number | string | null,
  third?: string | null,
): Promise<SaveAdministratorResult> {
  const condominiumId = typeof second === 'number' ? first : resolveActiveCondominiumId();
  const id = typeof second === 'number' ? second : first;
  const token = typeof second === 'number' ? (third ?? null) : second;
  return submitAdministratorActionRequest(
    `${administratorPath(condominiumId, id)}/status`,
    'PATCH',
    token,
    'Administrador habilitado correctamente.',
  );
}

export async function deleteAdministrator(
  condominiumId: number,
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult>;
export async function deleteAdministrator(
  id: number,
  token: string | null,
): Promise<SaveAdministratorResult>;
export async function deleteAdministrator(
  first: number,
  second: number | string | null,
  third?: string | null,
): Promise<SaveAdministratorResult> {
  const condominiumId = typeof second === 'number' ? first : resolveActiveCondominiumId();
  const id = typeof second === 'number' ? second : first;
  const token = typeof second === 'number' ? (third ?? null) : second;
  return submitAdministratorActionRequest(
    administratorPath(condominiumId, id),
    'DELETE',
    token,
    'Administrador desvinculado del condominio correctamente.',
  );
}
