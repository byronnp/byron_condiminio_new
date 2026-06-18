<template>
  <q-page class="new-admin-page">
    <div class="page-shell">
      <header class="page-header">
        <div class="page-header__heading">
          <h1 class="page-header__title">Crear nuevo administrador</h1>
          <p class="page-header__subtitle">
            Asigna un administrador, define sus permisos y revisa el resumen antes de guardar.
          </p>
        </div>

        <div class="page-header__actions">
          <q-btn
            flat
            no-caps
            label="Volver a administradores"
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
            :key="step.key"
            type="button"
            class="wizard-step"
            :class="{ 'wizard-step--active': activeStep === step.key, 'wizard-step--done': stepIndex(step.key) < activeStepIndex }"
            @click="activeStep = step.key"
          >
            <span class="wizard-step__number">{{ index + 1 }}</span>
            <span class="wizard-step__label">{{ step.label }}</span>
          </button>
        </div>

        <q-separator class="wizard-divider" />

        <div class="wizard-layout">
          <section class="wizard-main">
            <q-form class="wizard-form" @submit.prevent="handlePrimaryAction">
              <transition name="fade-slide" mode="out-in">
                <q-card :key="activeStep" flat bordered class="wizard-card">
                  <q-card-section>
                    <div class="section-title">{{ currentStep.title }}</div>
                    <div class="section-subtitle">{{ currentStep.subtitle }}</div>

                    <div v-if="activeStep === 'personal'" class="q-mt-md">
                      <div class="upload-box">
                        <div class="upload-box__icon">
                          <q-icon name="photo_camera" size="22px" />
                        </div>
                        <div class="upload-box__copy">
                          <div class="upload-box__title">Subir foto (opcional)</div>
                          <div class="upload-box__text">JPG, PNG. Max. 2 MB.</div>
                        </div>
                      </div>

                      <div class="form-grid q-mt-md">
                        <q-input v-model="form.firstName" dense outlined hide-bottom-space label="Nombres *" :rules="[requiredRule]" />
                        <q-input v-model="form.lastName" dense outlined hide-bottom-space label="Apellidos *" :rules="[requiredRule]" />
                        <q-input v-model="form.email" dense outlined hide-bottom-space label="Correo electronico *" :rules="[requiredRule, emailRule]" />
                        <q-input v-model="form.phone" dense outlined hide-bottom-space label="Telefono *" :rules="[requiredRule]" />
                        <q-input v-model="form.idNumber" dense outlined hide-bottom-space label="Cedula / Identificacion *" :rules="[requiredRule]" />
                        <q-input v-model="form.birthDate" dense outlined hide-bottom-space label="Fecha de nacimiento (opcional)" />
                        <q-select v-model="form.position" dense outlined hide-bottom-space :options="positionOptions" label="Cargo / Posicion *" :rules="[requiredRule]" />
                        <q-input v-model="form.department" dense outlined hide-bottom-space label="Departamento / Area" />
                      </div>
                    </div>

                    <div v-else-if="activeStep === 'roles'" class="q-mt-md">
                      <div class="form-grid form-grid--split">
                        <q-card flat bordered class="support-card">
                          <q-card-section class="support-card__content">
                            <div class="support-card__icon support-card__icon--soft">
                              <q-icon name="shield" size="20px" />
                            </div>
                            <div class="support-card__copy">
                              <div class="support-card__title">Rol asignado</div>
                              <div class="support-card__text">
                                Selecciona el rol principal que tendra este administrador.
                              </div>
                            </div>
                          </q-card-section>
                          <q-card-section class="support-card__body">
                            <q-select
                              v-model="form.role"
                              dense
                              outlined
                              hide-bottom-space
                              :options="roleOptions"
                              label="Rol *"
                              :rules="[requiredRule]"
                            />

                            <div class="mini-label q-mt-md">Estado de la cuenta</div>
                            <div class="row items-center q-gutter-lg q-mt-xs">
                              <q-radio v-model="form.status" val="Activo" label="Activo" dense />
                              <q-radio v-model="form.status" val="Inactivo" label="Inactivo" dense />
                            </div>
                          </q-card-section>
                        </q-card>

                        <q-card flat bordered class="support-card">
                          <q-card-section class="support-card__content">
                            <div class="support-card__icon support-card__icon--green">
                              <q-icon name="fact_check" size="20px" />
                            </div>
                            <div class="support-card__copy">
                              <div class="support-card__title">Permisos principales</div>
                              <div class="support-card__text">
                                Define el alcance funcional de este administrador.
                              </div>
                            </div>
                          </q-card-section>

                          <q-card-section class="support-card__body">
                            <div class="permission-list">
                              <q-checkbox v-model="permissions" val="propietarios" label="Gestion de propietarios y residentes" dense />
                              <q-checkbox v-model="permissions" val="pagos" label="Cobros y manejo de pagos" dense />
                              <q-checkbox v-model="permissions" val="reservas" label="Reservas y areas comunes" dense />
                              <q-checkbox v-model="permissions" val="mantenimiento" label="Mantenimiento y reportes" dense />
                              <q-checkbox v-model="permissions" val="comunicados" label="Comunicacion y notificaciones" dense />
                              <q-checkbox v-model="permissions" val="reportes" label="Reportes del condominio" dense />
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>

                    <div v-else-if="activeStep === 'access'" class="q-mt-md">
                      <div class="form-grid">
                        <q-input
                          v-model="form.username"
                          dense
                          outlined
                          hide-bottom-space
                          label="Nombre de usuario *"
                          :rules="[requiredRule]"
                        />
                        <div class="password-field">
                          <q-input
                            v-model="form.tempPassword"
                            dense
                            outlined
                            hide-bottom-space
                            :type="showPassword ? 'text' : 'password'"
                            label="Contrasena temporal *"
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

                          <q-btn flat no-caps label="Generar nueva" icon="refresh" class="password-action" @click="generatePassword" />
                        </div>
                      </div>

                      <q-card flat bordered class="info-banner q-mt-md">
                        <q-card-section class="info-banner__content">
                          <q-icon name="info" size="18px" />
                          <div>
                            El administrador debera cambiar la contrasena al iniciar sesion por primera vez.
                          </div>
                        </q-card-section>
                      </q-card>

                      <div class="q-mt-md">
                        <div class="mini-label">Tipo de acceso</div>
                        <div class="row items-center q-gutter-lg q-mt-xs">
                          <q-radio v-model="form.accessType" val="invitation" label="Invitacion" dense />
                          <q-radio v-model="form.accessType" val="manual" label="Manual" dense />
                        </div>
                      </div>
                    </div>

                    <div v-else class="q-mt-md">
                      <div class="review-grid">
                        <q-card flat bordered class="review-card">
                          <q-card-section>
                            <div class="review-card__title">Informacion personal</div>
                            <div class="review-card__list">
                              <div><span>Nombre:</span><strong>{{ fullName || 'Sin datos' }}</strong></div>
                              <div><span>Correo:</span><strong>{{ form.email || 'Sin datos' }}</strong></div>
                              <div><span>Telefono:</span><strong>{{ form.phone || 'Sin datos' }}</strong></div>
                              <div><span>Identificacion:</span><strong>{{ form.idNumber || 'Sin datos' }}</strong></div>
                            </div>
                          </q-card-section>
                        </q-card>

                        <q-card flat bordered class="review-card">
                          <q-card-section>
                            <div class="review-card__title">Rol y permisos</div>
                            <div class="review-card__list">
                              <div><span>Rol:</span><strong>{{ form.role || 'Sin rol' }}</strong></div>
                              <div><span>Estado:</span><strong>{{ form.status }}</strong></div>
                              <div><span>Permisos:</span><strong>{{ permissions.length }} modulos habilitados</strong></div>
                              <div><span>Usuario:</span><strong>{{ form.username || 'Sin usuario' }}</strong></div>
                            </div>
                          </q-card-section>
                        </q-card>

                        <q-card flat bordered class="review-card">
                          <q-card-section>
                            <div class="review-card__title">Acceso al sistema</div>
                            <div class="review-card__list">
                              <div><span>Usuario:</span><strong>{{ form.username || 'Sin usuario' }}</strong></div>
                              <div><span>Clave temporal:</span><strong>{{ passwordPreview }}</strong></div>
                              <div><span>Tipo:</span><strong>{{ form.accessType === 'invitation' ? 'Invitacion' : 'Manual' }}</strong></div>
                            </div>
                          </q-card-section>
                        </q-card>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
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
                    :disable="activeStepIndex === 0"
                    @click="previousStep"
                  />
                  <q-btn
                    unelevated
                    no-caps
                    :label="activeStep === 'review' ? 'Crear administrador' : 'Siguiente'"
                    :icon="activeStep === 'review' ? 'check' : 'arrow_forward'"
                    color="primary"
                    class="footer-btn footer-btn--primary"
                    @click="handlePrimaryAction"
                  />
                </div>
              </div>
            </q-form>
          </section>

          <aside class="wizard-summary">
            <q-card flat bordered class="summary-card">
              <q-card-section class="summary-card__header">
                <div class="summary-avatar">
                  <q-icon name="manage_accounts" size="28px" />
                </div>
                <div>
                  <div class="summary-title">Resumen del administrador</div>
                  <div class="summary-subtitle">Vista previa antes de guardar</div>
                </div>
              </q-card-section>

              <q-card-section>
                <div class="summary-name">{{ fullName || 'Nombre completo' }}</div>
                <div class="summary-meta">
                  <span>Correo electronico:</span>
                  <strong>{{ form.email || '-' }}</strong>
                </div>
                <div class="summary-meta">
                  <span>Cargo:</span>
                  <strong>{{ form.position || '-' }}</strong>
                </div>
                <div class="summary-meta">
                  <span>Estado:</span>
                  <q-badge :color="form.status === 'Activo' ? 'positive' : 'grey'" rounded>
                    {{ form.status }}
                  </q-badge>
                </div>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="summary-card">
              <q-card-section>
                <div class="summary-title">Rol asignado</div>
                <div class="summary-subtitle">
                  Selecciona el rol principal que tendra este administrador.
                </div>

                <q-select
                  v-model="form.role"
                  class="q-mt-md"
                  dense
                  outlined
                  hide-bottom-space
                  :options="roleOptions"
                  label="Rol *"
                  :rules="[requiredRule]"
                />

                <q-card flat bordered class="summary-note q-mt-md">
                  <q-card-section class="summary-note__content">
                    <q-icon name="check_circle" size="18px" />
                    <div>
                      Los administradores del condominio pueden gestionar propietarios, residentes,
                      pagos, reservas, mantenimiento y reportes del condominio.
                    </div>
                  </q-card-section>
                </q-card>
              </q-card-section>
            </q-card>

            <q-card flat bordered class="summary-card">
              <q-card-section>
                <div class="summary-title">Permisos principales</div>
                <div class="summary-subtitle">
                  Este rol tendra acceso a las siguientes funcionalidades.
                </div>

                <div class="summary-permissions">
                  <div v-for="item in summaryPermissions" :key="item" class="summary-permissions__item">
                    <q-icon name="done" size="16px" />
                    <span>{{ item }}</span>
                  </div>
                </div>

                <q-btn flat no-caps label="Personalizar permisos" icon="arrow_forward" class="summary-link" />
              </q-card-section>
            </q-card>
          </aside>
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

