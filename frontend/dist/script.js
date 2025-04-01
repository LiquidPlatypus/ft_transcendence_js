var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { homePage } from './home.js';
import { startTournament } from './tournament.js';
import { Game } from './mypong.js';
document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        appElement.innerHTML = homePage();
        attachHomePageListeners();
    }
});
function attachHomePageListeners() {
    const match_btn = document.getElementById('match-button');
    if (match_btn)
        match_btn.addEventListener("click", (event) => showPlayerCountSelection(event, 'match'));
    const tournament_btn = document.getElementById("tournament-button");
    if (tournament_btn)
        tournament_btn.addEventListener("click", (event) => showPlayerCountSelection(event, 'tournoi'));
    const pong_hist_btn = document.getElementById("pong-hist-btn");
    if (pong_hist_btn)
        pong_hist_btn.addEventListener("click", (event) => showHistory(event, 'pong'));
    const pfc_hist_btn = document.getElementById("pfc-hist-btn");
    if (pfc_hist_btn)
        pfc_hist_btn.addEventListener("click", (event) => showHistory(event, 'pfc'));
}
function showPlayerCountSelection(event, buttonType) {
    const container = document.getElementById("Pong");
    if (!container)
        return;
    const pong_hist_btn = document.getElementById('history-pong');
    if (pong_hist_btn)
        pong_hist_btn.classList.add('hidden');
    const pfc_hist_btn = document.getElementById('pfc-hist-btn');
    if (pfc_hist_btn)
        pfc_hist_btn.classList.add('hidden');
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
    }
    else if (buttonType === 'tournoi') {
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
            showHome();
        });
    }
    document.querySelectorAll(".player-count-btn").forEach((btn) => {
        btn.addEventListener("click", (event) => {
            const target = event.target;
            const playerCount = parseInt(target.dataset.count || "2", 10);
            showAliasInputs(playerCount, buttonType);
        });
    });
}
function showAliasInputs(playerCount, buttonType) {
    const container = document.getElementById("Pong");
    if (!container)
        return;
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
		<div class="felx justify-center">
			<button id="start" class="btn rounded-lg border p-1 pe-1 shadow justify-center">Commencer</button>
		</div>
	`;
    const backButton = document.getElementById("back-button");
    if (backButton) {
        if (buttonType === 'match')
            backButton.addEventListener("click", (event) => { showPlayerCountSelection(event, 'match'); });
        else if (buttonType === 'tournoi')
            backButton.addEventListener("click", (event) => { showPlayerCountSelection(event, 'tournoi'); });
    }
    const startButton = document.getElementById("start");
    if (startButton) {
        if (buttonType === 'match') {
            startButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
                const player1 = document.getElementById('playerAlias1').value;
                const player2 = document.getElementById('playerAlias2').value;
                console.log(`Match entre ${player1} et ${player2}`);
                try {
                    // Créer les joueurs
                    const player1Response = yield fetch('/api/players', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: player1 }),
                    }).then(res => res.json());
                    const player2Response = yield fetch("/api/players", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: player2 }),
                    }).then(res => res.json());
                    // Créer le match
                    if (player1Response.success && player2Response.success) {
                        const matchResponse = yield fetch("/api/players/match", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                player1Id: player1Response.id,
                                player2Id: player2Response.id,
                                gameType: 'pong'
                            }),
                        }).then(res => res.json());
                        if (matchResponse.success) {
                            // Stocker l'ID du match pour l'utiliser à la fin de la partie
                            localStorage.setItem('currentMatchId', matchResponse.matchId.toString());
                            startGame();
                        }
                    }
                }
                catch (error) {
                    console.error("Erreur lors de la création du match:", error);
                }
            }));
        }
        else if (buttonType === 'tournoi') {
            startButton.addEventListener("click", startTournament);
        }
    }
}
function showHistory(event, gameType) {
    return __awaiter(this, void 0, void 0, function* () {
        const container = document.getElementById(`history-${gameType}`);
        if (!container)
            return;
        // Logique pour récupérer et afficher l'historique
        try {
            const response = yield fetch(`/api/scores/history/${gameType}`);
            const data = yield response.json();
            if (data.success) {
                let historyHTML = `
				<button id="back-button" class="little_btn rounded-lg border p-4 shadow"><</button>
				<h2 class="text-xl font-semibold">Historique ${gameType}</h2>
			`;
                data.matches.forEach((match) => {
                    historyHTML += `<p>${match.player1} vs ${match.player2}: ${match.player1_score} - ${match.player2_score}</p>`;
                });
                container.innerHTML = historyHTML;
                container.classList.remove('hidden');
            }
            else {
                container.innerHTML = `
				<div class="flex flex-col item-center">
					<button id="back-button" class="little_btn rounded-lg border p-4 shadow"><</button>
					<p>Aucun matchs enregistrés.</p>
				</div>
			`;
                container.classList.remove('hidden');
            }
        }
        catch (error) {
            console.error("Erreur lors de la récupération de l'historique:", error);
            container.innerHTML = "<p>Erreur lors de la récupération de l'historique.</p>";
            container.classList.remove('hidden');
        }
        const backButton = document.getElementById("back-button");
        if (backButton) {
            backButton.addEventListener("click", () => {
                showHome();
            });
        }
    });
}
function startGame() {
    const container = document.getElementById("Pong");
    if (!container)
        return;
    container.innerHTML = '<canvas id="game-canvas" width="600" height="400"></canvas>';
    Game.player1Score = 0;
    Game.player2Score = 0;
    Game.setGameOver(false);
    setTimeout(() => {
        const game = new Game();
        requestAnimationFrame(game.gameLoop.bind(game));
    });
}
export function showHome() {
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
}
