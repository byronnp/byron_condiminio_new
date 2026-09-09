import { appendQueryParams, isRecord, toNumber, toText } from '@/utils/api/common';
import { buildApiUrl, http } from '@/services/api/http';

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

export type UserAccessStatus = 'active' | 'inactive';

export interface UserAssignmentItem {
  condominiumId: number | null;
  condominiumName: string;
  roleId: number | null;
  roleName: string;
}

export interface UserListItem {
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
  accessStatus: UserAccessStatus;
  assignments: UserAssignmentItem[];
  createdAt: string;
}

export interface UsersPageResult {
  items: UserListItem[];
  total: number;
}

export interface FetchUsersParams {
  condominiumId: number;
  search?: string;
  roleId?: number;
  status?: UserAccessStatus;
}

export interface SaveUserAssignment {
  condominiumId: number;
  roleId: number;
}

export interface SaveUserPayload {
  firstName: string;
  lastName: string;
  country: string;
  documentTypeId: number;
  documentNumber: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  isAccessEnabled?: boolean;
  assignments: SaveUserAssignment[];
}

export type UpdateUserPayload = Partial<Omit<SaveUserPayload, 'assignments'>> & {
  assignments?: SaveUserAssignment[];
};

export interface SaveUserResult {
  success: boolean;
  message: string;
  data: unknown;
}

export class UserServiceError extends Error {
  status: number;
  code: string;
  errors: unknown;

