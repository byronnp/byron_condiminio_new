<template>
  <q-page class="auth-page">
    <div class="auth-shell">
      <section class="auth-hero" :aria-label="`Presentación de ${appName}`">
        <q-img class="auth-hero__image" :src="loginHero" fit="cover" alt="Condominio moderno">
          <div class="auth-hero__overlay" />
          <div class="auth-hero__content">
            <div class="auth-hero__brand">
              <img class="auth-hero__logo" :src="logoSaficClaro" :alt="appName" />
            </div>

            <div class="auth-hero__copy">
              <h1 class="auth-hero__title">Sistema de Administración Financiera de Condominios</h1>
              <p class="auth-hero__subtitle">
                Centraliza viviendas, administradores y operaciones con una experiencia clara,
                segura y organizada.
              </p>
            </div>

            <div class="auth-benefits" aria-label="Beneficios principales">
              <div class="auth-benefit">
                <div class="auth-benefit__icon">
                  <q-icon name="domain" size="19px" />
                </div>
                <div>
                  <div class="auth-benefit__title">Operación centralizada</div>
                  <div class="auth-benefit__text">
                    Gestiona condominios, viviendas y equipos administrativos con orden.
                  </div>
                </div>
              </div>

              <div class="auth-benefit">
                <div class="auth-benefit__icon">
                  <q-icon name="verified_user" size="19px" />
                </div>
                <div>
                  <div class="auth-benefit__title">Acceso seguro</div>
                  <div class="auth-benefit__text">
                    El sistema asigna automáticamente tu contexto de trabajo al iniciar sesión.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </q-img>
      </section>

      <section class="auth-panel" aria-label="Formulario de acceso">
        <div class="auth-panel__card">
          <div class="auth-panel__brand">
            <img class="auth-panel__logo" :src="logoSafic" :alt="appName" />
          </div>

          <div class="auth-panel__heading">
            <div class="auth-panel__eyebrow">Acceso seguro</div>
            <div class="auth-panel__title">Inicia sesión</div>
            <div class="auth-panel__subtitle">
              Ingresa con tu cuenta para continuar con la administración del condominio.
            </div>
          </div>

          <q-form class="auth-form" @submit.prevent="handleSubmitLogin">
            <q-input
              v-model="email"
              dense
              outlined
              type="email"
              label="Correo electrónico"
              placeholder="nombre@correo.com"
              autocomplete="email"
              inputmode="email"
              :rules="[requiredRule, emailRule]"
              :disable="isSubmitting"
            >
              <template #prepend>
                <q-icon name="mail_outline" />
              </template>
            </q-input>

            <q-input
              v-model="password"
              dense
              outlined
              :type="showPassword ? 'text' : 'password'"
              label="Contraseña"
              placeholder="Ingresa tu contraseña"
              autocomplete="current-password"
              :rules="[requiredRule]"
              :disable="isSubmitting"
            >
              <template #prepend>
                <q-icon name="lock_outline" />
              </template>
              <template #append>
                <q-btn
                  type="button"
                  flat
                  round
                  dense
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  :aria-label="showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="auth-form__meta">
              <q-checkbox v-model="rememberMe" dense label="Recordarme" :disable="isSubmitting" />
              <div class="auth-form__support">Soporte de acceso mediante administración.</div>
            </div>

            <q-banner
              v-if="activationMessage"
              class="auth-form__success"
              dense
              rounded
              role="status"
            >
              <template #avatar>
                <q-icon name="check_circle" color="positive" />
              </template>
              <span>{{ activationMessage }}</span>
            </q-banner>

            <q-banner v-if="errorMessage" class="auth-form__error" dense rounded role="alert">
              <template #avatar>
                <q-icon name="error_outline" color="negative" />
              </template>
              <span>{{ errorMessage }}</span>
            </q-banner>

            <q-btn
              class="auth-form__submit"
              color="primary"
              unelevated
              no-caps
              label="Iniciar sesión"
              icon="login"
              type="submit"
              :loading="isSubmitting"
              :disable="isSubmitting"
            />

            <div class="auth-form__security">
              <q-separator class="auth-form__security-line" />
              <div class="auth-form__security-text">
                <q-icon name="shield" size="16px" />
                <span>Conexión segura y contexto protegido</span>
              </div>
              <q-separator class="auth-form__security-line" />
            </div>
          </q-form>
        </div>

        <div class="auth-footer">© 2026 {{ appName }}. Todos los derechos reservados.</div>
      </section>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthLogin } from '@/composables/auth/useAuthLogin';
