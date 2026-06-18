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
                  class="wizard-step"
                >
                  <q-card flat bordered class="step-card">
                    <q-card-section>
                      <div class="section-title">Información general</div>
                      <div class="section-subtitle">
                        Define la identidad del condominio antes de continuar.
                      </div>

                      <div class="form-grid q-mt-md">
                        <q-input
                          v-model="form.name"
                          dense
                          outlined
                          hide-bottom-space
                          label="Nombre del condominio *"
                          :rules="[requiredRule]"
                        />
                        <q-select
                          v-model="form.type"
                          dense
                          outlined
                          hide-bottom-space
                          :options="typeOptions"
                          label="Tipo de condominio *"
                          :rules="[requiredRule]"
                        />
                        <q-select
                          v-model="form.status"
                          dense
                          outlined
                          hide-bottom-space
                          :options="statusOptions"
                          label="Estado *"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="form.description"
                          dense
                          outlined
                          hide-bottom-space
                          type="textarea"
                          autogrow
                          label="Descripción"
                        />
                      </div>
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="step-card q-mt-md">
                    <q-card-section>
                      <div class="section-title">Dirección base</div>
                      <div class="section-subtitle">
                        Registra los datos de ubicación que identifican el condominio.
                      </div>

                      <div class="form-grid q-mt-md">
                        <q-select
                          v-model="location.country"
                          dense
                          outlined
                          hide-bottom-space
                          :options="countryOptions"
                          label="País *"
                          :rules="[requiredRule]"
                        />
                        <q-select
                          v-model="location.province"
                          dense
                          outlined
                          hide-bottom-space
                          :options="provinceOptions"
                          label="Provincia *"
                          :rules="[requiredRule]"
                        />
                        <q-select
                          v-model="location.city"
                          dense
                          outlined
                          hide-bottom-space
                          :options="cityOptions"
                          label="Ciudad *"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="location.direction"
                          dense
                          outlined
                          hide-bottom-space
                          label="Dirección *"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="location.reference"
                          dense
                          outlined
                          hide-bottom-space
                          label="Referencia"
                        />
                        <q-input
                          v-model="location.postalCode"
                          dense
                          outlined
                          hide-bottom-space
                          label="Código postal"
                        />
                      </div>
                    </q-card-section>
                  </q-card>
                </q-form>

                <q-form
                  v-else-if="activeStep === 'config'"
                  ref="configFormRef"
                  class="wizard-step"
                >
                  <q-card flat bordered class="step-card">
                    <q-card-section>
                      <div class="section-title">Configuración general</div>
                      <div class="section-subtitle">
                        Ajusta la estructura base y los parámetros operativos.
                      </div>

                      <div class="form-grid q-mt-md">
                        <q-input
                          v-model="config.blocks"
                          dense
                          outlined
                          hide-bottom-space
                          type="number"
                          label="Número de bloques *"
                          :rules="[requiredRule, integerMinRule(1)]"
                        />
                        <q-input
                          v-model="config.units"
                          dense
                          outlined
                          hide-bottom-space
                          type="number"
                          label="Número de unidades *"
                          :rules="[requiredRule, integerMinRule(1)]"
                        />
                        <q-select
                          v-model="config.currency"
                          dense
                          outlined
                          hide-bottom-space
                          :options="currencyOptions"
                          label="Moneda *"
                          :rules="[requiredRule]"
                        />
                        <q-select
                          v-model="config.timezone"
                          dense
                          outlined
                          hide-bottom-space
                          :options="timezoneOptions"
                          label="Zona horaria *"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="config.dueDay"
                          dense
                          outlined
                          hide-bottom-space
                          type="number"
                          label="Día de vencimiento *"
                          :rules="[requiredRule, rangeRule(1, 31)]"
                        />
                        <q-input
                          v-model="config.monthlyFee"
                          dense
                          outlined
                          hide-bottom-space
                          prefix="$"
                          label="Cuota mensual estimada"
                          :rules="[currencyRule]"
                        />
                      </div>
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="step-card q-mt-md">
                    <q-card-section>
                      <div class="section-title">Preferencias operativas</div>
                      <div class="section-subtitle">
                        Activa o desactiva funciones clave del condominio.
                      </div>

                      <div class="toggle-grid q-mt-md">
                        <q-toggle v-model="config.notifications" label="Enviar recordatorios automáticos" />
                        <q-toggle v-model="config.billingLock" label="Bloquear accesos por mora" />
                        <q-toggle v-model="config.onlinePayments" label="Habilitar pagos en línea" />
                        <q-toggle v-model="config.documents" label="Publicar documentos del condominio" />
                      </div>
                    </q-card-section>
                  </q-card>
                </q-form>

                <q-form
                  v-else-if="activeStep === 'admin'"
                  ref="adminFormRef"
                  class="wizard-step"
                >
                  <q-card flat bordered class="step-card">
                    <q-card-section>
                      <div class="section-title">Administrador principal</div>
                      <div class="section-subtitle">
                        Define quién administrará el acceso y la operación inicial.
                      </div>

                      <div class="form-grid q-mt-md">
                        <q-input
                          v-model="administrator.name"
                          dense
                          outlined
                          hide-bottom-space
                          label="Nombres *"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="administrator.lastName"
                          dense
                          outlined
                          hide-bottom-space
                          label="Apellidos *"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="administrator.email"
                          dense
                          outlined
                          hide-bottom-space
                          type="email"
                          label="Correo electrónico *"
                          :rules="[requiredRule, emailRule]"
                        />
                        <q-input
                          v-model="administrator.phone"
                          dense
                          outlined
                          hide-bottom-space
                          label="Teléfono"
                          :rules="[phoneRule]"
                        />
                      </div>
                    </q-card-section>
                  </q-card>

                  <q-card flat bordered class="step-card q-mt-md">
                    <q-card-section>
                      <div class="section-title">Acceso inicial</div>
                      <div class="section-subtitle">
                        Crea las credenciales temporales para el primer ingreso.
                      </div>

                      <div class="form-grid q-mt-md">
                        <q-input
                          v-model="administrator.username"
                          dense
                          outlined
                          hide-bottom-space
                          label="Usuario *"
                          :rules="[requiredRule, minLengthRule(4)]"
                        />
                        <q-input
                          v-model="administrator.password"
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
                    </q-card-section>
                  </q-card>
                </q-form>

                <div v-else class="wizard-step">
                  <q-card flat bordered class="step-card">
                    <q-card-section>
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
                              <div><span>Tipo:</span><strong>{{ form.type || 'Sin datos' }}</strong></div>
                              <div><span>Estado:</span><strong>{{ form.status }}</strong></div>
                              <div><span>Descripción:</span><strong>{{ form.description || 'Sin datos' }}</strong></div>
                            </div>
                          </q-card-section>
                        </q-card>

                        <q-card flat bordered class="review-card">
                          <q-card-section>
                            <div class="review-card__title">Dirección y configuración</div>
                            <div class="review-card__list">
                              <div><span>Ciudad:</span><strong>{{ location.city || 'Sin datos' }}</strong></div>
                              <div><span>Bloques:</span><strong>{{ config.blocks || '0' }}</strong></div>
                              <div><span>Unidades:</span><strong>{{ config.units || '0' }}</strong></div>
                              <div><span>Moneda:</span><strong>{{ config.currency || 'Sin moneda' }}</strong></div>
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
                    </q-card-section>
                  </q-card>
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

                <div class="summary-exec-grid summary-exec-grid--minimal q-mt-md">
                  <div v-for="item in summaryHighlights" :key="item.label" class="summary-exec-card">
                    <div class="summary-exec-card__label">{{ item.label }}</div>
                    <div class="summary-exec-card__value">{{ item.value }}</div>
                  </div>
                </div>

                <q-separator class="q-my-md" />

                <div class="summary-note summary-note--compact">
                  El panel se mantiene ligero para revisar el avance sin distraer del formulario.
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
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import CondominioCreatedDialog from './components/CondominioCreatedDialog.vue';

