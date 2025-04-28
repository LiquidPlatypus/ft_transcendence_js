export function disableUnrelatedButtons(currentContext: 'pong' | 'pfc' | 'home') {
	const langButtons = document.querySelectorAll('[data-lang]');
	const pongButtons = document.querySelectorAll('#match-button, #tournament-button, #pong-hist-btn');
	const pfcButtons = document.querySelectorAll('#pfc-button, #pfc-hist-btn');

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

function enableElements(elements: NodeListOf<Element>) {
	elements.forEach(element => {
		if (element instanceof HTMLButtonElement) {
			element.disabled = false;
			element.classList.remove('opacity-50', 'cursor-not-allowed');
		}
	});
}

function disableElements(elements: NodeListOf<Element>) {
	elements.forEach(element => {
		if (element instanceof HTMLButtonElement) {
			element.disabled = true;
			element.classList.add('opacity-50', 'cursor-not-allowed');
		}
	});
}