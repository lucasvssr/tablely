# 🍽️ Tablely

**La plateforme SaaS de gestion de restaurant et de réservation en ligne.**

Tablely est une solution moderne et haute performance conçue pour les restaurateurs : gestion des réservations en temps réel, tableau de bord analytique, gestion d'équipe multi-tenant, et interface de réservation premium pour les clients.

---

## ✨ Fonctionnalités Clés

- **🎯 Réservations en temps réel** : Confirmation instantanée avec calcul intelligent des créneaux disponibles (RPC SQL).
- **📊 Dashboard Analytique** : Stats des 30 derniers jours (réservations, couverts, tendances), top clients.
- **👥 Gestion d'Équipe** : RBAC granulaire (`owner`, `admin`, `member`) avec invitations par email.
- **🔒 Multi-Tenant** : Isolation stricte par `account_id` avec session multi-restaurant via cookies.
- **🛠️ Configuration Flexible** : Gestion des services (horaires, durées, jours), inventaire des tables.
- **📱 Interface Publique Premium** : Pages de réservation mobiles-first par restaurant (`/restaurant/[slug]`).
- **🔐 Sécurité Enterprise** : Chiffrement AES-256-GCM, CAPTCHA Cloudflare Turnstile, RLS Supabase.
- **📍 Géolocalisation** : Coordonnées GPS des restaurants via Nominatim (OpenStreetMap).
- **🌍 Multi-langue** : Français et Anglais (i18next).

---

## 📚 Documentation

Documentation technique complète dans le répertoire `docs/` :

| Document | Contenu |
| :--- | :--- |
| [**Index**](./docs/index.md) | Point d'entrée de la documentation |
| [**Architecture**](./docs/architecture.md) | Patterns SSR, sécurité, session multi-restaurant, flux de réservation |
| [**Modèles de Données**](./docs/data-models.md) | Schéma PostgreSQL, RLS, vue `restaurant_profiles`, fonctions SQL |
| [**Contrats API**](./docs/api-contracts.md) | Catalogue de toutes les Server Actions et routes HTTP |
| [**Guide de Développement**](./docs/development-guide.md) | Installation, tests, commandes Supabase |
| [**Arborescence**](./docs/source-tree-analysis.md) | Structure détaillée du monorepo |

---

## 🛠️ Stack Technique

| Couche | Technologie |
| :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (React 19, App Router) |
| **Styling** | [Tailwind CSS v4.1](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/) |
| **Base de Données** | [Supabase](https://supabase.com/) (PostgreSQL 17) |
| **Authentification** | Supabase Auth + `@supabase/ssr` |
| **Sécurité** | AES-256-GCM • Cloudflare Turnstile • RLS |
| **State Management** | [TanStack Query v5](https://tanstack.com/query) |
| **Validation** | [Zod](https://github.com/colinhacks/zod) & [React Hook Form](https://react-hook-form.com/) |
| **Tests** | [Playwright](https://playwright.dev/) (60 tests unitaires + E2E) |
| **Monorepo** | [Turborepo](https://turborepo.org/) & [PNPM](https://pnpm.io/) |
| **Langage** | [TypeScript](https://www.typescriptlang.org/) (mode strict) |

---

## 🚀 Démarrage Rapide

### Prérequis

- **Node.js** ≥ 18.18.0 (LTS recommandé)
- **PNPM** 10.x
- Projet [Supabase](https://supabase.com/) configuré

### Installation

```bash
# 1. Cloner
git clone https://github.com/lucasvssr/tablely.git
cd tablely

# 2. Installer les dépendances
pnpm install

# 3. Configurer l'environnement (voir apps/web/.env.example)
cp apps/web/.env.example apps/web/.env.local
# → Remplir les variables Supabase, encryption, CAPTCHA, etc.

# 4. Lancer le serveur de développement
pnpm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

> Voir le [Guide de Développement](./docs/development-guide.md) pour la liste complète des variables d'environnement requises.

---

## 📂 Structure du Projet

```text
apps/
├── web/          # Application Next.js 16 (cœur de la plateforme)
└── e2e/          # Tests Playwright (60 tests unitaires + E2E)

packages/
├── ui/           # Design System (Tailwind v4 + Shadcn UI)
├── supabase/     # Factory-clients Supabase (browser, server, admin, static)
├── features/     # Logique RBAC & permissions partagées
├── next/         # enhanceAction, middlewares Next.js
├── i18n/         # Framework i18next (FR/EN)
└── shared/       # Utilitaires TypeScript (slugify, formatCurrency, formatAddress)

supabase/         # Migrations SQL globales & configuration CLI
tooling/          # ESLint, Prettier, TypeScript (standards partagés)
```

---

## 🧪 Tests

```bash
# Tests unitaires (60 tests, ~10s, sans navigateur)
pnpm --filter web-e2e test:unit

# Tests E2E (Playwright avec navigateur)
pnpm run test

# Vérifications qualité
pnpm run typecheck   # TypeScript strict
pnpm run lint        # ESLint
pnpm run format:fix  # Prettier
```

---

## 📜 Licence

Ce projet est propriétaire. Tous droits réservés.

---

*Built with ❤️ by the Tablely Team.*
