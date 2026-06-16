<template>
  <q-page class="new-condo-page">
    <div class="page-shell">
      <header class="page-header">
        <div class="page-header__heading">
          <h1 class="page-header__title">Nuevo condominio</h1>
          <p class="page-header__subtitle">
            Registra la información base del condominio antes de continuar con el resto del
            asistente.
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

      <q-stepper
        v-model="activeStep"
        flat
        bordered
        animated
        header-nav
        active-color="primary"
        done-color="primary"
        inactive-color="grey-7"
        class="wizard-stepper"
      >
        <q-step
          name="info"
          title="Información"
          icon="info"
          :done="completedSteps.info"
          :error="stepError === 'info'"
          :disable="!canAccessStep('info')"
        >
          <q-form ref="infoFormRef" class="wizard-step__form">
            <section class="form-layout">
              <q-card flat bordered class="form-card">
                <q-card-section>
                  <div class="section-title">Información general</div>

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

                    <q-card flat bordered class="support-card">
                      <q-card-section class="support-card__content">
                        <div class="support-card__icon">
                          <q-icon name="image" size="20px" />
                        </div>
                        <div class="support-card__copy">
                          <div class="support-card__title">Imagen principal</div>
                          <div class="support-card__text">
                            Sube una portada clara para identificar el condominio.
                          </div>
                        </div>
                        <q-btn outline dense no-caps label="Cambiar" class="support-card__action" />
                      </q-card-section>
                      <q-separator />
                      <q-card-section class="support-card__footer">
                        JPG o PNG. Máx. 2 MB.
                      </q-card-section>
                    </q-card>
                  </div>
                </q-card-section>
              </q-card>

              <aside class="summary-column">
                <q-card flat bordered class="summary-panel">
                  <q-card-section class="summary-panel__section">
                    <div class="section-title">Ficha rápida</div>
                    <div class="summary-preview q-mt-md">
                      <q-avatar rounded size="52px" class="summary-preview__avatar">
                        <q-icon name="apartment" size="24px" />
                      </q-avatar>
                      <div class="summary-preview__body">
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

                    <div class="summary-list q-mt-md">
                      <div class="summary-item">
                        <span class="summary-item__label">Tipo</span>
                        <span class="summary-item__value">{{ form.type || 'Sin tipo' }}</span>
                      </div>
                      <div class="summary-item">
                        <span class="summary-item__label">Descripción</span>
                        <span class="summary-item__value summary-item__value--wrap">
                          {{ form.description || 'Sin descripción' }}
                        </span>
                      </div>
                    </div>

                    <q-separator class="q-my-md" />

                    <div class="section-title">Responsable asignado</div>
                    <div class="admin-box admin-box--summary q-mt-md">
                      <q-avatar size="42px" class="admin-box__avatar">
                        <img src="https://i.pravatar.cc/100?img=12" alt="Administrador" />
                      </q-avatar>
                      <div class="admin-box__copy">
                        <div class="admin-box__name">{{ adminFullName }}</div>
                        <div class="admin-box__meta">{{ administrator.email || 'Sin correo' }}</div>
                        <div class="admin-box__meta">
                          Usuario: {{ administrator.username || 'Sin usuario' }}
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </aside>
            </section>
          </q-form>
        </q-step>

        <q-step
          name="location"
          title="Ubicación"
          icon="place"
          :done="completedSteps.location"
          :error="stepError === 'location'"
          :disable="!canAccessStep('location')"
        >
          <q-form ref="locationFormRef" class="wizard-step__form">
            <section class="tab-layout">
              <q-card flat bordered class="tab-card">
                <q-card-section>
                  <div class="section-title">Ubicación del condominio</div>
                  <div class="tab-subtitle">Define dónde está ubicado el condominio y su referencia.</div>

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
                    <div class="map-card__body">
                      <q-icon name="map" size="28px" />
                      <div class="map-card__copy">
                        <div class="map-card__body-title">Vista referencial</div>
                        <div class="map-card__body-text">
                          La dirección se usará para geolocalización, entregas y comunicaciones.
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </section>
          </q-form>
        </q-step>

        <q-step
          name="config"
          title="Configuración"
          icon="tune"
          :done="completedSteps.config"
          :error="stepError === 'config'"
          :disable="!canAccessStep('config')"
        >
          <q-form ref="configFormRef" class="wizard-step__form">
            <section class="tab-layout">
              <q-card flat bordered class="tab-card">
                <q-card-section>
                  <div class="section-title">Configuración general</div>
                  <div class="tab-subtitle">Ajusta la estructura, moneda y parámetros base del condominio.</div>

                  <div class="form-grid q-mt-md">
                    <q-input
                      v-model="config.blocks"
                      dense
                      outlined
                      hide-bottom-space
                      type="number"
                      label="Número de torres / bloques *"
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
                  </div>

                  <div class="form-grid q-mt-md">
                    <q-input
                      v-model="config.dueDay"
                      dense
                      outlined
                      hide-bottom-space
                      type="number"
                      label="Día de vencimiento de cuotas *"
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

                  <div class="config-summary q-mt-md">
                    <div class="config-summary__item">
                      <span class="config-summary__label">Bloques</span>
                      <span class="config-summary__value">{{ config.blocks || '0' }}</span>
                    </div>
                    <div class="config-summary__item">
                      <span class="config-summary__label">Unidades</span>
                      <span class="config-summary__value">{{ config.units || '0' }}</span>
                    </div>
                    <div class="config-summary__item">
                      <span class="config-summary__label">Vencimiento</span>
                      <span class="config-summary__value">{{ config.dueDay || '-' }}</span>
                    </div>
                    <div class="config-summary__item">
                      <span class="config-summary__label">Moneda</span>
                      <span class="config-summary__value">{{ config.currency || 'Sin moneda' }}</span>
                    </div>
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
          </q-form>
        </q-step>

        <q-step
          name="amenities"
          title="Amenidades"
          icon="pool"
          :done="completedSteps.amenities"
          :disable="!canAccessStep('amenities')"
        >
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
        </q-step>

        <q-step
          name="admin"
          title="Administrador"
          icon="manage_accounts"
          :done="completedSteps.admin"
          :error="stepError === 'admin'"
          :disable="!canAccessStep('admin')"
        >
          <q-form ref="adminFormRef" class="wizard-step__form">
            <section class="tab-layout">
              <q-card flat bordered class="tab-card">
                <q-card-section>
                  <div class="section-title">Administrador principal</div>
                  <div class="tab-subtitle">Define el usuario responsable del nuevo condominio.</div>

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
                    <q-input
                      v-model="administrator.username"
                      dense
                      outlined
                      hide-bottom-space
                      label="Usuario para acceso *"
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

                    <q-card flat bordered class="admin-box q-mt-md">
                      <q-card-section class="admin-box__content">
                        <q-avatar size="48px">
                          <img src="https://i.pravatar.cc/100?img=12" alt="Administrador" />
                        </q-avatar>
                        <div class="admin-box__copy">
                          <div class="admin-box__eyebrow">Responsable asignado</div>
                          <div class="admin-box__name">{{ adminFullName }}</div>
                          <div class="admin-box__meta">{{ administrator.email || 'Sin correo' }}</div>
                          <div class="admin-box__footer">
                            <q-badge rounded color="primary" class="admin-box__badge">
                              Usuario principal
                            </q-badge>
                            <span class="admin-box__separator">•</span>
                            <span class="admin-box__status">Acceso temporal</span>
                          </div>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </q-card-section>
              </q-card>
            </section>
          </q-form>
        </q-step>

        <q-step
          name="summary"
          title="Resumen"
          icon="fact_check"
          :disable="!canAccessStep('summary')"
        >
          <section class="tab-layout tab-layout--summary">
            <q-card flat bordered class="tab-card">
              <q-card-section>
                <div class="section-title">Resumen del condominio</div>
                <div class="tab-subtitle">Revisa toda la información antes de finalizar.</div>

                <div class="summary-final q-mt-md">
                  <div class="summary-final__hero">
                    <q-avatar rounded size="88px" class="summary-final__thumbnail">
                      <q-icon name="apartment" size="36px" />
                    </q-avatar>
                    <div class="summary-final__hero-copy">
                      <div class="summary-final__eyebrow">Vista ejecutiva</div>
                      <div class="summary-final__name">{{ form.name || 'Nuevo condominio' }}</div>
                      <div class="summary-final__meta">
                        <q-badge :color="form.status === 'Activo' ? 'positive' : 'grey-6'" rounded>
                          {{ form.status }}
                        </q-badge>
                        <span class="summary-final__meta-dot">•</span>
                        <span class="summary-final__meta-text">{{ form.type || 'Sin tipo' }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="summary-final__grid">
                    <div class="summary-final__item">
                      <div class="summary-final__label">Ubicación principal</div>
                      <div class="summary-final__value">
                        {{ location.city || 'Sin ciudad' }}, {{ location.province || 'Sin provincia' }}
                      </div>
                    </div>
                    <div class="summary-final__item">
                      <div class="summary-final__label">Bloques</div>
                      <div class="summary-final__value">{{ config.blocks || '0' }}</div>
                    </div>
                    <div class="summary-final__item">
                      <div class="summary-final__label">Unidades</div>
                      <div class="summary-final__value">{{ config.units || '0' }}</div>
                    </div>
                    <div class="summary-final__item">
                      <div class="summary-final__label">Moneda base</div>
                      <div class="summary-final__value">{{ config.currency || 'Sin moneda' }}</div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="tab-card tab-card--sticky">
              <q-card-section class="summary-action-card">
                <div class="section-title">Listo para crear</div>
                <div class="summary-action-card__text">
                  El botón inferior validará todo el flujo y abrirá el diálogo de confirmación.
                </div>

                <div class="summary-checklist q-mt-md">
                  <div class="summary-checklist__item">
                    <q-icon name="check_circle" color="positive" size="18px" />
                    <span>Información general capturada</span>
                  </div>
                  <div class="summary-checklist__item">
                    <q-icon name="check_circle" color="positive" size="18px" />
                    <span>Ubicación y parámetros base listos</span>
                  </div>
                  <div class="summary-checklist__item">
                    <q-icon name="check_circle" color="positive" size="18px" />
                    <span>Administrador principal definido</span>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </section>
        </q-step>
      </q-stepper>

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

type StepName = 'info' | 'location' | 'config' | 'amenities' | 'admin' | 'summary';

type ValidatableForm = {
  validate: () => Promise<boolean> | boolean;
  resetValidation?: () => void;
};

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
};

