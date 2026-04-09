# 🌐 Tablely — Application Web

Application principale de la plateforme Tablely, construite avec **Next.js 16** (React 19, App Router). Elle gère à la fois les profils publics des restaurants (réservation en ligne) et la console d'administration complète pour les restaurateurs.

---

## 📁 Structure de l'Application

```text
apps/web/
├── app/
│   ├── (home)/              # Landing page marketing publique
│   ├── auth/                # Flux d'authentification (login, signup, callback, reset)
│   ├── home/                # Console d'administration (restaurateurs authentifiés)
│   │   ├── page.tsx         # Dashboard principal (stats, tendances)
│   │   ├── booking/         # Gestion des réservations du jour
│   │   ├── restaurants/     # Liste et sélection des établissements
│   │   └── settings/        # Configuration avancée
│   │       ├── establishments/ # Gestion des comptes / établissements
│   │       ├── restaurant/     # Informations générales du restaurant
│   │       ├── services/       # Périodes de service (horaires, jours)
│   │       ├── tables/         # Inventaire des tables
│   │       └── team/           # Membres de l'équipe et invitations
│   ├── join/                # Acceptation des invitations d'équipe
│   ├── onboarding/          # Création du premier restaurant (nouveaux comptes)
│   ├── restaurant/
│   │   └── [slug]/          # Page publique de réservation par restaurant
│   └── update-password/     # Réinitialisation de mot de passe
├── components/              # Composants React locaux à l'application web
├── lib/
│   ├── server/              # Server Actions & helpers serveur
│   │   ├── accounts/        # Requêtes profil utilisateur
│   │   └── restaurant/      # Actions métier (restaurant, réservations, équipe, auth)
│   ├── security/            # Utilitaires de sécurité
│   │   ├── encryption.ts    # AES-256-GCM (chiffrement des notes de réservation)
│   │   └── captcha.ts       # Vérification Cloudflare Turnstile
│   ├── i18n/                # Helpers d'internationalisation côté serveur
│   └── database.types.ts    # Types TypeScript générés depuis Supabase
├── supabase/                # Migrations SQL & seed de données
└── styles/                  # CSS globaux et variables du design system
```

---

## 🛠️ Développement

```bash
# Depuis apps/e2e ou la racine
pnpm run dev

# Ou depuis la racine du monorepo (toutes les apps)
pnpm run dev
```

L'application est accessible sur **`http://localhost:3000`**.

```bash
# Build de production
pnpm run build
```

---

## 🔐 Variables d'Environnement

Créez `apps/web/.env.local` à partir de `.env.example` :

```bash
# Supabase (obligatoires)
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# Sécurité (obligatoires en production)
ENCRYPTION_SECRET=une_chaine_aleatoire_min_32_chars
ENCRYPTION_SALT=une_autre_chaine_aleatoire_min_32_chars
TURNSTILE_SECRET_KEY=votre_cle_cloudflare_turnstile
NEXT_PUBLIC_CAPTCHA_SITE_KEY=votre_site_key_cloudflare

# Géocodage Nominatim (obligatoire pour la localisation GPS)
GEOCODING_EMAIL=votre-email@exemple.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> ⚠️ Ne committez jamais `.env.local` — il est listé dans `.gitignore`.

---

## 🛡️ Couche de Sécurité

- **Cloudflare Turnstile (CAPTCHA)** : Requis à l'inscription et lors des réservations publiques si `TURNSTILE_SECRET_KEY` est défini.
- **Chiffrement AES-256-GCM** : Les notes de réservation sensibles sont chiffrées avant stockage en base.
- **CSRF** : Protection native via `@edge-csrf/nextjs`.
- **RLS Supabase** : Toutes les mutations sont vérifiées au niveau de la base de données.

---

## 🗄️ Migrations Supabase

Les schémas sont versionnés via les fichiers SQL dans `apps/web/supabase/migrations/`.

```bash
# Régénérer les types TypeScript après une migration
pnpm run supabase:web:typegen
```

---

*Voir le [Guide de Développement](../../docs/development-guide.md) pour les instructions complètes d'installation.*