type StepKey = 'personal' | 'roles' | 'access' | 'review';

const steps = [
  { key: 'personal', label: 'Informacion personal', title: 'Informacion personal', subtitle: 'Completa los datos basicos del administrador.' },
  { key: 'roles', label: 'Rol y permisos', title: 'Rol y permisos', subtitle: 'Define el alcance y los permisos principales.' },
  { key: 'access', label: 'Acceso al sistema', title: 'Acceso al sistema', subtitle: 'Configura el usuario y la contrasena temporal.' },
  { key: 'review', label: 'Revision y confirmacion', title: 'Revision y confirmacion', subtitle: 'Verifica la informacion antes de crear el administrador.' },
] as const;

const activeStep = ref<StepKey>('personal');
const showPassword = ref(false);
const permissions = ref(['propietarios', 'pagos', 'reservas', 'mantenimiento', 'comunicados', 'reportes']);

type AdminForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  birthDate: string;
  position: string;
  department: string;
  role: string;
  status: 'Activo' | 'Inactivo';
  username: string;
  tempPassword: string;
  accessType: 'invitation' | 'manual';
};

const form = ref<AdminForm>({
  firstName: 'Andres',
  lastName: 'Felipe Salazar Diaz',
  email: 'andres.salazar@vistareal.com',
  phone: '+593 99 876 5432',
  idNumber: '1712345678',
  birthDate: '',
  position: 'Administrador',
  department: 'Administracion',
  role: 'Administrador del condominio',
  status: 'Activo',
  username: 'asalazar',
  tempPassword: 'K7J9mQ92',
  accessType: 'invitation',
});

