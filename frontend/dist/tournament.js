var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// Id du tournoi.
let currentTournamentId = null;
// Nombre max de joueur dans le tournoi.
const MAX_PLAYERS = 4;
/**
 * @brief Demarre un tournoi apers verif dea alias joueurs.
 * @param event
 */
export function startTournament(event) {
    return __awaiter(this, void 0, void 0, function* () {
        event.preventDefault();
        const button = event.target;
        button.disabled = true;
        // Recupere les alias des joueurs (4 max).
        const playerAliases = [];
        let playerCount = 0;
        // Récupérer les alias
        for (let i = 1; i <= 4; i++) {
            const input = document.getElementById(`playerAlias${i}`);
            if (input) {
                const alias = input.value.trim();
                if (alias) {
                    playerAliases.push(alias);
                    playerCount++;
                }
            }
        }
        try {
            console.log("Création du tournoi...");
            const tournamentResponse = yield fetch('/api/tournaments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            if (!tournamentResponse.ok)
                throw new Error(`Erreur lors de la création du tournoi: ${tournamentResponse.status}`);
            const tournamentData = yield tournamentResponse.json();
            currentTournamentId = tournamentData.id;
            console.log("Tournoi créé : ", currentTournamentId);
            // Creation et ajout des joueurs.
            const playersIds = [];
            for (const alias of playerAliases) {
                console.log(`Création du joueur ${alias}...`);
                const playerResponse = yield fetch(`/api/players`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: alias })
                });
                if (!playerResponse.ok)
                    throw new Error(`Erreur lors de la création du joueur ${alias}`);
                const playerData = yield playerResponse.json();
                const playerId = playerData.id;
                playersIds.push(playerId);
                const addPlayerResponse = yield fetch(`/api/tournaments/${currentTournamentId}/players`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ player_id: playerId }),
                });
                if (!addPlayerResponse.ok)
                    throw new Error(`Erreur lors de l'ajout du joueur ${alias} au tournoi: ${addPlayerResponse.status}`);
                console.log(`Joueur ${alias} ajouté au tournoi avec succès`);
            }
            console.log("Activation du tournoi...");
            const activateResponse = yield fetch(`/api/tournaments/${currentTournamentId}/activate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'active' }),
            });
            if (!activateResponse.ok)
                throw new Error(`Erreur lors de l'activation du tournoi: ${activateResponse.status}`);
            console.log("Tournoi activé avec succès.");
            // Création des matchs.
            yield createTournamentMatches(playersIds);
        }
        catch (error) {
            console.error("Erreur :", error);
            alert(`Une erreur est survenue : ${error.message}`);
        }
        finally {
            button.disabled = false;
        }
    });
}
/**
 * @brief Crée les matchs du tournoi en fonction du nombre de joueurs.
 */
function createTournamentMatches(playerIds) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentTournamentId)
            return;
        try {
            // Gestion des différents cas en fonction du nombre de joueurs.
            switch (playerIds.length) {
                case 3:
                    // Trois joueurs.
                    console.log("Matchs pour 3 joueurs.");
                    yield createMatch(playerIds[0], playerIds[1], 'round1', 1);
                    yield createMatch(playerIds[1], playerIds[2], 'round2', 2);
                    yield createMatch(playerIds[0], playerIds[2], 'round3', 3);
                    break;
                case 4:
                    console.log("match pour 4 joueurs");
                    // Création des demi-finales
                    const match1 = yield createMatch(playerIds[0], playerIds[1], 'semi-final', 1);
                    const match2 = yield createMatch(playerIds[2], playerIds[3], 'semi-final', 2);
                    // Attente de la fin des deux demi-finales
                    yield waitMatchFinish(match1.matchId);
                    yield waitMatchFinish(match2.matchId);
                    // Récupérer les gagnants
                    const winner1 = yield getMatchWinner(match1.matchId);
                    const winner2 = yield getMatchWinner(match2.matchId);
                    // Lancer la finale avec des strings
                    yield createMatch(String(winner1), String(winner2), 'final', 3);
                    break;
                default:
                    console.log("Nombre de joueurs non pris en charge.");
                    break;
            }
        }
        catch (error) {
            console.error("Erreur lors de la création des matches :", error);
            throw error;
        }
        function waitMatchFinish(matchId) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise((resolve) => {
                    const checkMatchStatus = () => __awaiter(this, void 0, void 0, function* () {
                        const response = yield fetch(`/api/matches/${matchId}/status`);
                        const data = yield response.json();
                        if (data.status === 'completed')
                            resolve();
                        else
                            setTimeout(checkMatchStatus, 2000);
                    });
                    checkMatchStatus();
                });
            });
        }
        function getMatchWinner(matchId) {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield fetch(`/api/matches/${matchId}/winner`);
                const data = yield response.json();
                return String(data.winner_id); // ✅ Convertit en string
            });
        }
    });
}
/**
 * @brief Crée un match entre 2 joueurs.
 * @param player1Id ID du premier joueur.
 * @param player2Id ID du second joueur.
 * @param round Nom du round.
 * @param matchNumber Numéro du match dans le round.
 */
function createMatch(player1Id, player2Id, round, matchNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentTournamentId)
            throw new Error("Aucun tournoi actif");
        try {
            const matchResponse = yield fetch(`/api/tournaments/${currentTournamentId}/matches`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    player1_id: player1Id,
                    player2_id: player2Id,
                    round: round,
                    match_number: matchNumber,
                    gameType: 'pong'
                })
            });
            const data = yield matchResponse.json();
            if (!data.success)
                throw new Error("Erreur lors de la création du match");
            console.log(`Match ${matchNumber} du round ${round} créé avec succès.`);
            return { matchId: data.matchId }; // ✅ Retourne l'ID du match
        }
        catch (error) {
            console.error("Erreur lors de la création du match:", error);
            throw error;
        }
    });
}
