import {
  resolveNavigationPath,
  type NavigationItem,
  type NavigationSection,
} from '@/config/navigation';

interface MenuResponsePayload {
  success?: unknown;
  message?: unknown;
  data?: unknown;
  meta?: unknown;
}

const apiHost = import.meta.env.VITE_API_HOST ?? 'http://localhost:8001/';

const backendIconMap: Record<string, string> = {
  'layout-dashboard': 'dashboard',
  building: 'apartment',
  'building-2': 'apartment',
  users: 'groups',
  'user-plus': 'person_add',
  home: 'home',
  'home-plus': 'add_home',
  'user-round-check': 'how_to_reg',
  'users-round': 'groups',
  'wallet-cards': 'paid',
  'calendar-days': 'event_available',
  wrench: 'handyman',
  megaphone: 'campaign',
  contact: 'badge',
  'chart-column': 'summarize',
  settings: 'settings',
};

function buildApiUrl(path: string) {
  return new URL(path, apiHost).toString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object');
}

function normalizeLabel(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : '';
}

function normalizePath(value: unknown, fallbackLabel: string) {
  if (typeof value === 'string' && value.trim()) {
    const trimmed = value.trim();

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return trimmed;
    }

    if (trimmed.startsWith('#/')) {
      return trimmed.slice(1);
    }

    if (trimmed.startsWith('#')) {
      return `/${trimmed.slice(1)}`;
    }

    if (trimmed.startsWith('/')) {
      return trimmed;
    }

    return `/${trimmed}`;
  }

  return resolveNavigationPath({ label: fallbackLabel, to: null });
}

function normalizeIcon(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) {
    return 'chevron_right';
  }

  return backendIconMap[value.trim()] ?? value.trim();
}

function normalizeMenuItem(item: unknown): NavigationItem | null {
  if (!isRecord(item)) {
    return null;
  }

  const label =
    normalizeLabel(item.name) || normalizeLabel(item.label) || normalizeLabel(item.title);
  if (!label) {
    return null;
  }

  const path =
    normalizePath(item.path ?? item.to ?? item.route ?? item.url, label) ??
    normalizePath(item.code, label);

  const normalizedItem: NavigationItem = {
    label,
    icon: normalizeIcon(item.icon),
  };

  if (path) {
    normalizedItem.to = path;
  }

  const trailingIcon = normalizeLabel(item.trailingIcon);
  if (trailingIcon) {
    normalizedItem.trailingIcon = trailingIcon;
  }

  return normalizedItem;
}

function collectMenuItems(source: unknown): NavigationItem[] {
  if (Array.isArray(source)) {
    return source.flatMap((entry) => {
      if (!isRecord(entry)) {
        return [];
      }

      const nested = collectMenuItems(entry.children ?? entry.menus ?? entry.items);
      const normalized = normalizeMenuItem(entry);

      return normalized ? [normalized, ...nested] : nested;
    });
  }

  if (!isRecord(source)) {
    return [];
  }

  const normalized = normalizeMenuItem(source);
  const nested = collectMenuItems(source.children ?? source.menus ?? source.items);

  return normalized ? [normalized, ...nested] : nested;
}

function normalizeSection(section: unknown, fallbackKey: string): NavigationSection | null {
  if (!isRecord(section)) {
    return null;
  }

  const key = normalizeLabel(section.code) || normalizeLabel(section.key) || fallbackKey;
  const label =
    normalizeLabel(section.name) ||
    normalizeLabel(section.label) ||
    normalizeLabel(section.title) ||
    key;
  const items = collectMenuItems(section.menus ?? section.items ?? section.children);

  if (items.length === 0) {
    return null;
  }

  return {
    key,
    label,
    items,
  };
}

function normalizeMenuResponse(payload: unknown): NavigationSection[] {
  if (Array.isArray(payload)) {
    return payload
      .map((section, index) => normalizeSection(section, `section-${index + 1}`))
      .filter((section): section is NavigationSection => section !== null);
  }

  if (!isRecord(payload)) {
    return [];
  }

  const response = payload as MenuResponsePayload;
  const sections: NavigationSection[] = [];

  if (Array.isArray(response.data)) {
    response.data.forEach((section, index) => {
      const normalized = normalizeSection(section, `section-${index + 1}`);
      if (normalized) {
        sections.push(normalized);
      }
    });
  }

  if (sections.length > 0) {
    return sections;
  }

  const directCandidates: Array<[string, unknown]> = [
    ['principal', response.data],
    ['menu', response.data],
  ];

  for (const [key, candidate] of directCandidates) {
    if (candidate === undefined || candidate === null) {
      continue;
    }

    const normalized = normalizeSection(candidate, key);
    if (normalized) {
      sections.push(normalized);
    }
  }

  return sections;
}

export async function fetchAuthMenu(accessToken: string | null) {
  const response = await fetch(buildApiUrl('/api/auth/menu'), {
    headers: {
      Accept: 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`No fue posible cargar el menú (${response.status})`);
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    return [];
  }

  const payload = (await response.json()) as unknown;
  return normalizeMenuResponse(payload);
}
