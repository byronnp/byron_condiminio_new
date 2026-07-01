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
        condominium_id: payload.condominiumId,
        role_id: payload.roleId,
      },
    ],
  };
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
