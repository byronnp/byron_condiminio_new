<template>
  <q-page class="nueva-unidad-page">
    <div class="page-shell">
      <header class="page-header">
        <div class="page-header__copy">
          <div class="page-header__eyebrow">Módulo / Unidades</div>
          <h1 class="page-header__title">Nueva unidad</h1>
          <p class="page-header__subtitle">
            Registra una nueva unidad con sus datos base y revisa el resumen a la derecha mientras avanzas.
          </p>
        </div>

        <div class="page-header__actions">
          <q-btn flat no-caps icon="arrow_back" label="Volver" class="header-action header-action--ghost" @click="goBack" />
        </div>
      </header>

      <section class="page-layout">
        <q-form ref="formRef" class="page-layout__main" @submit.prevent="submitForm">
          <q-card flat bordered class="section-card">
            <q-card-section>
              <div class="section-card__header">
                <div>
                  <div class="section-card__title">Identificación</div>
                  <div class="section-card__subtitle">
                    Define el bloque, número y estado inicial de la unidad.
                  </div>
                </div>
              </div>

              <div class="form-grid q-mt-md">
                <q-input
                  v-model="form.bloque"
                  dense
                  outlined
                  hide-bottom-space
                  label="Bloque *"
                  placeholder="Ej: A"
                  maxlength="10"
                  :rules="[requiredRule]"
                />
                <q-input
                  v-model="form.numero"
                  dense
                  outlined
                  hide-bottom-space
                  label="Número de unidad *"
                  placeholder="Ej: A-101"
                  maxlength="20"
                  :rules="[requiredRule]"
                />
              </div>

              <div class="form-grid q-mt-md">
                <q-select
                  v-model="form.estado"
                  dense
                  outlined
                  hide-bottom-space
                  :options="statusOptions"
                  label="Estado *"
                  :rules="[requiredRule]"
                />
                <q-input
                  v-model="form.propietario"
                  dense
                  outlined
                  hide-bottom-space
                  label="Propietario asignado *"
                  placeholder="Buscar o escribir propietario"
                  :rules="[requiredRule]"
                />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="section-card">
            <q-card-section>
              <div class="section-card__header">
                <div>
                  <div class="section-card__title">Dimensiones</div>
                  <div class="section-card__subtitle">
                    Agrega el área y la distribución base de la unidad.
                  </div>
                </div>
              </div>

              <div class="form-grid q-mt-md">
                <q-input
                  v-model.number="form.piso"
                  dense
                  outlined
                  hide-bottom-space
                  type="number"
                  min="0"
                  label="Piso *"
                  :rules="[requiredNumberRule]"
                />
                <q-input
                  v-model.number="form.area"
                  dense
                  outlined
                  hide-bottom-space
                  type="number"
                  min="0"
                  label="Área (m²) *"
                  :rules="[requiredNumberRule]"
                />
                <q-input
                  v-model.number="form.habitaciones"
                  dense
                  outlined
                  hide-bottom-space
                  type="number"
                  min="0"
                  label="Habitaciones *"
                  :rules="[requiredNumberRule]"
                />
                <q-input
                  v-model.number="form.banos"
                  dense
                  outlined
                  hide-bottom-space
                  type="number"
                  min="0"
                  label="Baños *"
                  :rules="[requiredNumberRule]"
                />
              </div>

              <div class="form-grid q-mt-md">
                <q-input
                  v-model.number="form.estacionamientos"
                  dense
                  outlined
                  hide-bottom-space
                  type="number"
                  min="0"
                  label="Estacionamientos *"
                  :rules="[requiredNumberRule]"
                />
                <q-card flat bordered class="availability-card">
                  <q-card-section class="availability-card__content">
                    <div class="availability-card__label">Disponibilidad</div>
                    <div class="availability-card__value">Se determinará al guardar</div>
                  </q-card-section>
                </q-card>
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="section-card">
            <q-card-section>
              <div class="section-card__header">
                <div>
                  <div class="section-card__title">Observaciones</div>
                  <div class="section-card__subtitle">
                    Incluye notas útiles para administración y seguimiento.
                  </div>
                </div>
              </div>

              <q-input
                v-model="form.observaciones"
                class="q-mt-md"
                dense
                outlined
                type="textarea"
                autogrow
                label="Notas adicionales"
                placeholder="Ej: Unidad con balcón, vista interna y contrato vigente..."
              />
            </q-card-section>
          </q-card>

          <div class="page-footer">
            <div class="page-footer__copy">
              <div class="page-footer__step">Formulario de nueva unidad</div>
              <div class="page-footer__label">La información se sincroniza con el listado al guardar.</div>
            </div>

            <div class="page-footer__actions">
              <q-btn flat no-caps label="Cancelar" class="footer-action footer-action--ghost" @click="goBack" />
              <q-btn
                color="primary"
                unelevated
                no-caps
                icon="save"
                label="Guardar unidad"
                class="footer-action"
                :loading="saving"
                @click="submitForm"
              />
            </div>
          </div>
        </q-form>

        <aside class="page-layout__aside">
          <q-card flat bordered class="summary-panel summary-panel--sticky">
            <q-card-section class="summary-panel__section">
              <div class="summary-preview">
                <div class="summary-preview__icon">
                  <q-icon name="domain" size="34px" />
                </div>
                <div class="summary-preview__body">
                  <div class="summary-preview__eyebrow">Ficha rápida</div>
                  <div class="summary-preview__name">
                    {{ form.numero || 'Nueva unidad' }}
                  </div>
                  <div class="summary-preview__meta">
                    <q-badge :color="statusTone(form.estado)" rounded>
                      {{ form.estado }}
                    </q-badge>
                    <q-badge outline color="primary" rounded>
                      {{ form.bloque || 'Sin bloque' }}
                    </q-badge>
                  </div>
                </div>
              </div>

              <div class="summary-list q-mt-md">
                <div class="summary-item">
                  <span class="summary-item__label">Bloque</span>
                  <span class="summary-item__value">{{ form.bloque || 'Sin bloque' }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-item__label">Unidad</span>
                  <span class="summary-item__value">{{ form.numero || 'Sin número' }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-item__label">Área</span>
                  <span class="summary-item__value">{{ form.area ?? '0' }} m²</span>
                </div>
                <div class="summary-item">
                  <span class="summary-item__label">Propietario</span>
                  <span class="summary-item__value summary-item__value--wrap">
                    {{ form.propietario || 'Sin propietario' }}
                  </span>
                </div>
              </div>

              <q-separator class="q-my-md" />

              <div class="summary-note">
                Revisa el resumen antes de guardar. El listado se actualizará con la nueva unidad.
              </div>
            </q-card-section>
          </q-card>
        </aside>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { createUnidadForm, type UnidadStatus, useUnidades } from '@/composables/unidades/useUnidades';

const router = useRouter();
const formRef = ref();

const { form, saving, editingId, saveUnit } = useUnidades();

const statusOptions: UnidadStatus[] = ['Disponible', 'Ocupada', 'Mora', 'Exonerada'];

onMounted(() => {
  editingId.value = null;
  form.value = createUnidadForm();
});

const requiredRule = (value: unknown) =>
  typeof value === 'string' && value.trim().length > 0 ? true : 'Campo requerido';

const requiredNumberRule = (value: number | null) =>
  value !== null && value !== undefined ? true : 'Campo requerido';

function statusTone(status: UnidadStatus) {
  if (status === 'Disponible') return 'positive';
  if (status === 'Ocupada') return 'primary';
  if (status === 'Mora') return 'negative';
  return 'warning';
}

async function submitForm() {
  const isValid = await formRef.value?.validate?.();
  if (!isValid) {
    return;
  }

  saveUnit(form.value);
  await router.push('/unidades');
}

function goBack() {
  void router.push('/unidades');
}
</script>

<style scoped>
.nueva-unidad-page {
  min-height: 100%;
  padding: 6px 8px 0 4px;
}

.page-shell {
  display: grid;
  gap: 18px;
}

.page-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.page-header__copy {
  display: grid;
  gap: 4px;
}

.page-header__eyebrow {
  color: var(--app-primary);
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
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
}

.page-header__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.header-action {
  min-height: 42px;
}

.header-action--ghost {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.page-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) 330px;
  align-items: start;
}

.page-layout__main {
  display: grid;
  gap: 18px;
}

.section-card,
.summary-panel {
  border-radius: 18px;
  overflow: hidden;
}

.section-card__header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.section-card__title {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.section-card__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.4;
  margin-top: 3px;
}

.form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.availability-card {
  align-self: stretch;
  border-radius: 14px;
  overflow: hidden;
}

.availability-card__content {
  display: grid;
  gap: 4px;
  min-height: 100%;
  padding: 12px 14px;
}

.availability-card__label {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.availability-card__value {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
}

.page-layout__aside {
  display: grid;
}

.summary-panel--sticky {
  position: sticky;
  top: 18px;
}

.summary-preview {
  align-items: center;
  display: flex;
  gap: 12px;
}

.summary-preview__icon {
  align-items: center;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.12), rgba(37, 99, 235, 0.05));
  border-radius: 16px;
  color: var(--app-primary);
  display: inline-flex;
  height: 64px;
  justify-content: center;
  width: 64px;
  flex-shrink: 0;
}

.summary-preview__body {
  display: grid;
  gap: 4px;
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
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.summary-item__label {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.summary-item__value {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  text-align: right;
}

.summary-item__value--wrap {
  max-width: 180px;
  white-space: normal;
}

.summary-note {
  background: rgba(37, 99, 235, 0.05);
  border-radius: 16px;
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.5;
  padding: 12px 14px;
}

.page-footer {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 16px;
}

.page-footer__copy {
  display: grid;
  gap: 4px;
}

.page-footer__step {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.page-footer__label {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}

.page-footer__actions {
  display: flex;
  gap: 10px;
}

.footer-action {
  min-width: 150px;
}

.footer-action--ghost {
  border: 1px solid rgba(15, 23, 42, 0.08);
}

@media (max-width: 1439px) {
  .page-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 767px) {
  .page-header {
    flex-direction: column;
  }

  .page-header__actions {
    width: 100%;
    justify-content: flex-start;
  }

  .header-action,
  .footer-action {
    flex: 1;
    min-width: 0;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .page-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .page-footer__actions {
    flex-direction: column;
  }
}
</style>
