<template>
  <q-page class="dashboard-page">
    <section class="dashboard-hero">
      <q-card class="hero-card">
        <q-card-section class="hero-card__content">
          <div class="hero-card__left">
            <div class="hero-card__eyebrow">
              <q-icon name="dashboard" size="16px" />
              <span>{{ session.isSenior ? 'Vista global' : 'Vista de condominio' }}</span>
            </div>
            <div class="hero-card__title">
              {{ session.isSenior ? 'Administración centralizada multi-condominio' : 'Operación diaria del condominio activo' }}
            </div>
            <div class="hero-card__subtitle">
              {{ session.isSenior
                ? 'Supervisa el desempeño consolidado de todos los condominios, compara métricas y alterna el contexto desde el encabezado.'
                : 'Controla la información y la operación del condominio asignado a tu cuenta, sin distracciones ni accesos fuera de alcance.' }}
            </div>
          </div>

          <div class="hero-card__right">
            <q-chip square class="hero-badge">
              <q-icon name="person" size="16px" class="q-mr-xs" />
              {{ roleLabel }}
            </q-chip>
            <q-chip square class="hero-badge hero-badge--solid">
              <q-icon name="pin_drop" size="16px" class="q-mr-xs" />
              {{ condoLabel }}
            </q-chip>
            <q-chip square class="hero-badge">
              <q-icon name="verified_user" size="16px" class="q-mr-xs" />
              {{ session.isSenior ? 'Acceso multi-condominio' : 'Acceso limitado' }}
            </q-chip>
          </div>
        </q-card-section>
      </q-card>
    </section>

    <section class="dashboard-layout">
      <div class="dashboard-layout__main">
        <div class="stats-grid">
          <q-card v-for="card in stats" :key="card.label" class="stat-card">
            <q-card-section class="stat-card__content">
              <div class="stat-card__icon" :class="card.iconClass">
                <q-icon :name="card.icon" size="22px" />
              </div>
              <div>
                <div class="stat-card__label">{{ card.label }}</div>
                <div class="stat-card__value">{{ card.value }}</div>
                <div class="stat-card__hint">{{ card.hint }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="content-grid">
          <q-card class="panel-card panel-card--large">
            <q-card-section class="panel-card__header">
              <div>
                <div class="panel-card__title">Ingresos vs gastos</div>
                <div class="panel-card__subtitle">{{ incomeSubtitle }}</div>
              </div>
              <q-chip dense outline color="primary">
                {{ session.isSenior ? 'Consolidado' : 'Condominio activo' }}
              </q-chip>
            </q-card-section>

            <q-card-section class="chart-placeholder">
              <div class="chart-placeholder__legend">
                <div class="chart-key chart-key--income">
                  <span class="chart-key__dot" />
                  Ingresos
                </div>
                <div class="chart-key chart-key--expense">
                  <span class="chart-key__dot" />
                  Gastos
                </div>
              </div>
              <div class="chart-placeholder__canvas">
                <div class="chart-bar chart-bar--income" />
                <div class="chart-bar chart-bar--expense" />
                <div class="chart-bar chart-bar--income chart-bar--short" />
                <div class="chart-bar chart-bar--expense chart-bar--mid" />
                <div class="chart-bar chart-bar--income chart-bar--long" />
              </div>
            </q-card-section>
          </q-card>

          <q-card class="panel-card">
            <q-card-section class="panel-card__header">
              <div>
                <div class="panel-card__title">Cobros por estado</div>
                <div class="panel-card__subtitle">
                  {{
                    session.isSenior
                      ? 'Resumen consolidado de todos los condominios'
                      : 'Distribución del condominio activo'
                  }}
                </div>
              </div>
            </q-card-section>

            <q-card-section class="donut-placeholder">
              <div class="donut-placeholder__ring">
                <div class="donut-placeholder__center">
                  <strong>{{ paymentPercent }}%</strong>
                  <span>Al día</span>
                </div>
              </div>

              <div class="donut-placeholder__legend">
                <div v-for="item in statusLegend" :key="item.label" class="legend-row">
                  <span class="legend-dot" :class="item.class" />
                  <div>
                    <div class="legend-row__label">{{ item.label }}</div>
                    <div class="legend-row__value">{{ item.value }}</div>
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <div class="content-grid content-grid--secondary">
          <q-card class="panel-card">
            <q-card-section class="panel-card__header">
              <div>
                <div class="panel-card__title">Pagos recientes</div>
                <div class="panel-card__subtitle">
                  {{ session.isSenior ? 'Últimos movimientos consolidados' : 'Últimos movimientos del condominio' }}
                </div>
              </div>
              <q-btn flat dense no-caps label="Ver todos" class="link-action" />
            </q-card-section>

            <q-card-section class="table-placeholder">
              <div v-for="row in recentPayments" :key="row.unit" class="table-row">
                <div>
                  <div class="table-row__primary">{{ row.date }}</div>
                  <div class="table-row__secondary">{{ row.unit }}</div>
                </div>
                <div class="table-row__primary">{{ row.amount }}</div>
                <q-badge :color="row.statusColor" rounded>{{ row.status }}</q-badge>
              </div>
            </q-card-section>
          </q-card>

          <q-card class="panel-card">
            <q-card-section class="panel-card__header">
              <div>
                <div class="panel-card__title">Avisos y comunicados</div>
                <div class="panel-card__subtitle">
                  {{ session.isSenior ? 'Alertas para todos los condominios' : 'Alertas del condominio activo' }}
                </div>
              </div>
              <q-btn flat dense no-caps label="Ver todos" class="link-action" />
            </q-card-section>

            <q-card-section class="alerts-list">
              <div v-for="notice in notices" :key="notice.title" class="notice-item">
                <div class="notice-item__icon" :class="notice.iconClass">
                  <q-icon :name="notice.icon" size="18px" />
                </div>
                <div>
                  <div class="notice-item__title">{{ notice.title }}</div>
                  <div class="notice-item__subtitle">{{ notice.subtitle }}</div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <aside class="dashboard-layout__aside">
        <q-card class="panel-card panel-card--stacked">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__title">Contexto activo</div>
              <div class="panel-card__subtitle">
                {{ session.isSenior ? 'Puedes cambiar el condominio desde el header.' : 'El acceso queda limitado al condominio asignado.' }}
              </div>
            </div>
          </q-card-section>

          <q-card-section class="context-summary">
            <div class="context-summary__row">
              <span class="context-summary__label">Rol</span>
              <strong>{{ roleLabel }}</strong>
            </div>
            <div class="context-summary__row">
              <span class="context-summary__label">Condominio</span>
              <strong>{{ condoLabel }}</strong>
            </div>
            <div class="context-summary__row">
              <span class="context-summary__label">Acceso</span>
              <strong>{{ session.isSenior ? 'Multi-condominio' : 'Un solo condominio' }}</strong>
            </div>
          </q-card-section>
        </q-card>

        <q-card class="panel-card panel-card--stacked" v-if="session.isSenior">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__title">Condominios visibles</div>
              <div class="panel-card__subtitle">Lista de contextos disponibles para el rol senior.</div>
            </div>
          </q-card-section>

          <q-card-section class="condo-list">
            <div v-for="condo in session.allowedCondominiums" :key="condo.id" class="condo-item">
              <div class="condo-item__icon">
                <q-icon name="apartment" size="18px" />
              </div>
              <div class="condo-item__body">
                <div class="condo-item__title">{{ condo.name }}</div>
                <div class="condo-item__subtitle">{{ condo.city }} · {{ condo.units }} unidades</div>
              </div>
              <q-badge rounded color="positive" label="Activo" />
            </div>
          </q-card-section>
        </q-card>

        <q-card class="panel-card panel-card--stacked">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__title">Accesos rápidos</div>
              <div class="panel-card__subtitle">Acciones frecuentes del panel</div>
            </div>
          </q-card-section>

          <q-card-section class="quick-actions">
            <q-btn class="quick-actions__btn" color="primary" unelevated no-caps icon="add" label="Nueva unidad" />
            <q-btn class="quick-actions__btn" outline no-caps icon="payments" label="Registrar pago" />
            <q-btn class="quick-actions__btn" outline no-caps icon="campaign" label="Crear comunicado" />
          </q-card-section>
        </q-card>

        <q-card class="panel-card panel-card--stacked">
          <q-card-section class="panel-card__header">
            <div>
              <div class="panel-card__title">Diálogos y alertas</div>
              <div class="panel-card__subtitle">Estados de UI reutilizables</div>
            </div>
          </q-card-section>

          <q-card-section class="dialog-sample">
            <div class="dialog-sample__icon dialog-sample__icon--primary">
              <q-icon name="help_outline" size="24px" />
            </div>
            <div class="dialog-sample__title">Confirmar acción</div>
            <div class="dialog-sample__text">Se guardarán los cambios realizados en la unidad.</div>
            <div class="dialog-sample__actions">
              <q-btn flat no-caps label="Cancelar" />
              <q-btn color="primary" unelevated no-caps label="Guardar" />
            </div>
          </q-card-section>
        </q-card>
      </aside>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSessionStore } from '@/stores/session.store';

