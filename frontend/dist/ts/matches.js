var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { startGame } from "./script.js";
export function twoPlayersMatch(startButton) {
    startButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        const player1 = document.getElementById('playerAlias1').value;
        const player2 = document.getElementById('playerAlias2').value;
        console.log(`Match entre ${player1} et ${player2}`);
        // Stock les alias pour l'affichage en match.
        localStorage.setItem('player1Alias', player1);
        localStorage.setItem('player2Alias', player2);
        try {
            // Créer les joueurs
            const player1Response = yield fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: player1 }),
            }).then(res => res.json());
            const player2Response = yield fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: player2 }),
            }).then(res => res.json());
            // Créer le match
            if (player1Response.success && player2Response.success) {
                const matchResponse = yield fetch("/api/players/match", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        player1Id: player1Response.id,
                        player2Id: player2Response.id,
                        gameType: 'pong'
                    }),
                }).then(res => res.json());
                if (matchResponse.success) {
                    // Stocker l'ID du match pour l'utiliser à la fin de la partie
                    localStorage.setItem('currentMatchId', matchResponse.matchId.toString());
                    startGame(2);
                }
            }
        }
        catch (error) {
            console.error("Erreur lors de la création du match:", error);
        }
    }));
}
export function fourPlayersMatchs(startButton) {
    startButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        const player1 = document.getElementById('playerAlias1').value;
        const player2 = document.getElementById('playerAlias2').value;
        const player3 = document.getElementById('playerAlias3').value;
        const player4 = document.getElementById('playerAlias4').value;
        console.log(`Match entre ${player1}, ${player2}, ${player3} et ${player4}`);
        // Stock les alias pour l'affichage en match.
        localStorage.setItem('player1Alias', player1);
        localStorage.setItem('player2Alias', player2);
        localStorage.setItem('player3Alias', player3);
        localStorage.setItem('player4Alias', player4);
        try {
            const player1Response = yield fetch('/api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: player1 }),
            }).then(res => res.json());
            const player2Response = yield fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: player2 }),
            }).then(res => res.json());
            const player3Response = yield fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: player3 }),
            }).then(res => res.json());
            const player4Response = yield fetch("/api/players", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: player4 }),
            }).then(res => res.json());
            if (player1Response.success && player2Response.success && player3Response.success && player4Response.success) {
                const matchResponse = yield fetch("/api/players/match4", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        player1Id: player1Response.id,
                        player2Id: player2Response.id,
                        player3Id: player3Response.id,
                        player4Id: player4Response.id,
                        gameType: 'pong'
                    }),
                }).then(res => res.json());
                if (matchResponse.success) {
                    localStorage.setItem('currentMatchId', matchResponse.matchId.toString());
                    startGame(4);
                }
            }
        }
        catch (error) {
            console.error("Erreur lors de la création du match:", error);
        }
    }));
}
