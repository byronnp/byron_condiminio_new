<template>
  <q-page class="new-condo-page">
    <div class="page-shell">
      <header class="page-header">
        <div class="page-header__heading">
          <h1 class="page-header__title">Crear nuevo condominio</h1>
          <p class="page-header__subtitle">
            Completa el formulario paso a paso y revisa el resumen ejecutivo a la derecha.
          </p>
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
        <div class="wizard-steps">
          <button
            v-for="(step, index) in steps"
            :key="step.name"
            type="button"
            class="wizard-step"
            :aria-pressed="activeStep === step.name"
            :class="{
              'wizard-step--active': activeStep === step.name,
              'wizard-step--done': stepIndexByName[step.name] < currentStepIndex,
            }"
            @click="activeStep = step.name"
          >
            <span class="wizard-step__number">{{ index + 1 }}</span>
            <span class="wizard-step__label">{{ step.label }}</span>
          </button>
        </div>

        <q-separator class="wizard-divider" />

        <div class="wizard-layout">
          <section class="wizard-main">
            <transition name="fade-slide" mode="out-in">
              <div :key="activeStep" class="wizard-stage">
                <q-form
                  v-if="activeStep === 'info'"
                  ref="infoFormRef"
                  class="wizard-form"
                >
                  <div class="step-panel step-panel--airy">
                    <div class="field-group location-layout__panel location-panel info-panel">
                      <div class="location-panel__header">
                        <div class="location-panel__heading">
                          <q-icon name="apartment" size="18px" />
                          <span>Información general</span>
                        </div>
                        <div class="location-panel__hint">
                          Define la identidad del condominio antes de continuar.
                        </div>
                      </div>

                      <div class="step-grid">
                        <q-input
                          v-model="form.name"
                          class="step-field"
                          dense
                          outlined
                          hide-bottom-space
                          label="Nombre del condominio *"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="form.ruc"
                          class="step-field"
                          dense
                          outlined
                          hide-bottom-space
                          label="RUC del condominio *"
                          :rules="[requiredRule]"
                        />
                        <q-select
                          v-model="form.type"
                          class="step-field"
                          dense
                          outlined
                          hide-bottom-space
                          :options="typeOptions"
                          label="Tipo de condominio *"
                          :rules="[requiredRule]"
                        />
                        <div class="step-field step-field--status">
                          <div class="field-label">Estado *</div>
                          <q-option-group
                            v-model="form.status"
                            :options="statusRadioOptions"
                            color="primary"
                            inline
                            dense
                            type="radio"
                          />
                        </div>
                        <q-input
                          v-model="form.description"
                          class="step-field step-field--full"
                          dense
                          outlined
                          hide-bottom-space
                          type="textarea"
                          autogrow
                          label="Descripción"
                        />
                      </div>
                    </div>
                  </div>
                </q-form>

                <q-form
                  v-else-if="activeStep === 'location'"
                  class="wizard-form"
                >
                  <div class="step-panel step-panel--airy">
                      <div class="section-title">Ubicación</div>
                      <div class="section-subtitle">
                        Define la dirección y la georreferencia del condominio.
                      </div>

                      <div class="location-layout q-mt-md">
                        <div class="field-group location-layout__panel location-panel">
                          <div class="location-panel__header">
                            <div class="location-panel__heading">
                              <q-icon name="public" size="18px" />
                              <span>Ubicación geográfica</span>
                            </div>
                            <div class="location-panel__hint">
                              Completa la dirección base para ubicar el condominio en el sistema.
                            </div>
                          </div>

                          <div class="location-panel__meta">
                            <div class="location-panel__chip">
                              <span class="location-panel__chip-label">País</span>
                              <span class="location-panel__chip-value">
                                {{ location.country || 'Sin definir' }}
                              </span>
                            </div>
                            <div class="location-panel__chip">
                              <span class="location-panel__chip-label">Provincia</span>
                              <span class="location-panel__chip-value">
                                {{ location.province || 'Sin definir' }}
                              </span>
                            </div>
                            <div class="location-panel__chip">
                              <span class="location-panel__chip-label">Ciudad</span>
                              <span class="location-panel__chip-value">
                                {{ location.city || 'Sin definir' }}
                              </span>
                            </div>
                          </div>

                          <div class="step-grid">
                            <q-select
                              v-model="location.country"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              :options="countryOptions"
                              label="País *"
                              :rules="[requiredRule]"
                            />
                            <q-select
                              v-model="location.province"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              :options="provinceOptions"
                              label="Provincia *"
                              :rules="[requiredRule]"
                            />
                            <q-select
                              v-model="location.city"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              :options="cityOptions"
                              label="Ciudad *"
                              :rules="[requiredRule]"
                            />
                            <q-input
                              v-model="location.direction"
                              class="step-field step-field--full"
                              dense
                              outlined
                              hide-bottom-space
                              label="Dirección *"
                              :rules="[requiredRule]"
                            />
                            <q-input
                              v-model="location.reference"
                              class="step-field step-field--full"
                              dense
                              outlined
                              hide-bottom-space
                              type="textarea"
                              autogrow
                              label="Referencia"
                            />
                          </div>
                        </div>

                        <div class="field-group location-layout__panel location-panel location-panel--map">
                          <div class="location-panel__header">
                            <div class="location-panel__heading">
                              <q-icon name="place" size="18px" />
                              <span>Georreferenciación</span>
                            </div>
                            <div class="location-panel__hint">
                              Revisa el mapa y ajusta el punto de referencia sin salir del flujo de registro.
                            </div>
                          </div>

                          <div class="map-preview">
                            <div class="map-preview__top">
                              <div>
                                <div class="map-preview__title">Ubicación en mapa</div>
                                <div class="map-preview__subtitle">
                                  Selecciona o ajusta la posición exacta del condominio.
                                </div>
                              </div>
                              <q-btn flat dense no-caps icon="place" label="Abrir mapa" />
                            </div>

                            <div class="map-preview__meta">
                              <div class="map-preview__chip">
                                <span class="map-preview__chip-label">Estado</span>
                                <span class="map-preview__chip-value">Pendiente de georreferencia</span>
                              </div>
                              <div class="map-preview__chip">
                                <span class="map-preview__chip-label">Punto</span>
                                <span class="map-preview__chip-value">
                                  {{ location.reference ? 'Referencia cargada' : 'Sin referencia' }}
                                </span>
                              </div>
                            </div>

                            <div class="map-preview__canvas">
                              <div class="map-preview__grid"></div>
                              <div class="map-preview__halo"></div>
                              <div class="map-preview__pin">
                                <q-icon name="location_on" size="24px" />
                              </div>
                              <div class="map-preview__legend">Mapa interactivo de referencia</div>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </q-form>

                <q-form
                  v-else-if="activeStep === 'config'"
                  ref="configFormRef"
                  class="wizard-form"
                >
                  <div class="step-panel step-panel--airy">
                      <div class="section-title">Configuración</div>
                      <div class="section-subtitle">
                        Ajusta la estructura básica, identidad visual y características.
                      </div>

                      <div class="config-layout q-mt-md">
                        <div class="field-group location-layout__panel location-panel config-panel">
                          <div class="location-panel__header">
                            <div class="location-panel__heading">
                              <q-icon name="layers" size="18px" />
                              <span>Estructura base</span>
                            </div>
                            <div class="location-panel__hint">
                              Define la base operativa del condominio antes de continuar.
                            </div>
                          </div>

                          <div class="step-grid">
                            <q-select
                              v-model="config.currency"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              :options="currencyOptions"
                              label="Moneda *"
                              :rules="[requiredRule]"
                            />
                            <q-input
                              v-model="config.towers"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              type="number"
                              label="Número de bloques o torres *"
                              :rules="[requiredRule, integerMinRule(1)]"
                            />
                            <q-input
                              v-model="config.houses"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              type="number"
                              label="Número de casas *"
                              :rules="[requiredRule, integerMinRule(1)]"
                            />
                          </div>
                        </div>

                        <div class="field-group location-layout__panel location-panel config-panel config-panel--visual">
                          <div class="location-panel__header">
                            <div class="location-panel__heading">
                              <q-icon name="palette" size="18px" />
                              <span>Identidad y servicios</span>
                            </div>
                            <div class="location-panel__hint">
                              Refuerza la identidad visual y las amenidades visibles del condominio.
                            </div>
                          </div>

                          <div class="logo-upload logo-upload--premium">
                            <div class="logo-upload__preview">
                              <div class="logo-upload__artwork">
                                <img
                                  v-if="logoPreviewUrl"
                                  :src="logoPreviewUrl"
                                  alt="Vista previa del logo del condominio"
                                />
                                <q-icon v-else name="image" size="30px" />
                              </div>
                            </div>
                            <q-file
                              v-model="config.logo"
                              class="logo-upload__dropzone"
                              accept="image/*"
                              dense
                              outlined
                              hide-bottom-space
                              label="Arrastra o selecciona el logo"
                            >
                              <template #prepend>
                                <q-icon name="cloud_upload" />
                              </template>
                              <template #append>
                                <q-badge outline color="primary" rounded>Subir</q-badge>
                              </template>
                            </q-file>
                          </div>

                          <div class="field-group config-panel__subgroup q-mt-md">
                            <div class="field-group__title">Características</div>
                            <div class="feature-grid">
                              <q-btn
                                v-for="feature in characteristicOptions"
                                :key="feature.value"
                                flat
                                no-caps
                                class="feature-toggle"
                                :class="{ 'feature-toggle--active': isFeatureSelected(feature.value) }"
                                @click="toggleFeature(feature.value)"
                              >
                                <q-icon :name="feature.icon" size="18px" />
                                <span>{{ feature.label }}</span>
                              </q-btn>
                            </div>
                          </div>
                        </div>
                      </div>
                  </div>
                </q-form>

                <q-form
                  v-else-if="activeStep === 'admin'"
                  ref="adminFormRef"
                  class="wizard-form"
                >
                  <div class="step-panel">
                      <div class="section-title">Administrador principal</div>
                      <div class="section-subtitle">
                        Define quién administrará el acceso y la operación inicial.
                      </div>

                      <div class="admin-layout q-mt-md">
                        <div class="field-group location-layout__panel location-panel admin-panel">
                          <div class="location-panel__header">
                            <div class="location-panel__heading">
                              <q-icon name="badge" size="18px" />
                              <span>Datos del administrador</span>
                            </div>
                            <div class="location-panel__hint">
                              Captura la información del usuario que gestionará el condominio.
                            </div>
                          </div>

                          <div class="step-grid">
                            <q-input
                              v-model="administrator.name"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              label="Nombres *"
                              :rules="[requiredRule]"
                            />
                            <q-input
                              v-model="administrator.lastName"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              label="Apellidos *"
                              :rules="[requiredRule]"
                            />
                            <q-input
                              v-model="administrator.email"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              type="email"
                              label="Correo electrónico *"
                              :rules="[requiredRule, emailRule]"
                            />
                            <q-input
                              v-model="administrator.phone"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              label="Teléfono"
                              :rules="[phoneRule]"
                            />
                          </div>
                        </div>

                        <div class="field-group location-layout__panel location-panel admin-panel admin-panel--access">
                          <div class="location-panel__header">
                            <div class="location-panel__heading">
                              <q-icon name="vpn_key" size="18px" />
                              <span>Acceso inicial</span>
                            </div>
                            <div class="location-panel__hint">
                              Crea las credenciales temporales para el primer ingreso.
                            </div>
                          </div>

                          <div class="step-grid">
                            <q-input
                              v-model="administrator.username"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              label="Usuario *"
                              :rules="[requiredRule, minLengthRule(4)]"
                            />
                            <q-input
                              v-model="administrator.password"
                              class="step-field"
                              dense
                              outlined
                              hide-bottom-space
                              :type="showPassword ? 'text' : 'password'"
                              label="Contraseña temporal *"
                              :rules="[requiredRule, minLengthRule(8)]"
                            >
                              <template #append>
                                <q-btn
                                  flat
                                  round
                                  dense
                                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                                  @click="showPassword = !showPassword"
                                />
                              </template>
                            </q-input>
                          </div>
                        </div>
                      </div>
                  </div>
                </q-form>

                <div v-else class="wizard-form">
                  <div class="step-panel step-panel--airy">
                      <div class="section-title">Resumen final</div>
                      <div class="section-subtitle">
                        Revisa la ficha antes de guardar el condominio.
                      </div>

                      <div class="review-grid q-mt-md">
                        <q-card flat bordered class="review-card">
                          <q-card-section>
                            <div class="review-card__title">Información general</div>
                            <div class="review-card__list">
                              <div><span>Nombre:</span><strong>{{ form.name || 'Sin datos' }}</strong></div>
                              <div><span>RUC:</span><strong>{{ form.ruc || 'Sin datos' }}</strong></div>
                              <div><span>Tipo:</span><strong>{{ form.type || 'Sin datos' }}</strong></div>
                              <div><span>Estado:</span><strong>{{ form.status }}</strong></div>
                              <div><span>Descripción:</span><strong>{{ form.description || 'Sin datos' }}</strong></div>
                            </div>
                          </q-card-section>
                        </q-card>

                        <q-card flat bordered class="review-card">
                          <q-card-section>
                            <div class="review-card__title">Ubicación</div>
                            <div class="review-card__list">
                              <div><span>País:</span><strong>{{ location.country || 'Sin datos' }}</strong></div>
                              <div><span>Provincia:</span><strong>{{ location.province || 'Sin datos' }}</strong></div>
                              <div><span>Ciudad:</span><strong>{{ location.city || 'Sin datos' }}</strong></div>
                              <div><span>Dirección:</span><strong>{{ location.direction || 'Sin datos' }}</strong></div>
                              <div><span>Referencia:</span><strong>{{ location.reference || 'Sin datos' }}</strong></div>
                            </div>
                          </q-card-section>
                        </q-card>

                        <q-card flat bordered class="review-card">
                          <q-card-section>
                            <div class="review-card__title">Configuración</div>
                            <div class="review-card__list">
                              <div><span>Moneda:</span><strong>{{ config.currency || 'Sin moneda' }}</strong></div>
                              <div><span>Bloques:</span><strong>{{ config.towers || '0' }}</strong></div>
                              <div><span>Casas:</span><strong>{{ config.houses || '0' }}</strong></div>
                              <div><span>Logo:</span><strong>{{ logoFileName }}</strong></div>
                              <div><span>Características:</span><strong>{{ config.characteristics.length ? config.characteristics.join(', ') : 'Sin seleccionar' }}</strong></div>
                            </div>
                          </q-card-section>
                        </q-card>

                        <q-card flat bordered class="review-card">
                          <q-card-section>
                            <div class="review-card__title">Administrador</div>
                            <div class="review-card__list">
                              <div><span>Nombre:</span><strong>{{ adminFullName }}</strong></div>
                              <div><span>Correo:</span><strong>{{ administrator.email || 'Sin correo' }}</strong></div>
                              <div><span>Usuario:</span><strong>{{ administrator.username || 'Sin usuario' }}</strong></div>
                              <div><span>Estado:</span><strong>{{ administrator.status || 'Activo' }}</strong></div>
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
                  @click="previousStep"
                />
                <q-btn
                  unelevated
                  no-caps
                  :label="isLastStep ? 'Guardar condominio' : 'Siguiente'"
                  :icon="isLastStep ? 'check' : 'arrow_forward'"
                  color="primary"
                  class="footer-btn footer-btn--primary"
                  @click="void handlePrimaryAction()"
                />
              </div>
            </div>
          </section>

          <aside class="wizard-aside">
            <q-card flat bordered class="summary-panel summary-panel--sticky">
              <q-card-section class="summary-panel__section">
                <div class="summary-panel__kicker">Resumen ejecutivo</div>

                <div class="summary-preview summary-preview--hero q-mt-sm">
                  <div class="summary-preview__illustration">
                    <q-icon name="apartment" size="34px" />
                  </div>
                  <div class="summary-preview__body">
                    <div class="summary-preview__eyebrow">Condominio</div>
                    <div class="summary-preview__name">
                      {{ form.name || 'Nuevo condominio' }}
                    </div>
                    <div class="summary-preview__meta">
                      <q-badge :color="form.status === 'Activo' ? 'positive' : 'grey-6'" rounded>
                        {{ form.status }}
                      </q-badge>
                      <q-badge outline color="primary" rounded>
                        {{ form.type || 'Sin tipo' }}
                      </q-badge>
                    </div>
                  </div>
                </div>

                <div class="summary-checklist q-mt-md">
                  <div v-for="item in summaryChecklist" :key="item.label" class="summary-checklist__item">
                    <q-icon
                      :name="item.done ? 'task_alt' : 'radio_button_unchecked'"
                      :class="item.done ? 'text-positive' : 'text-grey-5'"
                      size="18px"
                    />
                    <div class="summary-checklist__copy">
                      <div class="summary-checklist__label">{{ item.label }}</div>
                      <div class="summary-checklist__value">{{ item.value }}</div>
                    </div>
                  </div>
                </div>

                <div class="summary-exec-grid q-mt-md">
                  <div v-for="item in summaryHighlights" :key="item.label" class="summary-exec-card">
                    <div class="summary-exec-card__label">{{ item.label }}</div>
                    <div class="summary-exec-card__value">{{ item.value }}</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </aside>
        </div>
      </q-card>
    </div>

    <CondominioCreatedDialog
      v-model="createdDialogOpen"
      :condo-name="form.name || 'Nuevo condominio'"
      :condo-type="form.type"
      :condo-status="form.status"
      @go-to-condominio="goToCondominio"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import CondominioCreatedDialog from './components/CondominioCreatedDialog.vue';

