<template>
  <q-page class="auth-page">
    <div class="auth-shell">
      <section class="auth-hero">
        <q-img class="auth-hero__image" :src="loginHero" fit="cover" alt="Condominio moderno">
          <div class="auth-hero__overlay" />

          <div class="auth-hero__content">
            <div class="auth-hero__brand">
              <div class="auth-hero__brand-mark">
                <q-icon name="apartment" size="28px" />
              </div>
              <div class="auth-hero__brand-name">CondoAdmin</div>
            </div>

            <div class="auth-hero__copy">
              <h1 class="auth-hero__title">
                La plataforma integral para administrar todos tus condominios, urbanizaciones y
                edificios
              </h1>
              <p class="auth-hero__subtitle">
                Todo lo que necesitas en un solo lugar, para una gestión eficiente, ordenada y
                transparente.
              </p>
            </div>

            <div class="auth-feature-list">
              <div v-for="feature in features" :key="feature.title" class="auth-feature">
                <div class="auth-feature__icon">
                  <q-icon :name="feature.icon" size="20px" />
                </div>
                <div class="auth-feature__body">
                  <div class="auth-feature__title">{{ feature.title }}</div>
                  <div class="auth-feature__subtitle">{{ feature.subtitle }}</div>
                </div>
              </div>
            </div>

            <q-card class="auth-hero__callout" flat>
              <q-card-section class="auth-hero__callout-content">
                <div class="auth-hero__callout-icon">
                  <q-icon name="apartment" size="30px" />
                </div>
                <div class="auth-hero__callout-text">
                  Diseñado para administrar múltiples condominios desde una sola plataforma.
                </div>
              </q-card-section>
            </q-card>
          </div>
        </q-img>
      </section>

      <section class="auth-panel">
        <div class="auth-panel__topbar">
          <q-btn class="auth-lang" outline no-caps color="grey-7" icon="language" label="Español">
            <q-menu anchor="bottom right" self="top right">
              <q-list style="min-width: 180px">
                <q-item v-close-popup clickable>
                  <q-item-section>Español</q-item-section>
                </q-item>
                <q-item v-close-popup clickable>
                  <q-item-section>English</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>

        <div class="auth-panel__card">
          <div class="auth-panel__brand">
            <div class="auth-panel__brand-mark">
              <q-icon name="apartment" size="32px" />
            </div>
            <div class="auth-panel__brand-name">CondoAdmin</div>
            <div class="auth-panel__brand-subtitle">
              Sistema integral de administración multi-condominio
            </div>
          </div>

          <div class="auth-panel__heading">
            <div class="auth-panel__title">Bienvenido de nuevo</div>
            <div class="auth-panel__subtitle">Inicia sesión para continuar</div>
          </div>

          <q-form class="auth-form" @submit.prevent="submitLogin">
            <q-input
              v-model="email"
              dense
              outlined
              type="email"
              label="Correo electrónico"
              placeholder="Ingresa tu correo electrónico"
              :rules="[requiredRule, emailRule]"
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
              :rules="[requiredRule]"
            >
              <template #prepend>
                <q-icon name="lock_outline" />
              </template>
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

            <div class="auth-form__meta">
              <q-checkbox v-model="rememberMe" dense label="Recordarme" />
              <q-btn flat dense no-caps label="¿Olvidaste tu contraseña?" class="auth-link" />
            </div>

            <div class="auth-form__helper">
              El backend determinará el rol y el condominio permitido tras autenticarte.
            </div>

            <q-banner class="auth-form__demo">
              <div class="auth-form__demo-title">Acceso temporal de prueba</div>
              <div class="auth-form__demo-body">
                <div><strong>Senior:</strong> senior@condominio.com</div>
                <div><strong>Clave:</strong> Senior123*</div>
              </div>
            </q-banner>

            <q-btn
              class="auth-form__submit"
              color="primary"
              unelevated
              no-caps
              label="Iniciar sesión"
              icon="login"
              type="submit"
            />

            <div class="auth-form__security">
              <q-separator class="auth-form__security-line" />
              <div class="auth-form__security-text">
                <q-icon name="shield" size="16px" />
                <span>Conexión segura y protegida</span>
              </div>
              <q-separator class="auth-form__security-line" />
            </div>
          </q-form>

          <div class="auth-footer">© 2026 CondoAdmin · Todos los derechos reservados</div>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import loginHero from '@/referencias/referencia_login_multicondominio.png';
