import { computed, ref } from 'vue';
import { defineStore } from 'pinia';

import { condoCatalog, type CondoOption } from '@/config/condo-catalog';
import { defaultNavigationSections, type NavigationSection } from '@/config/navigation';
import type { AuthSessionPayload } from '@/services/auth.service';
import {
  cloneMenuSections,
  clearSessionStorage,
  createDefaultState,
  normalizeSessionState,
  readSession,
  writeSession,
  type SessionPersistenceMode,
  type SessionState,
  type SessionUser,
  type UserRole,
} from './session-storage';

export type { CondoOption };
export type { SessionPersistenceMode, SessionUser, UserRole };

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
    state.value = normalizeSessionState(nextState);
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
      user: { name: derivedName, email: payload.email, role: resolvedRole, platformRoleId: null },
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
    state.value = { ...state.value, menuSections: cloneMenuSections(sections) };
    persist();
  }

  function setAvailableCondominiums(condominiums: CondoOption[]) {
    const availableCondominiums = condominiums.filter((condo) => condo.active);
    const availableIds = availableCondominiums.map((condo) => condo.id);
    const currentCondoId = state.value.activeCondoId;
    const currentCondoIsAvailable =
      typeof currentCondoId === 'string' && availableIds.includes(currentCondoId);
    const activeCondoId = isSenior.value
      ? currentCondoIsAvailable
        ? currentCondoId
        : null
      : currentCondoIsAvailable
        ? currentCondoId
        : (state.value.allowedCondoIds[0] ?? availableCondominiums[0]?.id ?? null);

    state.value = {
      ...state.value,
      availableCondominiums,
      allowedCondoIds: availableIds,
      activeCondoId,
    };
    persist();
  }

  function setActiveCondo(condoId: string) {
    if (!isSenior.value) {
      const currentCondoId = state.value.activeCondoId;
      if (currentCondoId && currentCondoId !== condoId) {
        return;
      }
    }

    const canUseCondo =
      allowedCondominiums.value.some((condo) => condo.id === condoId) ||
      condoOptions.value.some((condo) => condo.id === condoId);

    if (!canUseCondo) {
      return;
    }

    state.value = { ...state.value, activeCondoId: condoId };
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
