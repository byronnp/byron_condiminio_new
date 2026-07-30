<template>
  <q-page class="house-detail-page">
    <div class="detail-topbar">
      <div>
        <div class="detail-path">Casa / Detalle</div>
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

    <div v-if="loading && !house" class="detail-skeleton" role="status" aria-label="Cargando casa">
      <q-card class="house-hero detail-skeleton__hero">
        <div class="detail-skeleton__identity">
          <q-skeleton type="QAvatar" size="58px" />
          <div>
            <q-skeleton type="text" width="90px" />
            <q-skeleton type="text" width="180px" />
            <q-skeleton type="text" width="130px" />
          </div>
        </div>
        <div class="detail-skeleton__metrics">
          <q-skeleton v-for="item in 4" :key="item" height="56px" />
        </div>
      </q-card>

      <q-card class="detail-card">
        <q-skeleton type="text" width="160px" />
        <q-skeleton type="text" width="240px" />
        <div class="detail-skeleton__sections">
          <q-skeleton v-for="item in 4" :key="item" height="132px" />
        </div>
      </q-card>
    </div>

    <template v-else>
    <q-card class="house-hero">
      <div class="house-hero__main">
        <section class="house-hero__identity" aria-label="Resumen de vivienda">
          <div class="house-hero__icon">
            <q-icon name="home" />
          </div>

          <div class="house-hero__content">
            <div class="house-hero__eyebrow">Vivienda</div>
            <h1>{{ house?.code || 'CASA' }}</h1>

            <div class="house-hero__meta">
              <span>
                <q-icon name="grid_view" />
                {{ blockName }}
              </span>
              <span v-if="house?.number">Casa {{ house.number }}</span>
            </div>

            <div class="house-hero__badges">
              <q-badge rounded :color="house?.isActive === false ? 'grey-7' : 'positive'">
                {{ statusLabel }}
              </q-badge>
            </div>
          </div>
        </section>

        <section class="house-hero__facts" aria-label="Indicadores de vivienda">
          <div class="house-hero__metrics">
            <div class="hero-metric">
              <q-avatar color="green-1" text-color="positive" icon="square_foot" />
              <div>
                <span>Área</span>
                <strong>{{ house?.areaM2 || 0 }} m²</strong>
              </div>
            </div>

            <div class="hero-metric">
              <q-avatar color="blue-1" text-color="primary" icon="person" />
              <div>
                <span>Propietario principal</span>
                <strong>{{ ownerName }}</strong>
              </div>
            </div>

            <div class="hero-metric">
              <q-avatar color="orange-1" text-color="orange" icon="groups" />
              <div>
                <span>Personas activas</span>
                <strong>{{ activePeopleCount }}</strong>
              </div>
            </div>

            <div class="hero-metric">
              <q-avatar color="purple-1" text-color="purple" icon="local_parking" />
              <div>
                <span>Unidades asociadas</span>
                <strong>{{ parkingCount }}</strong>
              </div>
            </div>
          </div>
        </section>

        <section v-if="canManageUnits" class="house-hero__actions" aria-label="Acciones rápidas">
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
            label="Agregar persona"
            class="hero-action"
            @click="openPersonDialog"
          />

          <q-btn
            outline
            color="primary"
            icon="local_parking"
            label="Agregar unidad asociada"
            class="hero-action"
            @click="openAssociatedUnitDialog"
          />
        </section>
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
      <q-tab name="parking" label="Unidades asociadas" />
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="house-panels">
      <q-tab-panel name="summary">
        <div class="summary-tech-grid">
          <q-card class="detail-card summary-tech-card">
            <div class="detail-card__header">
              <h2>Ficha técnica</h2>
              <p>Datos técnicos y administrativos de la unidad</p>
            </div>

            <div class="summary-section-grid">
              <section class="summary-section">
                <div class="summary-section__header">
                  <q-icon name="home_work" />
                  <h3>Información General</h3>
                </div>

                <div class="summary-fields">
                  <div class="summary-field">
                    <span>Tipo de unidad</span>
                    <strong>{{ house?.unitTypeName || '-' }}</strong>
                  </div>
                  <div class="summary-field">
                    <span>Código de tipo</span>
                    <strong>{{ house?.unitTypeCode || '-' }}</strong>
                  </div>
                  <div class="summary-field">
                    <span>Fecha de creación</span>
                    <strong>{{ house?.created_at || '-' }}</strong>
                  </div>
                  <div class="summary-field">
                    <span>Última actualización</span>
                    <strong>{{ house?.updated_at || '-' }}</strong>
                  </div>
                </div>
              </section>

              <section class="summary-section">
                <div class="summary-section__header">
                  <q-icon name="location_on" />
                  <h3>Ubicación</h3>
                </div>

                <div class="summary-fields">
                  <div class="summary-field">
                    <span>Bloque / sector</span>
                    <strong>{{ blockName }}</strong>
                  </div>
                  <div class="summary-field">
                    <span>ID de bloque</span>
                    <strong>{{ house?.blockId || '-' }}</strong>
                  </div>
                  <div class="summary-field">
                    <span>Unidad principal</span>
                    <strong>{{ house?.parentUnitId ? `#${house.parentUnitId}` : 'No aplica' }}</strong>
                  </div>
                </div>
              </section>

              <section class="summary-section">
                <div class="summary-section__header">
                  <q-icon name="tune" />
                  <h3>Características</h3>
                </div>

                <div class="summary-fields">
                  <div class="summary-field">
                    <span>Área registrada</span>
                    <strong>{{ house?.areaM2 || 0 }} m²</strong>
                  </div>
                  <div class="summary-field">
                    <span>Asignación</span>
                    <strong>{{ assignmentLabel }}</strong>
                  </div>
                  <div class="summary-field">
                    <span>Descripción</span>
                    <strong>{{ house?.description || 'Sin descripción' }}</strong>
                  </div>
                </div>
              </section>

              <section class="summary-section">
                <div class="summary-section__header">
                  <q-icon name="settings" />
                  <h3>Configuración</h3>
                </div>

                <div class="summary-fields">
                  <div class="summary-field">
                    <span>Estado operativo</span>
                    <strong>{{ statusLabel }}</strong>
                  </div>
                  <div class="summary-field">
                    <span>Creado por</span>
                    <strong>{{ house?.created_by || 'Administrador Senior' }}</strong>
                  </div>
                  <div class="summary-field">
                    <span>Actualizado por</span>
                    <strong>{{ house?.updated_by || 'Administrador Senior' }}</strong>
                  </div>
                  <div class="summary-field">
                    <span>Notas</span>
                    <strong>{{ house?.notes || 'Sin notas' }}</strong>
                  </div>
                </div>
              </section>
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

          <div v-if="people.length" class="people-list">
            <div v-for="person in people" :key="person.id" class="person-row">
              <div class="person-row__identity">
                <q-avatar class="person-row__avatar" size="38px">
                  {{ personInitials(person.name) }}
                </q-avatar>

                <div class="person-row__name">
                  <strong>{{ person.name }}</strong>
                  <span>{{ person.relationship || 'Persona vinculada' }}</span>
                </div>
              </div>

              <div class="person-row__cell">
                <span>Teléfono</span>
                <strong>{{ person.phone || 'Sin teléfono' }}</strong>
              </div>

              <div class="person-row__cell person-row__badges">
                <span>Facturación</span>
                <q-badge
                  rounded
                  :color="person.isBillingResponsible ? 'primary' : 'grey-6'"
                  :outline="!person.isBillingResponsible"
                >
                  {{ person.isBillingResponsible ? 'Responsable' : 'No responsable' }}
                </q-badge>
              </div>

              <div class="person-row__cell person-row__badges">
                <span>Acceso</span>
                <q-badge rounded :color="accessStatusColor(person.accessStatus)">
                  {{ accessStatusLabel(person.accessStatus) }}
                </q-badge>
              </div>

              <div class="person-row__cell person-row__badges">
                <span>Relación</span>
                <div class="person-row__status">
                  <q-badge outline rounded color="primary">
                    {{ person.isPrimary ? 'Titular' : 'Relacionado' }}
                  </q-badge>
                  <q-badge rounded :color="person.isActive ? 'positive' : 'grey-7'">
                    {{ person.isActive ? 'Activa' : 'Inactiva' }}
                  </q-badge>
                </div>
              </div>

              <div class="person-row__actions">
                <q-btn
                  v-if="canManageUnits"
                  flat
                  round
                  dense
                  icon="more_horiz"
                  aria-label="Acciones de persona"
                >
                  <q-menu class="person-actions-menu" anchor="bottom right" self="top right">
                    <q-list dense style="min-width: 238px">
                      <q-item
                        v-if="!person.isBillingResponsible && person.isActive"
                        v-close-popup
                        clickable
                        @click="handleBillingResponsible(person.id)"
                      >
                        <q-item-section avatar>
                          <q-icon name="receipt_long" />
                        </q-item-section>
                        <q-item-section>Establecer responsable</q-item-section>
                      </q-item>

                      <q-item
                        v-if="person.isActive"
                        v-close-popup
                        clickable
                        @click="handleAccessInvitation(person.id)"
                      >
                        <q-item-section avatar>
                          <q-icon name="mail" />
                        </q-item-section>
                        <q-item-section>Enviar invitación</q-item-section>
                      </q-item>

                      <q-separator v-if="person.isActive" />

                      <q-item
                        v-if="person.isActive"
                        v-close-popup
                        clickable
                        class="person-actions-menu__danger"
                        @click="requestDeactivatePerson(person)"
                      >
                        <q-item-section avatar>
                          <q-icon name="person_remove" />
                        </q-item-section>
                        <q-item-section>Inactivar relación</q-item-section>
                      </q-item>

                      <q-item v-if="!person.isActive">
                        <q-item-section avatar>
                          <q-icon name="block" />
                        </q-item-section>
                        <q-item-section>Sin acciones disponibles</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </div>
          </div>

          <AppEmptyState
            v-else
            tight
            icon="group_off"
            title="Aún no hay personas asociadas"
            text="Agrega un propietario, inquilino o residente para vincularlo con esta vivienda."
          />
        </q-card>
      </q-tab-panel>

      <q-tab-panel name="parking">
        <q-card class="detail-card">
          <div class="detail-card__header">
            <h2>Unidades asociadas</h2>
            <p>{{ parkingCount }} registros vinculados a esta vivienda</p>
          </div>

          <div v-if="canManageUnits" class="associated-unit-toolbar">
            <q-btn
              unelevated
              color="primary"
              icon="add"
              label="Agregar unidad asociada"
              no-caps
              @click="openAssociatedUnitDialog"
            />
          </div>

          <div v-if="parkings.length" class="associated-unit-grid">
            <div v-for="parking in parkings" :key="parking.id" class="associated-unit-card">
              <div class="associated-unit-card__icon">
                <q-icon :name="childUnitIcon(parking)" />
              </div>

              <div class="associated-unit-card__content">
                <div class="associated-unit-card__header">
                  <div>
                    <span>{{ childUnitTypeLabel(parking) }}</span>
                    <strong>{{ parking.code }}</strong>
                  </div>

                  <q-btn
                    v-if="canManageUnits"
                    flat
                    round
                    dense
                    icon="more_horiz"
                    aria-label="Acciones de unidad asociada"
                  >
                    <q-menu class="associated-unit-actions-menu" anchor="bottom right" self="top right">
                      <q-list dense style="min-width: 210px">
                        <q-item v-close-popup clickable @click="requestEditAssociatedUnit(parking)">
                          <q-item-section avatar>
                            <q-icon name="edit" />
                          </q-item-section>
                          <q-item-section>Editar</q-item-section>
                        </q-item>

                        <q-item
                          v-close-popup
                          clickable
                          @click="requestAssociatedUnitStatus(parking, !parking.isActive)"
                        >
                          <q-item-section avatar>
                            <q-icon :name="parking.isActive ? 'toggle_off' : 'toggle_on'" />
                          </q-item-section>
                          <q-item-section>
                            {{ parking.isActive ? 'Inactivar' : 'Activar' }}
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>

                <div class="associated-unit-card__details">
                  <div>
                    <span>Número</span>
                    <strong>{{ parking.number || '-' }}</strong>
                  </div>
                  <div>
                    <span>Área</span>
                    <strong>{{ parking.areaM2 || 0 }} m²</strong>
                  </div>
                </div>

                <div class="associated-unit-card__footer">
                  <q-badge outline rounded color="primary">
                    {{ parking.blockName || 'Sin bloque' }}
                  </q-badge>
                  <q-badge rounded :color="parking.isActive ? 'positive' : 'grey-7'">
                    {{ parking.isActive ? 'Activa' : 'Inactiva' }}
                  </q-badge>
                </div>
              </div>
            </div>
          </div>

          <AppEmptyState
            v-else
            tight
            icon="local_parking"
            title="Aún no hay unidades asociadas"
            text="Agrega un parqueadero o bodega para dejarlo vinculado a esta vivienda."
          />
        </q-card>
      </q-tab-panel>
    </q-tab-panels>
    </template>

    <HousePersonDialog v-model="personDialog" :saving="savingPerson" @save="handleSavePerson" />
    <HouseParkingDialog
      v-model="parkingDialog"
      :mode="associatedUnitDialogMode"
      :initial-value="associatedUnitFormValue"
      :saving="savingParking"
      @save="handleSaveParking"
    />
    <AppConfirmDialog
      v-model="deactivateDialogOpen"
      tone="warning"
      icon="person_remove"
      title="Inactivar relación"
      :message="deactivateDialogMessage"
      confirm-label="Inactivar relación"
      cancel-label="Cancelar"
      :loading="deactivatingPerson"
      @confirm="confirmDeactivatePerson"
      @cancel="clearDeactivatePerson"
    />
    <AppConfirmDialog
      v-model="associatedUnitStatusDialogOpen"
      tone="warning"
      :icon="pendingAssociatedUnitStatus?.isActive ? 'toggle_off' : 'toggle_on'"
      :title="associatedUnitStatusTitle"
      :message="associatedUnitStatusMessage"
      :confirm-label="associatedUnitStatusConfirmLabel"
      cancel-label="Cancelar"
      :loading="savingParking"
      @confirm="confirmAssociatedUnitStatus"
      @cancel="clearAssociatedUnitStatus"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Notify } from 'quasar';
