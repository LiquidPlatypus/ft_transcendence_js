import { homePage } from './home.js'
import { startTournament } from './tournament.js';
import { Game } from './mypong.js';
import { GameBonus } from "./mypongBonus.js";
import { GameFour } from './fourpong.js';
import { twoPlayersMatch, fourPlayersMatchs } from './matches.js'
import { loadLanguage, t } from '../lang/i18n.js';
import { attachLanguageListeners, attachHomePageListeners } from './listeners.js'
import {disableUnrelatedButtons, GameType, MatchType, matchTypeChoice} from "./Utilities.js";
import {start_pfc} from "./chifoumi.js";
import { attachThemeListeners, initTheme } from './themeSwitcher.js';

// Ecouteur d'evenements.
document.addEventListener('DOMContentLoaded', async () => {
	const savedLang = localStorage.getItem('lang') || 'fr';
	await loadLanguage(savedLang as 'fr' | 'en' | 'es');

	const appElement = document.getElementById('app');
	if (appElement) {
		appElement.innerHTML = homePage();
		attachHomePageListeners();
		attachLanguageListeners();
		attachThemeListeners();
		initTheme();
	}
})

export type ButtonType = 'match' | 'tournoi'

/**
 * @brief Affiche le selecteur du nombre de joueurs.
 * @param event evenement appelant la foncton.
 * @param buttonType type de match (simple/tournoi).
 * @param matchType normal/bonus.
 */
export function showPlayerCountSelection(event: Event, buttonType: ButtonType, matchType: MatchType) {
	// Recupere le contenu de la div "Pong".
	const container = document.getElementById("Pong");
	if (!container)
		return ;

	// Cache les boutons d'historiques.
	const pong_hist_btn = document.getElementById('history-pong');
	if (pong_hist_btn)
		pong_hist_btn.classList.add('hidden');

	const pfc_hist_btn = document.getElementById('pfc-hist-btn');
	if (pfc_hist_btn)
		pfc_hist_btn.classList.add('hidden');

	// Fait en sorte que le bouton retour soit au dessus des boutons de selection du nombre de joueurs.
	container.classList.remove("grid-cols-2");
	container.classList.add("grid-cols-1");

	// Creer les boutons de selection du nombre de joueurs.
	container.innerHTML = `
		<div class="flex flex-col items-center gap-4">
			<button id="back-button" class="btn rounded-lg border p-4 shadow">${t("back")}</button>
			<h2 class="text-xl font-semibold">${t("how_many_players")}</h2>
		</div>
		<div class="flex justify-center gap-4 mt-4">
			<button id="2p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="2">${t("players_count", { count: 2 })}</button>
			<button id="4p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="4">${t("players_count", { count: 4 })}</button>
		</div>
	`;

	// Empeche d'appuyer sur tout les autres boutons en dehors de la div de Pong.
	disableUnrelatedButtons('pong');

	// Bouton retour.
	const backButton = document.getElementById("back-button");
	if (backButton) {
		backButton.addEventListener("click", () => {
			matchTypeChoice(event, buttonType, 'pong');
		});
	}

	// Boutons de selection du nombres de joueurs.
	document.querySelectorAll(".player-count-btn").forEach((btn) => {
		btn.addEventListener("click", (event) => {
			const target = event.target as HTMLButtonElement;
			const playerCount = parseInt(target.dataset.count || "2", 10);
			showAliasInputs(playerCount, buttonType, matchType, 'pong');
		});
	});
}

/**
 * @brief Affiche les champs pour rentrer les alias des joueurs.
 * @param playerCount nombre de joueurs.
 * @param buttonType type de match (simple/tournoi).
 * @param gameType type de jeu (pong/pfc).
 * @param matchType normal/bonus.
 */
