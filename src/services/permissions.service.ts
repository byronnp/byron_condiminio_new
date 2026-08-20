import { http } from '@/services/api/http';
import { isRecord, toNumber, toText } from '@/utils/api/common';

export interface PermissionCatalogItem {
  id: number | null;
  code: string;
  name: string;
  groupKey: string;
  groupLabel: string;
}

export interface PermissionModuleGroup {
  key: string;
  label: string;
  permissions: { code: string; label: string }[];
}

interface ApiPermissionsResponse {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
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

function humanizeKey(value: string) {
  const spaced = value.replace(/[_-]+/g, ' ').trim();
  if (!spaced) {
    return value;
  }
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/**
 * Deriva el grupo/módulo de un permiso a partir de su código cuando el backend no
 * manda un campo explícito de módulo/grupo (por ejemplo `administrators.view` -> `administrators`).
 */
function deriveGroupFromCode(code: string) {
  const [prefix] = code.split('.');
  return prefix || code;
}

function normalizePermissionItem(item: unknown): PermissionCatalogItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const code = pickFirstText(item, ['code', 'slug', 'key', 'permission', 'permission_code']);
  const name = pickFirstText(item, ['name', 'label', 'title', 'description']);

  if (!code) {
    return null;
  }

  const explicitGroupKey = pickFirstText(item, [
    'module',
    'module_key',
    'group',
    'group_key',
    'category',
    'resource',
  ]);
  const groupKey = explicitGroupKey || deriveGroupFromCode(code);
  const explicitGroupLabel = pickFirstText(item, [
    'module_name',
    'module_label',
    'group_name',
    'group_label',
    'category_name',
  ]);
  const groupLabel = explicitGroupLabel || humanizeKey(groupKey);

  return {
    id: toNumber(item.id),
    code,
    name: name || code,
    groupKey,
    groupLabel,
  };
}

function extractPermissionItems(payload: unknown): unknown[] {
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

/**
 * Catálogo global de permisos (`GET /api/permissions`), sin agrupar.
 */
export async function fetchPermissionsCatalog(
  token: string | null,
): Promise<PermissionCatalogItem[]> {
  const { response, data, unauthorized } = await http.get<ApiPermissionsResponse>(
    '/api/permissions',
    { token },
  );

  if (unauthorized) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar el catálogo de permisos (${response.status})`);
  }

  const items = extractPermissionItems(data);

  return items
    .map(normalizePermissionItem)
    .filter((item): item is PermissionCatalogItem => item !== null);
}

/**
 * Agrupa el catálogo plano por módulo, para alimentar un árbol de selección
 * (módulo -> acciones). Conserva el orden de aparición de los grupos.
 */
export function groupPermissionsCatalog(items: PermissionCatalogItem[]): PermissionModuleGroup[] {
  const groups: PermissionModuleGroup[] = [];
  const groupIndexByKey = new Map<string, number>();

  for (const item of items) {
    let index = groupIndexByKey.get(item.groupKey);
    if (index === undefined) {
      index = groups.length;
      groupIndexByKey.set(item.groupKey, index);
      groups.push({ key: item.groupKey, label: item.groupLabel, permissions: [] });
    }
    groups[index]!.permissions.push({ code: item.code, label: item.name });
  }

  return groups;
}

export function findPermissionLabel(items: PermissionCatalogItem[], code: string): string {
  const match = items.find((item) => item.code === code);
  if (!match) {
    return code;
  }
  return `${match.groupLabel}: ${match.name}`;
}
