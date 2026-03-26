# 🍽️ Tablely — Dossier de Présentation Complet

> Ce document est le guide de référence officiel du projet **Tablely**. Il a été conçu pour être compréhensible par des personnes sans bagage technique, tout en couvrant exhaustivement les fonctionnalités, la sécurité et les choix d'architecture.

---

## 🌟 1. Qu'est-ce que Tablely ?

**Tablely** est une plateforme SaaS (logiciel en ligne par abonnement) dédiée à la **gestion complète des restaurants**. Elle agit comme un pont entre deux mondes :

- **Le client (le gourmet)** : Il réserve une table en quelques secondes, sans appel téléphonique, avec une confirmation immédiate.
- **Le restaurateur** : Il dispose d'un tableau de bord en temps réel pour gérer son flux de clients, ses tables, son équipe et analyser ses performances.

**En une phrase :** Tablely, c'est la fin des post-it, des tableurs Excel et des réservations perdues.

---

## 👥 2. À qui s'adresse l'application ?

L'application est conçue pour deux publics distincts avec des interfaces dédiées :

### 🧑‍🍳 Les Professionnels de la Restauration
| Profil | Ce qu'il fait dans l'app |
|--------|--------------------------|
| **Propriétaire** | Crée le compte, gère plusieurs restaurants, accès total |
| **Manager / Admin** | Configure les services, les tables, invite l'équipe |
| **Staff / Serveur** | Consulte les réservations du jour, gère le placement |

### 🧑‍ Les Clients Finaux
Tout utilisateur souhaitant réserver une table. Il accède à la **page publique** du restaurant (partageable sur Instagram, Google, etc.) et réserve en 3 clics.

---

## 🗺️ 3. Comment ça marche ? Le Parcours Complet

### Côté Client — Réserver en 3 clics

```
1. Accès via un lien public → tablely.com/restaurant/le-petit-bistrot
   ↓
2. Sélection : date · service (Déjeuner / Dîner) · nombre de convives
   ↓
3. Saisie du nom, email, téléphone (+ notes spéciales si besoin)
   ↓
✅ Confirmation instantanée par email — La table est réservée !
```

### Côté Restaurateur — Le Tableau de Bord

```
🔐 Connexion (email / magic link / Google OAuth)
   ↓
📊 Dashboard → Vue des réservations du jour en temps réel
   ↓
📋 Liste des arrivées → Statut, notes client, table assignée
   ↓
⚙️  Paramètres → Configuration des services, tables, équipe
```

Le dashboard se met à jour **automatiquement** sans rafraîchir la page. Si une réservation tombe à 12h15, elle apparaît immédiatement.

---

## 🚀 4. Toutes les Fonctionnalités en Détail

### 🏪 A. Gestion des Établissements (Multi-Restaurant)

- **Compte multi-sites** : Un seul compte peut gérer plusieurs restaurants (groupes, franchises).
- **Basculement rapide** : Le restaurateur switche d'un établissement à l'autre en un clic.
- **Profil complet** de chaque restaurant :
  - Nom, adresse, numéro de téléphone
  - Coordonnées GPS (latitude / longitude) pour l'affichage sur carte
  - Slug personnalisé (ex: `/restaurant/mon-bistrot`)

### 🍱 B. Services & Gestion du Temps

Un "service" correspond à une période d'ouverture (Déjeuner, Dîner, Brunch…).

- **Création personnalisée** : Nom libre, heure de début, heure de fin.
- **Durée de repas** : Définissez la durée standard par service (ex: 90 min pour le déjeuner).
- **Temps de battement (buffer)** : Ajoutez un délai entre deux réservations (ex: 15 min pour nettoyer la table).
- **Jours d'ouverture** : Choisissez précisément les jours actifs par service (ex: Brunch uniquement le Week-end).

👉 **Exemple concret :** "Déjeuner" → Lundi à Vendredi, 12h00–14h30, durée 90min, buffer 15min.

### 🪑 C. Plan de Salle & Tables

- **Inventaire physique** : Créez chaque table avec son nom (ex: "Table 5") et sa capacité (ex: 4 personnes).
- **Activation/Désactivation** : Fermez une table temporairement (réparation, configuration spéciale) sans la supprimer.
- **Calcul automatique** : Le système croise en temps réel :
  - Les tables disponibles et leur capacité
  - Le nombre de couverts demandés
  - Les réservations déjà confirmées sur ce créneau
  
👉 **Résultat :** Un client demandant 6 couverts ne verra jamais une table de 4.

### 📊 D. Dashboard & Analytics

