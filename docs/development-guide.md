# 🚀 Guide de Développement • Tablely

Ce guide centralise les instructions pour installer, configurer et contribuer efficacement au projet Tablely.

---

## 📋 Prérequis Systèmes

Pour garantir une expérience de développement optimale, les outils suivants sont requis :
- **Node.js** : Version `18.18.0` ou supérieure (LTS recommandée).
- **PNPM** : Version `10.x` (obligatoire pour la gestion du Monorepo).
- **Supabase CLI** : Indispensable pour la gestion des migrations locales et la synchronisation des schémas.

---

## 🛠️ Installation & Configuration

1. **Clonez le dépôt** :
   ```bash
   git clone https://github.com/lucasvssr/tablely.git
   cd tablely
   ```

2. **Installez les dépendances** :
   ```bash
   pnpm install
   ```

3. **Configurez l'environnement** :
   Initialisez votre fichier `.env.local` dans `apps/web/` à partir de `.env.example` :
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_cle_anon
   SUPABASE_SERVICE_ROLE_KEY=votre_cle_service_role
   ```

---

## 💻 Routines de Développement

### Lancer le projet complet (Turbo)
Pour démarrer toutes les applications et paquets en mode "watch" :
```bash
pnpm run dev
```
L'application principale sera accessible sur : **`http://localhost:3000`**.

### Cibler une application précise
```bash
# Exemple pour l'application web uniquement
pnpm --filter web dev
```

---

## 🧪 Qualité & Maintenance du Code

Nous appliquons des standards de qualité stricts via des scripts automatisés :

| Commande | Action |
| :--- | :--- |
| `pnpm run typecheck` | Vérifier l'intégrité des types TypeScript sur tout le repo. |
| `pnpm run lint` | Analyser le code pour détecter les erreurs de style ou potentielles. |
| `pnpm run format:fix` | Appliquer automatiquement le formatage Prettier. |
| `pnpm run test` | Exécuter les tests (Unitaires & E2E). |

---

## 🗄️ Gestion Supabase (Données)

Le schéma est piloté par le code via les migrations SQL dans `apps/web/supabase/migrations/`.

### Synchronisation des Types
Lorsque vous modifiez le schéma de la base de données, rafraîchissez les définitions TypeScript :
```bash
pnpm run supabase:web:typegen
```

---

## 📦 Build & Production

Préparation des artefacts optimisés pour le déploiement :
```bash
pnpm run build
```
Les builds finaux seront générés dans les dossiers `.next/` respectifs de chaque application.

---
*Dernière mise à jour : 6 Mars 2026*
*Note : Utilisez toujours `pnpm` plutôt que `npm` ou `yarn` pour éviter les conflits de lockfile.*