const positionOptions = ['Administrador', 'Coordinacion', 'Finanzas', 'Mantenimiento'];
const roleOptions = ['Administrador del condominio', 'Administrador principal', 'Invitado'];
const summaryPermissions = [
  'Gestion de propietarios y residentes',
  'Cobros y manejo de pagos',
  'Reservas y areas comunes',
  'Mantenimiento y reportes',
  'Comunicacion y notificaciones',
  'Reportes del condominio',
];

const activeStepIndex = computed(() => steps.findIndex((step) => step.key === activeStep.value));
const currentStep = computed(() => steps[activeStepIndex.value] ?? steps[0]);
const fullName = computed(() => `${form.value.firstName} ${form.value.lastName}`.trim());
const passwordPreview = computed(() => form.value.tempPassword || '********');

function stepIndex(step: StepKey) {
  return steps.findIndex((item) => item.key === step);
}

function previousStep() {
  const index = Math.max(0, activeStepIndex.value - 1);
  const targetStep = steps[index];
  activeStep.value = targetStep ? targetStep.key : 'personal';
}

function nextStep() {
  const index = Math.min(steps.length - 1, activeStepIndex.value + 1);
  const targetStep = steps[index];
  activeStep.value = targetStep ? targetStep.key : 'review';
}

function handlePrimaryAction() {
  if (activeStep.value === 'review') {
    void router.push({ name: 'administradores' });
    return;
  }

  nextStep();
}

