<template>
  <q-page class="house-page">
    <div class="page-shell">
      <header class="page-header">
        <div>
          <div class="eyebrow">Módulo / Casas</div>
          <h1>Nueva casa</h1>
          <p>Registra los datos esenciales. Personas y parqueaderos se agregan después.</p>
        </div>
        <q-btn flat no-caps icon="arrow_back" label="Volver" class="ghost-btn" @click="goBack" />
      </header>

      <q-banner v-if="!activeCondominiumId" rounded class="context-warning">
        <template #avatar><q-icon name="apartment" /></template>
        Selecciona un condominio en el layout para registrar una casa.
      </q-banner>

      <div v-else class="content-grid">
        <q-form ref="formRef" class="form-column" @submit.prevent="submitForm">
          <section class="context-panel">
            <q-icon name="apartment" size="22px" />
            <div><span>Condominio seleccionado</span><strong>{{ condominiumName }}</strong></div>
          </section>

          <q-card flat bordered class="section-card">
            <q-card-section>
              <div class="section-heading"><q-icon name="tag" /><div><strong>Identificación</strong><span>Define dónde se encuentra y cómo reconocerla.</span></div></div>
              <div class="form-grid q-mt-lg">
                <q-select v-model="form.blockId" dense outlined emit-value map-options label="Bloque, manzana o sector *" :options="blockOptions" :loading="loadingOptions" :rules="[requiredRule]" />
                <q-input v-model="form.number" dense outlined label="Número de casa *" placeholder="Ej: 12" maxlength="30" :rules="[requiredTextRule]" @update:model-value="suggestCode" />
                <q-input v-model="form.code" dense outlined label="Código interno *" placeholder="Ej: CASA-12" maxlength="40" :rules="[requiredTextRule]" @update:model-value="codeWasEdited = true" />
              </div>
            </q-card-section>
          </q-card>

          <q-card flat bordered class="section-card">
            <q-card-section>
              <div class="section-heading"><q-icon name="straighten" /><div><strong>Características</strong><span>Configura únicamente los datos propios de la casa.</span></div></div>
              <div class="form-grid form-grid--compact q-mt-lg">
                <q-input v-model.number="form.areaM2" dense outlined type="number" min="0.01" step="0.01" label="Área *" suffix="m²" :rules="[positiveNumberRule]" />
              </div>
              <div class="switch-list q-mt-md">
                <q-item tag="label"><q-item-section><q-item-label>Permitir asignar personas</q-item-label><q-item-label caption>Habilita propietarios, residentes y responsables de facturación.</q-item-label></q-item-section><q-item-section side><q-toggle v-model="form.isAssignable" /></q-item-section></q-item>
                <q-separator />
                <q-item tag="label"><q-item-section><q-item-label>Casa activa</q-item-label><q-item-label caption>Permite utilizarla en las operaciones del condominio.</q-item-label></q-item-section><q-item-section side><q-toggle v-model="form.isActive" /></q-item-section></q-item>
              </div>
            </q-card-section>
          </q-card>

          <q-banner v-if="submitError" rounded class="submit-error">{{ submitError }}</q-banner>
          <div class="form-actions"><q-btn flat no-caps label="Cancelar" @click="goBack" /><q-btn color="primary" unelevated no-caps icon="add_home" label="Crear casa" type="submit" :loading="saving" /></div>
        </q-form>

        <aside>
          <q-card flat bordered class="summary-card">
            <q-card-section>
              <div class="summary-icon"><q-icon name="home" size="30px" /></div>
              <div class="summary-eyebrow">Resumen de la casa</div>
              <h2>{{ form.code || 'Nueva casa' }}</h2>
              <div class="summary-list">
                <div><span>Condominio</span><strong>{{ condominiumName }}</strong></div>
                <div><span>Número</span><strong>{{ form.number || 'Sin definir' }}</strong></div>
                <div><span>Sector</span><strong>{{ selectedBlockName }}</strong></div>
                <div><span>Área</span><strong>{{ form.areaM2 || 0 }} m²</strong></div>
                <div><span>Asignable</span><strong>{{ form.isAssignable ? 'Sí' : 'No' }}</strong></div>
                <div><span>Estado</span><q-badge :color="form.isActive ? 'positive' : 'grey-7'">{{ form.isActive ? 'Activa' : 'Inactiva' }}</q-badge></div>
              </div>
              <q-banner rounded class="next-step q-mt-lg">Después podrás agregar personas y parqueaderos desde el detalle.</q-banner>
            </q-card-section>
          </q-card>
        </aside>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Notify, type QForm } from 'quasar';
import { useRouter } from 'vue-router';
import { useCatalogOptions } from '@/composables/shared/useCatalogOptions';
import { createHouse, fetchCondominiumBlocks } from '@/services/units.service';
import { useSessionStore } from '@/stores/session.store';

