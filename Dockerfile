# Utiliser l'image de Node.js
FROM node:20.19

# Définir le répertoire de travail
WORKDIR /app

# Copier d'abord le package.json du backend dans le répertoire de travail
COPY ./backend/package*.json ./backend/

# Installer les dépendances du backend
WORKDIR /app/backend
RUN npm install

RUN audit fix

WORKDIR /app
# Copier le reste des fichiers du backend
COPY ./backend/ ./backend/

# Copier le frontend dans le répertoire du conteneur
COPY ./frontend/ ./frontend/

# Assurez-vous que le fichier frontend/package.json est bien présent
RUN ls -l /app/frontend

# Installer les dépendances du frontend
WORKDIR /app/frontend
RUN npm install

# Compiler les fichiers TypeScript sans passer par le script "tsc"
RUN npx tsc

RUN audit fix

# Exposer le port 3000
EXPOSE 3000

# Retourner au répertoire principal et démarrer l'application
WORKDIR /app/backend
CMD ["npm", "start"]
