import { homePage } from './home.js';
import { startTournament } from './tournament.js';
document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement)
        appElement.innerHTML = homePage();
});
document.addEventListener("DOMContentLoaded", () => {
    const button = document.getElementById("tournament-button");
    if (button)
        button.addEventListener("click", showPlayerCountSelection);
});
function showPlayerCountSelection() {
    const container = document.getElementById("Pong");
    if (!container)
        return;
    container.innerHTML = `
		<button id="back-button" class="btn rounded-lg border p-4 shadow">Retour</button>
		<h2 class="text-xl font-semibold">Combien de joueurs?</h2>
		<div class="flex justify-center gap-4 mt-4">
			<button id="3p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="3">3 joueurs</button>
			<button id="4p-button" class="player-count-btn btn rounded-lg border p-4 shadow" data-count="4">4 joueurs</button>
		</div>
	`;
    const backButton = document.getElementById("back-button");
    if (backButton) {
        backButton.addEventListener("click", () => {
            const appElement = document.getElementById('app');
            if (appElement)
                appElement.innerHTML = homePage();
        });
    }
    document.querySelectorAll(".player-count-btn").forEach((btn) => {
        btn.addEventListener("click", (event) => {
            const target = event.target;
            const playerCount = parseInt(target.dataset.count || "2", 10);
            showAliasInputs(playerCount);
        });
    });
}
function showAliasInputs(playerCount) {
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
        backButton.addEventListener("click", (event) => { showPlayerCountSelection(); });
    const startButton = document.getElementById("start-tournament");
    if (startButton)
        startButton.addEventListener("click", startTournament);
}