import { useRouter } from 'vue-router';

import AppConfirmDialog from '@/components/general/AppConfirmDialog.vue';
import AppEmptyState from '@/components/shared/AppEmptyState.vue';
import { useHouseDetail } from '@/composables/unidades/useHouseDetail';
import type {
  CreateParkingUnitPayload,
  CreateUnitPersonPayload,
  UnitListItem,
  UnitPersonAccessStatus,
  UnitPersonItem,
} from '@/services/units.service';
import { useSessionStore } from '@/stores/session.store';
import HouseParkingDialog from './components/HouseParkingDialog.vue';
import HousePersonDialog from './components/HousePersonDialog.vue';

const router = useRouter();
const session = useSessionStore();
const {
  error,
  house,
  people,
  parkings,
  tab,
  loading,
  unitId,
  openPersonDialog,
  openParkingDialog,
  personDialog,
  parkingDialog,
  savePerson,
  saveParking,
  savingParking,
  savingPerson,
  changeBillingResponsible,
  deactivatePersonRelation,
  sendAccessInvitation,
  setParkingStatus,
  updateParking,
  ownerName,
  peopleCount,
  parkingCount,
  blockName,
  statusLabel,
  assignmentLabel,
} = useHouseDetail();

const editHouseId = computed(() => house.value?.id ?? unitId.value);
const deactivateDialogOpen = ref(false);
const deactivatingPerson = ref(false);
const pendingDeactivatePerson = ref<UnitPersonItem | null>(null);
const disableAccessOnDeactivate = ref(true);
const canManageUnits = computed(() => hasPermission('units.manage'));
const editingAssociatedUnit = ref<UnitListItem | null>(null);
const pendingAssociatedUnitStatus = ref<{ unit: UnitListItem; isActive: boolean } | null>(null);
const associatedUnitStatusDialogOpen = ref(false);
const associatedUnitDialogMode = computed(() => (editingAssociatedUnit.value ? 'edit' : 'create'));
const activePeopleCount = computed(() => people.value.filter((person) => person.isActive).length);
const associatedUnitFormValue = computed<CreateParkingUnitPayload | null>(() => {
  const unit = editingAssociatedUnit.value;
  if (!unit) return null;

  return {
    kind: childUnitKind(unit),
    number: unit.number,
    code: unit.code,
    areaM2: unit.areaM2,
  };
});
const deactivateDialogMessage = computed(() => {
  const name = pendingDeactivatePerson.value?.name ?? 'esta persona';
  return disableAccessOnDeactivate.value
    ? `¿Inactivar la relación de ${name}? También se deshabilitará su acceso global, lo que puede afectar todos sus condominios.`
    : `¿Inactivar la relación de ${name}? La persona dejará de estar vinculada a esta vivienda.`;
});
const associatedUnitStatusTitle = computed(() =>
  pendingAssociatedUnitStatus.value?.isActive
    ? 'Activar unidad asociada'
    : 'Inactivar unidad asociada',
);
const associatedUnitStatusMessage = computed(() => {
  const pending = pendingAssociatedUnitStatus.value;
  if (!pending) return '';

  const action = pending.isActive ? 'activar' : 'inactivar';
  return `¿Deseas ${action} ${pending.unit.code}? La unidad seguirá vinculada a esta vivienda.`;
});
const associatedUnitStatusConfirmLabel = computed(() =>
  pendingAssociatedUnitStatus.value?.isActive ? 'Activar' : 'Inactivar',
);

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
  if (!canManageUnits.value) return;
  if (editHouseId.value) {
    void router.push({ name: 'unidades-editar', params: { id: String(editHouseId.value) } });
  }
}

