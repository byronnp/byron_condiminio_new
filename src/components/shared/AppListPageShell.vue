<template>
  <div class="page-shell">
    <header class="page-hero">
      <div class="page-hero__heading">
        <h1 class="page-hero__title">{{ title }}</h1>
        <p class="page-hero__subtitle">{{ subtitle }}</p>
      </div>

      <div class="page-hero__actions">
        <q-input
          v-model="searchValue"
          dense
          outlined
          debounce="250"
          :placeholder="searchPlaceholder"
          class="search-field"
        >
          <template #prepend>
            <q-icon name="search" />
          </template>
        </q-input>

        <q-select
          v-model="statusValue"
          :options="statusOptions"
          dense
          outlined
          emit-value
          map-options
          class="status-field"
        />

        <q-btn
          outline
          no-caps
          :icon="filtersIcon"
          :label="filtersLabel"
          :aria-label="filtersLabel"
          :aria-expanded="filtersExpanded"
          class="header-action"
          @click="emit('filters-click')"
        />

        <q-btn
          color="primary"
          unelevated
          no-caps
          :icon="actionIcon"
          :label="actionLabel"
          class="header-action header-action--primary"
          @click="emit('cta-click')"
        />
      </div>
    </header>

    <section class="stats-grid">
      <slot name="stats" />
    </section>

    <q-card flat bordered class="table-card">
      <q-card-section class="table-controls">
        <div class="table-controls__left">
          <span>Mostrar</span>
          <q-select
            v-model="rowsPerPageValue"
            :options="rowsPerPageOptions"
            dense
            outlined
            emit-value
            map-options
            class="rows-select"
          />
          <span>registros</span>
        </div>

        <div class="table-controls__right">
          <span>Ordenar por:</span>
          <q-select
            v-model="sortByValue"
            :options="sortOptions"
            dense
            outlined
            emit-value
            map-options
            class="order-select"
          />
        </div>
      </q-card-section>

      <q-separator class="page-divider" />

      <q-card-section class="table-wrap">
        <slot name="table" />
      </q-card-section>

      <q-card-section class="table-footer">
        <slot name="footer" />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type Option = { label: string; value: string | number };

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    search: string;
    searchPlaceholder: string;
    status: string | number;
    statusOptions: readonly Option[];
    rowsPerPage: number;
    rowsPerPageOptions?: readonly number[];
    sortBy: string;
    sortOptions: readonly Option[];
    actionLabel: string;
    actionIcon: string;
    filtersLabel?: string;
    filtersIcon?: string;
    filtersExpanded?: boolean;
  }>(),
  {
    rowsPerPageOptions: () => [10, 20, 50],
    filtersLabel: 'Filtros',
    filtersIcon: 'filter_alt',
    filtersExpanded: false,
  },
);

const searchValue = computed({
  get: () => props.search,
  set: (value: string) => {
    emit('update:search', value);
  },
});

const statusValue = computed({
  get: () => props.status,
  set: (value: string | number) => {
    emit('update:status', value);
  },
});

const rowsPerPageValue = computed({
  get: () => props.rowsPerPage,
  set: (value: number) => {
    emit('update:rowsPerPage', value);
  },
});

const sortByValue = computed({
  get: () => props.sortBy,
  set: (value: string) => {
    emit('update:sortBy', value);
  },
});

const emit = defineEmits<{
  'update:search': [value: string];
  'update:status': [value: string | number];
  'update:rowsPerPage': [value: number];
  'update:sortBy': [value: string];
  'cta-click': [];
  'filters-click': [];
}>();
</script>

<style scoped>
.page-shell {
  display: grid;
  gap: 10px;
}

.page-hero {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.page-hero__heading {
  min-width: 0;
}

.page-hero__title {
  color: var(--app-text);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.page-hero__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.35;
  margin-top: 3px;
  max-width: 720px;
}

.page-hero__actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
  padding-top: 6px;
}

.header-action {
  min-height: 38px;
}

.header-action--primary {
  min-width: 160px;
}

.search-field {
  width: 232px;
}

.status-field {
  width: 146px;
}

.stats-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.table-card {
  border-radius: 16px;
  overflow: hidden;
}

.page-divider {
  margin-inline: 18px;
  opacity: 0.45;
}

.table-controls {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  justify-content: space-between;
  gap: 14px;
  padding: 12px 18px;
}

.table-controls__left,
.table-controls__right {
  align-items: center;
  display: flex;
  gap: 8px;
}

.rows-select {
  width: 86px;
}

.order-select {
  width: 180px;
}

.table-wrap {
  padding: 6px 18px 0;
}

.table-footer {
  align-items: center;
  display: flex;
  justify-content: center;
  padding: 8px 18px 16px;
}

@media (max-width: 1180px) {
  .page-hero,
  .table-controls,
  .table-footer {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-hero__actions {
    justify-content: flex-start;
    padding-top: 2px;
    width: 100%;
  }

  .search-field {
    width: 100%;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .page-hero__title {
    font-size: 24px;
  }

  .header-action--primary {
    flex: 1 1 100%;
    width: 100%;
  }

  .status-field,
  .rows-select,
  .order-select {
    width: 100%;
  }
}

@media (max-width: 599px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .page-divider {
    margin-inline: 14px;
  }

  .table-controls,
  .table-wrap,
  .table-footer {
    padding-inline: 14px;
  }

  .table-card {
    border-radius: 16px;
  }
}
</style>
