<template>
  <q-page class="house-detail-page">
    <div class="detail-topbar">
      <div>
        <div class="detail-path">Unidades / Detalle</div>
      </div>

      <q-btn flat icon="arrow_back" label="Volver" class="detail-back-btn" @click="goBack" />
    </div>

    <q-banner
      v-if="error"
      rounded
      class="house-state-banner house-state-banner--error"
      role="alert"
    >
      <template #avatar>
        <q-icon name="error_outline" color="negative" />
      </template>
      {{ error }}
    </q-banner>

    <q-card class="house-hero">
      <div class="house-hero__main">
        <div class="house-hero__left">
          <div class="house-hero__icon">
            <q-icon name="home" />
          </div>

          <div class="house-hero__content">
            <h1>{{ house?.code || 'CASA' }}</h1>

            <div class="house-hero__subtitle">
              <span>{{ condominiumName }}</span>
              <span v-if="house?.number">Casa {{ house.number }}</span>
            </div>

            <div class="house-hero__badges">
              <q-badge rounded :color="house?.isActive === false ? 'grey-7' : 'positive'">
                {{ statusLabel }}
              </q-badge>
              <q-badge outline rounded color="primary">
                {{ assignmentLabel }}
              </q-badge>
              <q-badge outline rounded color="grey">
                {{ blockName }}
              </q-badge>
            </div>
          </div>
        </div>

        <div class="house-hero__rail">
          <div class="house-hero__actions">
            <div class="section-label">Acciones principales</div>

            <div class="hero-actions-grid">
              <q-btn
                unelevated
                color="primary"
                icon="edit"
                label="Editar vivienda"
                class="hero-action hero-action--primary"
                @click="goToEdit"
              />

              <q-btn
                outline
                color="primary"
                icon="person_add"
                label="Persona"
                class="hero-action"
                @click="openPersonDialog"
              />

              <q-btn
                outline
                color="primary"
                icon="local_parking"
                label="Parqueaderos"
                class="hero-action"
                @click="openParkingDialog"
              />
            </div>
          </div>

          <div class="house-hero__metrics">
            <div class="hero-metric">
              <q-avatar color="blue-1" text-color="primary" icon="person" />
              <div>
                <span>Propietario</span>
                <strong>{{ ownerName }}</strong>
              </div>
            </div>

            <div class="hero-metric">
              <q-avatar color="green-1" text-color="positive" icon="square_foot" />
              <div>
                <span>Área</span>
                <strong>{{ house?.areaM2 || 0 }} m²</strong>
              </div>
            </div>

            <div class="hero-metric">
              <q-avatar color="orange-1" text-color="orange" icon="groups" />
              <div>
                <span>Personas</span>
                <strong>{{ peopleCount }}</strong>
              </div>
            </div>

            <div class="hero-metric">
              <q-avatar color="purple-1" text-color="purple" icon="local_parking" />
              <div>
                <span>Parqueaderos</span>
                <strong>{{ parkingCount }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </q-card>

    <q-tabs
      v-model="tab"
      class="house-tabs"
      active-color="primary"
      indicator-color="primary"
      align="left"
    >
      <q-tab name="summary" label="Resumen" />
      <q-tab name="people" label="Personas" />
      <q-tab name="parking" label="Parqueaderos" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="house-panels">
      <q-tab-panel name="summary">
        <div class="summary-grid">
          <q-card class="detail-card">
            <div class="detail-card__header">
              <h2>Ficha técnica</h2>
              <p>Información general de la vivienda</p>
            </div>

            <div class="technical-grid">
              <div class="technical-item">
                <q-icon name="sell" />
                <div>
                  <span>Código</span>
                  <strong>{{ house?.code || '-' }}</strong>
                </div>
              </div>

              <div class="technical-item">
                <q-icon name="tag" />
                <div>
                  <span>Número</span>
                  <strong>{{ house?.number || '-' }}</strong>
                </div>
              </div>

              <div class="technical-item">
                <q-icon name="grid_view" />
                <div>
                  <span>Bloque / Sector</span>
                  <strong>{{ blockName }}</strong>
                </div>
              </div>

              <div class="technical-item">
                <q-icon name="verified" />
                <div>
                  <span>Estado</span>
                  <strong>{{ statusLabel }}</strong>
                </div>
              </div>

              <div class="technical-item">
                <q-icon name="assignment_ind" />
                <div>
                  <span>Asignación</span>
                  <strong>{{ assignmentLabel }}</strong>
                </div>
              </div>

              <div class="technical-item">
                <q-icon name="square_foot" />
                <div>
                  <span>Área</span>
                  <strong>{{ house?.areaM2 || 0 }} m²</strong>
                </div>
              </div>

              <div class="technical-item">
                <q-icon name="person" />
                <div>
                  <span>Propietario</span>
                  <strong>{{ ownerName }}</strong>
                </div>
              </div>

              <div class="technical-item">
                <q-icon name="groups" />
                <div>
                  <span>Personas</span>
                  <strong>{{ peopleCount }}</strong>
                </div>
              </div>
            </div>
          </q-card>

          <q-card class="detail-card">
            <div class="detail-card__header">
              <h2>Información adicional</h2>
            </div>

            <div class="additional-list">
              <div class="additional-item">
                <q-icon name="event" />
                <div>
                  <span>Fecha de creación</span>
                  <strong>{{ house?.created_at || '-' }}</strong>
                </div>
              </div>

              <div class="additional-item">
                <q-icon name="update" />
                <div>
                  <span>Última actualización</span>
                  <strong>{{ house?.updated_at || '-' }}</strong>
                </div>
              </div>

              <div class="additional-item">
                <q-icon name="person" />
                <div>
                  <span>Creado por</span>
                  <strong>{{ house?.created_by || 'Administrador Senior' }}</strong>
                </div>
              </div>

              <div class="additional-item">
                <q-icon name="person" />
                <div>
                  <span>Actualizado por</span>
                  <strong>{{ house?.updated_by || 'Administrador Senior' }}</strong>
                </div>
              </div>
            </div>
          </q-card>
        </div>
      </q-tab-panel>

      <q-tab-panel name="people">
        <q-card class="detail-card">
          <div class="detail-card__header">
            <h2>Personas asociadas</h2>
            <p>{{ peopleCount }} registros vinculados a esta vivienda</p>
          </div>

          <div v-if="people.length" class="entity-list">
            <div v-for="person in people" :key="person.id" class="entity-row">
              <div class="entity-row__main">
                <strong>{{ person.name }}</strong>
                <span>{{ person.relationship || 'persona' }}</span>
              </div>
              <div class="entity-row__meta">
                <q-badge outline rounded color="primary">
                  {{ person.isPrimary ? 'Titular' : 'Relacionado' }}
                </q-badge>
                <q-badge rounded :color="person.isActive ? 'positive' : 'grey-7'">
                  {{ person.isActive ? 'Activa' : 'Inactiva' }}
                </q-badge>
              </div>
            </div>
          </div>

          <div v-else class="tab-empty">
            <q-icon name="group_off" size="34px" />
            <strong>No hay personas asociadas</strong>
            <span>Usa la acción de agregar persona para vincular un residente o propietario.</span>
          </div>
        </q-card>
      </q-tab-panel>

      <q-tab-panel name="parking">
        <q-card class="detail-card">
          <div class="detail-card__header">
            <h2>Parqueaderos asociados</h2>
            <p>{{ parkingCount }} registros vinculados a esta vivienda</p>
          </div>

          <div v-if="parkings.length" class="entity-list">
            <div v-for="parking in parkings" :key="parking.id" class="entity-row">
              <div class="entity-row__main">
                <strong>{{ parking.code }}</strong>
                <span>Parqueadero {{ parking.number }}</span>
              </div>
              <div class="entity-row__meta">
                <q-badge outline rounded color="primary">
                  {{ parking.blockName || 'Sin bloque' }}
                </q-badge>
                <q-badge rounded :color="parking.isActive ? 'positive' : 'grey-7'">
                  {{ parking.isActive ? 'Activa' : 'Inactiva' }}
                </q-badge>
              </div>
            </div>
          </div>

          <div v-else class="tab-empty">
            <q-icon name="local_parking" size="34px" />
            <strong>No hay parqueaderos asociados</strong>
            <span>Usa la acción de gestionar parqueaderos para registrar uno nuevo.</span>
          </div>
        </q-card>
      </q-tab-panel>
    </q-tab-panels>

    <HousePersonDialog v-model="personDialog" :saving="savingPerson" @save="handleSavePerson" />
    <HouseParkingDialog v-model="parkingDialog" @save="handleSaveParking" />
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';

import { useHouseDetail } from '@/composables/unidades/useHouseDetail';
import type { CreateUnitPersonPayload } from '@/services/units.service';
import { useSessionStore } from '@/stores/session.store';
import HouseParkingDialog from './components/HouseParkingDialog.vue';
import HousePersonDialog from './components/HousePersonDialog.vue';

const router = useRouter();
const session = useSessionStore();
const {
  condominiumName,
  error,
  house,
  people,
  parkings,
  tab,
  unitId,
  openPersonDialog,
  openParkingDialog,
  personDialog,
  parkingDialog,
  savePerson,
  saveParking,
  savingPerson,
  ownerName,
  peopleCount,
  parkingCount,
  blockName,
  statusLabel,
  assignmentLabel,
} = useHouseDetail();

const editHouseId = computed(() => house.value?.id ?? unitId.value);

watch(
  () => session.activeCondoId,
  () => {
    goBack();
  },
);

function goBack() {
  void router.push('/unidades');
}

function goToEdit() {
  if (editHouseId.value) {
    void router.push({ name: 'unidades-editar', params: { id: String(editHouseId.value) } });
  }
}

async function handleSavePerson(payload: CreateUnitPersonPayload) {
  try {
    await savePerson(payload);
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No fue posible agregar la persona.',
      position: 'top-right',
    });
  }
}

