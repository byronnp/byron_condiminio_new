<template>
  <q-page class="detail-page">
    <div class="page-shell">
      <header class="page-header">
        <div>
          <div class="eyebrow">Casas / Detalle</div>
          <h1>{{ house?.code || 'Detalle de casa' }}</h1>
          <p>{{ condominiumName }} · Casa {{ house?.number || '-' }}</p>
          <div v-if="house" class="header-badges">
            <q-badge :color="house.isActive ? 'positive' : 'grey-7'" rounded>{{
              house.isActive ? 'Activa' : 'Inactiva'
            }}</q-badge
            ><q-badge outline color="primary" rounded>{{
              house.isAssignable ? 'Asignable' : 'No asignable'
            }}</q-badge>
          </div>
        </div>
        <q-btn flat no-caps icon="arrow_back" label="Volver" @click="goBack" />
      </header>
      <q-inner-loading :showing="loading"
        ><q-spinner color="primary" size="34px"
      /></q-inner-loading>
      <q-banner v-if="error" rounded class="error-banner"
        ><template #avatar><q-icon name="error_outline" /></template>{{ error
        }}<template #action><q-btn flat dense no-caps label="Reintentar" @click="load" /></template
      ></q-banner>
      <template v-if="house">
        <div class="summary-grid">
          <q-card v-for="item in summary" :key="item.label" flat bordered class="summary-card"
            ><q-card-section
              ><div
                class="summary-card__icon"
                :style="{ background: item.tint.bg, color: item.tint.fg }"
              >
                <q-icon :name="item.icon" size="21px" />
              </div>
              <div>
                <span>{{ item.label }}</span
                ><strong>{{ item.value }}</strong>
              </div></q-card-section
            ></q-card
          >
        </div>
        <q-tabs
          v-model="tab"
          dense
          align="left"
          active-color="primary"
          indicator-color="primary"
          class="tabs"
          ><q-tab name="summary" label="Resumen" /><q-tab
            name="people"
            :label="`Personas (${people.length})`" /><q-tab
            name="parking"
            :label="`Parqueaderos (${parkings.length})`"
        /></q-tabs>
        <q-tab-panels v-model="tab" animated class="panels">
          <q-tab-panel name="summary"
            ><div class="section-header">
              <div>
                <h2>Información de la casa</h2>
                <p>Datos estructurales registrados.</p>
              </div>
            </div>
            <div class="detail-list">
              <div>
                <span>Código</span><strong>{{ house.code }}</strong>
              </div>
              <div>
                <span>Número</span><strong>{{ house.number }}</strong>
              </div>
              <div>
                <span>Área</span><strong>{{ house.areaM2 }} m²</strong>
              </div>
              <div>
                <span>Bloque o sector</span><strong>{{ house.blockName }}</strong>
              </div>
              <div>
                <span>Propietario principal</span><strong>{{ house.ownerName }}</strong>
              </div>
              <div>
                <span>Estado</span><strong>{{ house.isActive ? 'Activa' : 'Inactiva' }}</strong>
              </div>
              <div>
                <span>Asignación de personas</span
                ><strong>{{ house.isAssignable ? 'Habilitada' : 'Deshabilitada' }}</strong>
              </div>
            </div></q-tab-panel
          >
          <q-tab-panel name="people"
            ><div class="section-header">
              <div>
                <h2>Personas asociadas</h2>
                <p>Propietarios, residentes y responsables.</p>
              </div>
              <q-btn
                color="primary"
                unelevated
                no-caps
                icon="person_add"
                label="Agregar persona"
                :disable="!house.isAssignable"
                @click="openPersonDialog"
                ><q-tooltip>{{
                  house.isAssignable
                    ? 'Registrar una persona asociada a esta casa'
                    : 'La casa no permite asignar personas'
                }}</q-tooltip></q-btn
              >
            </div>
            <q-list v-if="people.length" separator bordered class="rounded-borders"
              ><q-item v-for="person in people" :key="person.id"
                ><q-item-section avatar
                  ><q-avatar color="primary" text-color="white">{{
                    initials(person.name)
                  }}</q-avatar></q-item-section
                ><q-item-section
                  ><q-item-label>{{ person.name }}</q-item-label
                  ><q-item-label caption
                    >{{ person.relationship }} · {{ person.email || 'Sin correo' }}</q-item-label
                  ></q-item-section
                ><q-item-section side
                  ><div class="person-badges">
                    <q-badge v-if="person.isPrimary" outline color="primary">Principal</q-badge
                    ><q-badge v-if="person.isBillingResponsible" outline color="positive"
                      >Facturación</q-badge
                    >
                    <div class="person-actions">
                      <q-btn
                        flat
                        round
                        dense
                        icon="edit"
                        class="table-icon"
                        @click="openPersonEditDialog(person)"
                      >
                        <q-tooltip>Editar persona</q-tooltip>
                      </q-btn>
                    </div>
                  </div></q-item-section
                ></q-item
              ></q-list
            >
            <div v-else class="empty">No existen personas asociadas.</div></q-tab-panel
          >
          <q-tab-panel name="parking"
            ><div class="section-header">
              <div>
                <h2>Parqueaderos privados</h2>
                <p>Unidades hijas asociadas a esta casa.</p>
              </div>
              <q-btn
                color="primary"
                unelevated
                no-caps
                icon="local_parking"
                label="Agregar parqueadero"
                @click="parkingDialog = true"
              />
            </div>
            <div v-if="parkings.length" class="parking-grid">
              <q-card v-for="parking in parkings" :key="parking.id" flat bordered
                ><q-card-section
                  ><div class="parking-card__header">
                    <strong>{{ parking.code }}</strong
                    ><q-badge :color="parking.isActive ? 'positive' : 'grey-7'" rounded>{{
                      parking.isActive ? 'Activo' : 'Inactivo'
                    }}</q-badge>
                  </div>
                  <span>Número {{ parking.number }} · {{ parking.areaM2 }} m²</span></q-card-section
                ></q-card
              >
            </div>
            <div v-else class="empty">No existen parqueaderos asociados.</div></q-tab-panel
          >
        </q-tab-panels>
      </template>
    </div>
    <q-dialog v-model="personDialog">
      <q-card class="dialog-card dialog-card--wide">
        <q-form ref="personFormRef" @submit.prevent="savePerson">
          <q-card-section>
            <h2>Agregar persona</h2>
            <p>Se asociará a {{ house?.code }} dentro de {{ condominiumName }}.</p>
          </q-card-section>
          <q-card-section class="dialog-form">
            <div class="dialog-grid">
              <q-input
                v-model="person.firstName"
                dense
                outlined
                label="Nombres *"
                :rules="[requiredTextRule]"
              />
              <q-input
                v-model="person.lastName"
                dense
                outlined
                label="Apellidos *"
                :rules="[requiredTextRule]"
              />
              <q-select
                v-model="person.documentTypeId"
                dense
                outlined
                emit-value
                map-options
                :options="documentTypeOptions"
                label="Tipo de documento *"
                :rules="[requiredSelectRule]"
              />
              <q-input
                v-model="person.documentNumber"
                dense
                outlined
                label="Número de documento *"
                :rules="[requiredTextRule]"
              />
              <q-select
                v-model="person.relationshipTypeId"
                dense
                outlined
                emit-value
                map-options
                :options="relationshipTypeOptions"
                label="Relación con la unidad *"
                :rules="[requiredSelectRule]"
              />
              <q-input v-model="person.phone" dense outlined label="Teléfono" />
              <q-input v-model="person.secondaryPhone" dense outlined label="Teléfono secundario" />
              <q-input
                v-model="person.startedAt"
                dense
                outlined
                type="date"
                label="Inicio de relación"
              />
              <q-input
                v-model="person.endedAt"
                dense
                outlined
                type="date"
                label="Fin de relación"
              />
            </div>
            <div class="switch-list">
              <q-item tag="label">
                <q-item-section>
                  <q-item-label>Persona principal</q-item-label>
                  <q-item-label caption>Marca a esta persona como contacto principal.</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="person.isPrimary" />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item tag="label">
                <q-item-section>
                  <q-item-label>Responsable de facturación</q-item-label>
                  <q-item-label caption>Recibirá la referencia principal de cobros.</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="person.isBillingResponsible" />
                </q-item-section>
              </q-item>
            </div>
            <q-banner rounded class="context-note"
              >País fijo: <strong>EC</strong>. El backend enviará la invitación o actualización
              según corresponda.</q-banner
            >
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat no-caps label="Cancelar" v-close-popup />
            <q-btn
              color="primary"
              unelevated
              no-caps
              label="Guardar"
              type="submit"
              :loading="savingPerson"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="personEditDialog">
      <q-card class="dialog-card dialog-card--wide">
        <q-inner-loading :showing="loadingPersonProfile">
          <q-spinner color="primary" size="28px" />
        </q-inner-loading>
        <q-form ref="personEditFormRef" @submit.prevent="savePersonEdit">
          <q-card-section>
            <h2>Editar persona</h2>
            <p>{{ selectedPersonLabel }}</p>
          </q-card-section>
          <q-card-section class="dialog-form">
            <div class="dialog-grid">
              <q-input
                v-model="personEdit.firstName"
                dense
                outlined
                label="Nombres *"
                :rules="[requiredTextRule]"
              />
              <q-input
                v-model="personEdit.lastName"
                dense
                outlined
                label="Apellidos *"
                :rules="[requiredTextRule]"
              />
              <q-select
                v-model="personEdit.documentTypeId"
                dense
                outlined
                emit-value
                map-options
                :options="documentTypeOptions"
                label="Tipo de documento *"
                :rules="[requiredSelectRule]"
              />
              <q-input
                v-model="personEdit.documentNumber"
                dense
                outlined
                label="Número de documento *"
                :rules="[requiredTextRule]"
              />
              <q-select
                v-model="personEdit.relationshipTypeId"
                dense
                outlined
                emit-value
                map-options
                :options="relationshipTypeOptions"
                label="Relación con la unidad *"
                :rules="[requiredSelectRule]"
              />
              <q-input v-model="personEdit.phone" dense outlined label="Teléfono" />
              <q-input v-model="personEdit.secondaryPhone" dense outlined label="Teléfono secundario" />
              <q-input
                v-model="personEdit.startedAt"
                dense
                outlined
                type="date"
                label="Inicio de relación"
              />
              <q-input
                v-model="personEdit.endedAt"
                dense
                outlined
                type="date"
                label="Fin de relación"
              />
            </div>
            <div class="switch-list">
              <q-item tag="label">
                <q-item-section>
                  <q-item-label>Persona principal</q-item-label>
                  <q-item-label caption>Marca a esta persona como contacto principal.</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="personEdit.isPrimary" />
                </q-item-section>
              </q-item>
              <q-separator />
              <q-item tag="label">
                <q-item-section>
                  <q-item-label>Responsable de facturación</q-item-label>
                  <q-item-label caption>Recibirá la referencia principal de cobros.</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-toggle v-model="personEdit.isBillingResponsible" />
                </q-item-section>
              </q-item>
            </div>
          </q-card-section>
          <q-card-actions align="between">
            <q-btn
              flat
              no-caps
              color="negative"
              icon="person_off"
              label="Desactivar"
              :loading="deactivatingPerson"
              @click="deactivateSelectedPerson"
            />
            <div class="row q-gutter-sm">
              <q-btn flat no-caps label="Cancelar" v-close-popup />
              <q-btn
                color="primary"
                unelevated
                no-caps
                label="Guardar cambios"
                type="submit"
                :loading="savingPersonEdit"
              />
            </div>
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="parkingDialog"
      ><q-card class="dialog-card"
        ><q-card-section
          ><h2>Agregar parqueadero</h2>
          <p>Se asociará a {{ house?.code }}.</p></q-card-section
        ><q-card-section class="dialog-form"
          ><q-input v-model="parking.number" dense outlined label="Número *" /><q-input
            v-model="parking.code"
            dense
            outlined
            label="Código *" /><q-input
            v-model.number="parking.areaM2"
            dense
            outlined
            type="number"
            label="Área (m²)" /></q-card-section
        ><q-card-actions align="right"
          ><q-btn flat no-caps label="Cancelar" v-close-popup /><q-btn
            color="primary"
            unelevated
            no-caps
            label="Guardar"
            :loading="savingParking"
            @click="saveParking" /></q-card-actions></q-card
    ></q-dialog>
  </q-page>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { Notify } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useCatalogOptions } from '@/composables/shared/useCatalogOptions';
