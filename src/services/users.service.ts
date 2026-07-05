import { http } from '@/services/api/http';
import { isRecord } from '@/utils/api/common';
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
  const requestOptions = {
    token,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: buildAdministrativeUserBody(payload),
  };
  const { response, data, unauthorized } =
    method === 'POST'
      ? await http.post<ApiMutationResponse>(path, requestOptions)
      : await http.put<ApiMutationResponse>(path, requestOptions);

  if (handleUnauthorizedResponse(response, token)) {
    return {
      success: false,
      message: 'Sesión expirada.',
      data: null,
    };
  }

  if (unauthorized) {
    return {
      success: false,
      message: 'Sesión expirada.',
      data: null,
    };
  }

  if (!response.ok) {
    const responseData = isRecord(data?.data) ? data.data : null;
    const message =
      (responseData && typeof responseData.message === 'string' && responseData.message) ||
      (typeof data?.message === 'string' && data.message) ||
      `No fue posible guardar el usuario (${response.status})`;

    throw new Error(message);
  }

  return {
    success: data?.success !== false,
    message: typeof data?.message === 'string' ? data.message : 'Usuario guardado correctamente.',
    data: data?.data ?? null,
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