async function handleSaveParking() {
  await saveParking();
}
</script>

<style scoped lang="scss">
.house-detail-page {
  padding: 18px 20px 20px;
}

.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.detail-path {
  font-size: 13px;
  font-weight: 700;
  color: #2563eb;
}

.house-state-banner {
  align-items: center;
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 16px;
  color: #1d4ed8;
  margin-bottom: 12px;
}

.house-state-banner--error {
  background: rgba(239, 68, 68, 0.06);
  border-color: rgba(239, 68, 68, 0.14);
  color: #b91c1c;
}

.house-hero {
  border-radius: 18px;
  padding: 22px 24px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.house-hero__main {
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
  gap: 16px;
  align-items: start;
}

.house-hero__rail {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  gap: 14px;
  align-items: start;
  background: rgba(37, 99, 235, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 14px;
}

.house-hero__left {
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.house-hero__icon {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  background: #e8f8ed;
  display: grid;
  place-items: center;
  color: #16a34a;
  font-size: 42px;
}

.house-hero__content h1 {
  margin: 0 0 10px;
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
  line-height: 1.1;
}

.house-hero__subtitle {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 10px;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
}

.house-hero__subtitle span + span::before {
  content: '•';
  margin-right: 10px;
  color: #cbd5e1;
}

.house-hero__badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.house-hero__actions {
  padding-right: 2px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-label {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
  font-size: 12px;
  letter-spacing: 0.01em;
}

.house-hero__metrics {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
  align-content: start;
}

.hero-metric {
  display: flex;
  align-items: center;
  gap: 10px;
}

.hero-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.hero-action--primary {
  grid-column: 1 / -1;
}

.hero-metric span,
.technical-item span,
.additional-item span {
  display: block;
  font-size: 12px;
  color: #64748b;
}

.hero-metric strong,
.technical-item strong,
.additional-item strong {
  display: block;
  font-size: 14px;
  font-weight: 800;
  color: #0f172a;
}

.house-tabs {
  margin-top: 8px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  overflow-x: auto;
  scrollbar-width: none;
}

.house-panels {
  background: transparent;
  margin-top: 6px;
}

.summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 16px;
  align-items: start;
}

.detail-card {
  border-radius: 16px;
  padding: 18px 18px 16px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);
}

.detail-card__header h2 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
}

.detail-card__header p {
  margin: 4px 0 14px;
  color: #64748b;
  font-size: 12px;
}

.technical-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  overflow: hidden;
}

