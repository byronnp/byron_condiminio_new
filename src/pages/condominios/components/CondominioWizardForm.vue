<template>
  <q-page class="new-condo-page">
    <div class="page-shell">
      <header class="page-header">
        <div class="page-header__heading">
          <h1 class="page-header__title">{{ pageTitle }}</h1>
          <p class="page-header__subtitle">{{ pageSubtitle }}</p>
        </div>
        <div class="page-header__actions">
          <q-btn
            flat
            no-caps
            label="Volver"
            icon="arrow_back"
            class="header-action header-action--ghost"
            @click="goBack"
          />
        </div>
      </header>
      <q-card flat bordered class="wizard-frame">
        <q-inner-loading :showing="isLoadingCondominium">
          <q-spinner color="primary" size="32px" />
        </q-inner-loading>
        <AppStepper :steps="steps" :current-step="activeStep" @select="selectStep" />
        <q-separator class="wizard-divider" />
        <div class="wizard-layout">
          <section class="wizard-main">
            <transition name="fade-slide" mode="out-in">
              <div :key="activeStep" class="wizard-stage">
                <q-form v-if="activeStep === 'info'" ref="infoFormRef" class="wizard-form"
                  ><CondominioInfoSection
                    :form="form"
                    :type-options="typeOptions"
                    :type-options-loading="typeOptionsLoading"
                    :status-radio-options="statusRadioOptions"
                    :required-rule="requiredRule"
                /></q-form>
                <q-form v-else-if="activeStep === 'location'" class="wizard-form"
                  ><CondominioLocationSection
                    :location="location"
                    :country-options="countryOptions"
                    :province-options="provinceOptions"
                    :city-options="cityOptions"
                    :country-options-loading="countryOptionsLoading"
                    :province-options-loading="provinceOptionsLoading"
                    :city-options-loading="cityOptionsLoading"
                    :required-rule="requiredRule"
                /></q-form>
                <q-form v-else-if="activeStep === 'config'" ref="configFormRef" class="wizard-form"
                  ><CondominioConfigSection
                    :config="config"
                    :currency-options="currencyOptions"
                    :characteristic-options="characteristicOptions"
                    :selected-characteristics="selectedCharacteristics"
                    :selected-characteristics-count="selectedCharacteristicsCount"
                    :logo-preview-url="logoPreviewUrl"
                    :logo-file-name="logoFileName"
                    :required-rule="requiredRule"
                    :integer-min-rule="integerMinRule"
                    @clear-logo="clearLogo"
                    @select-all-features="selectAllFeatures"
                    @clear-features="clearFeatures"
                    @toggle-feature="toggleFeature"
                /></q-form>
                <div v-else class="wizard-form">
                  <div class="step-panel step-panel--airy">
                    <div class="review-header">
                      <div class="review-header__copy">
                        <div class="section-title">Resumen final</div>
                        <div class="section-subtitle">
                          Revisa la ficha antes de guardar el condominio.
                        </div>
                      </div>
                      <q-badge
                        rounded
                        :color="isReviewReady ? 'positive' : 'warning'"
                        class="review-header__badge"
                      >
                        {{ reviewStatusLabel }}
                      </q-badge>
                    </div>
                    <div class="review-status" :class="{ 'review-status--ready': isReviewReady }">
                      <q-icon :name="isReviewReady ? 'task_alt' : 'info'" size="18px" />
                      <div class="review-status__copy">
                        <span>{{ reviewStatusMessage }}</span>
                        <div v-if="incompleteSteps.length" class="review-status__chips">
                          <button
                            v-for="step in incompleteSteps"
                            :key="step.name"
                            type="button"
                            class="review-status__chip"
                            @click="selectStep(step.name)"
                          >
                            {{ step.label }}
                          </button>
                        </div>
                      </div>
                    </div>
                    <q-banner v-if="submitError" dense rounded class="review-error-banner q-mt-md">
                      <template #avatar>
                        <q-icon name="error_outline" color="negative" />
                      </template>
                      {{ submitError }}
                    </q-banner>
                    <div class="review-identity">
                      <div class="review-identity__media">
                        <img
                          v-if="logoPreviewUrl"
                          :src="logoPreviewUrl"
                          alt="Logo del condominio"
                        />
                        <q-icon v-else name="apartment" size="34px" />
                      </div>
                      <div class="review-identity__content">
                        <div class="review-identity__eyebrow">Identidad del condominio</div>
                        <div class="review-identity__name">{{ summaryIdentityName }}</div>
                        <div class="review-identity__meta">
                          <span>{{ summaryIdentityType }}</span>
                          <span>{{ form.ruc || 'Sin RUC' }}</span>
                        </div>
                      </div>
                      <div class="review-identity__facts">
                        <div class="review-identity__fact">
                          <span>Estado</span>
                          <strong>{{ form.status }}</strong>
                        </div>
                        <div class="review-identity__fact">
                          <span>Moneda</span>
                          <strong>{{ config.currency || 'Sin moneda' }}</strong>
                        </div>
                        <div class="review-identity__fact">
                          <span>Unidades</span>
                          <strong>{{ unitsSummary }}</strong>
                        </div>
                      </div>
                    </div>
                    <div class="review-grid q-mt-md">
                      <q-card flat bordered class="review-card">
                        <q-card-section>
                          <div class="review-card__title">
                            <q-icon name="badge" size="18px" />
                            <span>Identificación</span>
                          </div>
                          <div class="review-card__list">
                            <div class="review-card__row">
                              <span>Nombre</span><strong>{{ form.name || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>RUC</span><strong>{{ form.ruc || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Tipo</span><strong>{{ form.type || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Estado</span><strong>{{ form.status }}</strong>
                            </div>
                            <div class="review-card__row review-card__row--stacked">
                              <span>Descripción</span
                              ><strong>{{ form.description || 'Sin datos' }}</strong>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                      <q-card flat bordered class="review-card">
                        <q-card-section>
                          <div class="review-card__title">
                            <q-icon name="place" size="18px" />
                            <span>Ubicación</span>
                          </div>
                          <div class="review-card__list">
                            <div class="review-card__row">
                              <span>País</span
                              ><strong>{{ selectedCountryName || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Provincia</span
                              ><strong>{{ selectedProvinceName || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Ciudad</span
                              ><strong>{{ selectedCityName || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row review-card__row--stacked">
                              <span>Dirección</span
                              ><strong>{{ location.address || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row review-card__row--stacked">
                              <span>Referencia</span
                              ><strong>{{ location.reference || 'Sin datos' }}</strong>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                      <q-card flat bordered class="review-card">
                        <q-card-section>
                          <div class="review-card__title">
                            <q-icon name="domain" size="18px" />
                            <span>Estructura y servicios</span>
                          </div>
                          <div class="review-card__list">
                            <div class="review-card__row">
                              <span>Moneda</span
                              ><strong>{{ config.currency || 'Sin moneda' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Bloques</span><strong>{{ config.towers || '0' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Casas</span><strong>{{ config.houses || '0' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Logo</span><strong>{{ logoFileName }}</strong>
                            </div>
                            <div class="review-card__row review-card__row--stacked">
                              <span>Características</span
                              ><strong>{{
                                selectedCharacteristics.length
                                  ? selectedCharacteristics
                                      .map((feature) => feature.label)
                                      .join(', ')
                                  : 'Sin seleccionar'
                              }}</strong>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
              </div>
            </transition>
            <div class="wizard-footer">
              <q-btn flat no-caps label="Cancelar" class="footer-btn" @click="goBack" />
              <div class="wizard-footer__actions">
                <q-btn
                  flat
                  no-caps
                  label="Anterior"
                  icon="arrow_back"
                  class="footer-btn footer-btn--ghost"
                  :disable="isFirstStep"
                  :loading="isSubmitting"
                  @click="previousStep"
                />
                <q-btn
                  unelevated
                  no-caps
                  :label="primaryActionLabel"
                  :icon="primaryActionIcon"
                  color="primary"
                  class="footer-btn footer-btn--primary"
                  :loading="primaryActionLoading"
                  :disable="isSubmitting"
                  @click="void handlePrimaryAction()"
                />
              </div>
            </div>
          </section>
          <aside class="wizard-aside">
            <q-card flat bordered class="summary-panel summary-panel--sticky">
              <q-card-section class="summary-panel__section">
                <div class="summary-panel__kicker">Resumen ejecutivo</div>
                <div class="summary-panel__subtitle">Identidad del condominio</div>
                <div class="summary-identity q-mt-md">
                  <div class="summary-identity__media">
                    <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="Logo del condominio" />
                    <q-icon v-else name="apartment" size="32px" />
                  </div>
                  <div class="summary-identity__copy">
                    <div class="summary-identity__name">{{ summaryIdentityName }}</div>
                    <div class="summary-identity__type">{{ summaryIdentityType }}</div>
                    <q-badge :color="form.status === 'Activo' ? 'positive' : 'grey-6'" rounded>
                      {{ form.status }}
                    </q-badge>
                  </div>
                </div>
                <div class="summary-identity-list q-mt-md">
                  <div
                    v-for="item in summaryIdentityItems"
                    :key="item.label"
                    class="summary-identity-row"
                  >
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                  </div>
                </div>
                <div
                  class="summary-identity-status q-mt-md"
                  :class="{ 'summary-identity-status--complete': isIdentitySummaryComplete }"
                >
                  <q-icon :name="isIdentitySummaryComplete ? 'task_alt' : 'info'" size="18px" />
                  <span>{{ identitySummaryMessage }}</span>
                </div>
              </q-card-section>
            </q-card>
          </aside>
        </div>
      </q-card>
    </div>
    <CondominioCreatedDialog
      v-if="!isEditMode"
      v-model="createdDialogOpen"
      :condo-name="form.name || 'Nuevo condominio'"
      :condo-type="form.type"
      :condo-status="form.status"
      @go-to-condominio="goToCondominio"
    />
  </q-page>
</template>
<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { Notify } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import AppStepper from '@/components/shared/AppStepper.vue';
import CondominioInfoSection from '@/pages/condominios/components/wizard/CondominioInfoSection.vue';
import CondominioLocationSection from '@/pages/condominios/components/wizard/CondominioLocationSection.vue';
import CondominioConfigSection from '@/pages/condominios/components/wizard/CondominioConfigSection.vue';
import { buildCondominiumPayload } from '@/composables/condominios/condominio-payload';
import { useCatalogOptions } from '@/composables/shared/useCatalogOptions';
import {
  createCondominium,
  fetchCondominiumById,
  updateCondominium,
} from '@/services/condominiums.service';
import { fetchCities, fetchCountries, fetchProvinces } from '@/services/location.service';
import { useSessionStore } from '@/stores/session.store';
import CondominioCreatedDialog from './CondominioCreatedDialog.vue';
const props = withDefaults(defineProps<{ mode?: 'create' | 'edit' }>(), { mode: 'create' });
type StepName = 'info' | 'location' | 'config' | 'review';
type ValidatableForm = { validate: () => Promise<boolean> | boolean };
type CondoForm = {
  name: string;
  ruc: string;
  type: string;
  description: string;
  status: string;
  email: string;
  phone: string;
};
type LocationForm = {
  countryCode: string;
  provinceId: number | null;
  cityId: number | null;
  address: string;
  reference: string;
};
type ConfigForm = {
  currency: string;
  towers: string;
  houses: string;
  totalUnits: string;
  logo: File | null;
  characteristics: number[];
};
type StepDefinition = { name: StepName; label: string; description?: string; icon?: string };
const router = useRouter();
const route = useRoute();
const session = useSessionStore();
// The wizard no longer asks for an administrator, in creation or in editing:
// administrators are managed separately from the condominium list ("Agregar
// administrador" row action) and from the Administradores module.
const baseSteps: StepDefinition[] = [
  { name: 'info', label: 'Información' },
  { name: 'location', label: 'Ubicación' },
  { name: 'config', label: 'Configuración' },
  { name: 'review', label: 'Resumen' },
];
const steps = computed(() => baseSteps);
const stepIndexByName = computed(
  () =>
    Object.fromEntries(steps.value.map((step, index) => [step.name, index])) as Record<
      StepName,
      number
    >,
);
const activeStep = ref<StepName>('info');
const createdDialogOpen = ref(false);
const isSubmitting = ref(false);
const isLoadingCondominium = ref(false);
const submitError = ref('');
const infoFormRef = ref<ValidatableForm | null>(null);
const configFormRef = ref<ValidatableForm | null>(null);
const form = reactive<CondoForm>({
  name: '',
  ruc: '',
  type: '',
  description: '',
  status: 'Activo',
  email: '',
  phone: '',
});
const location = reactive<LocationForm>({
  countryCode: '',
  provinceId: null,
  cityId: null,
  address: '',
  reference: '',
});
const config = reactive<ConfigForm>({
  currency: '',
  towers: '',
  houses: '',
  totalUnits: '',
  logo: null,
  characteristics: [],
});
const fallbackTypeOptions: string[] = [];
const statusRadioOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Inactivo', value: 'Inactivo' },
];
type CharacteristicOption = { id: number; value: string; label: string; icon: string };
const fallbackCharacteristicOptions: CharacteristicOption[] = [];
const featureIconMap: Record<string, string> = {
  piscina: 'pool',
  piscina_climatizada: 'pool',
  gimnasio: 'fitness_center',
  areas_comunes: 'deck',
  area_comunes: 'deck',
  area_social: 'deck',
  salon_comunal: 'event_seat',
  salón_comunal: 'event_seat',
  seguridad_24_7: 'shield',
  seguridad: 'shield',
  parqueadero: 'local_parking',
  parqueadero_de_visitas: 'local_parking',
  juegos_infantiles: 'toys',
  lavanderia: 'local_laundry_service',
  lavandería: 'local_laundry_service',
  bbq: 'outdoor_grill',
  ascensor: 'elevator',
  terraza: 'deck',
};
const countryOptions = ref<{ label: string; value: string }[]>([]);
const countryOptionsLoading = ref(false);
const provinceOptions = ref<{ label: string; value: number }[]>([]);
const provinceOptionsLoading = ref(false);
const cityOptions = ref<{ label: string; value: number }[]>([]);
const cityOptionsLoading = ref(false);
const currencyOptions = ['USD', 'EUR', 'MXN'];
const {
  options: typeOptions,
  loading: typeOptionsLoading,
  loadOptions: loadTypeOptions,
} = useCatalogOptions<string>('condominium_types', {
  fallback: fallbackTypeOptions,
  mapItem: (item) => item.name.trim() || item.code.trim() || null,
});
const { options: characteristicOptions, loadOptions: loadCharacteristicOptions } =
  useCatalogOptions<CharacteristicOption>('condominium_features', {
    fallback: fallbackCharacteristicOptions,
    mapItem: (item) => {
      const label = item.name.trim() || item.code.trim();
      if (!label) {
        return null;
      }
      return { id: item.id, value: label, label, icon: featureIconForLabel(label) };
    },
  });
const logoFileName = computed(() => config.logo?.name ?? 'Sin archivo');
const logoPreviewUrl = ref<string | null>(null);
const isHydratingCondominium = ref(false);
const isEditMode = computed(() => props.mode === 'edit');
const condominiumId = computed(() => {
  const rawId = route.params.id;
  const idValue = Array.isArray(rawId) ? rawId[0] : rawId;
  const id = Number(idValue);
  return Number.isFinite(id) && id > 0 ? id : null;
});
const pageTitle = computed(() =>
  isEditMode.value ? 'Editar condominio' : 'Crear nuevo condominio',
);
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Actualiza la información del condominio y revisa el resumen antes de guardar.'
    : 'Completa el formulario paso a paso y revisa el resumen ejecutivo a la derecha.',
);
const primaryActionLabel = computed(() =>
  isLastStep.value
    ? isEditMode.value
      ? 'Actualizar condominio'
      : 'Guardar condominio'
    : 'Siguiente',
);
const primaryActionIcon = computed(() =>
  isLastStep.value ? (isEditMode.value ? 'save' : 'check') : 'arrow_forward',
);
const primaryActionLoading = computed(() => isSubmitting.value && isLastStep.value);
let logoObjectUrl: string | null = null;
let provinceLoadToken = 0;
let cityLoadToken = 0;
async function loadCountryOptions() {
  countryOptionsLoading.value = true;
  try {
    const countries = await fetchCountries(session.accessToken);
    countryOptions.value = countries.map((country) => ({
      label: country.name,
      value: country.code,
    }));
  } catch {
    countryOptions.value = [];
  } finally {
    countryOptionsLoading.value = false;
  }
}
function normalizeFeatureLabel(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}
function featureIconForLabel(label: string) {
  const key = normalizeFeatureLabel(label);
  return featureIconMap[key] ?? 'check_circle';
}
async function loadProvinceOptions(countryCode: string) {
  const requestToken = ++provinceLoadToken;
  provinceOptionsLoading.value = true;
  try {
    const provinces = await fetchProvinces(countryCode, session.accessToken);
    if (requestToken !== provinceLoadToken) {
      return;
    }
    provinceOptions.value = provinces.map((province) => ({
      label: province.name,
      value: province.id,
    }));
  } catch {
    if (requestToken !== provinceLoadToken) {
      return;
    }
    provinceOptions.value = [];
  } finally {
    if (requestToken === provinceLoadToken) {
      provinceOptionsLoading.value = false;
    }
  }
}
async function loadCityOptions(provinceId: number) {
  const requestToken = ++cityLoadToken;
  cityOptionsLoading.value = true;
  try {
    const cities = await fetchCities(provinceId, session.accessToken);
    if (requestToken !== cityLoadToken) {
      return;
    }
    cityOptions.value = cities.map((city) => ({ label: city.name, value: city.id }));
  } catch {
    if (requestToken !== cityLoadToken) {
      return;
    }
    cityOptions.value = [];
  } finally {
    if (requestToken === cityLoadToken) {
      cityOptionsLoading.value = false;
    }
  }
}
function applyCondominiumDetail(detail: Awaited<ReturnType<typeof fetchCondominiumById>>) {
  if (!detail) {
    return;
  }
  form.name = detail.name ?? '';
  form.ruc = detail.ruc ?? '';
  form.type = detail.type ?? '';
  form.description = detail.description ?? '';
  form.status = detail.isActive ? 'Activo' : 'Inactivo';
  form.email = detail.email ?? '';
  form.phone = detail.phone ?? '';
  location.address = detail.address ?? '';
  location.reference = detail.reference ?? '';
  location.countryCode = detail.countryCode ?? '';
  config.currency = detail.currency ?? '';
  config.towers = detail.towers ?? '';
  config.houses = detail.houses ?? '';
  config.totalUnits = detail.totalUnits ?? '';
  config.characteristics = detail.characteristics.map((feature) => feature.id);
  logoPreviewUrl.value = detail.logoUrl || null;
}
async function loadCondominiumForEdit() {
  const id = condominiumId.value;
  if (!isEditMode.value || id === null) {
    return;
  }
  isHydratingCondominium.value = true;
  isLoadingCondominium.value = true;
  submitError.value = '';
  try {
    const detail = await fetchCondominiumById(id, session.accessToken);
    if (!detail) {
      throw new Error('No fue posible cargar el condominio para edición.');
    }
    applyCondominiumDetail(detail);
    if (detail.countryCode) {
      await loadProvinceOptions(detail.countryCode);
    }
    if (detail.provinceId !== null) {
      location.provinceId = detail.provinceId;
      await loadCityOptions(detail.provinceId);
    }
    if (detail.cityId !== null) {
      location.cityId = detail.cityId;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'No fue posible cargar el condominio.';
    submitError.value = message;
    Notify.create({ type: 'negative', message, position: 'top-right' });
  } finally {
    isLoadingCondominium.value = false;
    isHydratingCondominium.value = false;
  }
}
onMounted(() => {
  void loadTypeOptions(session.accessToken);
  void loadCharacteristicOptions(session.accessToken);
  void loadCountryOptions();
  void loadCondominiumForEdit();
});
watch(
  () => location.countryCode,
  async (countryCode) => {
    if (isHydratingCondominium.value) {
      return;
    }
    provinceLoadToken += 1;
    cityLoadToken += 1;
    location.provinceId = null;
    location.cityId = null;
    provinceOptions.value = [];
    cityOptions.value = [];
    if (!countryCode) {
      return;
    }
    await loadProvinceOptions(countryCode);
  },
);
watch(
  () => location.provinceId,
  async (provinceId) => {
    if (isHydratingCondominium.value) {
      return;
    }
    cityLoadToken += 1;
    location.cityId = null;
    cityOptions.value = [];
    if (!provinceId) {
      return;
    }
    await loadCityOptions(provinceId);
  },
);
const selectedCountryName = computed(() => {
  const selected = countryOptions.value.find((option) => option.value === location.countryCode);
  return selected?.label ?? '';
});
const selectedProvinceName = computed(() => {
  const selected = provinceOptions.value.find((option) => option.value === location.provinceId);
  return selected?.label ?? '';
});
const selectedCityName = computed(() => {
  const selected = cityOptions.value.find((option) => option.value === location.cityId);
  return selected?.label ?? '';
});
watch(
  () => config.logo,
  (file) => {
    if (logoObjectUrl) {
      URL.revokeObjectURL(logoObjectUrl);
      logoObjectUrl = null;
    }
    logoPreviewUrl.value = file ? URL.createObjectURL(file) : null;
    logoObjectUrl = logoPreviewUrl.value;
  },
  { immediate: true },
);
onBeforeUnmount(() => {
  if (logoObjectUrl) {
    URL.revokeObjectURL(logoObjectUrl);
  }
});
function toggleFeature(value: string) {
  const feature = characteristicOptions.value.find((item) => item.value === value);
  if (!feature) {
    return;
  }
  const index = config.characteristics.indexOf(feature.id);
  if (index === -1) {
    config.characteristics.push(feature.id);
    return;
  }
  config.characteristics.splice(index, 1);
}
function selectAllFeatures() {
  config.characteristics = [...characteristicOptions.value.map((feature) => feature.id)];
}
function clearFeatures() {
  config.characteristics = [];
}
function clearLogo() {
  config.logo = null;
}
const summaryIdentityName = computed(() => form.name.trim() || 'Nuevo condominio');
const summaryIdentityType = computed(() => form.type || 'Sin tipo');
const unitsSummary = computed(() => {
  const houses = config.houses.trim() || '0';
  const towers = config.towers.trim() || '0';
  const totalUnits = config.totalUnits.trim() || '0';
  return `${totalUnits} unidades · ${houses} casas · ${towers} torres`;
});
const summaryIdentityItems = computed(() => [
  { label: 'Nombre', value: summaryIdentityName.value },
  { label: 'Tipo', value: summaryIdentityType.value },
  { label: 'Unidades', value: unitsSummary.value },
  { label: 'Moneda', value: config.currency || 'Sin moneda' },
  { label: 'Estado', value: form.status },
]);
const selectedCharacteristics = computed(() =>
  characteristicOptions.value.filter((feature) => config.characteristics.includes(feature.id)),
);
const selectedCharacteristicsCount = computed(() => selectedCharacteristics.value.length);
const isIdentitySummaryComplete = computed(() =>
  Boolean(
    form.name &&
    form.type &&
    config.houses &&
    config.towers &&
    config.totalUnits &&
    config.currency &&
    form.status,
  ),
);
const identitySummaryMessage = computed(() =>
  isIdentitySummaryComplete.value
    ? 'Identidad básica completa.'
    : 'Completa nombre, tipo, unidades y moneda para finalizar la ficha.',
);
const currentStepIndex = computed(() => stepIndexByName.value[activeStep.value] ?? 0);
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1);
function goBack() {
  router.back();
}
function toText(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : '';
}
function previousStep() {
  if (isFirstStep.value) {
    return;
  }
  activeStep.value = steps.value[currentStepIndex.value - 1]?.name ?? 'info';
}
function nextStep() {
  if (isLastStep.value) {
    return;
  }
  activeStep.value = steps.value[currentStepIndex.value + 1]?.name ?? 'review';
}
function selectStep(step: string | number) {
  activeStep.value = step as StepName;
}
function requiredRule(value: unknown) {
  return toText(value).trim() ? true : 'Campo requerido';
}
function integerMinRule(min: number) {
  return (value: unknown) => {
    const text = toText(value).trim();
    if (!text) {
      return 'Campo requerido';
    }
    const numericValue = Number(text);
    if (!Number.isInteger(numericValue)) {
      return 'Ingresa un número entero';
    }
    return numericValue >= min ? true : `Debe ser mayor o igual a ${min}`;
  };
}
function isInfoValid() {
  return Boolean(form.name && form.ruc && form.type && form.status);
}
function isLocationValid() {
  return Boolean(
    location.countryCode &&
    location.provinceId !== null &&
    location.cityId !== null &&
    location.address,
  );
}
function isConfigValid() {
  return Boolean(config.currency && config.towers && config.houses && config.totalUnits);
}
const isReviewReady = computed(() => isInfoValid() && isLocationValid() && isConfigValid());
const stepValidators: Partial<Record<Exclude<StepName, 'review'>, () => boolean>> = {
  info: isInfoValid,
  location: isLocationValid,
  config: isConfigValid,
};
const incompleteSteps = computed(() =>
  steps.value.filter((step) => step.name !== 'review' && !(stepValidators[step.name]?.() ?? true)),
);
const reviewStatusLabel = computed(() =>
  isReviewReady.value ? 'Listo para guardar' : 'Pendiente',
);
const reviewStatusMessage = computed(() =>
  isReviewReady.value
    ? 'La información mínima requerida está completa. Puedes guardar el condominio.'
    : 'Aún falta completar información requerida en uno o más pasos antes de guardar.',
);
async function validateStep(step: StepName) {
  if (step === 'review') {
    return isReviewReady.value;
  }
  const formRefMap: Partial<
    Record<Exclude<StepName, 'review'>, { value: ValidatableForm | null }>
  > = { info: infoFormRef, config: configFormRef };
  const refValue = formRefMap[step]?.value;
  if (refValue) {
    const result = await refValue.validate();
    return Boolean(result);
  }
  if (step === 'info') {
    return isInfoValid();
  }
  if (step === 'location') {
    return isLocationValid();
  }
  return step === 'config' ? isConfigValid() : true;
}
async function submitCondominium() {
  if (isSubmitting.value) {
    return false;
  }
  isSubmitting.value = true;
  submitError.value = '';
  try {
    const payload = buildCondominiumPayload({ form, location, config });
    const id = condominiumId.value;
    const result = isEditMode.value
      ? await (async () => {
          if (id === null) {
            throw new Error('El identificador del condominio no es válido.');
          }
          return updateCondominium(id, payload, session.accessToken);
        })()
      : await createCondominium(payload, session.accessToken);
    if (!result.success) {
      throw new Error(result.message);
    }
    if (isEditMode.value) {
      Notify.create({
        type: 'positive',
        message: result.message || 'Condominio actualizado correctamente.',
        position: 'top-right',
      });
      await router.push('/condominios');
    } else {
      window.dispatchEvent(new Event('condominiums:changed'));
      createdDialogOpen.value = true;
    }
    return true;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : isEditMode.value
          ? 'No fue posible actualizar el condominio.'
          : 'No fue posible crear el condominio.';
    submitError.value = message;
    Notify.create({ type: 'negative', message, position: 'top-right' });
    return false;
  } finally {
    isSubmitting.value = false;
  }
}
async function handlePrimaryAction() {
  if (activeStep.value === 'review') {
    if (await validateStep('review')) {
      await submitCondominium();
    }
    return;
  }
  const valid = await validateStep(activeStep.value);
  if (!valid) {
    return;
  }
  nextStep();
}
function goToCondominio() {
  void router.push({ name: 'condominios' });
}
</script>
<style scoped>
.new-condo-page {
  min-height: 100%;
  padding: 16px 0 0;
}
.page-shell {
  display: grid;
  gap: 18px;
  width: 100%;
}
.page-header {
  align-items: end;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}
.page-header__title {
  color: var(--app-text);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
}
.page-header__subtitle {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.5;
  margin: 6px 0 0;
}
.wizard-frame {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  overflow: hidden;
}
.wizard-divider {
  margin-top: 16px;
}
.wizard-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
  padding: 18px;
}
.wizard-main {
  min-width: 0;
}
.wizard-stage {
  display: grid;
  gap: 18px;
}
.wizard-form {
  display: grid;
  gap: 18px;
  width: 100%;
}
.step-panel,
.summary-panel,
.review-card {
  border-radius: 18px;
  overflow: hidden;
}
.step-panel > .section-title,
.step-panel > .section-subtitle,
.step-panel > .field-group {
  width: 100%;
}
.review-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}
.review-header {
  align-items: flex-start;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}
.review-header__copy {
  min-width: 0;
}
.review-header__badge {
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 10px;
}
.review-status {
  align-items: flex-start;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.16);
  border-radius: 16px;
  color: #a16207;
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding: 12px 14px;
}
.review-status--ready {
  background: rgba(34, 197, 94, 0.09);
  border-color: rgba(34, 197, 94, 0.16);
  color: var(--app-success);
}
.review-status span {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}
.review-status__copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.review-status__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.review-status__chip {
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(161, 98, 7, 0.28);
  border-radius: 999px;
  color: #a16207;
  cursor: pointer;
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;
}
.review-status__chip:hover {
  background: rgba(255, 255, 255, 0.95);
  border-color: rgba(161, 98, 7, 0.42);
}
.review-identity {
  align-items: center;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(255, 255, 255, 0.92)), #fff;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 20px;
  display: grid;
  gap: 16px;
  grid-template-columns: auto minmax(0, 1fr) minmax(260px, 0.8fr);
  margin-top: 14px;
  padding: 16px;
}
.review-identity__media {
  align-items: center;
  background:
    radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.9), rgba(37, 99, 235, 0.12)),
    linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.06));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 18px;
  color: var(--app-primary);
  display: flex;
  height: 72px;
  justify-content: center;
  overflow: hidden;
  width: 72px;
}
.review-identity__media img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}
.review-identity__content {
  display: grid;
  gap: 6px;
  min-width: 0;
}
.review-identity__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.review-identity__name {
  color: var(--app-text);
  font-size: 18px;
  font-weight: 850;
  line-height: 1.18;
  overflow-wrap: anywhere;
}
.review-identity__meta {
  color: var(--app-text-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 700;
  gap: 8px;
  line-height: 1.3;
}
.review-identity__meta span + span::before {
  content: '•';
  margin-right: 8px;
}
.review-identity__facts {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}
.review-identity__fact {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 10px 12px;
}
.review-identity__fact span {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
}
.review-identity__fact strong {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 850;
  line-height: 1.25;
  overflow-wrap: anywhere;
}
.review-card__title {
  align-items: center;
  color: var(--app-text);
  display: flex;
  font-size: 12px;
  font-weight: 800;
  gap: 8px;
  margin-bottom: 12px;
}
.review-card__title .q-icon {
  color: var(--app-primary);
}
.review-card__list {
  display: grid;
  gap: 0;
}
.review-card__row {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(92px, 0.78fr) minmax(0, 1.22fr);
  padding: 9px 0;
}
.review-card__row + .review-card__row {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}
.review-card__row--stacked {
  grid-template-columns: minmax(0, 1fr);
  gap: 5px;
}
.review-card__list span {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 750;
  line-height: 1.35;
}
.review-card__list strong {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.4;
  overflow-wrap: anywhere;
  text-align: right;
}
.review-card__row--stacked strong {
  text-align: left;
}
.wizard-footer {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}
.wizard-footer__actions {
  display: flex;
  gap: 10px;
}
.footer-btn {
  border-radius: 12px;
  min-height: 40px;
  padding-inline: 14px;
}
.footer-btn--ghost {
  color: var(--app-text-muted);
}
.footer-btn--primary {
  min-width: 160px;
}
.wizard-aside {
  min-width: 0;
}
.summary-panel {
  position: sticky;
  top: 18px;
}
.summary-panel__section {
  display: grid;
}
.summary-panel__kicker {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.summary-panel__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}
.summary-identity {
  align-items: center;
  display: flex;
  gap: 14px;
}
.summary-identity__media {
  align-items: center;
  background:
    radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.86), rgba(37, 99, 235, 0.12)),
    linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.06));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 18px;
  color: var(--app-primary);
  display: inline-flex;
  flex: 0 0 68px;
  height: 68px;
  justify-content: center;
  overflow: hidden;
  width: 68px;
}
.summary-identity__media img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}
.summary-identity__copy {
  align-content: center;
  display: grid;
  gap: 7px;
  min-width: 0;
}
.summary-identity__name {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}
.summary-identity__type {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}
.summary-identity-list {
  background: rgba(248, 250, 252, 0.76);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: grid;
  overflow: hidden;
}
.summary-identity-row {
  align-items: start;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(74px, 0.7fr) minmax(0, 1.3fr);
  padding: 12px 14px;
}
.summary-identity-row + .summary-identity-row {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}
.summary-identity-row span {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-transform: uppercase;
}
.summary-identity-row strong {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
  text-align: right;
}
.summary-identity-status {
  align-items: flex-start;
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: 16px;
  color: var(--app-primary);
  display: flex;
  gap: 10px;
  padding: 12px 14px;
}
.summary-identity-status--complete {
  background: rgba(34, 197, 94, 0.09);
  border-color: rgba(34, 197, 94, 0.16);
  color: var(--app-success);
}
.review-error-banner {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
}
.summary-identity-status span {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
}
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
@media (max-width: 1120px) {
  .wizard-layout {
    grid-template-columns: minmax(0, 1fr);
  }
  .review-identity {
    grid-template-columns: auto minmax(0, 1fr);
  }
  .review-identity__facts {
    grid-column: 1 / -1;
  }
  .summary-panel {
    position: static;
  }
}
@media (max-width: 720px) {
  .new-condo-page {
    padding: 12px 0 0;
  }
  .page-header {
    align-items: start;
    flex-direction: column;
  }
  .review-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .review-header {
    flex-direction: column;
  }
  .review-header__badge {
    align-self: flex-start;
  }
  .review-identity {
    align-items: stretch;
    grid-template-columns: minmax(0, 1fr);
  }
  .review-identity__media {
    height: 64px;
    width: 64px;
  }
  .review-identity__facts {
    grid-template-columns: minmax(0, 1fr);
  }
  .step-panel,
  .review-card :deep(.q-card__section) {
    padding: 16px;
  }
  .wizard-footer {
    align-items: stretch;
    flex-direction: column;
  }
  .wizard-footer__actions {
    flex-direction: column;
  }
  .footer-btn--primary {
    min-width: 0;
    width: 100%;
  }
}
</style>
