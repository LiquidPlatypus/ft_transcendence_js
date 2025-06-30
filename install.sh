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
touch backend/.env
echo "PORT=3000" > backend/.env
echo "URL_ALLOWED=https://localhost:3000, https://127.0.0.1:3000" >> backend/.env
local_ip=$(hostname -I | awk '{print $1}')
if grep -q "^IP=" backend/.env; then
  sed -i "s/^IP=.*/IP=$local_ip/" backend/.env
else
  echo "IP=$local_ip" >> backend/.env
fi

echo "Installation terminée."