#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# --- Installation des dépendances ---
cd backend
npm install --quiet --no-progress
npm audit fix --force
cd ..

cd frontend
npm install --quiet --no-progress
npx tsc
npm audit fix --force
cd ..

# --- Vérification et configuration du .env ---

# Le build échouera si le fichier .env ou le SECRET sont manquants.
if [ ! -f backend/.env ]; then
  echo "ERREUR: Fichier backend/.env manquant. Il doit être créé avant le build." >&2
  exit 1
fi

if ! grep -q '^SECRET=' backend/.env; then
  echo "ERREUR: Variable SECRET manquante dans backend/.env." >&2
  exit 1
fi

# --- Ajout des variables manquantes (si nécessaire) ---

# Ajoute PORT si non présent
if ! grep -q '^PORT=' backend/.env; then
  echo "PORT=3000" >> backend/.env
fi

# Ajoute URL_ALLOWED si non présent
if ! grep -q '^URL_ALLOWED=' backend/.env; then
  echo "URL_ALLOWED=https://localhost:3000, https://127.0.0.1:3000" >> backend/.env
fi

# Ajoute une IP statique (127.0.0.1) si non présente
if ! grep -q '^IP=' backend/.env; then
  echo "IP=127.0.0.1" >> backend/.env
fi