import { useSessionStore } from '@/stores/session.store';

const router = useRouter();
const route = useRoute();
const session = useSessionStore();

const demoSeniorEmail = 'senior@condominio.com';
const demoSeniorPassword = 'Senior123*';

const email = ref(demoSeniorEmail);
const password = ref(demoSeniorPassword);
const rememberMe = ref(true);
const showPassword = ref(false);

const features = [
  {
    icon: 'groups',
    title: 'Administración de propietarios y residentes',
    subtitle: 'Control centralizado de usuarios y sus unidades.',
  },
  {
    icon: 'payments',
    title: 'Gestión de pagos y cobros en línea',
    subtitle: 'Seguimiento claro de cuotas, saldos y recaudos.',
  },
  {
    icon: 'event',
    title: 'Reservas de áreas comunes y eventos',
    subtitle: 'Agenda y disponibilidad al alcance de todos.',
  },
  {
    icon: 'handyman',
    title: 'Mantenimiento y reportes de incidencias',
    subtitle: 'Atención oportuna con trazabilidad completa.',
  },
  {
    icon: 'analytics',
    title: 'Reportes y estadísticas en tiempo real',
    subtitle: 'Indicadores útiles para decisiones rápidas.',
  },
  {
    icon: 'shield',
    title: 'Seguridad y control de acceso',
    subtitle: 'Información protegida y acceso administrado.',
  },
];

function submitLogin() {
  const isSeniorCredentials =
    email.value.trim() === demoSeniorEmail && password.value === demoSeniorPassword;

  session.signInDemo({
    email: email.value.trim() || 'admin@condominio.com',
    password: password.value,
    role: isSeniorCredentials ? 'senior' : 'admin',
  });

  const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard';
  void router.push(redirect);
}

const requiredRule = (value: string) => !!value || 'Campo requerido';
const emailRule = (value: string) => /.+@.+\..+/.test(value) || 'Ingresa un correo válido';
</script>

<style scoped>
.auth-page {
  align-items: stretch;
  display: flex;
  min-height: 100vh;
  padding: 16px;
}

.auth-shell {
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 26px;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.08);
  display: grid;
  gap: 0;
  grid-template-columns: minmax(0, 1.3fr) minmax(380px, 0.92fr);
  margin: auto;
  overflow: hidden;
  width: min(1480px, 100%);
}

.auth-hero {
  min-height: 820px;
}

.auth-hero__image {
  height: 100%;
  min-height: 820px;
  position: relative;
}

.auth-hero__overlay {
  background:
    linear-gradient(180deg, rgba(10, 23, 58, 0.16), rgba(10, 23, 58, 0.52)),
    linear-gradient(90deg, rgba(10, 23, 58, 0.85), rgba(10, 23, 58, 0.18) 62%, rgba(10, 23, 58, 0.1));
  inset: 0;
  position: absolute;
}

.auth-hero__content {
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
  justify-content: space-between;
  padding: 40px 40px 32px;
  position: relative;
  z-index: 1;
}

.auth-hero__brand {
  align-items: center;
  display: inline-flex;
  gap: 12px;
}

