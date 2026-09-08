import { condoCatalog, type CondoOption } from '@/config/condo-catalog';
import { defaultNavigationSections, type NavigationSection } from '@/config/navigation';

export type UserRole = 'senior' | 'admin';
export type SessionPersistenceMode = 'local' | 'session';

export interface SessionUser {
  name: string;
  email: string;
  role: UserRole;
  platformRoleId: number | null;
}

export interface SessionState {
  user: SessionUser | null;
  activeCondoId: string | null;
  allowedCondoIds: string[];
  availableCondominiums: CondoOption[];
  menuSections: NavigationSection[];
  accessToken: string | null;
  refreshToken: string | null;
  persistMode: SessionPersistenceMode;
}

const storageKey = 'condominios-admin-session';

export function cloneMenuSections(sections: NavigationSection[]) {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item })),
  }));
}

export function createDefaultState(): SessionState {
  return {
    user: null,
    activeCondoId: null,
    allowedCondoIds: [],
    availableCondominiums: [...condoCatalog],
    menuSections: cloneMenuSections(defaultNavigationSections),
    accessToken: null,
    refreshToken: null,
    persistMode: 'local',
  };
}

function getRoleFromUser(user: SessionUser | null): UserRole | null {
  return user?.role ?? null;
}

function resolvePrimaryCondoId(
  role: UserRole | null,
  activeCondoId: string | null,
  allowedCondoIds: string[],
  availableCondominiums: CondoOption[],
) {
  const allowedOptions = availableCondominiums.filter(
    (condo) => allowedCondoIds.includes(condo.id) && condo.active,
  );
  const availableOptions = availableCondominiums.filter((condo) => condo.active);
  const preferredCondo =
    activeCondoId && availableOptions.some((condo) => condo.id === activeCondoId)
      ? activeCondoId
      : null;

  if (role === 'senior') {
    return preferredCondo;
  }

  return preferredCondo ?? allowedOptions[0]?.id ?? availableOptions[0]?.id ?? null;
}

export function normalizeSessionState(state: SessionState): SessionState {
  const role = getRoleFromUser(state.user);
  const availableCondominiums = state.availableCondominiums.filter(isValidCondoOption);
  const allowedCondoIds = state.allowedCondoIds.filter((value) => typeof value === 'string');
  const activeCondoId = resolvePrimaryCondoId(
    role,
    state.activeCondoId,
    allowedCondoIds,
    availableCondominiums,
  );

  return {
    ...state,
    activeCondoId,
    allowedCondoIds:
      role === 'senior' ? availableCondominiums.map((condo) => condo.id) : allowedCondoIds,
    availableCondominiums,
  };
}

function isValidCondoOption(value: unknown): value is CondoOption {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as CondoOption).id === 'string' &&
      typeof (value as CondoOption).name === 'string' &&
      typeof (value as CondoOption).city === 'string' &&
      typeof (value as CondoOption).units === 'number' &&
      typeof (value as CondoOption).active === 'boolean',
  );
}

function readSessionFromStorage(raw: string | null): SessionState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    const availableCondominiums = Array.isArray(parsed.availableCondominiums)
      ? parsed.availableCondominiums.filter(isValidCondoOption)
      : [];
    const menuSections = Array.isArray(parsed.menuSections)
      ? parsed.menuSections
          .filter((section): section is NavigationSection =>
            Boolean(
              section &&
                typeof section === 'object' &&
                typeof section.key === 'string' &&
                typeof section.label === 'string' &&
                Array.isArray(section.items),
            ),
          )
          .map((section) => ({
            ...section,
            items: section.items.filter((item): item is NavigationSection['items'][number] =>
              Boolean(item && typeof item.label === 'string'),
            ),
          }))
      : defaultNavigationSections;

    return normalizeSessionState({
      user:
        parsed.user &&
        typeof parsed.user.name === 'string' &&
        typeof parsed.user.email === 'string'
          ? {
              name: parsed.user.name,
              email: parsed.user.email,
              role: parsed.user.role === 'senior' ? 'senior' : 'admin',
              platformRoleId:
                Number.isInteger(Number(parsed.user.platformRoleId)) &&
                Number(parsed.user.platformRoleId) > 0
                  ? Number(parsed.user.platformRoleId)
                  : null,
            }
          : null,
      activeCondoId: typeof parsed.activeCondoId === 'string' ? parsed.activeCondoId : null,
      allowedCondoIds: Array.isArray(parsed.allowedCondoIds)
        ? parsed.allowedCondoIds.filter((value): value is string => typeof value === 'string')
        : [],
      availableCondominiums,
      menuSections,
      accessToken: typeof parsed.accessToken === 'string' ? parsed.accessToken : null,
      refreshToken: typeof parsed.refreshToken === 'string' ? parsed.refreshToken : null,
      persistMode: parsed.persistMode === 'session' ? 'session' : 'local',
    });
  } catch {
    return null;
  }
}

export function readSession(): SessionState {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  const fromLocal = readSessionFromStorage(window.localStorage.getItem(storageKey));
  if (fromLocal) {
    return fromLocal;
  }

  const fromSession = readSessionFromStorage(window.sessionStorage.getItem(storageKey));
  if (fromSession) {
    return fromSession;
  }

  return createDefaultState();
}

export function writeSession(state: SessionState) {
  if (typeof window === 'undefined') {
    return;
  }

  const serialized = JSON.stringify(state);
  if (state.persistMode === 'session') {
    window.sessionStorage.setItem(storageKey, serialized);
    window.localStorage.removeItem(storageKey);
    return;
  }

  window.localStorage.setItem(storageKey, serialized);
  window.sessionStorage.removeItem(storageKey);
}

export function clearSessionStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(storageKey);
  window.sessionStorage.removeItem(storageKey);
}
