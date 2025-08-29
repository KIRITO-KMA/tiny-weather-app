# 🌤️ Weather App (Angular + Docker)

Une application météo développée avec **Angular**, permettant d’afficher la météo en temps réel (Selon l'API Open-Meteo) pour n’importe quelle ville dans le monde.  
L’application interroge l’API **[Open-Meteo](https://open-meteo.com/)** et présente les données sous une interface claire et responsive.

---

## ✨ Fonctionnalités

- 🔍 Recherche d’une ville (ex : Paris, Tokyo, Dakar).  
- 🌡️ Température actuelle + ressenti.  
- 💧 Humidité, 🌬️ Vent, 🌫️ Visibilité, 🌧️ Probabilité de pluie.  
- ☀️ Lever et coucher du soleil avec **curseur dynamique** représentant la progression de la journée.  
- ⏱️ Prévisions heure par heure (reste de la journée).  
- 📅 Prévisions sur **7 jours** avec températures min/max.  
- 🎨 Interface avec SCSS (dégradés, cartes, animations).  

---

## 🛠️ Technologies utilisées

- **Angular** 20 (TypeScript)  
- **SCSS** (préprocesseur CSS)  
- **RxJS** pour les appels API asynchrones  
- **Open-Meteo API** (géocodage + météo en temps réel)  
- **Docker** pour exécuter et isoler l’environnement  

---

## 🚀 Installation avec Docker Compose

### 1. Cloner le projet
```bash
git clone https://github.com/<ton-utilisateur>/<nom-du-repo>.git
cd <nom-du-repo>
```

### 2. Lancer le build et le conteneur
```bash
docker compose up -d --build
```

### 3. Accéder à l’application
👉 [http://localhost:4200](http://localhost:4200)

---

## 🧩 Structure Docker

- **Dockerfile** :  
  - Étape 1 → build Angular (Node 22)  
  - Étape 2 → serveur **Nginx** pour servir l’app  
- **compose.yaml** : simplifie le lancement (`docker compose up`)  
- **.dockerignore** : ignore `node_modules`, `dist`, `.git` pour accélérer les builds  

---

## 💻 Exécution en local (sans Docker)

Pour lancer le projet directement en mode développement Angular :  

### 1. Installer les dépendances
```bash
npm install
```

### 2. Lancer le serveur de développement
```bash
ng serve --open
```

L’application sera accessible sur :  
👉 [http://localhost:4200](http://localhost:4200)

---

## 📸 Aperçu

*capture d’écran de l’application ici*

---

## 📖 À propos

Ce projet a été réalisé comme **mini-projet Angular** pour apprendre et démontrer :  
- La création d’un projet Angular.  
- L’utilisation d’une API REST externe (Open-Meteo).  
- Le déploiement et l’exécution dans un conteneur Docker via Docker Compose.
- L'utilisation de TypeScript et SCSS.

---
