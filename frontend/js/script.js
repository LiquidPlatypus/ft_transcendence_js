document.addEventListener("DOMContentLoaded", () => {
	const button = document.querySelector("button");
	button.addEventListener("click", () => {
		alert("Le jeu va commencer !");
	});
});

let currentTournamentId = null;

async function startTournament() {
	const alias = document.getElementById('playerAlias').value;
	const players = [alias, "Bot1", "Bot2"];

	try {
		const response = await fetch('/tournaments', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ players })
		});

		const data = await response.json();
		console.log("Tournoi créé :", data.tournamentId);
	} catch (error) {
		console.error("Erreur :", error);
	}
}