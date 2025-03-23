"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var home_js_1 = require("./home.js");
var tournament_js_1 = require("./tournament.js");
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('app').innerHTML = (0, home_js_1.homePage)();
});
document.addEventListener("DOMContentLoaded", function () {
    var button = document.querySelector("button");
    if (button) {
        button.removeEventListener("click", tournament_js_1.startTournament);
        button.addEventListener("click", tournament_js_1.startTournament);
    }
});
