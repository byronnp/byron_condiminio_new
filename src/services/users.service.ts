import { buildApiUrl, http } from '@/services/api/http';
import { isRecord, toNumber, toText } from '@/utils/api/common';

type ApiMutationResponse = {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  code?: unknown;
  error?: unknown;
  errors?: unknown;
};

type ApiListResponse = ApiMutationResponse & {
  meta?: unknown;
};

export type PlatformAccessStatus =
  | 'active'
  | 'pending_activation'
  | 'invitation_expired'
  | 'invitation_revoked'
  | 'inactive';

export type PlatformInvitationStatus =
  | 'pending'
  | 'accepted'
  | 'expired'
  | 'revoked'
  | 'none';

export interface PlatformAdministratorInvitation {
  status: PlatformInvitationStatus;
  sentAt: string;
  expiresAt: string;
  acceptedAt: string;
  revokedAt: string;
}

export interface PlatformAdministratorListItem {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  initials: string;
  documentTypeId: number | null;
  documentTypeName: string;
  documentNumber: string;
  email: string;
  phone: string;
  accessStatus: PlatformAccessStatus;
  invitation: PlatformAdministratorInvitation | null;
  invitationStatus: PlatformInvitationStatus;
  createdAt: string;
}

export interface PlatformAdministratorsPageResult {
  items: PlatformAdministratorListItem[];
  page: number;
  perPage: number;
  total: number;
  lastPage: number;
}

export interface FetchPlatformAdministratorsParams {
  page: number;
  perPage: number;
  search?: string;
  status?: PlatformAccessStatus;
}

export interface SavePlatformAdministratorPayload {
  firstName: string;
  lastName: string;
  country: string;
  documentTypeId: number;
  documentNumber: string;
  email: string;
  phone: string;
}

export type UpdatePlatformAdministratorPayload = Partial<SavePlatformAdministratorPayload>;

export interface SavePlatformAdministratorResult {
  success: boolean;
  message: string;
  data: unknown;
}

export class PlatformAdministratorServiceError extends Error {
  status: number;
  code: string;
  errors: unknown;

  constructor(message: string, status: number, code = '', errors: unknown = null) {
    super(message);
    this.name = 'PlatformAdministratorServiceError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

const platformAdministratorsPath = '/api/platform-administrators';

function platformAdministratorPath(id: number) {
  return `${platformAdministratorsPath}/${encodeURIComponent(String(id))}`;
}

function pickText(record: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = toText(record[key]);
    if (value) return value;
  }

  return '';
}

function firstTextValue(value: unknown): string {
  if (typeof value === 'string' && value.trim()) return value.trim();

  if (Array.isArray(value)) {
    for (const item of value) {
      const text = firstTextValue(item);
      if (text) return text;
    }
  }

  return '';
}

function buildFullName(record: Record<string, unknown>) {
  const directName = pickText(record, ['name', 'full_name', 'fullName']);
  if (directName) return directName;

  return [
    pickText(record, ['first_name', 'firstName', 'names']),
    pickText(record, ['last_name', 'lastName', 'surnames']),
  ]
    .filter(Boolean)
    .join(' ')
    .trim();
}

function splitName(name: string) {
  const parts = name
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length <= 1) {
    return { firstName: parts[0] ?? '', lastName: '' };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1) ?? '',
  };
}

