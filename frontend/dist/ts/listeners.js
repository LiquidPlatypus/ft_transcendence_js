var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { loadLanguage } from "../lang/i18n.js";
import { showPlayerCountSelection, showHistory, showHome } from "./script.js";
export function attachLanguageListeners() {
    document.querySelectorAll('[data-lang]').forEach((btn) => {
        btn.addEventListener('click', (e) => __awaiter(this, void 0, void 0, function* () {
            const target = e.target.closest('button');
            if (!target)
                return;
            const lang = target.getAttribute('data-lang');
            if (!lang)
                return;
            yield loadLanguage(lang);
            showHome();
        }));
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
