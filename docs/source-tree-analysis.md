# 🌳 Analyse de l'Arborescence • Tablely

Cette vue d'ensemble détaille la structure organisationnelle du **Monorepo Tablely**, conçu pour la robustesse et la scalabilité via Turborepo et PNPM Workspaces.

---

## 📂 Structure Globale du Repository

```text
tablely/
├── apps/
│   ├── web/                 # Application Next.js 16 (cœur de la plateforme)
│   └── e2e/                 # Tests Playwright (E2E + tests unitaires)
│
├── packages/
│   ├── ui/                  # Design System : Tailwind CSS v4 + Shadcn/Radix UI
│   ├── supabase/            # Factory-clients Supabase & types d'accès
│   ├── features/            # Logique métier partagée (RBAC, permissions)
│   ├── i18n/                # Framework de traduction i18next (FR/EN)
│   ├── next/                # Infrastructure Next.js : enhanceAction, middlewares
│   └── shared/              # Utilitaires TypeScript transverses
│
├── supabase/                # Migrations SQL globales & configuration CLI
├── tooling/                 # Standards partagés (ESLint, Prettier, TypeScript)
├── _bmad/                   # Agents & workflows IA (automatisation projet)
├── turbo.json               # Orchestration des builds (Turborepo)
└── pnpm-workspace.yaml      # Déclaration des workspaces PNPM
```

---

## 🔍 Focus : `apps/web` (Application Principale)

Application Next.js 16 avec App Router, structurée par domaine fonctionnel.

```text
apps/web/
├── app/                         # Routes & Layouts (App Router)
│   ├── (home)/                  # Landing page marketing (public)
│   ├── auth/                    # Authentification (login, signup, callback, confirm)
│   ├── home/                    # Console d'administration (restaurateurs)
│   │   ├── page.tsx             # Dashboard (stats 30j, tendances, top clients)
│   │   ├── booking/             # Gestion des réservations du jour
│   │   ├── restaurants/         # Sélection de l'établissement actif
│   │   └── settings/            # Configuration avancée
│   │       ├── establishments/  # Gestion compte/organisation
│   │       ├── restaurant/      # Infos générales du restaurant
│   │       ├── services/        # Périodes de service (horaires, jours)
│   │       ├── tables/          # Inventaire des tables physiques
│   │       └── team/            # Membres & invitations
│   ├── join/                    # Acceptation d'invitation d'équipe
│   ├── onboarding/              # Création du premier restaurant
│   ├── restaurant/
│   │   └── [slug]/              # Page publique de réservation par restaurant
│   ├── update-password/         # Réinitialisation du mot de passe
│   ├── sitemap.ts               # Sitemap dynamique (tous les restaurants)
│   └── robots.ts                # Règles d'indexation
│
├── components/                  # Composants React locaux à l'app web
│
├── lib/
│   ├── server/                  # Server Actions & helpers serveur
│   │   ├── accounts/
│   │   │   └── queries.ts       # Requêtes profil utilisateur
│   │   └── restaurant/
│   │       ├── restaurant-actions.ts  # Actions CRUD + réservations + dashboard
│   │       ├── team-actions.ts        # Gestion d'équipe & invitations
│   │       ├── auth-actions.ts        # Inscription avec rôle & CAPTCHA
│   │       ├── geocode-actions.ts     # Géocodage Nominatim (adresse ↔ GPS)
│   │       └── restaurant.schema.ts   # Schémas Zod de validation
│   ├── security/
│   │   ├── encryption.ts        # AES-256-GCM (chiffrement notes réservation)
│   │   └── captcha.ts           # Vérification Cloudflare Turnstile
│   ├── i18n/
│   │   └── i18n.server.ts       # Initialisation i18n côté serveur
│   └── database.types.ts        # Types TypeScript générés depuis Supabase
│
├── supabase/
│   └── migrations/              # Fichiers SQL versionnés (YYYYMMDDHHMMSS_*.sql)
│
└── styles/                      # CSS globaux & variables du design system
```

---

## 🔍 Focus : `apps/e2e` (Tests)

```text
apps/e2e/
├── tests/
│   └── unit/                    # Tests unitaires (Playwright, sans navigateur)
│       ├── README.md            # Documentation de la couverture
│       ├── encryption.spec.ts
│       ├── captcha.spec.ts
│       ├── mfa.spec.ts
│       ├── auth-schemas.spec.ts
│       ├── account-schemas.spec.ts
│       ├── restaurant-schemas.spec.ts
│       ├── restaurant-logic.spec.ts
│       ├── shared-utils.spec.ts
│       ├── mailbox.spec.ts
│       ├── next-utils.spec.ts
│       ├── i18n-utils.spec.ts
│       ├── require-user.spec.ts
│       ├── auth-po.spec.ts
│       └── sitemap.spec.ts
└── playwright.config.ts
```

---

## 🔍 Focus : `packages/` (Bibliothèques Partagées)

```text
packages/
│
├── ui/src/
│   ├── shadcn/              # Primitives UI : Button, Dialog, Input, Select...
│   ├── makerkit/            # Composants complexes : Sidebar, DataTable, Stepper...
│   └── lib/                 # Utilitaires de style : cn(), variants
│
├── supabase/src/
│   ├── server-client.ts     # Client serveur (cookies, SSR)
│   ├── server-static-client.ts  # Client statique (sans cookies, pour cache)
│   ├── server-admin-client.ts   # Client admin (service-role, bypass RLS)
│   ├── browser-client.ts    # Client navigateur
│   └── database.ts          # Ré-export des types Database
│
├── next/src/
│   └── actions.ts           # enhanceAction (wrapper validation + auth)
│
├── shared/src/
│   └── utils.ts             # slugify, formatCurrency, formatAddress, isBrowser
│
└── i18n/src/
    └── locales/
        ├── fr/              # common.json, auth.json, restaurant.json, teams.json
        └── en/              # (idem)
```

---

## 🚀 Répertoires Stratégiques Racine

| Répertoire | Rôle |
| :--- | :--- |
| `supabase/` | Migrations SQL globales & configuration Supabase CLI |
| `tooling/` | ESLint, Prettier, TypeScript — standards uniformes entre modules |
| `_bmad/` | Scripts, agents IA et workflows d'automatisation du projet |
| `turbo.json` | Pipeline de build Turborepo (ordre, cache, filtres) |
| `pnpm-workspace.yaml` | Déclaration des workspaces pour la résolution des dépendances |

---
*Dernière mise à jour : 9 Avril 2026*