const router = useRouter();
const createdDialogOpen = ref(false);
const activeStep = ref<StepName>('info');
const showPassword = ref(false);
const stepError = ref<StepName | null>(null);
const highestAccessibleStepIndex = ref(0);

const infoFormRef = ref<ValidatableForm | null>(null);
const locationFormRef = ref<ValidatableForm | null>(null);
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
] as const satisfies ReadonlyArray<{ number: string; name: StepName; label: string }>;

const stepIndexByName = Object.fromEntries(steps.map((step, index) => [step.name, index])) as Record<
  StepName,
  number
>;

function toText(value: unknown) {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  return '';
}

const requiredRule = (value: unknown) =>
  toText(value).trim().length > 0 ? true : 'Campo requerido';

const emailRule = (value: unknown) => {
  const text = toText(value).trim();
  if (!text) {
    return 'Campo requerido';
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) ? true : 'Ingresa un correo válido';
};

const minLengthRule = (min: number) => (value: unknown) => {
  const text = toText(value).trim();
  if (!text) {
    return 'Campo requerido';
  }

  return text.length >= min ? true : `Debe tener al menos ${min} caracteres`;
};

const phoneRule = (value: unknown) => {
  const text = toText(value).trim();
  if (!text) {
    return true;
  }

  return /^[0-9+()\-\s]{7,20}$/.test(text) ? true : 'Ingresa un teléfono válido';
};

