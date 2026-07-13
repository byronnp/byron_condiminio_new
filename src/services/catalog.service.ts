import { http } from '@/services/api/http';
import { isRecord, toNumber, toText } from '@/utils/api/common';

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

function normalizeCatalogItem(item: unknown): CatalogItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id);
  const catalogId = toNumber(item.catalog_id);
  const sortOrder = toNumber(item.sort_order) ?? 0;
  const code = toText(item.code);
  const name = toText(item.name);

  if (id === null || catalogId === null || !code || !name) {
    return null;
  }

  return {
    id,
    catalog_id: catalogId,
    code,
    name,
    description: typeof item.description === 'string' ? item.description : null,
    sort_order: sortOrder,
    metadata: item.metadata,
    is_system: item.is_system === true,
    is_active: item.is_active !== false,
  };
}

export async function fetchCatalogItems(
  code: string,
  token: string | null = null,
): Promise<CatalogItem[]> {
  const { response, data } = await http.get<CatalogItemsResponse>(
    `/api/catalogs/${encodeURIComponent(code)}/items`,
    { token },
  );

  if (!response.ok) {
    throw new Error(`No fue posible cargar el catálogo ${code} (${response.status})`);
  }

  const rawItems = Array.isArray(data?.data) ? data.data : [];

  return rawItems
    .map(normalizeCatalogItem)
    .filter((item): item is CatalogItem => item !== null && item.is_active)
    .sort((a, b) => a.sort_order - b.sort_order);
}
