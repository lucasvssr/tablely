# 🔌 Contrats d'Interface (API) • Tablely

Tablely utilise principalement les **Next.js Server Actions** pour toutes les mutations client-serveur. Cette approche co-localisée avec le typage TypeScript garantit sécurité, validation Zod et gestion CSRF nativement.

> **Convention** : Toutes les actions sont dans `apps/web/lib/server/` et utilisent le wrapper `enhanceAction` de `@kit/next/actions`.

---

## 🏗️ Helpers Serveur Internes

Ces fonctions sont utilisées en interne par les actions, pas exposées directement.

| Helper | Description |
| :--- | :--- |
| `getUserAccount(supabase, userId)` | Résout l'`account_id` actif via cookie `active_account_id`, avec fallback sur la première membership. |
| `getActiveMembership(supabase, userId)` | Retourne la membership complète (rôle, restaurant, account) pour l'utilisateur courant. |
| `getActiveRestaurant(supabase, userId)` | Résout le `restaurant_id` actif via cookie `active_restaurant_id`, avec fallback sur la membership ou le premier restaurant du compte. |

---

## 🛠️ Server Actions par Domaine

### 🔐 Authentification (`restaurant/auth-actions.ts`)

| Action | Description | Auth |
| :--- | :--- | :--- |
| `signUpWithRoleAction` | Inscription avec rôle (`client` / `restaurateur`), validation CAPTCHA Turnstile optionnelle, gestion du flux invitation. | ❌ Public |

---

### 🍽️ Gestion du Restaurant (`restaurant/restaurant-actions.ts`)

#### Établissements & Compte

| Action | Description | Rôle Requis |
| :--- | :--- | :--- |
| `createRestaurantAction` | Crée un compte (`accounts`), une membership `owner`, et un restaurant. Définit les cookies de session. | Authentifié |
| `updateRestaurantAction` | Modifie les informations d'un restaurant (nom, lieu, téléphone, coordonnées GPS). | `owner`, `admin` |
| `updateAccountAction` | Modifie le nom d'un compte/établissement. | `owner`, `admin` |
| `deleteRestaurantAction` | Supprime un compte complet et toutes ses données (cascade). Utilise le client admin. | `owner`, `admin` |
| `deleteSingleRestaurantAction` | Supprime un seul restaurant d'un compte (sans supprimer l'organisation). | `owner`, `admin` |

#### Services & Tables

| Action | Description | Rôle Requis |
| :--- | :--- | :--- |
| `upsertServiceAction` | Crée ou met à jour une période de service (horaires, durée, jours d'ouverture). | `owner`, `admin` |
| `deleteServiceAction` | Supprime définitivement une période de service. | `owner`, `admin` |
| `upsertTableAction` | Crée ou met à jour une table physique (nom, capacité, statut actif). | `owner`, `admin` |
| `deleteTableAction` | Supprime une table de l'inventaire. | `owner`, `admin` |

#### Lecture (avec cache `unstable_cache`)

| Action | Description | Auth |
| :--- | :--- | :--- |
| `getServicesAction` | Liste les services du restaurant actif (cache 1h, tag `services-{accountId}`). | Authentifié |
| `getTablesAction` | Liste les tables du restaurant actif (cache 1h, tag `tables-{accountId}`). | Authentifié |
| `getRestaurantBySlugAction` | Récupère le profil complet d'un restaurant via `restaurant_profiles` (vue SQL). Cache 1h. | ❌ Public |
| `getRestaurantsAction` | Liste tous les restaurants publics (carte d'accueil). Cache 1h, tag `restaurants-list`. | ❌ Public |

#### Dashboard & Réservations

| Action | Description | Auth |
| :--- | :--- | :--- |
| `getDashboardStatsAction` | Stats des 30 derniers jours : services, tables, capacité, réservations, tendances, top clients. | Authentifié |
| `getUserRoleAction` | Retourne le rôle de l'utilisateur courant dans son compte actif. | Authentifié |
| `getAvailableSlotsAction` | Calcule les créneaux disponibles via RPC SQL `get_available_slots`. Filtre les créneaux passés (aujourd'hui). | ❌ Public |
| `createReservationAction` | Crée une réservation : validation CAPTCHA → vérification doublons → assignation de table → chiffrement des notes → insertion. | ❌ Public |
| `getUserReservationsAction` | Liste les réservations à venir d'un utilisateur pour un restaurant donné (notes déchiffrées). | Authentifié |
| `getDailyReservationsAction` | Liste toutes les réservations confirmées pour une date donnée (vue admin). | Authentifié |
| `updateReservationAction` | Met à jour une réservation existante (convives, horaire, notes). | Authentifié |
| `cancelReservationAction` | Annule une réservation (passe le statut à `cancelled`). | Authentifié |

---

### 👥 Gestion d'Équipe (`restaurant/team-actions.ts`)

| Action | Description | Auth |
| :--- | :--- | :--- |
| `inviteMemberAction` | Envoie une invitation par email (crée une entrée dans `invitations`). | `owner`, `admin` |
| `deleteInvitationAction` | Supprime une invitation en attente. | `owner`, `admin` |
| `acceptInvitationAction` | Accepte une invitation : vérifie l'email, crée la membership, supprime l'invitation. | Authentifié |
| `signUpViaInvitationAction` | Crée un compte via invitation (admin client, auto-confirmé), crée la membership, connecte l'utilisateur. | ❌ Public |
| `removeMemberAction` | Retire un membre de l'organisation (impossible de se retirer soi-même). | `owner`, `admin` |
| `getTeamMembersAction` | Liste les membres avec profils et restaurant assigné. | Authentifié |
| `getInvitationsAction` | Liste les invitations en attente pour un compte. | Authentifié |

---

### 🗺️ Géocodage (`restaurant/geocode-actions.ts`)

| Action | Description | Auth |
| :--- | :--- | :--- |
| `geocodeAddressAction` | Convertit une adresse texte en coordonnées GPS (lat/lng) via Nominatim (OpenStreetMap). Retourne aussi l'adresse formatée. | Authentifié |
| `reverseGeocodeAction` | Convertit des coordonnées GPS en adresse formatée via Nominatim. | Authentifié |

---

## 📡 Routes HTTP (API Routes Next.js)

| Route | Méthode | Description |
| :--- | :--- | :--- |
| `/api/auth/callback` | `GET` | Gère le retour OAuth/Magic-link Supabase. |
| `/api/auth/confirm` | `GET` | Confirmation d'email et redirection. |
| `/api/version` | `GET` | Retourne la version de l'application. |
| `/robots.txt` | `GET` | Règles d'indexation (robots.ts). |
| `/sitemap.xml` | `GET` | Sitemap dynamique incluant toutes les pages restaurants. |

---

## 🛡️ Modèle de Sécurité

| Mécanisme | Implémentation |
| :--- | :--- |
| **Validation** | `Zod` — chaque action valide ses entrées via des schémas stricts (`restaurant.schema.ts`) |
| **CSRF** | Protection native via `@edge-csrf/nextjs` |
| **RBAC** | `getUserAccount` + vérification de rôle membership avant toute mutation |
| **CAPTCHA** | Cloudflare Turnstile — obligatoire à l'inscription et lors des réservations (si `TURNSTILE_SECRET_KEY` est défini) |
| **Chiffrement** | Notes de réservation chiffrées en AES-256-GCM (`encrypt`/`decrypt` dans `lib/security/encryption.ts`) |
| **RLS** | Row Level Security Supabase — isolation multi-tenant au niveau base de données |

---
*Dernière mise à jour : 9 Avril 2026*
