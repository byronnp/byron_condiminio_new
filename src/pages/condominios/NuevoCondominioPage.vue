<template>
  <q-page class="new-condo-page">
    <div class="page-shell">
      <header class="page-hero">
        <div>
          <div class="page-hero__eyebrow">2. Crear condominio - información general</div>
          <h1 class="page-hero__title">Nuevo condominio</h1>
          <p class="page-hero__subtitle">
            Registra la información base del condominio antes de continuar con el resto del
            asistente.
          </p>
        </div>

        <div class="page-hero__actions">
          <q-btn
            flat
            no-caps
            label="Volver"
            icon="arrow_back"
            class="hero-action hero-action--ghost"
            @click="goBack"
          />
          <q-btn
            color="primary"
            unelevated
            no-caps
            :label="primaryActionLabel"
            :icon="primaryActionIcon"
            class="hero-action"
            @click="handlePrimaryAction"
          />
        </div>
      </header>

      <div class="wizard-stepper">
        <button
          v-for="step in steps"
          :key="step.name"
          type="button"
          class="wizard-step"
          :class="{ 'wizard-step--active': activeStep === step.name }"
          @click="activeStep = step.name"
        >
          <span class="wizard-step__number">{{ step.number }}</span>
          <span class="wizard-step__label">{{ step.label }}</span>
        </button>
      </div>

      <q-tab-panels v-model="activeStep" animated class="wizard-panels">
        <q-tab-panel name="info" class="wizard-panel">
          <section class="form-layout">
            <q-card flat bordered class="form-card">
              <q-card-section>
                <div class="section-title">Información general</div>

                <div class="form-grid q-mt-md">
                  <q-input
                    v-model="form.name"
                    dense
                    outlined
                    label="Nombre del condominio *"
                    :rules="[requiredRule]"
                  />
                  <q-select
                    v-model="form.type"
                    dense
                    outlined
                    :options="typeOptions"
                    label="Tipo de condominio *"
                    :rules="[requiredRule]"
                  />
                </div>

                <q-input
                  v-model="form.description"
                  class="q-mt-md"
                  dense
                  outlined
                  type="textarea"
                  autogrow
                  label="Descripción"
                />

                <div class="form-grid form-grid--split q-mt-md">
                  <div>
                    <div class="mini-label">Estado</div>
                    <div class="row items-center q-gutter-lg">
                      <q-radio v-model="form.status" val="Activo" label="Activo" dense />
                      <q-radio v-model="form.status" val="Inactivo" label="Inactivo" dense />
                    </div>
                  </div>

                  <q-card flat bordered class="illustration-card">
                    <div class="illustration-card__image"></div>
                    <q-btn outline no-caps label="Cambiar imagen" class="q-mt-md full-width" />
                    <div class="illustration-card__hint">JPG, PNG. Máx. 2MB</div>
                  </q-card>
                </div>
              </q-card-section>
            </q-card>

            <aside class="summary-column">
              <q-card flat bordered class="summary-card">
                <q-card-section>
                  <div class="section-title">Resumen del condominio</div>

                  <div class="summary-preview q-mt-md">
                    <div class="summary-preview__thumbnail"></div>
                    <div>
                      <div class="summary-preview__name">{{ form.name || 'Nuevo condominio' }}</div>
                      <q-badge :color="form.status === 'Activo' ? 'positive' : 'grey-6'" rounded>
                        {{ form.status }}
                      </q-badge>
                    </div>
                  </div>

                  <div class="summary-list q-mt-md">
                    <div class="summary-item">
                      <span class="summary-item__label">Tipo</span>
                      <span class="summary-item__value">{{ form.type }}</span>
                    </div>
                    <div class="summary-item">
                      <span class="summary-item__label">Descripción</span>
                      <span class="summary-item__value summary-item__value--wrap">
                        {{ form.description || 'Sin descripción' }}
                      </span>
                    </div>
                  </div>
                </q-card-section>
              </q-card>

              <q-card flat bordered class="summary-card summary-card--admin">
                <q-card-section>
                  <div class="section-title">Administrador principal</div>
                  <div class="admin-box q-mt-md">
                    <q-avatar size="42px">
                      <img src="https://i.pravatar.cc/100?img=12" alt="Administrador" />
                    </q-avatar>
                    <div>
                      <div class="admin-box__name">Carlos Andrés Pérez Mendoza</div>
                      <div class="admin-box__meta">carlos.perez@altodelvalle.com</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </aside>
          </section>
        </q-tab-panel>

        <q-tab-panel name="location" class="wizard-panel">
          <section class="tab-layout">
            <q-card flat bordered class="tab-card">
              <q-card-section>
                <div class="section-title">Ubicación del condominio</div>
                <div class="tab-subtitle">Define dónde está ubicado el condominio y su referencia.</div>

                <div class="form-grid q-mt-md">
                  <q-select v-model="location.country" dense outlined :options="countryOptions" label="País *" />
                  <q-select v-model="location.province" dense outlined :options="provinceOptions" label="Provincia *" />
                  <q-select v-model="location.city" dense outlined :options="cityOptions" label="Ciudad *" />
                  <q-input v-model="location.direction" dense outlined label="Dirección *" />
                </div>

                <div class="form-grid q-mt-md">
                  <q-input v-model="location.reference" dense outlined label="Referencia (opcional)" />
                  <q-input v-model="location.postalCode" dense outlined label="Código postal" />
                </div>

                <div class="map-card q-mt-md">
                  <div class="map-card__header">
                    <div class="map-card__title">Ubicación en el mapa</div>
                    <q-btn flat dense no-caps label="Abrir mapa" icon="place" class="map-card__action" />
                  </div>
                  <div class="map-card__image"></div>
                </div>
              </q-card-section>
            </q-card>
          </section>
        </q-tab-panel>

        <q-tab-panel name="config" class="wizard-panel">
          <section class="tab-layout">
            <q-card flat bordered class="tab-card">
              <q-card-section>
                <div class="section-title">Configuración general</div>
                <div class="tab-subtitle">Ajusta la estructura, moneda y parámetros base del condominio.</div>

                <div class="form-grid q-mt-md">
                  <q-input v-model="config.blocks" dense outlined type="number" label="Número de torres / bloques *" />
                  <q-input v-model="config.units" dense outlined type="number" label="Número de unidades *" />
                  <q-select v-model="config.currency" dense outlined :options="currencyOptions" label="Moneda *" />
                  <q-select v-model="config.timezone" dense outlined :options="timezoneOptions" label="Zona horaria *" />
                </div>

                <div class="form-grid q-mt-md">
                  <q-input v-model="config.dueDay" dense outlined type="number" label="Día de vencimiento de cuotas *" />
                  <q-input v-model="config.monthlyFee" dense outlined prefix="$" label="Cuota mensual estimada" />
                </div>

                <q-card flat bordered class="config-block q-mt-md">
                  <q-card-section>
                    <div class="config-block__title">Recurrencia y notificaciones</div>
                    <div class="config-block__grid">
                      <q-toggle v-model="config.notifications" label="Enviar recordatorios automáticos" />
                      <q-toggle v-model="config.billingLock" label="Bloquear accesos por mora" />
                      <q-toggle v-model="config.onlinePayments" label="Habilitar pagos en línea" />
                      <q-toggle v-model="config.documents" label="Publicar documentos del condominio" />
                    </div>
                  </q-card-section>
                </q-card>
              </q-card-section>
            </q-card>
          </section>
        </q-tab-panel>

        <q-tab-panel name="amenities" class="wizard-panel">
          <section class="tab-layout">
            <q-card flat bordered class="tab-card">
              <q-card-section>
                <div class="section-title">Amenidades</div>
                <div class="tab-subtitle">Selecciona los espacios y servicios que estarán disponibles.</div>

                <div class="amenities-grid q-mt-md">
                  <div v-for="item in amenityItems" :key="item.label" class="amenity-card">
                    <div class="amenity-card__icon">
                      <q-icon :name="item.icon" size="22px" />
                    </div>
                    <div class="amenity-card__copy">
                      <div class="amenity-card__title">{{ item.label }}</div>
                      <div class="amenity-card__subtitle">{{ item.subtitle }}</div>
                    </div>
                    <q-checkbox v-model="selectedAmenities" :val="item.label" />
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </section>
        </q-tab-panel>

        <q-tab-panel name="admin" class="wizard-panel">
          <section class="tab-layout">
            <q-card flat bordered class="tab-card">
              <q-card-section>
                <div class="section-title">Administrador principal</div>
                <div class="tab-subtitle">Define el usuario responsable del nuevo condominio.</div>

                <div class="form-grid q-mt-md">
                  <q-input v-model="administrator.name" dense outlined label="Nombres *" />
                  <q-input v-model="administrator.lastName" dense outlined label="Apellidos *" />
                  <q-input v-model="administrator.email" dense outlined type="email" label="Correo electrónico *" />
                  <q-input v-model="administrator.phone" dense outlined label="Teléfono" />
                  <q-input v-model="administrator.username" dense outlined label="Usuario para acceso *" />
                  <q-input
                    v-model="administrator.password"
                    dense
                    outlined
                    :type="showPassword ? 'text' : 'password'"
                    label="Contraseña temporal *"
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
          </section>
        </q-tab-panel>

        <q-tab-panel name="summary" class="wizard-panel">
          <section class="tab-layout tab-layout--summary">
            <q-card flat bordered class="tab-card">
              <q-card-section>
                <div class="section-title">Resumen del condominio</div>
                <div class="tab-subtitle">Revisa toda la información antes de finalizar.</div>

                <div class="summary-final q-mt-md">
                  <div class="summary-final__hero">
                    <div class="summary-final__thumbnail"></div>
                    <div>
                      <div class="summary-final__name">{{ form.name }}</div>
                      <q-badge :color="form.status === 'Activo' ? 'positive' : 'grey-6'" rounded>
                        {{ form.status }}
                      </q-badge>
                    </div>
                  </div>

                  <div class="summary-final__grid">
                    <div class="summary-final__item">
                      <div class="summary-final__label">Ubicación</div>
                      <div class="summary-final__value">
                        {{ location.city }}, {{ location.province }}
                      </div>
                    </div>
                    <div class="summary-final__item">
                      <div class="summary-final__label">Bloques</div>
                      <div class="summary-final__value">{{ config.blocks }}</div>
                    </div>
                    <div class="summary-final__item">
                      <div class="summary-final__label">Unidades</div>
                      <div class="summary-final__value">{{ config.units }}</div>
                    </div>
                    <div class="summary-final__item">
                      <div class="summary-final__label">Moneda</div>
                      <div class="summary-final__value">{{ config.currency }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="tab-card tab-card--sticky">
              <q-card-section class="summary-action-card">
                <div class="section-title">Listo para crear</div>
                <div class="summary-action-card__text">
                  Cuando finalices, se abrirá un diálogo de confirmación con el nuevo condominio.
                </div>

                <q-btn
                  color="primary"
                  unelevated
                  no-caps
                  class="full-width q-mt-md"
                  label="Crear condominio"
                  @click="submitForm"
                />
                <q-btn outline no-caps class="full-width q-mt-sm" label="Guardar borrador" />
              </q-card-section>
            </q-card>
          </section>
        </q-tab-panel>
      </q-tab-panels>

      <q-card flat bordered class="wizard-footer">
        <div class="wizard-footer__left">
          <div class="wizard-footer__step">Paso {{ currentStepIndex + 1 }} de {{ steps.length }}</div>
          <div class="wizard-footer__label">{{ currentStepLabel }}</div>
        </div>

        <div class="wizard-footer__actions">
          <q-btn
            flat
            no-caps
            label="Anterior"
            icon="arrow_back"
            class="wizard-footer__btn wizard-footer__btn--ghost"
            :disable="isFirstStep"
            @click="goPreviousStep"
          />
          <q-btn
            color="primary"
            unelevated
            no-caps
            :label="isLastStep ? 'Guardar condominio' : 'Siguiente'"
            :icon="isLastStep ? 'check' : 'arrow_forward'"
            class="wizard-footer__btn"
            @click="handleFooterAction"
          />
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

type CondoForm = {
  name: string;
  type: string;
  description: string;
  status: 'Activo' | 'Inactivo';
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
  blocks: number;
  units: number;
  currency: string;
  timezone: string;
  dueDay: number;
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
};

const router = useRouter();
const createdDialogOpen = ref(false);
const activeStep = ref<'info' | 'location' | 'config' | 'amenities' | 'admin' | 'summary'>('info');
const showPassword = ref(false);

const form = reactive<CondoForm>({
  name: 'Condominio Alto del Valle',
  type: 'Condominio',
  description:
    'Condominio residencial ubicado en una zona exclusiva con amplias áreas verdes y seguridad 24/7.',
  status: 'Activo',
});

const location = reactive<LocationForm>({
  country: 'Ecuador',
  province: 'Pichincha',
  city: 'Quito',
  direction: 'Av. de los Shyris y Portugal',
  reference: 'Frente al parque La Carolina',
  postalCode: '170135',
});

const config = reactive<ConfigForm>({
  blocks: 4,
  units: 120,
  currency: 'USD - Dólar',
  timezone: '(GMT-05:00) Quito',
  dueDay: 5,
  monthlyFee: '120.00',
  notifications: true,
  billingLock: false,
  onlinePayments: true,
  documents: true,
});

const administrator = reactive<AdministratorForm>({
  name: 'Carlos',
  lastName: 'Andrés Pérez Mendoza',
  email: 'carlos.perez@altodelvalle.com',
  phone: '099 123 4567',
  username: 'carlos.perez',
  password: 'Temp#2026',
});

const typeOptions = ['Condominio', 'Urbanización', 'Edificio'];
const countryOptions = ['Ecuador', 'Colombia', 'Perú'];
const provinceOptions = ['Pichincha', 'Guayas', 'Azuay', 'Manabí'];
const cityOptions = ['Quito', 'Guayaquil', 'Cuenca', 'Manta'];
const currencyOptions = ['USD - Dólar', 'EUR - Euro', 'PEN - Sol'];
const timezoneOptions = ['(GMT-05:00) Quito', '(GMT-05:00) Bogotá', '(GMT-06:00) México'];

const amenityItems = [
  { icon: 'pool', label: 'Piscina', subtitle: 'Área recreativa con control de acceso' },
  { icon: 'fitness_center', label: 'Gimnasio', subtitle: 'Espacio equipado para uso diario' },
  { icon: 'event_seat', label: 'Salón comunal', subtitle: 'Eventos, reuniones y actividades' },
  { icon: 'sports_tennis', label: 'Cancha deportiva', subtitle: 'Uso común y reservas programadas' },
  { icon: 'outdoor_grill', label: 'Área de BBQ', subtitle: 'Zona social para residentes' },
  { icon: 'child_care', label: 'Parque infantil', subtitle: 'Espacio seguro para niños' },
  { icon: 'security', label: 'Seguridad 24/7', subtitle: 'Monitoreo y vigilancia permanente' },
  { icon: 'local_parking', label: 'Parqueaderos', subtitle: 'Estacionamiento asignado' },
];

const selectedAmenities = ref(['Piscina', 'Gimnasio', 'Seguridad 24/7']);

const steps = [
  { number: '1', name: 'info', label: 'Información' },
  { number: '2', name: 'location', label: 'Ubicación' },
  { number: '3', name: 'config', label: 'Configuración' },
  { number: '4', name: 'amenities', label: 'Amenidades' },
  { number: '5', name: 'admin', label: 'Administrador' },
  { number: '6', name: 'summary', label: 'Resumen' },
] as const;

const requiredRule = (value: string) => !!value || 'Campo requerido';

const currentStepIndex = computed(() => steps.findIndex((step) => step.name === activeStep.value));
const currentStepLabel = computed(() => steps[currentStepIndex.value]?.label ?? 'Información');
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1);