const router = useRouter();
const session = useSessionStore();
const formRef = ref<QForm | null>(null);
const saving = ref(false);
const submitError = ref('');
const blockOptions = ref<{ label: string; value: number }[]>([]);
const loadingOptions = ref(false);
const codeWasEdited = ref(false);
const form = reactive({ blockId: null as number | null, unitTypeId: null as number | null, number: '', code: '', areaM2: null as number | null, isAssignable: true, isActive: true });
const { options: unitTypes, loadOptions: loadUnitTypes } = useCatalogOptions<{ label: string; value: number; code: string }>('unit_types', { fallback: [], mapItem: (item) => ({ label: item.name, value: item.id, code: item.code }) });
const activeCondominiumId = computed(() => { const id = Number(session.activeCondoId); return Number.isInteger(id) && id > 0 ? id : null; });
const condominiumName = computed(() => session.activeCondominium?.name ?? 'Sin condominio');
const selectedBlockName = computed(() => blockOptions.value.find((item) => item.value === form.blockId)?.label ?? 'Sin definir');
const requiredRule = (value: unknown) => value !== null && value !== undefined || 'Campo requerido';
const requiredTextRule = (value: unknown) => typeof value === 'string' && value.trim() ? true : 'Campo requerido';
const positiveNumberRule = (value: unknown) => Number(value) > 0 || 'Debe ser mayor que cero';

onMounted(async () => {
  if (!activeCondominiumId.value) return;
  loadingOptions.value = true;
  try {
    const [blocks] = await Promise.all([fetchCondominiumBlocks(activeCondominiumId.value, session.accessToken), loadUnitTypes()]);
    blockOptions.value = blocks.map((item) => ({ label: item.name, value: item.id }));
    const houseType = unitTypes.value.find((item) => item.code.toLowerCase().includes('casa'));
    form.unitTypeId = houseType?.value ?? unitTypes.value[0]?.value ?? null;
  } catch (error) { submitError.value = error instanceof Error ? error.message : 'No fue posible cargar las opciones.'; }
  finally { loadingOptions.value = false; }
});

function suggestCode(value: string | number | null) {
  if (!codeWasEdited.value) form.code = value ? `CASA-${String(value).trim()}`.toUpperCase() : '';
}
async function submitForm() {
  if (!(await formRef.value?.validate()) || !activeCondominiumId.value || !form.blockId || !form.unitTypeId || !form.areaM2) return;
  saving.value = true; submitError.value = '';
  try {
    await createHouse(activeCondominiumId.value, { blockId: form.blockId, unitTypeId: form.unitTypeId, number: form.number, code: form.code, areaM2: form.areaM2, isAssignable: form.isAssignable, isActive: form.isActive }, session.accessToken);
    Notify.create({ type: 'positive', message: 'Casa creada correctamente.', position: 'top-right' });
    await router.push('/unidades');
  } catch (error) { submitError.value = error instanceof Error ? error.message : 'No fue posible crear la casa.'; }
  finally { saving.value = false; }
}
function goBack() { void router.push('/unidades'); }
</script>

<style scoped>
.house-page{min-height:100%;padding:16px 0 0}.page-shell{display:grid;gap:18px}.page-header{align-items:flex-start;display:flex;justify-content:space-between}.page-header h1{color:var(--app-text);font-size:26px;margin:3px 0}.page-header p,.section-heading span{color:var(--app-text-muted);font-size:12px}.eyebrow{color:var(--app-primary);font-size:11px;font-weight:800;text-transform:uppercase}.ghost-btn,.section-card,.summary-card{background:#fff;border-color:rgba(15,23,42,.08);border-radius:16px}.content-grid{display:grid;gap:18px;grid-template-columns:minmax(0,1fr) 320px}.form-column{display:grid;gap:16px}.context-panel{align-items:center;background:rgba(37,99,235,.06);border:1px solid rgba(37,99,235,.14);border-radius:14px;color:var(--app-primary);display:flex;gap:12px;padding:13px 16px}.context-panel div{display:grid}.context-panel span{font-size:11px}.section-heading{align-items:center;display:flex;gap:10px}.section-heading div{display:grid}.form-grid{display:grid;gap:14px;grid-template-columns:repeat(3,minmax(0,1fr))}.form-grid--compact{grid-template-columns:minmax(220px,360px)}.switch-list{border:1px solid rgba(15,23,42,.07);border-radius:14px}.form-actions{display:flex;gap:10px;justify-content:flex-end}.summary-card{position:sticky;top:16px}.summary-icon{align-items:center;background:rgba(37,99,235,.1);border-radius:14px;color:var(--app-primary);display:flex;height:52px;justify-content:center;width:52px}.summary-eyebrow{color:var(--app-text-muted);font-size:11px;margin-top:14px}.summary-card h2{font-size:21px;margin:3px 0 16px}.summary-list{display:grid;gap:11px}.summary-list>div{align-items:center;display:flex;gap:14px;justify-content:space-between}.summary-list span{color:var(--app-text-muted);font-size:11px}.summary-list strong{font-size:12px;text-align:right}.next-step{background:rgba(37,99,235,.06);color:var(--app-text-muted);font-size:11px}.context-warning,.submit-error{background:rgba(245,158,11,.1);color:#92400e}@media(max-width:900px){.content-grid{grid-template-columns:1fr}.summary-card{position:static}}@media(max-width:650px){.house-page{padding:12px 0 0}.page-header{gap:12px}.form-grid{grid-template-columns:1fr}.form-actions>*{flex:1}}
</style>