type StepName = 'info' | 'location' | 'config' | 'admin' | 'review';

type ValidatableForm = {
  validate: () => Promise<boolean> | boolean;
};

type CondoForm = {
  name: string;
  ruc: string;
  type: string;
  description: string;
  status: string;
};

type LocationForm = {
  country: string;
  province: string;
  city: string;
  direction: string;
  reference: string;
};

type ConfigForm = {
  currency: string;
  towers: string;
  houses: string;
  logo: File | null;
  characteristics: string[];
};

type AdministratorForm = {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  username: string;
  password: string;
  status: string;
};

type StepDefinition = {
  name: StepName;
  label: string;
};

const router = useRouter();

const steps: StepDefinition[] = [
  { name: 'info', label: 'Información' },
  { name: 'location', label: 'Ubicación' },
  { name: 'config', label: 'Configuración' },
  { name: 'admin', label: 'Administrador' },
  { name: 'review', label: 'Resumen' },
];

const stepIndexByName = Object.fromEntries(steps.map((step, index) => [step.name, index])) as Record<
  StepName,
  number
>;

const activeStep = ref<StepName>('info');
const createdDialogOpen = ref(false);
const showPassword = ref(false);

const infoFormRef = ref<ValidatableForm | null>(null);
const configFormRef = ref<ValidatableForm | null>(null);
const adminFormRef = ref<ValidatableForm | null>(null);

