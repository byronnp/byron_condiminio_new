<template>
  <q-page class="houses-page">
    <AppListPageShell v-model:search="search" v-model:status="status" v-model:rowsPerPage="rowsPerPage" v-model:sortBy="sortBy" title="Casas" :subtitle="subtitle" search-placeholder="Buscar por código o número..." :status-options="statusOptions" :rows-per-page-options="[5,10,15,20,25]" :sort-options="sortOptions" action-label="Nueva casa" action-icon="add_home" @cta-click="goToCreate">
      <template #stats>
        <q-card v-for="card in stats" :key="card.label" flat bordered class="stat-card"><q-card-section class="stat-content"><q-icon :name="card.icon" size="23px" class="stat-icon"/><div><div class="stat-label">{{ card.label }}</div><div class="stat-value">{{ card.value }}</div><div class="stat-label">{{ card.hint }}</div></div></q-card-section></q-card>
      </template>
      <template #table>
        <q-banner v-if="!condominiumId" rounded class="context-banner"><template #avatar><q-icon name="apartment"/></template>Selecciona un condominio en el layout para consultar sus casas.</q-banner>
        <q-banner v-else-if="error" rounded class="error-banner">{{ error }}</q-banner>
        <q-table v-else flat bordered :rows="visibleRows" :columns="columns" row-key="id" :pagination="{rowsPerPage:0}" hide-bottom :loading="loading" class="list-table">
          <template #body-cell-code="props"><q-td :props="props"><div class="house-cell"><q-avatar rounded size="38px" class="house-avatar"><q-icon name="home"/></q-avatar><div><strong>{{ props.row.code }}</strong><span>Casa {{ props.row.number }}</span></div></div></q-td></template>
          <template #body-cell-assignable="props"><q-td :props="props"><q-badge outline :color="props.row.isAssignable?'primary':'grey-7'">{{ props.row.isAssignable?'Asignable':'No asignable' }}</q-badge></q-td></template>
          <template #body-cell-active="props"><q-td :props="props"><q-badge :color="props.row.isActive?'positive':'grey-7'">{{ props.row.isActive?'Activa':'Inactiva' }}</q-badge></q-td></template>
          <template #body-cell-actions="props"><q-td :props="props"><q-btn flat round dense icon="visibility"><q-tooltip>Ver detalle</q-tooltip></q-btn><q-btn flat round dense icon="edit"><q-tooltip>Editar casa</q-tooltip></q-btn><q-btn flat round dense icon="more_horiz"/></q-td></template>
          <template #no-data><div class="empty-state"><q-icon name="home_work" size="38px"/><strong>No hay casas para mostrar</strong><span>{{ hasFilters?'Limpia los filtros para ver más resultados.':'Crea la primera casa de este condominio.' }}</span></div></template>
        </q-table>
      </template>
      <template #footer><q-pagination v-if="condominiumId" v-model="page" :max="totalPages" boundary-links direction-links color="primary"/></template>
    </AppListPageShell>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppListPageShell from '@/components/shared/AppListPageShell.vue';
import { fetchUnits, type UnitListItem } from '@/services/units.service';
import { useSessionStore } from '@/stores/session.store';

const router=useRouter(); const session=useSessionStore();
const rows=ref<UnitListItem[]>([]); const search=ref(''); const status=ref<'Todas'|'Activa'|'Inactiva'>('Todas'); const sortBy=ref<'recent'|'code'|'area'>('recent'); const page=ref(1); const rowsPerPage=ref(10); const loading=ref(false); const error=ref('');
const condominiumId=computed(()=>{const id=Number(session.activeCondoId);return Number.isInteger(id)&&id>0?id:null});
const subtitle=computed(()=>condominiumId.value?`Gestiona las casas de ${session.activeCondominium?.name??'este condominio'}.`:'Selecciona un condominio para gestionar sus casas.');
const statusOptions=[{label:'Estado: Todas',value:'Todas'},{label:'Activas',value:'Activa'},{label:'Inactivas',value:'Inactiva'}];
const sortOptions=[{label:'Más recientes',value:'recent'},{label:'Código A-Z',value:'code'},{label:'Mayor área',value:'area'}] as const;
const columns=[{name:'code',label:'Casa',field:'code',align:'left' as const},{name:'area',label:'Área',field:(row:UnitListItem)=>`${row.areaM2} m²`,align:'right' as const},{name:'assignable',label:'Asignación',field:'isAssignable',align:'center' as const},{name:'active',label:'Estado',field:'isActive',align:'center' as const},{name:'actions',label:'Acciones',field:'actions',align:'right' as const}];
const filtered=computed(()=>rows.value.filter(row=>{const q=search.value.trim().toLowerCase();return(!q||row.code.toLowerCase().includes(q)||row.number.toLowerCase().includes(q))&&(status.value==='Todas'||row.isActive===(status.value==='Activa'))}));
const sorted=computed(()=>{const list=[...filtered.value];if(sortBy.value==='code')return list.sort((a,b)=>a.code.localeCompare(b.code));if(sortBy.value==='area')return list.sort((a,b)=>b.areaM2-a.areaM2);return list.reverse()});
const totalPages=computed(()=>Math.max(1,Math.ceil(sorted.value.length/rowsPerPage.value))); const visibleRows=computed(()=>sorted.value.slice((page.value-1)*rowsPerPage.value,page.value*rowsPerPage.value)); const hasFilters=computed(()=>Boolean(search.value)||status.value!=='Todas');
const stats=computed(()=>[{label:'Total de casas',value:String(rows.value.length),hint:'Registradas',icon:'home_work'},{label:'Activas',value:String(rows.value.filter(x=>x.isActive).length),hint:'Operativas',icon:'check_circle'},{label:'Asignables',value:String(rows.value.filter(x=>x.isAssignable).length),hint:'Admiten personas',icon:'group_add'},{label:'Sin asignación',value:String(rows.value.filter(x=>!x.isAssignable).length),hint:'No asignables',icon:'person_off'}]);
async function load(){if(!condominiumId.value){rows.value=[];return}loading.value=true;error.value='';try{rows.value=await fetchUnits(condominiumId.value,session.accessToken)}catch(e){error.value=e instanceof Error?e.message:'No fue posible cargar las casas.'}finally{loading.value=false}}
function goToCreate(){if(condominiumId.value)void router.push('/unidades/nueva')}
watch(()=>session.activeCondoId,()=>{page.value=1;search.value='';status.value='Todas';void load()}); watch([search,status,rowsPerPage],()=>{page.value=1}); onMounted(()=>void load());
</script>

<style scoped>
.houses-page{min-height:100%}.stat-card{border-radius:16px}.stat-content,.house-cell{align-items:center;display:flex;gap:12px;min-height:68px}.stat-icon,.house-avatar{background:rgba(37,99,235,.1);border-radius:50%;color:var(--app-primary);padding:11px}.stat-label,.house-cell span{color:var(--app-text-muted);display:block;font-size:11px}.stat-value{font-size:22px;font-weight:800}.list-table{border-radius:16px}.house-cell strong{display:block;font-size:12px}.context-banner{background:rgba(37,99,235,.07);color:var(--app-text)}.error-banner{background:rgba(239,68,68,.08);color:#b91c1c}.empty-state{align-items:center;color:var(--app-text-muted);display:grid;gap:7px;justify-items:center;padding:42px;width:100%}.empty-state strong{color:var(--app-text)}
</style>
