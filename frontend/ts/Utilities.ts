import {ButtonType, showPlayerCountSelection, showAliasInputs} from "./script.js";
import {t} from "../lang/i18n.js";

/**
 * @brief Desactive ou active les boutons au besoin.
 * @param currentContext div actuelles -> definie les boutons a desactiver.
 */
export function disableUnrelatedButtons(currentContext: 'pong' | 'pfc' | 'home') {
	// Selectionne tout les types de boutons.
	const langButtons = document.querySelectorAll('[data-lang]');
	const pongButtons = document.querySelectorAll('#match-button, #tournament-button, #pong-hist-btn');
	const pfcButtons = document.querySelectorAll('#pfc-button, #pfc-hist-btn');

	// Active ou desactive les boutons en fonction du contexte.
	if (currentContext === 'home') {
		enableElements(langButtons);
		enableElements(pongButtons);
		enableElements(pfcButtons);
	} else if (currentContext === 'pong') {
		disableElements(langButtons);
		disableElements(pfcButtons);
		disableElements(pongButtons);
	} else if (currentContext === 'pfc') {
		disableElements(langButtons);
		disableElements(pongButtons);
		disableElements(pfcButtons);
	}
}

/**
 * @brief Active les boutons.
 * @param elements boutons a activer.
 */
function enableElements(elements: NodeListOf<Element>) {
	elements.forEach(element => {
		if (element instanceof HTMLButtonElement) {
			element.disabled = false;
			element.classList.remove('opacity-50', 'cursor-not-allowed');
		}
	});
}

/**
 * @brief Desactive les boutons.
 * @param elements boutons a desactiver.
 */
function disableElements(elements: NodeListOf<Element>) {
	elements.forEach(element => {
		if (element instanceof HTMLButtonElement) {
			element.disabled = true;
			element.classList.add('opacity-50', 'cursor-not-allowed');
		}
	});
}

export type MatchType = 'normal' | 'bonus'
export type GameType = 'pong' | 'pfc'

/**
 * @brief Affiche le choix du type de match (normal ou bonus).
 * @param event evenement appelant la fonction.
 * @param buttonType type de match (simple/tournoi).
 * @param gameType type de jeu (pong/pfc).
 */
export function matchTypeChoice(event: Event, buttonType: ButtonType, gameType: GameType) {
	// Sélectionner le bon conteneur en fonction du type de jeu
	const containerID = gameType === 'pong' ? "Pong" : "pfc";
	const container = document.getElementById(containerID);

	if (!container)
		return;

	// Cache les boutons d'historiques.
	const pong_hist_btn = document.getElementById('pong-hist-btn');
	if (pong_hist_btn)
		pong_hist_btn.classList.add('hidden');

	const pfc_hist_btn = document.getElementById('pfc-hist-btn');
	if (pfc_hist_btn)
		pfc_hist_btn.classList.add('hidden');

	// Fait en sorte que le bouton retour soit au dessus des boutons de selection.
	container.classList.remove("grid-cols-2");
	container.classList.add("grid-cols-1");

	// Creer les boutons de selection du type de match.
	container.innerHTML = `
		<div class="flex flex-col items-center gap-4">
			<button id="back-button-${gameType}" class="btn rounded-lg border p-4 shadow">${t("back")}</button>
			<h2 class="text-xl font-semibold">${t("select_game_mode")}</h2>
		</div>
		<div class="flex justify-center gap-4 mt-4">
			<button id="normal-button-${gameType}" class="mode-btn btn rounded-lg border p-4 shadow" data-mode="normal" data-game="${gameType}">${t("normal")}</button>
			<button id="bonus-button-${gameType}" class="mode-btn btn rounded-lg border p-4 shadow" data-mode="bonus" data-game="${gameType}">${t("bonus")}</button>
		</div>
	`;

	// Empeche d'appuyer sur tout les autres boutons en dehors de la div actuelle.
	disableUnrelatedButtons(gameType);

	// Bouton retour.
	const backButton = document.getElementById(`back-button-${gameType}`);
	if (backButton) {
		backButton.addEventListener("click", () => {
			// Retour à la page d'accueil
			const appElement = document.getElementById('app');
			if (appElement) {
				import('./script.js').then(module => {
					module.showHome();
				});
			}
		});
	}

	// Boutons de selection du mode.
	document.querySelectorAll(".mode-btn").forEach(btn => {
		btn.addEventListener("click", (event) => {
			const target = event.currentTarget as HTMLButtonElement;
			const mode = target.dataset.mode as MatchType;
			const game = target.dataset.game as GameType;

			// Stocker le mode de jeu dans localStorage pour pouvoir y accéder plus tard
			localStorage.setItem('gameMode', mode);

			if (game === 'pong') {
				showPlayerCountSelection(event, buttonType);
			} else if (game === 'pfc') {
				showAliasInputs(2, buttonType, game);
			}
		});
	});
}