const form = reactive<CondoForm>({
  name: '',
  ruc: '',
  type: '',
  description: '',
  status: 'Activo',
});

const location = reactive<LocationForm>({
  country: '',
  province: '',
  city: '',
  direction: '',
  reference: '',
});

const config = reactive<ConfigForm>({
  currency: '',
  towers: '',
  houses: '',
  logo: null,
  characteristics: [],
});

const administrator = reactive<AdministratorForm>({
  name: '',
  lastName: '',
  email: '',
  phone: '',
  username: '',
  password: '',
  status: 'Activo',
});

const typeOptions = ['Residencial', 'Mixto', 'Comercial'];
const statusRadioOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Inactivo', value: 'Inactivo' },
];
const countryOptions = ['Ecuador', 'Colombia', 'Perú'];
const provinceOptions = ['Guayas', 'Pichincha', 'Azuay'];
const cityOptions = ['Guayaquil', 'Quito', 'Cuenca'];
const currencyOptions = ['USD', 'EUR', 'MXN'];
const characteristicOptions = [
  { value: 'Piscina', label: 'Piscina', icon: 'pool' },
  { value: 'Gimnasio', label: 'Gimnasio', icon: 'fitness_center' },
  { value: 'Areas comunes', label: 'Áreas comunes', icon: 'deck' },
  { value: 'Salon comunal', label: 'Salón comunal', icon: 'event_seat' },
  { value: 'Seguridad 24/7', label: 'Seguridad 24/7', icon: 'shield' },
  { value: 'Parqueadero', label: 'Parqueadero', icon: 'local_parking' },
] as const;