const session = useSessionStore();

const roleLabel = computed(() =>
  session.isSenior ? 'Administrador senior' : 'Administrador de condominio',
);
const condoLabel = computed(() => session.activeCondominium?.name ?? 'Vista global');

const stats = computed(() => {
  if (session.isSenior) {
    return [
      {
        label: 'Condominios activos',
        value: '4',
        hint: 'Administrados por la plataforma',
        icon: 'apartment',
        iconClass: 'stat-card__icon--blue',
      },
      {
        label: 'Unidades totales',
        value: '352',
        hint: 'Consolidado multi-condominio',
        icon: 'domain',
        iconClass: 'stat-card__icon--green',
      },
      {
        label: 'Morosidad global',
        value: '31',
        hint: 'Unidades en mora',
        icon: 'warning_amber',
        iconClass: 'stat-card__icon--orange',
      },
      {
        label: 'Ingresos globales',
        value: '$78,420',
        hint: 'Recaudación acumulada',
        icon: 'account_balance_wallet',
        iconClass: 'stat-card__icon--violet',
      },
    ];
  }

  return [
    {
      label: 'Unidades',
      value: '128',
      hint: 'Total del condominio',
      icon: 'domain',
      iconClass: 'stat-card__icon--blue',
    },
    {
      label: 'Propietarios',
      value: '96',
      hint: 'Registrados',
      icon: 'groups',
      iconClass: 'stat-card__icon--green',
    },
    {
      label: 'Morosidad',
      value: '12',
      hint: 'Unidades en mora',
      icon: 'warning_amber',
      iconClass: 'stat-card__icon--orange',
    },
    {
      label: 'Ingresos del mes',
      value: '$24,850',
      hint: 'Ingresos totales',
      icon: 'account_balance_wallet',
      iconClass: 'stat-card__icon--violet',
    },
  ];
});

