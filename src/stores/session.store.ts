import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { defaultNavigationSections, type NavigationSection } from '@/config/navigation';
import type { AuthSessionPayload } from '@/services/auth.service';

export type UserRole = 'senior' | 'admin';
export type SessionPersistenceMode = 'local' | 'session';

export interface CondoOption {
  id: string;
  name: string;
  city: string;
  units: number;
  active: boolean;
}

export interface SessionUser {
  name: string;
  email: string;
  role: UserRole;
}

interface SessionState {
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

const condoCatalog: CondoOption[] = [
  { id: 'condo-aurora', name: 'Condominio Aurora', city: 'Guayaquil', units: 128, active: true },
  {
    id: 'condo-pacific',
    name: 'Residencial Pacific',
    city: 'SamborondÃ³n',
    units: 94,
    active: true,
  },
  { id: 'condo-verde', name: 'Torres del Verde', city: 'Quito', units: 76, active: true },
  { id: 'condo-marina', name: 'Marina Bay', city: 'Manta', units: 54, active: true },
];

function createDefaultState(): SessionState {
  return {
    user: null,
    activeCondoId: null,
    allowedCondoIds: [],
    availableCondominiums: [...condoCatalog],
    menuSections: defaultNavigationSections.map((section) => ({
      ...section,
      items: [...section.items],
    })),
    accessToken: null,
    refreshToken: null,
    persistMode: 'local',
  };
}

function cloneMenuSections(sections: NavigationSection[]) {
  return sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item })),
  }));
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

    return {
      user:
        parsed.user && typeof parsed.user.name === 'string' && typeof parsed.user.email === 'string'
          ? {
              name: parsed.user.name,
              email: parsed.user.email,
              role: parsed.user.role === 'senior' ? 'senior' : 'admin',
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
    };
  } catch {
    return null;
  }
}

