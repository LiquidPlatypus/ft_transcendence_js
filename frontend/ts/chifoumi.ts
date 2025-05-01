import { homePage } from "./home.js";
import { showHome } from "./script.js";
import { loadLanguage, t, getCurrentLang } from "../lang/i18n.js";
import {disableUnrelatedButtons} from "./Utilities.js";

type Choix = 'pierre' | 'feuille' | 'ciseaux';

let scoreJ1 = 0;
let scoreJ2 = 0;
let choixJ1: Choix | null = null;
let choixJ2: Choix | null = null;

const symbols: Record<Choix, string> = {
	pierre: "🗑",
	feuille: "📋",
	ciseaux: "✂"
};

const touchesJ1: Record<string, Choix> = { a: 'pierre', z: 'feuille', e: 'ciseaux' };
const touchesJ2: Record<string, Choix> = { j: 'pierre', k: 'feuille', l: 'ciseaux' };

/**
 * @brief Configuration du PFC avant de le lancer.
 * @param event evenement qui appelle la fonction.
 */
export async function config_pfc(event: Event) {
	const savedLang = localStorage.getItem('lang') as 'fr' | 'en' | 'es' || 'en';
	if (getCurrentLang() !== savedLang)
		await loadLanguage(savedLang);

	// Recupere le contenu de la div "pfc".
	const container = document.getElementById("pfc");
	if (!container)
		return ;

	// Empeche d'appuyer sur les boutons en dehors de cette div.
	disableUnrelatedButtons('pfc');

	// Creer les champs pour rentrer les alias des joueurs.
	let inputsHTML = "";
	for (let i = 1; i <= 2; i++) {
		inputsHTML += `
			<div class="mt-2">
				<label for="playerAlias${i}" class="block text-lg">${t("player")} ${i} :</label>
				<input type="text" id="playerAlias${i}" class="border p-2 rounded w-full" placeholder="${t("player_alias_ph")} ${i}">
			</div>
		`;
	}

	// Affiche les champs pour rentrer les alias.
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

	// Bouton retour.
	const backButton = document.getElementById("back-button");
	if (backButton) {
		backButton.addEventListener("click", () => {
			showHome();
		});
	}

	// Bouton commencer.
	const startButton = document.getElementById("start")
	if (startButton)
		start_pfc(startButton);
}

/**
 * @brief Lance le pfc et la logique du back.
 * @param startButton bouton start.
 */
function start_pfc(startButton: HTMLElement) {
	startButton.addEventListener("click", async () => {
		const player1 = (document.getElementById("playerAlias1") as HTMLInputElement).value;
		const player2 = (document.getElementById("playerAlias2") as HTMLInputElement).value;
		console.log(`Match entre ${player1} et ${player2}`);

		// Stock les alias dans le localStorage.
		localStorage.setItem('player1Alias', player1);
		localStorage.setItem('player2Alias', player2);

		try {
			// Creer les joueurs dans le back.
			const player1Response = await fetch('api/players', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({name: player1}),
			}).then(res => res.json());

			const player2Response = await fetch('api/players', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({name: player2}),
			}).then(res => res.json());

			if (player1Response.success && player2Response.success) {
				// Creer le match dans le back.
				const matchResponse = await fetch("api/players/match", {
					method: 'POST',
					headers: {'Content-Type': 'application/json'},
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
		} catch (error) {
			console.error(`${t("error_match_creation")}`, error);
		}
	});
}

function creerElement<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, textContent?: string): HTMLElementTagNameMap[K] {
	const el = document.createElement(tag);
	if (className) el.className = className;
	if (textContent) el.textContent = textContent;
	return el;
}

/**
 * @brief Gere le pfc.
 */
function init() {
	const container = document.getElementById("pfc");
	if (!container)
		return ;

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

	for (let c of ['pierre', 'feuille', 'ciseaux'] as Choix[]) {
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

	function handleKeydown(e: KeyboardEvent) {
		const key = e.key.toLowerCase();

		if (!choixJ1 && touchesJ1[key])
			choixJ1 = touchesJ1[key];
		else if (!choixJ2 && touchesJ2[key])
			choixJ2 = touchesJ2[key];

		if (choixJ1 && choixJ2) {
			afficherCombat(fightZone, fightJ1, fightJ2, choixJ1, choixJ2);
			setTimeout(() => {
				const result = comparer(choixJ1!, choixJ2!);

				const choixJ1Traduit = t(getChoixTranslationKey(choixJ1!));
				const choixJ2Traduit = t(getChoixTranslationKey(choixJ2!));

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

	function verifierVainqueur(div: HTMLElement) {
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
			// Envoie le score dans le back.
			fetch('api/players/match/score', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
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

function afficherCombat(zone: HTMLElement, el1: HTMLElement, el2: HTMLElement, c1: Choix, c2: Choix) {
	el1.textContent = symbols[c1];
	el2.textContent = symbols[c2];
	zone.classList.add("fight-in");
}

function comparer(c1: Choix, c2: Choix): string {
	if (c1 === c2) return t("equality") || "Égalité !";
	if (
		(c1 === "pierre" && c2 === "ciseaux") ||
		(c1 === "feuille" && c2 === "pierre") ||
		(c1 === "ciseaux" && c2 === "feuille")
	) {
		scoreJ1++;
		return t("player_wins_round", {player: "1"}) || t("player") + " 1 " + t("wins_round") || "Joueur 1 gagne la manche !";
	} else {
		scoreJ2++;
		return t("player_wins_round", {player: "2"}) || t("player") + " 2 " + t("wins_round") || "Joueur 2 gagne la manche !";
	}
}

function getChoixTranslationKey(choix: Choix): string {
	switch(choix) {
		case 'pierre': return 'rock';
		case 'feuille': return 'paper';
		case 'ciseaux': return 'scissor';
		default: return choix;
	}
}