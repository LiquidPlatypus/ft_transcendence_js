import { homePage } from './home.js'
import { startTournament } from './tournament.js';

document.addEventListener('DOMContentLoaded', () => {
	document.getElementById('app').innerHTML = homePage();
})

document.addEventListener("DOMContentLoaded", () => {
	const button: HTMLButtonElement | null = document.querySelector("button");
	if (button) {
		button.removeEventListener("click", startTournament);
		button.addEventListener("click", startTournament);
	}
});