const adminFullName = computed(() => `${administrator.name} ${administrator.lastName}`.trim() || 'Administrador principal');
const logoFileName = computed(() => config.logo?.name ?? 'Sin archivo');
const logoPreviewUrl = ref<string | null>(null);

let logoObjectUrl: string | null = null;

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

function isFeatureSelected(value: string) {
  return config.characteristics.includes(value);
}

function toggleFeature(value: string) {
  const index = config.characteristics.indexOf(value);
  if (index === -1) {
    config.characteristics.push(value);
    return;
  }

  config.characteristics.splice(index, 1);
}

const summaryHighlights = computed(() => [
  { label: 'Estado', value: form.status },
  { label: 'Torres', value: config.towers || '0' },
  { label: 'Casas', value: config.houses || '0' },
  { label: 'Avance', value: `${completionPercent.value}%` },
]);

const summaryChecklist = computed(() => [
  {
    label: 'Información general',
    value: form.name ? form.name : 'Pendiente',
    done: Boolean(form.name && form.ruc && form.type && form.status),
  },
  {
    label: 'Ubicación',
    value: location.country ? `${location.country} · ${location.city || 'Sin ciudad'}` : 'Pendiente',
    done: Boolean(location.country && location.province && location.city && location.direction),
  },
  {
    label: 'Configuración',
    value: config.currency ? `${config.currency} · ${config.towers || '0'} torres` : 'Pendiente',
    done: Boolean(config.currency && config.towers && config.houses),
  },
  {
    label: 'Administrador',
    value: adminFullName.value || 'Pendiente',
    done: Boolean(
      administrator.name &&
        administrator.lastName &&
        administrator.email &&
        administrator.username &&
        administrator.password,
    ),
  },
]);