const primaryActionLabel = computed(() => {
  if (isLastStep.value) return 'Guardar condominio';
  const nextStep = steps[currentStepIndex.value + 1];
  return nextStep ? `Siguiente: ${nextStep.label}` : 'Siguiente';
});

const primaryActionIcon = computed(() => (isLastStep.value ? 'check' : 'arrow_forward'));

function handlePrimaryAction() {
  handleFooterAction();
}

function goPreviousStep() {
  const previousStep = steps[currentStepIndex.value - 1];
  if (previousStep) {
    activeStep.value = previousStep.name;
  }
}

function goNextStep() {
  const nextStep = steps[currentStepIndex.value + 1];
  if (nextStep) {
    activeStep.value = nextStep.name;
  }
}

function handleFooterAction() {
  if (isLastStep.value) {
    submitForm();
    return;
  }

  goNextStep();
}

function submitForm() {
  if (!form.name.trim() || !form.type) {
    return;
  }

  createdDialogOpen.value = true;
}

function goBack() {
  void router.push('/condominios');
}

function goToCondominio() {
  createdDialogOpen.value = false;
  void router.push('/condominios');
}
</script>

<style scoped>
.new-condo-page {
  min-height: 100%;
  padding: 6px 8px 0 4px;
}

.page-shell {
  display: grid;
  gap: 20px;
}