import {
  createUnitPerson,
  createParkingUnit,
  fetchUnitById,
  fetchUnitPeople,
  fetchUnitPersonProfile,
  fetchUnits,
  updateUnitPerson,
  type UnitListItem,
  type UnitPersonItem,
  type UnitPersonProfile,
} from '@/services/units.service';
import { useSessionStore } from '@/stores/session.store';
const route = useRoute(),
  router = useRouter(),
  session = useSessionStore();
const tab = ref('summary'),
  house = ref<UnitListItem | null>(null),
  people = ref<UnitPersonItem[]>([]),
  parkings = ref<UnitListItem[]>([]),
  loading = ref(false),
  error = ref(''),
  personDialog = ref(false),
  savingPerson = ref(false),
  personEditDialog = ref(false),
  savingPersonEdit = ref(false),
  loadingPersonProfile = ref(false),
  deactivatingPerson = ref(false),
  parkingDialog = ref(false),
  savingParking = ref(false);
const personFormRef = ref();
const personEditFormRef = ref();
const selectedPersonId = ref<number | null>(null);
const selectedPersonLabel = ref('');
const parking = reactive({ number: '', code: '', areaM2: null as number | null });
const person = reactive({
  firstName: '',
  lastName: '',
  documentTypeId: null as number | null,
  documentNumber: '',
  phone: '',
  secondaryPhone: '',
  relationshipTypeId: null as number | null,
  startedAt: '',
  endedAt: '',
  isPrimary: false,
  isBillingResponsible: false,
});
const personEdit = reactive({
  firstName: '',
  lastName: '',
  documentTypeId: null as number | null,
  documentNumber: '',
  phone: '',
  secondaryPhone: '',
  relationshipTypeId: null as number | null,
  startedAt: '',
  endedAt: '',
  isPrimary: false,
  isBillingResponsible: false,
});
const { options: unitTypes, loadOptions } = useCatalogOptions<{
  label: string;
  value: number;
  code: string;
}>('unit_types', {
  fallback: [],
  mapItem: (item) => ({ label: item.name, value: item.id, code: item.code }),
});
const { options: documentTypeOptions, loadOptions: loadDocumentTypes } = useCatalogOptions<{
  label: string;
  value: number;
}>('document_types', {
  fallback: [],
  mapItem: (item) => ({ label: item.name, value: item.id }),
});
const { options: relationshipTypeOptions, loadOptions: loadRelationshipTypes } = useCatalogOptions<{
  label: string;
  value: number;
  code: string;
}>('resident_relationship_types', {
  fallback: [],
  mapItem: (item) => ({ label: item.name, value: item.id, code: item.code }),
});
const condominiumId = computed(() => {
  const id = Number(session.activeCondoId);
  return Number.isInteger(id) && id > 0 ? id : null;
});
const unitId = computed(() => {
  const id = Number(route.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
});
const condominiumName = computed(() => session.activeCondominium?.name ?? 'Sin condominio');
const summary = computed(() => {
  const palette = [
    { bg: 'rgba(37,99,235,.12)', fg: '#2563eb' },
    { bg: 'rgba(34,197,94,.12)', fg: '#16a34a' },
    { bg: 'rgba(249,115,22,.14)', fg: '#ea580c' },
    { bg: 'rgba(124,58,237,.12)', fg: '#7c3aed' },
  ] as const;
  return [
    { label: 'Estado', value: house.value?.isActive ? 'Activa' : 'Inactiva', icon: 'verified' },
    { label: 'Área', value: `${house.value?.areaM2 ?? 0} m²`, icon: 'straighten' },
    { label: 'Personas', value: String(people.value.length), icon: 'groups' },
    { label: 'Parqueaderos', value: String(parkings.value.length), icon: 'local_parking' },
  ].map((item, index) => ({ ...item, tint: palette[index % palette.length]! }));
});
const requiredTextRule = (value: unknown) =>
  typeof value === 'string' && value.trim() ? true : 'Campo requerido';
const requiredSelectRule = (value: unknown) =>
  Number(value) > 0 || 'Selecciona una opción';
onMounted(load);
watch(
  () => session.activeCondoId,
  () => goBack(),
);
async function load() {
  if (!condominiumId.value || !unitId.value) {
    error.value = 'No existe un contexto válido para consultar la casa.';
    return;
  }
  loading.value = true;
  error.value = '';
  try {
    const [detail, persons, units] = await Promise.all([
      fetchUnitById(condominiumId.value, unitId.value, session.accessToken),
      fetchUnitPeople(condominiumId.value, unitId.value, session.accessToken),
      fetchUnits(condominiumId.value, session.accessToken),
      loadOptions(),
      loadDocumentTypes(),
      loadRelationshipTypes(),
    ]);
    if (!detail) throw new Error('No se encontró la casa solicitada.');
    house.value = detail;
    people.value = persons;
    parkings.value = units.filter((x) => x.parentUnitId === unitId.value);
  } catch (e) {
    error.value = e instanceof Error ? e.message : 'No fue posible cargar la casa.';
  } finally {
    loading.value = false;
  }
}
async function openPersonDialog() {
  if (!house.value?.isAssignable) {
    Notify.create({ type: 'warning', message: 'Esta casa no permite asignar personas.' });
    return;
  }
  if (!documentTypeOptions.value.length || !relationshipTypeOptions.value.length) {
    try {
      await Promise.all([loadDocumentTypes(), loadRelationshipTypes()]);
    } catch (error) {
      Notify.create({
        type: 'negative',
        message: error instanceof Error ? error.message : 'No fue posible cargar los catálogos.',
      });
      return;
    }
  }
  if (!person.documentTypeId) person.documentTypeId = documentTypeOptions.value[0]?.value ?? null;
  if (!person.relationshipTypeId)
    person.relationshipTypeId = relationshipTypeOptions.value[0]?.value ?? null;
  personDialog.value = true;
}
async function savePerson() {
  if (
    !(await personFormRef.value?.validate()) ||
    !condominiumId.value ||
    !unitId.value ||
    !person.documentTypeId ||
    !person.relationshipTypeId
  )
    return;
  savingPerson.value = true;
  try {
    await createUnitPerson(
      condominiumId.value,
      unitId.value,
      {
        firstName: person.firstName,
        lastName: person.lastName,
        documentTypeId: person.documentTypeId,
        documentNumber: person.documentNumber,
        phone: person.phone,
        secondaryPhone: person.secondaryPhone,
        relationshipTypeId: person.relationshipTypeId,
        startedAt: person.startedAt,
        endedAt: person.endedAt,
        isPrimary: person.isPrimary,
        isBillingResponsible: person.isBillingResponsible,
      },
      session.accessToken,
    );
    Notify.create({ type: 'positive', message: 'Persona agregada.' });
    personDialog.value = false;
    person.firstName = '';
    person.lastName = '';
    person.documentTypeId = null;
    person.documentNumber = '';
    person.phone = '';
    person.secondaryPhone = '';
    person.relationshipTypeId = null;
    person.startedAt = '';
    person.endedAt = '';
    person.isPrimary = false;
    person.isBillingResponsible = false;
    await load();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No fue posible agregar la persona.',
    });
  } finally {
    savingPerson.value = false;
  }
}
async function openPersonEditDialog(personRow: UnitPersonItem) {
  if (!house.value?.isAssignable) {
    Notify.create({ type: 'warning', message: 'Esta casa no permite asignar personas.' });
    return;
  }
  selectedPersonId.value = personRow.id;
  selectedPersonLabel.value = personRow.name;
  personEditDialog.value = true;
  loadingPersonProfile.value = true;
  try {
    if (!documentTypeOptions.value.length || !relationshipTypeOptions.value.length) {
      await Promise.all([loadDocumentTypes(), loadRelationshipTypes()]);
    }
    const profile = await fetchUnitPersonProfile(personRow.id, session.accessToken);
    populatePersonEditForm(profile, personRow);
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No fue posible cargar la persona.',
    });
  } finally {
    loadingPersonProfile.value = false;
  }
}
function populatePersonEditForm(
  profile: UnitPersonProfile | null,
  personRow: UnitPersonItem,
) {
  const names = [profile?.firstName ?? '', profile?.lastName ?? ''].filter(Boolean);
  personEdit.firstName = profile?.firstName || names[0] || personRow.name.split(' ')[0] || '';
  personEdit.lastName =
    profile?.lastName || names.slice(1).join(' ') || personRow.name.split(' ').slice(1).join(' ');
  personEdit.documentTypeId = profile?.documentTypeId ?? documentTypeOptions.value[0]?.value ?? null;
  personEdit.documentNumber = profile?.documentNumber ?? '';
  personEdit.phone = profile?.phone ?? '';
  personEdit.secondaryPhone = profile?.secondaryPhone ?? '';
  const relationshipOption = relationshipTypeOptions.value.find((item) => {
    const code = personRow.relationship?.toLowerCase() ?? '';
    return item.code.toLowerCase() === code || item.label.toLowerCase() === code;
  });
  personEdit.relationshipTypeId = relationshipOption?.value ?? relationshipTypeOptions.value[0]?.value ?? null;
  personEdit.startedAt = '';
  personEdit.endedAt = '';
  personEdit.isPrimary = personRow.isPrimary;
  personEdit.isBillingResponsible = personRow.isBillingResponsible;
}
async function savePersonEdit() {
  if (
    !(await personEditFormRef.value?.validate()) ||
    !selectedPersonId.value ||
    !personEdit.documentTypeId ||
    !personEdit.relationshipTypeId
  )
    return;
  savingPersonEdit.value = true;
  try {
    await updateUnitPerson(
      selectedPersonId.value,
      {
        firstName: personEdit.firstName,
        lastName: personEdit.lastName,
        documentTypeId: personEdit.documentTypeId,
        documentNumber: personEdit.documentNumber,
        phone: personEdit.phone,
        secondaryPhone: personEdit.secondaryPhone,
        relationshipTypeId: personEdit.relationshipTypeId,
        startedAt: personEdit.startedAt,
        endedAt: personEdit.endedAt,
        isPrimary: personEdit.isPrimary,
        isBillingResponsible: personEdit.isBillingResponsible,
      },
      session.accessToken,
    );
    Notify.create({ type: 'positive', message: 'Persona actualizada.' });
    personEditDialog.value = false;
    await load();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No fue posible actualizar la persona.',
    });
  } finally {
    savingPersonEdit.value = false;
  }
}
async function deactivateSelectedPerson() {
  if (!condominiumId.value || !unitId.value || !selectedPersonId.value) return;
  deactivatingPerson.value = true;
  try {
    const response = await fetch(
      new URL(
        `/api/condominiums/${condominiumId.value}/units/${unitId.value}/users/${selectedPersonId.value}/deactivate`,
        import.meta.env.VITE_API_HOST ?? 'http://localhost:8001/',
      ).toString(),
      {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          ...(session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
        },
      },
    );
    if (!response.ok) {
      throw new Error(`No fue posible desactivar la persona (${response.status})`);
    }
    Notify.create({ type: 'positive', message: 'Persona desactivada.' });
    personEditDialog.value = false;
    await load();
  } catch (error) {
    Notify.create({
      type: 'negative',
      message: error instanceof Error ? error.message : 'No fue posible desactivar la persona.',
    });
  } finally {
    deactivatingPerson.value = false;
  }
}
async function saveParking() {
  if (!condominiumId.value || !unitId.value || !parking.number.trim() || !parking.code.trim())
    return;
  const type = unitTypes.value.find((x) => x.code.toLowerCase().includes('parque'));
  if (!type) {
    Notify.create({ type: 'negative', message: 'No existe un tipo de parqueadero activo.' });
    return;
  }
  savingParking.value = true;
  try {
    await createParkingUnit(
      condominiumId.value,
      unitId.value,
      type.value,
      parking,
      session.accessToken,
    );
    Notify.create({ type: 'positive', message: 'Parqueadero agregado.' });
    parkingDialog.value = false;
    parking.number = '';
    parking.code = '';
    parking.areaM2 = null;
    await load();
  } catch (e) {
    Notify.create({
      type: 'negative',
      message: e instanceof Error ? e.message : 'No fue posible guardar.',
    });
  } finally {
    savingParking.value = false;
  }
}
const initials = (name: string) =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((x) => x[0])
    .join('')
    .toUpperCase();
