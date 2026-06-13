import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

export type UserRole = 'senior' | 'admin';

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
}

const storageKey = 'condominios-admin-session';

const condoCatalog: CondoOption[] = [
  { id: 'condo-aurora', name: 'Condominio Aurora', city: 'Guayaquil', units: 128, active: true },
  { id: 'condo-pacific', name: 'Residencial Pacific', city: 'Samborondón', units: 94, active: true },
  { id: 'condo-verde', name: 'Torres del Verde', city: 'Quito', units: 76, active: true },
  { id: 'condo-marina', name: 'Marina Bay', city: 'Manta', units: 54, active: true },
];

function createDefaultState(): SessionState {
  return {
    user: null,
    activeCondoId: null,
    allowedCondoIds: [],
  };
}

function readSession(): SessionState {
  if (typeof window === 'undefined') {
    return createDefaultState();
  }

  const raw = window.localStorage.getItem(storageKey);
  if (!raw) {
    return createDefaultState();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SessionState>;
    return {
      user:
        parsed.user && typeof parsed.user.name === 'string' && typeof parsed.user.email === 'string'
          ? {
              name: parsed.user.name,
              email: parsed.user.email,
              role: parsed.user.role === 'senior' ? 'senior' : 'admin',
            }
          : null,
      activeCondoId:
        typeof parsed.activeCondoId === 'string' ? parsed.activeCondoId : null,
      allowedCondoIds: Array.isArray(parsed.allowedCondoIds)
        ? parsed.allowedCondoIds.filter((value): value is string => typeof value === 'string')
        : [],
    };
  } catch {
    return createDefaultState();
  }
}

function writeSession(state: SessionState) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(storageKey, JSON.stringify(state));
}

export const useSessionStore = defineStore('session', () => {
  const state = ref<SessionState>(readSession());

  const user = computed(() => state.value.user);
  const role = computed<UserRole | null>(() => state.value.user?.role ?? null);
  const isAuthenticated = computed(() => Boolean(state.value.user));
  const isSenior = computed(() => state.value.user?.role === 'senior');
  const condoOptions = computed(() => condoCatalog.filter((condo) => condo.active));
  const allowedCondominiums = computed(() => {
    if (isSenior.value) {
      return condoOptions.value;
    }

    return condoOptions.value.filter((condo) => state.value.allowedCondoIds.includes(condo.id));
  });
  const activeCondominium = computed(() => {
    const condoId = state.value.activeCondoId;
    if (!condoId) {
      return null;
    }

    const condo = condoCatalog.find((item) => item.id === condoId) ?? null;
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

  function persist() {
    writeSession(state.value);
  }

  function signInDemo(payload: {
    email: string;
    password: string;
    role?: UserRole;
    condoId?: string | null;
    name?: string;
  }) {
    const resolvedRole: UserRole = payload.role ?? 'admin';
    const derivedName = payload.name ?? payload.email.split('@')[0] ?? 'Administrador';
    const selectedCondoId =
      resolvedRole === 'senior' ? payload.condoId ?? null : payload.condoId ?? condoCatalog[0]?.id ?? null;

    state.value = {
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
    };

    persist();
  }

  function setActiveCondo(condoId: string) {
    if (!allowedCondominiums.value.some((condo) => condo.id === condoId)) {
      return;
    }

    state.value = {
      ...state.value,
      activeCondoId: condoId,
    };
    persist();
  }

  function signOut() {
    state.value = createDefaultState();
    persist();
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
    activeCondoId: computed({
      get: () => state.value.activeCondoId,
      set: (value: string | null) => {
        state.value.activeCondoId = value;
        persist();
      },
    }),
    signInDemo,
    setActiveCondo,
    signOut,
  };
});

export const condoCatalogOptions = condoCatalog;
