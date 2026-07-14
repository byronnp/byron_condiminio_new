<template>
  <q-page class="house-page">
    <div class="page-shell">
      <header class="page-header">
        <div class="page-header__copy">
          <div class="eyebrow">Módulo / Casas</div>
          <h1>Editar casa</h1>
          <p>Actualiza la información principal sin cambiar el flujo del detalle.</p>
        </div>

        <q-btn flat no-caps icon="arrow_back" label="Volver" class="ghost-btn" @click="goBack" />
      </header>

      <q-banner v-if="!activeCondominiumId" rounded class="context-warning">
        <template #avatar>
          <q-icon name="apartment" />
        </template>
        Selecciona un condominio en el layout para editar una casa.
      </q-banner>

      <q-banner v-else-if="loadError" rounded class="context-warning">
        <template #avatar>
          <q-icon name="error_outline" />
        </template>
        <div class="banner-copy">
          <span>{{ loadError }}</span>
          <q-btn flat dense no-caps label="Reintentar" :loading="loadingHouse" @click="loadData" />
        </div>
      </q-banner>

      <div v-else class="content-grid">
        <HouseForm
          :form="form"
          :condominium-name="condominiumName"
          :block-options="blockOptions"
          :loading-blocks="loadingBlocks"
          :blocks-load-error="blocksLoadError"
          :loading-house="loadingHouse"
          :submit-error="submitError"
          :saving="saving"
          mode="edit"
          submit-label="Guardar cambios"
          submit-icon="save"
          @submit="submitForm"
          @cancel="goBack"
          @reload-blocks="loadBlocks"
        />

        <aside class="summary-aside">
          <q-card flat bordered class="summary-card">
            <q-card-section class="summary-card__section">
              <div class="summary-card__media">
                <div class="summary-icon">
                  <q-icon name="home" size="30px" />
                </div>
                <div class="summary-copy">
                  <div class="summary-eyebrow">Resumen de la casa</div>
                  <h2>{{ form.code || 'Casa seleccionada' }}</h2>
                </div>
              </div>

              <div class="summary-list q-mt-md">
                <div>
                  <span>Condominio</span>
                  <strong>{{ condominiumName }}</strong>
                </div>
                <div>
                  <span>Número</span>
                  <strong>{{ form.number || 'Sin definir' }}</strong>
                </div>
                <div v-if="form.blockId !== null">
                  <span>Sector</span>
                  <strong>{{ selectedBlockName }}</strong>
                </div>
                <div>
                  <span>Área</span>
                  <strong>{{ form.areaM2 || 0 }} m²</strong>
                </div>
                <div>
                  <span>Asignable</span>
                  <strong>{{ form.isAssignable ? 'Sí' : 'No' }}</strong>
                </div>
                <div>
                  <span>Estado</span>
                  <q-badge :color="form.isActive ? 'positive' : 'grey-7'">
                    {{ form.isActive ? 'Activa' : 'Inactiva' }}
                  </q-badge>
                </div>
              </div>

              <q-banner rounded class="next-step q-mt-lg">
                La edición conserva el mismo patrón visual que la creación.
              </q-banner>
            </q-card-section>
          </q-card>
        </aside>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Notify } from 'quasar';
import { useRoute, useRouter } from 'vue-router';

import HouseForm from './components/HouseForm.vue';
import { useCatalogOptions } from '@/composables/shared/useCatalogOptions';
import {
  fetchUnitById,
  fetchCondominiumBlocks,
  updateHouse,
  type UpdateHousePayload,
} from '@/services/units.service';
import { useSessionStore } from '@/stores/session.store';

const router = useRouter();
const route = useRoute();
const session = useSessionStore();
const saving = ref(false);
const loadingHouse = ref(false);
const loadingBlocks = ref(false);
const loadError = ref('');
const submitError = ref('');
const blocksLoadError = ref('');
const blockOptions = ref<{ label: string; value: number }[]>([]);

const form = reactive({
  blockId: null as number | null,
  unitTypeId: null as number | null,
  number: '',
  code: '',
  areaM2: null as number | null,
  isAssignable: true,
  isActive: true,
});
const originalForm = ref({ ...form });

const { options: unitTypes, loadOptions: loadUnitTypes } = useCatalogOptions<{
  label: string;
  value: number;
  code: string;
}>('unit_types', {
  fallback: [],
  mapItem: (item) => ({ label: item.name, value: item.id, code: item.code }),
});

const activeCondominiumId = computed(() => {
  const id = Number(session.activeCondoId);
  return Number.isInteger(id) && id > 0 ? id : null;
});

