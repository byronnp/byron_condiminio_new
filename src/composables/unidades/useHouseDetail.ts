import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

import {
  createParkingUnit,
  createUnitAccessInvitation,
  deactivateUnitPerson,
  createUnitPerson,
  fetchUnitById,
  fetchUnitPeople,
  fetchUnitsPage,
  setUnitBillingResponsible,
  updateHouse,
  type CreateUnitPersonPayload,
  type CreateParkingUnitPayload,
  type UnitListItem,
  type UnitPersonItem,
} from '@/services/units.service';
import { fetchCatalogItems } from '@/services/catalog.service';
import { useSessionStore } from '@/stores/session.store';

interface HouseDetailItem extends UnitListItem {
  status?: string;
  assignment?: string;
  block?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  description?: string;
  notes?: string;
}

export function useHouseDetail() {
  const route = useRoute();
  const session = useSessionStore();

  const tab = ref<'summary' | 'people' | 'parking'>('summary');
  const house = ref<HouseDetailItem | null>(null);
  const people = ref<UnitPersonItem[]>([]);
  const parkings = ref<UnitListItem[]>([]);
  const loading = ref(false);
  const error = ref('');
  const loadingPersonProfile = ref(false);
  const savingPerson = ref(false);
  const savingParking = ref(false);
  const parkingDialog = ref(false);
  const personDialog = ref(false);
  const personEditDialog = ref(false);
  const childUnitTypeIds = ref<{ parking: number | null; storage: number | null }>({
    parking: null,
    storage: null,
  });

  const unitId = computed(() => {
    const id = Number(route.params.id);
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  const condominiumId = computed(() => {
    const id = Number(session.activeCondoId);
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  const ownerName = computed(() => house.value?.ownerName || 'Sin propietario');
  const peopleCount = computed(() => house.value?.peopleCount ?? people.value.length);
  const parkingCount = computed(() => house.value?.parkingCount ?? parkings.value.length);
  const blockName = computed(() => house.value?.blockName || 'Sin bloque');
  const statusLabel = computed(() => (house.value?.isActive === false ? 'Inactiva' : 'Activa'));
  const assignmentLabel = computed(() =>
    house.value?.isAssignable === false ? 'No asignable' : 'Asignable',
  );
  const condominiumName = computed(() => session.activeCondominium?.name ?? 'Sin condominio');
  const initials = computed(() => {
    const code = house.value?.code?.trim() ?? '';
    if (!code) {
      return 'CA';
    }
    return code
      .split(/\s+/)
      .map((word) => word.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  });
  const summary = computed(() => ({
    ownerName: ownerName.value,
    peopleCount: peopleCount.value,
    parkingCount: parkingCount.value,
    blockName: blockName.value,
    statusLabel: statusLabel.value,
    assignmentLabel: assignmentLabel.value,
  }));
  const documentTypeOptions = computed(() => []);
  const relationshipTypeOptions = computed(() => []);
  const requiredTextRule = (value: unknown) =>
    typeof value === 'string' && value.trim() ? true : 'Campo requerido';
  const requiredSelectRule = (value: unknown) =>
    value !== null && value !== undefined && value !== '' ? true : 'Campo requerido';
  const selectedPersonLabel = computed(() => '');
  const person = ref<Record<string, unknown> | null>(null);
  const personEdit = ref<Record<string, unknown> | null>(null);
  const parking = ref<Record<string, unknown> | null>(null);
  const deactivatingPerson = ref(false);

  async function loadChildUnitType(kind: 'parking' | 'storage') {
    if (childUnitTypeIds.value[kind] !== null) {
      return childUnitTypeIds.value[kind];
    }

    try {
      const unitTypes = await fetchCatalogItems('unit_types');
      const unitType = unitTypes.find((item) => {
        const normalized = `${item.code} ${item.name}`.toLowerCase();
        if (kind === 'storage') {
          return normalized.includes('bodega') || normalized.includes('storage');
        }

        return normalized.includes('parqueadero') || normalized.includes('parking') || normalized.includes('estacionamiento');
      });

      childUnitTypeIds.value = {
        ...childUnitTypeIds.value,
        [kind]: unitType?.id ?? null,
      };
      return childUnitTypeIds.value[kind];
    } catch {
      childUnitTypeIds.value = {
        ...childUnitTypeIds.value,
        [kind]: null,
      };
      return null;
    }
  }

  async function load() {
    if (!condominiumId.value || !unitId.value) {
      house.value = null;
      people.value = [];
      parkings.value = [];
      error.value = 'Selecciona un condominio válido para ver el detalle de la casa.';
      return;
    }

    loading.value = true;
    error.value = '';

    try {
      const [detail, unitPeople, pageResult] = await Promise.all([
        fetchUnitById(condominiumId.value, unitId.value, session.accessToken),
        fetchUnitPeople(condominiumId.value, unitId.value, session.accessToken),
        fetchUnitsPage(condominiumId.value, 1, 100, session.accessToken),
      ]);

      if (!detail) {
        house.value = null;
        people.value = [];
        parkings.value = [];
        error.value = 'No fue posible cargar el detalle de la casa.';
        return;
      }

      house.value = {
        ...detail,
        status: detail.isActive === false ? 'Inactiva' : 'Activa',
        assignment: detail.isAssignable === false ? 'No asignable' : 'Asignable',
        block: detail.blockName,
      };
      people.value = unitPeople;
      parkings.value = pageResult.items.filter(
        (item) => item.parentUnitId === unitId.value && isAllowedChildUnit(item),
      );
    } catch (loadError) {
      house.value = null;
      people.value = [];
      parkings.value = [];
      error.value =
        loadError instanceof Error ? loadError.message : 'No fue posible cargar la casa.';
    } finally {
      loading.value = false;
    }
  }

  function openPersonDialog() {
    personDialog.value = true;
    tab.value = 'people';
    return { success: true, message: '' };
  }

  function openPersonEditDialog(_personRow: UnitPersonItem) {
    void _personRow;
    personEditDialog.value = true;
    tab.value = 'people';
    return Promise.resolve({ success: true, message: '' });
  }

  async function savePerson(payload: CreateUnitPersonPayload) {
    if (!condominiumId.value || !unitId.value) {
      throw new Error('Selecciona un condominio válido para agregar la persona.');
    }

    savingPerson.value = true;

    try {
      const result = await createUnitPerson(
        condominiumId.value,
        unitId.value,
        payload,
        session.accessToken,
      );

      personDialog.value = false;
      await load();
      return result;
    } finally {
      savingPerson.value = false;
    }
  }

  function savePersonEdit() {
    personEditDialog.value = false;
    return Promise.resolve(true);
  }

  function deactivateSelectedPerson() {
    deactivatingPerson.value = false;
    return Promise.resolve(true);
  }

  async function saveParking(payload: CreateParkingUnitPayload) {
    if (!condominiumId.value || !unitId.value) {
      throw new Error('Selecciona un condominio válido para agregar la unidad asociada.');
    }

    const unitTypeId = await loadChildUnitType(payload.kind);
    if (!unitTypeId) {
      throw new Error(
        payload.kind === 'storage'
          ? 'No se encontró un tipo de unidad para bodega.'
          : 'No se encontró un tipo de unidad para parqueadero.',
      );
    }

    savingParking.value = true;

    try {
      const result = await createParkingUnit(
        condominiumId.value,
        unitId.value,
        unitTypeId,
        payload,
        session.accessToken,
      );

      parkingDialog.value = false;
      await load();
      return result;
    } finally {
      savingParking.value = false;
    }
  }

  async function updateParking(childUnitId: number, payload: CreateParkingUnitPayload) {
    if (!condominiumId.value) {
      throw new Error('Selecciona un condominio válido para editar la unidad asociada.');
    }

    const unitTypeId = await loadChildUnitType(payload.kind);
    if (!unitTypeId) {
      throw new Error(
        payload.kind === 'storage'
          ? 'No se encontró un tipo de unidad para bodega.'
          : 'No se encontró un tipo de unidad para parqueadero.',
      );
    }

    savingParking.value = true;

    try {
      const result = await updateHouse(
        condominiumId.value,
        childUnitId,
        {
          unitTypeId,
          code: payload.code,
          number: payload.number,
          areaM2: payload.areaM2,
          isAssignable: false,
        },
        session.accessToken,
      );

      parkingDialog.value = false;
      await load();
      return result;
    } finally {
      savingParking.value = false;
    }
  }

  async function setParkingStatus(childUnitId: number, isActive: boolean) {
    if (!condominiumId.value) {
      throw new Error('Selecciona un condominio válido para actualizar la unidad asociada.');
    }

    savingParking.value = true;

    try {
      const result = await updateHouse(
        condominiumId.value,
        childUnitId,
        { isActive },
        session.accessToken,
      );

      await load();
      return result;
    } finally {
      savingParking.value = false;
    }
  }

  function openParkingDialog() {
    parkingDialog.value = true;
    tab.value = 'parking';
    return { success: true, message: '' };
  }

  function isAllowedChildUnit(item: UnitListItem) {
    const normalized = `${item.unitTypeCode} ${item.unitTypeName}`.toLowerCase();
    return (
      normalized.includes('parqueadero') ||
      normalized.includes('parking') ||
      normalized.includes('estacionamiento') ||
      normalized.includes('bodega') ||
      normalized.includes('storage')
    );
  }

  async function changeBillingResponsible(personId: number) {
    if (!condominiumId.value || !unitId.value) {
      throw new Error('Selecciona un condominio válido para cambiar el responsable.');
    }

    await setUnitBillingResponsible(condominiumId.value, unitId.value, personId, session.accessToken);
    await load();
  }

  async function deactivatePersonRelation(personId: number, disableAccess: boolean) {
    if (!condominiumId.value || !unitId.value) {
      throw new Error('Selecciona un condominio válido para desactivar la relación.');
    }

    await deactivateUnitPerson(
      condominiumId.value,
      unitId.value,
      personId,
      disableAccess,
      session.accessToken,
    );
    await load();
  }

  async function sendAccessInvitation(personId: number) {
    if (!condominiumId.value || !unitId.value) {
      throw new Error('Selecciona un condominio válido para enviar la invitación.');
    }

    await createUnitAccessInvitation(condominiumId.value, unitId.value, personId, session.accessToken);
    await load();
  }

  watch([condominiumId, unitId], () => {
    void load();
  }, { immediate: true });

  void loadChildUnitType('parking');
  void loadChildUnitType('storage');

  return {
    condominiumName,
    deactivateSelectedPerson,
    documentTypeOptions,
    error,
    house,
    initials,
    load,
    loading,
    loadingPersonProfile,
    people,
    parking,
    parkingDialog,
    parkings,
    person,
    personDialog,
    personEdit,
    personEditDialog,
    requiredSelectRule,
    requiredTextRule,
    saveParking,
    savePerson,
    savePersonEdit,
    savingParking,
    savingPerson,
    savingPersonEdit: computed(() => false),
    selectedPersonLabel,
    summary,
    tab,
    unitId,
    openPersonDialog,
    openPersonEditDialog,
    openParkingDialog,
    relationshipTypeOptions,
    deactivatingPerson,
    ownerName,
    peopleCount,
    parkingCount,
    blockName,
    changeBillingResponsible,
    deactivatePersonRelation,
    sendAccessInvitation,
    setParkingStatus,
    statusLabel,
    updateParking,
    assignmentLabel,
  };
}
