export function homePage() {
	return `
		<div class="container mx-auto py-10 text-center">
			<h1 class="font-bold mb-4 text-4xl">Pong</h1>
			<div class="grid grid-cols-2 justify-center gap-10">
				<div class="rounded-lg border p-4 shadow">
					<h2 class="mb-2 text-2xl font-semibold">Pong</h2>
					<div id="Pong" class="grid grid-cols-2 justify-center gap-4">
						<div class="flex justify-center">
							<button id="match-button" class="btn rounded-lg border p-4 shadow">Match</button>
						</div>
						<div class="flex justify-center">
							<button id="tournament-button" class="btn rounded-lg border p-4 shadow">Tournoi</button>
						</div>
					</div>
				</div>
				<div class="rounded-lg border p-4 shadow">
					<h2 class="mb-2 text-2xl font-semibold">Pierre-feuille-ciseaux</h2>
					<div class="grid grid-cols-1 justify-center gap-0">
						<div class="flex justify-center">
							<button id="pfc-button" class="btn rounded-lg border p-4 shadow">Jouer</button>
						</div>
					</div>
				</div>
			</div>
			<div class="mt-4 grid grid-cols-2 justify-center gap-10">
				<div class="flex justify-center">
					<button id="pong-hist-btn" class="btn rounded-lg border p-4 shadow">Historique</button>
				</div>
				<div class="flex justify-center">
					<button id="pfc-hist-btn" class="btn rounded-lg border p-4 shadow">Historique</button>
				</div>
			</div>
		</div>

	`;
}