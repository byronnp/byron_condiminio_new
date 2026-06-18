import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { login as loginRequest, type LoginCredentials } from '@/services/auth.service';
import { useAuthMenu } from '@/composables/auth/useAuthMenu';
import { useSessionStore, type SessionPersistenceMode } from '@/stores/session.store';

export interface SubmitLoginPayload extends LoginCredentials {
  rememberMe: boolean;
  redirectTo?: string;
}

export function useAuthLogin() {
  const router = useRouter();
  const session = useSessionStore();
  const { loadAuthMenu } = useAuthMenu();
  const isSubmitting = ref(false);
  const errorMessage = ref('');

  async function submitLogin(payload: SubmitLoginPayload) {
    if (isSubmitting.value) {
      return false;
    }

    isSubmitting.value = true;
    errorMessage.value = '';

    try {
      const authSession = await loginRequest({
        email: payload.email.trim(),
        password: payload.password,
      });

      const persistMode: SessionPersistenceMode = payload.rememberMe ? 'local' : 'session';
      session.signInFromApi(authSession, persistMode);
      await loadAuthMenu(authSession.accessToken);

      const redirect = payload.redirectTo ?? '/dashboard';
      await router.push(redirect);
      return true;
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'No fue posible iniciar sesión.';
      return false;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    isSubmitting,
    errorMessage,
    submitLogin,
  };
}
