import {startGame} from "./script.js";
import {screenReader} from "./screenReader.js";

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

	try {
		const tournamentResponse: Response = await fetch('/api/tournaments', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({})
		});

		if (!tournamentResponse.ok)
			throw new Error(`Erreur lors de la création du tournoi: ${tournamentResponse.status}`);

		const tournamentData: TournamentResponse = await tournamentResponse.json();
		currentTournamentId = tournamentData.id;

		// Sauvegarde l'ID du tournoi dans le localStorage our y accéder dans les autres fonctions.
		localStorage.setItem('currentTournamentId', currentTournamentId);

		// Creation et ajout des joueurs.
		const playersIds: string[] = [];

		for (const alias of playerAliases) {
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
		}

		const activateResponse: Response = await fetch(`/api/tournaments/${currentTournamentId}/activate`, {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({status: 'active'}),
		});

		if (!activateResponse.ok)
			throw new Error(`Erreur lors de l'activation du tournoi: ${activateResponse.status}`);

		// Création des matchs.
		await storePlayerNames(playersIds, playerAliases);
		await createTournamentMatches(playersIds, playerAliases);
	} catch (error: any) {
		alert(`Une erreur est survenue : ${error.message}`);
	} finally {
		button.disabled = false;
	}
}

/**
 * @brief Affiche l'ordre des matchs du tournoi.
 * @param playerAliases noms des joueurs.
 */
function displayTournamentAnnouncement(playerAliases: string[]): Promise<void> {
	return new Promise((resolve) => {
		// Creer l'overlay d'annonce.
		const overlay = document.createElement('div');
		overlay.id = 'tournament-announcement';
		overlay.className = 'tournament-overlay';

		const currentTheme = document.body.className;
		overlay.style.cssText = `
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			background: rgba(0, 0, 0, 0.85);
			display: flex;
			flex-direction: column;
			justify-content: center;
			align-items: center;
			z-index: 10000;
			font-size: var(--font-size-base, 1rem);
			font-weight: var(--font-weight-base, 400);
			line-height: var(--line-height-base, 1.5);
		`;

		// Container principal
		const mainContainer = document.createElement('div');
		mainContainer.style.cssText = `
			background: var(--color-hist, #333);
			color: var(--color-hist-text, white);
			padding: 2rem;
			border-radius: 8px;
			max-width: 600px;
			width: 90%;
			text-align: center;
			box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
		`;

		// Titre principal.
		const title = document.createElement('h1');
		title.textContent = 'Ordre des matchs';
		title.style.cssText = `
			margin-bottom: 1.5rem;
			font-size: calc(var(--font-size-base, 1rem) * 1.8);
			font-weight: var(--font-weight-base, 400);
		`;

		// Demi-finales.
		const semifinalsSection = document.createElement('div');
		semifinalsSection.style.cssText = `margin-bottom: 1.5rem;`;

		const semifinalsTitle = document.createElement('h2');
		semifinalsTitle.textContent = 'Demi-finales';
		semifinalsTitle.style.cssText = `
			margin-bottom: 1rem;
			font-size: calc(var(--font-size-base, 1rem) * 1.3);
			font-weight: var(--font-weight-base, 400);
		`;

		const match1 = document.createElement('p');
		match1.textContent = `Match 1: ${playerAliases[0]} vs ${playerAliases[1]}`;
		match1.style.cssText = `
			margin: 0.5rem 0;
			padding: 0.5rem;
			background: var(--color-button, #555);
			color: var(--button-text-color, white);
			border-radius: 4px;
		`;

		const match2 = document.createElement('p');
		match2.textContent = `Match 2: ${playerAliases[2]} vs ${playerAliases[3]}`;
		match2.style.cssText = `
			margin: 0.5rem 0;
			padding: 0.5rem;
			background: var(--color-button, #555);
			color: var(--button-text-color, white);
			border-radius: 4px;
		`;

		// Finales.
		const finalsSection = document.createElement('div');
		finalsSection.style.cssText = `margin-bottom: 1.5rem;`;

		const finalsTitle = document.createElement('h2');
		finalsTitle.textContent = 'Finales';
		finalsTitle.style.cssText = `
			margin-bottom: 1rem;
			font-size: calc(var(--font-size-base, 1rem) * 1.3);
			font-weight: var(--font-weight-base, 400);
		`;

		const finalMatch = document.createElement('p');
		finalMatch.textContent = 'Finale: Gagnant Match 1 vs Gagnant Match 2';
		finalMatch.style.cssText = `
			margin: 0.5rem 0;
			padding: 0.5rem;
			background: var(--color-button, #555);
			color: var(--button-text-color, white);
			border-radius: 4px;
		`;

		const thirdPlaceMatch = document.createElement('p');
		thirdPlaceMatch.textContent = '3ème place: Perdant Match 1 vs Perdant Match 2';
		thirdPlaceMatch.style.cssText = `
			margin: 0.5rem 0;
			padding: 0.5rem;
			background: var(--color-button, #555);
			color: var(--button-text-color, white);
			border-radius: 4px;
		`;

		// Compteur.
		const countdown = document.createElement('div');
		countdown.style.cssText = `
			margin-top: 1.5rem;
			font-size: calc(var(--font-size-base, 1rem) * 1.2);
			font-weight: var(--font-weight-base, 400);
		`;

		// Assemble l'annonce.
		semifinalsSection.appendChild(semifinalsTitle);
		semifinalsSection.appendChild(match1);
		semifinalsSection.appendChild(match2);

		finalsSection.appendChild(finalsTitle);
		finalsSection.appendChild(finalMatch);
		finalsSection.appendChild(thirdPlaceMatch);

		mainContainer.appendChild(title);
		mainContainer.appendChild(semifinalsSection);
		mainContainer.appendChild(finalsSection);
		mainContainer.appendChild(countdown);

		overlay.appendChild(mainContainer);
		document.body.appendChild(overlay);

		// Compteur de 3 secondes.
		let count = 3;
		countdown.textContent = `Le tournoi commence dans ${count} secondes...`;

		const timer = setInterval(() => {
			count--;
			if (count > 0) {
				countdown.textContent = `Le tournoi commence dans ${count} secondes...`;
			} else {
				countdown.textContent = "Le tournoi commence !";
				clearInterval(timer);

				// Supprime l'overlay après une courte pause.
				setTimeout(() => {
					document.body.removeChild(overlay);
					resolve();
				}, 500);
			}
		}, 1000);
	});
}

