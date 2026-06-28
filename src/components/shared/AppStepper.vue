<template>
  <nav class="app-stepper" aria-label="Progreso del formulario">
    <template v-for="(step, index) in steps" :key="step.key">
      <button
        type="button"
        class="app-stepper__step"
        :aria-pressed="isActive(step)"
        :aria-current="isActive(step) ? 'step' : undefined"
        :aria-label="getStepAriaLabel(step, index)"
        :class="{
          'app-stepper__step--active': isActive(step),
          'app-stepper__step--done': isCompleted(step),
          'app-stepper__step--clickable': clickable && !step.disabled,
          'app-stepper__step--disabled': step.disabled,
        }"
        :disabled="step.disabled"
        @click="handleStepClick(step)"
      >
        <span class="app-stepper__number">
          <q-icon v-if="isCompleted(step)" name="check" size="14px" />
          <q-icon v-else-if="step.icon" :name="step.icon" size="13px" />
          <span v-else>{{ index + 1 }}</span>
        </span>

        <span class="app-stepper__copy">
          <span class="app-stepper__label">{{ resolveLabel(step) }}</span>
          <span v-if="step.description" class="app-stepper__description">
            {{ step.description }}
          </span>
        </span>
      </button>

      <span
        v-if="index < steps.length - 1"
        class="app-stepper__connector"
        :class="{ 'app-stepper__connector--active': index < currentStepIndex }"
        aria-hidden="true"
      />
    </template>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export type AppStepperItem = {
  key?: string | number;
  name?: string | number;
  label?: string;
  title?: string;
  description?: string;
  icon?: string;
  disabled?: boolean;
  ariaLabel?: string;
};

const props = withDefaults(
  defineProps<{
    steps: ReadonlyArray<AppStepperItem>;
    currentStep: string | number;
    clickable?: boolean;
  }>(),
  {
    clickable: true,
  },
);

const emit = defineEmits<{
  (event: 'select', step: string | number): void;
  (event: 'update:currentStep', step: string | number): void;
}>();

const currentStepIndex = computed(() =>
  props.steps.findIndex((step) => resolveStepKey(step) === props.currentStep),
);

function isActive(step: AppStepperItem) {
  return resolveStepKey(step) === props.currentStep;
}

function isCompleted(step: AppStepperItem) {
  const index = props.steps.findIndex((item) => resolveStepKey(item) === resolveStepKey(step));
  return currentStepIndex.value > -1 && index > -1 && index < currentStepIndex.value;
}

function resolveLabel(step: AppStepperItem) {
  return step.label ?? step.title ?? '';
}

function resolveStepKey(step: AppStepperItem) {
  return step.key ?? step.name ?? '';
}

function getStepAriaLabel(step: AppStepperItem, index: number) {
  const label = resolveLabel(step);
  if (step.ariaLabel) {
    return step.ariaLabel;
  }

  return step.description ? `Paso ${index + 1}: ${label}. ${step.description}` : `Paso ${index + 1}: ${label}`;
}

function handleStepClick(step: AppStepperItem) {
  if (!props.clickable || step.disabled) {
    return;
  }

  const stepKey = resolveStepKey(step);
  emit('select', stepKey);
  emit('update:currentStep', stepKey);
}
</script>

<style scoped>
.app-stepper {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  max-width: max-content;
  padding: 14px 16px 0;
}

.app-stepper__step {
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
  min-height: 38px;
  width: auto;
  padding: 0 11px;
  position: relative;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease,
    background-color 0.18s ease,
    color 0.18s ease;
}

.app-stepper__step:hover,
.app-stepper__step:focus-visible {
  border-color: rgba(37, 99, 235, 0.16);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
  outline: none;
  transform: translateY(-1px);
}

.app-stepper__step--active {
  border-color: rgba(37, 99, 235, 0.22);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  color: var(--app-primary);
}

.app-stepper__step--done {
  background: rgba(37, 99, 235, 0.04);
}

.app-stepper__step--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.app-stepper__number {
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 999px;
  color: var(--app-primary);
  display: inline-flex;
  font-size: 11px;
  font-weight: 800;
  height: 22px;
  justify-content: center;
  width: 22px;
}

.app-stepper__step--active .app-stepper__number {
  background: var(--app-primary);
  color: #fff;
}

.app-stepper__step--done .app-stepper__number {
  background: var(--app-primary);
  color: #fff;
}

.app-stepper__copy {
  align-items: start;
  display: grid;
  gap: 2px;
  min-width: 0;
}

.app-stepper__label {
  font-size: 11px;
  font-weight: 800;
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-stepper__description {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-stepper__step--active .app-stepper__description,
.app-stepper__step--done .app-stepper__description {
  color: var(--app-text);
}

.app-stepper__connector {
  background: rgba(148, 163, 184, 0.28);
  border-radius: 999px;
  flex: 0 0 24px;
  height: 3px;
  min-width: 24px;
  overflow: hidden;
  position: relative;
}

.app-stepper__connector::before {
  background: var(--app-primary);
  border-radius: inherit;
  content: '';
  inset: 0;
  position: absolute;
  transform: scaleX(0);
  transform-origin: left center;
  transition: transform 0.22s ease;
}

.app-stepper__connector--active::before {
  transform: scaleX(1);
}

@media (max-width: 720px) {
  .app-stepper {
    max-width: 100%;
    overflow-x: auto;
    padding: 12px 14px 0;
    scrollbar-width: none;
  }

  .app-stepper::-webkit-scrollbar {
    display: none;
  }

  .app-stepper__step {
    flex: 0 0 auto;
  }

  .app-stepper__connector {
    flex-basis: 24px;
  }
}
</style>
