import { homePage } from './home.js';
import { startTournament } from './tournament.js';
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
        match_btn.addEventListener('click', (event) => showPlayerCountSelection(event, 'match'));
    const tournament_btn = document.getElementById("tournament-button");
    if (tournament_btn)
        tournament_btn.addEventListener("click", (event) => showPlayerCountSelection(event, 'tournoi'));
}
function showMatchAliasInputs(playerCount) {
    const container = document.getElementById("Pong");
    if (!container)
        return;
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
		<button id="back-button" class="btn rounded-lg border p-4 shadow">Retour</button>
		<h2 class="text-xl font-semibold">Entrez les alias des joueurs</h2>
		${inputsHTML}
		<button id="start-tournament" class="btn rounded-lg border p-4 shadow">Commencer</button>
	`;
    const backButton = document.getElementById("back-button");
    if (backButton)
        backButton.addEventListener("click", (event) => { showPlayerCountSelection(event, 'match'); });
    const startButton = document.getElementById("start-button");
    if (startButton) {
        startButton.addEventListener("click", () => {
            const player1 = document.getElementById('player1').value;
            const player2 = document.getElementById('player2').value;
            console.log(`Match entre ${player1} et ${player2}`);
            // FONCTION POUR DEMARRER LE MATCH
        });
    }
}
function showPlayerCountSelection(event, buttonType) {
    const container = document.getElementById("Pong");
    if (!container)
        return;
    if (buttonType === 'match') {
        container.innerHTML = `
			<button id="back-button" class="btn rounded-lg border p-4 shadow">Retour</button>
			<h2 class="text-xl font-semibold">Combien de joueurs?</h2>
			<div class="flex justify-center gap-4 mt-4">
				<button id="2p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="2">2 joueurs</button>
				<button id="4p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="4">4 joueurs</button>
			</div>
		`;
    }
    else if (buttonType === 'tournoi') {
        container.innerHTML = `
			<button id="back-button" class="btn rounded-lg border p-4 shadow">Retour</button>
			<h2 class="text-xl font-semibold">Combien de joueurs?</h2>
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
                attachHomePageListeners();
            }
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
		<button id="back-button" class="btn rounded-lg border p-4 shadow">Retour</button>
		<h2 class="text-xl font-semibold">Entrez les alias des joueurs</h2>
		${inputsHTML}
		<button id="start-tournament" class="btn rounded-lg border p-4 shadow">Commencer</button>
	`;
    const backButton = document.getElementById("back-button");
    if (backButton) {
        if (buttonType === 'match')
            backButton.addEventListener("click", (event) => { showPlayerCountSelection(event, 'match'); });
        else if (buttonType === 'tournoi')
            backButton.addEventListener("click", (event) => { showPlayerCountSelection(event, 'tournoi'); });
    }
    const startButton = document.getElementById("start-tournament");
    if (startButton) {
        if (buttonType === 'match') {
            startButton.addEventListener("click", () => {
                const player1 = document.getElementById('player1').value;
                const player2 = document.getElementById('player2').value;
                console.log(`Match entre ${player1} et ${player2}`);
                // FONCTION POUR DEMARRER LE MATCH
            });
        }
        else if (buttonType === 'tournoi')
            startButton.addEventListener("click", startTournament);
    }
}
