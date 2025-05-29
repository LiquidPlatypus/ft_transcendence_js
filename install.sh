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

echo "Installation terminée."