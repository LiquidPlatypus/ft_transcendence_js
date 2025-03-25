// Id du tournoi.
let currentTournamentId: string | null = null;

// Nombre max de joueur dans le tournoi.
const MAX_PLAYERS: number = 4;

// interface pour reponse API.
interface TournamentResponse {
	id: string;
}

interface PlayerResponse {
	id: string;
}

/**
 * @brief Demarre un tournoi apers verif dea alias joueurs.
 * @param event
 */
export async function startTournament(event: Event): Promise<void> {
	event.preventDefault();

	const button = event.target as HTMLButtonElement;
	button.disabled = true;

	// Recupere les alias des joueurs (4 max).
	const playerAliases: string[] = [];
	let playerCount = 0;

	// Récupérer les alias
	for (let i = 1; i <= 4; i++) {
		const input = document.getElementById(`playerAlias${i}`) as HTMLInputElement;
		if (input) {
			const alias = input.value.trim();
			if (alias) {
				playerAliases.push(alias);
				playerCount++;
			}
		}
	}

	alert("Le jeu va commencer !");

	try {
		console.log("Création du tournoi...");
		const tournamentResponse: Response = await fetch('/api/tournament', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({})
		});

		if (!tournamentResponse.ok)
			throw new Error(`Erreur lors de la création du tournoi: ${tournamentResponse.status}`);

		const tournamentData: TournamentResponse = await tournamentResponse.json();
		currentTournamentId = tournamentData.id;
		console.log("Tournoi créé : ", currentTournamentId);

		// Creation et ajout des joueurs.
		const playersIds: string[] = [];

		for (const alias of playerAliases) {
			console.log(`Création du joueur ${alias}...`);
			const playerResponse: Response = await fetch(`/api/players`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({name: alias})
			});

			if (!playerResponse.ok)
				throw new Error(`Erreur lors de la création du joueur ${alias}`);

			const playerData: PlayerResponse = await playerResponse.json();
			const playerId: string = playerData.id;
			playersIds.push(playerId);

			const addPlayerResponse: Response = await fetch(`/api/tournaments/${currentTournamentId}/players`, {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({player_id: playerId}),
			});

			if (!addPlayerResponse.ok)
				throw new Error(`Erreur lors de l'ajout du joueur ${alias} au tournoi: ${addPlayerResponse.status}`);

			console.log(`Joueur ${alias} ajouté au tournoi avec succès`);
		}

		console.log("Activation du tournoi...");
		const activateResponse: Response = await fetch(`/api/tournaments/${currentTournamentId}/activate`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({status: 'active'}),
		});

		if (!activateResponse.ok)
			throw new Error(`Erreur lors de l'activation du tournoi: ${activateResponse.status}`);

		console.log("Tournoi activé avec succès.");

		// Création des matchs.
		await createTournamentMatches(playersIds);

		alert("Le tournoi a été créé avec succès et a démarré !");
	} catch (error: any) {
		console.error("Erreur :", error);
		alert(`Une erreur est survenue : ${error.message}`);
	} finally {
		button.disabled = false;
	}
}

/**
 * @brief Crée les matchs du tournoi en fonction du nombre de joueurs.
 */
async function createTournamentMatches(playerIds: string[]): Promise<void> {
	if (!currentTournamentId) return;

	try {
		// Gestion des différents cas en fonction du nombre de joueurs.
		switch (playerIds.length) {
			case 1:
				// Un seul joueur - erreur.
				console.log("Pas assez de joueurs.");
				break;

			case 3:
				// Trois joueurs.
				console.log("Matchs pour 3 joueurs.");
				await createMatch(playerIds[0], playerIds[1], 'round1', 1);
				await createMatch(playerIds[1], playerIds[2], 'round2', 2);
				await createMatch(playerIds[0], playerIds[2], 'round3', 3);
				break;

			case 4:
				// Quatre joueurs - demi-finales puis finale.
				console.log("match pour 4 joueurs");
				// Demi-finales.
				await createMatch(playerIds[0], playerIds[1], 'semi-final', 1);
				await createMatch(playerIds[2], playerIds[3], 'semi-final', 2);
				// La finale sera créée après les demi-finales.
				break;

			default:
				console.log("Nombre de joueurs non pris en charge.");
				break;
		}
	} catch (error: any) {
		console.error("Erreur lors de la création des matches :", error);
		throw error;
	}
}

/**
 * @brief Crée un match entre 2 joueurs.
 * @param player1Id ID du premier joueur.
 * @param player2Id ID du second joueur.
 * @param round Nom du round.
 * @param matchNumber Numéro du match dans le round.
 */
async function createMatch(player1Id: string, player2Id: string, round: string, matchNumber: number): Promise<void> {
	if (!currentTournamentId) return;

	const matchResponse: Response = await fetch(`/api/tournaments/${currentTournamentId}/matches`, {
		method: 'POST',
		headers: {'Content-Type': 'application/json'},
		body: JSON.stringify({
			player1_id: player1Id,
			player2_id: player2Id,
			round: round,
			match_number: matchNumber
		})
	});

	if (!matchResponse.ok)
		throw new Error(`Erreur lors de la création du match ${matchNumber}: ${matchResponse.status}`);

	console.log(`Match ${matchNumber} du round ${round} créé avec succès.`);
}