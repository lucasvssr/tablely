# 🔌 Contrats d'Interface (API) • Tablely

Tablely utilise principalement les **Next.js Server Actions** pour la communication entre le client et le serveur. Cette approche permet une sécurité accrue et une intégration étroite avec le système de types TypeScript.

---

## 🛠️ Actions Serveur (Server Actions)

Les actions sont regroupées par domaine fonctionnel et situées dans `apps/web/lib/server/`.

### 🍽️ Gestion du Restaurant (`restaurant/`)
| Action | Description | Rôle Requis |
| :--- | :--- | :--- |
| `createRestaurantAction` | Initialise un nouveau compte, une organisation et un restaurant. | Tout utilisateur |
| `updateRestaurantAction` | Modifie les informations générales (nom, lieu, téléphone). | `owner`, `admin` |
| `upsertServiceAction` | Crée ou met à jour une période de service (horaires, jours). | `owner`, `admin` |
| `upsertTableAction` | Gère l'inventaire des tables physiques et leur capacité. | `owner`, `admin` |
| `deleteServiceAction` | Supprime définitivement une période de service. | `owner`, `admin` |
| `deleteTableAction` | Supprime une table de l'inventaire. | `owner`, `admin` |

### 📅 Réservations
| Action | Description | Rôle Requis |
| :--- | :--- | :--- |
| `getAvailableSlotsAction` | Calcule les créneaux libres en temps réel (via RPC SQL). | Public |
| `createReservationAction` | Enregistre une nouvelle réservation avec assignation de table. | Public |
| `getDailyReservationsAction` | Récupère la liste des réservations pour une date donnée. | Membre équipe |
| `getUserReservationsAction` | Liste les réservations à venir pour un utilisateur spécifique. | Propriétaire résa |

---

## 📡 Points d'Entrée HTTP (Routes API)

Bien que minoritaires, quelques routes standard sont exposées :

- **`GET /api/auth/callback`** : Gère le retour d'authentification de Supabase.
- **`GET /api/auth/confirm`** : Confirmation d'email/inscription.
- **`GET /api/version`** : Retourne la version actuelle de l'application.

---

## 🛡️ Validation & Sécurité

- **Zod** : Chaque action valide ses données entrantes via des schémas stricts (ex: `ReservationSchema`).
- **CSRF** : Protection native contre les attaques CSRF via `@edge-csrf/nextjs`.
- **RBAC** : Vérification systématique de l'appartenance au compte (`getUserAccount`) et du rôle avant toute modification.

---
*Dernière mise à jour : 6 Mars 2026*
