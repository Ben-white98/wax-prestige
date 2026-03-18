# Guide Complet : Configuration et Déploiement du Projet "Wax Prestige"

Ce guide vous explique étape par étape comment configurer votre projet de A à Z, de la configuration de la base de données jusqu'à sa mise en ligne (déploiement).

---

## 📋 Étape 1 : Prérequis

Avant de commencer, assurez-vous d'avoir :

1. **Un compte Google** (pour configurer Firebase).
2. **Un compte GitHub** (pour héberger votre code source).
3. **Un compte Vercel** (gratuit, pour héberger et déployer le site web).
4. **Node.js** installé sur votre ordinateur (si vous développez en local).

---

## 🔥 Étape 2 : Configuration de Firebase (Base de données & Authentification)

Firebase est le "cerveau" de votre application. Il gère la base de données (les produits, les catégories) et l'authentification (la connexion sécurisée de l'administrateur).

### 2.1. Créer le projet Firebase

1. Allez sur la [Console Firebase](https://console.firebase.google.com/).
2. Cliquez sur **"Ajouter un projet"**.
3. Nommez-le (ex: `Wax Prestige`) et cliquez sur Continuer.
4. Vous pouvez désactiver Google Analytics pour simplifier, puis cliquez sur **"Créer le projet"**.

### 2.2. Activer l'Authentification (Google)

1. Dans le menu de gauche, allez dans **Création > Authentication**.
2. Cliquez sur **"Commencer"**.
3. Dans l'onglet **"Sign-in method"** (Mode de connexion), choisissez **Google**.
4. Activez-le (bouton on/off en haut à droite).
5. Sélectionnez votre adresse e-mail dans le champ "Adresse e-mail d'assistance du projet" et cliquez sur **Enregistrer**.

### 2.3. Activer la Base de données (Firestore)

1. Dans le menu de gauche, allez dans **Création > Firestore Database**.
2. Cliquez sur **"Créer une base de données"**.
3. Choisissez l'emplacement le plus proche de vous (ex: `eur3` pour l'Europe) et cliquez sur Suivant.
4. Démarrez en **Mode Production** et cliquez sur Créer.

### 2.4. Activer le Stockage de fichiers (Firebase Storage)

Pour pouvoir uploader des images depuis votre ordinateur pour vos produits, vous devez activer le stockage.

1. Dans le menu de gauche, allez dans **Création > Storage**.
2. Cliquez sur **"Commencer"**.
3. Démarrez en **Mode Production** et choisissez le même emplacement que pour Firestore.
4. Une fois créé, allez dans l'onglet **"Règles"** de Storage.
5. Remplacez le code existant par celui-ci pour autoriser uniquement l'admin à uploader, mais tout le monde à voir les images :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    function isAdmin() {
      return request.auth != null && request.auth.token.email == "benjaminbatola6@gmail.com";
    }

    match /{allPaths=**} {
      allow read: if true;
      allow write: if isAdmin();
    }
  }
}
```

6. Cliquez sur **"Publier"**.

### 2.5. Configurer les Règles de Sécurité Firestore

Pour protéger vos données, seules les personnes autorisées (vous) doivent pouvoir modifier les produits.

1. Allez dans l'onglet **"Règles"** de votre base de données Firestore.
2. Remplacez le code existant par celui-ci :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Fonction pour vérifier si l'utilisateur est l'admin par défaut
    function isAdmin() {
      return request.auth != null && request.auth.token.email == "benjaminbatola6@gmail.com";
    }

    // Règles pour les produits et catégories :
    // Tout le monde peut lire (voir le catalogue)
    // Seul l'admin peut créer, modifier ou supprimer
    match /products/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /categories/{document=**} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Règles pour les utilisateurs (si besoin d'ajouter d'autres admins plus tard)
    match /users/{userId} {
      allow read, write: if isAdmin() || request.auth.uid == userId;
    }
  }
}
```

3. Cliquez sur **"Publier"**.

### 2.6. Récupérer les clés de configuration

