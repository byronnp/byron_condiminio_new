<template>
  <div class="app-stats-cards" :style="gridStyle">
    <q-card
      v-for="(card, index) in normalizedCards"
      :key="card.key ?? `${card.label}-${index}`"
      flat
      bordered
      class="app-stats-card"
    >
      <q-card-section class="app-stats-card__content">
        <div
          class="app-stats-card__icon"
          :style="{ background: card.tint.bg, color: card.tint.fg }"
        >
          <q-icon :name="card.icon" size="22px" />
        </div>

        <div class="app-stats-card__copy">
          <div class="app-stats-card__label">{{ card.label }}</div>
          <div class="app-stats-card__value">{{ card.value }}</div>
          <div class="app-stats-card__hint">{{ card.hint }}</div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

type StatsTint = {
  bg: string;
  fg: string;
};

export type AppStatsCard = {
  key?: string | number;
  label: string;
  value: string;
  hint?: string;
  icon: string;
  tint?: StatsTint;
};

const props = withDefaults(
  defineProps<{
    cards: ReadonlyArray<AppStatsCard>;
    columns?: number;
  }>(),
  {
    columns: 4,
  },
);

const palette = [
  { bg: 'rgba(37, 99, 235, 0.12)', fg: '#2563eb' },
  { bg: 'rgba(34, 197, 94, 0.12)', fg: '#16a34a' },
  { bg: 'rgba(249, 115, 22, 0.14)', fg: '#ea580c' },
  { bg: 'rgba(124, 58, 237, 0.12)', fg: '#7c3aed' },
] as const;

const normalizedCards = computed(() =>
  props.cards.map((card, index) => ({
    ...card,
    hint: card.hint ?? '',
    tint: card.tint ?? palette[index % palette.length]!,
  })),
);

const gridStyle = computed(() => ({
  '--app-stats-columns': String(props.columns),
}));
</script>

<style scoped>
.app-stats-cards {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(var(--app-stats-columns), minmax(0, 1fr));
  width: 100%;
}

.app-stats-card {
  border-radius: var(--app-radius-lg);
}

.app-stats-card__content {
  align-items: center;
  display: flex;
  gap: 12px;
  min-height: 94px;
}

.app-stats-card__icon {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  flex-shrink: 0;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.app-stats-card__copy {
  min-width: 0;
}

.app-stats-card__label {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
}

.app-stats-card__value {
  color: var(--app-text);
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin-top: 2px;
}

.app-stats-card__hint {
  color: var(--app-text-muted);
  font-size: 11px;
  margin-top: 1px;
}

@media (max-width: 1180px) {
  .app-stats-cards {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 599px) {
  .app-stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>