const incomeSubtitle = computed(() =>
  session.isSenior
    ? 'Comparativo consolidado entre condominios'
    : 'Resumen del mes actual del condominio activo',
);

const paymentPercent = computed(() => (session.isSenior ? 91 : 85));

const statusLegend = computed(() => {
  if (session.isSenior) {
    return [
      { label: 'Al día', value: '287 unidades', class: 'legend-dot--green' },
      { label: 'En mora', value: '31 unidades', class: 'legend-dot--orange' },
      { label: 'Exoneradas', value: '34 unidades', class: 'legend-dot--blue' },
    ];
  }

  return [
    { label: 'Al día', value: '109 unidades', class: 'legend-dot--green' },
    { label: 'En mora', value: '12 unidades', class: 'legend-dot--orange' },
    { label: 'Exoneradas', value: '7 unidades', class: 'legend-dot--blue' },
  ];
});

const recentPayments = computed(() => {
  if (session.isSenior) {
    return [
      { date: '23/05/2024', unit: 'Aurora · A-101', amount: '$150.00', status: 'Pagado', statusColor: 'positive' },
      { date: '22/05/2024', unit: 'Pacific · B-204', amount: '$180.00', status: 'Pagado', statusColor: 'positive' },
      { date: '22/05/2024', unit: 'Verde · C-305', amount: '$300.00', status: 'Pendiente', statusColor: 'warning' },
      { date: '21/05/2024', unit: 'Marina · A-201', amount: '$160.00', status: 'Pagado', statusColor: 'positive' },
    ];
  }

  return [
    { date: '23/05/2024', unit: 'A-101', amount: '$150.00', status: 'Pagado', statusColor: 'positive' },
    { date: '22/05/2024', unit: 'A-102', amount: '$150.00', status: 'Pagado', statusColor: 'positive' },
    { date: '22/05/2024', unit: 'B-203', amount: '$300.00', status: 'Pendiente', statusColor: 'warning' },
    { date: '22/05/2024', unit: 'C-305', amount: '$150.00', status: 'Pagado', statusColor: 'positive' },
  ];
});