const unitId = computed(() => {
  const id = Number(route.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
});

const condominiumName = computed(() => session.activeCondominium?.name ?? 'Sin condominio');

const selectedBlockName = computed(
  () => blockOptions.value.find((item) => item.value === form.blockId)?.label ?? 'Sin definir',
);

onMounted(() => {
  void loadData();
});

watch(activeCondominiumId, () => {
  void loadData();
});

async function loadData() {
  if (!activeCondominiumId.value || !unitId.value) {
    return;
  }

  loadingHouse.value = true;
  loadError.value = '';
  submitError.value = '';
  blocksLoadError.value = '';

  try {
    await Promise.all([loadBlocks(), loadUnitTypes()]);

    const house = await fetchUnitById(activeCondominiumId.value, unitId.value, session.accessToken);
    if (!house) {
      throw new Error('No se encontró la casa seleccionada.');
    }

    form.blockId = house.blockId ?? null;
    form.unitTypeId = house.unitTypeId;
    form.number = house.number ?? '';
    form.code = house.code ?? '';
    form.areaM2 = house.areaM2 ?? null;
    form.isAssignable = house.isAssignable !== false;
    form.isActive = house.isActive !== false;
    originalForm.value = { ...form };

    if (!form.unitTypeId) {
      const houseType = unitTypes.value.find((item) => item.code.toLowerCase().includes('casa'));
      form.unitTypeId = houseType?.value ?? unitTypes.value[0]?.value ?? null;
    }
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : 'No fue posible cargar la casa.';
  } finally {
    loadingHouse.value = false;
  }
}

async function loadBlocks() {
  if (!activeCondominiumId.value) return;

  loadingBlocks.value = true;
  blocksLoadError.value = '';

  try {
    const blocks = await fetchCondominiumBlocks(activeCondominiumId.value, session.accessToken);
    blockOptions.value = blocks.map((item) => ({ label: item.name, value: item.id }));
  } catch (error) {
    blockOptions.value = [];
    blocksLoadError.value =
      error instanceof Error ? error.message : 'No fue posible cargar los bloques.';
  } finally {
    loadingBlocks.value = false;
  }
}

async function submitForm() {
  if (
    !activeCondominiumId.value ||
    !unitId.value ||
    !form.unitTypeId ||
    !form.code.trim() ||
    !form.number.trim()
  ) {
    return;
  }

  const payload = buildUpdatePayload();

  saving.value = true;
  submitError.value = '';

  try {
    await updateHouse(
      activeCondominiumId.value,
      unitId.value,
      payload,
      session.accessToken,
    );

    Notify.create({
      type: 'positive',
      message: 'Casa actualizada correctamente.',
      position: 'top-right',
    });

    await router.push({ name: 'unidades-detalle', params: { id: String(unitId.value) } });
  } catch (error) {
    submitError.value = error instanceof Error ? error.message : 'No fue posible actualizar la casa.';
    Notify.create({
      type: 'negative',
      message: submitError.value,
      position: 'top-right',
    });
  } finally {
    saving.value = false;
  }
}

function buildUpdatePayload(): UpdateHousePayload {
  const original = originalForm.value;
  const payload: UpdateHousePayload = {};

  if (form.blockId !== original.blockId) payload.blockId = form.blockId;
  if (form.unitTypeId !== original.unitTypeId && form.unitTypeId !== null) {
    payload.unitTypeId = form.unitTypeId;
  }
  if (form.number.trim() !== original.number) payload.number = form.number;
  if (form.code.trim().toUpperCase() !== original.code.trim().toUpperCase()) {
    payload.code = form.code;
  }
  if (form.areaM2 !== original.areaM2) payload.areaM2 = form.areaM2;
  if (form.isAssignable !== original.isAssignable) payload.isAssignable = form.isAssignable;
  if (form.isActive !== original.isActive) payload.isActive = form.isActive;

  return payload;
}

function goBack() {
  if (unitId.value) {
    void router.push({ name: 'unidades-detalle', params: { id: String(unitId.value) } });
    return;
  }

  void router.push('/unidades');
}
</script>

<style scoped>
.house-page {
  min-height: 100%;
  padding: 16px 0 0;
}

.page-shell {
  display: grid;
  gap: 18px;
}

.page-header {
  align-items: flex-start;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.page-header__copy {
  min-width: 0;
}

.page-header h1 {
  color: var(--app-text);
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.1;
  margin: 4px 0 0;
}

.page-header p {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 4px;
  max-width: 52rem;
}

.eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.ghost-btn,
.summary-card {
  background: #fff;
  border-color: rgba(15, 23, 42, 0.08);
  border-radius: 16px;
}

.content-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) 320px;
}

.summary-aside {
  align-self: start;
}

.summary-card {
  position: sticky;
  top: 16px;
}

.summary-card__section {
  display: grid;
  gap: 14px;
  padding: 20px;
}

.summary-card__media {
  display: flex;
  gap: 12px;
  align-items: center;
}

.summary-icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.1);
  border-radius: 14px;
  color: var(--app-primary);
  display: flex;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.summary-copy {
  min-width: 0;
}

.summary-eyebrow {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-copy h2 {
  color: var(--app-text);
  font-size: 20px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.15;
  margin: 4px 0 0;
}

.summary-list {
  display: grid;
  gap: 11px;
}

.summary-list > div {
  align-items: center;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.summary-list span {
  color: var(--app-text-muted);
  font-size: 11px;
}

.summary-list strong {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  text-align: right;
}

.next-step {
  background: rgba(37, 99, 235, 0.06);
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
}

.banner-copy {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  width: 100%;
}

.context-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #92400e;
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .summary-card {
    position: static;
  }
}

@media (max-width: 650px) {
  .house-page {
    padding: 12px 0 0;
  }

  .page-header {
    gap: 12px;
    flex-direction: column;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .summary-card__section {
    padding: 16px;
  }

  .banner-copy {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
