# 📊 Modèles de Données • Tablely

Tablely utilise **Supabase (PostgreSQL 17)** avec une architecture multi-tenant où chaque établissement est isolé par `account_id`. La sécurité est assurée au niveau de la base de données via le **Row Level Security (RLS)**.

---

## 🗄️ Schéma Global

### 🏢 Multi-Tenancy & Accès

#### `accounts`
Représente l'organisation racine (un groupe d'établissements). Point d'ancrage de toutes les données métier.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Clé primaire |
| `name` | `text` | Nom de l'organisation |
| `slug` | `text` | Identifiant URL unique |
| `created_by` | `uuid` | Référence à `auth.users` |
| `public_data` | `jsonb` | Données étendues (personnalisation) |

#### `profiles`
Extension des utilisateurs Supabase Auth. Créé automatiquement via trigger `handle_new_user`.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Référence à `auth.users` |
| `email` | `text` | Adresse email |
| `display_name` | `text` | Nom affiché |
| `avatar_url` | `text` | URL de l'avatar |

#### `memberships`
Gère les accès des profils aux comptes avec des rôles spécifiques.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Clé primaire |
| `account_id` | `uuid` | Référence `accounts` |
| `user_id` | `uuid` | Référence `auth.users` |
| `role` | `enum` | `owner`, `admin`, `member` |
| `restaurant_id` | `uuid` | Restaurant spécifique (si membre restreint à un seul lieu) |

---

### 🍽️ Métier du Restaurant

#### `restaurants`
Points de vente physiques rattachés à un compte.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Clé primaire |
| `account_id` | `uuid` | Référence `accounts` |
| `name` | `text` | Nom du restaurant |
| `slug` | `text` | Identifiant URL unique (généré via `slugify` + suffixe aléatoire) |
| `location` | `text` | Adresse textuelle |
| `phone` | `text` | Numéro de téléphone |
| `lat` | `numeric` | Latitude GPS |
| `lng` | `numeric` | Longitude GPS |

#### `services`
Périodes de service définissant plages horaires et règles de réservation.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Clé primaire |
| `account_id` | `uuid` | Référence `accounts` |
| `restaurant_id` | `uuid` | Référence `restaurants` |
| `name` | `text` | Ex : "Déjeuner", "Dîner" |
| `start_time` | `time` | Heure d'ouverture (`HH:MM`) |
| `end_time` | `time` | Heure de fermeture (`HH:MM`) |
| `duration_minutes` | `int` | Durée par défaut d'une réservation (min : 15 min) |
| `buffer_minutes` | `int` | Temps de nettoyage entre réservations |

#### `service_operating_days`
Table de liaison gérant les jours d'ouverture par service.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `service_id` | `uuid` | Référence `services` |
| `day_of_week` | `int` | 1 = Lundi … 7 = Dimanche (ISO 8601) |

#### `dining_tables`
Inventaire des tables physiques.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Clé primaire |
| `account_id` | `uuid` | Référence `accounts` |
| `restaurant_id` | `uuid` | Référence `restaurants` |
| `name` | `text` | Libellé (ex : "Table 5", "Terrasse A") |
| `capacity` | `int` | Nombre max de couverts (min : 1) |
| `is_active` | `boolean` | Exclut la table du calcul de disponibilité si `false` |

#### `reservations`
Gestion des réservations clients.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Clé primaire |
| `account_id` | `uuid` | Référence `accounts` |
| `restaurant_id` | `uuid` | Référence `restaurants` |
| `service_id` | `uuid` | Référence `services` |
| `table_id` | `uuid` | Table assignée |
| `user_id` | `uuid` | Utilisateur (nullable pour réservateurs anonymes) |
| `date` | `date` | Date de la réservation (`YYYY-MM-DD`) |
| `start_time` | `time` | Heure de début (`HH:MM:SS`) |
| `guest_count` | `int` | Nombre de convives |
| `duration_minutes` | `int` | Snapshot de la durée au moment de la création |
| `status` | `enum` | `confirmed`, `cancelled`, `pending`, `no_show` |
| `client_name` | `text` | Snapshot du nom client |
| `client_email` | `text` | Snapshot de l'email client |
| `client_phone` | `text` | Snapshot du téléphone client |
| `notes` | `text` | Notes chiffrées (AES-256-GCM) — incluent allergies |

> **Note** : Les champs `client_*` sont des snapshots intentionnels — ils préservent les données client même si le profil est modifié ou supprimé.

---

### 📨 Support & Système

#### `invitations`
Invitations de nouveaux membres par email.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Clé primaire |
| `account_id` | `uuid` | Compte cible |
| `email` | `text` | Email de l'invité |
| `role` | `enum` | `admin`, `member` |
| `restaurant_id` | `uuid` | Restaurant spécifique (optionnel) |
| `invited_by` | `uuid` | Référence `auth.users` |

#### `notification_queue`
File d'attente pour l'envoi asynchrone d'emails de confirmation et rappels.

| Champ | Type | Description |
| :--- | :--- | :--- |
| `id` | `uuid` | Clé primaire |
| `recipient_email` | `text` | Destinataire |
| `type` | `text` | Type de notification (ex: `reservation_confirmation`) |
| `scheduled_for` | `timestamptz` | Date/heure d'envoi planifiée |
| `status` | `enum` | `pending`, `sent`, `failed` |

---

## 👁️ Vues SQL

#### `restaurant_profiles`
Vue dénormalisée publique (jointure `restaurants ⟕ accounts`) exposée sans RLS restrictif pour les pages publiques.

```sql
-- Colonnes exposées
id, name, location, phone, lat, lng, slug,
account_id, organization_name, organization_slug
```

Utilisée par `getRestaurantBySlugAction` et `getRestaurantsAction` pour éviter d'exposer la table `accounts` directement.

---

## 🛡️ Politiques RLS

| Table | Lecture | Écriture |
| :--- | :--- | :--- |
| `restaurants` | ✅ Public | `owner`, `admin` |
| `services` | ✅ Public | `owner`, `admin` |
| `dining_tables` | ✅ Public | `owner`, `admin` |
| `restaurant_profiles` | ✅ Public | — (vue) |
| `reservations` | Membres du compte | ✅ Public (INSERT) |
| `accounts` | Membres | `owner`, `admin` |
| `memberships` | Membres | `owner`, `admin` |
| `invitations` | Membres | `owner`, `admin` |

---

## ⚙️ Fonctions SQL & Triggers

| Fonction | Description |
| :--- | :--- |
| `get_available_slots(restaurant_id, date, guest_count, user_id?, email?)` | **Cœur de la réservation** — calcule les créneaux disponibles en croisant services, jours d'ouverture, tables et réservations existantes. Retourne `{available, service_id, service_name, slot_time}[]`. |
| `handle_new_user()` | **Trigger** — s'exécute après INSERT dans `auth.users` pour créer automatiquement le profil dans `public.profiles` avec les métadonnées d'inscription. |
| `is_member_of_account(account_id)` | Helper RLS — vérifie si l'utilisateur courant appartient au compte. |
| `has_role_on_account(account_id, role)` | Helper RLS — vérifie les privilèges d'un utilisateur sur un compte. |

---
*Dernière mise à jour : 9 Avril 2026*
