import { http } from '@/services/api/http';
import { isRecord, toNumber, toText } from '@/utils/api/common';

export interface CondominiumRoleItem {
  id: number;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  permissionCodes: string[];
}

interface ApiRolesResponse {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
}

interface ApiMutationResponse {
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
  | 'role_in_use'
  | 'not_found'
  | 'validation_failed';

export class CondominiumRoleServiceError extends Error {
  status: number;
  code: string;
  errors: unknown;

  constructor(message: string, status: number, code = '', errors: unknown = null) {
    super(message);
    this.name = 'CondominiumRoleServiceError';
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

export interface SaveCondominiumRolePayload {
  name: string;
  code: string;
  description?: string;
  isActive?: boolean;
  permissionCodes?: string[];
}

export type UpdateCondominiumRolePayload = Partial<SaveCondominiumRolePayload>;

export interface SaveCondominiumRoleResult {
  success: boolean;
  message: string;
  data: unknown;
}

function rolesBasePath(condominiumId: number) {
  return `/api/condominiums/${encodeURIComponent(String(condominiumId))}/roles`;
}

function rolePath(condominiumId: number, roleId: number) {
  return `${rolesBasePath(condominiumId)}/${encodeURIComponent(String(roleId))}`;
}

function normalizePermissionCodes(item: Record<string, unknown>): string[] {
  const raw = item.permission_codes ?? item.permissionCodes ?? item.permissions;
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((value) => {
      if (typeof value === 'string') {
        return value.trim();
      }
      if (isRecord(value)) {
        return toText(value.code ?? value.slug ?? value.key);
      }
      return '';
    })
    .filter((value): value is string => Boolean(value));
}

function normalizeRoleItem(item: unknown): CondominiumRoleItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id ?? item.role_id ?? item.roleId);
  const code = toText(item.code ?? item.slug ?? item.key);
  const name = toText(item.name ?? item.label ?? item.title);
  const description = toText(item.description ?? item.description_text ?? item.meta);
  const isActive = item.is_active !== false && item.active !== false;
  const permissionCodes = normalizePermissionCodes(item);

  if (id === null || !code || !name) {
    return null;
  }

  return {
    id,
    code,
    name,
    description,
    isActive,
    permissionCodes,
  };
}

function extractRoleItems(payload: unknown): unknown[] {
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
    if (responseStatus === 409) return 'role_in_use';
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
    (responseStatus === 409 ? 'role_in_use' : '') ||
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
    return 'No tienes permisos para administrar roles en este condominio.';
  }
  if (normalizedCode === 'condominium_inactive') {
    return 'El condominio está inactivo. Las acciones sobre roles están bloqueadas.';
  }
  if (normalizedCode === 'role_in_use' || status === 409) {
    return 'Este rol está asignado a uno o más administradores y no puede eliminarse. Desactívalo en su lugar.';
  }
  if (normalizedCode === 'not_found' || status === 404) {
    return 'No se encontró el rol solicitado.';
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
  throw new CondominiumRoleServiceError(message, response.status, code, errors);
}

function buildRoleBody(payload: SaveCondominiumRolePayload) {
  return {
    name: payload.name.trim(),
    code: payload.code.trim(),
    description: payload.description?.trim() || null,
    is_active: payload.isActive ?? true,
    permission_codes: payload.permissionCodes ?? [],
  };
}

function buildRoleUpdateBody(payload: UpdateCondominiumRolePayload) {
  const body: Record<string, unknown> = {};

  if (payload.name !== undefined) body.name = payload.name.trim();
  if (payload.code !== undefined) body.code = payload.code.trim();
  if (payload.description !== undefined) body.description = payload.description.trim() || null;
  if (payload.isActive !== undefined) body.is_active = payload.isActive;
  if (payload.permissionCodes !== undefined) body.permission_codes = payload.permissionCodes;

  return body;
}

async function submitRoleRequest(
  path: string,
  method: 'POST' | 'PUT',
  body: Record<string, unknown>,
  token: string | null,
): Promise<SaveCondominiumRoleResult> {
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
    return { success: false, message: 'Sesión expirada.', data: null };
  }

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible guardar el rol.');
  }

  return {
    success: data?.success !== false,
    message: typeof data?.message === 'string' ? data.message : 'Rol guardado correctamente.',
    data: data?.data ?? null,
  };
}

