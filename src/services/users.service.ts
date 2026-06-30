import { handleUnauthorizedResponse } from '@/services/auth-redirect';

interface ApiMutationResponse {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
}

export type UserAssignmentType = 'senior' | 'condominium_admin';

export interface SaveAdministrativeUserPayload {
  firstName: string;
  lastName: string;
  documentTypeId: number;
  documentNumber: string;
  email: string;
  phone: string;
  type: UserAssignmentType;
  condominiumId: number | null;
  roleId: number;
}

export interface AdministrativeUserRoleOption {
  id: number;
  code: string;
  name: string;
}

export interface SaveAdministrativeUserResult {
  success: boolean;
  message: string;
  data: unknown;
}

const apiHost = import.meta.env.VITE_API_HOST ?? 'http://localhost:8001/';

function buildApiUrl(path: string) {
  return new URL(path, apiHost).toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function buildAdministrativeUserBody(payload: SaveAdministrativeUserPayload) {
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
    assignments: [
      {
        ...(payload.condominiumId !== null
          ? { condominium_id: payload.condominiumId }
          : {}),
        role_id: payload.roleId,
      },
    ],
  };
}

export async function fetchAdministrativeUserRoleOptions(
  token: string | null,
): Promise<AdministrativeUserRoleOption[]> {
  const response = await fetch(buildApiUrl('/api/users/form-options'), {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (handleUnauthorizedResponse(response, token)) return [];
  if (!response.ok) {
    throw new Error(`No fue posible cargar los roles administrativos (${response.status})`);
  }

  const payload = (await response.json()) as unknown;
  if (!isRecord(payload) || !isRecord(payload.data) || !Array.isArray(payload.data.roles)) {
    return [];
  }

  return payload.data.roles.flatMap((item) => {
    if (!isRecord(item)) return [];
    const id = Number(item.id);
    const code = typeof item.code === 'string' ? item.code.trim() : '';
    const name = typeof item.name === 'string' ? item.name.trim() : '';
    return Number.isInteger(id) && id > 0 && code && name ? [{ id, code, name }] : [];
  });
}

async function submitAdministrativeUserRequest(
  path: string,
  method: 'POST' | 'PUT',
  payload: SaveAdministrativeUserPayload,
  token: string | null,
): Promise<SaveAdministrativeUserResult> {
  const response = await fetch(buildApiUrl(path), {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(buildAdministrativeUserBody(payload)),
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
      `No fue posible guardar el usuario (${response.status})`;

    throw new Error(message);
  }

  return {
    success: body?.success !== false,
    message: typeof body?.message === 'string' ? body.message : 'Usuario guardado correctamente.',
    data: body?.data ?? null,
  };
}

export async function createAdministrativeUser(
  payload: SaveAdministrativeUserPayload,
  token: string | null,
): Promise<SaveAdministrativeUserResult> {
  return submitAdministrativeUserRequest('/api/users', 'POST', payload, token);
}

export async function updateAdministrativeUser(
  id: number,
  payload: SaveAdministrativeUserPayload,
  token: string | null,
): Promise<SaveAdministrativeUserResult> {
  return submitAdministrativeUserRequest(
    `/api/users/${encodeURIComponent(String(id))}`,
    'PUT',
    payload,
    token,
  );
}
