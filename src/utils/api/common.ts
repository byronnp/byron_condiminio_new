export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

export function toText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function appendQueryParams(
  url: URL,
  params: Record<string, string | number | boolean | null | undefined>,
) {
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (typeof value === 'string') {
      const normalized = value.trim();
      if (!normalized) {
        continue;
      }
      url.searchParams.set(key, normalized);
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  return url;
}
