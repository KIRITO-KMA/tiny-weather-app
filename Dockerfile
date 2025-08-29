# Dockerfile (à la racine, sans extension)
FROM node:22

# Dossier de travail dans le conteneur
WORKDIR /app

# Installer l'Angular CLI globalement
RUN npm install -g @angular/cli@latest

# Port utilisé par ng serve
EXPOSE 4200

# Démarrage par défaut = shell (lancer les commandes à la main)
CMD ["bash"]
