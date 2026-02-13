---
stepsCompleted: [1]
inputDocuments: ['prd.md', 'architecture.md']
---

# Bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Bmad, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Consultation des créneaux disponibles en temps réel (Supabase Realtime).
FR2: Saisie de réservation : Nom, Email, Tel, Couverts, Heure.
FR3: Option de notes spécifiques (Allergies/Demandes) transmises au restaurateur.
FR4: Liste d'attente digitale automatique si le créneau souhaité est complet.
FR5: Annulation autonome sécurisée via lien tokenisé dans l'email.
FR6: Vue centralisée des réservations du jour avec mise à jour instantanée.
FR7: Modification du statut : "Arrivé" ou "No-Show".
FR8: Libération automatique et immédiate de la capacité de salle dès l'annulation ou le signalement No-Show.
FR9: Édition dynamique des réservations (nombre de couverts, heure) en salle.
FR10: Alerte visuelle prioritaire pour les réservations avec notes de "Sécurité" (allergies).
FR11: Wizard d'onboarding : Création restaurant, capacité totale, horaires.
FR12: Génération automatique d'URL unique et QR Code de réservation.
FR13: Gestion de l'équipe (RBAC) : Attribution des rôles Admin vs Staff.
FR14: Paramétrage des délais de grâce No-Show personnalisés par établissement.
FR15: Gestion des dates de fermeture (Blackout Dates) et jours fériés.
FR16: Définition de "Services" distincts (ex: Midi vs Soir) avec capacités variables.
FR17: Email de confirmation instantané et rappel automatique avant service (Resend).
FR18: Notifications Push/Realtime sur le Dashboard lors d'une action client.
FR19: Étanchéité totale des données : Interdiction d'accès aux données d'un autre restaurant.
FR20: Module de suppression de données (Droit à l'oubli) accessible au client.

### NonFunctional Requirements

NFR1: Latence API < 300ms (P95) pour les actions critiques.
NFR2: Propagation temps réel < 500ms entre Client et Restaurateur.
NFR3: Score Lighthouse Performance > 90 sur mobile (LCP < 1.5s).
NFR4: Authentification JWT unifiée via Supabase Auth pour tous les accès Dashboard.
NFR5: Utilisation de UUID v4 pour tous les identifiants exposés (API/URLs).
NFR6: Résilience : Mode "Lecture seule" via cache local (LocalStorage) en cas de déconnexion réseau brève.
NFR7: Circuit Breaker sur les services de notification tiers (Resend).
NFR8: Disponibilité système (Uptime) de 99.9%.
NFR9: Interfaces tactiles optimisées : Cibles minimales de 48x48px pour usage en salle.
NFR10: Contraste minimal WCAG AA (4.5:1) pour la lisibilité sous forte luminosité.

### Additional Requirements

- **Starter Template**: MakerKit Next.js Supabase SaaS Starter Kit (Lite). Commande : `npx -y degit makerkit/nextjs-supabase-saas-kit ./` (Impacte Epic 1 Story 1).
- **Data Model**: Approche "Slot-based". Disponibilité calculée par créneaux pré-générés.
- **Security**: Chiffrement AES-256 (pgsodium ou logique serveur) pour les notes sensibles (`sensitive_notes`).
- **Multitenancy**: Isolation stricte via Row Level Security (RLS) basée sur l'identifiant d'organisation.
- **Real-time**: Supabase Realtime v2.75+ (Channels) pour la synchronisation Dashboard.
- **Infrastructure**: Next.js App Router, Supabase (PostgreSQL 17), Resend (Emails), Stripe (Pénalités - Phase 2).
- **Audit**: Journalisation de toutes les actions Staff sur les données clients.

### FR Coverage Map

FR1: Epic 2 - Consultation créneaux temps réel
FR2: Epic 2 - Saisie réservation
FR3: Epic 2 - Notes spécifiques (allergies)
FR4: Epic 5 - Liste d'attente digitale
FR5: Epic 4 - Annulation autonome sécurisée
FR6: Epic 3 - Vue centralisée réservations jour
FR7: Epic 3 - Statut Arrivé/No-Show
FR8: Epic 5 - Libération automatique capacité
FR9: Epic 3 - Édition dynamique réservations
FR10: Epic 3 - Alerte visuelle allergies
FR11: Epic 1 - Wizard onboarding
FR12: Epic 2 - URL unique & QR Code
FR13: Epic 1 - Gestion équipe (RBAC)
FR14: Epic 5 - Délais de grâce No-Show
FR15: Epic 5 - Blackout dates & fériés
FR16: Epic 1 - Définition des services
FR17: Epic 4 - Emails confirmation & rappels
FR18: Epic 3/4 - Notifications Push/Realtime
FR19: Epic 1 - Étanchéité multi-tenant
FR20: Epic 6 - Suppression données (RGPD)

## Epic List

## Epic 1: Fondations SaaS & Onboarding Restaurateur
Thomas peut créer son compte, configurer son restaurant (nom, capacité, horaires) et définir ses services de restauration tout en garantissant l'étanchéité de ses données.

**FRs covered:** FR11, FR13, FR16, FR19

### Story 1.1: Initialisation du Projet & Boilerplate
As a développeur,
I want initialiser le projet avec le template MakerKit Lite,
So that disposer des fondations SaaS (Auth, Organisations, UI) immédiatement.

**Acceptance Criteria:**

**Given** un environnement vide
**When** j'exécute la commande `npx degit makerkit/nextjs-supabase-saas-kit ./`
**Then** la structure de dossiers définie dans l'architecture est présente
**And** le projet compile sans erreur avec `npm run dev`.

### Story 1.2: Configuration du Restaurant (Wizard d'Onboarding)
As a restaurateur (Thomas),
I want saisir le nom, la localisation et la capacité de mon établissement,
So that commencer à recevoir des réservations.

**Acceptance Criteria:**

**Given** un compte Thomas nouvellement créé
**When** je remplis le formulaire d'onboarding (FR11)
**Then** une nouvelle organisation est créée dans Supabase
**And** les paramètres du restaurant sont persistés avec un UUID unique (NFR5).

### Story 1.3: Définition des Services (Midi/Soir)
As a restaurateur (Thomas),
I want définir mes plages horaires (ex: 12h-14h30) et mes capacités par service,
So that limiter automatiquement le nombre de réservations.

**Acceptance Criteria:**

**Given** le dashboard de configuration (FR16)
**When** j'ajoute un service avec ses horaires et sa capacité
**Then** le système génère les créneaux (slots) correspondants dans la base de données.

### Story 1.4: Gestion d'Équipe (Staff & Roles)
As a restaurateur Admin,
I want inviter mon équipe et leur assigner des rôles (Admin/Staff),
So that sécuriser l'accès aux données.

**Acceptance Criteria:**

**Given** l'interface de gestion d'équipe (FR13)
**When** j'invite un collaborateur par email
**Then** il reçoit une invitation et ses permissions sont limitées par son rôle via le RBAC (NFR4).

## Epic 2: Moteur de Réservation Client (Julie)
Julie peut accéder à l'URL unique du restaurant, consulter les créneaux réellement disponibles en temps réel et confirmer sa réservation avec ses préférences.

**FRs covered:** FR1, FR2, FR3, FR12

### Story 2.1: Page de Réservation Publique (Landing)
As a cliente (Julie),
I want accéder à une page web dédiée via un QR Code ou une URL unique,
So that voir si je peux manger dans mon restaurant préféré ce soir.

**Acceptance Criteria:**

**Given** l'URL unique générée pour un restaurant (FR12)
**When** je visite la page
**Then** le nom du restaurant et son identité visuelle sont affichés
**And** la page est optimisée pour mobile (NFR9, NFR10).

### Story 2.2: Consultation des Créneaux en Temps Réel
As a cliente (Julie),
I want voir instantanément les créneaux horaires disponibles pour le nombre de couverts souhaité,
So that ne pas perdre de temps à appeler.

**Acceptance Criteria:**

**Given** le sélecteur de date et de couverts (FR1)
**When** je sélectionne mes critères
**Then** seuls les créneaux ("slots") ayant une capacité suffisante sont affichés
**And** l'affichage se met à jour en moins de 500ms grâce à Supabase Realtime (NFR2).

### Story 2.3: Saisie & Validation de la Réservation
As a cliente (Julie),
I want saisir mes coordonnées et mes éventuelles allergies,
So that finaliser ma réservation et d'être rappelée au restaurateur.

**Acceptance Criteria:**

**Given** un créneau sélectionné (FR2, FR3)
**When** je soumets le formulaire avec Nom, Email, Tel et Notes
**Then** la réservation est créée dans Supabase avec le statut "Confirmé"
**And** les notes sensibles (allergies) sont chiffrées en AES-256 avant stockage (Architecture).

## Epic 3: Dashboard de Gestion "Live" (Thomas)
Thomas gère sa salle en temps réel grâce à une vue centralisée : il suit les arrivées, signale les no-shows et reçoit des alertes visuelles pour les clients à risque (allergies).

**FRs covered:** FR6, FR7, FR9, FR10, FR18

### Story 3.1: Vue Centralisée des Réservations du Jour
As a restaurateur (Thomas),
I want voir la liste complète des réservations prévues pour aujourd'hui,
So that préparer mon service et l'accueil des clients.

**Acceptance Criteria:**

**Given** le Dashboard restaurateur (FR6)
**When** je me connecte
**Then** toutes les réservations du jour sont listées (Nom, Couverts, Heure)
**And** la liste se met à jour instantanément lors d'une nouvelle réservation Julie (FR18, NFR2).

### Story 3.2: Mise à Jour du Statut (Arrivé / No-Show)
As a restaurateur (Thomas),
I want marquer un client comme "Arrivé" ou "No-Show" en un clic,
So that suivre l'état de ma salle en temps réel.

**Acceptance Criteria:**

**Given** une réservation dans la liste (FR7)
**When** je sélectionne "Arrivé" ou "No-Show"
**Then** le statut est persisté dans Supabase et l'interface reflète immédiatement le changement.

### Story 3.3: Alertes Visuelles Prioritaires (Allergies)
As a restaurateur (Thomas),
I want que les réservations comportant des notes de sécurité (allergies) soient mises en évidence,
So that garantir la sécurité de mes clients.

**Acceptance Criteria:**

**Given** une réservation avec des notes sensibles (FR10)
**When** elle s'affiche sur le dashboard
**Then** un indicateur visuel prioritaire est visible immédiatement
**And** les notes sont déchiffrées pour lecture (Architecture).

### Story 3.4: Édition Dynamique en Salle
As a restaurateur (Thomas),
I want pouvoir modifier le nombre de couverts ou l'heure d'une réservation existante depuis mon dashboard,
So that m'adapter aux imprévus.

**Acceptance Criteria:**

**Given** une réservation confirmée (FR9)
**When** je modifie les détails (couverts/heure)
**Then** les changements sont enregistrés et la capacité globale (slots) est recalculée.

## Epic 4: Automatisation des Comms & Annulations
Julie reçoit ses confirmations et rappels par email. Elle peut annuler sa venue en un clic, ce qui notifie instantanément Thomas sur son dashboard.

**FRs covered:** FR5, FR17, FR18

### Story 4.1: Emails de Confirmation & Rappels Automatiques
As a cliente (Julie),
I want recevoir un email de confirmation immédiat et un rappel avant le service,
So that être rassurée sur ma réservation et de ne pas l'oublier.

**Acceptance Criteria:**

**Given** une réservation confirmée (FR17)
**When** la réservation est créée ou que le délai de rappel est atteint
**Then** un email est envoyé via Resend avec les détails du restaurant
**And** le système utilise un Circuit Breaker pour gérer les pannes éventuelles de Resend (NFR7).

### Story 4.2: Annulation Autonome (Lien Tokenisé)
As a cliente (Julie),
I want pouvoir annuler ma réservation en un clic depuis mon email,
So that libérer ma table facilement si j'ai un empêchement.

**Acceptance Criteria:**

**Given** l'email de confirmation (FR5)
**When** je clique sur le lien d'annulation unique (UUID tokenisé)
**Then** mon statut passe à "Annulé" dans la base de données sans authentification requise
**And** une page de confirmation d'annulation s'affiche.

### Story 4.3: Notification d'Annulation en Temps Réel
As a restaurateur (Thomas),
I want être immédiatement notifié sur mon dashboard lorsqu'une Julie annule sa table,
So that réajuster mon plan de salle.

**Acceptance Criteria:**

**Given** le Dashboard ouvert (FR18)
**When** une annulation survient (via Julie ou API)
**Then** une notification toast ou sonore apparaît
**And** la liste des réservations se met à jour instantanément.

## Epic 5: Configuration Avancée & Résilience
Thomas peut gérer les exceptions (fermetures, délais de grâce) et le système gère automatiquement la liste d'attente et la libération de capacité.

**FRs covered:** FR4, FR8, FR14, FR15

### Story 5.1: Gestion des Dates de Fermeture (Blackout)
As a restaurateur (Thomas),
I want définir des dates ou périodes de fermeture (congés, travaux),
So that bloquer automatiquement toute réservation sur ces créneaux.

**Acceptance Criteria:**

**Given** l'interface de calendrier (FR15)
**When** je sélectionne une ou plusieurs dates de fermeture
**Then** aucun créneau (slot) n'est généré ou disponible pour Julie sur ces dates
**And** les réservations existantes éventuelles sont marquées pour alerte.

### Story 5.2: Liste d'Attente Digitale Automatique
As a cliente (Julie),
I want pouvoir m'inscrire sur une liste d'attente si mon créneau est complet,
So that être sollicitée en priorité si une table se libère.

**Acceptance Criteria:**

**Given** un créneau affiché comme "Complet" (FR4)
**When** Julie choisit l'option "Liste d'attente"
**Then** ses coordonnées sont enregistrées dans une file d'attente prioritaire liée au service.

### Story 5.3: Libération de Capacité & Délais de Grâce
As a restaurateur (Thomas),
I want configurer un délai de grâce (ex: 15 min) après lequel une table non honorée est libérée,
So that maximiser mon taux d'occupation.

**Acceptance Criteria:**

**Given** les paramètres du restaurant (FR14)
**When** le délai de grâce est dépassé sans que le client ne soit marqué "Arrivé"
**Then** Thomas reçoit une alerte pour confirmer le "No-Show"
**And** dès confirmation, les créneaux redevenus disponibles sont instantanément ré-ouverts à la réservation (FR8).

### Story 5.4: Mode Dégradé (Offline Resilience)
As a restaurateur (Thomas),
I want pouvoir consulter ma liste de réservations même avec une connexion internet instable,
So that continuer à accueillir mes clients sans interruption.

**Acceptance Criteria:**

**Given** une perte de connexion temporaire (NFR6)
**When** Thomas navigue sur son dashboard
**Then** les données précédemment chargées sont accessibles via le cache local (LocalStorage)
**And** un indicateur visuel informe Thomas qu'il est en mode "Hors-ligne".

## Epic 6: Privacy & Conformité (Julie)
Julie dispose d'un contrôle total sur ses données personnelles, incluant le droit à l'oubli, conformément aux standards RGPD.

**FRs covered:** FR20

### Story 6.1: Module de Suppression de Données (Droit à l'oubli)
As a cliente (Julie),
I want pouvoir demander la suppression de toutes mes données personnelles liées à mes réservations,
So that exercer mon droit à l'oubli conformément au RGPD.

**Acceptance Criteria:**

**Given** une interface dédiée ou un lien dans l'email (FR20)
**When** Julie confirme sa demande de suppression
**Then** toutes les informations personnellement identifiables (Nom, Email, Tel, Notes) sont supprimées de la base de données
**And** les statistiques anonymisées du restaurant sont conservées (pour ne pas fausser les bilans de Thomas).
