#!/bin/bash

echo "Installation des dépendances du backend..."
cd backend
npm install
npm audit fix --force
cd ..

echo "Installation des dépendances du frontend..."
cd frontend
npm install
npx tsc
npm audit fix --force
cd ..

echo "Initialisation du .env ..."
if [ ! -f backend/.env ]; then
  read -sp "Entrez votre SECRET pour l'API (sera stocké dans backend/.env): " SECRET_KEY
  echo
  echo "PORT=3000" > backend/.env
  echo "URL_ALLOWED=https://localhost:3000, https://127.0.0.1:3000" >> backend/.env
  local_ip=$(hostname -I | awk '{print $1}')
  echo "IP=$local_ip" >> backend/.env
  echo "SECRET=$SECRET_KEY" >> backend/.env
  echo ".env créé avec votre secret."
elif ! grep -q '^SECRET=' backend/.env; then
  read -sp "Aucun SECRET trouvé dans backend/.env. Entrez votre SECRET pour l'ajouter : " SECRET_KEY
  echo
  echo "SECRET=$SECRET_KEY" >> backend/.env
  echo "SECRET ajouté à backend/.env."
else
  echo "backend/.env existe déjà et contient un SECRET. Aucun changement."
fi

echo "Installation terminée."