- **Réservations du jour** : Liste chronologique avec nom, couverts, table, notes.
- **Statistiques clés** : Taux d'occupation, périodes de pointe, historique.
- **Temps réel** : Mise à jour automatique dès qu'une nouvelle réservation arrive (technologie Realtime).
- **Lien public** accessible depuis le dashboard pour le partager avec les clients.

### 👥 E. Gestion de l'équipe (RBAC)

RBAC = Role-Based Access Control = Chaque personne a des droits adaptés à son rôle.

| Rôle | Droits |
|------|--------|
| **Owner** | Tous les droits, suppression du compte |
| **Admin** | Configuration complète (tables, services, équipe) |
| **Member** | Consultation et gestion des réservations uniquement |
| **Client** | Son propre profil et ses propres réservations |

- **Invitation par email** : Le manager ajoute un serveur en saisissant son email. Ce dernier reçoit un lien d'activation.
- **Rôle par restaurant** : Dans un groupe, une personne peut être Admin du Restaurant A et simple Member du Restaurant B.

### ✉️ F. Notifications & Rappels

- **Confirmation automatique** : Dès qu'une réservation est validée, le client reçoit un email de confirmation.
- **File d'attente robuste** : Les messages passent par un système de file (`notification_queue`) qui garantit qu'aucun email n'est perdu, même en cas de surcharge.
- **Traçabilité** : Chaque notification est tracée avec son statut (`pending`, `sent`).

### 🗺️ G. Découverte & Cartographie

- **Annuaire des restaurants** : Les clients peuvent parcourir tous les restaurants partenaires sur Tablely.
- **Recherche par nom / ville**.
- **Carte interactive** : Affichage géolocalisé grâce aux coordonnées GPS enregistrées.

### 🌐 H. Expérience Internationale

- **Langues disponibles** : Français 🇫🇷, Anglais 🇬🇧, Espagnol 🇪🇸, Allemand 🇩🇪.
- **Détection automatique** : La langue s'adapte aux préférences du navigateur de l'utilisateur.
- **Mode Clair / Mode Sombre** : L'interface respecte les préférences d'affichage système.

### 🔐 I. Authentification & Accès

- **Connexion par Email + Mot de Passe**
- **Magic Link** : Connexion sans mot de passe via un lien reçu par email (très secure)
- **OAuth Google** : Connexion en un clic avec son compte Google
- **Vérification CGU** : Affichage optionnel des conditions d'utilisation à l'inscription

---

## 🛡️ 5. La Sécurité — La Forteresse Tablely

La sécurité est gravée dans la conception même de l'application, pas ajoutée après coup.

### 🔒 Isolation des Données (Row Level Security)

C'est la brique de sécurité la plus importante.

- **Principe :** Chaque ligne de la base de données a un "verrou" qui indique à qui elle appartient.
- **En pratique :** Un utilisateur connecté au Restaurant A ne peut **physiquement pas** lire, modifier ou supprimer une donnée appartenant au Restaurant B. Ce n'est pas une règle dans le code — c'est une règle dans la base de données elle-même. Même si un hacker trouvait une faille dans le code, les données resteraient inaccessibles.

### 🤖 Protection contre les Robots (Cloudflare Turnstile)

- Le formulaire de réservation est protégé par **Cloudflare Turnstile**, la technologie anti-bot de nouvelle génération.
- **Sans CAPTCHA** pénible : Les vrais utilisateurs ne voient rien, les robots sont bloqués silencieusement.
- **Résultat :** Zéro fausse réservation créée par des bots.

### ⚔️ Protection contre les Attaques Web (Anti-CSRF)

- Le module `@edge-csrf` protège toutes les actions sensibles contre les attaques CSRF.
- **C'est quoi ?** Une attaque où un site malveillant tente de faire effectuer une action (ex: supprimer une réservation) à votre nom sans que vous le sachiez.

### 🧪 Validation Systématique des Données (Zod)

- Chaque information envoyée au serveur est **validée et scannée** avant d'être acceptée.
- Un champ email doit être un email. Un nombre de couverts doit être un entier positif. Toute donnée non conforme est rejetée à la source.
- **Résultat :** Protection contre les injections de code malveillant.

### 🍪 Gestion des Sessions (JWT)

- L'authentification repose sur des **jetons JWT** (des billets cryptographiques numériques).
- Ces jetons expirent et se renouvellent automatiquement.
- **Résultat :** Même si quelqu'un interceptait un jeton, il serait inutilisable rapidement.

### 📜 Conformité RGPD (Données Personnelles)

