# 🏗️ Architecture Technique • Tablely

Tablely est conçu comme une application multi-modale moderne, s'appuyant sur des bases solides de performance et de sécurité via l'écosystème **Next.js 16 & Supabase**.

---

## 🏗️ Patterns d'Architecture Fondamentaux

L'ensemble de la solution suit un modèle de **Monorepo distribué** orchestré par **Turborepo** et géré via **PNPM Workspaces**.

### ✅ Frontend : Next.js 16 (React 19)
- **App Router & Server Components** : Priorité au rendu côté serveur (SSR) pour optimiser les performances et le SEO.
- **Server Actions** : Toutes les mutations (réservation, équipe, profil) sont centralisées dans `lib/server/` pour une sécurité et une robustesse accrues.
- **Validation bout-en-bout** : Utilisation de **Zod** pour valider les données et garantir l'intégrité des échanges entre le client et le serveur.

### ✅ Backend & Données : Supabase (PostgreSQL 17)
- **Authentification Native** : Intégration de Supabase Auth avec redirection post-auth vers le dashboard restaurateur.
- **Schémas de Base de Données** : Utilisation de plusieurs schémas PostgreSQL pour séparer les responsabilités (`public`, `kit`, `auth`).
- **Gouvernance de Sécurité** : Mise en œuvre du **Row Level Security (RLS)** sur toutes les tables sensibles pour garantir une isolation multi-tenant stricte.
- **Realtime (CDC)** : Utilisation des mécanismes de CDC (Change Data Capture) de Supabase pour synchroniser le dashboard admin lors de nouvelles réservations clients.

### ✅ Shared Libraries & Packages
- **`@kit/ui`** : Système de design basé sur **Tailwind CSS v4**, injectant des primitives Shadcn UI et des composants Makerkit.
- **`@kit/supabase`** : Factory-client centralisée pour gérer les instances Supabase (browser, server, middleware, service-role) avec gestion unifiée de la session.
- **`@kit/i18n`** : Gestion internationale s'appuyant sur `i18next` et `react-i18next`, avec des traductions partagées dans `packages/i18n`.

---

## 🔄 Flux de Vie d'une Réservation

Voici le parcours technique type d'une réservation sur Tablely :

1. **Intention Client** : Le client visite la page `/restaurant/[slug]`. 
2. **Découverte (GET)** : Appel à la fonction SQL `get_available_slots` (via client Supabase anonyme) pour afficher les créneaux disponibles en fonction de la capacité et du service.
3. **Validation & Action (POST)** : Soumission d'une **Server Action**, validation via Zod, et insertion dans `public.reservations`. 
4. **Persistance & Notification** : Insertion sécurisée via RLS. Déclenchement d'un événement `INSERT` dans le bus Realtime de Supabase et ajout d'une tâche dans la file `public.notification_queue` pour l'envoi d'emails.
5. **Mise à jour Admin** : Le dashboard du restaurateur (en écoute sur le canal Realtime) se rafraîchit instantanément pour afficher la nouvelle demande.

---

## 🌍 Langues & Internationalisation

Le support multi-langue (Français, Anglais) est implémenté via :
- Des fichiers JSON structurés par espace de nom (namespaces) situés dans `packages/i18n/src/locales`.
- Un **I18nProvider** encapsulant l'application pour une réactivité fluide.
- Une détection automatique via middleware Next.js pour servir la langue préférée de l'utilisateur.

---
*Dernière mise à jour : 26 Mars 2026*
