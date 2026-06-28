import { ref, type Ref } from 'vue';

import { fetchCatalogItems, type CatalogItem } from '@/services/catalog.service';

export type CatalogOptionMapper<T> = (item: CatalogItem) => T | null;

export interface UseCatalogOptionsConfig<T> {
  fallback?: T[];
  mapItem: CatalogOptionMapper<T>;
}

export function useCatalogOptions<T>(code: string, config: UseCatalogOptionsConfig<T>) {
  const options = ref<T[]>([...(config.fallback ?? [])]) as Ref<T[]>;
  const loading = ref(false);
  const error = ref('');

  async function loadOptions() {
    loading.value = true;
    error.value = '';

    try {
      const items = await fetchCatalogItems(code);
      const mapped = items
        .map(config.mapItem)
        .filter((item): item is T => item !== null && item !== undefined);

      options.value = mapped.length > 0 ? mapped : [...(config.fallback ?? [])];
    } catch (caughtError) {
      options.value = [...(config.fallback ?? [])];
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : `No fue posible cargar el catálogo ${code}.`;
    } finally {
      loading.value = false;
    }
  }

  function resetOptions() {
    options.value = [...(config.fallback ?? [])];
    error.value = '';
  }

  return {
    error,
    loadOptions,
    loading,
    options,
    resetOptions,
  };
}