function childUnitTypeLabel(unit: UnitListItem) {
  return childUnitKind(unit) === 'storage' ? 'Bodega' : 'Parqueadero';
}

function childUnitKind(unit: UnitListItem): CreateParkingUnitPayload['kind'] {
  const normalized = `${unit.unitTypeCode} ${unit.unitTypeName}`.toLowerCase();
  return normalized.includes('bodega') || normalized.includes('storage') ? 'storage' : 'parking';
}

function childUnitIcon(unit: UnitListItem) {
  return childUnitKind(unit) === 'storage' ? 'inventory_2' : 'local_parking';
}

function openAssociatedUnitDialog() {
  editingAssociatedUnit.value = null;
  openParkingDialog();
}

function requestEditAssociatedUnit(unit: UnitListItem) {
  editingAssociatedUnit.value = unit;
  openParkingDialog();
}

function requestAssociatedUnitStatus(unit: UnitListItem, isActive: boolean) {
  pendingAssociatedUnitStatus.value = { unit, isActive };
  associatedUnitStatusDialogOpen.value = true;
}

async function confirmAssociatedUnitStatus() {
  const pending = pendingAssociatedUnitStatus.value;
  if (!pending || savingParking.value) return;

  try {
    await setParkingStatus(pending.unit.id, pending.isActive);
    Notify.create({
      type: 'positive',
      message: pending.isActive
        ? 'Unidad asociada activada correctamente.'
        : 'Unidad asociada inactivada correctamente.',
      position: 'top-right',
    });
    associatedUnitStatusDialogOpen.value = false;
    clearAssociatedUnitStatus();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error instanceof Error
          ? error.message
          : 'No fue posible actualizar la unidad asociada.',
      position: 'top-right',
    });
  }
}

