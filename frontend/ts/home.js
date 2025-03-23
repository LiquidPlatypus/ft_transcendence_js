"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.homePage = homePage;
function homePage() {
    return "\n\t\t<div class=\"container mx-auto text-center py-10\">\n\t\t\t<h1 class=\"text-4xl font bold mb-4\">Pong</h1>\n\t\t\t<button id=\"tournament-button\" class=\"bg-blue-500 text-white px-4 py-2 rounded\">Tournoi<</button>\n\t\t</div>\n\t";
}
document.addEventListener('DOMContentLoaded', function () {
    var button = document.getElementById("tournament-button");
    if (button) {
        button.addEventListener('click', function () {
            document.getElementById('app').innerHTML = tournamentSetup();
        });
    }
});
function tournamentSetup() {
    return "\n\t\t<div class=\"tournamentSetup flex flex-col items-center\">\n\t\t\t<h1 class=\"text-6xl font-bold mb-10\">Configuration du tournoi</h1>\n\t\t\t<label for=\"playerCount\" class=\"text-lg font-bold mb-2\">Combien de joueurs voulez-vous?</label>\n\t\t\t<input type=\"number\" id=\"playerCount\" class=\"border border-gray-400 rounded-md px-4 py-2 mb-4\" placeholder=\"Nombre de joueurs (2-4)\">\n\t\t\t<button id=\"start-tournament\" class=\"bg-green-500 text-white px-4 py-2 rounded\">D\u00E9marrer le Tournoi</button>\n\t\t</div>\n\t";
}
