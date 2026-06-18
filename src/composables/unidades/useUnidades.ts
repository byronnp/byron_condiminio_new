import { computed, ref } from 'vue';

export type UnidadStatus = 'Disponible' | 'Ocupada' | 'Mora' | 'Exonerada';

export interface UnidadRow {
  id: number;
  bloque: string;
  numero: string;
  piso: number;
  area: number;
  habitaciones: number;
  banos: number;
  estacionamientos: number;
  propietario: string;
  estado: UnidadStatus;
  alDia: boolean;
  observaciones: string;
}

export interface UnidadFormState {
  bloque: string;
  numero: string;
  piso: number | null;
  area: number | null;
  habitaciones: number | null;
  banos: number | null;
  estacionamientos: number | null;
  propietario: string;
  estado: UnidadStatus;
  observaciones: string;
}

export const createUnidadForm = (): UnidadFormState => ({
  bloque: '',
  numero: '',
  piso: null,
  area: null,
  habitaciones: null,
  banos: null,
  estacionamientos: null,
  propietario: '',
  estado: 'Disponible',
  observaciones: '',
});

const initialUnits: UnidadRow[] = [
  {
    id: 1,
    bloque: 'A',
    numero: 'A-101',
    piso: 1,
    area: 120,
    habitaciones: 3,
    banos: 2,
    estacionamientos: 1,
    propietario: 'María González',
    estado: 'Disponible',
    alDia: true,
    observaciones: 'Unidad con vista interna y balcón.',
  },
  {
    id: 2,
    bloque: 'A',
    numero: 'A-102',
    piso: 1,
    area: 118,
    habitaciones: 3,
    banos: 2,
    estacionamientos: 1,
    propietario: 'Juan Pérez',
    estado: 'Ocupada',
    alDia: true,
    observaciones: 'Arrendada hasta diciembre.',
  },
  {
    id: 3,
    bloque: 'B',
    numero: 'B-203',
    piso: 2,
    area: 136,
    habitaciones: 4,
    banos: 3,
    estacionamientos: 2,
    propietario: 'Ana Rodríguez',
    estado: 'Mora',
    alDia: false,
    observaciones: 'Tiene valores pendientes desde abril.',
  },
  {
    id: 4,
    bloque: 'C',
    numero: 'C-305',
    piso: 3,
    area: 98,
    habitaciones: 2,
    banos: 2,
    estacionamientos: 1,
    propietario: 'Carlos López',
    estado: 'Exonerada',
    alDia: true,
    observaciones: 'Unidad exonerada temporalmente.',
  },
  {
    id: 5,
    bloque: 'B',
    numero: 'B-104',
    piso: 1,
    area: 122,
    habitaciones: 3,
    banos: 2,
    estacionamientos: 1,
    propietario: 'Laura Martínez',
    estado: 'Ocupada',
    alDia: true,
    observaciones: 'Contrato vigente con renovaciones automáticas.',
  },
];

const search = ref('');
const statusFilter = ref<'Todas' | UnidadStatus>('Todas');
const dialogOpen = ref(false);
const saving = ref(false);
const editingId = ref<number | null>(null);
const selectedUnit = ref<UnidadRow | null>(initialUnits[0] ?? null);
const rows = ref<UnidadRow[]>([...initialUnits]);
const form = ref<UnidadFormState>(createUnidadForm());

export function useUnidades() {
  const stats = computed(() => {
    const total = rows.value.length;
    const disponibles = rows.value.filter((row) => row.estado === 'Disponible').length;
    const ocupadas = rows.value.filter((row) => row.estado === 'Ocupada').length;
    const mora = rows.value.filter((row) => row.estado === 'Mora').length;

    return [
      { label: 'Total de unidades', value: total.toString(), hint: 'Unidades registradas', icon: 'domain' },
      { label: 'Disponibles', value: disponibles.toString(), hint: 'Listas para ocupación', icon: 'meeting_room' },
      { label: 'Ocupadas', value: ocupadas.toString(), hint: 'Con residente o arrendatario', icon: 'home' },
      { label: 'En mora', value: mora.toString(), hint: 'Con valores pendientes', icon: 'warning_amber' },
    ];
  });

  const filteredRows = computed(() => {
    const query = search.value.trim().toLowerCase();

    return rows.value.filter((row) => {
      const matchesQuery =
        query.length === 0 ||
        [row.numero, row.bloque, row.propietario, row.observaciones].some((value) =>
          value.toLowerCase().includes(query),
        );
      const matchesStatus = statusFilter.value === 'Todas' || row.estado === statusFilter.value;

      return matchesQuery && matchesStatus;
    });
  });

  function openCreateDialog() {
    editingId.value = null;
    form.value = createUnidadForm();
    dialogOpen.value = true;
  }

  function openEditDialog(row: UnidadRow) {
    editingId.value = row.id;
    form.value = {
      bloque: row.bloque,
      numero: row.numero,
      piso: row.piso,
      area: row.area,
      habitaciones: row.habitaciones,
      banos: row.banos,
      estacionamientos: row.estacionamientos,
      propietario: row.propietario,
      estado: row.estado,
      observaciones: row.observaciones,
    };
    dialogOpen.value = true;
  }

  function selectUnit(row: UnidadRow) {
    selectedUnit.value = row;
  }

  function saveUnit(formData: UnidadFormState) {
    saving.value = true;

    const payload: UnidadRow = {
      id: editingId.value ?? Date.now(),
      bloque: formData.bloque.trim().toUpperCase(),
      numero: formData.numero.trim().toUpperCase(),
      piso: formData.piso ?? 0,
      area: formData.area ?? 0,
      habitaciones: formData.habitaciones ?? 0,
      banos: formData.banos ?? 0,
      estacionamientos: formData.estacionamientos ?? 0,
      propietario: formData.propietario.trim(),
      estado: formData.estado,
      alDia: formData.estado !== 'Mora',
      observaciones: formData.observaciones.trim(),
    };

    if (editingId.value === null) {
      rows.value = [payload, ...rows.value];
      selectedUnit.value = payload;
    } else {
      rows.value = rows.value.map((row) => (row.id === editingId.value ? payload : row));
      selectedUnit.value = payload;
    }

    dialogOpen.value = false;
    editingId.value = null;
    saving.value = false;
  }

  return {
    search,
    statusFilter,
    dialogOpen,
    saving,
    editingId,
    form,
    stats,
    filteredRows,
    selectedUnit,
    openCreateDialog,
    openEditDialog,
    selectUnit,
    saveUnit,
  };
}
