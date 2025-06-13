import { homePage } from './home.js'
import { startTournament } from './tournament.js';
import { Game } from './mypong.js';
import { GameBonus } from "./mypongBonus.js";
import { GameFour } from './fourpong.js';
import { GameFourBonus } from "./fourpongBonus.js";
import { twoPlayersMatch, fourPlayersMatchs } from './matches.js'
import { loadLanguage, t } from '../lang/i18n.js';
import { attachLanguageListeners, attachHomePageListeners } from './listeners.js'
import {disableUnrelatedButtons, GameType, MatchType, matchTypeChoice} from "./Utilities.js";
import {start_pfc} from "./chifoumi.js";
import { attachThemeListeners, initTheme } from './themeSwitcher.js';
import {attachTextListeners, initText} from "./textSwitcher.js";
import { Paddle2 } from './mypong.js';
import {screenReader} from "./screenReader.js";

function initializeScreenReader() {
	const ScreenReader = screenReader.getInstance();

	// Initialise les listeners globaux pour la navigation au clavier
	ScreenReader.initializeGlobalListeners();

	// Recupere le bouton par son ID.
	const screenReaderButton = document.getElementById('screen-reader-toggle');

	if (screenReaderButton) {
		screenReaderButton.addEventListener('click', () => {
			const newState = !ScreenReader.isEnabled();
			ScreenReader.setEnabled(newState);

			// Change l'apparence du bouton.
			screenReaderButton.className = newState ?
				'transition rounded hover:brightness-110 focus:ring-2 focus:ring-accent active' :
				'transition rounded hover:brightness-110 focus:ring-2 focus:ring-accent';

			// Change le texte alternatif de l'image.
			const img = screenReaderButton.querySelector('img');
			if (img) {
				img.alt = newState ? 'Désactiver le lecteur d\'écran' : 'Activer le lecteur d\'écran';
			}
		});
	}

	// Annonce le chargement de la page.
	ScreenReader.announcePageChange(t("home"));
}

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
		attachTextListeners();
		initText()
		initializeScreenReader();
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
			<button aria-label="${t("back")}" id="back-button" class="btn btn-fixed rounded-lg border p-4 shadow">${t("back")}</button>
			<h2 class="text-xl font-semibold">${t("how_many_players")}</h2>
		</div>
		<div class="flex justify-center gap-4 mt-4">
			<button id="2p-button" class="player-count-btn btn btn-fixed rounded-lg border p-4 shadow" data-count="2">2</button>
			<button id="4p-button" class="player-count-btn btn btn-fixed rounded-lg border p-4 shadow" data-count="4">4</button>
		</div>
	`;

	// Empeche d'appuyer sur tout les autres boutons en dehors de la div de Pong.
	disableUnrelatedButtons('pong');

	const ScreenReader = screenReader.getInstance();
	ScreenReader.announcePageChange(t("player_number_choice"));

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

	// Cache les boutons d'historiques.
	const pong_hist_btn = document.getElementById('pong-hist-btn');
	if (pong_hist_btn)
		pong_hist_btn.classList.add('hidden');

	const fourpong_hist_btn = document.getElementById('fourpong-hist-btn');
	if (fourpong_hist_btn)
		fourpong_hist_btn.classList.add('hidden');

	const pfc_hist_btn = document.getElementById('pfc-hist-btn');
	if (pfc_hist_btn)
		pfc_hist_btn.classList.add('hidden');

	// Fait en sorte que le bouton retour soit au dessus des boutons de selection du nombre de joueurs.
	container.classList.remove("grid-cols-2");
	container.classList.add("grid-cols-1");

	// Creer les champs pour rentrer les alias selon le nombre de joueurs.
	let inputsHTML = "";
	for (let i = 1; i <= playerCount; i++) {
		if (i === 2 && gameType === 'pong' && playerCount === 2) {
			// Special handling for player 2 in pong to add AI toggle
			inputsHTML += `
				<div class="mt-2 w-full">
					<div class="flex items-center w-full">
						<input type="text" id="playerAlias${i}" class="border p-2 rounded-l w-[calc(100%-100px)]" placeholder="Player ${i}">
						<button id="aiToggleBtn" style="width: 42px; min-width: 42px;" class="btn !w-[42px] h-[42px] border flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded-r text-sm">AI</button>
					</div>
				</div>
			`;
		} else {
			inputsHTML += `
				<div class="mt-2 w-full">
					<input type="text" id="playerAlias${i}" class="border p-2 rounded w-full" placeholder="Player ${i}">
				</div>
			`;
		}
	}

	// Creer la div complete.
	container.innerHTML = `
		<div class="flex flex-col item-center gap-4">
			<button aria-label="${t("back")}" id="back-button-${gameType}" class="btn btn-fixed rounded-lg border p-4 shadow">${t("back")}</button>
			<h2 class="text-xl font-semibold">${t("players_names")}</h2>
		</div>
		<div class="flex flex-col items-center w-full mb-2">
			${inputsHTML}
		</div>
		<div class="flex justify-center">
			<button id="start-${gameType}" class="btn btn-fixed rounded-lg border p-1 pe-1 shadow justify-center">${t("begin")}</button>
		</div>
	`;

	// Empeche d'appuyer sur les autres boutons en dehors de la div appropriée.
	disableUnrelatedButtons(gameType);

	const ScreenReader = screenReader.getInstance();
	ScreenReader.announcePageChange(t("player_alias_input"));

	// Bouton retour avec ID spécifique au type de jeu.
	const backButton = document.getElementById(`back-button-${gameType}`);
	if (backButton) {
		if (buttonType === 'match' && gameType === 'pong')
			backButton.addEventListener("click", (event) => {
				showPlayerCountSelection(event, buttonType, matchType);
			});
		else if (buttonType === 'match' && gameType === 'pfc')
			backButton.addEventListener("click", (event) => {
				matchTypeChoice(event, buttonType, 'pfc');
			})
		else if (buttonType === 'tournoi')
			backButton.addEventListener("click", (event) => showHome());
	}

	// Set up AI toggle if in pong mode with 2 players
	if (gameType === 'pong' && playerCount === 2) {
		const aiToggleBtn = document.getElementById('aiToggleBtn');
		const player2Input = document.getElementById('playerAlias2') as HTMLInputElement;
		let isAIEnabled = false;

		if (aiToggleBtn && player2Input) {
			aiToggleBtn.onclick = () => {
				isAIEnabled = !isAIEnabled;
				aiToggleBtn.classList.toggle('bg-blue-500', isAIEnabled);
				aiToggleBtn.classList.toggle('text-white', isAIEnabled);
				aiToggleBtn.classList.toggle('bg-gray-200', !isAIEnabled);
				player2Input.disabled = isAIEnabled;
				if (isAIEnabled) {
					player2Input.value = "AI";
				} else {
					player2Input.value = "";
				}
			};
		}
	}

	// Set up start button
	const startButtonId = `start-${gameType}`;
	const startButton = document.getElementById(startButtonId);
	if (startButton) {
		if (gameType === 'pong') {
			if (buttonType === 'match') {
				if (playerCount == 2) {
					const aiToggleBtn = document.getElementById('aiToggleBtn');
					const player2Input = document.getElementById('playerAlias2') as HTMLInputElement;

					startButton.onclick = async () => {
						const alias1Elem = document.getElementById('playerAlias1') as HTMLInputElement;
						const alias1 = alias1Elem ? alias1Elem.value.trim() : '';
						const alias2 = player2Input ? player2Input.value.trim() : '';
						const isAIEnabled = player2Input?.disabled || false;

						if (!alias1 || (!isAIEnabled && !alias2)) {
							alert('Please enter player names');
							return;
						}

						localStorage.setItem('player1Alias', alias1);
						localStorage.setItem('player2Alias', alias2);

						// Enable AI if toggled
						if (isAIEnabled) {
							Paddle2.setAIEnabled(true);
						}

						try {
							// Create players in backend
							const player1Response = await fetch('/api/players', {
								method: 'POST',
								headers: {'Content-Type': 'application/json'},
								body: JSON.stringify({name: alias1}),
							}).then(res => res.json());

							const player2Response = await fetch('/api/players', {
								method: 'POST',
								headers: {'Content-Type': 'application/json'},
								body: JSON.stringify({name: alias2}),
							}).then(res => res.json());

							if (player1Response.success && player2Response.success) {
								const matchResponse = await fetch('/api/players/match', {
									method: 'POST',
									headers: {'Content-Type': 'application/json'},
									body: JSON.stringify({
										player1Id: player1Response.id,
										player2Id: player2Response.id,
										gameType: 'pong'
									}),
								}).then(res => res.json());

								if (matchResponse.success) {
									localStorage.setItem('currentMatchId', matchResponse.matchId.toString());
									startGame(2, matchType);
								}
							}
						} catch (error) {
							console.error('Error creating match:', error);
						}
					};
				} else if (playerCount == 4) {
					fourPlayersMatchs(startButton, matchType);
				}
			} else if (buttonType === 'tournoi') {
				startButton.addEventListener('click', startTournament);
			}
		} else if (gameType === 'pfc') {
			start_pfc(startButton, matchType);
		}
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
 * @param playerCount nombre de joueurs.
 */
export async function showHistory(event: Event, gameType: string) {
	// Recupere le contenu de la div "history" en fonction du type de jeu.
	const historyContainer = document.getElementById(`history-${gameType === 'fourpong' ? 'pong' : gameType}`);
	if (!historyContainer)
		return ;

	// Cache les boutons d'historiques.
	const pong_hist_btn = document.getElementById('pong-hist-btn');
	if (pong_hist_btn)
		pong_hist_btn.classList.add('hidden');

	const fourpong_hist_btn = document.getElementById('fourpong-hist-btn');
	if (fourpong_hist_btn)
		fourpong_hist_btn.classList.add('hidden');

	const pfc_hist_btn = document.getElementById('pfc-hist-btn');
	if (pfc_hist_btn)
		pfc_hist_btn.classList.add('hidden');

	// Sauvegarde du contenu original pour le restaurer plus tard.
	const originalHTML = historyContainer.innerHTML;
	// Sauvegarde des classes CSS originales
	const originalClasses = historyContainer.className;

	// Check si des matchs existent dans la DB.
	try {
		const response = await fetch(`/api/scores/history/${gameType}`, {
			method: "POST",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify({})
		});
		const data = await response.json();

		if (gameType === 'pong' || gameType === 'fourpong')
			historyContainer.className = 'flex flex-col items-center max-h-60 overflow-y-auto';

		// On vide d'abord le conteneur d'historique.
		historyContainer.innerHTML = "";

		// Creation de deux div distinctes : une pour l'en-tete et une pour les tableaux.
		const headerDiv = document.createElement('div');
		headerDiv.className = 'flex items-center justify-center gap-2 mb-4 mt-2';
		headerDiv.innerHTML = `
			<button aria-label="${t("back")}" id="back-button-${gameType}" class="little_btn rounded-lg border p-4 shadow flex items-center justify-center w-8 h-8"><span class="inline-block">&lt;</span></button>
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

			// Afficher les matchs a 2 joueurs pour 'pong'
			if (gameType === 'pong' && twoPlayerMatches.length > 0) {
				const twoPlayerTitle = document.createElement('h3');
				twoPlayerTitle.className = 'text-lg font-semibold mt-4 mb-2';
				twoPlayerTitle.textContent = `${t("2_players_matches")}`;
				tablesDiv.appendChild(twoPlayerTitle);

				twoPlayerMatches.forEach((match: Match) => {
					const tableEl = document.createElement('table');
					tableEl.className = 'mt-10 border-collapse border w-full text-center table-fixed';
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

			// Afficher les matchs a 4 joueurs pour 'fourpong'
			if (gameType === 'fourpong' && fourPlayerMatches.length > 0) {
				const fourPlayerTitle = document.createElement('h3');
				fourPlayerTitle.className = 'text-lg font-semibold mt-4 mb-2';
				fourPlayerTitle.textContent = `${t("4_players_matches")}`;
				tablesDiv.appendChild(fourPlayerTitle);

				fourPlayerMatches.forEach((match: Match) => {
					const tableEl = document.createElement('table');
					tableEl.innerHTML = `
						<tr class="mt-10">
							<th class="bg-hist bg-hist-text border p-2 w-1/2">${match.player1}</th>
							<th class="bg-hist bg-hist-text border p-2 w-1/2">${match.player2}</th>
						</tr>
						<tr>
							<td class="border p-2">${match.player1_score}</td>
							<td class="border p-2">${match.player2_score}</td>
						</tr>
						<tr>
							<th class="bg-hist bg-hist-text border p-2 w-1/4">${match.player3}</th>
							<th class="bg-hist bg-hist-text border p-2 w-1/4">${match.player4}</th>
						</tr>
						<tr>
							<td class="border p-2">${match.player3_score}</td>
							<td class="border p-2">${match.player4_score}</td>
						</tr>
					`;
					tableEl.className = 'border-collapse border w-full text-center table-fixed';
					tablesDiv.appendChild(tableEl);
				});
			}

			// Pour PFC.
			if (gameType === 'pfc') {
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
		} else {
			const noMatchesEl = document.createElement('p');
			noMatchesEl.textContent = `${t("no_matches")}`;
			tablesDiv.appendChild(noMatchesEl);
		}

		historyContainer.appendChild(tablesDiv);

		// Empeche d'appuyer sur les boutons en dehors des div d'historiques.
		disableUnrelatedButtons(gameType === 'pong' || gameType === 'fourpong' ? 'pfc' : 'pong');

		const ScreenReader = screenReader.getInstance();
		ScreenReader.announcePageChange(t("history"));

		// Bouton retour.
		const backButton = document.getElementById(`back-button-${gameType}`);
		if (backButton) {
			backButton.addEventListener("click", () => {
				disableUnrelatedButtons('home');

				// Restaure le contenu original.
				historyContainer.innerHTML = originalHTML;
				// Restaure les classes CSS originales
				historyContainer.className = originalClasses;

				// Reaffiche les boutons d'historiques.
				if (pong_hist_btn)
					pong_hist_btn.classList.remove('hidden');

				if (fourpong_hist_btn)
					fourpong_hist_btn.classList.remove('hidden');

				if (pfc_hist_btn)
					pfc_hist_btn.classList.remove('hidden');

				// Reattache l'ecouteur pour le bouton hist.
				const pongHistBtn = document.getElementById('pong-hist-btn');
				if (pongHistBtn) {
					pongHistBtn.addEventListener("click", (e) => showHistory(e, 'pong'));
					pongHistBtn.classList.remove('hidden');
				}

				const fourpongHistBtn = document.getElementById('fourpong-hist-btn');
				if (fourpongHistBtn) {
					fourpongHistBtn.addEventListener("click", (e) => showHistory(e, 'fourpong'));
					fourpongHistBtn.classList.remove('hidden');
				}

				const pfcHistBtn = document.getElementById('pfc-hist-btn');
				if (pfcHistBtn) {
					pfcHistBtn.addEventListener("click", (e) => showHistory(e, 'pfc'));
					pfcHistBtn.classList.remove('hidden');
				}

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

	const ScreenReader = screenReader.getInstance();

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
		container.innerHTML = `
			<div class="flex justify-center w-full">
				<canvas id="game-canvas" width="600" height="400"
						class="max-w-full border border-gray-300 rounded"></canvas>
			</div>
		`;

		// Empeche d'appuyer sur les autres boutons en dehors de la div "Pong".
		disableUnrelatedButtons('pong');

		if (matchType === 'normal') {
			setTimeout(() => {
				const game = new Game();

				Game.ScreenReader.announcePageChange(t("pong-game"));
				Game.ScreenReader.announceGameEvent(t("pong_explanation"));

				requestAnimationFrame(game.gameLoop.bind(game));
			});
		} else if (matchType === 'bonus') {
			setTimeout(() => {
				const game = new GameBonus();

				Game.ScreenReader.announcePageChange(t("pong-game"));
				Game.ScreenReader.announceGameEvent(t("pong_explanation"));

				requestAnimationFrame(game.gameLoop.bind(game));
			});
		}
	} else if (playerCount === 4) {
		container.innerHTML = `
			<div class="flex justify-center w-full">
				<canvas id="game-canvas" width="500" height="500" 
						class="max-w-full border border-gray-300 rounded"></canvas>
			</div>
		`;

		GameFour.player1Score = 0;
		GameFour.player2Score = 0;
		GameFour.player3Score = 0;
		GameFour.player4Score = 0;

		if (matchType === 'normal') {
			setTimeout(() => {
				const game = new GameFour();

				GameFour.ScreenReader.announcePageChange(t("pong-four"));
				GameFour.ScreenReader.announceGameEvent(t("pong-four_explanation"));

				requestAnimationFrame(game.gameLoop.bind(game));
			});
		} else if (matchType === 'bonus') {
			setTimeout(() => {
				const game = new GameFourBonus();

				GameFour.ScreenReader.announcePageChange(t("pong-four"));
				GameFour.ScreenReader.announceGameEvent(t("pong-four_explanation"));

				requestAnimationFrame(game.gameLoop.bind(game));
			});
		}
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
		attachTextListeners();
		initializeScreenReader();
	}
}