export interface CondoOption {
  id: string;
  name: string;
  city: string;
  units: number;
  active: boolean;
}

// Fixture fallback used until the real condominium-switching API is wired into the session store.
export const condoCatalog: CondoOption[] = [
  { id: 'condo-aurora', name: 'Condominio Aurora', city: 'Guayaquil', units: 128, active: true },
  {
    id: 'condo-pacific',
    name: 'Residencial Pacific',
    city: 'Samborondón',
    units: 94,
    active: true,
  },
  { id: 'condo-verde', name: 'Torres del Verde', city: 'Quito', units: 76, active: true },
  { id: 'condo-marina', name: 'Marina Bay', city: 'Manta', units: 54, active: true },
];