const integerMinRule = (min: number) => (value: unknown) => {
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

const rangeRule = (min: number, max: number) => (value: unknown) => {
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

const currencyRule = (value: unknown) => {
  const text = toText(value).trim();
  if (!text) {
    return true;
  }

  return /^\d+([.,]\d{1,2})?$/.test(text) ? true : 'Ingresa un monto válido';
};

const currentStepIndex = computed(() => stepIndexByName[activeStep.value]);
const currentStepLabel = computed(() => steps[currentStepIndex.value]?.label ?? 'Información');
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === steps.length - 1);
const adminFullName = computed(() => `${administrator.name} ${administrator.lastName}`.trim() || 'Administrador principal');

const completedSteps = reactive<Record<StepName, boolean>>({
  info: false,
  location: false,
  config: false,
  amenities: false,
  admin: false,
  summary: false,
});

function canAccessStep(stepName: StepName) {
  return stepIndexByName[stepName] <= highestAccessibleStepIndex.value;
}

function setStepCompleted(stepName: StepName, value = true) {
  completedSteps[stepName] = value;
  if (!value && stepError.value === stepName) {
    stepError.value = null;
  }
}

async function validateCurrentStep(stepName: StepName) {
  if (stepName === 'amenities' || stepName === 'summary') {
    return true;
  }

  const formRefMap: Partial<Record<StepName, { value: ValidatableForm | null }>> = {
    info: infoFormRef,
    location: locationFormRef,
    config: configFormRef,
    admin: adminFormRef,
  };

  const formRef = formRefMap[stepName];
  if (!formRef?.value) {
    return true;
  }

  const isValid = await formRef.value.validate();
  stepError.value = isValid ? null : stepName;

  if (isValid) {
    setStepCompleted(stepName);
  }

  return isValid;
}

function goPreviousStep() {
  const previousStep = steps[currentStepIndex.value - 1];
  if (previousStep) {
    activeStep.value = previousStep.name;
  }
}

async function goNextStep() {
  const currentStepName = activeStep.value;
  const isValid = await validateCurrentStep(currentStepName);
  if (!isValid) {
    return;
  }

  const nextStep = steps[currentStepIndex.value + 1];
  if (!nextStep) {
    return;
  }

  if (currentStepName === 'amenities') {
    setStepCompleted('amenities');
  }

  highestAccessibleStepIndex.value = Math.max(highestAccessibleStepIndex.value, currentStepIndex.value + 1);
  activeStep.value = nextStep.name;
}

async function handleFooterAction() {
  if (isLastStep.value) {
    await submitForm();
    return;
  }

  await goNextStep();
}

async function submitForm() {
  const stepsToValidate: StepName[] = ['info', 'location', 'config', 'admin'];

  for (const stepName of stepsToValidate) {
    const isValid = await validateCurrentStep(stepName);
    if (!isValid) {
      activeStep.value = stepName;
      highestAccessibleStepIndex.value = Math.max(highestAccessibleStepIndex.value, stepIndexByName[stepName]);
      return;
    }
  }

  setStepCompleted('summary');
  highestAccessibleStepIndex.value = Math.max(highestAccessibleStepIndex.value, stepIndexByName.summary);
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
  gap: 22px;
}

.page-breadcrumbs {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 14px;
}

.page-header__heading {
  min-width: 0;
}

.page-header__title {
  color: var(--app-text);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.page-header__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 4px;
  max-width: 720px;
}

.page-header__actions {
  display: flex;
  gap: 10px;
}

.header-action {
  min-height: 42px;
}

.header-action--ghost {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.wizard-stepper {
  border-radius: 18px;
  overflow: hidden;
}

.wizard-stepper :deep(.q-stepper__header) {
  background: #fff;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  flex-wrap: nowrap;
  gap: 8px;
  overflow-x: auto;
  padding: 10px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.wizard-stepper :deep(.q-stepper__header::-webkit-scrollbar) {
  display: none;
}

.wizard-stepper :deep(.q-stepper__tab) {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.04);
  color: var(--app-text-muted);
  flex: 0 0 auto;
  margin: 0;
  min-height: 46px;
  padding-inline: 14px;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;
}

.wizard-stepper :deep(.q-stepper__tab:hover) {
  border-color: rgba(37, 99, 235, 0.16);
  color: var(--app-text);
  transform: translateY(-1px);
}

.wizard-stepper :deep(.q-stepper__tab--active) {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.12), rgba(37, 99, 235, 0.06));
  border-color: rgba(37, 99, 235, 0.28);
  color: var(--app-text);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.12);
}