function readSession(): SessionState {
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

function writeSession(state: SessionState) {
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

function clearSessionStorage() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(storageKey);
  window.sessionStorage.removeItem(storageKey);
}

export const useSessionStore = defineStore('session', () => {
  const state = ref<SessionState>(readSession());

  const user = computed(() => state.value.user);
  const role = computed<UserRole | null>(() => state.value.user?.role ?? null);
  const isAuthenticated = computed(() => Boolean(state.value.user));
  const isSenior = computed(() => state.value.user?.role === 'senior');
  const condoOptions = computed(() => {
    const list =
      state.value.availableCondominiums.length > 0
        ? state.value.availableCondominiums
        : condoCatalog;
    return list.filter((condo) => condo.active);
  });
  const allowedCondominiums = computed(() => {
    if (isSenior.value) {
      return condoOptions.value;
    }

    const allowed = condoOptions.value.filter((condo) =>
      state.value.allowedCondoIds.includes(condo.id),
    );
    if (allowed.length > 0) {
      return allowed;
    }

    return state.value.activeCondoId
      ? condoOptions.value.filter((condo) => condo.id === state.value.activeCondoId)
      : [];
  });
  const activeCondominium = computed(() => {
    const condoId = state.value.activeCondoId;
    if (!condoId) {
      return null;
    }

    const condo = condoOptions.value.find((item) => item.id === condoId) ?? null;
    if (!condo) {
      return null;
    }

    if (!isSenior.value && !state.value.allowedCondoIds.includes(condo.id)) {
      return null;
    }

    return condo;
  });
  const contextLabel = computed(() => {
    if (isSenior.value) {
      return 'Vista global';
    }

    return activeCondominium.value ? activeCondominium.value.name : 'Sin condominio asignado';
  });
  const menuSections = computed(() =>
    state.value.menuSections.length > 0 ? state.value.menuSections : defaultNavigationSections,
  );

  function persist() {
    writeSession(state.value);
  }

  function setSessionState(nextState: SessionState) {
    state.value = nextState;
    persist();
  }

  function signInDemo(payload: {
    email: string;
    password: string;
    role?: UserRole;
    condoId?: string | null;
    name?: string;
    persistMode?: SessionPersistenceMode;
  }) {
    const resolvedRole: UserRole = payload.role ?? 'admin';
    const derivedName = payload.name ?? payload.email.split('@')[0] ?? 'Administrador';
    const selectedCondoId =
      resolvedRole === 'senior'
        ? (payload.condoId ?? null)
        : (payload.condoId ?? condoCatalog[0]?.id ?? null);

    setSessionState({
      user: {
        name: derivedName,
        email: payload.email,
        role: resolvedRole,
      },
      activeCondoId: selectedCondoId,
      allowedCondoIds:
        resolvedRole === 'senior'
          ? condoCatalog.map((condo) => condo.id)
          : selectedCondoId
            ? [selectedCondoId]
            : [],
      availableCondominiums: [...condoCatalog],
      menuSections: cloneMenuSections(defaultNavigationSections),
      accessToken: null,
      refreshToken: null,
      persistMode: payload.persistMode ?? 'local',
    });
  }

  function signInFromApi(
    payload: AuthSessionPayload,
    persistMode: SessionPersistenceMode = 'local',
  ) {
    const allowedCondominiums = payload.allowedCondominiums.filter((condo) => condo.active);
    const selectedCondoId =
      payload.user.role === 'senior' && payload.activeCondoId === null
        ? null
        : (payload.activeCondoId ?? allowedCondominiums[0]?.id ?? null);

    const allowedCondoIds =
      payload.user.role === 'senior'
        ? allowedCondominiums.map((condo) => condo.id)
        : allowedCondominiums.length > 0
          ? allowedCondominiums.map((condo) => condo.id)
          : selectedCondoId
            ? [selectedCondoId]
            : [];

    setSessionState({
      user: payload.user,
      activeCondoId: selectedCondoId,
      allowedCondoIds,
      availableCondominiums:
        allowedCondominiums.length > 0 ? allowedCondominiums : [...condoCatalog],
      menuSections: cloneMenuSections(defaultNavigationSections),
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      persistMode,
    });
  }

  function setMenuSections(sections: NavigationSection[]) {
    state.value = {
      ...state.value,
      menuSections: cloneMenuSections(sections),
    };
    persist();
  }

  function setAvailableCondominiums(condominiums: CondoOption[]) {
    const availableCondominiums = condominiums.filter((condo) => condo.active);
    const availableIds = availableCondominiums.map((condo) => condo.id);
    const currentCondoIsAvailable =
      state.value.activeCondoId === null || availableIds.includes(state.value.activeCondoId);
    const activeCondoId = currentCondoIsAvailable
      ? state.value.activeCondoId
      : (availableCondominiums[0]?.id ?? null);

    state.value = {
      ...state.value,
      availableCondominiums,
      allowedCondoIds: availableIds,
      activeCondoId,
    };
    persist();
  }

  function setActiveCondo(condoId: string) {
    const canUseCondo =
      allowedCondominiums.value.some((condo) => condo.id === condoId) ||
      condoOptions.value.some((condo) => condo.id === condoId);

    if (!canUseCondo) {
      return;
    }

    state.value = {
      ...state.value,
      activeCondoId: condoId,
    };
    persist();
  }

  function signOut() {
    clearSessionStorage();
    state.value = createDefaultState();
  }

  return {
    user,
    role,
    isAuthenticated,
    isSenior,
    condoOptions,
    allowedCondominiums,
    activeCondominium,
    contextLabel,
    menuSections,
    accessToken: computed(() => state.value.accessToken),
    refreshToken: computed(() => state.value.refreshToken),
    activeCondoId: computed({
      get: () => state.value.activeCondoId,
      set: (value: string | null) => {
        state.value.activeCondoId = value;
        persist();
      },
    }),
    signInDemo,
    signInFromApi,
    setMenuSections,
    setAvailableCondominiums,
    setActiveCondo,
    signOut,
  };
});

export const condoCatalogOptions = condoCatalog;
