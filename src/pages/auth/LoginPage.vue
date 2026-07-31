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
              <h1 class="auth-hero__title">Administra tus condominios desde un solo lugar.</h1>
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
    linear-gradient(180deg, rgba(15, 23, 42, 0.08), rgba(15, 23, 42, 0.44)),
    linear-gradient(
      90deg,
      rgba(15, 23, 42, 0.76),
      rgba(15, 23, 42, 0.28) 58%,
      rgba(15, 23, 42, 0.12)
    );
  inset: 0;
  position: absolute;
}

.auth-hero__content {
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 28px;
  height: 100%;
  justify-content: flex-end;
  padding: 36px;
  position: relative;
  z-index: 1;
}

.auth-hero__brand {
  align-items: center;
  display: inline-flex;
  gap: 12px;
  left: 36px;
  position: absolute;
  top: 36px;
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
  font-size: clamp(30px, 3vw, 42px);
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.1;
  margin: 0;
}

.auth-hero__subtitle {
  color: rgba(255, 255, 255, 0.86);
  font-size: 16px;
  line-height: 1.55;
  margin: 16px 0 0;
  max-width: 500px;
}

.auth-benefits {
  display: grid;
  gap: 10px;
  max-width: 540px;
}

.auth-benefit {
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 16px;
  backdrop-filter: blur(8px);
  display: flex;
  gap: 12px;
  padding: 14px;
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
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
}

.auth-benefit__text {
  color: rgba(255, 255, 255, 0.78);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 4px;
}

.auth-panel {
  align-items: stretch;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 100svh;
  min-width: 0;
  padding: 28px;
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
  height: var(--login-logo-slot, 190px);
  justify-content: center;
  overflow: visible;
  position: relative;
  text-align: center;
}

.auth-panel__logo {
  display: block;
  height: auto;
  left: 50%;
  max-height: none;
  object-fit: contain;
  position: absolute;
  top: var(--login-logo-y, 51%);
  transform: translate(-50%, -50%);
  width: min(var(--login-logo-width, 520px), var(--login-logo-max-vw, 82vw));
}

.auth-panel__heading {
  margin-top: 30px;
}

.auth-panel__eyebrow {
  color: var(--app-primary, #2563eb);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.auth-panel__title {
  color: var(--app-text, #1e293b);
  font-size: 27px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.15;
  margin-top: 6px;
}

.auth-panel__subtitle {
  color: var(--app-text-muted, #64748b);
  font-size: 13px;
  line-height: 1.5;
  margin-top: 8px;
  max-width: 360px;
}

.auth-form {
  display: grid;
  gap: 15px;
  margin-top: 24px;
}

.auth-form :deep(.q-field__control) {
  min-height: 44px;
}

.auth-form :deep(.q-field--focused .q-field__control) {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
}

.auth-form :deep(.q-field__label) {
  font-size: 12px;
  font-weight: 700;
}

.auth-form__meta {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
}

.auth-form__support {
  color: var(--app-text-muted, #64748b);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.35;
  text-align: right;
}

.auth-form__error {
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.18);
  border-radius: 14px;
  color: #b91c1c;
  font-size: 12px;
  line-height: 1.45;
}

.auth-form__success {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.18);
  border-radius: 14px;
  color: #166534;
  font-size: 12px;
  line-height: 1.45;
}

.auth-form__submit {
  font-size: 15px;
  font-weight: 800;
  margin-top: 2px;
  min-height: 48px;
  width: 100%;
}

.auth-form__security {
  align-items: center;
  color: var(--app-text-muted, #64748b);
  display: flex;
  gap: 12px;
  margin-top: 6px;
}

.auth-form__security-line {
  flex: 1;
}

.auth-form__security-text {
  align-items: center;
  display: inline-flex;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
}

.auth-footer {
  color: var(--app-text-muted, #64748b);
  font-size: 12px;
  margin-top: 20px;
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
    padding: 28px;
  }

  .auth-hero__brand {
    left: 28px;
    top: 28px;
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
    padding: 24px;
  }

  .auth-panel__card {
    max-width: 460px;
  }

  .auth-panel__brand {
    --login-logo-max-vw: 74vw;
    --login-logo-slot: 150px;
    --login-logo-width: 410px;
    --login-logo-y: 49%;
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
    padding: 34px 18px 18px;
    width: 100%;
  }

  .auth-panel__card {
    margin: 0 auto;
    max-width: none;
    padding: 0;
  }

  .auth-panel__brand {
    --login-logo-max-vw: 86vw;
    --login-logo-slot: 124px;
    --login-logo-width: 318px;
    --login-logo-y: 58%;
  }

  .auth-panel__heading {
    margin-top: 30px;
  }

  .auth-panel__title {
    font-size: 26px;
  }

  .auth-panel__subtitle {
    max-width: none;
  }

  .auth-form__meta {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .auth-form {
    gap: 14px;
    margin-top: 22px;
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
    gap: 10px;
  }

  .auth-form__security-text {
    font-size: 12px;
    white-space: normal;
  }

  .auth-footer {
    font-size: 11px;
    margin-top: 28px;
  }
}

@media (max-width: 420px) {
  .auth-panel {
    padding: 32px 16px 16px;
  }

  .auth-panel__heading {
    margin-top: 28px;
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
    --login-logo-slot: 96px;
    --login-logo-width: 262px;
    --login-logo-y: 56%;
  }

  .auth-panel__heading {
    margin-top: 22px;
  }

  .auth-form {
    margin-top: 18px;
  }

  .auth-footer {
    margin-top: 18px;
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
    padding: 18px;
  }

  .auth-panel__card {
    padding: 0;
  }

  .auth-panel__brand {
    --login-logo-slot: 138px;
    --login-logo-width: 390px;
    --login-logo-y: 48%;
  }

  .auth-panel__heading {
    margin-top: 22px;
  }

  .auth-form {
    margin-top: 18px;
  }
}
</style>