.wizard-stepper :deep(.q-stepper__tab--done) {
  border-color: rgba(34, 197, 94, 0.18);
}

.wizard-stepper :deep(.q-stepper__title) {
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1;
}

.wizard-stepper :deep(.q-stepper__caption) {
  color: var(--app-text-muted);
  font-size: 9px;
  line-height: 1;
  margin-top: 2px;
}

.wizard-stepper :deep(.q-stepper__dot) {
  background: rgba(37, 99, 235, 0.14);
  box-shadow: none;
  color: var(--app-primary);
  height: 22px;
  margin-right: 8px;
  width: 22px;
}

.wizard-stepper :deep(.q-stepper__dot .q-icon) {
  font-size: 13px;
}

.wizard-stepper :deep(.q-stepper__tab--active .q-stepper__dot) {
  background: rgba(37, 99, 235, 0.18);
}

.wizard-stepper :deep(.q-stepper__step) {
  padding: 16px 0 0;
}

.wizard-step__form {
  display: block;
}

.form-layout,
.tab-layout {
  display: grid;
  gap: 18px;
}

.form-layout {
  grid-template-columns: minmax(0, 1fr) minmax(300px, 340px);
  align-items: start;
}

.tab-layout {
  grid-template-columns: minmax(0, 1fr);
}

