<template>
  <q-page class="activate-access-page">
    <div class="activate-access-page__shell">
      <q-card class="activate-access-card" flat bordered>
        <div class="activate-access-card__brand">
          <div class="activate-access-card__brand-mark">
            <q-icon name="shield" size="28px" />
          </div>
          <div class="activate-access-card__brand-copy">
            <div class="activate-access-card__brand-name">CondoAdmin</div>
            <div class="activate-access-card__brand-subtitle">Acceso por invitación</div>
          </div>
        </div>

        <div class="activate-access-card__heading">
          <div class="activate-access-card__title">Activar acceso</div>
          <div class="activate-access-card__subtitle">
            Define tu contraseña para ingresar al sistema de administración del condominio.
          </div>
        </div>

        <q-banner v-if="!hasValidToken" class="activate-access-card__alert" rounded dense>
          El enlace de activación no es válido.
        </q-banner>

        <q-banner
          v-else-if="successMessage"
          class="activate-access-card__success"
          rounded
          dense
        >
          {{ successMessage }}
        </q-banner>

        <q-banner v-if="generalError" class="activate-access-card__error" rounded dense>
          {{ generalError }}
        </q-banner>

        <q-form
          v-if="hasValidToken"
          ref="formRef"
          class="activate-access-form"
          @submit.prevent="handleSubmit"
        >
          <q-input
            v-model="password"
            dense
            outlined
            :type="showPassword ? 'text' : 'password'"
            label="Contraseña"
            placeholder="Crea una contraseña segura"
            autocomplete="new-password"
            :disable="isSubmitting || isActivated"
            :rules="[requiredRule, minLengthRule]"
            :error="Boolean(fieldErrors.password)"
            :error-message="fieldErrors.password"
            lazy-rules="ondemand"
            @update:model-value="clearFieldError('password')"
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
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-input
            v-model="passwordConfirmation"
            dense
            outlined
            :type="showConfirmation ? 'text' : 'password'"
            label="Confirmar contraseña"
            placeholder="Repite tu contraseña"
            autocomplete="new-password"
            :disable="isSubmitting || isActivated"
            :rules="[requiredRule, matchPasswordRule]"
            :error="Boolean(fieldErrors.passwordConfirmation)"
            :error-message="fieldErrors.passwordConfirmation"
            lazy-rules="ondemand"
            @update:model-value="clearFieldError('passwordConfirmation')"
          >
            <template #prepend>
              <q-icon name="lock_reset" />
            </template>
            <template #append>
              <q-btn
                type="button"
                flat
                round
                dense
                :icon="showConfirmation ? 'visibility_off' : 'visibility'"
                @click="showConfirmation = !showConfirmation"
              />
            </template>
          </q-input>

          <div class="activate-access-form__hint">
            Usa al menos 8 caracteres y procura combinar letras, números y símbolos.
          </div>

          <div class="activate-access-form__actions">
            <q-btn
              class="activate-access-form__submit"
              color="positive"
              unelevated
              no-caps
              label="Activar cuenta"
              icon="verified_user"
              type="submit"
              :loading="isSubmitting"
              :disable="isSubmitting || isActivated"
            />

            <q-btn
              class="activate-access-form__secondary"
              flat
              no-caps
              color="primary"
              label="Volver al inicio de sesión"
              :to="{ path: '/login' }"
              replace
            />
          </div>
        </q-form>

        <div v-else class="activate-access-card__footer">
          <q-btn
            class="activate-access-form__secondary"
            flat
            no-caps
            color="primary"
            label="Volver al inicio de sesión"
            :to="{ path: '/login' }"
            replace
          />
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { Notify, type QForm } from 'quasar';
import { useRoute, useRouter } from 'vue-router';

import { activateAccess, type AuthServiceError, type AuthServiceFieldErrors } from '@/services/auth.service';

const route = useRoute();
const router = useRouter();
const formRef = ref<QForm | null>(null);
const password = ref('');
const passwordConfirmation = ref('');
const showPassword = ref(false);
const showConfirmation = ref(false);
const isSubmitting = ref(false);
const isActivated = ref(false);
const successMessage = ref('');
const generalError = ref('');
const fieldErrors = ref<AuthServiceFieldErrors>({});
let redirectTimer: number | null = null;

const activationToken = computed(() => {
  const tokenValue = Array.isArray(route.query.token) ? route.query.token[0] : route.query.token;
  return typeof tokenValue === 'string' ? tokenValue.trim() : '';
});

const hasValidToken = computed(() => Boolean(activationToken.value));

function requiredRule(value: string) {
  return !!value || 'Campo requerido';
}

function minLengthRule(value: string) {
  return value.length >= 8 || 'La contraseña debe tener al menos 8 caracteres';
}