const completionPercent = computed(() => {
  const completedCount =
    Number(Boolean(form.name)) +
    Number(Boolean(location.country)) +
    Number(Boolean(config.currency)) +
    Number(Boolean(adminFullName.value));
  return Math.round((completedCount / 4) * 100);
});

const currentStepIndex = computed(() => stepIndexByName[activeStep.value]);
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1);

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

  activeStep.value = steps[currentStepIndex.value - 1]?.name ?? 'info';
}

function nextStep() {
  if (isLastStep.value) {
    return;
  }

  activeStep.value = steps[currentStepIndex.value + 1]?.name ?? 'review';
}

function requiredRule(value: unknown) {
  return toText(value).trim() ? true : 'Campo requerido';
}

function emailRule(value: unknown) {
  const text = toText(value).trim();
  return /^\S+@\S+\.\S+$/.test(text) ? true : 'Ingresa un correo válido';
}

function phoneRule(value: unknown) {
  const text = toText(value).trim();
  if (!text) {
    return true;
  }

  return /^[0-9+()\-\s]{7,20}$/.test(text) ? true : 'Ingresa un teléfono válido';
}

function minLengthRule(min: number) {
  return (value: unknown) => {
    const text = toText(value).trim();
    if (!text) {
      return 'Campo requerido';
    }

    return text.length >= min ? true : `Debe tener al menos ${min} caracteres`;
  };
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
    location.country &&
      location.province &&
      location.city &&
      location.direction,
  );
}

