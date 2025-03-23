"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startTournament = startTournament;
// Id du tournoi.
var currentTournamentId = null;
// Nombre max de joueur dans le tournoi.
var MAX_PLAYERS = 4;
/**
 * @brief Demarre un tournoi apers verif dea alias joueurs.
 * @param event
 */
function startTournament(event) {
    return __awaiter(this, void 0, void 0, function () {
        var button, playerAliases, mainPlayerInput, mainAlias, i, playerInput, alias, tournamentResponse, tournamentData, playersIds, _i, playerAliases_1, alias, playerResponse, playerData, playerId, addPlayerResponse, activateResponse, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    event.preventDefault();
                    button = event.target;
                    button.disabled = true;
                    playerAliases = [];
                    mainPlayerInput = document.getElementById('playerAlias');
                    mainAlias = (mainPlayerInput === null || mainPlayerInput === void 0 ? void 0 : mainPlayerInput.value.trim()) || "";
                    if (!mainAlias) {
                        alert("Veuillez entrer un alias valide pour le joueur 1 !");
                        button.disabled = false;
                        return [2 /*return*/];
                    }
                    playerAliases.push(mainAlias);
                    // Recupere les alias des joueurs additionnels
                    for (i = 2; i <= MAX_PLAYERS; i++) {
                        playerInput = document.getElementById("playerAlias".concat(i));
                        if (playerInput) {
                            alias = playerInput.value.trim();
                            if (alias)
                                playerAliases.push(alias);
                        }
                    }
                    if (playerAliases.length < 2) {
                        alert("Minimum 2 joueur requis.");
                        button.disabled = false;
                        return [2 /*return*/];
                    }
                    alert("Le jeu va commencer !");
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 12, 13, 14]);
                    console.log("Création du tournoi...");
                    return [4 /*yield*/, fetch('/api/tournament', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({})
                        })];
                case 2:
                    tournamentResponse = _a.sent();
                    if (!tournamentResponse.ok)
                        throw new Error("Erreur lors de la cr\u00E9ation du tournoi: ".concat(tournamentResponse.status));
                    return [4 /*yield*/, tournamentResponse.json()];
                case 3:
                    tournamentData = _a.sent();
                    currentTournamentId = tournamentData.id;
                    console.log("Tournoi créé : ", currentTournamentId);
                    playersIds = [];
                    _i = 0, playerAliases_1 = playerAliases;
                    _a.label = 4;
                case 4:
                    if (!(_i < playerAliases_1.length)) return [3 /*break*/, 9];
                    alias = playerAliases_1[_i];
                    console.log("Cr\u00E9ation du joueur ".concat(alias, "..."));
                    return [4 /*yield*/, fetch("/api/players", {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ name: alias })
                        })];
                case 5:
                    playerResponse = _a.sent();
                    if (!playerResponse.ok)
                        throw new Error("Erreur lors de la cr\u00E9ation du joueur ".concat(alias));
                    return [4 /*yield*/, playerResponse.json()];
                case 6:
                    playerData = _a.sent();
                    playerId = playerData.id;
                    playersIds.push(playerId);
                    return [4 /*yield*/, fetch("/api/tournaments//".concat(currentTournamentId, "/players"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ player_id: playerId }),
                        })];
                case 7:
                    addPlayerResponse = _a.sent();
                    if (!addPlayerResponse)
                        throw new Error("Erreur lors de l'ajout du joueur ".concat(alias, " au tournoi: ").concat(addPlayerResponse.status));
                    console.log("Joueur ".concat(alias, " ajout\u00E9 au tournoi avec succ\u00E8s"));
                    _a.label = 8;
                case 8:
                    _i++;
                    return [3 /*break*/, 4];
                case 9:
                    console.log("Activation du tournoi...");
                    return [4 /*yield*/, fetch("/api/tournaments/".concat(currentTournamentId, "/activate"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ status: 'active' }),
                        })];
                case 10:
                    activateResponse = _a.sent();
                    if (!activateResponse)
                        throw new Error("Erreur lors de l'activation du tournoi: ".concat(activateResponse.status));
                    console.log("Tournoi activé avec succès.");
                    // Création des matchs.
                    return [4 /*yield*/, createTournamentMatches(playersIds)];
                case 11:
                    // Création des matchs.
                    _a.sent();
                    alert("Le tournoi a été créé avec succès et a démarré !");
                    return [3 /*break*/, 14];
                case 12:
                    error_1 = _a.sent();
                    console.error("Erreur :", error_1);
                    alert("Une erreur est survenue : ".concat(error_1.message));
                    return [3 /*break*/, 14];
                case 13:
                    button.disabled = false;
                    return [7 /*endfinally*/];
                case 14: return [2 /*return*/];
            }
        });
    });
}
/**
 * @brief Crée les matchs du tournoi en fonction du nombre de joueurs.
 */
