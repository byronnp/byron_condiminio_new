import { http } from '@/services/api/http';
import { isRecord, toNumber, toText } from '@/utils/api/common';

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

function normalizeCountry(item: unknown): CountryOption | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id);
  const code = toText(item.code);
  const name = toText(item.name);

  if (id === null || !code || !name) {
    return null;
  }

  return { id, code, name };
}

function normalizeProvince(item: unknown): ProvinceOption | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id);
  const countryId = toNumber(item.country_id);
  const code = toText(item.code);
  const name = toText(item.name);

  if (id === null || countryId === null || !code || !name) {
    return null;
  }

  return { id, country_id: countryId, code, name };
}

function normalizeCity(item: unknown): CityOption | null {
  if (!isRecord(item)) {
    return null;
  }

  const id = toNumber(item.id);
  const provinceId = toNumber(item.province_id);
  const code = toText(item.code);
  const name = toText(item.name);

  if (id === null || provinceId === null || !code || !name) {
    return null;
  }

  return { id, province_id: provinceId, code, name };
}

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (!isRecord(payload)) {
    return [];
  }

  const data = payload.data;
  if (Array.isArray(data)) {
    return data;
  }

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

export async function fetchCountries(token: string | null): Promise<CountryOption[]> {
  const { response, data, unauthorized } = await http.get<unknown>('/api/countries', { token });
  if (unauthorized) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar la ubicación (${response.status})`);
  }

  return extractItems(data)
    .map(normalizeCountry)
    .filter((item): item is CountryOption => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchProvinces(
  countryCode: string,
  token: string | null,
): Promise<ProvinceOption[]> {
  const { response, data, unauthorized } = await http.get<unknown>(
    `/api/countries/${encodeURIComponent(countryCode)}/provinces`,
    { token },
  );

  if (unauthorized) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar las provincias (${response.status})`);
  }

  return extractItems(data)
    .map(normalizeProvince)
    .filter((item): item is ProvinceOption => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchCities(provinceId: number, token: string | null): Promise<CityOption[]> {
  const { response, data, unauthorized } = await http.get<unknown>(
    `/api/provinces/${encodeURIComponent(String(provinceId))}/cities`,
    { token },
  );

  if (unauthorized) {
    return [];
  }

  if (!response.ok) {
    throw new Error(`No fue posible cargar las ciudades (${response.status})`);
  }

  return extractItems(data)
    .map(normalizeCity)
    .filter((item): item is CityOption => item !== null)
    .sort((a, b) => a.name.localeCompare(b.name));
}
