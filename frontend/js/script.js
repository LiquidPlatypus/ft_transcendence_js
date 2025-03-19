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

	try {
		console.log("Création du tournoi...");
		const tournamentResponse = await fetch('/api/tournament', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({})
		});

		if (!tournamentResponse.ok)
			throw new Error(`Erreur lors de la création du tournoi: ${tournamentResponse.status}`);

		const tournamentData = await tournamentResponse.json();
		currentTournamentId = tournamentData.id;
		console.log("Tournoi créé : ", currentTournamentId);

		console.log("Création du joueur...");
		const playerResponse = await fetch(`/api/players`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({name: alias})
		});

		if(!playerResponse.ok)
			throw new Error(`Erreur lors de la création du joueur: ${playerResponse.status}`);

		const playerData = await playerResponse.json();
		const playerId = playerData.id;
		const addPlayerResponse = await fetch(`/api/tournaments/${currentTournamentId}/players`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({player_id: playerId})
		});

		if (!addPlayerResponse.ok)
			throw new Error(`Erreur lors de l'ajout du joueur au tournoi: ${addPlayerResponse.status}`);

		console.log("Joueur ajouté au tournoi avec succès");

		console.log("Activation du tournoi...");
		const activateResponse = await fetch(`/api/tournaments/${currentTournamentId}/status`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({status: 'active'}),
		});

		if (!activateResponse.ok)
			throw new Error (`Erreur lors de l'activation du tournoi: ${activateResponse.status}`);

		console.log("Tournoi activé avec succès.");

		const allPlayers = [playerId];
		const match1Response = await fetch(`api/tournament/${currentTournamentId}/matches`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({player1_id: allPlayers[0], player2_id: allPlayers[1]})
		});

		if (!match1Response.ok)
			throw new Error(`Erreur lors de la création du match 1: ${match1Response.status}`);

		console.log("Match 1 créé avec succès.");

		alert("Le tournoi a été créé avec succès et a démarré !");
	} catch (error) {
		console.error("Erreur :", error);
		alert(`Une erreur est survenue : ${error.message()}`);
	} finally {
		button.disabled = false;
	}
}