function isConfigValid() {
  return Boolean(config.currency && config.towers && config.houses);
}

function isAdminValid() {
  return Boolean(
    administrator.name &&
      administrator.lastName &&
      administrator.email &&
      administrator.username &&
      administrator.password,
  );
}

async function validateStep(step: StepName) {
  if (step === 'review') {
    return isInfoValid() && isLocationValid() && isConfigValid() && isAdminValid();
  }

  const formRefMap: Partial<Record<Exclude<StepName, 'review'>, { value: ValidatableForm | null }>> = {
    info: infoFormRef,
    config: configFormRef,
    admin: adminFormRef,
  };

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

  return step === 'config' ? isConfigValid() : isAdminValid();
}

async function handlePrimaryAction() {
  if (activeStep.value === 'review') {
    if (await validateStep('review')) {
      createdDialogOpen.value = true;
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
  padding: 24px;
}

.page-shell {
  display: grid;
  gap: 18px;
  margin: 0 auto;
  max-width: 1440px;
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

.wizard-steps {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 18px 18px 0;
}

.wizard-step {
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
  min-height: 46px;
  width: auto;
  padding: 0 14px;
  position: relative;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.wizard-step:hover {
  border-color: rgba(37, 99, 235, 0.16);
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.05);
  transform: translateY(-1px);
}

.wizard-step--active {
  border-color: rgba(37, 99, 235, 0.22);
  box-shadow: 0 12px 24px rgba(15, 23, 42, 0.08);
  color: var(--app-primary);
}

.wizard-step--done {
  background: rgba(37, 99, 235, 0.04);
}

.wizard-step__number {
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 999px;
  color: var(--app-primary);
  display: inline-flex;
  font-size: 11px;
  font-weight: 800;
  height: 24px;
  justify-content: center;
  width: 24px;
}

.wizard-step__label {
  font-size: 12px;
  font-weight: 800;
  line-height: 1.15;
}

.wizard-step--done .wizard-step__number {
  background: rgba(37, 99, 235, 0.16);
}

.wizard-step--done .wizard-step__label {
  color: var(--app-text);
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

.step-panel {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-sizing: border-box;
  padding: 20px;
  width: 100%;
}

.step-panel > .section-title,
.step-panel > .section-subtitle,
.step-panel > .field-group {
  width: 100%;
}

.step-panel--airy {
  padding: 24px;
}

.location-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  width: 100%;
}

.location-layout__panel {
  min-width: 0;
}

.config-layout,
.admin-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  width: 100%;
}

.config-panel,
.admin-panel {
  min-width: 0;
}

.config-panel--visual,
.admin-panel--access {
  align-content: start;
}

.step-heading {
  display: grid;
  gap: 4px;
  margin-bottom: 6px;
}

.section-title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.section-subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.step-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  width: 100%;
}

.step-field {
  width: 100%;
}

.step-field--full {
  grid-column: 1 / -1;
}

.step-field--status {
  display: grid;
  gap: 10px;
  grid-column: 1 / -1;
}

.step-field--status :deep(.q-option-group) {
  width: 100%;
}

.field-label {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.step-grid--coords {
  gap: 12px 14px;
}

.step-grid--coords .step-field {
  min-width: 0;
}

.field-group {
  background: rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 16px;
}

.location-panel {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.86)),
    rgba(248, 250, 252, 0.72);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.04);
  display: grid;
  align-content: start;
  gap: 0;
  height: 100%;
}

.location-panel--form {
  padding-bottom: 18px;
}

.location-panel__header {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
}