.tab-layout--summary {
  grid-template-columns: minmax(0, 1fr) minmax(300px, 340px);
  align-items: start;
}

.form-card,
.tab-card,
.summary-panel {
  border-radius: 16px;
  overflow: hidden;
}

.tab-card--sticky {
  position: sticky;
  top: 18px;
}

.section-title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.tab-subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.4;
  margin-top: 4px;
}

.form-grid {
  display: grid;
  gap: 10px;
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
  border-radius: 14px;
  padding: 14px;
}

.illustration-card__image {
  aspect-ratio: 1 / 1;
  background:
    url('https://images.unsplash.com/photo-1527576539890-d7b211f9b5d9?auto=format&fit=crop&w=700&q=80')
      center/cover;
  border-radius: 12px;
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
  gap: 12px;
}

.summary-panel {
  display: grid;
}

.summary-panel__section {
  padding-bottom: 16px;
}

.summary-preview {
  align-items: center;
  display: flex;
  gap: 14px;
}

.summary-preview__avatar {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
  flex-shrink: 0;
}

.summary-preview__body {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.summary-preview__name {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.summary-preview__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-list {
  display: grid;
  gap: 10px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.summary-item__label {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.summary-item__value {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  text-align: right;
}

.summary-item__value--wrap {
  max-width: 170px;
  white-space: normal;
}

.admin-box {
  border-radius: 14px;
  align-items: center;
  display: flex;
  gap: 12px;
  padding: 12px 14px;
}

.admin-box__avatar {
  flex-shrink: 0;
}

.admin-box__copy {
  display: grid;
  gap: 4px;
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
  font-size: 12px;
  font-weight: 800;
}

.admin-box__meta {
  color: var(--app-text-muted);
  font-size: 11px;
}

.admin-box__footer {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}

.admin-box__badge {
  font-size: 9px;
  font-weight: 700;
}

.admin-box__separator {
  color: rgba(15, 23, 42, 0.28);
  font-size: 12px;
}

.admin-box__status {
  font-size: 10px;
  font-weight: 700;
}

.map-card {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
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
  font-size: 12px;
  font-weight: 800;
}

.map-card__action {
  color: var(--app-primary);
}

.map-card__body {
  align-items: center;
  background: rgba(37, 99, 235, 0.04);
  border: 1px solid rgba(37, 99, 235, 0.08);
  border-radius: 12px;
  color: var(--app-text);
  display: flex;
  gap: 12px;
  margin-top: 12px;
  min-height: 152px;
  padding: 16px;
}

.map-card__copy {
  display: grid;
  gap: 4px;
}

.map-card__body-title {
  font-size: 13px;
  font-weight: 800;
}

.map-card__body-text {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.5;
}

.config-block {
  background: #fff;
  border-radius: 14px;
}

.config-summary {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.config-summary__item {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 12px;
  display: grid;
  gap: 2px;
  padding: 10px 12px;
}

.config-summary__label {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
}

.config-summary__value {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
}

.config-block__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
}

.config-block__grid {
  display: grid;
  gap: 8px 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 14px;
}

.amenities-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.amenity-card {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
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
  font-size: 11px;
  margin-top: 2px;
}

.summary-final {
  display: grid;
  gap: 12px;
}

.summary-final__hero {
  align-items: center;
  display: flex;
  gap: 12px;
}

.summary-final__hero-copy {
  display: grid;
  gap: 3px;
}

.summary-final__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-final__thumbnail {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
}

.summary-final__name {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

.summary-final__meta {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.summary-final__meta-dot {
  color: rgba(15, 23, 42, 0.28);
  font-size: 12px;
}

.summary-final__meta-text {
  font-size: 10px;
  font-weight: 700;
}

.summary-final__grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-final__item {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  padding: 12px 14px;
}

.summary-final__label {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.summary-final__value {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  margin-top: 4px;
}

.summary-action-card__text {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.55;
  margin-top: 6px;
}

.summary-checklist {
  display: grid;
  gap: 10px;
}

.summary-checklist__item {
  align-items: center;
  color: var(--app-text);
  display: flex;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
}

.support-card {
  border-radius: 14px;
  overflow: hidden;
}

.support-card__content {
  align-items: center;
  display: flex;
  gap: 12px;
  padding: 14px;
}

.support-card__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 12px;
  color: var(--app-primary);
  display: inline-flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.support-card__copy {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.support-card__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
}

.support-card__text {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.4;
}

.support-card__action {
  margin-left: auto;
  flex-shrink: 0;
}

.support-card__footer {
  color: var(--app-text-muted);
  font-size: 11px;
  padding: 10px 14px 12px;
}

.wizard-footer {
  align-items: center;
  background: #fff;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
}

.wizard-footer__left {
  display: grid;
  gap: 4px;
}

.wizard-footer__step {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.wizard-footer__label {
  color: var(--app-text);
  font-size: 14px;
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
  .config-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .amenities-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
  }

  .page-header__actions {
    width: 100%;
  }

  .header-action {
    flex: 1;
  }

  .form-grid,
  .config-summary,
  .config-block__grid,
  .summary-final__grid {
    grid-template-columns: 1fr;
  }

  .form-layout,
  .tab-layout--summary {
    grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
    overflow-x: auto;
  }

  .summary-column,
  .tab-card--sticky {
    min-width: 280px;
  }

  .summary-final__hero {
    align-items: flex-start;
  }

  .wizard-stepper :deep(.q-stepper__header) {
    padding: 8px;
  }

  .wizard-stepper :deep(.q-stepper__tab) {
    min-height: 46px;
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
