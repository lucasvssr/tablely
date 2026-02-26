# Story 2.1: Page de Réservation Publique (Landing)

**As a** cliente (Julie),  
**I want** accéder à une page web dédiée via un QR Code ou une URL unique,  
**So that** voir si je peux manger dans mon restaurant préféré ce soir.

## Acceptance Criteria

- [x] **Given** l'URL unique générée pour un restaurant (FR12), **When** je visite la page, **Then** le nom du restaurant et son identité visuelle sont affichés.
- [x] **And** la page est optimisée pour mobile (NFR9, NFR10).
- [x] **And** La page affiche les informations de base du restaurant (nom, adresse, téléphone).
- [x] **And** Un bouton d'action clair invite à commencer le processus de réservation.

## Implementation Plan

1. **Route Publique** : Créer une route dynamique `/restaurant/[slug]` (ou via domaine personnalisé si applicable, mais restons sur `/restaurant/[slug]` pour l'instant) pour les restaurants.
2. **Composant Landing** : Créer la page de destination pour les clients avec un design " premium " (responsive, typo soignée).
3. **Récupération de Données** : Implémenter la récupération des données publiques du restaurant via le slug.
4. **Navigation** : Ajouter le lien vers cette page publique dans le dashboard restaurateur (pour test/QR Code).