.location-panel__heading {
  align-items: center;
  color: var(--app-text);
  display: inline-flex;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.location-panel__heading :deep(.q-icon) {
  color: var(--app-primary);
}

.location-panel__hint {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  max-width: 38rem;
}

.location-panel__meta {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin-bottom: 14px;
}

.location-panel__chip {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 11px 12px;
}

.location-panel__chip-label {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.location-panel__chip-value {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.field-group__title {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-bottom: 12px;
  text-transform: uppercase;
}


.toggle-grid {
  display: grid;
  gap: 12px;
}

.toggle-grid--soft {
  background: rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 14px 16px;
}

.map-placeholder {
  display: grid;
  gap: 14px;
}

.map-placeholder__top {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.map-placeholder__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
}

.map-placeholder__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 4px;
}

.map-placeholder__canvas {
  align-items: center;
  background:
    radial-gradient(circle at top, rgba(37, 99, 235, 0.12), transparent 44%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  display: grid;
  gap: 8px;
  justify-items: center;
  min-height: 260px;
  padding: 24px;
}

.map-placeholder__pin {
  align-items: center;
  background: rgba(37, 99, 235, 0.12);
  border-radius: 999px;
  color: var(--app-primary);
  display: inline-flex;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.map-placeholder__top :deep(.q-btn) {
  background: rgba(255, 255, 255, 0.84);
  border-radius: 999px;
  padding-inline: 12px;
}

.map-placeholder__legend {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
}

.map-preview {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  display: grid;
  gap: 14px;
}

.map-preview__top {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.map-preview__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.map-preview__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 4px;
}

.map-preview__meta {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.map-preview__chip {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.map-preview__chip-label {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.map-preview__chip-value {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
}

.logo-upload {
  align-items: center;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.92));
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: 20px;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(72px, 86px) minmax(0, 1fr);
  padding: 12px;
  position: relative;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
}

.logo-upload::after {
  background: linear-gradient(90deg, rgba(37, 99, 235, 0.12), transparent);
  border-radius: 999px;
  content: '';
  height: 1px;
  left: 16px;
  position: absolute;
  right: 16px;
  top: 16px;
}

.logo-upload--premium {
  overflow: hidden;
}

.logo-upload__preview {
  align-items: center;
  display: grid;
  gap: 4px;
  justify-items: center;
  min-width: 0;
}

.logo-upload__copy {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.logo-upload__badge {
  background: rgba(37, 99, 235, 0.12);
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 999px;
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 4px 10px;
  text-transform: uppercase;
}

.logo-upload__artwork {
  align-items: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(37, 99, 235, 0.12)),
    linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.08));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 12px 24px rgba(37, 99, 235, 0.12);
  color: var(--app-primary);
  display: inline-flex;
  height: 64px;
  justify-content: center;
  overflow: hidden;
  width: 64px;
}

.logo-upload__artwork img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.config-panel__subgroup {
  background: rgba(255, 255, 255, 0.82);
  margin-top: 16px;
}

.map-preview__canvas {
  align-items: center;
  background:
    radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.18), transparent 40%),
    linear-gradient(180deg, rgba(246, 248, 251, 0.96), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  display: grid;
  gap: 10px;
  justify-items: center;
  min-height: 280px;
  overflow: hidden;
  padding: 24px;
  position: relative;
}

.map-preview__grid {
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.06) 1px, transparent 1px);
  background-position: center;
  background-size: 36px 36px;
  inset: 0;
  opacity: 0.7;
  position: absolute;
}

.map-preview__halo {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.16), transparent 62%);
  border-radius: 999px;
  height: 180px;
  position: absolute;
  width: 180px;
}

.map-preview__pin {
  align-items: center;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.08));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 999px;
  color: var(--app-primary);
  display: inline-flex;
  height: 58px;
  justify-content: center;
  position: relative;
  width: 58px;
  z-index: 1;
}

.map-preview__legend {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 999px;
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
  padding: 8px 12px;
  position: relative;
  z-index: 1;
}

.map-preview__top :deep(.q-btn) {
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 999px;
  padding-inline: 12px;
}

.logo-upload__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.logo-upload__title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.logo-upload__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.logo-upload__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}

.logo-upload__dropzone {
  align-items: center;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.12), transparent 42%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.96));
  border: 1.5px dashed rgba(37, 99, 235, 0.24);
  border-radius: 22px;
  color: var(--app-text-muted);
  display: grid;
  gap: 14px;
  grid-column: 1 / -1;
  min-height: 132px;
  padding: 18px 18px 16px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.logo-upload__dropzone:hover {
  border-color: rgba(37, 99, 235, 0.36);
  box-shadow: 0 16px 32px rgba(37, 99, 235, 0.1);
  transform: translateY(-1px);
}

.logo-upload__dropzone :deep(.q-field__control) {
  background: transparent;
  border: 0;
  min-height: 58px;
  padding: 0;
}

.logo-upload__dropzone :deep(.q-field__control::before),
.logo-upload__dropzone :deep(.q-field__control::after) {
  display: none;
}

.logo-upload__dropzone :deep(.q-field__native) {
  color: var(--app-text);
  font-weight: 800;
}

