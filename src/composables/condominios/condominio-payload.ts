import type { CreateCondominiumPayload } from '@/services/condominiums.service';

export interface CondominiumFormData {
  name: string;
  ruc: string;
  type: string;
  description: string;
  status: string;
  email: string;
  phone: string;
}

export interface CondominiumLocationData {
  countryCode: string;
  provinceId: number | null;
  cityId: number | null;
  address: string;
  reference: string;
}

export interface CondominiumConfigData {
  currency: string;
  towers: string;
  houses: string;
  totalUnits: string;
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
  // The wizard no longer collects an administrator during creation or editing.
  // Kept optional so this builder can still be reused by a future standalone
  // "add administrator" flow without changing its shape.
  administrator?: CondominiumAdministratorData;
}

export function buildCondominiumPayload(
  { form, location, config, administrator }: CondominiumWizardInput,
  options: { includeAdministrator?: boolean } = {},
): CreateCondominiumPayload {
  const includeAdministrator = options.includeAdministrator ?? true;
  const admin = includeAdministrator ? administrator : undefined;

  return {
    name: form.name.trim(),
    ruc: form.ruc.trim(),
    type: form.type.trim(),
    description: form.description.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    countryCode: location.countryCode,
    provinceId: location.provinceId,
    cityId: location.cityId,
    address: location.address.trim(),
    reference: location.reference.trim(),
    latitude: null,
    longitude: null,
    currency: config.currency,
    towers: config.towers,
    houses: config.houses,
    totalUnits: config.totalUnits,
    isActive: form.status === 'Activo',
    characteristics: [...config.characteristics],
    adminName: admin?.name.trim() ?? '',
    adminLastName: admin?.lastName.trim() ?? '',
    adminDocumentType: admin?.documentType.trim() ?? '',
    adminIdNumber: admin?.idNumber.trim() ?? '',
    adminEmail: admin?.email.trim() ?? '',
    adminPhone: admin?.phone.trim() ?? '',
    adminStatus: admin?.status ?? '',
    logo: config.logo,
  };
}
