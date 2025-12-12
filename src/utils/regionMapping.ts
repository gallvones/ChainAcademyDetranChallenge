// Mapeamento de UF para Região conforme tabela de gerentes
export const UF_TO_REGION: Record<string, string> = {
  // Região Norte
  AC: 'Norte',
  AP: 'Norte',
  AM: 'Norte',
  PA: 'Norte',
  RO: 'Norte',
  RR: 'Norte',
  TO: 'Norte',

  // Região Nordeste
  AL: 'Nordeste',
  BA: 'Nordeste',
  CE: 'Nordeste',
  MA: 'Nordeste',
  PB: 'Nordeste',
  PE: 'Nordeste',
  PI: 'Nordeste',
  RN: 'Nordeste',
  SE: 'Nordeste',

  // Região Centro-Oeste
  DF: 'Centro-Oeste',
  GO: 'Centro-Oeste',
  MT: 'Centro-Oeste',
  MS: 'Centro-Oeste',

  // Região Sudeste
  ES: 'Sudeste',
  MG: 'Sudeste',
  RJ: 'Sudeste',
  SP: 'Sudeste',

  // Região Sul
  PR: 'Sul',
  RS: 'Sul',
  SC: 'Sul',
};

// Mapeamento de Região para lista de UFs
export const REGION_TO_UFS: Record<string, string[]> = {
  Norte: ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  Nordeste: ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
  Sudeste: ['ES', 'MG', 'RJ', 'SP'],
  Sul: ['PR', 'RS', 'SC'],
};

/**
 * Verifica se uma UF pertence a uma determinada região
 */
export function ufBelongsToRegion(uf: string, region: string): boolean {
  const normalizedUf = uf?.toUpperCase();
  const ufRegion = UF_TO_REGION[normalizedUf];
  return ufRegion === region;
}

/**
 * Obtém a região de uma UF
 */
export function getRegionByUf(uf: string): string | undefined {
  const normalizedUf = uf?.toUpperCase();
  return UF_TO_REGION[normalizedUf];
}

/**
 * Obtém todas as UFs de uma região
 */
export function getUfsByRegion(region: string): string[] {
  return REGION_TO_UFS[region] || [];
}