.logo-upload__dropzone :deep(.q-field__label) {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.logo-upload__dropzone :deep(.q-icon) {
  color: var(--app-primary);
  flex: 0 0 auto;
}

.logo-upload__dropzone-copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.logo-upload__dropzone-copy strong {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.logo-upload__dropzone-copy span {
  font-size: 11px;
  line-height: 1.4;
}

.logo-upload__picker-hint {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
}

.feature-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
}

.feature-toggle {
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  color: var(--app-text);
  display: inline-flex;
  gap: 8px;
  justify-content: flex-start;
  min-height: 40px;
  padding: 8px 12px;
  text-align: left;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease,
    color 0.18s ease;
  width: 100%;
}

.feature-toggle:hover {
  border-color: rgba(37, 99, 235, 0.24);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.06);
  transform: translateY(-1px);
}

.feature-toggle--active {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.05));
  border-color: rgba(37, 99, 235, 0.2);
  color: var(--app-primary);
  box-shadow: 0 10px 18px rgba(37, 99, 235, 0.08);
}

.feature-toggle :deep(.q-btn__content) {
  align-items: center;
  display: inline-flex;
  gap: 7px;
  justify-content: flex-start;
  width: 100%;
}

.feature-toggle :deep(.q-icon) {
  color: currentColor;
  flex: 0 0 auto;
}

.feature-toggle span {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.feature-toggle--active span {
  font-weight: 800;
}

.review-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.review-card__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 12px;
}

.review-card__list {
  display: grid;
  gap: 8px;
}

.review-card__list > div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.review-card__list span {
  color: var(--app-text-muted);
  font-size: 11px;
}

.review-card__list strong {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  text-align: right;
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

.summary-preview {
  align-items: center;
  display: flex;
  gap: 12px;
}

.summary-preview--hero {
  align-items: flex-start;
}

.summary-preview__illustration {
  align-items: center;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.12), rgba(37, 99, 235, 0.04));
  border-radius: 16px;
  color: var(--app-primary);
  display: grid;
  flex-shrink: 0;
  height: 64px;
  justify-content: center;
  width: 64px;
}

.summary-preview__body {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.summary-preview__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-preview__name {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.summary-preview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-checklist {
  display: grid;
  gap: 10px;
}

.summary-checklist__item {
  align-items: center;
  background: rgba(248, 250, 252, 0.76);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: flex;
  gap: 12px;
  padding: 12px 14px;
}

.summary-checklist__copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.summary-checklist__label {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
}

.summary-checklist__value {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.35;
}

.summary-exec-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-exec-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  display: grid;
  gap: 4px;
  padding: 12px 14px;
}

.summary-exec-card__label {
  color: var(--app-text-muted);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.summary-exec-card__value {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.25;
}

.summary-note--compact {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
}

.admin-box {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: flex;
  gap: 12px;
  padding: 12px;
}

.admin-box--premium {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.04), rgba(37, 99, 235, 0.01));
}

.admin-box__avatar {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
}

.admin-box__copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.admin-box__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-box__name {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}

.admin-box__meta,
.admin-box__status,
.admin-box__separator {
  color: var(--app-text-muted);
  font-size: 11px;
}

.admin-box__footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-checklist {
  display: grid;
  gap: 10px;
}

.summary-checklist__item {
  align-items: flex-start;
  display: flex;
  gap: 10px;
}

.summary-checklist__item--done .summary-checklist__label {
  color: var(--app-text);
}

.summary-checklist__copy {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.summary-checklist__label {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
}

.summary-checklist__detail {
  color: var(--app-text-muted);
  font-size: 10px;
  line-height: 1.35;
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

  .summary-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .new-condo-page {
    padding: 16px;
  }

  .page-header {
    align-items: start;
    flex-direction: column;
  }

  .step-grid,
  .review-grid,
  .summary-exec-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .location-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .config-layout,
  .admin-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .step-field--full,
  .step-field--status {
    grid-column: auto;
  }

  .feature-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .summary-exec-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .summary-checklist__item {
    padding: 11px 12px;
  }

  .field-group {
    padding: 14px;
  }

  .map-placeholder__top,
  .logo-upload {
    grid-template-columns: minmax(0, 1fr);
  }

  .map-preview__top {
    align-items: start;
    flex-direction: column;
  }

  .map-preview__meta {
    grid-template-columns: minmax(0, 1fr);
  }

  .location-panel__meta {
    grid-template-columns: minmax(0, 1fr);
  }

  .map-placeholder__top {
    align-items: start;
    flex-direction: column;
  }

  .logo-upload__input {
    justify-self: stretch;
  }

  .toggle-grid--soft {
    padding: 12px 14px;
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