function clearAssociatedUnitStatus() {
  if (savingParking.value) return;
  pendingAssociatedUnitStatus.value = null;
}

function personInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
}

function accessStatusLabel(status: UnitPersonAccessStatus) {
  const labels: Record<UnitPersonAccessStatus, string> = {
    active: 'Activo',
    pending_activation: 'Pendiente',
    invitation_expired: 'Invitación expirada',
    invitation_revoked: 'Invitación revocada',
    inactive: 'Inactivo',
    unknown: 'Sin dato',
  };

  return labels[status];
}

function accessStatusColor(status: UnitPersonAccessStatus) {
  const colors: Record<UnitPersonAccessStatus, string> = {
    active: 'positive',
    pending_activation: 'warning',
    invitation_expired: 'orange',
    invitation_revoked: 'negative',
    inactive: 'grey-7',
    unknown: 'grey-6',
  };

  return colors[status];
}

async function handleBillingResponsible(personId: number) {
  try {
    await changeBillingResponsible(personId);
    Notify.create({
      type: 'positive',
      message: 'Responsable de facturación actualizado.',
      position: 'top-right',
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error instanceof Error
          ? error.message
          : 'No fue posible cambiar el responsable de facturación.',
      position: 'top-right',
    });
  }
}

async function handleAccessInvitation(personId: number) {
  try {
    await sendAccessInvitation(personId);
    Notify.create({
      type: 'positive',
      message: 'Invitación de acceso enviada.',
      position: 'top-right',
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No fue posible enviar la invitación.',
      position: 'top-right',
    });
  }
}

