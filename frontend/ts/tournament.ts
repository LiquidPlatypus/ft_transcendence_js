import {startGame} from "./script.js";
import {check} from "yargs";

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

	// Nettoyage de localStorage
	Object.keys(localStorage).forEach((key) => {
		if (key.startsWith("player_") || key.endsWith("Alias")) {
			localStorage.removeItem(key);
		}
	});

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

	localStorage.setItem("player1Alias", playerAliases[0] || "Joueur 1");
	localStorage.setItem("player2Alias", playerAliases[1] || "Joueur 2");
	localStorage.setItem("player3Alias", playerAliases[2] || "Joueur 3");
	localStorage.setItem("player4Alias", playerAliases[3] || "Joueur 4");
	console.log(localStorage);

	try {
		console.log("Création du tournoi...");
		const tournamentResponse: Response = await fetch('/api/tournaments', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({})
		});

		if (!tournamentResponse.ok)
			throw new Error(`Erreur lors de la création du tournoi: ${tournamentResponse.status}`);

		const tournamentData: TournamentResponse = await tournamentResponse.json();
		currentTournamentId = tournamentData.id;
		console.log("Tournoi créé : ", currentTournamentId);

		// Save tournament ID to localStorage for access in other functions
		localStorage.setItem('currentTournamentId', currentTournamentId);

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

			localStorage.setItem(`player_${playerId}_name`, alias);

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
		await storePlayerNames(playersIds, playerAliases);
		await createTournamentMatches(playersIds);
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
			case 4:
				console.log("Matchs pour 4 joueurs");

				// Create semifinals
				console.log(`Demi-finale 1: ${playerIds[0]} vs ${playerIds[1]}`);
				console.log(`Demi-finale 2: ${playerIds[2]} vs ${playerIds[3]}`);

				const match1 = await createMatch(playerIds[0], playerIds[1], 'semi-final', 1);
				if (!match1)
					throw new Error("Échec de la création du premier match");

				const match2 = await createMatch(playerIds[2], playerIds[3], 'semi-final', 2);
				if (!match2)
					throw new Error("Échec de la création du deuxième match");

				console.log(`Match 1 ID: ${match1.id}, Match 2 ID: ${match2.id}`);

				// Store match IDs and set tournament mode
				localStorage.setItem('currentMatchId', match1.id.toString());
				localStorage.setItem('pendingMatchId', match2.id.toString());
				localStorage.setItem('tournamentMode', 'true');
				localStorage.setItem('semifinal1Id', match1.id.toString());
				localStorage.setItem('semifinal2Id', match2.id.toString());

				// Also store player IDs for final matchups
				localStorage.setItem('player1Id', playerIds[0]);
				localStorage.setItem('player2Id', playerIds[1]);
				localStorage.setItem('player3Id', playerIds[2]);
				localStorage.setItem('player4Id', playerIds[3]);

				// Start the first semifinal
				startGame(2);
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
async function createMatch(player1Id: string, player2Id: string, round: string, matchNumber: number): Promise<any> {
	if (!currentTournamentId) return null;

	try {
		console.log(`Tentative de création de match: ${player1Id} vs ${player2Id} (round: ${round})`);

		const matchResponse = await fetch(`/api/tournaments/${currentTournamentId}/matches`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({
				player1_id: player1Id,
				player2_id: player2Id,
				round: round,
				match_number: matchNumber,
				gameType: 'pong'
			})
		});

		if (!matchResponse.ok) {
			throw new Error(`Error creating match: ${matchResponse.status}`);
		}

		const matchData = await matchResponse.json();
		console.log("Réponse de création de match:", matchData); // Log complet de la réponse

		// Vérification plus robuste
		if (matchData.success) {
			let matchId;

			// Vérifier toutes les propriétés possibles où l'ID pourrait se trouver
			if (matchData.matchId !== undefined) {
				matchId = matchData.matchId;
			} else if (matchData.id !== undefined) {
				matchId = matchData.id;
			} else if (matchData.match && matchData.match.id !== undefined) {
				matchId = matchData.match.id;
			} else {
				console.error("Structure de réponse inattendue:", matchData);
				return null;
			}

			console.log(`Match créé avec ID: ${matchId}`);
			localStorage.setItem('currentMatchId', matchId.toString());
//			startGame(2);

			return { id: matchId };
		} else {
			console.error("Échec de création du match:", matchData.message || "Raison inconnue");
			return null;
		}
	} catch (error) {
		console.error("Erreur lors de la création du match:", error);
		return null;
	}
}

async function storePlayerNames(playerIds: string[], playerAliases: string[]): Promise<void> {
	// Stocker directement les IDs des joueurs
	for (let i = 0; i < playerIds.length; i++) {
		localStorage.setItem(`player${i+1}Id`, playerIds[i]);
		localStorage.setItem(`player${i+1}Alias`, playerAliases[i] || `Joueur ${i+1}`);
	}

	// Assurer que les enregistrements des joueurs sont corrects
	console.log("Stockage des informations des joueurs:");
	for (let i = 0; i < playerIds.length; i++) {
		console.log(`Joueur ${i+1}: ID=${playerIds[i]}, Nom=${playerAliases[i]}`);
	}
}