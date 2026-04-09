# 🏗️ Architecture Technique • Tablely

Tablely est une SaaS multi-tenant moderne reposant sur **Next.js 16** et **Supabase**, conçue pour maximiser les performances, la sécurité et la scalabilité.

---

## 🏗️ Patterns Fondamentaux

L'ensemble du projet suit un modèle de **Monorepo distribué** orchestré par **Turborepo** et géré via **PNPM Workspaces**.

### ✅ Frontend : Next.js 16 (React 19, App Router)

- **Server Components par défaut** : Rendu côté serveur (SSR) prioritaire pour les performances et le SEO. Les composants client (`'use client'`) sont réservés aux interactions utilisateur.
- **Server Actions** : Toutes les mutations (réservation, équipe, profil) sont centralisées dans `lib/server/`. Elles sont wrappées par `enhanceAction` (`@kit/next/actions`) qui gère automatiquement la validation Zod et l'authentification.
- **Cache stratifié** : Utilisation de `unstable_cache` (Next.js Data Cache) avec des tags de revalidation (`updateTag`) pour les données publiques (profils restaurants, liste restaurants). ISR automatique pour les pages statiques.

### ✅ Backend & Données : Supabase (PostgreSQL 17)

- **Authentification Native** : Supabase Auth avec session gérée via cookies httpOnly (`@supabase/ssr`). Redirection post-auth vers `/home`.
- **Multi-schémas** : `public` (tables métier), `auth` (Supabase), `kit` (utilitaires partagés).
- **Row Level Security (RLS)** : Activé sur toutes les tables sensibles. Chaque tenant est isolé par `account_id`.
- **Vue sécurisée** `restaurant_profiles` : Jointure dénormalisée `restaurants ⟕ accounts` exposée publiquement, évitant d'exposer la table `accounts` directement.
- **RPC SQL** : `get_available_slots` calcule dynamiquement les créneaux en temps réel côté base de données.
- **Realtime (CDC)** : Mécanisme CDC de Supabase pour rafraîchir le dashboard admin instantanément lors de nouvelles réservations.

### ✅ Session Multi-Restaurant (Cookies)

Tablely supporte plusieurs restaurants par compte (organisation). La session active est maintenue via deux cookies httpOnly :

- `active_account_id` — identifie l'organisation active (30 jours)
- `active_restaurant_id` — identifie le restaurant sélectionné (30 jours)

Les helpers `getUserAccount` et `getActiveRestaurant` lisent ces cookies avec fallback automatique sur la première membership disponible.

### ✅ Packages Partagés

| Package | Rôle |
| :--- | :--- |
| `@kit/ui` | Design system (Tailwind CSS v4 + primitives Shadcn/Radix UI) |
| `@kit/supabase` | Factory-clients Supabase (browser, server, static, admin) avec gestion de session unifiée |
| `@kit/next` | Wrapper `enhanceAction`, middlewares Next.js, helpers de cache |
| `@kit/i18n` | Internationalisation (i18next + react-i18next), traductions JSON dans `packages/i18n/src/locales/` |
| `@kit/shared` | Utilitaires TypeScript transverses : `slugify`, `formatCurrency`, `formatAddress`, `isBrowser` |
| `@kit/features` | Logique RBAC et permissions partagées |

---

## 🔐 Architecture de Sécurité

### Chiffrement des Données Sensibles

Les notes de réservation (allergies, informations personnelles) sont chiffrées avant stockage :
- **Algorithme** : AES-256-GCM (authentifié, résistant aux falsifications)
- **Clé** : Dérivée via `scryptSync` depuis `ENCRYPTION_SECRET` + `ENCRYPTION_SALT`
- **Rétrocompatibilité** : Support du format CBC hérité pour les données existantes

### CAPTCHA Anti-Spam (Cloudflare Turnstile)

Activé conditionnellement si `TURNSTILE_SECRET_KEY` est défini :
- **Inscription** (`signUpWithRoleAction`) : validation obligatoire
- **Réservation** (`createReservationAction`) : validation obligatoire pour les requêtes publiques
- Vérification côté serveur via l'API Cloudflare (`/siteverify`)

### CSRF & Headers

Protection CSRF native via `@edge-csrf/nextjs`. Les Server Actions Next.js ajoutent automatiquement des vérifications d'origine.

---

## 🔄 Flux de Vie d'une Réservation

Parcours technique complet d'une réservation public :

```
Client → GET /restaurant/[slug]
         ↓
  getRestaurantBySlugAction (cache 1h)
  → query: restaurant_profiles VIEW (RLS public)
         ↓
  getAvailableSlotsAction
  → RPC: get_available_slots(restaurant_id, date, guest_count)
  → filtre les créneaux passés si date = aujourd'hui
         ↓
  createReservationAction (Server Action, auth: false)
  → 1. Vérification CAPTCHA Turnstile
  → 2. Vérification doublons (email + service + date)
  → 3. Sélection de la table optimale (capacité minimale suffisante)
  → 4. Vérification chevauchements temporels (durée + buffer)
  → 5. Chiffrement des notes (AES-256-GCM)
  → 6. INSERT reservations (via admin client)
  → 7. revalidatePath + updateTag (rafraîchit le dashboard admin)
         ↓
  Dashboard Admin (Realtime)
  → écoute canal Supabase Realtime → update instantané
```

---

## 🌍 Internationalisation (i18n)

Support multilingue **Français / Anglais** :
- Fichiers JSON structurés par namespace dans `packages/i18n/src/locales/`
- Namespaces principaux : `common`, `auth`, `restaurant`, `teams`
- `I18nProvider` encapsule l'application pour la réactivité côté client
- Détection automatique via le middleware Next.js (préférence navigateur)
- `createI18nServerInstance()` pour les traductions dans les Server Actions

---

## 🗺️ Géocodage (Nominatim / OpenStreetMap)

Intégration de la localisation GPS via l'API Nominatim :
- `geocodeAddressAction` : adresse texte → lat/lng + adresse formatée
- `reverseGeocodeAction` : lat/lng → adresse formatée
- `formatAddress` (`@kit/shared/utils`) : normalise les objets adresse Nominatim
- Identifiant requis : `GEOCODING_EMAIL` dans les variables d'environnement

---
*Dernière mise à jour : 9 Avril 2026*