import loginHero from '@/assets/img/login/login.png';
import logoSafic from '@/assets/img/logos/logo_safic.png';
import logoSaficClaro from '@/assets/img/logos/logo_safic_claro.png';
const email = ref('');
const password = ref('');
const rememberMe = ref(true);
const showPassword = ref(false);
const route = useRoute();
const { errorMessage, isSubmitting, submitLogin } = useAuthLogin();
const appName = import.meta.env.VITE_NAME?.trim() || 'SAFIC';
const activationMessage = computed(() => {
  const activated = Array.isArray(route.query.activated)
    ? route.query.activated[0]
    : route.query.activated;
  return activated === 'true'
    ? 'Tu acceso fue activado correctamente. Ya puedes iniciar sesión.'
    : '';
});
async function handleSubmitLogin() {
  await submitLogin({
    email: email.value,
    password: password.value,
    rememberMe: rememberMe.value,
    redirectTo: typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard',
  });
}
const requiredRule = (value: string) => !!value || 'Campo requerido';
const emailRule = (value: string) => /.+@.+\..+/.test(value) || 'Ingresa un correo válido';
</script>
<style scoped>
.auth-page {
  align-items: stretch;
  display: flex;
  min-height: 100svh;
  padding: 0;
}

.auth-shell {
  background: #ffffff;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  display: grid;
  gap: 0;
  grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.82fr);
  margin: 0;
  min-height: 100svh;
  overflow: hidden;
  width: 100%;
}

.auth-hero {
  min-height: 100svh;
}

.auth-hero__image {
  height: 100%;
  min-height: 100svh;
  position: relative;
}

.auth-hero__overlay {
  background:
    linear-gradient(180deg, var(--app-overlay-top), var(--app-overlay-bottom)),
    linear-gradient(
      90deg,
      var(--app-overlay-side-start),
      var(--app-overlay-side-mid) 58%,
      var(--app-overlay-side-end)
    );
  inset: 0;
  position: absolute;
}

.auth-hero__content {
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: var(--app-space-7);
  height: 100%;
  justify-content: flex-end;
  padding: var(--app-space-9);
  position: relative;
  z-index: 1;
}

.auth-hero__brand {
  align-items: center;
  display: inline-flex;
  gap: var(--app-space-3);
  left: var(--app-space-9);
  position: absolute;
  top: var(--app-space-9);
}

.auth-hero__logo {
  display: block;
  height: 46px;
  max-width: 180px;
  object-fit: contain;
  width: auto;
}

.auth-hero__copy {
  max-width: 560px;
}

.auth-hero__title {
  font-size: var(--app-font-size-hero);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.1;
  margin: 0;
}

.auth-hero__subtitle {
  color: rgba(255, 255, 255, 0.86);
  font-size: var(--app-font-size-lg);
  line-height: 1.55;
  margin: var(--app-space-4) 0 0;
  max-width: 500px;
}

.auth-benefits {
  display: grid;
  gap: var(--app-space-3);
  max-width: 540px;
}

.auth-benefit {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: var(--app-radius-lg);
  backdrop-filter: blur(8px);
  display: flex;
  gap: var(--app-space-3);
  padding: var(--app-space-4);
}

.auth-benefit__icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 12px;
  color: var(--app-primary, #2563eb);
  display: inline-flex;
  flex: 0 0 38px;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.auth-benefit__title {
  font-size: var(--app-font-size-sm);
  font-weight: 800;
  line-height: 1.25;
}

.auth-benefit__text {
  color: rgba(255, 255, 255, 0.78);
  font-size: var(--app-font-size-xs);
  line-height: 1.45;
  margin-top: var(--app-space-1);
}

.auth-panel {
  align-items: stretch;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100svh;
  min-width: 0;
  padding: var(--app-space-7);
}

.auth-panel__card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  max-width: 430px;
  padding: 0;
  width: 100%;
}

.auth-panel__brand {
  align-items: center;
  display: flex;
  justify-content: center;
  min-height: var(--login-logo-slot, 230px);
}

.auth-panel__logo {
  display: block;
  height: auto;
  object-fit: contain;
  width: min(var(--login-logo-width, 340px), var(--login-logo-max-vw, 60vw));
}

.auth-panel__heading {
  margin-top: var(--app-space-8);
}