function buildInitials(name: string, email: string) {
  const source = name || email || 'Administrador';
  const parts = source
    .split(/[.\s_-]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const first = parts[0]?.charAt(0) ?? 'A';
  const second = parts.length > 1 ? (parts[1]?.charAt(0) ?? '') : (parts[0]?.charAt(1) ?? 'D');
  return `${first}${second}`.toUpperCase();
}

function normalizeKey(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function normalizeAccessStatus(record: Record<string, unknown>): PlatformAccessStatus {
  const rawStatus = normalizeKey(pickText(record, ['access_status', 'accessStatus', 'status']));

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

function normalizeInvitationStatus(value: string): PlatformInvitationStatus {
  const normalized = normalizeKey(value);

  if (normalized === 'accepted' || normalized === 'active') return 'accepted';
  if (normalized === 'expired' || normalized === 'invitation_expired') return 'expired';
  if (
    normalized === 'revoked' ||
    normalized === 'cancelled' ||
    normalized === 'canceled' ||
    normalized === 'invitation_revoked'
  ) {
    return 'revoked';
  }
  if (normalized === 'pending' || normalized === 'pending_activation') return 'pending';

  return 'none';
}

function normalizeInvitation(record: Record<string, unknown>) {
  const invitation = isRecord(record.invitation) ? record.invitation : record;
  const status = normalizeInvitationStatus(
    pickText(invitation, ['status', 'invitation_status', 'invitationStatus', 'state']),
  );
  const sentAt = pickText(invitation, ['sent_at', 'sentAt', 'created_at', 'createdAt']);
  const expiresAt = pickText(invitation, ['expires_at', 'expiresAt', 'expired_at', 'expiredAt']);
  const acceptedAt = pickText(invitation, ['accepted_at', 'acceptedAt']);
  const revokedAt = pickText(invitation, ['revoked_at', 'revokedAt', 'cancelled_at']);

  if (status === 'none' && !sentAt && !expiresAt && !acceptedAt && !revokedAt) {
    return null;
  }

  return { status, sentAt, expiresAt, acceptedAt, revokedAt };
}

function normalizePlatformAdministrator(item: unknown): PlatformAdministratorListItem | null {
  if (!isRecord(item)) return null;

  const id = toNumber(item.id ?? item.user_id ?? item.userId ?? item.administrator_id);
  const email = pickText(item, ['email', 'mail']);
  const name = buildFullName(item);
  if (id === null || !email || !name) return null;

  const fallbackName = splitName(name);
  const firstName = pickText(item, ['first_name', 'firstName', 'names']) || fallbackName.firstName;
  const lastName = pickText(item, ['last_name', 'lastName', 'surnames']) || fallbackName.lastName;
  const documentType = isRecord(item.document_type)
    ? item.document_type
    : isRecord(item.documentType)
      ? item.documentType
      : null;
  const invitation = normalizeInvitation(item);

  return {
    id,
    firstName,
    lastName,
    name,
    initials: buildInitials(name, email),
    documentTypeId: toNumber(item.document_type_id ?? item.documentTypeId ?? documentType?.id),
    documentTypeName: pickText(documentType ?? {}, ['name', 'label', 'code']),
    documentNumber: pickText(item, [
      'document_number',
      'documentNumber',
      'id_number',
      'identification',
    ]),
    email,
    phone: pickText(item, ['phone', 'phone_number', 'mobile']),
    accessStatus: normalizeAccessStatus(item),
    invitation,
    invitationStatus: invitation?.status ?? 'none',
    createdAt: pickText(item, ['created_at', 'createdAt']),
  };
}

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];

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
    if (Array.isArray(candidate)) return candidate;
  }

  return [];
}