async function submitRoleDeleteRequest(
  path: string,
  token: string | null,
): Promise<SaveCondominiumRoleResult> {
  const { response, data, unauthorized } = await http.delete<ApiMutationResponse>(path, {
    token,
    headers: { Accept: 'application/json' },
  });

  if (unauthorized) {
    return { success: false, message: 'Sesión expirada.', data: null };
  }

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible eliminar el rol.');
  }

  return {
    success: data?.success !== false,
    message: typeof data?.message === 'string' ? data.message : 'Rol eliminado correctamente.',
    data: data?.data ?? null,
  };
}

/**
 * Roles activos de un condominio, para selectores (por ejemplo, al asignar un rol
 * a un usuario/administrador). Descarta roles inactivos a propósito.
 */
export async function fetchCondominiumRoles(
  condominiumId: number,
  token: string | null,
): Promise<CondominiumRoleItem[]> {
  const { response, data, unauthorized } = await http.get<ApiRolesResponse>(
    rolesBasePath(condominiumId),
    { token },
  );

  if (unauthorized) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar los roles del condominio (${response.status})`);
  }

  const items = extractRoleItems(data);

  return items
    .map(normalizeRoleItem)
    .filter((item): item is CondominiumRoleItem => item !== null && item.isActive)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Todos los roles de un condominio (activos e inactivos), para la pantalla de
 * administración de roles. A diferencia de fetchCondominiumRoles, no filtra por estado.
 */
export async function fetchCondominiumRolesForManagement(
  condominiumId: number,
  token: string | null,
): Promise<CondominiumRoleItem[]> {
  const { response, data, unauthorized } = await http.get<ApiRolesResponse>(
    rolesBasePath(condominiumId),
    { token },
  );

  if (unauthorized) {
    return [];
  }

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible cargar los roles del condominio.');
  }

  const items = extractRoleItems(data);

  return items
    .map(normalizeRoleItem)
    .filter((item): item is CondominiumRoleItem => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCondominiumRoleById(
  condominiumId: number,
  roleId: number,
  token: string | null,
): Promise<CondominiumRoleItem | null> {
  const { response, data, unauthorized } = await http.get<ApiRolesResponse>(
    rolePath(condominiumId, roleId),
    { token },
  );

  if (unauthorized) {
    return null;
  }

  if (!response.ok) {
    throwServiceError(response, data, 'No fue posible cargar el rol.');
  }

  const record = isRecord(data) && isRecord(data.data) ? data.data : data;
  return normalizeRoleItem(record);
}

export async function createCondominiumRole(
  condominiumId: number,
  payload: SaveCondominiumRolePayload,
  token: string | null,
): Promise<SaveCondominiumRoleResult> {
  return submitRoleRequest(rolesBasePath(condominiumId), 'POST', buildRoleBody(payload), token);
}

export async function updateCondominiumRole(
  condominiumId: number,
  roleId: number,
  payload: UpdateCondominiumRolePayload,
  token: string | null,
): Promise<SaveCondominiumRoleResult> {
  return submitRoleRequest(
    rolePath(condominiumId, roleId),
    'PUT',
    buildRoleUpdateBody(payload),
    token,
  );
}

export async function deleteCondominiumRole(
  condominiumId: number,
  roleId: number,
  token: string | null,
): Promise<SaveCondominiumRoleResult> {
  return submitRoleDeleteRequest(rolePath(condominiumId, roleId), token);
}
