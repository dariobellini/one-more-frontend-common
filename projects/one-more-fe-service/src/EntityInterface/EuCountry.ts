export interface EuCountry {
  code: string;
  name: string;
  vatFormat?: string; // Opzionale, per future validazioni
}

export const EU_COUNTRIES: EuCountry[] = [
  { code: 'AT', name: 'Austria', vatFormat: 'ATU99999999' },
  { code: 'BE', name: 'Belgium', vatFormat: 'BE0999999999' },
  { code: 'BG', name: 'Bulgaria', vatFormat: 'BG999999999' },
  { code: 'HR', name: 'Croatia', vatFormat: 'HR99999999999' },
  { code: 'CY', name: 'Cyprus', vatFormat: 'CY99999999L' },
  { code: 'CZ', name: 'CzechRepublic', vatFormat: 'CZ99999999' },
  { code: 'DK', name: 'Denmark', vatFormat: 'DK99999999' },
  { code: 'EE', name: 'Estonia', vatFormat: 'EE999999999' },
  { code: 'FI', name: 'Finland', vatFormat: 'FI99999999' },
  { code: 'FR', name: 'France', vatFormat: 'FRXX999999999' },
  { code: 'DE', name: 'Germany', vatFormat: 'DE999999999' },
  { code: 'GR', name: 'Greece', vatFormat: 'EL999999999' },
  { code: 'HU', name: 'Hungary', vatFormat: 'HU99999999' },
  { code: 'IE', name: 'Ireland', vatFormat: 'IE9S99999L' },
  { code: 'IT', name: 'Italy', vatFormat: 'IT99999999999' },
  { code: 'LV', name: 'Latvia', vatFormat: 'LV99999999999' },
  { code: 'LT', name: 'Lithuania', vatFormat: 'LT999999999' },
  { code: 'LU', name: 'Luxembourg', vatFormat: 'LU99999999' },
  { code: 'MT', name: 'Malta', vatFormat: 'MT99999999' },
  { code: 'NL', name: 'Netherlands', vatFormat: 'NL999999999B99' },
  { code: 'PL', name: 'Poland', vatFormat: 'PL9999999999' },
  { code: 'PT', name: 'Portugal', vatFormat: 'PT999999999' },
  { code: 'RO', name: 'Romania', vatFormat: 'RO999999999' },
  { code: 'SK', name: 'Slovakia', vatFormat: 'SK9999999999' },
  { code: 'SI', name: 'Slovenia', vatFormat: 'SI99999999' },
  { code: 'ES', name: 'Spain', vatFormat: 'ESX9999999X' },
  { code: 'SE', name: 'Sweden', vatFormat: 'SE999999999999' }
];

// Se preferisci un enum tradizionale per i codici:
export enum EuCountryCode {
  AT = 'AT',
  BE = 'BE',
  BG = 'BG',
  HR = 'HR',
  CY = 'CY',
  CZ = 'CZ',
  DK = 'DK',
  EE = 'EE',
  FI = 'FI',
  FR = 'FR',
  DE = 'DE',
  GR = 'GR',
  HU = 'HU',
  IE = 'IE',
  IT = 'IT',
  LV = 'LV',
  LT = 'LT',
  LU = 'LU',
  MT = 'MT',
  NL = 'NL',
  PL = 'PL',
  PT = 'PT',
  RO = 'RO',
  SK = 'SK',
  SI = 'SI',
  ES = 'ES',
  SE = 'SE'
}