.technical-item {
  display: flex;
  gap: 10px;
  padding: 14px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.technical-item:nth-child(odd) {
  border-right: 1px solid rgba(15, 23, 42, 0.08);
}

.technical-item .q-icon,
.additional-item .q-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #eff6ff;
  color: #2563eb;
  display: grid;
  place-items: center;
  font-size: 16px;
}

.additional-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 14px;
}

.additional-item {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 10px 0;
}

.entity-list {
  display: grid;
  gap: 10px;
}

.entity-row {
  align-items: center;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
}

.entity-row__main {
  display: grid;
  gap: 3px;
}

.entity-row__main strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
}

.entity-row__main span {
  color: #64748b;
  font-size: 11px;
}

.entity-row__meta {
  align-items: center;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tab-empty {
  align-items: center;
  border: 1px dashed rgba(15, 23, 42, 0.12);
  border-radius: 16px;
  color: #64748b;
  display: grid;
  gap: 6px;
  justify-items: center;
  min-height: 180px;
  padding: 24px 20px;
  text-align: center;
}

.tab-empty strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
}

.tab-empty span {
  max-width: 28rem;
}

@media (max-width: 1024px) {
  .house-hero__main,
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .house-hero__rail {
    grid-template-columns: 1fr;
    padding: 12px;
  }

  .house-hero__actions {
    border-right: 0;
    border-top: 1px solid rgba(15, 23, 42, 0.08);
    padding-right: 0;
    padding-top: 14px;
  }

  .house-hero__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    margin-top: 2px;
  }
}