function generatePassword() {
  form.value.tempPassword = 'K7J9mQ92';
}

function requiredRule(value: unknown) {
  return (
    value !== null &&
    value !== undefined &&
    (!(typeof value === 'string') || value.trim().length > 0)
  ) || 'Campo requerido';
}

function emailRule(value: unknown) {
  if (typeof value !== 'string') {
    return 'Correo invalido';
  }

  const text = value.trim();
  return !text || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text) || 'Correo invalido';
}

function minLengthRule(min: number) {
  return (value: unknown) =>
    (typeof value === 'string' && value.length >= min) || `Minimo ${min} caracteres`;
}

function goBack() {
  void router.push({ name: 'administradores' });
}
</script>

<style scoped>
.new-admin-page {
  min-height: 100%;
}

.page-shell {
  display: grid;
  gap: 16px;
}

.page-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 16px;
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
  line-height: 1.4;
  margin-top: 4px;
  max-width: 720px;
}

.page-header__actions {
  padding-top: 6px;
}

.wizard-frame {
  border-radius: 18px;
  overflow: hidden;
  padding: 16px;
}

.wizard-steps {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.wizard-step {
  align-items: center;
  background: #f8fbff;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 14px;
  color: var(--app-text-muted);
  cursor: pointer;
  display: inline-flex;
  gap: 10px;
  min-height: 44px;
  padding: 0 14px;
  white-space: nowrap;
}

.wizard-step--active {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.18);
  color: var(--app-primary);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.08);
}

.wizard-step--done {
  color: var(--app-text);
}

.wizard-step__number {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 999px;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  height: 24px;
  justify-content: center;
  width: 24px;
}

.wizard-step--active .wizard-step__number {
  background: var(--app-primary);
  border-color: var(--app-primary);
  color: #fff;
}

