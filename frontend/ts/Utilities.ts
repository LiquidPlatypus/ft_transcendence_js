/**
 * @brief Desactive ou active les boutons au besoin.
 * @param currentContext div actuelles -> definie les boutons a desactiver.
 */
export function disableUnrelatedButtons(currentContext: 'pong' | 'pfc' | 'home') {
	// Selectionne tout les types de boutons.
	const langButtons = document.querySelectorAll('[data-lang]');
	const pongButtons = document.querySelectorAll('#match-button, #tournament-button, #pong-hist-btn');
	const pfcButtons = document.querySelectorAll('#pfc-button, #pfc-hist-btn');

	// Active ou desactive les boutons en fonction du contexte.
	if (currentContext === 'home') {
		enableElements(langButtons);
		enableElements(pongButtons);
		enableElements(pfcButtons);
	} else if (currentContext === 'pong') {
		disableElements(langButtons);
		disableElements(pfcButtons);
		disableElements(pongButtons);
	} else if (currentContext === 'pfc') {
		disableElements(langButtons);
		disableElements(pongButtons);
		disableElements(pfcButtons);
	}
}

/**
 * @brief Active les boutons.
 * @param elements boutons a activer.
 */
function enableElements(elements: NodeListOf<Element>) {
	elements.forEach(element => {
		if (element instanceof HTMLButtonElement) {
			element.disabled = false;
			element.classList.remove('opacity-50', 'cursor-not-allowed');
		}
	});
}

/**
 * @brief Desactive les boutons.
 * @param elements boutons a desactiver.
 */
function disableElements(elements: NodeListOf<Element>) {
	elements.forEach(element => {
		if (element instanceof HTMLButtonElement) {
			element.disabled = true;
			element.classList.add('opacity-50', 'cursor-not-allowed');
		}
	});
}