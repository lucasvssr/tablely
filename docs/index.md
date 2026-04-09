# 📚 Documentation Technique • Tablely

Bienvenue dans le centre de documentation de **Tablely**, la plateforme SaaS de gestion de réservations pour restaurateurs.

Ce portail centralise l'architecture, les spécifications techniques et les guides opérationnels du projet.

---

## 🧭 Navigation Rapide

### 📂 Vue d'Ensemble & Structure
- [**Présentation Stakeholders**](./technical_presentation.md) : Dossier de présentation complet pour les non-tech.
- [**Présentation du Projet**](./project-overview.md) : Vision, objectifs métier et fonctionnalités clés.

### 🏗️ Architecture & Données
- [**Architecture Technique**](./architecture.md) : Patterns SSR/Server Actions, sécurité (CAPTCHA, chiffrement), session multi-restaurant, flux de réservation complet.
- [**Modèles de Données**](./data-models.md) : Schéma PostgreSQL (Supabase), politiques RLS, vue `restaurant_profiles`, fonctions SQL.
- [**Contrats d'Interface (API)**](./api-contracts.md) : Catalogue exhaustif des Server Actions et routes HTTP.

### 🍱 Composants & Design
- [**Inventaire des Composants**](./component-inventory.md) : Primitives Shadcn UI et composants Makerkit.
- [**Analyse de l'Arborescence**](./source-tree-analysis.md) : Organisation détaillée du Monorepo avec description fichier par fichier.

### 🚀 Guide de Développement
- [**Guide de Démarrage**](./development-guide.md) : Installation, variables d'environnement, tests unitaires & E2E, gestion Supabase.

---

## 🛠️ Stack Technique

| Couche | Technologie |
| :--- | :--- |
| **Framework UI** | Next.js 16 (React 19) • App Router • Server Components |
| **Langage** | TypeScript (mode strict) |
| **Base de Données** | PostgreSQL 17 (Supabase Cloud) |
| **Authentification** | Supabase Auth • `@supabase/ssr` (cookies httpOnly) |
| **Sécurité** | Row Level Security (RLS) • AES-256-GCM • Cloudflare Turnstile |
| **Styling** | Tailwind CSS v4.1 • Shadcn UI (Radix) |
| **Gestion Monorepo** | Turborepo • PNPM Workspaces |
| **Validation** | Zod • React Hook Form |
| **État & Fetching** | TanStack Query v5 (React Query) |
| **Tests** | Playwright (E2E + unitaires) |
| **i18n** | i18next • react-i18next (FR/EN) |
| **Géocodage** | Nominatim / OpenStreetMap |

---

## 🧪 Couverture de Tests

| Type | Runner | Nombre | Commande |
| :--- | :--- | :--- | :--- |
| Tests unitaires | Playwright | 60 tests | `pnpm --filter web-e2e test:unit` |
| Tests E2E | Playwright (navigateur) | — | `pnpm run test` |

Domaines couverts : schémas Zod, chiffrement AES-256-GCM, CAPTCHA Turnstile, MFA, logique métier, i18n, sitemap, helpers d'authentification.

---

## 📈 État du Projet

- **Version** : `0.4.0`
- **Dernière mise à jour** : 9 Avril 2026
- **Environnement** : Déployé sur Vercel (Frontend) + Supabase Cloud (Backend)

---

> [!NOTE]
> Cette documentation est maintenue par l'assistant IA **Antigravity**. Elle est synchronisée avec l'état actuel du code source. En cas de divergence, le code fait foi.

---
*Tablely © 2026 • Système de gestion de restauration intelligent.*