.auth-panel__eyebrow {
  color: var(--app-primary);
  font-size: var(--app-font-size-2xs);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-panel__title {
  color: var(--app-text);
  font-size: var(--app-font-size-2xl);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.15;
  margin-top: var(--app-space-1);
}

.auth-panel__subtitle {
  color: var(--app-text-muted);
  font-size: var(--app-font-size-sm);
  line-height: 1.5;
  margin-top: var(--app-space-2);
  max-width: 360px;
}

.auth-form {
  display: grid;
  gap: var(--app-space-4);
  margin-top: var(--app-space-6);
}

.auth-form :deep(.q-field__control) {
  min-height: 44px;
}

.auth-form :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.auth-form :deep(.q-field__label) {
  font-size: var(--app-font-size-xs);
  font-weight: 700;
}

.auth-form__meta {
  align-items: center;
  display: flex;
  gap: var(--app-space-4);
  justify-content: space-between;
}

.auth-form__support {
  color: var(--app-text-muted);
  font-size: var(--app-font-size-2xs);
  font-weight: 700;
  line-height: 1.35;
  text-align: right;
}

.auth-form__error {
  background: var(--app-danger-soft);
  border: 1px solid var(--app-danger-border);
  border-radius: var(--app-radius-md);
  color: var(--app-danger-text);
  font-size: var(--app-font-size-xs);
  line-height: 1.45;
}

.auth-form__success {
  background: var(--app-success-soft);
  border: 1px solid var(--app-success-border);
  border-radius: var(--app-radius-md);
  color: var(--app-success-text);
  font-size: var(--app-font-size-xs);
  line-height: 1.45;
}

.auth-form__submit {
  font-size: var(--app-font-size-md);
  font-weight: 800;
  margin-top: var(--app-space-1);
  min-height: 48px;
  width: 100%;
}

.auth-form__security {
  align-items: center;
  color: var(--app-text-muted);
  display: flex;
  gap: var(--app-space-3);
  margin-top: var(--app-space-2);
}

.auth-form__security-line {
  flex: 1;
}

.auth-form__security-text {
  align-items: center;
  display: inline-flex;
  gap: var(--app-space-2);
  font-size: var(--app-font-size-sm);
  font-weight: 600;
  white-space: nowrap;
}

.auth-footer {
  color: var(--app-text-muted);
  font-size: var(--app-font-size-xs);
  margin-top: var(--app-space-5);
  text-align: center;
}

@media (max-width: 1180px) and (min-width: 720px) {
  .auth-page {
    padding: 0;
  }

  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-hero {
    min-height: 300px;
    order: 2;
  }

  .auth-hero__image {
    min-height: 300px;
  }

  .auth-hero__content {
    padding: var(--app-space-7);
  }

  .auth-hero__brand {
    left: var(--app-space-7);
    top: var(--app-space-7);
  }

  .auth-hero__title {
    font-size: 30px;
  }

  .auth-benefits {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-width: none;
  }

  .auth-panel {
    min-height: auto;
    order: 1;
    padding: var(--app-space-6);
  }

  .auth-panel__card {
    max-width: 460px;
  }

  .auth-panel__brand {
    --login-logo-max-vw: 55vw;
    --login-logo-slot: 200px;
    --login-logo-width: 300px;
  }
}

@media (max-width: 719px) {
  .auth-page {
    align-items: flex-start;
    min-height: 100svh;
    padding: 0;
  }

  .auth-shell {
    border: 0;
    border-radius: 0;
    box-shadow: none;
    display: block;
    grid-template-columns: 1fr;
    min-height: 100svh;
    overflow: visible;
    width: 100%;
  }

  .auth-hero {
    display: none;
  }

  .auth-panel {
    background: linear-gradient(180deg, rgba(37, 99, 235, 0.055), transparent 220px), #fff;
    display: flex;
    justify-content: center;
    min-height: 100svh;
    padding: 34px var(--app-space-4) var(--app-space-4);
    width: 100%;
  }

  .auth-panel__card {
    margin: 0 auto;
    max-width: none;
    padding: 0;
  }

  .auth-panel__brand {
    --login-logo-max-vw: 62vw;
    --login-logo-slot: 150px;
    --login-logo-width: 230px;
  }

  .auth-panel__heading {
    margin-top: var(--app-space-7);
  }

  .auth-panel__title {
    font-size: var(--app-font-size-2xl);
  }

  .auth-panel__subtitle {
    max-width: none;
  }

  .auth-form__meta {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--app-space-2);
  }

  .auth-form {
    gap: var(--app-space-4);
    margin-top: var(--app-space-5);
  }

  .auth-form :deep(.q-field__control) {
    min-height: 48px;
  }

  .auth-form__support {
    text-align: left;
  }

  .auth-form__submit {
    min-height: 50px;
  }

  .auth-form__security {
    gap: var(--app-space-3);
  }

  .auth-form__security-text {
    font-size: var(--app-font-size-xs);
    white-space: normal;
  }

  .auth-footer {
    font-size: var(--app-font-size-2xs);
    margin-top: var(--app-space-7);
  }
}

@media (max-width: 420px) {
  .auth-panel {
    padding: var(--app-space-8) var(--app-space-4) var(--app-space-4);
  }

  .auth-panel__heading {
    margin-top: var(--app-space-7);
  }

  .auth-panel__title {
    font-size: 25px;
  }

  .auth-form__security-line {
    display: none;
  }

  .auth-form__security-text {
    justify-content: center;
    width: 100%;
  }
}

@media (max-height: 680px) and (max-width: 719px) {
  .auth-panel {
    min-height: auto;
  }

  .auth-panel__brand {
    --login-logo-slot: 100px;
    --login-logo-width: 155px;
  }

  .auth-panel__heading {
    margin-top: var(--app-space-6);
  }

  .auth-form {
    margin-top: var(--app-space-4);
  }

  .auth-footer {
    margin-top: var(--app-space-4);
  }
}

@media (max-height: 720px) and (min-width: 720px) {
  .auth-page {
    padding: 0;
  }

  .auth-hero,
  .auth-hero__image {
    min-height: 100svh;
  }

  .auth-panel {
    padding: var(--app-space-4);
  }

  .auth-panel__card {
    padding: 0;
  }

  .auth-panel__brand {
    --login-logo-slot: 170px;
    --login-logo-width: 260px;
  }

  .auth-panel__heading {
    margin-top: var(--app-space-6);
  }

  .auth-form {
    margin-top: var(--app-space-4);
  }
}
</style>