@media (max-width: 767px) {
  .house-detail-page {
    padding: 12px 12px 16px;
  }

  .house-hero {
    padding: 18px 16px;
  }

  .house-hero__left {
    flex-direction: column;
  }

  .house-hero__icon {
    width: 64px;
    height: 64px;
    font-size: 38px;
  }

  .house-hero__content h1 {
    font-size: 24px;
  }

  .hero-actions-grid,
  .house-hero__metrics,
  .technical-grid {
    grid-template-columns: 1fr;
  }

  .additional-list {
    grid-template-columns: 1fr;
  }

  .technical-item:nth-child(odd) {
    border-right: 0;
  }

  .entity-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .entity-row__meta {
    justify-content: flex-start;
  }

  .hero-action {
    width: 100%;
  }

  .hero-action--primary {
    grid-column: auto;
  }

  .house-tabs {
    margin-top: 6px;
    white-space: nowrap;
  }

  :deep(.house-tabs .q-tabs__content) {
    flex-wrap: nowrap;
    overflow-x: auto;
    scrollbar-width: none;
  }

  :deep(.house-tabs .q-tabs__content::-webkit-scrollbar) {
    display: none;
  }

  :deep(.house-tabs .q-tab) {
    min-height: 38px;
    padding: 0 12px;
  }

  :deep(.house-tabs .q-tab__label) {
    font-size: 12px;
    font-weight: 700;
  }
}

:deep(.house-hero .q-badge) {
  font-size: 11px;
  line-height: 1;
  min-height: 22px;
  padding: 3px 8px;
}

:deep(.house-hero .q-btn) {
  min-height: 36px;
  padding-left: 12px;
  padding-right: 12px;
}

:deep(.house-hero .q-btn .q-icon) {
  font-size: 18px;
}

:deep(.hero-actions-grid .q-btn) {
  width: 100%;
}

:deep(.house-tabs .q-tab) {
  min-height: 42px;
  padding: 0 14px;
}

:deep(.house-tabs .q-tab__label) {
  font-size: 13px;
  font-weight: 700;
}

@media (min-width: 1200px) {
  .detail-card:last-child .additional-list {
    align-content: start;
  }

  .house-hero__main {
    grid-template-columns: minmax(0, 1.04fr) minmax(0, 0.96fr);
  }

  .house-hero__rail {
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .house-hero__main {
    grid-template-columns: 1fr;
  }

  .house-hero__rail {
    grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.05fr);
  }

  .house-hero__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .additional-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
