# 📊 Modèles de Données (Base de Données)

Le projet utilise Supabase (PostgreSQL) avec une architecture multi-tenant. La sécurité est assurée au niveau de la base de données via le **Row Level Security (RLS)**.

## 🗄️ Schéma Global

### Structure du Personnel & Multi-Tenant
- **`accounts`** : Représente le tenant racine (un établissement ou un groupe). C'est le point d'ancrage de toutes les données métier.
  - *Champs clés* : `id`, `name`, `slug`, `public_data` (JSONB).
- **`profiles`** : Profils utilisateurs étendus, liés à `auth.users`.
  - *Champs clés* : `id`, `email`, `display_name`, `role` (`client` ou `restaurateur`), `phone`.
- **`memberships`** : Gère l'accès des profils aux comptes avec des rôles spécifiques.
  - *Rôles* : `owner`, `admin`, `member`.

### Métier du Restaurant
- **`restaurants`** : Points de vente physiques rattachés à un compte.
  - *Champs clés* : `id`, `name`, `location`, `phone`, `account_id`, `lat`, `lng` (Coordonnées GPS), `slug` (URL unique).
- **`services`** : Périodes de service (ex: Déjeuner, Dîner) définissant les règles de réservation.
  - *Champs clés* : `name`, `start_time`, `end_time`, `duration_minutes` (durée par défaut), `buffer_minutes`.
- **`service_operating_days`** : Table de liaison gérant les jours d'ouverture par service (1 = Lundi, 7 = Dimanche).
- **`dining_tables`** : Inventaire des tables physiques.
  - *Champs clés* : `name`, `capacity`, `is_active`.
- **`reservations`** : Gestion des réservations clients.
  - *Champs clés* : `id`, `date`, `start_time`, `guest_count`, `status` (`confirmed`, `cancelled`, etc.), `notes`, `duration_minutes` (Snapshot de la durée du service au moment de la réservation).
  - *Snapshot Client* : `client_name`, `client_email`, `client_phone` (pour garder une trace même si le profil change).

### Support & Système
- **`invitations`** : Gère l'invitation de nouveaux membres administratifs par email.
- **`notification_queue`** : File d'attente pour l'envoi asynchrone d'emails et de rappels.
  - *Champs clés* : `recipient_email`, `type`, `scheduled_for`, `status` (`pending`, `sent`, etc.).

## 🛡️ Sécurité (RLS)

Le RLS est activé sur toutes les tables pour garantir l'étanchéité entre les comptes :
- **Accès Public (Lecture)** : Les tables `restaurants`, `services` et `dining_tables` sont lisibles publiquement pour permettre la réservation en ligne.
- **Accès Privé (Personnel)** : L'accès aux `accounts` et `memberships` est réservé aux membres de l'organisation.
- **Modification** : Seuls les utilisateurs avec le rôle `owner` ou `admin` dans `memberships` peuvent modifier la configuration (services, tables, restaurants).
- **Réservations** : L'insertion est libre (public) pour permettre aux clients de réserver, mais la lecture et la modification des listes de réservations sont restreintes au personnel authentifié.

## ⚙️ Fonctions SQL & Procédures

- **`get_available_slots`** : Fonction coeur calculant les créneaux disponibles. Elle croise les tables `services`, `service_operating_days`, `dining_tables` et les `reservations` existantes pour déduire la capacité restante.
- **`handle_new_user`** : Trigger automatique s'exécutant lors d'une inscription (`auth.users`) pour créer le profil correspondant dans `public.profiles`.
- **`is_member_of_account(account_id)`** : Helper SQL vérifiant si l'utilisateur actuel appartient au compte spécifié.
- **`has_role_on_account(account_id, role)`** : Helper SQL vérifiant les privilèges d'un utilisateur.