export function showAliasInputs(playerCount: number, buttonType: ButtonType, matchType: MatchType, gameType: GameType) {
	// Récupère le conteneur approprié en fonction du type de jeu
	const containerID = gameType === 'pong' ? "Pong" : "pfc";
	const container = document.getElementById(containerID);

	if (!container)
		return;

	// Fait en sorte que le bouton retour soit au dessus des boutons de selection du nombre de joueurs.
	container.classList.remove("grid-cols-2");
	container.classList.add("grid-cols-1");

	// Creer les champs pour rentrer les alias selon le nombre de joueurs.
	let inputsHTML = "";
	for (let i = 1; i <= playerCount; i++) {
		inputsHTML += `
			<div class="mt-2">
				<label for="playerAlias${i}" class="block text-lg">${t("player")} ${i} :</label>
				<input type="text" id="playerAlias${i}" class="border p-2 rounded w-full" placeholder="${t("player_alias_ph")} ${i}">
			</div>
		`;
	}

	// Creer la div complete.
	container.innerHTML = `
		<div class="flex flex-col item-center gap-4">
			<button id="back-button-${gameType}" class="btn rounded-lg border p-4 shadow">${t("back")}</button>
			<h2 class="text-xl font-semibold">${t("enter_pl_alias")}</h2>
		</div>
		<div class="flex flex-col items-center w-full mb-2">
			${inputsHTML}
		</div>
		<div class="flex justify-center">
			<button id="start-${gameType}" class="btn rounded-lg border p-1 pe-1 shadow justify-center">${t("begin")}</button>
		</div>
	`;

	// Empeche d'appuyer sur les autres boutons en dehors de la div appropriée.
	disableUnrelatedButtons(gameType);

	// Bouton retour avec ID spécifique au type de jeu.
	const backButton = document.getElementById(`back-button-${gameType}`);
	if (backButton) {
		if (buttonType === 'match')
			backButton.addEventListener("click", (event) => {
				matchTypeChoice(event, 'match', gameType);
			});
		else if (buttonType === 'tournoi')
			backButton.addEventListener("click", (event) => {showHome()});
	}

	// Lance le ou les matchs en fonction du mode de jeu avec ID spécifique au type de jeu.
	const startButtonId = `start-${gameType}`;
	const startButton = document.getElementById(startButtonId);
	if (startButton)
	{
		if (gameType === 'pong') {
			if (buttonType === 'match') {
				if (playerCount == 2)
					twoPlayersMatch(startButton, matchType);
				else if (playerCount == 4)
					fourPlayersMatchs(startButton, matchType);
			} else if (buttonType === 'tournoi')
				startButton.addEventListener("click", startTournament);
		} else if (gameType === 'pfc')
			start_pfc(startButton, matchType);
	}
}

interface Match {
	player1: string;
	player1_score: number;
	player2: string;
	player2_score: number;
	player3?: string;
	player3_score?: number;
	player4?: string;
	player4_score?: number;
	winner: string | null;
	playerCount?: number;
}

/**
 * @brief Affiche les tableaux des historiques.
 * @param event evenement appelant la fonction.
 * @param gameType type de jeu (pong/pfc).
 */
export async function showHistory(event: Event, gameType: string) {
	// Recupere le contenu de la div "history" en fonction du type de jeu.
	const historyContainer = document.getElementById(`history-${gameType}`);
	if (!historyContainer)
		return ;

	// Sauvegarde du contenu original pour le restaurer plus tard.
	const originalHTML = historyContainer.innerHTML;

	// Check si des matchs existent dans la DB.
	try {
		const response = await fetch(`/api/scores/history/${gameType}`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({})
		});
		const data = await response.json();

		// On vide d'abord le conteneur d'historique.
		historyContainer.innerHTML = "";

		// Creation de deux div distinctes : une pour l'en-tete et une pour les tableaux.
		const headerDiv = document.createElement('div');
		headerDiv.className = 'flex items-center justify-center gap-2 mb-4 mt-2';
		headerDiv.innerHTML = `
			<button id="back-button-${gameType}" class="little_btn rounded-lg border p-4 shadow flex items-center justify-center w-8 h-8"><span class="inline-block">&lt;</span></button>
			<h2 class="text-xl font-semibold">${t("history")} ${gameType}</h2>
		`;
		historyContainer.appendChild(headerDiv);

		// Div pour les tableaux d'historique.
		const tablesDiv = document.createElement('div');
		tablesDiv.className = 'w-full space-y-2';

		if (data.success && data.matches && data.matches.length > 0) {
			// Separation des matchs 2 ou 4 joueurs.
			const twoPlayerMatches = data.matches.filter((match: Match) => !match.player3);
			const fourPlayerMatches = data.matches.filter((match: Match) => match.player3);

			// Afficher les matchs a 2 joueurs.
			if (twoPlayerMatches.length > 0) {
				const twoPlayerTitle = document.createElement('h3');
				twoPlayerTitle.className = 'text-lg font-semibold mt-4 mb-2';
				twoPlayerTitle.textContent = `${t("2_players_matches")}`;
				tablesDiv.appendChild(twoPlayerTitle);

				twoPlayerMatches.forEach((match: Match) => {
					const tableEl = document.createElement('table');
					tableEl.className = 'border-collapse border w-full text-center table-fixed';
					tableEl.innerHTML = `
						<tr>
							<th class="bg-hist bg-hist-text border p-2 w-1/2">${match.player1}</th>
							<th class="bg-hist bg-hist-text border p-2 w-1/2">${match.player2}</th>
						</tr>
						<tr>
							<td class="border p-2">${match.player1_score}</td>
							<td class="border p-2">${match.player2_score}</td>
						</tr>
					`;
					tablesDiv.appendChild(tableEl);
				});
			}

			// Afficher les matchs a 4 joueurs.
			if (fourPlayerMatches.length > 0) {
				const fourPlayerTitle = document.createElement('h3');
				fourPlayerTitle.className = 'text-lg font-semibold mt-4 mb-2';
				fourPlayerTitle.textContent = `${t("4_players_matches")}`;
				tablesDiv.appendChild(fourPlayerTitle);

				fourPlayerMatches.forEach((match: Match) => {
					const tableEl = document.createElement('table');
					tableEl.className = 'border-collapse border w-full text-center table-fixed';
					tableEl.innerHTML = `
						<tr class="bg-hist">
							<th class="border p-2 w-1/4">${match.player1}</th>
							<th class="border p-2 w-1/4">${match.player2}</th>
							<th class="border p-2 w-1/4">${match.player3}</th>
							<th class="border p-2 w-1/4">${match.player4}</th>
						</tr>
						<tr>
							<td class="border p-2">${match.player1_score}</td>
							<td class="border p-2">${match.player2_score}</td>
							<td class="border p-2">${match.player3_score}</td>
							<td class="border p-2">${match.player4_score}</td>
						</tr>
					`;
					tablesDiv.appendChild(tableEl);
				});
			}
		} else {
			const noMatchesEl = document.createElement('p');
			noMatchesEl.textContent = `${t("no_matches")}`;
			tablesDiv.appendChild(noMatchesEl);
		}

		historyContainer.appendChild(tablesDiv);

		// Empeche d'appuyer sur les boutons en dehors des div d'historiques.
		disableUnrelatedButtons(gameType === 'pong' ? 'pfc' : 'pong');

		// Bouton retour.
		const backButton = document.getElementById(`back-button-${gameType}`);
		if (backButton) {
			backButton.addEventListener("click", () => {
				disableUnrelatedButtons('home');

				// Restaure le contenu original.
				historyContainer.innerHTML = originalHTML;
				// Enleve la classe d'alignement.
				historyContainer.classList.remove('self-start');

				// Reattache l'ecouteur pour le bouton hist.
				const histBtn = document.getElementById(`${gameType}-hist-btn`);
				if (histBtn)
					histBtn.addEventListener("click", (e) => showHistory(e, gameType));
			});
		}
	} catch (error) {
		console.error("Erreur lors de la récupération de l'historique:", error);
		historyContainer.innerHTML = `
			<div class="flex items-center justify-center gap-2 mb-4">
				<button id="back-button-${gameType}" class="little_btn rounded-lg border p-2 shadow"><</button>
				<h2 class="text-xl font-semibold">Erreur</h2>
			</div>
			<p>${t("hist_error")}</p>
		`;
	}
}