function requestDeactivatePerson(person: UnitPersonItem) {
  pendingDeactivatePerson.value = person;
  disableAccessOnDeactivate.value = true;
  deactivateDialogOpen.value = true;
}

async function confirmDeactivatePerson() {
  const person = pendingDeactivatePerson.value;
  if (!person || deactivatingPerson.value) return;

  deactivatingPerson.value = true;
  try {
    await deactivatePersonRelation(person.id, disableAccessOnDeactivate.value);
    Notify.create({
      type: 'positive',
      message: 'Relación inactivada correctamente.',
      position: 'top-right',
    });
    deactivateDialogOpen.value = false;
    clearDeactivatePerson();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No fue posible inactivar la relación.',
      position: 'top-right',
    });
  } finally {
    deactivatingPerson.value = false;
  }
}

function clearDeactivatePerson() {
  if (deactivatingPerson.value) return;
  pendingDeactivatePerson.value = null;
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

async function handleSaveParking(payload: CreateParkingUnitPayload) {
  try {
    if (editingAssociatedUnit.value) {
      await updateParking(editingAssociatedUnit.value.id, payload);
      Notify.create({
        type: 'positive',
        message: 'Unidad asociada actualizada correctamente.',
        position: 'top-right',
      });
      editingAssociatedUnit.value = null;
      return;
    }

    await saveParking(payload);
    Notify.create({
      type: 'positive',
      message: 'Unidad asociada agregada correctamente.',
      position: 'top-right',
    });
  } catch (error) {
    Notify.create({
      type: 'negative',
      message:
        error instanceof Error ? error.message : 'No fue posible guardar la unidad asociada.',
      position: 'top-right',
    });
  }
}

function hasPermission(permission: 'units.manage') {
  const user = session.user as unknown as { permissions?: unknown };
  if (!Array.isArray(user?.permissions)) {
    return true;
  }

  return user.permissions.includes(permission);
}
</script>

<style scoped lang="scss">
.house-detail-page {
  padding: 18px 20px 20px;
}

.detail-topbar {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 14px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.detail-path {
  color: #2563eb;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
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

.detail-skeleton {
  display: grid;
  gap: 12px;
}

.detail-skeleton__hero {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(270px, 0.92fr) minmax(0, 1.35fr);
}

.detail-skeleton__identity {
  align-items: center;
  display: flex;
  gap: 14px;
}

.detail-skeleton__identity > div {
  display: grid;
  gap: 7px;
  min-width: 0;
}

.detail-skeleton__metrics {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.detail-skeleton__sections {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 14px;
}

.house-hero {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.05);
  padding: 20px;
}

.house-hero__main {
  display: grid;
  grid-template-columns: minmax(270px, 0.92fr) minmax(0, 1.35fr) max-content;
  gap: 18px;
  align-items: center;
}

.house-hero__identity {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  min-width: 0;
}

.house-hero__icon {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  background: #e8f8ed;
  display: grid;
  place-items: center;
  color: #16a34a;
  flex: 0 0 auto;
  font-size: 34px;
}

.house-hero__content {
  min-width: 0;
}

.house-hero__eyebrow {
  color: #2563eb;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  line-height: 1;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.house-hero__content h1 {
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: 0;
  line-height: 1.1;
  margin: 0 0 8px;
  overflow-wrap: anywhere;
}

.house-hero__meta {
  align-items: center;
  color: #64748b;
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 700;
  gap: 8px 12px;
  margin-bottom: 10px;
}

.house-hero__meta span {
  align-items: center;
  display: inline-flex;
  gap: 5px;
  min-width: 0;
}

.house-hero__meta .q-icon {
  color: #2563eb;
  font-size: 15px;
}

.house-hero__badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.house-hero__facts {
  background: rgba(37, 99, 235, 0.03);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  min-width: 0;
  padding: 12px;
}

.house-hero__metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.hero-metric {
  align-items: center;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 12px;
  display: flex;
  gap: 9px;
  min-height: 54px;
  min-width: 0;
  padding: 10px;
}

.hero-metric :deep(.q-avatar) {
  flex: 0 0 auto;
  font-size: 19px;
}

.hero-metric div {
  min-width: 0;
}

.house-hero__actions {
  align-items: stretch;
  display: grid;
  gap: 8px;
  justify-content: end;
  min-width: 188px;
}

.hero-action {
  width: 100%;
}

.section-label {
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0;
  font-size: 12px;
  letter-spacing: 0.01em;
  line-height: 1.1;
}

.hero-metric span {
  display: block;
  font-size: 12px;
  color: #64748b;
  line-height: 1.2;
}

.hero-metric strong {
  color: #0f172a;
  display: block;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.15;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hero-actions-grid {
  display: contents;
}

.hero-action--primary {
  grid-column: auto;
}

.house-tabs {
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  margin-top: 8px;
  overflow-x: auto;
  scrollbar-width: none;
}

.house-tabs::-webkit-scrollbar {
  display: none;
}

.house-panels {
  background: transparent;
  margin-top: 6px;
}

.house-tabs :deep(.q-tabs__content) {
  flex-wrap: nowrap;
  overflow-x: auto;
  scrollbar-width: none;
}

.house-tabs :deep(.q-tabs__content::-webkit-scrollbar) {
  display: none;
}

.summary-tech-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
}

.summary-tech-card {
  min-width: 0;
}

.summary-section-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-section {
  background: rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.07);
  border-radius: 14px;
  display: grid;
  gap: 12px;
  min-width: 0;
  padding: 14px;
}

.summary-section__header {
  align-items: center;
  display: flex;
  gap: 8px;
}

.summary-section__header .q-icon {
  align-items: center;
  background: #eff6ff;
  border-radius: 10px;
  color: #2563eb;
  display: inline-flex;
  font-size: 17px;
  height: 30px;
  justify-content: center;
  width: 30px;
}

.summary-section__header h3 {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
}

.summary-fields {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.summary-field {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.summary-field span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}

.summary-field strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.detail-card {
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 16px;
  box-shadow: 0 8px 22px rgba(15, 23, 42, 0.045);
  padding: 18px 18px 16px;
}

.detail-card__header h2 {
  font-size: 17px;
  font-weight: 800;
  line-height: 1.2;
  margin: 0;
}

.detail-card__header p {
  margin: 4px 0 14px;
  color: #64748b;
  font-size: 12px;
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

.people-list {
  display: grid;
  gap: 10px;
}

.person-row {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 12px;
  display: grid;
  gap: 12px;
  grid-template-columns:
    minmax(220px, 1.25fr)
    minmax(118px, 0.72fr)
    minmax(132px, 0.8fr)
    minmax(132px, 0.78fr)
    minmax(168px, 1fr)
    34px;
  padding: 12px 12px 12px 14px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.person-row:hover {
  border-color: rgba(37, 99, 235, 0.16);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.045);
}

.person-row__identity {
  align-items: center;
  display: flex;
  gap: 10px;
  min-width: 0;
}

.person-row__avatar {
  background: #eff6ff;
  color: #2563eb;
  flex: 0 0 auto;
  font-size: 12px;
  font-weight: 800;
}

.person-row__name {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.person-row__name strong,
.person-row__cell strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
}

.person-row__name strong,
.person-row__cell strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.person-row__name span,
.person-row__cell span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}

.person-row__cell {
  display: grid;
  gap: 5px;
  min-width: 0;
}

.person-row__badges {
  justify-items: start;
}

.person-row__status {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.person-row__actions {
  align-self: start;
  display: flex;
  justify-content: flex-end;
}

.associated-unit-toolbar {
  display: flex;
  justify-content: flex-end;
  margin: -2px 0 12px;
}

.associated-unit-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.associated-unit-card {
  align-items: flex-start;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
  display: flex;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.associated-unit-card:hover {
  border-color: rgba(37, 99, 235, 0.16);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.045);
}

.associated-unit-card__icon {
  align-items: center;
  background: #eff6ff;
  border-radius: 12px;
  color: #2563eb;
  display: inline-flex;
  flex: 0 0 38px;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.associated-unit-card__icon .q-icon {
  font-size: 20px;
}

.associated-unit-card__content {
  display: grid;
  flex: 1;
  gap: 12px;
  min-width: 0;
}

.associated-unit-card__header {
  align-items: flex-start;
  display: flex;
  gap: 8px;
  justify-content: space-between;
  min-width: 0;
}

.associated-unit-card__header div,
.associated-unit-card__details div {
  display: grid;
  gap: 3px;
  min-width: 0;
}

.associated-unit-card__header span,
.associated-unit-card__details span {
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  line-height: 1.2;
}

.associated-unit-card__header strong,
.associated-unit-card__details strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.associated-unit-card__details {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.associated-unit-card__footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

:deep(.person-row .q-badge),
:deep(.associated-unit-card .q-badge) {
  font-size: 11px;
  font-weight: 700;
  line-height: 1;
  min-height: 22px;
  padding: 3px 8px;
}

@media (max-width: 1024px) {
  .house-hero__main,
  .summary-section-grid,
  .detail-skeleton__hero,
  .detail-skeleton__sections {
    grid-template-columns: 1fr;
  }

  .house-hero__metrics,
  .detail-skeleton__metrics {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .house-hero__actions {
    grid-template-columns: repeat(3, max-content);
    justify-content: start;
    min-width: 0;
  }

  .person-row {
    grid-template-columns: repeat(3, minmax(0, 1fr)) 34px;
  }

  .person-row__identity {
    grid-column: 1 / 4;
  }

  .person-row__actions {
    grid-column: 4;
    grid-row: 1;
  }

  .associated-unit-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 767px) {
  .house-detail-page {
    padding: 12px 12px 16px;
  }

  .house-hero {
    padding: 16px;
  }

  .house-hero__identity {
    flex-direction: column;
  }

  .house-hero__icon {
    width: 54px;
    height: 54px;
    font-size: 32px;
  }

  .house-hero__content h1 {
    font-size: 24px;
  }

  .house-hero__metrics,
  .detail-skeleton__metrics {
    grid-template-columns: 1fr;
  }

  .house-hero__actions {
    grid-template-columns: 1fr;
    width: 100%;
  }

  .house-hero__metrics {
    gap: 9px 10px;
  }

  .summary-fields {
    grid-template-columns: 1fr;
  }

  .entity-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .entity-row__meta {
    justify-content: flex-start;
  }

  .person-row {
    align-items: flex-start;
    grid-template-columns: 1fr auto;
    padding: 12px;
  }

  .person-row__identity {
    grid-column: 1;
  }

  .person-row__cell {
    grid-column: 1 / -1;
  }

  .person-row__actions {
    grid-column: 2;
    grid-row: 1;
  }

  .person-row__name strong,
  .person-row__cell strong {
    white-space: normal;
  }

  .associated-unit-toolbar {
    justify-content: stretch;
  }

  .associated-unit-toolbar .q-btn {
    width: 100%;
  }

  .associated-unit-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .associated-unit-card__header strong,
  .associated-unit-card__details strong {
    white-space: normal;
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
    max-width: 100%;
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
  min-height: 32px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 12px;
  line-height: 1.1;
}

:deep(.house-hero .q-btn .q-icon) {
  font-size: 16px;
}

:deep(.hero-action .q-btn__content) {
  width: auto;
  min-width: 0;
  display: inline-flex;
  align-items: center;
  justify-content: start;
  gap: 6px;
}

:deep(.hero-action .q-btn__content .q-icon) {
  flex: 0 0 auto;
}

:deep(.hero-action .q-btn__content .block) {
  min-width: 0;
  white-space: normal;
  line-height: 1.05;
}

:deep(.house-tabs .q-tab) {
  min-height: 42px;
  padding: 0 14px;
}

:deep(.house-tabs .q-tab__label) {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

:deep(.person-actions-menu__danger) {
  color: #b91c1c;
}

@media (min-width: 1200px) {
  .house-hero__main {
    grid-template-columns: minmax(270px, 0.92fr) minmax(0, 1.35fr) max-content;
  }

  .house-hero__metrics {
    gap: 10px;
  }
}

@media (min-width: 768px) and (max-width: 1199px) {
  .house-hero__main {
    grid-template-columns: minmax(0, 1fr) max-content;
  }

  .house-hero__facts {
    grid-column: 1 / -1;
    grid-row: 2;
  }

  .house-hero__metrics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }

  .house-hero__actions {
    grid-column: 2;
    grid-row: 1;
    grid-template-columns: 1fr;
    justify-content: end;
    min-width: 188px;
  }

}

@media (max-width: 767px) {
  :deep(.house-tabs .q-tab) {
    min-height: 38px;
    padding: 0 12px;
  }

  :deep(.house-tabs .q-tab__label) {
    font-size: 12px;
  }
}

@media (max-width: 420px) {
  .associated-unit-card {
    flex-direction: column;
  }

  .associated-unit-card__icon {
    flex-basis: 38px;
  }
}
</style>
