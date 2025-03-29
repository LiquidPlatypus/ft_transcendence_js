import { homePage } from './home.js'
import { startTournament } from './tournament.js';
import { Game } from './mypong.js';

document.addEventListener('DOMContentLoaded', () => {
	const appElement = document.getElementById('app');
	if (appElement) {
		appElement.innerHTML = homePage();
		attachHomePageListeners();
	}
})

function attachHomePageListeners() {
	const match_btn = document.getElementById('match-button');
	if (match_btn)
		match_btn.addEventListener("click", (event) => showPlayerCountSelection(event, 'match'));

	const tournament_btn = document.getElementById("tournament-button");
	if (tournament_btn)
		tournament_btn.addEventListener("click", (event) => showPlayerCountSelection(event, 'tournoi'));

	const history_btn = document.getElementById("history-button");
	if (history_btn)
		history_btn.addEventListener("click", (event) => showHistory(event));
}

type ButtonType = 'match' | 'tournoi'

function showPlayerCountSelection(event: Event, buttonType: ButtonType) {
	const container = document.getElementById("Pong");
	if (!container)
		return ;

	const historyButton = document.getElementById('history-button');
	if (historyButton)
		historyButton.classList.add('hidden');

	container.classList.remove("grid-cols-2");
	container.classList.add("grid-cols-1");

	if (buttonType === 'match') {
		container.innerHTML = `
			<div class="flex flex-col items-center gap-4">
				<button id="back-button" class="btn rounded-lg border p-4 shadow">Retour</button>
				<h2 class="text-xl font-semibold">Combien de joueurs?</h2>
			</div>
			<div class="flex justify-center gap-4 mt-4">
				<button id="2p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="2">2 joueurs</button>
				<button id="4p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="4">4 joueurs</button>
			</div>
		`;
	} else if (buttonType === 'tournoi') {
		container.innerHTML = `
			<div class="flex flex-col items-center gap-4">
				<button id="back-button" class="btn rounded-lg border p-4 shadow">Retour</button>
				<h2 class="text-xl font-semibold">Combien de joueurs?</h2>
			</div>
			<div class="flex justify-center gap-4 mt-4">
				<button id="3p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="3">3 joueurs</button>
				<button id="4p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="4">4 joueurs</button>
			</div>
		`;
	}

	const backButton = document.getElementById("back-button");
	if (backButton) {
		backButton.addEventListener("click", () => {
			const appElement = document.getElementById('app');
			if (appElement) {
				appElement.innerHTML = homePage();
				const pongContainer = document.getElementById("Pong");
				if (pongContainer) {
					pongContainer.classList.remove("grid-cols-1");
					pongContainer.classList.add("grid-cols-2");
				}
				attachHomePageListeners();
			}
		});
	}

	document.querySelectorAll(".player-count-btn").forEach((btn) => {
		btn.addEventListener("click", (event) => {
			const target = event.target as HTMLButtonElement;
			const playerCount = parseInt(target.dataset.count || "2", 10);
			showAliasInputs(playerCount, buttonType);
		});
	});
}

function showAliasInputs(playerCount: number, buttonType: ButtonType) {
	const container = document.getElementById("Pong");
	if (!container)
		return ;

	container.classList.remove("grid-cols-2");
	container.classList.add("grid-cols-1");

	let inputsHTML = "";
	for (let i = 1; i <= playerCount; i++) {
		inputsHTML += `
			<div class="mt-2">
				<label for="playerAlias${i}" class="block text-lg">Joueur ${i} :</label>
				<input type="text" id="playerAlias${i}" class="border p-2 rounded w-full" placeholder="Alias Joueur ${i}">
			</div>
		`;
	}

	container.innerHTML = `
		<div class="flex flex-col item-center gap-4">
			<button id="back-button" class="btn rounded-lg border p-4 shadow">Retour</button>
			<h2 class="text-xl font-semibold">Entrez les alias des joueurs</h2>
		</div>
		<div class="flex flex-col items-center w-full mb-2">
			${inputsHTML}
		</div>
		<button id="start" class="btn rounded-lg border p-4 shadow">Commencer</button>
	`;

	const backButton = document.getElementById("back-button");
	if (backButton) {
		if (buttonType === 'match')
			backButton.addEventListener("click", (event) => {showPlayerCountSelection(event, 'match')});
		else if (buttonType === 'tournoi')
			backButton.addEventListener("click", (event) => {showPlayerCountSelection(event, 'tournoi')});
	}

	const startButton = document.getElementById("start");
	if (startButton)
	{
		if (buttonType === 'match') {
			startButton.addEventListener("click", () => {
				const player1 = (document.getElementById('playerAlias1') as HTMLInputElement).value;
				const player2 = (document.getElementById('playerAlias2') as HTMLInputElement).value;
				console.log(`Match entre ${player1} et ${player2}`);
				startGame();
				})
		} else if (buttonType === 'tournoi') {
			startButton.addEventListener("click", startTournament);
		}
	}
}

interface Match {
	player1: string;
	player1_score: number;
	player2: string;
	player2_score: number;
	winner: string | null;
}

async function showHistory(event: Event) {
	const container = document.getElementById("Pong");
	if (!container)
		return ;

	container.classList.remove("grid-cols-2");
	container.classList.add("grid-cols-1");

	try {
		const response = await fetch("/api/scores/history");
		const data: { success: boolean; matches: Match[] } = await response.json();

		if (!data.success) {
			container.innerHTML = "<p class='text-center text-red-500'>Erreur lors du chargement de l'historique.</p>"
			return ;
		}

		let historyHTML = "<h2 class='text-xl font-bold text-center mb-4'>Historique des matchs</h2>";

		if (data.matches.length === 0)
			historyHTML += "<p class='text-center'>Aucun match enregistré.</p>";
		else {
			data.matches.forEach((match: Match) => {
				historyHTML += `
					<div class="border p-4 mb-2 rounded-lg bg-gray-100 shadow">
						<p><strong>${match.player1}</strong> (${match.player1_score}) vs <strong>${match.player2}</strong> (${match.player2_score})</p>
						<p class="text-green-500">Gagnant : <strong>${match.winner || "Égalité"}</strong></p>
					</div>
				`;
			});
		}

		container.innerHTML = historyHTML;
	} catch (error) {
		console.error("Erreur:", error);
		container.innerHTML = "<p class='text-center text-red-500'>Impossible de récupérer l'historique.</p>";
	}
}

function startGame() {
	const container = document.getElementById("Pong");
	if (!container)
		return ;

	container.innerHTML = '<canvas id="game-canvas" width="600" height="400"></canvas>';

	setTimeout(() => {
		const game = new Game();
		requestAnimationFrame(game.gameLoop.bind(game));
	})
}