function goBack() {
  void router.push('/unidades');
}
</script>
<style scoped>
.detail-page {
  padding: 16px 0;
}
.page-shell {
  display: grid;
  gap: 18px;
}
.page-header,
.section-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
}
.page-header h1,
.section-header h2 {
  margin: 3px 0;
}
.page-header p,
.section-header p,
.parking-grid span {
  color: var(--app-text-muted);
  font-size: 12px;
}
.header-badges {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}
.eyebrow {
  color: var(--app-primary);
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
}
.summary-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, 1fr);
}
.summary-grid span,
.detail-list span {
  color: var(--app-text-muted);
  display: block;
  font-size: 11px;
}
.summary-grid strong {
  display: block;
  font-size: 20px;
  margin-top: 4px;
}
.summary-card {
  border-radius: 16px;
}
.summary-card :deep(.q-card__section) {
  align-items: center;
  display: flex;
  gap: 12px;
  min-height: 88px;
}
.summary-card__icon {
  align-items: center;
  border-radius: 999px;
  display: flex;
  flex-shrink: 0;
  height: 42px;
  justify-content: center;
  width: 42px;
}
.tabs,
.panels {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 14px;
}
.detail-list {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, 1fr);
}
.detail-list > div {
  border-bottom: 1px solid rgba(15, 23, 42, 0.07);
  padding: 10px;
}
.parking-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, 1fr);
}
.parking-grid strong,
.parking-grid span {
  display: block;
}
.parking-card__header {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: space-between;
  margin-bottom: 5px;
}
.person-badges {
  display: grid;
  gap: 5px;
  justify-items: end;
}
.person-actions {
  display: flex;
  justify-content: flex-end;
}
.empty {
  color: var(--app-text-muted);
  padding: 36px;
  text-align: center;
}
.dialog-card {
  border-radius: 18px;
  max-width: 480px;
  width: 100%;
}
.dialog-card--wide {
  max-width: 760px;
}
.dialog-form {
  display: grid;
  gap: 12px;
}
.dialog-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.context-note {
  background: rgba(37, 99, 235, 0.06);
  color: var(--app-text-muted);
  font-size: 11px;
}
.error-banner {
  background: rgba(239, 68, 68, 0.08);
  color: #b91c1c;
}
@media (max-width: 700px) {
  .summary-grid,
  .parking-grid,
  .detail-list {
    grid-template-columns: 1fr;
  }
  .section-header {
    gap: 12px;
  }
  .dialog-grid {
    grid-template-columns: 1fr;
  }
}
</style>