Tablely est pensé pour respecter la réglementation européenne sur les données personnelles :

- **Collecte minimale :** Seules les données strictement nécessaires sont collectées (Nom, Email, Téléphone).
- **Pas de revente :** Les données ne sont jamais vendues ou partagées à des fins commerciales.
- **Hébergement UE :** La base de données est hébergée en Europe (via Supabase EU).
- **Droits utilisateurs :** Accès, rectification et suppression des données sur demande.
- **Snapshot des réservations :** Les coordonnées du client (nom, email, téléphone) sont copiées au moment de la réservation. Si l'utilisateur modifie son profil ou le supprime, l'historique de réservation reste cohérent pour le restaurateur.

---

## 🏗️ 6. L'Architecture Technique — Le "Moteur sous le Capot"

### Les Choix Fondamentaux

| Composant | Technologie | Pourquoi ce choix |
|-----------|------------|-------------------|
| **Framework Web** | Next.js 16 | Ultra-rapide, optimisé SEO, rendu serveur |
| **Interface** | React 19 | Standard mondial, le plus mature |
| **Design** | Tailwind CSS v4.1 + Shadcn UI | Interface premium, responsive, sans lourdeur |
| **Base de données** | PostgreSQL 17 (via Supabase) | La BDD la plus fiable du monde open-source |
| **Authentification** | Supabase Auth | Sessions sécurisées, multi-providers |
| **Temps Réel** | Supabase Realtime | Mise à jour instantanée sans polling |
| **Validation** | Zod | Validation typée bout-en-bout |
| **Formulaires** | React Hook Form | Performance, UX fluide |
| **Animations** | Framer Motion | Micro-animations premium |
| **Analytics** | Vercel Analytics + Speed Insights | Performance mesurée en production |
| **Infrastructure** | Vercel (Edge Network) | Disponibilité mondiale, CDN |
| **Monorepo** | Turborepo + PNPM | Maintenance simplifiée, code partagé |

### Le Modèle Monorepo — Investir pour l'avenir

Le code est organisé en **blocs réutilisables** :

```
tablely/
├── apps/
│   ├── web/          ← L'application Next.js principale
│   └── e2e/          ← Tests automatisés (Playwright)
│
└── packages/
    ├── ui/           ← Composants visuels partagés (boutons, formulaires…)
    ├── supabase/     ← Connexion à la base de données partagée
    ├── features/     ← Logique métier (permissions, authentification)
    ├── i18n/         ← Gestion de toutes les langues
    ├── next/         ← Utilitaires Next.js partagés
    └── shared/       ← Types TypeScript communs
```

**Avantage :** Si demain on crée une application mobile Tablely, 80% de la logique (authentification, accès BDD, calcul des créneaux) est déjà prête et réutilisable.

### La Vie d'une Réservation (Technique)

```
Client clique "Réserver"
    ↓ (1) Validation Cloudflare Turnstile → Pas un robot ✅
    ↓ (2) Validation Zod → Données conformes ✅
    ↓ (3) Vérification CSRF → Requête légitime ✅
    ↓ (4) Appel SQL → get_available_slots() → Créneau disponible ✅
    ↓ (5) INSERT dans public.reservations (protégé par RLS)
    ↓ (6) INSERT dans public.notification_queue → Email en attente
    ↓ (7) Supabase Realtime → Événement poussé au dashboard restaurateur
    ↓ (8) Email de confirmation envoyé au client
✅ Réservation confirmée en < 2 secondes
```

---

## 🧪 7. Qualité & Fiabilité

- **Tests E2E automatisés** (Playwright) : Des scénarios réels testés automatiquement à chaque mise à jour.
- **Vérification des types** (TypeScript strict) : Toute l'application est typée, éliminant des catégories entières de bugs.
- **Analyse de performance** (`ANALYZE=true`) : Chaque mise en production est auditée pour éviter tout ralentissement.
- **Internationalisation complète** : 4 langues, avec outil de vérification de cohérence des traductions.

---

## 🏁 8. Conclusion

Tablely incarne ce qu'un logiciel professionnel moderne doit être : **simple pour l'utilisateur, robuste sous le capot**.

Pour le restaurateur, c'est la liberté de se consacrer à l'essentiel — l'accueil et la cuisine — en sachant que la logistique est automatisée et sécurisée.

Pour le client, c'est la promesse d'une réservation sans friction et d'une confirmation immédiate.

**Tablely, c'est l'outil qui vous permet de repasser du bureau à la cuisine.**

---

*Dernière mise à jour : 26 Mars 2026 — Maintenu par l'équipe Tablely.*