1. Cliquez sur l'icône **Paramètres (engrenage)** en haut à gauche, puis sur **"Paramètres du projet"**.
2. Descendez jusqu'à la section "Vos applications" et cliquez sur l'icône **Web (`</>`)**.
3. Donnez un pseudo à l'application (ex: `Wax Prestige Web`) et cliquez sur **"Enregistrer l'application"**.
4. Un bloc de code va s'afficher avec un objet `firebaseConfig`. Gardez cette page ouverte, vous en aurez besoin pour l'étape suivante.

---

## 💻 Étape 3 : Configuration du Code Source

### 3.1. Les variables d'environnement

Dans votre projet (que ce soit en local ou sur la plateforme de déploiement), vous devez lier votre code à votre projet Firebase.

1. À la racine de votre projet, créez un fichier nommé `.env.local`.
2. Remplissez-le avec les informations récupérées à l'étape 2.6 :

```env
NEXT_PUBLIC_FIREBASE_API_KEY="votre_api_key_ici"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="votre_projet.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="votre_project_id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="votre_projet.appspot.com"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="votre_messaging_sender_id"
NEXT_PUBLIC_FIREBASE_APP_ID="votre_app_id"
```

### 3.2. Personnaliser le numéro WhatsApp

1. Ouvrez le fichier `components/cart-drawer.tsx`.
2. À la ligne 18, trouvez la variable `phoneNumber` :
   `const phoneNumber = "2250123456789";`
3. Remplacez ce numéro par votre vrai numéro WhatsApp professionnel (avec l'indicatif du pays, sans le `+` ni les espaces).

---

## 🚀 Étape 4 : Déploiement en ligne (Vercel)

Vercel est l'hébergeur idéal pour ce type de projet (Next.js).

### 4.1. Mettre le code sur GitHub

1. Allez sur [GitHub](https://github.com/) et créez un nouveau dépôt (Repository) privé ou public.
2. Poussez votre code local vers ce dépôt GitHub (via Git).

### 4.2. Déployer sur Vercel

1. Allez sur [Vercel](https://vercel.com/) et connectez-vous avec votre compte GitHub.
2. Cliquez sur **"Add New..."** puis sur **"Project"**.
3. Importez le dépôt GitHub que vous venez de créer.
4. **ÉTAPE CRUCIALE :** Dans la section **"Environment Variables"** (Variables d'environnement), ajoutez une par une toutes les variables que vous avez mises dans votre fichier `.env.local` à l'étape 3.1.
5. Cliquez sur **"Deploy"**.
6. Patientez quelques minutes. Vercel va construire et mettre en ligne votre site. Il vous fournira une URL (ex: `https://wax-prestige.vercel.app`).

---

## 🔒 Étape 5 : Finalisation de la sécurité (Très important)

Pour que la connexion Google fonctionne sur votre site en ligne, vous devez autoriser le domaine fourni par Vercel dans Firebase.

1. Copiez l'URL de votre site en ligne fourni par Vercel (juste le domaine, ex: `wax-prestige.vercel.app`, sans le `https://`).
2. Retournez sur la **Console Firebase**.
3. Allez dans **Authentication > Paramètres (Settings) > Domaines autorisés**.
4. Cliquez sur **"Ajouter un domaine"**.
5. Collez votre domaine Vercel et cliquez sur **"Ajouter"**.

---

## 👑 Étape 6 : Utilisation au quotidien

Votre site est maintenant en ligne ! 🎉

**Pour le public :**

- Ils naviguent sur le catalogue, ajoutent au panier et commandent via WhatsApp.
- Ils ne voient aucun bouton de connexion.

**Pour vous (Administrateur) :**

1. Allez sur votre site et ajoutez `/admin` à la fin de l'URL (ex: `https://wax-prestige.vercel.app/admin`).
2. Vous serez redirigé vers la page de connexion cachée.
3. Cliquez sur "Continuer avec Google" et connectez-vous avec l'adresse e-mail : **benjaminbatola6@gmail.com** (C'est cette adresse qui est configurée comme "Super Admin" dans le code).
4. Vous aurez alors accès au tableau de bord pour ajouter, modifier ou supprimer vos catégories et vos produits !

---

_Félicitations, votre boutique e-commerce de pagnes africains est 100% fonctionnelle et sécurisée !_
