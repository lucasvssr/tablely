# @kit/shared

Utilitaires TypeScript génériques partagés entre toutes les applications et packages du monorepo Tablely.

## Fonctions Disponibles

### `slugify(text: string): string`

Convertit un texte quelconque en slug URL-safe (minuscules, accents supprimés, espaces → tirets).

```ts
import { slugify } from '@kit/shared/utils';

slugify('Le Café de la Paix')  // → 'le-cafe-de-la-paix'
slugify('Hôtel & Spa')         // → 'hotel-spa'
slugify('  Espaces  multiples  ') // → 'espaces-multiples'
```

### `formatCurrency({ value, currencyCode, locale }): string`

Formate une valeur numérique en devise localisée via `Intl.NumberFormat`.

```ts
import { formatCurrency } from '@kit/shared/utils';

formatCurrency({ value: 1234.5, currencyCode: 'EUR', locale: 'fr-FR' })
// → '1 234,50 €'

formatCurrency({ value: 1234.5, currencyCode: 'USD', locale: 'en-US' })
// → '$1,234.50'
```

### `formatAddress(addr: NominatimAddress): string`

Formate un objet adresse retourné par l'API Nominatim (OpenStreetMap) en chaîne lisible.

```ts
import { formatAddress } from '@kit/shared/utils';

formatAddress({
  house_number: '12',
  road: 'Rue de Rivoli',
  city: 'Paris',
  country: 'France'
})
// → '12 Rue de Rivoli, Paris, France'
```

### `isBrowser(): boolean`

Détecte si le code s'exécute dans un environnement navigateur (utile pour les modules isomorphes).

```ts
import { isBrowser } from '@kit/shared/utils';

if (isBrowser()) {
  // Code spécifique au navigateur
}
```

## Couverture de Tests

Toutes les fonctions sont couvertes par des tests unitaires dans `apps/e2e/tests/unit/shared-utils.spec.ts` et `restaurant-logic.spec.ts`.
