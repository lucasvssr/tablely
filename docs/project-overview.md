# 🍽️ Tablely • Présentation du Projet

## 📝 Résumé Exécutif

Tablely est une plateforme SaaS de gestion de réservations et de management pour restaurants, conçue pour maximiser l'efficacité opérationnelle. Elle permet aux restaurateurs de gérer leurs services, leurs tables et leurs réservations en temps réel, tout en offrant une expérience de réservation fluide et sans friction aux clients finaux.

---

## 🛠️ Stack Technique

| Couche | Technologie |
| :--- | :--- |
| **Framework UI** | Next.js 16 (App Router), React 19 |
| **Styling** | Tailwind CSS v4.1, Shadcn UI (Radix UI) |
| **Base de Données** | Supabase (PostgreSQL 17, Auth, Realtime) |
| **Sécurité** | Row Level Security (RLS), AES-256-GCM, Cloudflare Turnstile |
| **Gestion d'État** | TanStack Query v5 |
| **Validation** | Zod & React Hook Form |
| **Tests** | Playwright (60 tests unitaires) |
| **Monorepo** | Turborepo, PNPM Workspaces |
| **Géocodage** | Nominatim / OpenStreetMap |

---

## 🏗️ Architecture du Monorepo

### Applications (`apps/`)
- **`web`** : Cœur technologique Next.js — dashboard admin, pages de réservation publiques, authentification.
- **`e2e`** : Suite de tests Playwright (unitaires + E2E).

### Packages Noyaux (`packages/`)

| Package | Rôle |
| :--- | :--- |
| `@kit/ui` | Système de design : Tailwind v4 + primitives Shadcn/Makerkit |
| `@kit/supabase` | Factory-clients Supabase (browser, server, admin, static) |
| `@kit/features` | Logique métier transverse (permissions, rôles RBAC) |
| `@kit/i18n` | Framework de traduction multi-langue (FR/EN) |
| `@kit/next` | Middlewares et `enhanceAction` (wrapper Server Actions) |
| `@kit/shared` | Utilitaires TypeScript génériques (`slugify`, `formatCurrency`, `formatAddress`) |

---

## 🚀 Fonctionnalités Stratégiques

### 1. Multi-Tenancy (Accounts)
Isolation totale des données par établissement ou groupe. Chaque `account` peut gérer plusieurs restaurants, avec une session active mémorisée par cookies (`active_account_id`, `active_restaurant_id`).

### 2. Gestion Dynamique des Services
Planification flexible des périodes de service (Déjeuner, Dîner, Brunch) avec horaires, durées, buffers et jours d'ouverture configurables par restaurant.

### 3. Optimisation des Tables
Inventaire physique des tables avec capacité et statut actif/inactif. L'algorithme de réservation sélectionne automatiquement la table de capacité minimale suffisante pour éviter le gaspillage.

### 4. Dashboard Analytique Temps Réel
- Stats sur les 30 derniers jours : réservations, couverts, clients uniques
- Tendances graphiques (Recharts) pour visualiser la croissance
- Top 10 clients par nombre de réservations
- Vue des réservations du jour avec mise à jour via Supabase Realtime

### 5. Réservation en Ligne (Interface Publique)
Page `/restaurant/[slug]` accessible sans compte. Sélection de date, créneau (calculé par RPC SQL), formulaire de réservation avec protection CAPTCHA. Confirmation instantanée de la disponibilité.

### 6. Gestion d'Équipe (RBAC)
Rôles : `owner`, `admin`, `member`. Invitation par email avec acceptation via lien. Possibilité de restreindre un membre à un seul restaurant au sein d'une organisation.

### 7. Sécurité Enterprise
- Chiffrement AES-256-GCM des notes de réservation (allergies, informations sensibles)
- CAPTCHA Cloudflare Turnstile à l'inscription et lors des réservations publiques
- RLS au niveau base de données pour l'isolation stricte des données entre tenants

### 8. Géolocalisation & Cartographie
Coordonnées GPS (lat/lng) des restaurants via Nominatim/OpenStreetMap. Formatage normalisé des adresses pour une présentation cohérente.

### 9. Interface Clients
Les utilisateurs avec rôle `client` bénéficient d'un dashboard dédié : visualisation de leurs réservations à venir et découverte des restaurants disponibles sur la plateforme.

---

## 📂 Organisation Fonctionnelle (Web App)

L'application `web` suit les patterns modernes du **Next.js App Router** :

- **`app/`** : Routes, layouts et composants de page (séparés par groupe de routes)
- **`lib/server/`** : Server Actions — mutations DB sécurisées, validation Zod, calculs de créneaux
- **`lib/security/`** : Chiffrement AES-256-GCM et vérification CAPTCHA
- **`lib/i18n/`** : Helpers d'internationalisation côté serveur
- **`config/`** : Configuration système (paths, métadonnées, feature flags)
- **`supabase/migrations/`** : Gouvernance de la base de données (migrations SQL versionnées)

---
*Dernière mise à jour : 9 Avril 2026*
