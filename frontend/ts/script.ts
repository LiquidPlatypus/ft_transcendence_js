import { homePage } from './home.js'
import { startTournament } from './tournament.js';

document.addEventListener('DOMContentLoaded', () => {
	const appElement = document.getElementById('app');
	if (appElement) {
		appElement.innerHTML = homePage();
	}
})

document.addEventListener("DOMContentLoaded", () => {
	const button: HTMLButtonElement | null = document.getElementById("tournament-button") as HTMLButtonElement;
	if (button) {
		button.removeEventListener("click", startTournament);
		button.addEventListener("click", startTournament);
	}
});


