export interface CatalogItem {
  id: number;
  catalog_id: number;
  code: string;
  name: string;
  description: string | null;
  sort_order: number;
  metadata?: unknown;
  is_system?: boolean;
  is_active: boolean;
}

interface CatalogItemsResponse {
  success?: boolean;
  message?: string;
  data?: unknown;
  meta?: unknown;
}

const apiHost = import.meta.env.VITE_API_HOST ?? 'http://localhost:8001/';

function buildApiUrl(path: string) {
  return new URL(path, apiHost).toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function normalizeCatalogItem(item: unknown): CatalogItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = Number(item.id);
  const catalogId = Number(item.catalog_id);
  const sortOrder = Number(item.sort_order ?? 0);
  const code = typeof item.code === 'string' ? item.code.trim() : '';
  const name = typeof item.name === 'string' ? item.name.trim() : '';

  if (!Number.isFinite(id) || !Number.isFinite(catalogId) || !code || !name) {
    return null;
  }

  return {
    id,
    catalog_id: catalogId,
    code,
    name,
    description: typeof item.description === 'string' ? item.description : null,
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    metadata: item.metadata,
    is_system: item.is_system === true,
    is_active: item.is_active !== false,
  };
}

export async function fetchCatalogItems(code: string): Promise<CatalogItem[]> {
  const response = await fetch(buildApiUrl(`/api/catalogs/${encodeURIComponent(code)}/items`), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`No fue posible cargar el catálogo ${code} (${response.status})`);
  }

  const payload = (await response.json()) as CatalogItemsResponse;
  const rawItems = Array.isArray(payload.data) ? payload.data : [];

  return rawItems
    .map(normalizeCatalogItem)
    .filter((item): item is CatalogItem => item !== null && item.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}
