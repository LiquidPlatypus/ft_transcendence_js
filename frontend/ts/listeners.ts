import { loadLanguage } from "../lang/i18n.js";
import { showPlayerCountSelection, showHistory, showHome } from "./script.js";

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

export function attachHomePageListeners() {
	const match_btn = document.getElementById('match-button');
	if (match_btn)
		match_btn.addEventListener("click", (event) => showPlayerCountSelection(event, 'match'));

	const tournament_btn = document.getElementById("tournament-button");
	if (tournament_btn)
		tournament_btn.addEventListener("click", (event) => showPlayerCountSelection(event, 'tournoi'));

	const pong_hist_btn = document.getElementById("pong-hist-btn");
	if (pong_hist_btn)
		pong_hist_btn.addEventListener("click", (event) => showHistory(event, 'pong'));

	const pfc_hist_btn = document.getElementById("pfc-hist-btn");
	if (pfc_hist_btn)
		pfc_hist_btn.addEventListener("click", (event) => showHistory(event, 'pfc'));
}
