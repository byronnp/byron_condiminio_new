<template>
  <q-page class="new-condo-page">
    <div class="page-shell">
      <header class="page-header">
        <div class="page-header__heading">
          <h1 class="page-header__title">{{ pageTitle }}</h1>
          <p class="page-header__subtitle">
            {{ pageSubtitle }}
          </p>
        </div>

        <div class="page-header__actions">
          <q-btn
            flat
            no-caps
            label="Volver"
            icon="arrow_back"
            class="header-action header-action--ghost"
            @click="goBack"
          />
        </div>
      </header>

      <q-card flat bordered class="wizard-frame">
        <q-inner-loading :showing="isLoadingCondominium">
          <q-spinner color="primary" size="32px" />
        </q-inner-loading>

        <AppStepper :steps="steps" :current-step="activeStep" @select="selectStep" />

        <q-separator class="wizard-divider" />

        <div class="wizard-layout">
          <section class="wizard-main">
            <transition name="fade-slide" mode="out-in">
              <div :key="activeStep" class="wizard-stage">
                <q-form v-if="activeStep === 'info'" ref="infoFormRef" class="wizard-form">
                  <div class="step-panel step-panel--airy">
                    <div class="field-group location-layout__panel location-panel info-panel">
                      <div class="location-panel__header">
                        <div class="location-panel__heading">
                          <q-icon name="apartment" size="18px" />
                          <span>Información general</span>
                        </div>
                        <div class="location-panel__hint">
                          Define la identidad del condominio antes de continuar.
                        </div>
                      </div>

                      <div class="step-grid">
                        <q-input
                          v-model="form.name"
                          class="step-field"
                          dense
                          outlined
                          hide-bottom-space
                          label="Nombre del condominio *"
                          :rules="[requiredRule]"
                        />
                        <q-input
                          v-model="form.ruc"
                          class="step-field"
                          dense
                          outlined
                          hide-bottom-space
                          label="RUC del condominio *"
                          :rules="[requiredRule]"
                        />
                        <q-select
                          v-model="form.type"
                          class="step-field"
                          dense
                          outlined
                          hide-bottom-space
                          :options="typeOptions"
                          :loading="typeOptionsLoading"
                          label="Tipo de condominio *"
                          :rules="[requiredRule]"
                        />
                        <div class="step-field step-field--status">
                          <div class="field-label">Estado *</div>
                          <q-option-group
                            v-model="form.status"
                            :options="statusRadioOptions"
                            color="primary"
                            inline
                            dense
                            type="radio"
                          />
                        </div>
                        <q-input
                          v-model="form.description"
                          class="step-field step-field--full"
                          dense
                          outlined
                          hide-bottom-space
                          type="textarea"
                          autogrow
                          label="Descripción"
                        />
                      </div>
                    </div>
                  </div>
                </q-form>

                <q-form v-else-if="activeStep === 'location'" class="wizard-form">
                  <div class="step-panel step-panel--airy">
                    <div class="section-title">Ubicación</div>
                    <div class="section-subtitle">
                      Define la dirección y la georreferencia del condominio.
                    </div>

                    <div class="location-layout q-mt-md">
                      <div class="field-group location-layout__panel location-panel">
                        <div class="location-panel__header">
                          <div class="location-panel__heading">
                            <q-icon name="public" size="18px" />
                            <span>Ubicación geográfica</span>
                          </div>
                          <div class="location-panel__hint">
                            Completa la dirección base del condominio.
                          </div>
                        </div>

                        <div class="step-grid">
                          <q-select
                            v-model="location.countryCode"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            emit-value
                            map-options
                            option-label="label"
                            option-value="value"
                            :options="countryOptions"
                            :loading="countryOptionsLoading"
                            label="País *"
                            :rules="[requiredRule]"
                          />
                          <q-select
                            v-model="location.provinceId"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            emit-value
                            map-options
                            option-label="label"
                            option-value="value"
                            :options="provinceOptions"
                            :loading="provinceOptionsLoading"
                            label="Provincia *"
                            :rules="[requiredRule]"
                            :disable="!location.countryCode"
                          />
                          <q-select
                            v-model="location.cityId"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            emit-value
                            map-options
                            option-label="label"
                            option-value="value"
                            :options="cityOptions"
                            :loading="cityOptionsLoading"
                            label="Ciudad *"
                            :rules="[requiredRule]"
                            :disable="!location.provinceId"
                          />
                          <q-input
                            v-model="location.direction"
                            class="step-field step-field--full"
                            dense
                            outlined
                            hide-bottom-space
                            label="Dirección *"
                            :rules="[requiredRule]"
                          />
                          <q-input
                            v-model="location.reference"
                            class="step-field step-field--full"
                            dense
                            outlined
                            hide-bottom-space
                            type="textarea"
                            autogrow
                            label="Referencia"
                          />
                        </div>
                      </div>

                      <div
                        class="field-group location-layout__panel location-panel location-panel--map"
                      >
                        <div class="location-panel__header">
                          <div class="location-panel__heading">
                            <q-icon name="place" size="18px" />
                            <span>Georreferenciación</span>
                          </div>
                          <div class="location-panel__hint">
                            Define el punto exacto para asociarlo al registro.
                          </div>
                        </div>

                        <div class="map-preview">
                          <div class="map-preview__top">
                            <div>
                              <div class="map-preview__title">Ubicación en mapa</div>
                              <div class="map-preview__subtitle">
                                {{
                                  location.reference
                                    ? 'Referencia disponible'
                                    : 'Punto pendiente por definir'
                                }}
                              </div>
                            </div>
                            <q-badge
                              outline
                              rounded
                              :color="location.reference ? 'positive' : 'warning'"
                            >
                              {{ location.reference ? 'Referencia cargada' : 'Pendiente' }}
                            </q-badge>
                          </div>

                          <div class="map-preview__canvas">
                            <div class="map-preview__grid"></div>
                            <div class="map-preview__halo"></div>
                            <div class="map-preview__pin">
                              <q-icon name="location_on" size="24px" />
                            </div>
                            <div class="map-preview__legend">Mapa interactivo de referencia</div>
                          </div>

                          <q-btn
                            unelevated
                            no-caps
                            color="primary"
                            icon="place"
                            label="Definir en mapa"
                            class="map-preview__action"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </q-form>

                <q-form v-else-if="activeStep === 'config'" ref="configFormRef" class="wizard-form">
                  <div class="step-panel step-panel--airy">
                    <div class="section-title">Configuración</div>
                    <div class="section-subtitle">
                      Ajusta la estructura básica, identidad visual y características.
                    </div>

                    <div class="config-layout q-mt-md">
                      <div class="field-group location-layout__panel location-panel config-panel">
                        <div class="location-panel__header">
                          <div class="location-panel__heading">
                            <q-icon name="layers" size="18px" />
                            <span>Estructura base</span>
                          </div>
                          <div class="location-panel__hint">
                            Define la base operativa del condominio antes de continuar.
                          </div>
                        </div>

                        <div class="step-grid">
                          <q-select
                            v-model="config.currency"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            :options="currencyOptions"
                            label="Moneda *"
                            :rules="[requiredRule]"
                          />
                          <q-input
                            v-model="config.towers"
                            class="step-field"
                            dense
                            outlined
                            stack-label
                            hide-bottom-space
                            type="number"
                            label="Número de bloques o torres *"
                            :rules="[requiredRule, integerMinRule(1)]"
                          />
                          <q-input
                            v-model="config.houses"
                            class="step-field"
                            dense
                            outlined
                            stack-label
                            hide-bottom-space
                            type="number"
                            label="Número de casas *"
                            :rules="[requiredRule, integerMinRule(1)]"
                          />
                        </div>
                      </div>

                      <div
                        class="field-group location-layout__panel location-panel config-panel config-panel--visual"
                      >
                        <div class="location-panel__header">
                          <div class="location-panel__heading">
                            <q-icon name="palette" size="18px" />
                            <span>Identidad visual</span>
                          </div>
                          <div class="location-panel__hint">
                            Refuerza la identidad del condominio con una imagen reconocible.
                          </div>
                        </div>

                        <div class="logo-upload">
                          <div class="logo-upload__preview">
                            <div class="logo-upload__artwork">
                              <img
                                v-if="logoPreviewUrl"
                                :src="logoPreviewUrl"
                                alt="Vista previa del logo del condominio"
                              />
                              <q-icon v-else name="add_photo_alternate" size="34px" />
                            </div>
                          </div>

                          <div class="logo-upload__content">
                            <div class="logo-upload__heading">
                              <div class="logo-upload__title">Logo del condominio</div>
                              <q-btn
                                v-if="config.logo"
                                flat
                                round
                                dense
                                icon="close"
                                class="logo-upload__clear"
                                @click="clearLogo"
                              >
                                <q-tooltip>Quitar logo</q-tooltip>
                              </q-btn>
                            </div>

                            <q-file
                              v-model="config.logo"
                              class="logo-upload__dropzone"
                              accept="image/*"
                              dense
                              outlined
                              hide-bottom-space
                              label="Seleccionar imagen"
                            >
                              <template #prepend>
                                <q-icon name="cloud_upload" />
                              </template>
                              <template #append>
                                <q-badge outline color="primary" rounded>Subir</q-badge>
                              </template>
                            </q-file>

                            <div class="logo-upload__file-name">
                              {{ logoFileName }}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div
                        class="field-group location-layout__panel location-panel config-panel config-panel--features"
                      >
                        <div class="location-panel__header">
                          <div class="location-panel__heading">
                            <q-icon name="widgets" size="18px" />
                            <span>Características</span>
                          </div>
                          <div class="location-panel__hint">
                            Selecciona las amenidades y servicios disponibles para el condominio.
                          </div>
                        </div>

                        <div class="feature-toolbar">
                          <div class="feature-toolbar__meta">
                            <div class="feature-toolbar__title">Selección rápida</div>
                            <div class="feature-toolbar__subtitle">
                              {{ selectedCharacteristicsCount }} de
                              {{ characteristicOptions.length }} características activas.
                            </div>
                          </div>

                          <div class="feature-toolbar__actions">
                            <q-btn
                              flat
                              no-caps
                              dense
                              icon="done_all"
                              label="Todas"
                              class="feature-toolbar__action"
                              @click="selectAllFeatures"
                            />
                            <q-btn
                              flat
                              no-caps
                              dense
                              icon="close"
                              label="Limpiar"
                              class="feature-toolbar__action"
                              @click="clearFeatures"
                            />
                          </div>
                        </div>

                        <div class="feature-selected">
                          <div class="feature-selected__header">
                            <div class="feature-selected__title">Seleccionadas</div>
                            <q-badge rounded color="primary" outline>
                              {{ selectedCharacteristicsCount }}
                            </q-badge>
                          </div>

                          <div v-if="selectedCharacteristics.length" class="feature-selected__chips">
                            <q-badge
                              v-for="feature in selectedCharacteristics"
                              :key="feature.value"
                              rounded
                              color="primary"
                              outline
                              class="feature-selected__chip"
                            >
                              {{ feature.label }}
                            </q-badge>
                          </div>

                          <div v-else class="feature-selected__empty">
                            Elige una o varias amenidades para perfilar mejor el condominio.
                          </div>
                        </div>

                        <div class="feature-grid">
                          <button
                            v-for="feature in characteristicOptions"
                            :key="feature.value"
                            type="button"
                            class="feature-toggle"
                            :class="{ 'feature-toggle--active': isFeatureSelected(feature.value) }"
                            @click="toggleFeature(feature.value)"
                          >
                            <span class="feature-toggle__icon">
                              <q-icon :name="feature.icon" size="17px" />
                            </span>
                            <span class="feature-toggle__label">{{ feature.label }}</span>
                            <q-icon
                              v-if="isFeatureSelected(feature.value)"
                              name="check_circle"
                              size="16px"
                              class="feature-toggle__check"
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-form>

                <q-form
                  v-else-if="!isEditMode && activeStep === 'admin'"
                  ref="adminFormRef"
                  class="wizard-form"
                >
                  <div class="step-panel">
                    <div class="section-title">Administrador principal</div>
                    <div class="section-subtitle">
                      Define quién administrará el acceso y la operación inicial.
                    </div>

                    <div class="admin-layout q-mt-md">
                      <div
                        class="field-group location-layout__panel location-panel admin-panel admin-panel--single"
                      >
                        <div class="location-panel__header">
                          <div class="location-panel__heading">
                            <q-icon name="badge" size="18px" />
                            <span>Datos del administrador</span>
                          </div>
                          <div class="location-panel__hint">
                            Captura la información del usuario que gestionará el condominio.
                          </div>
                        </div>

                        <div class="step-grid">
                          <q-input
                            v-model="administrator.name"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            label="Nombres *"
                            :rules="[requiredRule]"
                          />
                          <q-input
                            v-model="administrator.lastName"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            label="Apellidos *"
                            :rules="[requiredRule]"
                          />
                          <q-select
                            v-model="administrator.documentType"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            :options="documentTypeOptions"
                            :loading="documentTypeOptionsLoading"
                            label="Tipo de documento *"
                            :rules="[requiredRule]"
                          />
                          <q-input
                            v-model="administrator.idNumber"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            label="Número de documento *"
                            :rules="[requiredRule]"
                          />
                          <q-input
                            v-model="administrator.email"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            type="email"
                            label="Correo electrónico *"
                            :rules="[requiredRule, emailRule]"
                          />
                          <q-input
                            v-model="administrator.phone"
                            class="step-field"
                            dense
                            outlined
                            hide-bottom-space
                            label="Teléfono"
                            :rules="[phoneRule]"
                          />
                          <div class="step-field step-field--status">
                            <div class="field-label">Estado *</div>
                            <q-option-group
                              v-model="administrator.status"
                              :options="statusRadioOptions"
                              color="primary"
                              inline
                              dense
                              type="radio"
                            />
                          </div>
                        </div>

                        <div class="admin-mail-note">
                          <q-icon name="mark_email_read" size="18px" />
                          <span>
                            Las credenciales de acceso se enviarán automáticamente al correo
                            registrado.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-form>

                <div v-else class="wizard-form">
                  <div class="step-panel step-panel--airy">
                    <div class="review-header">
                      <div class="review-header__copy">
                        <div class="section-title">Resumen final</div>
                        <div class="section-subtitle">
                          Revisa la ficha antes de guardar el condominio.
                        </div>
                      </div>
                      <q-badge
                        rounded
                        :color="isReviewReady ? 'positive' : 'warning'"
                        class="review-header__badge"
                      >
                        {{ reviewStatusLabel }}
                      </q-badge>
                    </div>

                    <div class="review-status" :class="{ 'review-status--ready': isReviewReady }">
                      <q-icon :name="isReviewReady ? 'task_alt' : 'info'" size="18px" />
                      <span>{{ reviewStatusMessage }}</span>
                    </div>

                    <q-banner
                      v-if="submitError"
                      dense
                      rounded
                      class="review-error-banner q-mt-md"
                    >
                      <template #avatar>
                        <q-icon name="error_outline" color="negative" />
                      </template>
                      {{ submitError }}
                    </q-banner>

                    <div class="review-identity">
                      <div class="review-identity__media">
                        <img
                          v-if="logoPreviewUrl"
                          :src="logoPreviewUrl"
                          alt="Logo del condominio"
                        />
                        <q-icon v-else name="apartment" size="34px" />
                      </div>

                      <div class="review-identity__content">
                        <div class="review-identity__eyebrow">Identidad del condominio</div>
                        <div class="review-identity__name">{{ summaryIdentityName }}</div>
                        <div class="review-identity__meta">
                          <span>{{ summaryIdentityType }}</span>
                          <span>{{ form.ruc || 'Sin RUC' }}</span>
                        </div>
                      </div>

                      <div class="review-identity__facts">
                        <div class="review-identity__fact">
                          <span>Estado</span>
                          <strong>{{ form.status }}</strong>
                        </div>
                        <div class="review-identity__fact">
                          <span>Moneda</span>
                          <strong>{{ config.currency || 'Sin moneda' }}</strong>
                        </div>
                        <div class="review-identity__fact">
                          <span>Unidades</span>
                          <strong>{{ unitsSummary }}</strong>
                        </div>
                      </div>
                    </div>

                    <div class="review-grid q-mt-md">
                      <q-card flat bordered class="review-card">
                        <q-card-section>
                          <div class="review-card__title">
                            <q-icon name="badge" size="18px" />
                            <span>Identificación</span>
                          </div>
                          <div class="review-card__list">
                            <div class="review-card__row">
                              <span>Nombre</span><strong>{{ form.name || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>RUC</span><strong>{{ form.ruc || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Tipo</span><strong>{{ form.type || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Estado</span><strong>{{ form.status }}</strong>
                            </div>
                            <div class="review-card__row review-card__row--stacked">
                              <span>Descripción</span
                              ><strong>{{ form.description || 'Sin datos' }}</strong>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>

                      <q-card flat bordered class="review-card">
                        <q-card-section>
                          <div class="review-card__title">
                            <q-icon name="place" size="18px" />
                            <span>Ubicación</span>
                          </div>
                          <div class="review-card__list">
                            <div class="review-card__row">
                              <span>País</span
                              ><strong>{{ selectedCountryName || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Provincia</span
                              ><strong>{{ selectedProvinceName || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Ciudad</span><strong>{{ selectedCityName || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row review-card__row--stacked">
                              <span>Dirección</span
                              ><strong>{{ location.direction || 'Sin datos' }}</strong>
                            </div>
                            <div class="review-card__row review-card__row--stacked">
                              <span>Referencia</span
                              ><strong>{{ location.reference || 'Sin datos' }}</strong>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>

                      <q-card flat bordered class="review-card">
                        <q-card-section>
                          <div class="review-card__title">
                            <q-icon name="domain" size="18px" />
                            <span>Estructura y servicios</span>
                          </div>
                          <div class="review-card__list">
                            <div class="review-card__row">
                              <span>Moneda</span
                              ><strong>{{ config.currency || 'Sin moneda' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Bloques</span><strong>{{ config.towers || '0' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Casas</span><strong>{{ config.houses || '0' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Logo</span><strong>{{ logoFileName }}</strong>
                            </div>
                            <div class="review-card__row review-card__row--stacked">
                              <span>Características</span
                              ><strong>{{
                                selectedCharacteristics.length
                                  ? selectedCharacteristics.map((feature) => feature.label).join(', ')
                                  : 'Sin seleccionar'
                              }}</strong>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>

                      <q-card v-if="!isEditMode" flat bordered class="review-card">
                        <q-card-section>
                          <div class="review-card__title">
                            <q-icon name="admin_panel_settings" size="18px" />
                            <span>Administrador principal</span>
                          </div>
                          <div class="review-card__list">
                            <div class="review-card__row">
                              <span>Nombre</span><strong>{{ adminFullName }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Tipo de documento</span
                              ><strong>{{ administrator.documentType || 'Sin tipo' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Número de documento</span
                              ><strong>{{ administrator.idNumber || 'Sin documento' }}</strong>
                            </div>
                            <div class="review-card__row review-card__row--stacked">
                              <span>Correo</span
                              ><strong>{{ administrator.email || 'Sin correo' }}</strong>
                            </div>
                            <div class="review-card__row">
                              <span>Estado</span
                              ><strong>{{ administrator.status || 'Activo' }}</strong>
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </div>
              </div>
            </transition>

            <div class="wizard-footer">
              <q-btn flat no-caps label="Cancelar" class="footer-btn" @click="goBack" />
              <div class="wizard-footer__actions">
                <q-btn
                  flat
                  no-caps
                  label="Anterior"
                  icon="arrow_back"
                  class="footer-btn footer-btn--ghost"
                  :disable="isFirstStep"
                  :loading="isSubmitting"
                  @click="previousStep"
                />
                <q-btn
                  unelevated
                  no-caps
                  :label="primaryActionLabel"
                  :icon="primaryActionIcon"
                  color="primary"
                  class="footer-btn footer-btn--primary"
                  :loading="primaryActionLoading"
                  :disable="isSubmitting"
                  @click="void handlePrimaryAction()"
                />
              </div>
            </div>
          </section>

          <aside class="wizard-aside">
            <q-card flat bordered class="summary-panel summary-panel--sticky">
              <q-card-section class="summary-panel__section">
                <div class="summary-panel__kicker">Resumen ejecutivo</div>
                <div class="summary-panel__subtitle">Identidad del condominio</div>

                <div class="summary-identity q-mt-md">
                  <div class="summary-identity__media">
                    <img v-if="logoPreviewUrl" :src="logoPreviewUrl" alt="Logo del condominio" />
                    <q-icon v-else name="apartment" size="32px" />
                  </div>
                  <div class="summary-identity__copy">
                    <div class="summary-identity__name">
                      {{ summaryIdentityName }}
                    </div>
                    <div class="summary-identity__type">
                      {{ summaryIdentityType }}
                    </div>
                    <q-badge :color="form.status === 'Activo' ? 'positive' : 'grey-6'" rounded>
                      {{ form.status }}
                    </q-badge>
                  </div>
                </div>

                <div class="summary-identity-list q-mt-md">
                  <div
                    v-for="item in summaryIdentityItems"
                    :key="item.label"
                    class="summary-identity-row"
                  >
                    <span>{{ item.label }}</span>
                    <strong>{{ item.value }}</strong>
                  </div>
                </div>

                <div
                  class="summary-identity-status q-mt-md"
                  :class="{ 'summary-identity-status--complete': isIdentitySummaryComplete }"
                >
                  <q-icon :name="isIdentitySummaryComplete ? 'task_alt' : 'info'" size="18px" />
                  <span>{{ identitySummaryMessage }}</span>
                </div>
              </q-card-section>
            </q-card>
          </aside>
        </div>
      </q-card>
    </div>

    <CondominioCreatedDialog
      v-if="!isEditMode"
      v-model="createdDialogOpen"
      :condo-name="form.name || 'Nuevo condominio'"
      :condo-type="form.type"
      :condo-status="form.status"
      @go-to-condominio="goToCondominio"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue';
import { Notify } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import AppStepper from '@/components/shared/AppStepper.vue';
import { buildCondominiumPayload } from '@/composables/condominios/condominio-payload';
import { useCatalogOptions } from '@/composables/shared/useCatalogOptions';
import {
  createCondominium,
  fetchCondominiumById,
  updateCondominium,
} from '@/services/condominiums.service';
import { fetchCities, fetchCountries, fetchProvinces } from '@/services/location.service';
import { useSessionStore } from '@/stores/session.store';
import CondominioCreatedDialog from './CondominioCreatedDialog.vue';

const props = withDefaults(
  defineProps<{
    mode?: 'create' | 'edit';
  }>(),
  {
    mode: 'create',
  },
);

type StepName = 'info' | 'location' | 'config' | 'admin' | 'review';

type ValidatableForm = {
  validate: () => Promise<boolean> | boolean;
};

type CondoForm = {
  name: string;
  ruc: string;
  type: string;
  description: string;
  status: string;
};

type LocationForm = {
  countryCode: string;
  provinceId: number | null;
  cityId: number | null;
  direction: string;
  reference: string;
};

type ConfigForm = {
  currency: string;
  towers: string;
  houses: string;
  logo: File | null;
  characteristics: number[];
};

type AdministratorForm = {
  name: string;
  lastName: string;
  documentType: string;
  idNumber: string;
  email: string;
  phone: string;
  status: string;
};

type StepDefinition = {
  name: StepName;
  label: string;
  description?: string;
  icon?: string;
};

const router = useRouter();
const route = useRoute();
const session = useSessionStore();

const baseSteps: StepDefinition[] = [
  { name: 'info', label: 'Información' },
  { name: 'location', label: 'Ubicación' },
  { name: 'config', label: 'Configuración' },
  { name: 'admin', label: 'Administrador' },
  { name: 'review', label: 'Resumen' },
];

const steps = computed(() =>
  isEditMode.value ? baseSteps.filter((step) => step.name !== 'admin') : baseSteps,
);

const stepIndexByName = computed(
  () =>
    Object.fromEntries(steps.value.map((step, index) => [step.name, index])) as Record<
      StepName,
      number
    >,
);

const activeStep = ref<StepName>('info');
const createdDialogOpen = ref(false);
const isSubmitting = ref(false);
const isLoadingCondominium = ref(false);
const submitError = ref('');

const infoFormRef = ref<ValidatableForm | null>(null);
const configFormRef = ref<ValidatableForm | null>(null);
const adminFormRef = ref<ValidatableForm | null>(null);

const form = reactive<CondoForm>({
  name: '',
  ruc: '',
  type: '',
  description: '',
  status: 'Activo',
});

const location = reactive<LocationForm>({
  countryCode: '',
  provinceId: null,
  cityId: null,
  direction: '',
  reference: '',
});

const config = reactive<ConfigForm>({
  currency: '',
  towers: '',
  houses: '',
  logo: null,
  characteristics: [],
});

const administrator = reactive<AdministratorForm>({
  name: '',
  lastName: '',
  documentType: '',
  idNumber: '',
  email: '',
  phone: '',
  status: 'Activo',
});

const fallbackTypeOptions = ['Residencial', 'Mixto', 'Comercial'];
const statusRadioOptions = [
  { label: 'Activo', value: 'Activo' },
  { label: 'Inactivo', value: 'Inactivo' },
];
type CharacteristicOption = {
  id: number;
  value: string;
  label: string;
  icon: string;
};
const fallbackCharacteristicOptions: CharacteristicOption[] = [
  { id: 1, value: 'Piscina', label: 'Piscina', icon: 'pool' },
  { id: 2, value: 'Gimnasio', label: 'Gimnasio', icon: 'fitness_center' },
  { id: 3, value: 'Areas comunes', label: 'Áreas comunes', icon: 'deck' },
  { id: 4, value: 'Salon comunal', label: 'Salón comunal', icon: 'event_seat' },
  { id: 5, value: 'Seguridad 24/7', label: 'Seguridad 24/7', icon: 'shield' },
  { id: 6, value: 'Parqueadero', label: 'Parqueadero', icon: 'local_parking' },
];
const featureIconMap: Record<string, string> = {
  piscina: 'pool',
  piscina_climatizada: 'pool',
  gimnasio: 'fitness_center',
  areas_comunes: 'deck',
  area_comunes: 'deck',
  area_social: 'deck',
  salon_comunal: 'event_seat',
  salón_comunal: 'event_seat',
  seguridad_24_7: 'shield',
  seguridad: 'shield',
  parqueadero: 'local_parking',
  parqueadero_de_visitas: 'local_parking',
  juegos_infantiles: 'toys',
  lavanderia: 'local_laundry_service',
  lavandería: 'local_laundry_service',
  bbq: 'outdoor_grill',
  ascensor: 'elevator',
  terraza: 'deck',
};
const countryOptions = ref<{ label: string; value: string }[]>([]);
const countryOptionsLoading = ref(false);
const provinceOptions = ref<{ label: string; value: number }[]>([]);
const provinceOptionsLoading = ref(false);
const cityOptions = ref<{ label: string; value: number }[]>([]);
const cityOptionsLoading = ref(false);
const currencyOptions = ['USD', 'EUR', 'MXN'];
const fallbackDocumentTypeOptions = ['Cédula', 'RUC', 'Pasaporte'];
const {
  options: typeOptions,
  loading: typeOptionsLoading,
  loadOptions: loadTypeOptions,
} = useCatalogOptions<string>('condominium_types', {
  fallback: fallbackTypeOptions,
  mapItem: (item) => item.name.trim() || item.code.trim() || null,
});
const {
  options: characteristicOptions,
  loadOptions: loadCharacteristicOptions,
} = useCatalogOptions<CharacteristicOption>('condominium_features', {
  fallback: fallbackCharacteristicOptions,
  mapItem: (item) => {
    const label = item.name.trim() || item.code.trim();
    if (!label) {
      return null;
    }

    return {
      id: item.id,
      value: label,
      label,
      icon: featureIconForLabel(label),
    };
  },
});
const {
  options: documentTypeOptions,
  loading: documentTypeOptionsLoading,
  loadOptions: loadDocumentTypeOptions,
} = useCatalogOptions<string>('document_types', {
  fallback: fallbackDocumentTypeOptions,
  mapItem: (item) => item.name.trim() || item.code.trim() || null,
});

const adminFullName = computed(
  () => `${administrator.name} ${administrator.lastName}`.trim() || 'Administrador principal',
);
const logoFileName = computed(() => config.logo?.name ?? 'Sin archivo');
const logoPreviewUrl = ref<string | null>(null);
const isHydratingCondominium = ref(false);
const isEditMode = computed(() => props.mode === 'edit');
const condominiumId = computed(() => {
  const rawId = route.params.id;
  const idValue = Array.isArray(rawId) ? rawId[0] : rawId;
  const id = Number(idValue);
  return Number.isFinite(id) && id > 0 ? id : null;
});
const pageTitle = computed(() => (isEditMode.value ? 'Editar condominio' : 'Crear nuevo condominio'));
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Actualiza la información del condominio y revisa el resumen antes de guardar.'
    : 'Completa el formulario paso a paso y revisa el resumen ejecutivo a la derecha.',
);
const primaryActionLabel = computed(() =>
  isLastStep.value ? (isEditMode.value ? 'Actualizar condominio' : 'Guardar condominio') : 'Siguiente',
);
const primaryActionIcon = computed(() =>
  isLastStep.value ? (isEditMode.value ? 'save' : 'check') : 'arrow_forward',
);
const primaryActionLoading = computed(() => isSubmitting.value && isLastStep.value);

let logoObjectUrl: string | null = null;
let provinceLoadToken = 0;
let cityLoadToken = 0;

async function loadCountryOptions() {
  countryOptionsLoading.value = true;

  try {
    const countries = await fetchCountries(session.accessToken);
    countryOptions.value = countries.map((country) => ({
      label: country.name,
      value: country.code,
    }));
  } catch {
    countryOptions.value = [];
  } finally {
    countryOptionsLoading.value = false;
  }
}

function normalizeFeatureLabel(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function featureIconForLabel(label: string) {
  const key = normalizeFeatureLabel(label);
  return featureIconMap[key] ?? 'check_circle';
}

async function loadProvinceOptions(countryCode: string) {
  const requestToken = ++provinceLoadToken;
  provinceOptionsLoading.value = true;

  try {
    const provinces = await fetchProvinces(countryCode, session.accessToken);
    if (requestToken !== provinceLoadToken) {
      return;
    }

    provinceOptions.value = provinces.map((province) => ({
      label: province.name,
      value: province.id,
    }));
  } catch {
    if (requestToken !== provinceLoadToken) {
      return;
    }

    provinceOptions.value = [];
  } finally {
    if (requestToken === provinceLoadToken) {
      provinceOptionsLoading.value = false;
    }
  }
}

async function loadCityOptions(provinceId: number) {
  const requestToken = ++cityLoadToken;
  cityOptionsLoading.value = true;

  try {
    const cities = await fetchCities(provinceId, session.accessToken);
    if (requestToken !== cityLoadToken) {
      return;
    }

    cityOptions.value = cities.map((city) => ({
      label: city.name,
      value: city.id,
    }));
  } catch {
    if (requestToken !== cityLoadToken) {
      return;
    }

    cityOptions.value = [];
  } finally {
    if (requestToken === cityLoadToken) {
      cityOptionsLoading.value = false;
    }
  }
}

function applyCondominiumDetail(detail: Awaited<ReturnType<typeof fetchCondominiumById>>) {
  if (!detail) {
    return;
  }

  form.name = detail.name ?? '';
  form.ruc = detail.ruc ?? '';
  form.type = detail.type ?? '';
  form.description = detail.description ?? '';
  form.status = detail.status || 'Activo';

  location.direction = detail.direction ?? '';
  location.reference = detail.reference ?? '';
  location.countryCode = detail.countryCode ?? '';

  config.currency = detail.currency ?? '';
  config.towers = detail.towers ?? '';
  config.houses = detail.houses ?? '';
  config.characteristics = detail.characteristics.map((feature) => feature.id);

  logoPreviewUrl.value = detail.logoUrl || null;
}

async function loadCondominiumForEdit() {
  const id = condominiumId.value;
  if (!isEditMode.value || id === null) {
    return;
  }

  isHydratingCondominium.value = true;
  isLoadingCondominium.value = true;
  submitError.value = '';

  try {
    const detail = await fetchCondominiumById(id, session.accessToken);
    if (!detail) {
      throw new Error('No fue posible cargar el condominio para edición.');
    }

    applyCondominiumDetail(detail);

    if (detail.countryCode) {
      await loadProvinceOptions(detail.countryCode);
    }

    if (detail.provinceId !== null) {
      location.provinceId = detail.provinceId;
      await loadCityOptions(detail.provinceId);
    }

    if (detail.cityId !== null) {
      location.cityId = detail.cityId;
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'No fue posible cargar el condominio.';
    submitError.value = message;
    Notify.create({
      type: 'negative',
      message,
      position: 'top-right',
    });
  } finally {
    isLoadingCondominium.value = false;
    isHydratingCondominium.value = false;
  }
}

onMounted(() => {
  void loadTypeOptions();
  void loadDocumentTypeOptions();
  void loadCharacteristicOptions();
  void loadCountryOptions();
  void loadCondominiumForEdit();
});

watch(
  () => location.countryCode,
  async (countryCode) => {
    if (isHydratingCondominium.value) {
      return;
    }

    provinceLoadToken += 1;
    cityLoadToken += 1;
    location.provinceId = null;
    location.cityId = null;
    provinceOptions.value = [];
    cityOptions.value = [];

    if (!countryCode) {
      return;
    }

    await loadProvinceOptions(countryCode);
  },
);

watch(
  () => location.provinceId,
  async (provinceId) => {
    if (isHydratingCondominium.value) {
      return;
    }

    cityLoadToken += 1;
    location.cityId = null;
    cityOptions.value = [];

    if (!provinceId) {
      return;
    }

    await loadCityOptions(provinceId);
  },
);

const selectedCountryName = computed(() => {
  const selected = countryOptions.value.find((option) => option.value === location.countryCode);
  return selected?.label ?? '';
});

const selectedProvinceName = computed(() => {
  const selected = provinceOptions.value.find((option) => option.value === location.provinceId);
  return selected?.label ?? '';
});

const selectedCityName = computed(() => {
  const selected = cityOptions.value.find((option) => option.value === location.cityId);
  return selected?.label ?? '';
});

watch(
  () => config.logo,
  (file) => {
    if (logoObjectUrl) {
      URL.revokeObjectURL(logoObjectUrl);
      logoObjectUrl = null;
    }

    logoPreviewUrl.value = file ? URL.createObjectURL(file) : null;
    logoObjectUrl = logoPreviewUrl.value;
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (logoObjectUrl) {
    URL.revokeObjectURL(logoObjectUrl);
  }
});

function isFeatureSelected(value: string) {
  const feature = characteristicOptions.value.find((item) => item.value === value);
  return feature ? config.characteristics.includes(feature.id) : false;
}

function toggleFeature(value: string) {
  const feature = characteristicOptions.value.find((item) => item.value === value);
  if (!feature) {
    return;
  }

  const index = config.characteristics.indexOf(feature.id);
  if (index === -1) {
    config.characteristics.push(feature.id);
    return;
  }

  config.characteristics.splice(index, 1);
}

function selectAllFeatures() {
  config.characteristics = [...characteristicOptions.value.map((feature) => feature.id)];
}

function clearFeatures() {
  config.characteristics = [];
}

function clearLogo() {
  config.logo = null;
}

const summaryIdentityName = computed(() => form.name.trim() || 'Nuevo condominio');
const summaryIdentityType = computed(() => form.type || 'Sin tipo');
const unitsSummary = computed(() => {
  const houses = config.houses.trim() || '0';
  const towers = config.towers.trim() || '0';

  return `${houses} casas · ${towers} torres`;
});

const summaryIdentityItems = computed(() => [
  { label: 'Nombre', value: summaryIdentityName.value },
  { label: 'Tipo', value: summaryIdentityType.value },
  { label: 'Unidades', value: unitsSummary.value },
  { label: 'Moneda', value: config.currency || 'Sin moneda' },
  { label: 'Estado', value: form.status },
]);

const selectedCharacteristics = computed(() =>
  characteristicOptions.value.filter((feature) => config.characteristics.includes(feature.id)),
);

const selectedCharacteristicsCount = computed(() => selectedCharacteristics.value.length);

const isIdentitySummaryComplete = computed(() =>
  Boolean(
    form.name && form.type && config.houses && config.towers && config.currency && form.status,
  ),
);

const identitySummaryMessage = computed(() =>
  isIdentitySummaryComplete.value
    ? 'Identidad básica completa.'
    : 'Completa nombre, tipo, unidades y moneda para finalizar la ficha.',
);

const currentStepIndex = computed(() => stepIndexByName.value[activeStep.value] ?? 0);
const isFirstStep = computed(() => currentStepIndex.value === 0);
const isLastStep = computed(() => currentStepIndex.value === steps.value.length - 1);

function goBack() {
  router.back();
}

function toText(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'
    ? String(value)
    : '';
}

function previousStep() {
  if (isFirstStep.value) {
    return;
  }

  activeStep.value = steps.value[currentStepIndex.value - 1]?.name ?? 'info';
}

function nextStep() {
  if (isLastStep.value) {
    return;
  }

  activeStep.value = steps.value[currentStepIndex.value + 1]?.name ?? 'review';
}

function selectStep(step: string | number) {
  activeStep.value = step as StepName;
}

function requiredRule(value: unknown) {
  return toText(value).trim() ? true : 'Campo requerido';
}

function emailRule(value: unknown) {
  const text = toText(value).trim();
  return /^\S+@\S+\.\S+$/.test(text) ? true : 'Ingresa un correo válido';
}

function phoneRule(value: unknown) {
  const text = toText(value).trim();
  if (!text) {
    return true;
  }

  return /^[0-9+()\-\s]{7,20}$/.test(text) ? true : 'Ingresa un teléfono válido';
}

function integerMinRule(min: number) {
  return (value: unknown) => {
    const text = toText(value).trim();
    if (!text) {
      return 'Campo requerido';
    }

    const numericValue = Number(text);
    if (!Number.isInteger(numericValue)) {
      return 'Ingresa un número entero';
    }

    return numericValue >= min ? true : `Debe ser mayor o igual a ${min}`;
  };
}

function isInfoValid() {
  return Boolean(form.name && form.ruc && form.type && form.status);
}

function isLocationValid() {
  return Boolean(
    location.countryCode &&
      location.provinceId !== null &&
      location.cityId !== null &&
      location.direction,
  );
}

function isConfigValid() {
  return Boolean(config.currency && config.towers && config.houses);
}

function isAdminValid() {
  return Boolean(
    administrator.name &&
    administrator.lastName &&
    administrator.documentType &&
    administrator.idNumber &&
    administrator.email &&
    administrator.status,
  );
}

const isReviewReady = computed(
  () =>
    isInfoValid() &&
    isLocationValid() &&
    isConfigValid() &&
    (isEditMode.value ? true : isAdminValid()),
);

const reviewStatusLabel = computed(() =>
  isReviewReady.value ? 'Listo para guardar' : 'Pendiente',
);

const reviewStatusMessage = computed(() =>
  isReviewReady.value
    ? 'La información mínima requerida está completa. Puedes guardar el condominio.'
    : 'Aún falta completar información requerida en uno o más pasos antes de guardar.',
);

async function validateStep(step: StepName) {
  if (step === 'review') {
    return isReviewReady.value;
  }

  const formRefMap: Partial<
    Record<Exclude<StepName, 'review'>, { value: ValidatableForm | null }>
  > = {
    info: infoFormRef,
    config: configFormRef,
    admin: adminFormRef,
  };

  const refValue = formRefMap[step]?.value;
  if (refValue) {
    const result = await refValue.validate();
    return Boolean(result);
  }

  if (step === 'info') {
    return isInfoValid();
  }

  if (step === 'location') {
    return isLocationValid();
  }

  if (step === 'admin') {
    return isEditMode.value ? true : isAdminValid();
  }

  return step === 'config' ? isConfigValid() : true;
}

async function submitCondominium() {
  if (isSubmitting.value) {
    return false;
  }

  isSubmitting.value = true;
  submitError.value = '';

  try {
    const payload = buildCondominiumPayload(
      { form, location, config, administrator },
      { includeAdministrator: !isEditMode.value },
    );
    const id = condominiumId.value;
    const result = isEditMode.value
      ? await (async () => {
          if (id === null) {
            throw new Error('El identificador del condominio no es válido.');
          }

          return updateCondominium(id, payload, session.accessToken);
        })()
      : await createCondominium(payload, session.accessToken);
    if (!result.success) {
      throw new Error(result.message);
    }

    if (isEditMode.value) {
      Notify.create({
        type: 'positive',
        message: result.message || 'Condominio actualizado correctamente.',
        position: 'top-right',
      });
      await router.push('/condominios');
    } else {
      window.dispatchEvent(new Event('condominiums:changed'));
      createdDialogOpen.value = true;
    }
    return true;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : isEditMode.value
          ? 'No fue posible actualizar el condominio.'
          : 'No fue posible crear el condominio.';
    submitError.value = message;
    Notify.create({
      type: 'negative',
      message,
      position: 'top-right',
    });
    return false;
  } finally {
    isSubmitting.value = false;
  }
}

async function handlePrimaryAction() {
  if (activeStep.value === 'review') {
    if (await validateStep('review')) {
      await submitCondominium();
    }
    return;
  }

  const valid = await validateStep(activeStep.value);
  if (!valid) {
    return;
  }

  nextStep();
}

function goToCondominio() {
  void router.push({ name: 'condominios' });
}
</script>

<style scoped>
.new-condo-page {
  min-height: 100%;
  padding: 16px 0 0;
}

.page-shell {
  display: grid;
  gap: 18px;
  width: 100%;
}

.page-header {
  align-items: end;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.page-header__title {
  color: var(--app-text);
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.1;
  margin: 0;
}

.page-header__subtitle {
  color: var(--app-text-muted);
  font-size: 13px;
  line-height: 1.5;
  margin: 6px 0 0;
}

.wizard-frame {
  background: rgba(255, 255, 255, 0.92);
  border-radius: 20px;
  overflow: hidden;
}

.wizard-divider {
  margin-top: 16px;
}

.wizard-layout {
  display: grid;
  gap: 18px;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 320px);
  padding: 18px;
}

.wizard-main {
  min-width: 0;
}

.wizard-stage {
  display: grid;
  gap: 18px;
}

.wizard-form {
  display: grid;
  gap: 18px;
  width: 100%;
}

.step-panel,
.summary-panel,
.review-card {
  border-radius: 18px;
  overflow: hidden;
}

.step-panel {
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-sizing: border-box;
  padding: 20px;
  width: 100%;
}

.step-panel > .section-title,
.step-panel > .section-subtitle,
.step-panel > .field-group {
  width: 100%;
}

.step-panel--airy {
  padding: 24px;
}

.location-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  width: 100%;
}

.location-layout__panel {
  min-width: 0;
}

.config-layout,
.admin-layout {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  width: 100%;
}

.admin-layout {
  grid-template-columns: minmax(0, 1fr);
}

.config-panel,
.admin-panel {
  min-width: 0;
}

.config-panel--features {
  grid-column: 1 / -1;
}

.config-panel--visual {
  align-content: start;
}

.admin-panel--single {
  align-content: start;
  grid-column: 1 / -1;
}

.admin-mail-note {
  align-items: center;
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 14px;
  color: var(--app-text);
  display: flex;
  gap: 10px;
  margin-top: 16px;
  padding: 12px 14px;
}

.admin-mail-note .q-icon {
  color: var(--app-primary);
  flex: 0 0 auto;
}

.admin-mail-note span {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}

.step-heading {
  display: grid;
  gap: 4px;
  margin-bottom: 6px;
}

.section-title {
  color: var(--app-text);
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.2;
}

.section-subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.45;
}

.step-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  width: 100%;
}

.step-field {
  width: 100%;
}

.step-field--full {
  grid-column: 1 / -1;
}

.step-field--status {
  display: grid;
  gap: 10px;
  grid-column: 1 / -1;
}

.step-field--status :deep(.q-option-group) {
  width: 100%;
}

.field-label {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.step-grid--coords {
  gap: 12px 14px;
}

.step-grid--coords .step-field {
  min-width: 0;
}

.field-group {
  background: rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 16px;
}

.location-panel {
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.86)),
    rgba(248, 250, 252, 0.72);
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.04);
  display: grid;
  align-content: start;
  gap: 0;
  height: 100%;
}

.location-panel--form {
  padding-bottom: 18px;
}

.location-panel__header {
  display: grid;
  gap: 6px;
  margin-bottom: 14px;
}

.location-panel__heading {
  align-items: center;
  color: var(--app-text);
  display: inline-flex;
  gap: 8px;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.location-panel__heading :deep(.q-icon) {
  color: var(--app-primary);
}

.location-panel__hint {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  max-width: 38rem;
}

.field-group__title {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.toggle-grid {
  display: grid;
  gap: 12px;
}

.toggle-grid--soft {
  background: rgba(248, 250, 252, 0.72);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  padding: 14px 16px;
}

.map-placeholder {
  display: grid;
  gap: 14px;
}

.map-placeholder__top {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.map-placeholder__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
}

.map-placeholder__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 4px;
}

.map-placeholder__canvas {
  align-items: center;
  background:
    radial-gradient(circle at top, rgba(37, 99, 235, 0.12), transparent 44%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 18px;
  display: grid;
  gap: 8px;
  justify-items: center;
  min-height: 260px;
  padding: 24px;
}

.map-placeholder__pin {
  align-items: center;
  background: rgba(37, 99, 235, 0.12);
  border-radius: 999px;
  color: var(--app-primary);
  display: inline-flex;
  height: 48px;
  justify-content: center;
  width: 48px;
}

.map-placeholder__top :deep(.q-btn) {
  background: rgba(255, 255, 255, 0.84);
  border-radius: 999px;
  padding-inline: 12px;
}

.map-placeholder__legend {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
}

.map-preview {
  background: transparent;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  display: grid;
  gap: 14px;
}

.map-preview__top {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.map-preview__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.map-preview__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 4px;
}

.logo-upload {
  align-items: center;
  background:
    radial-gradient(circle at top left, rgba(37, 99, 235, 0.09), transparent 36%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.99), rgba(248, 250, 252, 0.94));
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: 20px;
  display: grid;
  gap: 14px;
  grid-template-columns: 82px minmax(0, 1fr);
  padding: 16px;
  position: relative;
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);
}

.logo-upload__preview {
  align-items: center;
  display: grid;
  justify-items: center;
  min-width: 0;
}

.logo-upload__content {
  align-content: start;
  display: grid;
  gap: 8px;
  min-width: 0;
}

.logo-upload__heading {
  align-items: start;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  min-width: 0;
}

.logo-upload__artwork {
  align-items: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.9), rgba(37, 99, 235, 0.12)),
    linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.08));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 20px;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.55),
    0 12px 24px rgba(37, 99, 235, 0.12);
  color: var(--app-primary);
  display: inline-flex;
  height: 72px;
  justify-content: center;
  overflow: hidden;
  width: 72px;
}

.logo-upload__artwork img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.map-preview__canvas {
  align-items: center;
  background:
    radial-gradient(circle at 50% 20%, rgba(37, 99, 235, 0.18), transparent 40%),
    linear-gradient(180deg, rgba(246, 248, 251, 0.96), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 20px;
  display: grid;
  gap: 10px;
  justify-items: center;
  min-height: 280px;
  overflow: hidden;
  padding: 24px;
  position: relative;
}

.map-preview__grid {
  background-image:
    linear-gradient(rgba(37, 99, 235, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(37, 99, 235, 0.06) 1px, transparent 1px);
  background-position: center;
  background-size: 36px 36px;
  inset: 0;
  opacity: 0.7;
  position: absolute;
}

.map-preview__halo {
  background: radial-gradient(circle, rgba(37, 99, 235, 0.16), transparent 62%);
  border-radius: 999px;
  height: 180px;
  position: absolute;
  width: 180px;
}

.map-preview__pin {
  align-items: center;
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.08));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 999px;
  color: var(--app-primary);
  display: inline-flex;
  height: 58px;
  justify-content: center;
  position: relative;
  width: 58px;
  z-index: 1;
}

.map-preview__legend {
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 999px;
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
  padding: 8px 12px;
  position: relative;
  z-index: 1;
}

.map-preview__action {
  border-radius: 14px;
  min-height: 42px;
  width: 100%;
}

.logo-upload__title {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.25;
}

.logo-upload__clear {
  color: var(--app-text-muted);
  flex: 0 0 auto;
}

.logo-upload__dropzone {
  align-items: center;
  background: rgba(255, 255, 255, 0.92);
  border: 1.5px dashed rgba(37, 99, 235, 0.24);
  border-radius: 16px;
  color: var(--app-text-muted);
  display: grid;
  min-height: 42px;
  padding: 0 12px;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease;
}

.logo-upload__dropzone:hover {
  border-color: rgba(37, 99, 235, 0.36);
  box-shadow: 0 10px 22px rgba(37, 99, 235, 0.08);
}

.logo-upload__dropzone :deep(.q-field__control) {
  background: transparent;
  border: 0;
  min-height: 42px;
  padding: 0;
}

.logo-upload__dropzone :deep(.q-field__control::before),
.logo-upload__dropzone :deep(.q-field__control::after) {
  display: none;
}

.logo-upload__dropzone :deep(.q-field__native) {
  color: var(--app-text);
  font-weight: 800;
}

.logo-upload__dropzone :deep(.q-field__label) {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.logo-upload__dropzone :deep(.q-icon) {
  color: var(--app-primary);
  flex: 0 0 auto;
}

.logo-upload__file-name {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.feature-toolbar {
  align-items: start;
  background: rgba(248, 250, 252, 0.74);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 12px;
  padding: 12px 14px;
}

.feature-toolbar__meta {
  min-width: 0;
}

.feature-toolbar__title {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.feature-toolbar__subtitle {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
  margin-top: 4px;
}

.feature-toolbar__actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.feature-toolbar__action {
  min-height: 34px;
}

.feature-selected {
  background: rgba(248, 250, 252, 0.74);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: grid;
  gap: 10px;
  margin-bottom: 12px;
  padding: 12px 14px;
}

.feature-selected__header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.feature-selected__title {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.02em;
  text-transform: uppercase;
}

.feature-selected__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.feature-selected__chip {
  max-width: 100%;
}

.feature-selected__empty {
  color: var(--app-text-muted);
  font-size: 11px;
  line-height: 1.45;
}

.feature-toggle {
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 13px;
  color: var(--app-text);
  cursor: pointer;
  display: grid;
  gap: 8px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  min-height: 38px;
  padding: 8px 10px;
  text-align: left;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease,
    color 0.18s ease;
  width: 100%;
}

.feature-toggle:hover {
  background: rgba(37, 99, 235, 0.04);
  border-color: rgba(37, 99, 235, 0.18);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.04);
  transform: translateY(-1px);
}

.feature-toggle--active {
  background: rgba(37, 99, 235, 0.08);
  border-color: rgba(37, 99, 235, 0.22);
  color: var(--app-primary);
  box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.04);
}

.feature-toggle__icon {
  align-items: center;
  background: rgba(37, 99, 235, 0.08);
  border-radius: 10px;
  color: var(--app-primary);
  display: flex;
  height: 28px;
  justify-content: center;
  width: 28px;
}

.feature-toggle__label {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.feature-toggle__check {
  color: var(--app-primary);
  flex: 0 0 auto;
}

.feature-toggle--active .feature-toggle__icon {
  background: rgba(37, 99, 235, 0.14);
}

.review-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.review-header {
  align-items: flex-start;
  display: flex;
  gap: 14px;
  justify-content: space-between;
}

.review-header__copy {
  min-width: 0;
}

.review-header__badge {
  flex: 0 0 auto;
  font-size: 11px;
  font-weight: 800;
  padding: 6px 10px;
}

.review-status {
  align-items: flex-start;
  background: rgba(245, 158, 11, 0.08);
  border: 1px solid rgba(245, 158, 11, 0.16);
  border-radius: 16px;
  color: #a16207;
  display: flex;
  gap: 10px;
  margin-top: 14px;
  padding: 12px 14px;
}

.review-status--ready {
  background: rgba(34, 197, 94, 0.09);
  border-color: rgba(34, 197, 94, 0.16);
  color: var(--app-success);
}

.review-status span {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
}

.review-identity {
  align-items: center;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(255, 255, 255, 0.92)), #fff;
  border: 1px solid rgba(37, 99, 235, 0.12);
  border-radius: 20px;
  display: grid;
  gap: 16px;
  grid-template-columns: auto minmax(0, 1fr) minmax(260px, 0.8fr);
  margin-top: 14px;
  padding: 16px;
}

.review-identity__media {
  align-items: center;
  background:
    radial-gradient(circle at 30% 24%, rgba(255, 255, 255, 0.9), rgba(37, 99, 235, 0.12)),
    linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.06));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 18px;
  color: var(--app-primary);
  display: flex;
  height: 72px;
  justify-content: center;
  overflow: hidden;
  width: 72px;
}

.review-identity__media img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.review-identity__content {
  display: grid;
  gap: 6px;
  min-width: 0;
}

.review-identity__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.review-identity__name {
  color: var(--app-text);
  font-size: 18px;
  font-weight: 850;
  line-height: 1.18;
  overflow-wrap: anywhere;
}

.review-identity__meta {
  color: var(--app-text-muted);
  display: flex;
  flex-wrap: wrap;
  font-size: 12px;
  font-weight: 700;
  gap: 8px;
  line-height: 1.3;
}

.review-identity__meta span + span::before {
  content: '•';
  margin-right: 8px;
}

.review-identity__facts {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.review-identity__fact {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 14px;
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 10px 12px;
}

.review-identity__fact span {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.2;
  text-transform: uppercase;
}

.review-identity__fact strong {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 850;
  line-height: 1.25;
  overflow-wrap: anywhere;
}

.review-card__title {
  align-items: center;
  color: var(--app-text);
  display: flex;
  font-size: 12px;
  font-weight: 800;
  gap: 8px;
  margin-bottom: 12px;
}

.review-card__title .q-icon {
  color: var(--app-primary);
}

.review-card__list {
  display: grid;
  gap: 0;
}

.review-card__row {
  align-items: start;
  display: grid;
  gap: 12px;
  grid-template-columns: minmax(92px, 0.78fr) minmax(0, 1.22fr);
  padding: 9px 0;
}

.review-card__row + .review-card__row {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.review-card__row--stacked {
  grid-template-columns: minmax(0, 1fr);
  gap: 5px;
}

.review-card__list span {
  color: var(--app-text-muted);
  font-size: 11px;
  font-weight: 750;
  line-height: 1.35;
}

.review-card__list strong {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 800;
  line-height: 1.4;
  overflow-wrap: anywhere;
  text-align: right;
}

.review-card__row--stacked strong {
  text-align: left;
}

.wizard-footer {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}

.wizard-footer__actions {
  display: flex;
  gap: 10px;
}

.footer-btn {
  border-radius: 12px;
  min-height: 40px;
  padding-inline: 14px;
}

.footer-btn--ghost {
  color: var(--app-text-muted);
}

.footer-btn--primary {
  min-width: 160px;
}

.wizard-aside {
  min-width: 0;
}

.summary-panel {
  position: sticky;
  top: 18px;
}

.summary-panel__section {
  display: grid;
}

.summary-panel__kicker {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.summary-panel__subtitle {
  color: var(--app-text-muted);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}

.summary-identity {
  align-items: center;
  display: flex;
  gap: 14px;
}

.summary-identity__media {
  align-items: center;
  background:
    radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.86), rgba(37, 99, 235, 0.12)),
    linear-gradient(180deg, rgba(37, 99, 235, 0.16), rgba(37, 99, 235, 0.06));
  border: 1px solid rgba(37, 99, 235, 0.14);
  border-radius: 18px;
  color: var(--app-primary);
  display: inline-flex;
  flex: 0 0 68px;
  height: 68px;
  justify-content: center;
  overflow: hidden;
  width: 68px;
}

.summary-identity__media img {
  display: block;
  height: 100%;
  object-fit: cover;
  width: 100%;
}

.summary-identity__copy {
  align-content: center;
  display: grid;
  gap: 7px;
  min-width: 0;
}

.summary-identity__name {
  color: var(--app-text);
  font-size: 15px;
  font-weight: 800;
  line-height: 1.2;
  overflow-wrap: anywhere;
}

.summary-identity__type {
  color: var(--app-text-muted);
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
}

.summary-identity-list {
  background: rgba(248, 250, 252, 0.76);
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: grid;
  overflow: hidden;
}

.summary-identity-row {
  align-items: start;
  display: grid;
  gap: 10px;
  grid-template-columns: minmax(74px, 0.7fr) minmax(0, 1.3fr);
  padding: 12px 14px;
}

.summary-identity-row + .summary-identity-row {
  border-top: 1px solid rgba(15, 23, 42, 0.06);
}

.summary-identity-row span {
  color: var(--app-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.04em;
  line-height: 1.3;
  text-transform: uppercase;
}

.summary-identity-row strong {
  color: var(--app-text);
  font-size: 12px;
  font-weight: 800;
  line-height: 1.35;
  overflow-wrap: anywhere;
  text-align: right;
}

.summary-identity-status {
  align-items: flex-start;
  background: rgba(37, 99, 235, 0.06);
  border: 1px solid rgba(37, 99, 235, 0.1);
  border-radius: 16px;
  color: var(--app-primary);
  display: flex;
  gap: 10px;
  padding: 12px 14px;
}

.summary-identity-status--complete {
  background: rgba(34, 197, 94, 0.09);
  border-color: rgba(34, 197, 94, 0.16);
  color: var(--app-success);
}

.review-error-banner {
  background: rgba(254, 242, 242, 0.96);
  border: 1px solid rgba(239, 68, 68, 0.14);
  color: var(--app-text);
}

.summary-identity-status span {
  color: var(--app-text);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.45;
}

.admin-box {
  align-items: center;
  background: #fff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 16px;
  display: flex;
  gap: 12px;
  padding: 12px;
}

.admin-box--premium {
  background: linear-gradient(180deg, rgba(37, 99, 235, 0.04), rgba(37, 99, 235, 0.01));
}

.admin-box__avatar {
  background: rgba(37, 99, 235, 0.1);
  color: var(--app-primary);
}

.admin-box__copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.admin-box__eyebrow {
  color: var(--app-primary);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-box__name {
  color: var(--app-text);
  font-size: 13px;
  font-weight: 800;
}

.admin-box__meta,
.admin-box__status,
.admin-box__separator {
  color: var(--app-text-muted);
  font-size: 11px;
}

.admin-box__footer {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

@media (max-width: 1120px) {
  .wizard-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .review-identity {
    grid-template-columns: auto minmax(0, 1fr);
  }

  .review-identity__facts {
    grid-column: 1 / -1;
  }

  .summary-panel {
    position: static;
  }
}

@media (max-width: 720px) {
  .new-condo-page {
    padding: 12px 0 0;
  }

  .page-header {
    align-items: start;
    flex-direction: column;
  }

  .step-grid,
  .review-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .review-header {
    flex-direction: column;
  }

  .review-header__badge {
    align-self: flex-start;
  }

  .review-identity {
    align-items: stretch;
    grid-template-columns: minmax(0, 1fr);
  }

  .review-identity__media {
    height: 64px;
    width: 64px;
  }

  .review-identity__facts {
    grid-template-columns: minmax(0, 1fr);
  }

  .location-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .config-layout,
  .admin-layout {
    grid-template-columns: minmax(0, 1fr);
  }

  .step-field--full,
  .step-field--status {
    grid-column: auto;
  }

  .feature-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .feature-toolbar {
    flex-direction: column;
  }

  .feature-toolbar__actions {
    justify-content: flex-start;
    width: 100%;
  }

  .field-group {
    padding: 14px;
  }

  .map-placeholder__top,
  .logo-upload {
    grid-template-columns: minmax(0, 1fr);
  }

  .map-preview__top {
    align-items: start;
    flex-direction: column;
  }

  .map-placeholder__top {
    align-items: start;
    flex-direction: column;
  }

  .logo-upload__heading {
    align-items: start;
  }

  .toggle-grid--soft {
    padding: 12px 14px;
  }

  .step-panel,
  .review-card :deep(.q-card__section) {
    padding: 16px;
  }

  .wizard-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .wizard-footer__actions {
    flex-direction: column;
  }

  .footer-btn--primary {
    min-width: 0;
    width: 100%;
  }
}
</style>
