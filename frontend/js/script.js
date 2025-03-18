document.addEventListener("DOMContentLoaded", () => {
	const button = document.querySelector("button");
	if (button) {
		button.removeEventListener("click", startTournament);
		button.addEventListener("click", startTournament);
	}
});

let currentTournamentId = null;

async function startTournament() {
	event.preventDefault();

	const button = event.target;
	button.disabled = true;

	const alias = document.getElementById('playerAlias').value.trim();
	if (!alias) {
		alert("Veuillez entrer un alias valide !");
		button.disabled = false;
		return ;
	}

	alert("Le jeu va commencer !");

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
	} finally {
		button.disabled = false;
	}
}