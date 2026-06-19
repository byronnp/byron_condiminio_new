interface ApiListResponse {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
}

export interface CountryOption {
  id: number;
  code: string;
  name: string;
}

export interface ProvinceOption {
  id: number;
  country_id: number;
  code: string;
  name: string;
}

export interface CityOption {
  id: number;
  province_id: number;
  code: string;
  name: string;
}

const apiHost = import.meta.env.VITE_API_HOST ?? 'http://localhost:8001/';

function buildApiUrl(path: string) {
  return new URL(path, apiHost).toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function normalizeCountry(item: unknown): CountryOption | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = Number(item.id);
  const code = typeof item.code === 'string' ? item.code.trim() : '';
  const name = typeof item.name === 'string' ? item.name.trim() : '';

  if (!Number.isFinite(id) || !code || !name) {
    return null;
  }

  return { id, code, name };
}

function normalizeProvince(item: unknown): ProvinceOption | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = Number(item.id);
  const countryId = Number(item.country_id);
  const code = typeof item.code === 'string' ? item.code.trim() : '';
  const name = typeof item.name === 'string' ? item.name.trim() : '';

  if (!Number.isFinite(id) || !Number.isFinite(countryId) || !code || !name) {
    return null;
  }

  return { id, country_id: countryId, code, name };
}

function normalizeCity(item: unknown): CityOption | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = Number(item.id);
  const provinceId = Number(item.province_id);
  const code = typeof item.code === 'string' ? item.code.trim() : '';
  const name = typeof item.name === 'string' ? item.name.trim() : '';

  if (!Number.isFinite(id) || !Number.isFinite(provinceId) || !code || !name) {
    return null;
  }

  return { id, province_id: provinceId, code, name };
}

async function requestLocationItems<T>(
  path: string,
  token: string | null,
): Promise<T[]> {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`No fue posible cargar la ubicación (${response.status})`);
  }

  const payload = (await response.json()) as ApiListResponse;
  return Array.isArray(payload.data) ? (payload.data as T[]) : [];
}

export async function fetchCountries(token: string | null): Promise<CountryOption[]> {
  const items = await requestLocationItems<unknown>('/api/countries', token);

  return items
    .map(normalizeCountry)
    .filter((item): item is CountryOption => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchProvinces(
  countryCode: string,
  token: string | null,
): Promise<ProvinceOption[]> {
  const items = await requestLocationItems<unknown>(
    `/api/countries/${encodeURIComponent(countryCode)}/provinces`,
    token,
  );

  return items
    .map(normalizeProvince)
    .filter((item): item is ProvinceOption => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCities(
  provinceId: number,
  token: string | null,
): Promise<CityOption[]> {
  const items = await requestLocationItems<unknown>(
    `/api/provinces/${encodeURIComponent(String(provinceId))}/cities`,
    token,
  );

  return items
    .map(normalizeCity)
    .filter((item): item is CityOption => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
