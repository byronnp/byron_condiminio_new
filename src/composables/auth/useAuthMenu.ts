import { ref } from 'vue';

import { fetchAuthMenu } from '@/services/menu.service';
import { useSessionStore } from '@/stores/session.store';

export function useAuthMenu() {
  const session = useSessionStore();
  const isLoading = ref(false);
  const errorMessage = ref('');

  async function loadAuthMenu(accessToken: string | null) {
    if (isLoading.value) {
      return session.menuSections;
    }

    isLoading.value = true;
    errorMessage.value = '';

    try {
      const menuSections = await fetchAuthMenu(accessToken);
      if (menuSections.length > 0) {
        session.setMenuSections(menuSections);
      }

      return session.menuSections;
    } catch (error) {
      errorMessage.value = error instanceof Error ? error.message : 'No fue posible cargar el menú.';
      return session.menuSections;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    errorMessage,
    loadAuthMenu,
  };
}