.page-hero {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.page-hero__eyebrow {
  color: var(--app-primary);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.page-hero__title {
  color: var(--app-text);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-top: 6px;
}

.page-hero__subtitle {
  color: var(--app-text-muted);
  margin-top: 8px;
  max-width: 720px;
}

.page-hero__actions {
  display: flex;
  gap: 10px;
}

.hero-action {
  min-height: 42px;
}

.hero-action--ghost {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.wizard-stepper {
  display: flex;
  flex-wrap: nowrap;
  gap: 10px;
  overflow-x: auto;
  padding: 12px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.9));
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 20px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wizard-stepper::-webkit-scrollbar {
  display: none;
}

.wizard-step {
  align-items: center;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  flex: 0 0 auto;
  gap: 8px;
  min-height: 52px;
  padding: 8px 14px 8px 10px;
  text-align: left;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
}

.wizard-step:hover {
  border-color: rgba(37, 99, 235, 0.16);
  color: var(--app-text);
  transform: translateY(-1px);
}

.wizard-step--active {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.12), rgba(37, 99, 235, 0.06));
  border-color: rgba(37, 99, 235, 0.28);
  color: var(--app-text);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.12);
  transform: translateY(-1px);
}

.wizard-step__number {
  align-items: center;
  background: rgba(37, 99, 235, 0.14);
  border-radius: 999px;
  color: var(--app-primary);
  display: inline-flex;
  font-size: 10px;
  font-weight: 800;
  height: 24px;
  justify-content: center;
  width: 24px;
}