.auth-hero__brand-mark {
  align-items: center;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 14px;
  color: var(--app-primary, #2563eb);
  display: inline-flex;
  height: 44px;
  justify-content: center;
  width: 44px;
}

.auth-hero__brand-name {
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.auth-hero__copy {
  max-width: 630px;
  padding-top: 28px;
}

.auth-hero__title {
  font-size: clamp(32px, 3.2vw, 44px);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.08;
  margin: 0;
}

.auth-hero__subtitle {
  color: rgba(255, 255, 255, 0.88);
  font-size: 18px;
  line-height: 1.55;
  margin: 24px 0 0;
  max-width: 520px;
}

.auth-feature-list {
  background: rgba(8, 18, 38, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  overflow: hidden;
  width: min(540px, 100%);
}

.auth-feature {
  align-items: flex-start;
  display: flex;
  gap: 14px;
  padding: 17px 18px 17px 16px;
}

.auth-feature + .auth-feature {
  border-top: 1px solid rgba(255, 255, 255, 0.11);
}

.auth-feature__icon {
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 12px;
  color: var(--app-primary, #2563eb);
  display: inline-flex;
  flex: 0 0 40px;
  height: 40px;
  justify-content: center;
}

.auth-feature__body {
  min-width: 0;
}

.auth-feature__title {
  font-size: 17px;
  font-weight: 700;
  line-height: 1.35;
}

.auth-feature__subtitle {
  color: rgba(255, 255, 255, 0.78);
  font-size: 13px;
  line-height: 1.45;
  margin-top: 4px;
}

.auth-hero__callout {
  background: rgba(8, 18, 38, 0.24);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 18px;
  color: #fff;
  max-width: 350px;
}

.auth-hero__callout-content {
  align-items: center;
  display: flex;
  gap: 14px;
  padding: 18px 20px;
}

.auth-hero__callout-icon {
  align-items: center;
  color: #7c83ff;
  display: inline-flex;
  flex: 0 0 34px;
  justify-content: center;
}

.auth-hero__callout-text {
  font-size: 16px;
  font-weight: 600;
  line-height: 1.45;
}

.auth-panel {
  align-items: stretch;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 24px 22px;
}

.auth-panel__topbar {
  display: flex;
  justify-content: flex-end;
}

.auth-lang {
  border-radius: 12px;
  min-height: 38px;
  padding-inline: 16px;
}

.auth-panel__card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin: auto;
  max-width: 500px;
  width: 100%;
}

.auth-panel__brand {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-top: 18px;
  text-align: center;
}

.auth-panel__brand-mark {
  align-items: center;
  background: var(--app-primary-soft, #e8f1ff);
  border-radius: 18px;
  color: var(--app-primary, #2563eb);
  display: inline-flex;
  height: 68px;
  justify-content: center;
  width: 68px;
}

.auth-panel__brand-name {
  color: var(--app-text, #1e293b);
  font-size: 34px;
  font-weight: 800;
  letter-spacing: -0.05em;
  margin-top: 20px;
}

.auth-panel__brand-subtitle {
  color: var(--app-text-muted, #64748b);
  font-size: 14px;
  margin-top: 10px;
}

.auth-panel__heading {
  margin-top: 30px;
  text-align: center;
}

.auth-panel__title {
  color: var(--app-text, #1e293b);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.auth-panel__subtitle {
  color: var(--app-text-muted, #64748b);
  font-size: 15px;
  margin-top: 10px;
}

.auth-form {
  display: grid;
  gap: 16px;
  margin-top: 24px;
}

.auth-form__meta {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.auth-link {
  color: var(--app-primary, #2563eb);
  font-weight: 700;
  padding: 0;
}

.auth-form__helper {
  background: rgba(37, 99, 235, 0.06);
  border-radius: 14px;
  color: var(--app-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.5;
  padding: 12px 14px;
}

.auth-form__demo {
  background: rgba(15, 23, 42, 0.04);
  border-radius: 14px;
  color: var(--app-text, #1e293b);
}

.auth-form__demo-title {
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.auth-form__demo-body {
  color: var(--app-text-muted, #64748b);
  display: grid;
  gap: 4px;
  font-size: 13px;
  margin-top: 6px;
}

.auth-form__submit {
  font-size: 15px;
  font-weight: 700;
  min-height: 50px;
  margin-top: 2px;
}

.auth-form__security {
  align-items: center;
  color: var(--app-text-muted, #64748b);
  display: flex;
  gap: 16px;
  margin-top: 8px;
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

@media (max-width: 1180px) {
  .auth-shell {
    grid-template-columns: 1fr;
  }

  .auth-hero {
    min-height: 620px;
    order: 2;
  }

  .auth-hero__image {
    min-height: 620px;
  }

  .auth-panel {
    min-height: auto;
    order: 1;
  }
}

@media (max-width: 719px) {
  .auth-page {
    padding: 10px;
  }

  .auth-shell {
    border-radius: 22px;
  }

  .auth-hero {
    min-height: 560px;
  }

  .auth-hero__image {
    min-height: 560px;
  }

  .auth-hero__content {
    gap: 20px;
    padding: 24px 18px 20px;
  }

  .auth-hero__subtitle {
    font-size: 16px;
  }

  .auth-feature-list {
    max-width: none;
  }

  .auth-feature {
    padding: 15px 14px;
  }

  .auth-panel {
    padding: 18px 14px 16px;
  }

  .auth-panel__brand-name {
    font-size: 28px;
  }

  .auth-panel__title {
    font-size: 24px;
  }

  .auth-form__meta {
    align-items: flex-start;
    flex-direction: column;
  }

  .auth-form__security {
    gap: 10px;
  }
}
</style>