function matchPasswordRule(value: string) {
  return value === password.value || 'Las contraseñas no coinciden';
}

function clearFieldError(field: keyof AuthServiceFieldErrors) {
  if (fieldErrors.value[field]) {
    const nextErrors = { ...fieldErrors.value };
    delete nextErrors[field];
    fieldErrors.value = nextErrors;
  }

  if (generalError.value) {
    generalError.value = '';
  }
}

async function handleSubmit() {
  if (!hasValidToken.value || isSubmitting.value || isActivated.value) {
    return;
  }

  const isValid = await formRef.value?.validate();
  if (!isValid) {
    return;
  }

  isSubmitting.value = true;
  generalError.value = '';
  fieldErrors.value = {};

  try {
    await activateAccess({
      token: activationToken.value,
      password: password.value,
      passwordConfirmation: passwordConfirmation.value,
    });

    isActivated.value = true;
    successMessage.value = 'Tu acceso fue activado correctamente.';
    Notify.create({
      type: 'positive',
      message: successMessage.value,
      position: 'top',
      timeout: 2500,
    });

    redirectTimer = window.setTimeout(() => {
      void router.replace({ path: '/login', query: { activated: 'true' } });
    }, 2200);
  } catch (error) {
    const authError = error as AuthServiceError;
    fieldErrors.value = authError.fieldErrors ?? {};

    if (authError.fieldErrors && Object.keys(authError.fieldErrors).length > 0) {
      generalError.value = '';
      return;
    }

    generalError.value = authError.message || 'No fue posible activar tu acceso.';
  } finally {
    isSubmitting.value = false;
  }
}

onBeforeUnmount(() => {
  if (redirectTimer) {
    window.clearTimeout(redirectTimer);
  }
});
</script>

<style scoped>
.activate-access-page {
  align-items: center;
  display: flex;
  min-height: 100vh;
  padding: 20px 16px;
}

.activate-access-page__shell {
  display: flex;
  justify-content: center;
  width: 100%;
}

.activate-access-card {
  background: rgba(255, 255, 255, 0.98);
  border-radius: 18px;
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.08);
  max-width: 480px;
  padding: 28px 24px 22px;
  width: 100%;
}

.activate-access-card__brand {
  align-items: center;
  display: flex;
  gap: 12px;
  justify-content: center;
}

.activate-access-card__brand-mark {
  align-items: center;
  background: linear-gradient(180deg, #ecfdf5 0%, #d1fae5 100%);
  border-radius: 16px;
  color: var(--q-positive, #16a34a);
  display: inline-flex;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.activate-access-card__brand-copy {
  min-width: 0;
}

.activate-access-card__brand-name {
  color: var(--app-text, #1e293b);
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.activate-access-card__brand-subtitle {
  color: var(--app-text-muted, #64748b);
  font-size: 12px;
  margin-top: 2px;
}

.activate-access-card__heading {
  margin-top: 20px;
  text-align: center;
}

.activate-access-card__title {
  color: var(--app-text, #1e293b);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
}

.activate-access-card__subtitle {
  color: var(--app-text-muted, #64748b);
  font-size: 14px;
  line-height: 1.55;
  margin-top: 10px;
}

.activate-access-card__alert,
.activate-access-card__error,
.activate-access-card__success {
  border-radius: 14px;
  margin-top: 18px;
}

.activate-access-card__alert {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.16);
  color: #b91c1c;
}

.activate-access-card__error {
  background: rgba(220, 38, 38, 0.08);
  border: 1px solid rgba(220, 38, 38, 0.16);
  color: #b91c1c;
}

.activate-access-card__success {
  background: rgba(34, 197, 94, 0.08);
  border: 1px solid rgba(34, 197, 94, 0.18);
  color: #166534;
}

.activate-access-form {
  display: grid;
  gap: 16px;
  margin-top: 18px;
}

.activate-access-form__hint {
  background: rgba(34, 197, 94, 0.08);
  border-radius: 14px;
  color: var(--app-text-muted, #64748b);
  font-size: 12px;
  line-height: 1.5;
  padding: 12px 14px;
}

.activate-access-form__actions {
  display: grid;
  gap: 10px;
  margin-top: 2px;
}

.activate-access-form__submit {
  min-height: 48px;
  font-size: 15px;
  font-weight: 700;
}

.activate-access-form__secondary {
  min-height: 42px;
  font-weight: 700;
}

.activate-access-card__footer {
  display: flex;
  justify-content: center;
  margin-top: 18px;
}

@media (max-width: 599px) {
  .activate-access-page {
    padding: 12px;
  }

  .activate-access-card {
    padding: 22px 16px 18px;
  }

  .activate-access-card__title {
    font-size: 24px;
  }
}
</style>
