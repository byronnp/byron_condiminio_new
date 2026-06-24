import type { CreateCondominiumPayload } from '@/services/condominiums.service';

export interface CondominiumFormData {
  name: string;
  ruc: string;
  type: string;
  description: string;
  status: string;
}

export interface CondominiumLocationData {
  countryCode: string;
  provinceId: number | null;
  cityId: number | null;
  direction: string;
  reference: string;
}

export interface CondominiumConfigData {
  currency: string;
  towers: string;
  houses: string;
  logo: File | null;
  characteristics: number[];
}

export interface CondominiumAdministratorData {
  name: string;
  lastName: string;
  documentType: string;
  idNumber: string;
  email: string;
  phone: string;
  status: string;
}

export interface CondominiumWizardInput {
  form: CondominiumFormData;
  location: CondominiumLocationData;
  config: CondominiumConfigData;
  administrator: CondominiumAdministratorData;
}

export function buildCondominiumPayload({
  form,
  location,
  config,
  administrator,
}: CondominiumWizardInput, options: { includeAdministrator?: boolean } = {}): CreateCondominiumPayload {
  const includeAdministrator = options.includeAdministrator ?? true;

  return {
    name: form.name.trim(),
    ruc: form.ruc.trim(),
    type: form.type.trim(),
    description: form.description.trim(),
    status: form.status,
    countryCode: location.countryCode,
    provinceId: location.provinceId,
    cityId: location.cityId,
    direction: location.direction.trim(),
    reference: location.reference.trim(),
    latitude: null,
    longitude: null,
    currency: config.currency,
    towers: config.towers,
    houses: config.houses,
    characteristics: [...config.characteristics],
    adminName: includeAdministrator ? administrator.name.trim() : '',
    adminLastName: includeAdministrator ? administrator.lastName.trim() : '',
    adminDocumentType: includeAdministrator ? administrator.documentType.trim() : '',
    adminIdNumber: includeAdministrator ? administrator.idNumber.trim() : '',
    adminEmail: includeAdministrator ? administrator.email.trim() : '',
    adminPhone: includeAdministrator ? administrator.phone.trim() : '',
    adminStatus: includeAdministrator ? administrator.status : '',
    logo: config.logo,
  };
}