/**
 * @brief Initialise les matchs.
 * @param playerCount nombre de joueurs.
 * @param matchType normal/bonus.
 */
export function startGame(playerCount: number, matchType: MatchType) {
	// Recupere le contenu de la div "Pong".
	const container = document.getElementById("Pong");
	if (!container)
		return;

	console.log("Starting game with players:");
	console.log("Player 1:", localStorage.getItem('player1Alias'));
	console.log("Player 2:", localStorage.getItem('player2Alias'));
	if (playerCount === 4) {
		console.log("Player 3:", localStorage.getItem('player3Alias'));
		console.log("Player 4:", localStorage.getItem('player4Alias'));
	}

	// Reset les scores avant de commencer un match.
	Game.player1Score = 0;
	Game.player2Score = 0;
	Game.setGameOver(false);

	// Set-up l'esapce de jeu.
	if (playerCount === 2) {
		container.innerHTML = '<canvas id="game-canvas" width="600" height="400"></canvas>';

		// Empeche d'appuyer sur les autres boutons en dehors de la div "Pong".
		disableUnrelatedButtons('pong');

		if (matchType === 'normal') {
			setTimeout(() => {
				const game = new Game();
				requestAnimationFrame(game.gameLoop.bind(game));
			});
		} else if (matchType === 'bonus') {
			setTimeout(() => {
				const game = new GameBonus();
				requestAnimationFrame(game.gameLoop.bind(game));
			});
		}
	} else if (playerCount === 4) {
		container.innerHTML = '<canvas id="game-canvas" width="600" height="600"></canvas>';
		GameFour.player1Score = 0;
		GameFour.player2Score = 0;
		GameFour.player3Score = 0;
		GameFour.player4Score = 0;

		setTimeout(() => {
			const game = new GameFour();
			requestAnimationFrame(game.gameLoop.bind(game));
		});
	}
}

/**
 * @brief Affiche la page d'acceuil.
 */
export function showHome() {
	const appElement = document.getElementById('app');
	if (appElement) {
		appElement.innerHTML = homePage();

		const pongContainer = document.getElementById("Pong");
		if (pongContainer) {
			pongContainer.classList.remove("grid-cols-1");
			pongContainer.classList.add("grid-cols-2");
		}

		// Reactive les boutons en dehors de divs specifiques.
		disableUnrelatedButtons('home');

		attachHomePageListeners();
		attachLanguageListeners();
	}
}