const notices = computed(() => {
  if (session.isSenior) {
    return [
      {
        title: 'Renovación de contratos',
        subtitle: 'Condominio Pacific vencimiento próximo.',
        icon: 'campaign',
        iconClass: 'notice-item__icon--violet',
      },
      {
        title: 'Reporte consolidado',
        subtitle: 'Disponible el cierre mensual global.',
        icon: 'summarize',
        iconClass: 'notice-item__icon--blue',
      },
      {
        title: 'Mantenimiento programado',
        subtitle: 'Torre Norte y Marina Bay en revisión.',
        icon: 'handyman',
        iconClass: 'notice-item__icon--orange',
      },
    ];
  }

  return [
    {
      title: 'Asamblea general',
      subtitle: 'Sábado 01 de junio de 2024 · 7:00 PM',
      icon: 'campaign',
      iconClass: 'notice-item__icon--violet',
    },
    {
      title: 'Mantenimiento de ascensor',
      subtitle: 'Del 25 al 27 de mayo de 2024',
      icon: 'handyman',
      iconClass: 'notice-item__icon--orange',
    },
    {
      title: 'Recordatorio de pago',
      subtitle: 'Evita recargos, paga antes del 05 de junio.',
      icon: 'event_note',
      iconClass: 'notice-item__icon--blue',
    },
  ];
});
</script>

<style scoped>
.dashboard-page {
  padding: 6px 8px 0 4px;
}

.dashboard-hero {
  margin-bottom: 18px;
}

.hero-card {
  overflow: hidden;
}

.hero-card__content {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) auto;
}

.hero-card__left {
  min-width: 0;
}

.hero-card__eyebrow {
  align-items: center;
  color: var(--app-primary);
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  gap: 6px;
  text-transform: uppercase;
}

.hero-card__title {
  color: var(--app-text);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.2;
  margin-top: 8px;
}

.hero-card__subtitle {
  color: var(--app-text-muted);
  line-height: 1.65;
  margin-top: 10px;
  max-width: 860px;
}