.wizard-step__label {
  font-size: 12px;
  font-weight: 700;
}

.wizard-divider {
  margin: 8px 0 16px;
  opacity: 0.45;
}

.wizard-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
}

.wizard-main {
  min-width: 0;
}

.wizard-form {
  display: grid;
  gap: 16px;
}

.wizard-card {
  border-radius: 16px;
}

.section-title {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.section-subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.form-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid--split {
  align-items: stretch;
}

.upload-box {
  align-items: center;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.04), rgba(37, 99, 235, 0.02));
  border: 1px dashed rgba(37, 99, 235, 0.16);
  border-radius: 16px;
  color: var(--app-text);
  display: flex;
  gap: 12px;
  min-height: 108px;
  padding: 18px;
}

.upload-box__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.12);
  border-radius: 16px;
  color: var(--app-primary);
  display: inline-flex;
  flex: 0 0 48px;
  height: 48px;
  justify-content: center;
}

.upload-box__title,
.support-card__title {
  font-size: 14px;
  font-weight: 800;
}

.upload-box__text,
.support-card__text {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.support-card {
  border-radius: 16px;
  height: 100%;
}

.support-card__content {
  align-items: center;
  display: flex;
  gap: 12px;
}

.support-card__icon {
  align-items: center;
  border-radius: 14px;
  display: inline-flex;
  flex: 0 0 40px;
  height: 40px;
  justify-content: center;
}

.support-card__icon--soft {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
}

.support-card__icon--green {
  background: rgba(34, 197, 94, 0.12);
  color: #16a34a;
}

.support-card__body {
  display: grid;
  gap: 12px;
  padding-top: 0;
}

.mini-label {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
}

.permission-list {
  display: grid;
  gap: 10px;
}

.password-field {
  display: grid;
  gap: 10px;
}

.password-action {
  justify-self: flex-start;
  padding-left: 0;
}

.info-banner {
  background: rgba(37, 99, 235, 0.05);
  border-radius: 14px;
}

.info-banner__content {
  align-items: center;
  color: var(--app-primary);
  display: flex;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
}

.review-grid {
  display: grid;
  gap: 12px;
}

.review-card {
  border-radius: 16px;
}

.review-card__title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
}

.review-card__list {
  display: grid;
  gap: 8px;
  margin-top: 12px;
}

.review-card__list div,
.summary-meta {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  font-size: 12px;
  justify-content: space-between;
  gap: 10px;
}

.review-card__list strong,
.summary-meta strong {
  color: var(--app-text);
  font-weight: 700;
  text-align: right;
}

.wizard-footer {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-top: 4px;
}

.wizard-footer__actions {
  display: flex;
  gap: 10px;
}

.footer-btn {
  min-height: 42px;
  min-width: 126px;
}

.footer-btn--primary {
  min-width: 178px;
}

.summary-card {
  border-radius: 16px;
}

.wizard-summary {
  display: grid;
  gap: 12px;
  align-content: start;
}

.summary-card__header {
  align-items: center;
  display: flex;
  gap: 12px;
}

.summary-avatar {
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 999px;
  color: var(--app-primary);
  display: inline-flex;
  height: 54px;
  justify-content: center;
  width: 54px;
}

.summary-title {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 800;
}

.summary-subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.summary-name {
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.2;
}

.summary-note {
  background: rgba(34, 197, 94, 0.08);
  border-radius: 14px;
}

.summary-note__content {
  align-items: flex-start;
  color: #166534;
  display: flex;
  gap: 10px;
  font-size: 12px;
  font-weight: 600;
}

.summary-permissions {
  display: grid;
  gap: 10px;
  margin-top: 12px;
}

.summary-permissions__item {
  align-items: center;
  color: var(--app-text);
  display: flex;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
}

.summary-permissions__item :deep(.q-icon) {
  color: #16a34a;
}

.summary-link {
  margin-top: 10px;
  padding-left: 0;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (max-width: 1200px) {
  .wizard-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .wizard-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .wizard-footer__actions {
    flex-direction: column;
  }

  .footer-btn,
  .footer-btn--primary {
    width: 100%;
  }
}
</style>