  constructor(message: string, status: number, code = '', errors: unknown = null) {
    super(message);
    this.name = 'UserServiceError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

const usersPath = '/api/users';

function userPath(id: number) {
  return `${usersPath}/${encodeURIComponent(String(id))}`;
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
  const source = name || email || 'Usuario';
  const parts = source
    .split(/[.\s_-]+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const first = parts[0]?.charAt(0) ?? 'U';
  const second = parts.length > 1 ? (parts[1]?.charAt(0) ?? '') : (parts[0]?.charAt(1) ?? 'S');
  return `${first}${second}`.toUpperCase();
}

function normalizeAccessStatus(record: Record<string, unknown>): UserAccessStatus {
  const rawEnabled = record.is_access_enabled ?? record.isAccessEnabled ?? record.is_active;
  if (rawEnabled === false || rawEnabled === 0 || rawEnabled === '0') {
    return 'inactive';
  }

  const rawStatus = pickText(record, ['access_status', 'accessStatus', 'status'])
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (rawStatus === 'inactive' || rawStatus === 'disabled' || rawStatus === 'suspended') {
    return 'inactive';
  }

  return 'active';
}

function normalizeAssignment(item: unknown): UserAssignmentItem | null {
  if (!isRecord(item)) return null;

  const condominium = isRecord(item.condominium) ? item.condominium : null;
  const role = isRecord(item.role) ? item.role : null;

  const condominiumId = toNumber(item.condominium_id ?? item.condominiumId ?? condominium?.id);
  const roleId = toNumber(item.role_id ?? item.roleId ?? role?.id);
  const condominiumName =
    pickText(condominium ?? {}, ['name', 'label']) ||
    pickText(item, ['condominium_name', 'condominiumName']) ||
    'Alcance global';
  const roleName =
    pickText(role ?? {}, ['name', 'label']) || pickText(item, ['role_name', 'roleName']) || '';

  if (roleId === null) return null;

  return { condominiumId, condominiumName, roleId, roleName };
}

function normalizeAssignments(record: Record<string, unknown>): UserAssignmentItem[] {
  const raw = record.assignments ?? record.roles;
  if (!Array.isArray(raw)) return [];

  return raw.map(normalizeAssignment).filter((item): item is UserAssignmentItem => item !== null);
}

function normalizeUserListItem(item: unknown): UserListItem | null {
  if (!isRecord(item)) return null;

  const id = toNumber(item.id ?? item.user_id ?? item.userId);
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
    assignments: normalizeAssignments(item),
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

function extractErrorCode(data: unknown, responseStatus: number) {
  if (!isRecord(data)) {
    if (responseStatus === 404) return 'not_found';
    if (responseStatus === 422) return 'validation_failed';
    if (responseStatus === 403) return 'forbidden';
    return '';
  }

  const nestedData = isRecord(data.data) ? data.data : null;
  return (
    firstTextValue(data.code) ||
    firstTextValue(data.error) ||
    firstTextValue(nestedData?.code) ||
    firstTextValue(nestedData?.error) ||
    (responseStatus === 404 ? 'not_found' : '') ||
    (responseStatus === 403 ? 'forbidden' : '') ||
    (responseStatus === 422 ? 'validation_failed' : '')
  );
}

function mapErrorMessage(status: number, code: string, fallback: string) {
  if (code === 'access_token_required')
    return 'Tu sesión no fue enviada. Inicia sesión nuevamente.';
  if (code === 'access_token_expired') return 'Tu sesión expiró. Inicia sesión nuevamente.';
  if (code === 'access_token_invalid') return 'Tu sesión no es válida. Inicia sesión nuevamente.';
  if (code === 'user_access_disabled') {
    return 'Tu acceso de usuario está deshabilitado. Contacta a un administrador.';
  }
  if (code === 'forbidden' || status === 403) {
    return 'No tienes permisos para gestionar usuarios en este condominio.';
  }
  if (code === 'not_found' || status === 404) {
    return 'No se encontró el usuario solicitado.';
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
  throw new UserServiceError(
    backendMessage || mapErrorMessage(response.status, code, fallback),
    response.status,
    code,
    errors,
  );
}

function buildAssignmentsBody(assignments: SaveUserAssignment[]) {
  return assignments.map((assignment) => ({
    condominium_id: assignment.condominiumId,
    role_id: assignment.roleId,
  }));
}

function buildCreateBody(payload: SaveUserPayload) {
  return {
    first_name: payload.firstName.trim(),
    last_name: payload.lastName.trim(),
    email: payload.email.trim().toLowerCase(),
    country: payload.country.trim().toUpperCase(),
    document_type_id: payload.documentTypeId,
    document_number: payload.documentNumber.trim(),
    phone: payload.phone.trim(),
    secondary_phone: payload.secondaryPhone?.trim() || null,
    ...(payload.isAccessEnabled !== undefined
      ? { is_access_enabled: payload.isAccessEnabled }
      : {}),
    assignments: buildAssignmentsBody(payload.assignments),
  };
}

function buildUpdateBody(payload: UpdateUserPayload) {
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
  if (payload.assignments !== undefined) {
    body.assignments = buildAssignmentsBody(payload.assignments);
  }

  return body;
}

async function submitMutation(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH',
  token: string | null,
  fallbackMessage: string,
  body: Record<string, unknown>,
): Promise<SaveUserResult> {
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
      : method === 'PUT'
        ? await http.put<ApiMutationResponse>(path, requestOptions)
        : await http.patch<ApiMutationResponse>(path, requestOptions);

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

export async function fetchUsers(
  params: FetchUsersParams,
  token: string | null,
): Promise<UsersPageResult> {
  const url = appendQueryParams(new URL(buildApiUrl(usersPath)), {
    condominium_id: params.condominiumId,
    search: params.search,
    role_id: params.roleId,
    status: params.status,
  });

  const { response, data, unauthorized } = await http.get<ApiListResponse>(url.toString(), {
    token,
  });

  if (unauthorized) {
    return { items: [], total: 0 };
  }

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible cargar los usuarios.');
  }

  const items = extractItems(data)
    .map(normalizeUserListItem)
    .filter((item): item is UserListItem => item !== null);

  return { items, total: items.length };
}

export async function fetchUserById(
  id: number,
  token: string | null,
): Promise<UserListItem | null> {
  const { response, data, unauthorized } = await http.get<unknown>(userPath(id), { token });

  if (unauthorized) return null;

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible cargar el usuario.');
  }

  return normalizeUserListItem(extractFirstRecord(data));
}

export async function createUser(payload: SaveUserPayload, token: string | null) {
  return submitMutation(
    usersPath,
    'POST',
    token,
    'Usuario creado correctamente.',
    buildCreateBody(payload),
  );
}

export async function updateUser(id: number, payload: UpdateUserPayload, token: string | null) {
  return submitMutation(
    userPath(id),
    'PUT',
    token,
    'Usuario actualizado correctamente.',
    buildUpdateBody(payload),
  );
}

export async function updateUserStatus(id: number, isAccessEnabled: boolean, token: string | null) {
  return submitMutation(
    `${userPath(id)}/status`,
    'PATCH',
    token,
    isAccessEnabled ? 'Usuario reactivado correctamente.' : 'Usuario desactivado correctamente.',
    { is_access_enabled: isAccessEnabled },
  );
}
