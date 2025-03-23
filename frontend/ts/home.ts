document.addEventListener('DOMContentLoaded', () => {
	const button: HTMLButtonElement | null = document.getElementById("tournament-button") as HTMLButtonElement;
	if (button) {
		button.addEventListener('click', () => {
			document.getElementById('app').innerHTML = tournamentSetup();
		});
	}
});

export function homePage() {
	return `
		<div class="container mx-auto text-center py-10">
			<h1 class="text-4xl font bold mb-4">Pong</h1>
			<button id="tournament-button" class="bg-blue-500 text-white px-4 py-2 rounded">Tournoi<</button>
		</div>
	`;
}

function tournamentSetup() {
	return `
		<div class="tournamentSetup flex flex-col items-center">
			<h1 class="text-6xl font-bold mb-10">Configuration du tournoi</h1>
			<label for="playerCount" class="text-lg font-bold mb-2">Combien de joueurs voulez-vous?</label>
			<input type="number" id="playerCount" class="border border-gray-400 rounded-md px-4 py-2 mb-4" placeholder="Nombre de joueurs (2-4)">
			<button id="start-tournament" class="bg-green-500 text-white px-4 py-2 rounded">Démarrer le Tournoi</button>
		</div>
	`;
}