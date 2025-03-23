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
		<div class="container mx-auto py-10 text-center">
			<h1 class="font bold mb-4 text-4xl">Pong</h1>
			<div class="grid grid-cols-2 justify-center gap-10">
			<div class="rounded-lg border p-4 shadow">
				<h2 class="mb-2 text-2xl font-semibold">Pong</h2>
				<div class="grid grid-cols-2 gap-0">
				<div class="rounded-lg border p-4 shadow">Match</div>
				<div class="rounded-lg border p-4 shadow">Tournoi</div>
				</div>
			</div>
			<div class="rounded-lg border p-4 shadow">
				<h2 class="mb-2 text-2xl font-semibold">Pierre-feuille-ciseaux</h2>
				<div class="grid grid-cols-1 gap-0">
				<div class="rounded-lg border p-4 shadow">Jouer</div>
				</div>
			</div>
			</div>
			<button id="tournament-button" class="rounded bg-blue-500 px-4 py-2 text-white">Tournoi</button>
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