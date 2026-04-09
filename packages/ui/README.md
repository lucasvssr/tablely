# @kit/ui

Ce package est le **Design System** de la plateforme Tablely. Il regroupe les primitives Shadcn UI et les composants Makerkit complexes, garantissant une cohérence visuelle sur toute la plateforme.

## Composants

### Primitives Shadcn UI (`shadcn/`)

Composants accessibles basés sur **Radix UI** et **Tailwind CSS v4**.

```ts
import { Button } from '@kit/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';
import { Input } from '@kit/ui/input';
import { Dialog, DialogContent, DialogHeader } from '@kit/ui/dialog';
```

Composants disponibles : `Button`, `Card`, `Input`, `Textarea`, `Select`, `Dialog`, `AlertDialog`, `Sheet`, `Tabs`, `Table`, `Badge`, `Alert`, `Sonner`, `Skeleton`, `Checkbox`, `Switch`, `RadioGroup`, `Popover`, `Tooltip`, `Command`, `Breadcrumb`, `Accordion`, `Progress`, `Separator`, `ScrollArea`, `NavigationMenu`.

### Composants Makerkit (`makerkit/`)

Composants complexes pour les interfaces applicatives.

```ts
import { PageHeader, PageBody } from '@kit/ui/page';
import { Sidebar } from '@kit/ui/sidebar';
import { DataTable } from '@kit/ui/data-table';
```

## Utilitaires de Style

```ts
import { cn } from '@kit/ui/lib/utils';

// Fusion conditionnelle de classes Tailwind
cn('base-class', isActive && 'active-class', userClassName)
```

## Ajouter un Composant Shadcn UI

```bash
# Depuis la racine du monorepo (recommandé)
pnpm dlx shadcn@latest add <component> --cwd packages/ui

# Exemple
pnpm dlx shadcn@latest add calendar --cwd packages/ui
```

> ⚠️ Utilisez `pnpm dlx` et non `npx` pour rester cohérent avec le gestionnaire de paquets du monorepo.