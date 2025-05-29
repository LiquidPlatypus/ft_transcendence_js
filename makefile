.PHONY: install start clean

install:
	@echo "Exécution du script d'installation..."
	@./install.sh

start:
	@echo "Démarrage de l'application backend..."
	@cd backend && npm run dev

clean:
	@echo "Nettoyage des dépendances du backend..."
	@rm -rf backend/node_modules
	@echo "Nettoyage des dépendances du frontend..."
	@rm -rf frontend/node_modules
	@echo "Nettoyage des fichiers compilés du frontend..."
	@find frontend -name "*.js" -delete -o -name "*.js.map" -delete