type StepName = 'info' | 'config' | 'admin' | 'review';

type ValidatableForm = {
  validate: () => Promise<boolean> | boolean;
};

type CondoForm = {
  name: string;
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
  postalCode: string;
};

type ConfigForm = {
  blocks: string;
  units: string;
  currency: string;
  timezone: string;
  dueDay: string;
  monthlyFee: string;
  notifications: boolean;
  billingLock: boolean;
  onlinePayments: boolean;
  documents: boolean;
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
  postalCode: '',
});

const config = reactive<ConfigForm>({
  blocks: '',
  units: '',
  currency: '',
  timezone: '',
  dueDay: '',
  monthlyFee: '',
  notifications: true,
  billingLock: false,
  onlinePayments: true,
  documents: true,
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
const statusOptions = ['Activo', 'Inactivo'];
const countryOptions = ['Ecuador', 'Colombia', 'Perú'];
const provinceOptions = ['Guayas', 'Pichincha', 'Azuay'];
const cityOptions = ['Guayaquil', 'Quito', 'Cuenca'];
const currencyOptions = ['USD', 'EUR', 'MXN'];
const timezoneOptions = ['America/Guayaquil', 'America/Lima', 'America/Bogota'];

const adminFullName = computed(() => `${administrator.name} ${administrator.lastName}`.trim() || 'Administrador principal');

const summaryHighlights = computed(() => [
  { label: 'Estado', value: form.status },
  { label: 'Bloques', value: config.blocks || '0' },
  { label: 'Avance', value: `${completedCountLabel.value}` },
]);

const completedCountLabel = computed(() => {
  const completedCount = Number(Boolean(form.name)) + Number(Boolean(form.type)) + Number(Boolean(config.blocks)) + Number(Boolean(adminFullName.value));
  return `${completedCount}/4 pasos`;
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

function rangeRule(min: number, max: number) {
  return (value: unknown) => {
    const text = toText(value).trim();
    if (!text) {
      return 'Campo requerido';
    }

    const numericValue = Number(text);
    if (!Number.isInteger(numericValue)) {
      return 'Ingresa un número entero';
    }

    return numericValue >= min && numericValue <= max ? true : `Debe estar entre ${min} y ${max}`;
  };
}

function currencyRule(value: unknown) {
  const text = toText(value).trim();
  if (!text) {
    return true;
  }

  return /^\d+([.,]\d{1,2})?$/.test(text) ? true : 'Ingresa un monto válido';
}

function isInfoValid() {
  return Boolean(form.name && form.type && form.status && location.country && location.province && location.city && location.direction);
}

function isConfigValid() {
  return Boolean(config.blocks && config.units && config.currency && config.timezone && config.dueDay);
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
    return isInfoValid() && isConfigValid() && isAdminValid();
  }

  const formRefMap: Record<Exclude<StepName, 'review'>, { value: ValidatableForm | null }> = {
    info: infoFormRef,
    config: configFormRef,
    admin: adminFormRef,
  };

  const refValue = formRefMap[step].value;
  if (refValue) {
    const result = await refValue.validate();
    return Boolean(result);
  }

  return step === 'info' ? isInfoValid() : step === 'config' ? isConfigValid() : isAdminValid();
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
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
}

.wizard-step--active {
  border-color: rgba(37, 99, 235, 0.22);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.05);
  color: var(--app-primary);
}

.wizard-step--done {
  background: rgba(37, 99, 235, 0.04);
}

.wizard-step__number {
  align-items: center;
  background: rgba(37, 99, 235, 0.12);
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

.step-card,
.summary-panel,
.review-card {
  border-radius: 18px;
  overflow: hidden;
}

.step-card :deep(.q-card__section),
.review-card :deep(.q-card__section) {
  padding: 20px;
}

.section-title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.section-subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 4px;
}

.form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.toggle-grid {
  display: grid;
  gap: 12px;
}

.review-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
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

.summary-exec-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-exec-grid--minimal {
  grid-template-columns: 1fr;
}

.summary-exec-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  display: grid;
  gap: 4px;
  padding: 10px 12px;
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

.summary-exec-section {
  display: grid;
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

  .form-grid,
  .review-grid,
  .summary-exec-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .step-card :deep(.q-card__section),
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
