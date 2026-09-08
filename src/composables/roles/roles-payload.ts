import type { SaveCondominiumRolePayload } from '@/services/condominium-roles.service';

export interface RoleFormData {
  name: string;
  code: string;
  description: string;
  isActive: boolean;
  permissionCodes: string[];
}

export function createEmptyRoleForm(): RoleFormData {
  return {
    name: '',
    code: '',
    description: '',
    isActive: true,
    permissionCodes: [],
  };
}

export function isRoleNameValid(value: string): boolean {
  return value.trim().length >= 2;
}

export function isRoleCodeValid(value: string): boolean {
  return /^[a-z0-9](?:[a-z0-9_-]{0,38}[a-z0-9])?$/i.test(value.trim());
}

export function isRoleFormValid(form: RoleFormData): boolean {
  return isRoleNameValid(form.name) && isRoleCodeValid(form.code);
}

/**
 * Arma el payload de guardado a partir del formulario del diálogo de roles.
 * Aísla el mapeo de datos del componente para que RoleFormDialog.vue no lo haga inline.
 */
export function buildCondominiumRolePayload(form: RoleFormData): SaveCondominiumRolePayload {
  const description = form.description.trim();

  return {
    name: form.name.trim(),
    code: form.code.trim().toLowerCase(),
    ...(description ? { description } : {}),
    isActive: form.isActive,
    permissionCodes: [...form.permissionCodes],
  };
}