.wizard-step__label {
  font-size: 11px;
  font-weight: 800;
  white-space: nowrap;
}

.wizard-panels {
  background: transparent;
}

.wizard-panel {
  padding: 18px 0 0;
}

.form-layout,
.tab-layout {
  display: grid;
  gap: 20px;
}

.form-layout {
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.75fr);
}

.tab-layout {
  grid-template-columns: minmax(0, 1fr);
}

.tab-layout--summary {
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 0.75fr);
}

.form-card,
.summary-card,
.tab-card {
  overflow: hidden;
}

.tab-card--sticky {
  position: sticky;
  top: 18px;
}

.section-title {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 800;
}

.tab-subtitle {
  color: var(--app-text-muted);
  font-size: 13px;
  margin-top: 6px;
}

.form-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid--split {
  align-items: start;
}

.mini-label {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 8px;
}

.illustration-card {
  border-radius: 18px;
  padding: 14px;
}

.illustration-card__image {
  aspect-ratio: 1 / 1;
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.1), rgba(37, 99, 235, 0.02)),
    url('https://images.unsplash.com/photo-1527576539890-d7b211f9b5d9?auto=format&fit=crop&w=700&q=80')
      center/cover;
  border-radius: 16px;
  min-height: 220px;
}

.illustration-card__hint {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 10px;
  text-align: center;
}

