# 🍱 Inventaire des Composants UI • Tablely

Cette bibliothèque de composants partagés (`packages/ui`) assure une cohérence visuelle parfaite entre les différentes interfaces du projet.

---

## 🎨 Design System Fondamental

Le projet utilise **Tailwind CSS v4** et **Radix UI** pour des composants accessibles et performants.

### 🏗️ Composants de Base (Shadcn UI)
| Catégorie | Composants Clés |
| :--- | :--- |
| **Actions** | `Button`, `Dropdown-Menu`, `Sheet`, `Dialog` |
| **Data Entry** | `Input`, `Checkbox`, `Radio-Group`, `Switch`, `Select` |
| **Feedback** | `Alert-Dialog`, `Alert`, `Sonner`, `Skeleton`, `Progress` |
| **Layout** | `Card`, `Table`, `Tabs`, `Separator`, `Scroll-Area` |
| **Navigation** | `Breadcrumb`, `Navigation-Menu`, `Sidebar` |

---

## 🔥 Composants Métier (Makerkit)

Ces composants complexes sont conçus pour les interfaces applicatives riches et le marketing.

### 💼 Interface Dashboard
- **`Sidebar`** : Navigation principale avec gestion multi-tenant.
- **`App-Breadcrumbs`** : Fil d'Ariane dynamique.
- **`Data-Table`** : Liste avancée avec filtres et actions.
- **`Image-Uploader`** : Gestion des uploads (logos, avatars).
- **`Stepper`** : Assistant multi-étapes.

### 🌐 Internationalisation (i18n)
- **`Language-Selector`** : Commutateur de langue (FR/EN).
- **`Trans`** : Composant de rendu pour les traductions complexes.

---

## 🛠️ Intégration dans le Projet

Les composants sont importés depuis `@kit/ui` et peuvent être étendus localement si nécessaire.

```tsx
import { Button, Card, Heading } from '@kit/ui';

export function MyComponent() {
  return (
    <Card className="p-4">
      <Heading level={2}>Titre de Section</Heading>
      <Button variant="primary">Action</Button>
    </Card>
  );
}
```

---

## 🚀 Mise à jour & Maintenance

L'inventaire est maintenu via une approche "Atomic Design" pour maximiser la réutilisation et minimiser la duplication de code.

---
*Dernière mise à jour : 6 Mars 2026*
