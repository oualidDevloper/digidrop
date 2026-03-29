# Plan d'Action : Finalisation du Stock Illimité / Custom Delivery

Ce document détaille les étapes exactes restantes pour finaliser le scraper afin qu'il publie automatiquement les produits avec "Custom Delivery", le "Service Text" (message post-achat), et un stock illimité.

## Ce qui a déjà été résolu et vérifié
- [x] L'URL encoding de l'API Key pour permettre le chargement instantané des catégories.
- [x] La détection automatique en arrière-plan des passerelles de paiement (ex: Stripe, Crypto).
- [x] La conversion du format des passerelles vers le bon schéma API (ex: `{"gateway": "Stripe"}`).
- [x] L'API route fonctionne et génère le produit (mais actuellement sans stock car le type `PRESET` par défaut sans Serial met le stock à 0).

## Ce qu'il reste à faire (Étape par Étape)

### 1. Action de l'Utilisateur (Création du Modèle)
Étant donné que la documentation de l'API Antistock ne détaille pas publiquement la clé JSON exacte pour "Custom Delivery", nous devons faire du "Reverse Engineering" :
- **À faire par l'utilisateur :** Créer manuellement un produit sur le tableau de bord Antistock.
- **Configurer :** Le nommer explicitement (ex: `Modele Custom Delivery`), lui attribuer le **Custom Delivery**, entrer un **Service Text** (le message post-achat), et décocher la limite de stock pour qu'il soit illimité.

### 2. Action du Scraper (Inspection de l'API)
Une fois le produit modèle créé par l'utilisateur :
- **À faire par le développeur (IA) :** Exécuter le script `list_all.js` pour interroger l'API Antistock et récupérer la structure JSON complète de ce produit modèle.
- **Objectif :** Trouver la propriété secrète cachée dans le tableau `deliveryConfigurations` (ex: `type: "SERVICE"` et `serviceText: "..."`).

### 3. Mise à jour du Backend Next.js
Une fois la structure exacte découverte :
- **À faire par le développeur (IA) :** Mettre à jour `src/app/api/post/route.ts`.
- Remplacer l'actuel `deliveryType: "PRESET"` par la configuration extraite de l'étape 2.
- Injecter dynamiquement le message de confirmation choisi par l'utilisateur lors de la prévisualisation dans la propriété `serviceText` (ou équivalent).

### 4. Tests et Déploiement Final
- **À faire par le développeur (IA) :** Tester l'aspiration d'un produit (ex: Fortnite Xbox).
- Vérifier sur le dashboard Antistock que le produit a bien été créé avec le Custom Delivery activé, le texte inclus et le stock affiché comme illimité.
- **À faire par l'utilisateur :** Confirmer le bon fonctionnement, commiter et faire le push final vers Vercel.
