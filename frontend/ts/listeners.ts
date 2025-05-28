import { loadLanguage } from "../lang/i18n.js";
import { showAliasInputs, showHistory, showHome } from "./script.js";
import {matchTypeChoice} from "./Utilities.js";
import {attachThemeListeners} from "./themeSwitcher.js";

/**
 * @brief Boutons de changement de langues.
 */
export function attachLanguageListeners() {
	document.querySelectorAll('[data-lang]').forEach((btn) => {
		btn.addEventListener('click', async (e) => {
			const target = (e.target as HTMLElement).closest('button');
			if (!target)
				return ;
			const lang = target.getAttribute('data-lang');
			if (!lang)
				return ;
			await loadLanguage(lang as 'fr' | 'en' | 'es');
			showHome();
		});
	});
}

/**
 * @brief Gere tout les boutons de la page d'acceuil.
 */
export function attachHomePageListeners() {
	const match_btn = document.getElementById('match-button');
	if (match_btn)
		match_btn.addEventListener("click", (event) => matchTypeChoice(event, 'match', 'pong'));

	const tournament_btn = document.getElementById("tournament-button");
	if (tournament_btn)
		tournament_btn.addEventListener("click", (event) => showAliasInputs(4, 'tournoi', 'normal', 'pong'));

	const pfc_button = document.getElementById("pfc-button");
	if (pfc_button)
		pfc_button.addEventListener("click", (event) => matchTypeChoice(event, 'match', 'pfc'));

	const pong_hist_btn = document.getElementById("pong-hist-btn");
	if (pong_hist_btn)
		pong_hist_btn.addEventListener("click", (event) => showHistory(event, 'pong'));

	const pfc_hist_btn = document.getElementById("pfc-hist-btn");
	if (pfc_hist_btn)
		pfc_hist_btn.addEventListener("click", (event) => showHistory(event, 'pfc'));

	attachThemeListeners();
}