# CHANGELOG

## 0.4.0 (2026-04-09)

### Sécurité
- Intégration **Cloudflare Turnstile CAPTCHA** pour l'inscription (`signUpWithRoleAction`) et les réservations publiques (`createReservationAction`)
- Chiffrement **AES-256-GCM** des notes de réservation (allergies, informations sensibles) avec clé dérivée via `scryptSync`
- Ajout de la vérification MFA côté serveur dans `requireUser`
- Correction de la gestion des erreurs de déchiffrement (rétrocompatibilité format CBC)

### Nouvelles Fonctionnalités
- **Dashboard analytique** : stats sur 30 jours (tendances réservations, couverts, clients uniques, top 10 clients)
- **Géocodage** : intégration Nominatim/OpenStreetMap (`geocodeAddressAction`, `reverseGeocodeAction`, `formatAddress`)
- **Interface client** : les utilisateurs `client` voient leurs réservations à venir et la liste des restaurants dans le dashboard
- **Vue `restaurant_profiles`** : jointure dénormalisée pour les pages publiques sans exposer la table `accounts`
- **Gestion multi-établissements** : session active via cookies `active_account_id` / `active_restaurant_id`
- **Sitemap dynamique** : génération automatique des URLs publiques de tous les restaurants

### Actions Serveur Ajoutées
- `team-actions.ts` : `inviteMemberAction`, `acceptInvitationAction`, `signUpViaInvitationAction`, `removeMemberAction`, `getTeamMembersAction`, `getInvitationsAction`
- `auth-actions.ts` : `signUpWithRoleAction` (inscription avec rôle + CAPTCHA + invitation)
- `geocode-actions.ts` : `geocodeAddressAction`, `reverseGeocodeAction`
- `restaurant-actions.ts` : `updateAccountAction`, `deleteRestaurantAction`, `deleteSingleRestaurantAction`, `getDashboardStatsAction`, `getUserRoleAction`, `cancelReservationAction`, `updateReservationAction`, `getClientReservationsAction`

### Tests Unitaires (60 tests — tous passants)
- `encryption.spec.ts` — Chiffrement AES-256-GCM & rétrocompatibilité CBC
- `captcha.spec.ts` — Vérification Cloudflare Turnstile
- `mfa.spec.ts` — Logique Multi-Factor Authentication
- `restaurant-schemas.spec.ts` — Validation des schémas Zod métier
- `shared-utils.spec.ts` — `formatCurrency`, `isBrowser`, `formatAddress`
- `sitemap.spec.ts` — Génération et validation du sitemap dynamique
- Et 9 autres fichiers de tests (auth, comptes, logique restaurant, mailbox, i18n...)

### Packages Partagés
- `@kit/shared/utils` : ajout de `slugify` et `formatAddress` (extraits pour testabilité)
- `@kit/next/actions` : `enhanceAction` supporte désormais `auth: false` pour les actions publiques

### Documentation
- Refonte complète de 8 fichiers de documentation (README, docs/, tests)
- Mise à jour de l'architecture (sécurité, session multi-restaurant, flux complet)
- Contrats API exhaustifs : ~40 Server Actions documentées

---

## 0.3.0 (2026-03-26)

- Framework mis à jour vers **Next.js 16** (React 19, React Compiler stable, Turbopack)
- Styling mis à jour vers **Tailwind CSS v4.1**
- Ajout de la **Localisation GPS** avec support des coordonnées lat/lng pour les restaurants
- Implémentation de la **file de notification** pour les rappels email automatisés
- Mise à jour complète de la documentation (Architecture, Modèles de Données, Présentation Stakeholders)
- Amélioration de l'isolation multi-tenant et des politiques RLS

## 0.2.0 (2025-02-24)

- Mise à jour des dépendances
- Configuration ESLint v9
- Mise à jour TailwindCSS v4
- Palette de couleurs dark mode moins contrastée
- Adaptation des composants UI au nouveau système d'espacement TailwindCSS v4
- Corrections mineures portées depuis le kit complet

## 0.1.0

- Version initiale du template Next.js Supabase SaaS Kit Lite