.hero-card__right {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.hero-badge {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 999px;
  color: var(--app-text);
  font-weight: 600;
}

.hero-badge--solid {
  background: var(--app-primary-soft);
  border-color: transparent;
}

.dashboard-layout {
  display: grid;
  gap: 20px;
  grid-template-columns: minmax(0, 1fr) 340px;
}

.dashboard-layout__main,
.dashboard-layout__aside {
  display: grid;
  gap: 20px;
}

.stats-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card__content {
  align-items: center;
  display: flex;
  gap: 14px;
  min-height: 108px;
}

.stat-card__icon {
  align-items: center;
  border-radius: 18px;
  display: inline-flex;
  flex-shrink: 0;
  height: 52px;
  justify-content: center;
  width: 52px;
}

.stat-card__icon--blue {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.stat-card__icon--green {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.stat-card__icon--orange {
  background: rgba(245, 158, 11, 0.14);
  color: #f59e0b;
}

.stat-card__icon--violet {
  background: rgba(124, 58, 237, 0.12);
  color: #7c3aed;
}

.stat-card__label {
  color: var(--app-text-muted);
  font-size: 13px;
  font-weight: 700;
}

.stat-card__value {
  color: var(--app-text);
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.04em;
  margin-top: 4px;
}

.stat-card__hint {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.content-grid {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 0.9fr);
}

.content-grid--secondary {
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
}

.panel-card {
  overflow: hidden;
}

.panel-card--large {
  min-height: 320px;
}

.panel-card--stacked {
  min-height: 340px;
}

.panel-card__header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.panel-card__title {
  color: var(--app-text);
  font-size: 16px;
  font-weight: 800;
}

.panel-card__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 4px;
}

.chart-placeholder {
  background:
    linear-gradient(180deg, rgba(37, 99, 235, 0.03), rgba(255, 255, 255, 0)),
    #fff;
  border-radius: 18px;
  display: grid;
  gap: 20px;
  min-height: 220px;
  padding: 18px;
}

.chart-placeholder__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}

.chart-key {
  align-items: center;
  color: var(--app-text-muted);
  display: inline-flex;
  font-size: 12px;
  font-weight: 700;
  gap: 8px;
}

.chart-key__dot {
  border-radius: 999px;
  display: inline-flex;
  height: 10px;
  width: 10px;
}

.chart-key--income .chart-key__dot {
  background: #2563eb;
}

.chart-key--expense .chart-key__dot {
  background: #10b981;
}

.chart-placeholder__canvas {
  align-items: end;
  display: flex;
  gap: 16px;
  min-height: 130px;
}

.chart-bar {
  border-radius: 18px 18px 6px 6px;
  width: 16%;
}

.chart-bar--income {
  background: linear-gradient(180deg, #60a5fa, #2563eb);
  min-height: 86px;
}

.chart-bar--expense {
  background: linear-gradient(180deg, #6ee7b7, #10b981);
  min-height: 58px;
}

.chart-bar--short {
  min-height: 62px;
}

.chart-bar--mid {
  min-height: 104px;
}

.chart-bar--long {
  min-height: 132px;
}

.donut-placeholder {
  align-items: center;
  display: grid;
  gap: 18px;
  grid-template-columns: 170px minmax(0, 1fr);
}

.donut-placeholder__ring {
  align-items: center;
  background: conic-gradient(#10b981 0 300deg, #f59e0b 300deg 330deg, #e5e7eb 330deg 360deg);
  border-radius: 50%;
  display: flex;
  height: 170px;
  justify-content: center;
  width: 170px;
}

.donut-placeholder__center {
  align-items: center;
  background: #fff;
  border-radius: 50%;
  box-shadow: inset 0 0 0 1px rgba(15, 23, 42, 0.05);
  display: flex;
  flex-direction: column;
  height: 112px;
  justify-content: center;
  width: 112px;
}

.donut-placeholder__center strong {
  color: var(--app-text);
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.donut-placeholder__center span {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
  margin-top: 4px;
}

.donut-placeholder__legend,
.alerts-list,
.table-placeholder {
  display: grid;
  gap: 12px;
}

.legend-row,
.notice-item,
.table-row {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.legend-row {
  justify-content: flex-start;
}

.legend-dot {
  border-radius: 999px;
  display: inline-flex;
  height: 10px;
  width: 10px;
}

.legend-dot--green {
  background: #10b981;
}

.legend-dot--orange {
  background: #f59e0b;
}

.legend-dot--blue {
  background: #2563eb;
}

.legend-row__label,
.notice-item__title,
.table-row__primary,
.context-summary__row strong,
.condo-item__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 700;
}

.legend-row__value,
.notice-item__subtitle,
.table-row__secondary,
.context-summary__label,
.condo-item__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  margin-top: 2px;
}

.link-action {
  color: var(--app-primary);
  font-weight: 800;
}

.notice-item {
  align-items: flex-start;
  justify-content: flex-start;
}

.notice-item__icon {
  align-items: center;
  border-radius: 14px;
  display: inline-flex;
  flex-shrink: 0;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.notice-item__icon--violet {
  background: rgba(124, 58, 237, 0.12);
  color: #7c3aed;
}

.notice-item__icon--orange {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.notice-item__icon--blue {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.context-summary {
  display: grid;
  gap: 14px;
}

.context-summary__row {
  background: rgba(15, 23, 42, 0.03);
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
}

.condo-list {
  display: grid;
  gap: 10px;
}

.condo-item {
  align-items: center;
  background: rgba(15, 23, 42, 0.03);
  border-radius: 16px;
  display: grid;
  gap: 12px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  padding: 12px 14px;
}

.condo-item__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.12);
  border-radius: 14px;
  color: var(--app-primary);
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.quick-actions {
  display: grid;
  gap: 10px;
}

.quick-actions__btn {
  justify-content: flex-start;
  min-height: 44px;
}

.dialog-sample {
  align-items: center;
  display: grid;
  justify-items: center;
  text-align: center;
}

.dialog-sample__icon {
  align-items: center;
  border-radius: 50%;
  display: inline-flex;
  height: 56px;
  justify-content: center;
  width: 56px;
}

.dialog-sample__icon--primary {
  background: rgba(37, 99, 235, 0.12);
  color: #2563eb;
}

.dialog-sample__title {
  color: var(--app-text);
  font-size: 18px;
  font-weight: 800;
  margin-top: 12px;
}

.dialog-sample__text {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.6;
  margin-top: 6px;
  max-width: 260px;
}

.dialog-sample__actions {
  display: flex;
  gap: 10px;
  margin-top: 18px;
}

@media (max-width: 1439px) {
  .dashboard-layout {
    grid-template-columns: 1fr;
  }

  .dashboard-layout__aside {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 1180px) {
  .stats-grid,
  .content-grid,
  .content-grid--secondary,
  .dashboard-layout__aside {
    grid-template-columns: 1fr;
  }

  .hero-card__content {
    grid-template-columns: 1fr;
    justify-items: start;
  }

  .hero-card__right {
    justify-content: flex-start;
  }

  .donut-placeholder {
    grid-template-columns: 1fr;
    justify-items: center;
  }
}

@media (max-width: 599px) {
  .stats-grid,
  .content-grid,
  .content-grid--secondary,
  .dashboard-layout__aside {
    gap: 14px;
  }

  .stat-card__value {
    font-size: 24px;
  }

  .panel-card__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .dialog-sample__actions {
    flex-direction: column;
  }
}
</style>
