# 🚀 Guide de Développement • Tablely

Ce guide centralise les instructions pour installer, configurer et contribuer efficacement au projet Tablely.

---

## 📋 Prérequis Systèmes

| Outil | Version recommandée | Obligatoire |
| :--- | :--- | :--- |
| **Node.js** | 20.x LTS (ou ≥ 18.18.0) | ✅ |
| **PNPM** | 10.x | ✅ (gestion monorepo) |
| **Supabase CLI** | Dernière version stable | ✅ (migrations & typegen) |
| **Git** | Toute version récente | ✅ |

```bash
# Vérifier les versions installées
node -v && pnpm -v
supabase --version
```

---

## 🛠️ Installation & Configuration

### 1. Cloner le dépôt

```bash
git clone https://github.com/lucasvssr/tablely.git
cd tablely
```

### 2. Installer les dépendances

```bash
pnpm install
```

> ⚠️ Utilisez toujours `pnpm` — ne jamais utiliser `npm` ou `yarn` pour éviter les conflits de lockfile.

### 3. Configurer les variables d'environnement

Créez `apps/web/.env.local` :

```bash
# ─── Supabase (obligatoires) ────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role

# ─── Sécurité ───────────────────────────────────────────────
# Minimum 32 caractères aléatoires chacun
ENCRYPTION_SECRET=chaine_aleatoire_32_chars_minimum
ENCRYPTION_SALT=autre_chaine_32_chars_minimum

# CAPTCHA Cloudflare Turnstile (optionnel en local, recommandé en prod)
TURNSTILE_SECRET_KEY=votre_cle_secrete_turnstile
NEXT_PUBLIC_CAPTCHA_SITE_KEY=votre_site_key_turnstile

# ─── Géocodage (Nominatim / OpenStreetMap) ──────────────────
# Requis pour la fonctionnalité de recherche d'adresse GPS
GEOCODING_EMAIL=votre-email@exemple.com

# ─── Application ────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 💻 Routines de Développement

### Démarrer le serveur de développement

```bash
# Toutes les apps (monorepo complet, recommandé)
pnpm run dev

# Seulement l'application web
pnpm --filter web dev
```

Application accessible sur : **`http://localhost:3000`**

### Build de production

```bash
pnpm run build
```

Les artefacts sont générés dans `apps/web/.next/`.

---

## 🧪 Tests

### Tests Unitaires (Playwright, sans navigateur)

```bash
# Depuis la racine
pnpm --filter web-e2e test:unit

# Depuis apps/e2e
cd apps/e2e && pnpm run test:unit
```

60 tests couvrant : schémas Zod, chiffrement, CAPTCHA, MFA, logique métier (`slugify`, `formatCurrency`), i18n, sitemap, `requireUser`.

### Tests E2E (Playwright, avec navigateur)

```bash
# Depuis la racine
pnpm run test
```

> ⚠️ Les tests E2E nécessitent un serveur Next.js en cours d'exécution et une base de données de test configurée.

---

## 🧹 Qualité & Maintenance du Code

| Commande | Action |
| :--- | :--- |
| `pnpm run typecheck` | Vérification TypeScript strict sur tout le monorepo |
| `pnpm run lint` | Analyse ESLint (détection d'erreurs et mauvaises pratiques) |
| `pnpm run format:fix` | Application automatique du formatage Prettier |
| `pnpm run test` | Exécution de tous les tests (unitaires + E2E) |

---

## 🗄️ Gestion de la Base de Données (Supabase)

Le schéma est versionné par le code via les migrations SQL dans `apps/web/supabase/migrations/`.

### Appliquer une migration

```bash
# En production (via Supabase CLI ou MCP)
supabase db push
```

### Régénérer les types TypeScript

Après toute modification du schéma de base de données, rafraîchissez les définitions de types :

```bash
pnpm run supabase:web:typegen
```

Cela met à jour `apps/web/lib/database.types.ts` avec les types générés depuis l'introspection de la base de données.

### Conventions de migration

- Un fichier par migration, nommé `YYYYMMDDHHMMSS_description.sql`
- Toujours tester en local avant de pousser en production
- Activer RLS sur toutes les nouvelles tables avec des politiques explicites

---

## 📦 Gestion du Monorepo (Turborepo)

### Ajouter une dépendance à un package spécifique

```bash
pnpm --filter web add <package-name>
pnpm --filter @kit/ui add <package-name>
```

### Synchroniser les versions entre packages

```bash
pnpm run syncpack:fix
```

### Lancer un script dans un workspace spécifique

```bash
pnpm --filter <workspace-name> <script>
# Ex: pnpm --filter web-e2e test:unit
```

---

## 🔄 Workflow Git

```bash
# Créer une branche feature
git checkout -b feat/ma-fonctionnalite

# Vérifier qualité avant commit
pnpm run typecheck && pnpm run lint

# Commit et push
git add . && git commit -m "feat: description concise"
git push origin feat/ma-fonctionnalite
```

---

## 🌍 Internationalisation

Les traductions sont dans `packages/i18n/src/locales/` réparties par namespace :

```text
locales/
├── fr/
│   ├── common.json
│   ├── auth.json
│   ├── restaurant.json
│   └── teams.json
└── en/
    └── ...
```

Ajoutez toujours les clés dans les **deux langues** simultanément.

---
*Dernière mise à jour : 9 Avril 2026*