.summary-column {
  display: grid;
  gap: 20px;
}

.summary-preview {
  align-items: center;
  display: flex;
  gap: 14px;
}

.summary-preview__thumbnail {
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0.02)),
    url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=500&q=80')
      center/cover;
  border-radius: 18px;
  height: 92px;
  width: 92px;
}

.summary-preview__name {
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 8px;
}

.summary-list {
  display: grid;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.summary-item__label {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.summary-item__value {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  text-align: right;
}

.summary-item__value--wrap {
  max-width: 180px;
  white-space: normal;
}

.admin-box {
  align-items: center;
  background: rgba(15, 23, 42, 0.03);
  border-radius: 16px;
  display: flex;
  gap: 12px;
  padding: 14px;
}

.admin-box__name {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}

.admin-box__meta {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.map-card {
  background: rgba(15, 23, 42, 0.02);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  overflow: hidden;
  padding: 14px;
}

.map-card__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.map-card__title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
}

.map-card__action {
  color: var(--app-primary);
}

.map-card__image {
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.12), rgba(37, 99, 235, 0.04)),
    url('https://images.unsplash.com/photo-1502920917128-1aa500764ce7?auto=format&fit=crop&w=1200&q=80')
      center/cover;
  border-radius: 16px;
  height: 250px;
  margin-top: 12px;
}