function extractFirstRecord(payload: unknown) {
  if (isRecord(payload) && isRecord(payload.data)) return payload.data;
  return isRecord(payload) ? payload : null;
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

function extractErrorCode(data: unknown, responseStatus: number) {
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
  if (code === 'access_token_required') return 'Tu sesión no fue enviada. Inicia sesión nuevamente.';
  if (code === 'access_token_expired') return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (code === 'access_token_invalid') return 'Tu sesión no es válida. Inicia sesión nuevamente.';
  if (code === 'user_access_disabled') {
    return 'Tu acceso de usuario está deshabilitado. Contacta a un administrador.';
  }
  if (code === 'not_found' || status === 404) {
    return 'No se encontró el administrador de plataforma solicitado.';
  }
  if (code === 'validation_failed' || status === 422) {
    return 'Revisa los campos marcados. El backend rechazó la información enviada.';
  }
  if (status === 429) return 'Hay demasiados intentos. Espera unos minutos antes de continuar.';
  if (status >= 500) return 'El servidor no pudo procesar la solicitud. Intenta nuevamente.';

  return fallback;
}

function throwServiceError(response: Response, data: unknown, fallback: string): never {
  const code = extractErrorCode(data, response.status);
  const backendMessage = isRecord(data) ? firstTextValue(data.message) : '';
  const errors = isRecord(data) ? data.errors : null;
  throw new PlatformAdministratorServiceError(
    backendMessage || mapErrorMessage(response.status, code, fallback),
    response.status,
    code,
    errors,
  );
}

function buildCreateBody(payload: SavePlatformAdministratorPayload) {
  return {
    first_name: payload.firstName.trim(),
    last_name: payload.lastName.trim(),
    country: payload.country.trim().toUpperCase(),
    document_type_id: payload.documentTypeId,
    document_number: payload.documentNumber.trim(),
    email: payload.email.trim().toLowerCase(),
    phone: payload.phone.trim(),
  };
}

function buildUpdateBody(payload: UpdatePlatformAdministratorPayload) {
  const body: Record<string, unknown> = {};

  if (payload.firstName !== undefined) body.first_name = payload.firstName.trim();
  if (payload.lastName !== undefined) body.last_name = payload.lastName.trim();
  if (payload.country !== undefined) body.country = payload.country.trim().toUpperCase();
  if (payload.documentTypeId !== undefined) body.document_type_id = payload.documentTypeId;
  if (payload.documentNumber !== undefined) body.document_number = payload.documentNumber.trim();
  if (payload.email !== undefined) body.email = payload.email.trim().toLowerCase();
  if (payload.phone !== undefined) body.phone = payload.phone.trim();

  return body;
}

async function submitMutation(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  token: string | null,
  fallbackMessage: string,
  body?: Record<string, unknown>,
): Promise<SavePlatformAdministratorResult> {
  const requestOptions = {
    token,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    ...(body ? { body } : {}),
  };
  const { response, data, unauthorized } =
    method === 'POST'
      ? await http.post<ApiMutationResponse>(path, requestOptions)
      : method === 'PATCH'
        ? await http.patch<ApiMutationResponse>(path, requestOptions)
        : await http.delete<ApiMutationResponse>(path, requestOptions);

  if (unauthorized) {
    return { success: false, message: 'Sesión expirada.', data: null };
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

export async function fetchPlatformAdministratorsPage(
  params: FetchPlatformAdministratorsParams,
  token: string | null,
): Promise<PlatformAdministratorsPageResult> {
  const url = new URL(buildApiUrl(platformAdministratorsPath));
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
    throwServiceError(response, data, 'No fue posible cargar los usuarios.');
  }

  const items = extractItems(data)
    .map(normalizePlatformAdministrator)
    .filter((item): item is PlatformAdministratorListItem => item !== null);
  const meta = extractMeta(data, params.page, params.perPage, items.length);

  return {
    items,
    page: meta.currentPage,
    perPage: meta.currentPerPage,
    total: meta.total,
    lastPage: meta.lastPage,
  };
}

export async function fetchPlatformAdministratorById(id: number, token: string | null) {
  const { response, data, unauthorized } = await http.get<unknown>(platformAdministratorPath(id), {
    token,
  });

  if (unauthorized) return null;

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible cargar el usuario.');
  }

  return normalizePlatformAdministrator(extractFirstRecord(data));
}

export async function createPlatformAdministrator(
  payload: SavePlatformAdministratorPayload,
  token: string | null,
) {
  return submitMutation(
    platformAdministratorsPath,
    'POST',
    token,
    'Usuario creado correctamente.',
    buildCreateBody(payload),
  );
}

export async function updatePlatformAdministrator(
  id: number,
  payload: UpdatePlatformAdministratorPayload,
  token: string | null,
) {
  return submitMutation(
    platformAdministratorPath(id),
    'PATCH',
    token,
    'Usuario actualizado correctamente.',
    buildUpdateBody(payload),
  );
}

export async function updatePlatformAdministratorStatus(
  id: number,
  accessStatus: 'active' | 'inactive',
  token: string | null,
) {
  return submitMutation(
    `${platformAdministratorPath(id)}/status`,
    'PATCH',
    token,
    accessStatus === 'active'
      ? 'Usuario reactivado correctamente.'
      : 'Usuario desactivado correctamente.',
    { access_status: accessStatus },
  );
}

export async function deletePlatformAdministrator(id: number, token: string | null) {
  return submitMutation(
    platformAdministratorPath(id),
    'DELETE',
    token,
    'Usuario eliminado correctamente.',
  );
}
