/**
 * Check if the code is running in a browser environment.
 */
export function isBrowser() {
  return typeof window !== 'undefined';
}

/**
 * @name formatCurrency
 * @description Format the currency based on the currency code
 */
export function formatCurrency(params: {
  currencyCode: string;
  locale: string;
  value: string | number;
}) {
  return new Intl.NumberFormat(params.locale, {
    style: 'currency',
    currency: params.currencyCode,
  }).format(Number(params.value));
}

/**
 * @name slugify
 */
export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // remove accents
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w-]+/g, '') // remove all non-word chars
    .replace(/--+/g, '-') // replace multiple - with single -
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, ''); // trim - from end of text
}

/**
 * @name formatAddress
 * @description Format a Nominatim address object into a human-readable string.
 */
export function formatAddress(addr: {
  house_number?: string;
  road?: string;
  city?: string;
  town?: string;
  village?: string;
  hamlet?: string;
  county?: string;
  country?: string;
} | null | undefined) {
  if (!addr) return '';
  
  const parts = [];
  
  // Format: Numéro Rue
  const street = [addr.house_number, addr.road].filter(Boolean).join(' ');
  if (street) parts.push(street);

  // Ville / Commune
  const city = addr.city || addr.town || addr.village || addr.hamlet;
  if (city) parts.push(city);

  if (addr.county) parts.push(addr.county);
  if (addr.country) parts.push(addr.country);

  return parts.join(', ');
}
