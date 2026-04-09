# 🍱 Inventaire des Composants UI • Tablely

La bibliothèque de composants partagés (`packages/ui`) assure une cohérence visuelle parfaite entre toutes les interfaces du projet.

> **Import** : `import { Button, Card, ... } from '@kit/ui';`

---

## 🎨 Design System Fondamental

Le projet utilise **Tailwind CSS v4** et **Radix UI** pour des composants accessibles, performants et composables.

### 🏗️ Primitives de Base (Shadcn UI)

Ces composants se trouvent dans `packages/ui/src/shadcn/`.

| Catégorie | Composants |
| :--- | :--- |
| **Actions** | `Button`, `DropdownMenu`, `Sheet`, `Dialog`, `AlertDialog` |
| **Saisie (Forms)** | `Input`, `Textarea`, `Checkbox`, `RadioGroup`, `Switch`, `Select`, `Form` (React Hook Form) |
| **Feedback** | `Alert`, `Sonner` (toasts), `Skeleton`, `Progress`, `Badge` |
| **Layout** | `Card`, `Table`, `Tabs`, `Separator`, `ScrollArea`, `Accordion` |
| **Navigation** | `Breadcrumb`, `NavigationMenu`, `Sidebar` |
| **Overlay** | `Popover`, `Tooltip`, `HoverCard`, `Command` (palette) |

---

## 🔥 Composants Métier (Makerkit)

Composants complexes conçus pour les interfaces applicatives riches. Situés dans `packages/ui/src/makerkit/`.

### 💼 Interface Dashboard & Navigation

| Composant | Rôle |
| :--- | :--- |
| `AppSidebar` | Navigation principale avec gestion multi-tenant (sélecteur d'établissement) |
| `AppBreadcrumbs` | Fil d'Ariane dynamique basé sur les segments d'URL |
| `DataTable` | Tableau avancé avec tri, filtres et actions par ligne |
| `ImageUploader` | Gestion des uploads d'images (logos, avatars) |
| `Stepper` | Assistant multi-étapes (ex: onboarding restaurant) |
| `IfUserHasPermission` | Rendu conditionnel basé sur le rôle RBAC |

### 🌐 Internationalisation

| Composant | Rôle |
| :--- | :--- |
| `LanguageSelector` | Commutateur de langue (FR/EN) |
| `Trans` | Rendu de traductions complexes avec variables |

---

## 🗺️ Composants Locaux (`apps/web/components/`)

Ces composants sont spécifiques à l'application web principale et ne sont pas réexportés depuis `@kit/ui`.

### Réservation Publique
| Composant | Rôle |
| :--- | :--- |
| `BookingForm` | Formulaire de réservation multi-étapes avec sélection de créneau |
| `SlotPicker` | Sélecteur de créneau temps réel (intègre `getAvailableSlotsAction`) |
| `ReservationCard` | Carte d'affichage d'une réservation existante (avec déchiffrement des notes) |

### Authentication
| Composant | Rôle |
| :--- | :--- |
| `SignUpContainer` | Formulaire d'inscription avec intégration Cloudflare Turnstile CAPTCHA |
| `LoginForm` | Formulaire de connexion avec gestion des erreurs Supabase |

### Dashboard Admin
| Composant | Rôle |
| :--- | :--- |
| `DashboardCharts` | Graphiques Recharts : tendances réservations, couverts, clients |
| `TeamManagement` | Interface d'invitation et de gestion des membres |
| `ServiceForm` | Formulaire de création/édition de période de service |
| `TableForm` | Formulaire de création/édition de table |

---

## 📐 Utilitaires de Style

```ts
// packages/ui/src/lib/utils.ts
import { cn } from '@kit/ui/lib/utils';

// Fusion conditionnelle de classes Tailwind
cn('base-class', isActive && 'active-class', className)
```

### Variables CSS Personnalisées

Les tokens du design system sont définis dans `apps/web/styles/` :

```css
/* Exemple de variables disponibles */
--background, --foreground      /* Couleurs de base */
--primary, --primary-foreground  /* Couleur d'accent principale */
--muted, --muted-foreground      /* Éléments secondaires */
--border, --ring                 /* Bordures et focus */
--radius                         /* Rayon de border-radius global */
```

---

## 🛠️ Utilisation

```tsx
import { Button, Card, Heading, Badge } from '@kit/ui';

export function ExampleComponent() {
  return (
    <Card className="p-6">
      <Heading level={2}>Réservations du jour</Heading>
      <Badge variant="success">12 confirmées</Badge>
      <Button variant="default" size="sm">
        Voir détails
      </Button>
    </Card>
  );
}
```

### Patterns d'Import Recommandés

```tsx
// ✅ Import depuis @kit/ui (composants partagés)
import { Button, Input, Select } from '@kit/ui';

// ✅ Import depuis @kit/ui/shadcn (primitives directes)
import { Dialog, DialogContent, DialogHeader } from '@kit/ui/shadcn/dialog';

// ✅ Composants locaux (web app uniquement)
import { BookingForm } from '~/components/booking-form';
```

---

## 🚀 Extension & Maintenance

L'inventaire suit une approche **"Atomic Design"** :
- **Atoms** : Primitives Shadcn (Button, Input, Badge...)
- **Molecules** : Groupes fonctionnels (Form + Input + Label)
- **Organisms** : Composants métier complexes (BookingForm, TeamManagement)

Pour ajouter un composant Shadcn : `pnpm dlx shadcn@latest add <component> --cwd packages/ui`

---
*Dernière mise à jour : 9 Avril 2026*