function createTournamentMatches(playerIds) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!currentTournamentId)
                        return [2 /*return*/];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 14, , 15]);
                    _a = playerIds.length;
                    switch (_a) {
                        case 1: return [3 /*break*/, 2];
                        case 2: return [3 /*break*/, 3];
                        case 3: return [3 /*break*/, 5];
                        case 4: return [3 /*break*/, 9];
                    }
                    return [3 /*break*/, 12];
                case 2:
                    // Un seul joueur - erreur.
                    console.log("Pas assez de joueurs.");
                    return [3 /*break*/, 13];
                case 3:
                    // Deux joueurs - match simple.
                    console.log("Match à 2 joueurs.");
                    return [4 /*yield*/, createMatch(playerIds[0], playerIds[1], 'final', 1)];
                case 4:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 5:
                    // Trois joueurs.
                    console.log("Matchs pour 3 joueurs.");
                    return [4 /*yield*/, createMatch(playerIds[0], playerIds[1], 'round1', 1)];
                case 6:
                    _b.sent();
                    return [4 /*yield*/, createMatch(playerIds[1], playerIds[2], 'round2', 2)];
                case 7:
                    _b.sent();
                    return [4 /*yield*/, createMatch(playerIds[0], playerIds[2], 'round3', 3)];
                case 8:
                    _b.sent();
                    return [3 /*break*/, 13];
                case 9:
                    // Quatre joueurs - demi-finales puis finale.
                    console.log("match pour 4 joueurs");
                    // Demi-finales.
                    return [4 /*yield*/, createMatch(playerIds[0], playerIds[1], 'semi-final', 1)];
                case 10:
                    // Demi-finales.
                    _b.sent();
                    return [4 /*yield*/, createMatch(playerIds[2], playerIds[3], 'semi-final', 2)];
                case 11:
                    _b.sent();
                    // La finale sera créée après les demi-finales.
                    return [3 /*break*/, 13];
                case 12:
                    console.log("Nombre de joueurs non pris en charge.");
                    return [3 /*break*/, 13];
                case 13: return [3 /*break*/, 15];
                case 14:
                    error_2 = _b.sent();
                    console.error("Erreur lors de la création des matches :", error_2);
                    throw error_2;
                case 15: return [2 /*return*/];
            }
        });
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
    return __awaiter(this, void 0, void 0, function () {
        var matchResponse;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!currentTournamentId)
                        return [2 /*return*/];
                    return [4 /*yield*/, fetch("/api.tournaments/".concat(currentTournamentId, "/matches"), {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                player1_id: player1Id,
                                player2_id: player2Id,
                                round: round,
                                match_number: matchNumber
                            })
                        })];
                case 1:
                    matchResponse = _a.sent();
                    if (!matchResponse.ok)
                        throw new Error("Erreur lors de la cr\u00E9ation du match ".concat(matchNumber, ": ").concat(matchResponse.status));
                    console.log("Match ".concat(matchNumber, " du round ").concat(round, " cr\u00E9\u00E9 avec succ\u00E8s."));
                    return [2 /*return*/];
            }
        });
    });
}