.config-block {
  background: rgba(15, 23, 42, 0.02);
  border-radius: 18px;
}

.config-block__title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
}

.config-block__grid {
  display: grid;
  gap: 12px 20px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 14px;
}

.amenities-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.amenity-card {
  align-items: center;
  background: rgba(15, 23, 42, 0.02);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  display: flex;
  gap: 14px;
  padding: 14px;
}

.amenity-card__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 14px;
  color: var(--app-primary);
  display: inline-flex;
  flex: 0 0 42px;
  height: 42px;
  justify-content: center;
}

.amenity-card__copy {
  flex: 1;
  min-width: 0;
}

.amenity-card__title {
  color: var(--app-text);
  font-weight: 800;
}

.amenity-card__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.summary-final {
  display: grid;
  gap: 18px;
}

.summary-final__hero {
  align-items: center;
  display: flex;
  gap: 14px;
}

.summary-final__thumbnail {
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.06), rgba(37, 99, 235, 0.02)),
    url('https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=500&q=80')
      center/cover;
  border-radius: 18px;
  height: 92px;
  width: 92px;
}

.summary-final__name {
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 8px;
}

.summary-final__grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-final__item {
  background: rgba(15, 23, 42, 0.02);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 14px;
}

.summary-final__label {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.summary-final__value {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  margin-top: 4px;
}

.summary-action-card__text {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.55;
  margin-top: 6px;
}

.wizard-footer {
  align-items: center;
  background: #fff;
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
}

.wizard-footer__left {
  display: grid;
  gap: 4px;
}

.wizard-footer__step {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.wizard-footer__label {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 800;
}

.wizard-footer__actions {
  display: flex;
  gap: 10px;
}

.wizard-footer__btn {
  min-width: 150px;
}

.wizard-footer__btn--ghost {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

@media (max-width: 1180px) {
  .form-layout,
  .tab-layout--summary {
    grid-template-columns: 1fr;
  }

  .amenities-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .page-hero {
    flex-direction: column;
  }

  .page-hero__actions {
    width: 100%;
  }

  .hero-action {
    flex: 1;
  }

  .form-grid,
  .config-block__grid,
  .summary-final__grid {
    grid-template-columns: 1fr;
  }

  .wizard-stepper {
    padding: 10px;
  }

  .wizard-step {
    min-height: 48px;
    padding-inline: 12px;
  }

  .wizard-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .wizard-footer__actions {
    flex-direction: column;
  }

  .wizard-footer__btn {
    min-width: 0;
    width: 100%;
  }
}
</style>
