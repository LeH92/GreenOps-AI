/**
 * Format Utilities - Fonctions de formatage consistantes pour éviter les erreurs d'hydratation
 * 
 * Ces fonctions garantissent que le formatage est identique côté serveur et client
 * pour éviter les erreurs d'hydratation React/Next.js
 */

/**
 * Formate un nombre en devise USD de manière consistante
 * @param value - La valeur numérique à formater
 * @returns La valeur formatée en USD (ex: "$1,234")
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formate un nombre avec des décimales de manière consistante
 * @param value - La valeur numérique à formater
 * @param decimals - Nombre de décimales (défaut: 1)
 * @returns La valeur formatée avec décimales (ex: "12.3")
 */
export const formatNumber = (value: number, decimals: number = 1): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formate un nombre entier avec séparateurs de milliers
 * @param value - La valeur numérique à formater
 * @returns La valeur formatée (ex: "1,234")
 */
export const formatInteger = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Formate un pourcentage de manière consistante
 * @param value - La valeur numérique (ex: 0.123 pour 12.3%)
 * @param decimals - Nombre de décimales (défaut: 1)
 * @returns La valeur formatée en pourcentage (ex: "12.3%")
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${formatNumber(value, decimals)}%`;
};

/**
 * Formate une devise avec décimales
 * @param value - La valeur numérique à formater
 * @param decimals - Nombre de décimales (défaut: 2)
 * @returns La valeur formatée en USD avec décimales (ex: "$1,234.56")
 */
export const formatCurrencyWithDecimals = (value: number, decimals: number = 2): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

/**
 * Formate un changement en pourcentage avec signe
 * @param value - La valeur du changement
 * @param decimals - Nombre de décimales (défaut: 1)
 * @returns Le changement formaté avec signe (ex: "+12.3%" ou "-5.2%")
 */
export const formatChangePercentage = (value: number, decimals: number = 1): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${formatNumber(value, decimals)}%`;
};

/**
 * Formate un nombre avec suffixe (K, M, B)
 * @param value - La valeur numérique à formater
 * @returns La valeur formatée avec suffixe (ex: "1.2K", "1.5M")
 */
export const formatWithSuffix = (value: number): string => {
  if (value >= 1000000000) {
    return `${formatNumber(value / 1000000000, 1)}B`;
  } else if (value >= 1000000) {
    return `${formatNumber(value / 1000000, 1)}M`;
  } else if (value >= 1000) {
    return `${formatNumber(value / 1000, 1)}K`;
  }
  return formatInteger(value);
};
