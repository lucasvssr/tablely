---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
inputDocuments: ['product-brief-Bmad-2026-02-06.md']
workflowType: 'prd'
documentCounts:
  briefCount: 1
  researchCount: 0
  brainstormingCount: 0
  projectDocsCount: 0
classification:
  projectType: 'SaaS B2B / Web App (Next.js)'
  domain: 'Services de restauration'
  complexity: 'Moyenne'
  projectContext: 'Greenfield'
---

# Product Requirements Document - Bmad Reservation System

**Author:** L.vasseur
**Date:** 2026-02-06

## Executive Summary

Ce projet vise à transformer la gestion des réservations de restaurant en remplaçant le carnet papier traditionnel par un SaaS B2B moderne (Next.js & Supabase). L'objectif est de supprimer les frictions pour les clients (Julie) via une réservation mobile instantanée et d'éliminer le coût des "No-Shows" pour les restaurateurs (Thomas) grâce à une gestion proactive de la capacité et des pénalités automatiques.

---

## Success Criteria

### Business & User Outcomes
- **Thomas (Restaurateur) :** Élimination totale du carnet papier. Gain de temps opérationnel (> 5h/semaine) en supprimant la prise de réservation manuelle.
- **Julie (Cliente) :** Réservation confirmée en moins de 30 secondes. Zéro attente téléphonique.
- **Rentabilité :** Réduction du taux de No-Show en dessous de 5% via rappels et pré-autorisations Stripe.
- **Adoption :** Plus de 80% des réservations traitées de manière 100% autonome par le système.

---

## Product Roadmap & Phasing

### MVP - Phase 1 (Core Capability)
- **Module Client :** Page de réservation responsive, créneaux en temps réel.
- **Dashboard Restaurateur :** Vue quotidienne, statuts (Confirmé, Arrivé, No-Show), gestion de capacité.
- **Alertes Comms :** Emails transactionnels (Resend) et notifications temps réel (Supabase).
- **Compliance :** Étanchéité multi-tenante (RLS) et gestion RGPD/Consentement.

### Growth - Phase 2 (Monetization & Scale)
- **Fintech :** Intégration Stripe pour pénalités et abonnements SaaS.
- **Data :** Rapports de performance hebdomadaires par restaurant.
- **Admin :** Console multi-sites pour les groupes de restauration.

### Vision - Phase 3 (Intelligence)
- **Pred-AI :** Algorithmes de prédiction des risques de no-show basés sur l'historique.
- **Ecosystem :** Connexion bidirectionnelle avec les logiciels de caisse (POS API).

---

## User Journeys

### 1. Réservation "Zéro Friction" (Julie)
- **Scénario :** Julie veut réserver pour ce soir via son mobile.
- **Expérience :** Elle accède à l'URL unique du restaurant. L'interface affiche uniquement les tables réellement disponibles. Julie saisit ses infos, confirme, et reçoit son email instantané.
- **Valeur :** Gratification immédiate, pas d'incertitude.

### 2. Gestion de Salle & No-Show (Thomas)
- **Scénario :** Un client ne s'est pas présenté à 20h20.
- **Expérience :** Thomas signale le "No-Show" sur son dashboard en un clic. 
- **Impact :** La capacité est instantanément libérée sur le module client. La pénalité est déclenchée (Phase 2) ou logguée (Phase 1).
- **Valeur :** Rotation de table optimisée, perte financière minimisée.

---

## Technical Architecture & Compliance

### SaaS & Infrastructure
- **Multi-tenancy :** Isolation stricte via Row Level Security (RLS) de Supabase sur l'ID du restaurant.
- **Routing :** App Router Next.js séparant le domaine public (Réservation) et privé (Dashboard).
- **SEO :** Pages restaurants générées dynamiquement (ISR) pour une visibilité Google optimale.

### Compliance (Fintech & RGPD)
- **Data Privacy :** Anonymisation automatique après 24 mois. Chiffrement AES-256 des notes sensibles (allergies).
- **Stripe Workflow :** Pre-authorization bancaire systématique (pre-MVP logic) pour sécuriser le No-Show.
- **Audit :** Journalisation de toutes les actions "Staff" sur les données clients.

---

## Functional Requirements

### 1. Expérience Client (Module Réservation)
- **FR1 :** Consultation des créneaux disponibles en temps réel (Supabase Realtime).
- **FR2 :** Saisie de réservation : Nom, Email, Tel, Couverts, Heure.
- **FR3 :** Option de notes spécifiques (Allergies/Demandes) transmises au restaurateur.
- **FR4 :** Liste d'attente digitale automatique si le créneau souhaité est complet.
- **FR5 :** Annulation autonome sécurisée via lien tokenisé dans l'email.

### 2. Gestion Restaurateur (Dashboard)
- **FR6 :** Vue centralisée des réservations du jour avec mise à jour instantanée.
- **FR7 :** Modification du statut : "Arrivé" ou "No-Show".
- **FR8 :** Libération automatique et immédiate de la capacité de salle dès l'annulation ou le signalement No-Show.
- **FR9 :** Édition dynamique des réservations (nombre de couverts, heure) en salle.
- **FR10 :** Alerte visuelle prioritaire pour les réservations avec notes de "Sécurité" (allergies).

### 3. Configuration & Multi-tenant (SaaS)
- **FR11 :** Wizard d'onboarding : Création restaurant, capacité totale, horaires.
- **FR12 :** Génération automatique d'URL unique et QR Code de réservation.
- **FR13 :** Gestion de l'équipe (RBAC) : Attribution des rôles Admin vs Staff.
- **FR14 :** Paramétrage des délais de grâce No-Show personnalisés par établissement.
- **FR15 :** Gestion des dates de fermeture (Blackout Dates) et jours fériés.
- **FR16 :** Définition de "Services" distincts (ex: Midi vs Soir) avec capacités variables.

### 4. Communications & Système
- **FR17 :** Email de confirmation instantané et rappel automatique avant service (Resend).
- **FR18 :** Notifications Push/Realtime sur le Dashboard lors d'une action client.
- **FR19 :** Étanchéité totale des données : Interdiction d'accès aux données d'un autre restaurant.
- **FR20 :** Module de suppression de données (Droit à l'oubli) accessible au client.

---

## Non-Functional Requirements

### Performance & Latence
- **NFR1 :** Latence API < **300ms** (P95) pour les actions critiques.
- **NFR2 :** Propagation temps réel < **500ms** entre Client et Restaurateur.
- **NFR3 :** Score Lighthouse Performance > **90** sur mobile (LCP < 1.5s).

### Sécurité & Robustesse
- **NFR4 :** Authentification JWT unifiée via Supabase Auth pour tous les accès Dashboard.
- **NFR5 :** Utilisation de **UUID v4** pour tous les identifiants exposés (API/URLs).
- **NFR6 :** Résilience : Mode "Lecture seule" via cache local (LocalStorage) en cas de déconnexion réseau brève.
- **NFR7 :** Circuit Breaker sur les services de notification tiers (Resend).

### UX & Qualité
- **NFR8 :** Disponibilité système (Uptime) de **99.9%**.
- **NFR9 :** Interfaces tactiles optimisées : Cibles minimales de **48x48px** pour usage en salle.
- **NFR10 :** Contraste minimal WCAG AA (4.5:1) pour la lisibilité sous forte luminosité.
