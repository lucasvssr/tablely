# 🌳 Analyse de l'Arborescence • Tablely

Cette vue d'ensemble détaille la structure organisationnelle du projet Tablely, un **Monorepo** moderne conçu pour la robustesse et la scalabilité.

---

## 📂 Structure Globale du Repository

Le projet suit une logique de séparation des applications (Apps) et de la logique métier (Packages).

```text
Tablely/
├── apps/
│   ├── web/                 # Application Next.js 15 (Cœur de la plateforme)
│   └── e2e/                 # Suites de tests critiques (Playwright)
├── packages/
│   ├── ui/                  # Design System & Composants Radix/Shadcn
│   ├── supabase/            # Factory Client Supabase & types d'accès
│   ├── features/            # Logique métier partagée (RBAC, permissions)
│   ├── i18n/                # Framework de traduction (i18next)
│   ├── next/                # Infrastructure & Middlewares Next.js
│   └── shared/              # Utilitaires techniques & types TypeScript
├── supabase/                # Migrations SQL globales & configuration CLI
├── tooling/                 # Standards partagés (ESLint, Prettier, TS)
└── turbo.json               # Orchestration des builds (Turborepo)
```

---

## 🔍 Focus Technologique : `apps/web`

C'est l'application principale, structurée autour du **App Router** de Next.js.

```text
apps/web/
├── app/                     # Navigation & Layouts (App Router)
│   ├── (marketing)/         # Landing pages & pages marketing
│   ├── auth/                # Authentification (Login, Signup, Callback)
│   ├── home/                # Console d'administration (Restaurateurs)
│   │   ├── _components/     # Composants métier spécifiques au dashboard
│   │   └── settings/        # Configuration avancée (Services, Tables)
│   └── restaurant/          # Interface de réservation publique
│       └── [slug]/          # Page dynamique par restaurant (Booking)
├── components/              # Librairie de composants locaux (web app)
├── lib/                     # Logique utilitaire & serveur
│   ├── server/              # Server Actions (Mutations DB sécurisées)
│   │   ├── accounts/        # Gestion des profils & organisations
│   │   ├── membership/      # Logique de rôles & accès
│   │   └── restaurant/      # Actions métier (réservation, équipe)
│   └── database.types.ts    # Types schématiques générés (Supabase)
└── supabase/                # Migrations SQL locales & Seed de données
```

---

## 🔍 Focus Technologique : `packages/ui`

Basée sur **Tailwind CSS v4**, cette bibliothèque assure une cohérence visuelle sur toute la plateforme.

```text
packages/ui/
├── src/
│   ├── shadcn/              # Primitives UI (Button, Dialog, etc.)
│   ├── makerkit/            # Composants complexes haute fidélité (Sidebars, Shells)
│   └── lib/                 # Utilitaires de style (cn, variants)
```

---

## 🚀 Autres Répertoires Stratégiques

- **`tooling/`** : Centralise la maintenance des standards de code pour garantir une qualité uniforme entre les modules.
- **`_bmad/`** : Contient les scripts, agents et workflows d'intelligence artificielle pilotant l'automatisation du projet.
- **`supabase/`** : Point d'ancrage de l'infrastructure de données, gérant le cycle de vie des schémas.

---
*Dernière mise à jour : 6 Mars 2026*
*Note : Cette structure est optimisée pour le déploiement sur Vercel et Supabase Cloud.*
