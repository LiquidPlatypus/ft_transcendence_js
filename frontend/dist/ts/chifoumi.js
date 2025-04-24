import { showHome } from "./script.js";
import { t } from "../lang/i18n.js";
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
export function start_pfc(event) {
    const container = document.getElementById("pfc");
    if (!container)
        return;
    let inputsHTML = "";
    for (let i = 1; i <= 2; i++) {
        inputsHTML += `
			<div class="mt-2">
				<label for="playerAlias${i}" class="block text-lg">${t("player")} ${i} :</label>
				<input type="text" id="playerAlias${i}" class="border p-2 rounded w-full" placeholder="Joueur ${i}">
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
        init();
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
    const body = document.body;
    const title = creerElement("h1", "", "Chifoumi");
    const instructions1 = creerElement("p", "", "Joueur 1 : A = 🗑 | Z = 📋 | E = ✂");
    const instructions2 = creerElement("p", "", "Joueur 2 : J = 🗑 | K = 📋 | L = ✂");
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
    const scores = creerElement("div", "", "Score J1: 0 | Score J2: 0");
    scores.id = "scores";
    const vainqueur = creerElement("div", "", "");
    vainqueur.id = "vainqueur";
    body.append(title, instructions1, instructions2, arena, resultat, scores, vainqueur);
    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();
        if (!choixJ1 && touchesJ1[key]) {
            choixJ1 = touchesJ1[key];
        }
        else if (!choixJ2 && touchesJ2[key]) {
            choixJ2 = touchesJ2[key];
        }
        if (choixJ1 && choixJ2) {
            afficherCombat(fightZone, fightJ1, fightJ2, choixJ1, choixJ2);
            setTimeout(() => {
                const result = comparer(choixJ1, choixJ2);
                resultat.textContent = `J1: ${choixJ1} | J2: ${choixJ2} => ${result}`;
                scores.textContent = `Score J1: ${scoreJ1} | Score J2: ${scoreJ2}`;
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
    });
}
function afficherCombat(zone, el1, el2, c1, c2) {
    el1.textContent = symbols[c1];
    el2.textContent = symbols[c2];
    zone.classList.add("fight-in");
}
function comparer(c1, c2) {
    if (c1 === c2)
        return "Égalité !";
    if ((c1 === "pierre" && c2 === "ciseaux") ||
        (c1 === "feuille" && c2 === "pierre") ||
        (c1 === "ciseaux" && c2 === "feuille")) {
        scoreJ1++;
        return "Joueur 1 gagne la manche !";
    }
    else {
        scoreJ2++;
        return "Joueur 2 gagne la manche !";
    }
}
function verifierVainqueur(div) {
    if (scoreJ1 >= 5) {
        div.textContent = "Victoire du Joueur 1!";
        document.removeEventListener("keydown", handleKeydown);
    }
    else if (scoreJ2 >= 5) {
        div.textContent = "Victoire du Joueur 2!";
        document.removeEventListener("keydown", handleKeydown);
    }
}
function handleKeydown() { } // neutre pour suppression d'écouteur
