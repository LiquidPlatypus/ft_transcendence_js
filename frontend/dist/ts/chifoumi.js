var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showHome } from "./script.js";
import { loadLanguage, t, getCurrentLang } from "../lang/i18n.js";
let scoreJ1 = 0;
let scoreJ2 = 0;
let choixJ1 = null;
let choixJ2 = null;
const symbols = {
    pierre: "🗑",
    feuille: "📋",
    ciseaux: "✂"
};
const touchesJ1 = { a: 'pierre', z: 'feuille', e: 'ciseaux' };
const touchesJ2 = { j: 'pierre', k: 'feuille', l: 'ciseaux' };
export function config_pfc(event) {
    return __awaiter(this, void 0, void 0, function* () {
        const savedLang = localStorage.getItem('lang') || 'en';
        if (getCurrentLang() !== savedLang)
            yield loadLanguage(savedLang);
        const container = document.getElementById("pfc");
        if (!container)
            return;
        let inputsHTML = "";
        for (let i = 1; i <= 2; i++) {
            inputsHTML += `
			<div class="mt-2">
				<label for="playerAlias${i}" class="block text-lg">${t("player")} ${i} :</label>
				<input type="text" id="playerAlias${i}" class="border p-2 rounded w-full" placeholder="${t("player_alias_ph")} ${i}">
			</div>
		`;
        }
        container.innerHTML = `
		<div class="flex flex-col item-center gap-4">
			<button id="back-button" class="btn rounded-lg border p-4 shadow">${t("back")}</button>
			<h2 class="text-xl font-semibold">${t("enter_pl_alias")}</h2>
		</div>
		<div class="flex flex-col items-center w-full mb-2">
			${inputsHTML}
		</div>
		<div class="flex justify-center">
			<button id="start" class="btn rounded-lg border p-1 pe-1 shadow justify-center">${t("begin")}</button>
		</div>
	`;
        const backButton = document.getElementById("back-button");
        if (backButton) {
            backButton.addEventListener("click", () => {
                showHome();
            });
        }
        const startButton = document.getElementById("start");
        if (startButton)
            start_pfc(startButton);
    });
}
function start_pfc(startButton) {
    startButton.addEventListener("click", () => __awaiter(this, void 0, void 0, function* () {
        const player1 = document.getElementById("playerAlias1").value;
        const player2 = document.getElementById("playerAlias2").value;
        console.log(`Match entre ${player1} et ${player2}`);
        localStorage.setItem('player1Alias', player1);
        localStorage.setItem('player2Alias', player2);
        try {
            const player1Response = yield fetch('api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: player1 }),
            }).then(res => res.json());
            const player2Response = yield fetch('api/players', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: player2 }),
            }).then(res => res.json());
            if (player1Response.success && player2Response.success) {
                const matchResponse = yield fetch("api/players/match", {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        player1Id: player1Response.id,
                        player2Id: player2Response.id,
                        gameType: 'pfc'
                    }),
                }).then(res => res.json());
                if (matchResponse.success) {
                    localStorage.setItem('currentMatchId', matchResponse.matchId.toString());
                    init();
                }
            }
        }
        catch (error) {
            console.error(`${t("error_match_creation")}`, error);
        }
    }));
}
function creerElement(tag, className, textContent) {
    const el = document.createElement(tag);
    if (className)
        el.className = className;
    if (textContent)
        el.textContent = textContent;
    return el;
}
function init() {
    const container = document.getElementById("pfc");
    if (!container)
        return;
    container.innerHTML = "";
    const title = creerElement("h1", "", t("pfc"));
    const rockSymbol = symbols.pierre;
    const paperSymbol = symbols.feuille;
    const scissorSymbol = symbols.ciseaux;
    const instructions1 = creerElement("p", "", `${t("player")} 1 : A = ${rockSymbol} | Z = ${paperSymbol} | E = ${scissorSymbol}`);
    const instructions2 = creerElement("p", "", `${t("player")} 2 : J = ${rockSymbol} | K = ${paperSymbol} | L = ${scissorSymbol}`);
    const arena = creerElement("div", "arena", "");
    arena.id = "arena";
    const colJ1 = creerElement("div", "player-column", "");
    const colJ2 = creerElement("div", "player-column", "");
    const fightZone = creerElement("div", "fight-zone", "");
    const fightJ1 = creerElement("div", "fight-symbol", "");
    fightJ1.id = "fight-j1";
    const fightJ2 = creerElement("div", "fight-symbol", "");
    fightJ2.id = "fight-j2";
    fightZone.append(fightJ1, fightJ2);
    for (let c of ['pierre', 'feuille', 'ciseaux']) {
        colJ1.appendChild(creerElement("div", "choice", symbols[c]));
        colJ2.appendChild(creerElement("div", "choice", symbols[c]));
    }
    arena.append(colJ1, fightZone, colJ2);
    const resultat = creerElement("div", "", "");
    resultat.id = "resultat";
    const scores = creerElement("div", "", `${t("score")} ${t("player")} 1: 0 | ${t("score")} ${t("player")} 2: 0`);
    scores.id = "scores";
    const vainqueur = creerElement("div", "", "");
    vainqueur.id = "vainqueur";
    container.append(title, instructions1, instructions2, arena, resultat, scores, vainqueur);
    function handleKeydown(e) {
        const key = e.key.toLowerCase();
        if (!choixJ1 && touchesJ1[key])
            choixJ1 = touchesJ1[key];
        else if (!choixJ2 && touchesJ2[key])
            choixJ2 = touchesJ2[key];
        if (choixJ1 && choixJ2) {
            afficherCombat(fightZone, fightJ1, fightJ2, choixJ1, choixJ2);
            setTimeout(() => {
                const result = comparer(choixJ1, choixJ2);
                const choixJ1Traduit = t(getChoixTranslationKey(choixJ1));
                const choixJ2Traduit = t(getChoixTranslationKey(choixJ2));
                resultat.textContent = `${t("player")} 1: ${choixJ1Traduit} | ${t("player")} 2: ${choixJ2Traduit} => ${result}`;
                scores.textContent = `${t("score")} ${t("player")} 1: ${scoreJ1} | ${t("score")} ${t("player")} 2: ${scoreJ2}`;
                if (scoreJ1 >= 5 || scoreJ2 >= 5)
                    verifierVainqueur(vainqueur);
                setTimeout(() => {
                    fightZone.classList.remove("fight-in");
                    fightJ1.textContent = "";
                    fightJ2.textContent = "";
                }, 1000);
                choixJ1 = null;
                choixJ2 = null;
            }, 800);
        }
    }
    document.addEventListener("keydown", handleKeydown);
    function verifierVainqueur(div) {
        if (scoreJ1 >= 5 || scoreJ2 >= 5) {
            const player1Alias = localStorage.getItem('player1Alias') || t("player") + " 1";
            const player2Alias = localStorage.getItem('player2Alias') || t("player") + " 2";
            if (scoreJ1 >= 5)
                div.textContent = player1Alias + t("as_won");
            else
                div.textContent = player2Alias + t("as_won");
        }
        document.removeEventListener("keydown", handleKeydown);
        const returnButton = creerElement("button", "btn rounded-lg border p-4 shadow", t("menu"));
        returnButton.id = "return-button";
        div.appendChild(returnButton);
        returnButton.addEventListener("click", () => {
            showHome();
        });
        const matchId = localStorage.getItem('currentMatchId');
        if (matchId) {
            fetch('api/players/match/score', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    matchId: parseInt(matchId),
                    player1Score: scoreJ1,
                    player2Score: scoreJ2
                }),
            }).catch(error => {
                console.error(`${t("error_score_save")}:`, error);
            });
        }
        scoreJ1 = 0;
        scoreJ2 = 0;
    }
}
function afficherCombat(zone, el1, el2, c1, c2) {
    el1.textContent = symbols[c1];
    el2.textContent = symbols[c2];
    zone.classList.add("fight-in");
}
function comparer(c1, c2) {
    if (c1 === c2)
        return t("equality") || "Égalité !";
    if ((c1 === "pierre" && c2 === "ciseaux") ||
        (c1 === "feuille" && c2 === "pierre") ||
        (c1 === "ciseaux" && c2 === "feuille")) {
        scoreJ1++;
        return t("player_wins_round", { player: "1" }) || t("player") + " 1 " + t("wins_round") || "Joueur 1 gagne la manche !";
    }
    else {
        scoreJ2++;
        return t("player_wins_round", { player: "2" }) || t("player") + " 2 " + t("wins_round") || "Joueur 2 gagne la manche !";
    }
}
function getChoixTranslationKey(choix) {
    switch (choix) {
        case 'pierre': return 'rock';
        case 'feuille': return 'paper';
        case 'ciseaux': return 'scissor';
        default: return choix;
    }
}