/**
 * @brief Crée les matchs du tournoi en fonction du nombre de joueurs.
 */
async function createTournamentMatches(playerIds: string[], playerAliases: string[]): Promise<void> {
	if (!currentTournamentId) return;

	try {
		// Gestion des différents cas en fonction du nombre de joueurs.
		switch (playerIds.length) {
			case 4:
				// Afficher l'annonce de l'ordre des matchs
				await displayTournamentAnnouncement(playerAliases);


				const match1 = await createMatch(playerIds[0], playerIds[1], 'semi-final', 1);
				if (!match1)
					throw new Error("Échec de la création du premier match");

				const match2 = await createMatch(playerIds[2], playerIds[3], 'semi-final', 2);
				if (!match2)
					throw new Error("Échec de la création du deuxième match");

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
				startGame(2, 'normal');
				break;

			default:
				break;
		}
	} catch (error: any) {
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
		// Get player names to check if either is AI
		const player1Name = localStorage.getItem(`player_${player1Id}_name`) || '';
		const player2Name = localStorage.getItem(`player_${player2Id}_name`) || '';

		// Store AI status for the match
		localStorage.setItem('isPlayer1AI', (player1Name.toLowerCase() === 'ai').toString());
		localStorage.setItem('isPlayer2AI', (player2Name.toLowerCase() === 'ai').toString());

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
				return null;
			}

			localStorage.setItem('currentMatchId', matchId.toString());

			return { id: matchId };
		} else {
			return null;
		}
	} catch (error) {
		return null;
	}
}

async function storePlayerNames(playerIds: string[], playerAliases: string[]): Promise<void> {
	// Stocker directement les IDs des joueurs
	for (let i = 0; i < playerIds.length; i++) {
		localStorage.setItem(`player${i+1}Id`, playerIds[i]);
		localStorage.setItem(`player${i+1}Alias`, playerAliases[i] || `Joueur ${i+1}`);
	}
}