/**
 * @brief Change le theme du site.
 * @param themeName nom du theme a utiliser.
 */
export function changeTheme(themeName: string) {
	// Recupere l'element body.
	const body = document.body;

	// Supprime les classes de theme actuelles.
	body.classList.remove('bg-catpuccin', 'text-catpuccin-text', 'bg-green-600', 'text-white', 'bg-black', 'bg-gray-100', 'text-black');

	// Reinitialise toutes les variables CSS de theme a leurs valeurs par défaut
	// pour eviter qu'elles ne persistent entre les changements de theme.
	const resetCSSVars = () => {
		document.documentElement.style.setProperty('--color-button', '');
		document.documentElement.style.setProperty('--color-button-hover', '');
		document.documentElement.style.setProperty('--color-hist', '');
	};

	resetCSSVars();

	// Met a jour les variables CSS en fonction du theme choisit.
	switch(themeName) {
		case 'CP': // Catpuccin
			body.classList.add('bg-catpuccin', 'text-catpuccin-text');
			document.documentElement.style.setProperty('--color-button', 'oklch(47.65% 0.034 278.64)');
			document.documentElement.style.setProperty('--color-button-hover', 'oklch(87.87% 0.0426 272.28)');
			document.documentElement.style.setProperty('--color-hist', 'oklch(0.34 0.048 278.64)');
			document.documentElement.style.setProperty('--button-text-color', 'oklch(87.87% 0.0426 272.28)');
			break;

		case 'HC': // High contrast
			body.classList.add('bg-green-600', 'text-white');
			document.documentElement.style.setProperty('--color-button', 'oklch(0.7 0.2384 145.06)');
			document.documentElement.style.setProperty('--color-button-hover', 'oklch(0.41 0.0929 145.06)');
			document.documentElement.style.setProperty('--color-hist', 'oklch(0.56 0.2384 145.06)');
			document.documentElement.style.setProperty('--button-text-color', 'white');
			break;

		case 'OLED': // OLED
			body.classList.add('bg-black', 'text-white');
			document.documentElement.style.setProperty('--color-button', 'black');
			document.documentElement.style.setProperty('--color-button-hover', 'oklch(0.37 0 145.06)');
			document.documentElement.style.setProperty('--color-hist', 'oklch(0.59 0 145.06)');
			document.documentElement.style.setProperty('--button-text-color', 'white');
			break;

		case 'WHITE': // White
			body.classList.add('bg-gray-100', 'text-black');
			document.documentElement.style.setProperty('--color-button', '#e5e7eb');
			document.documentElement.style.setProperty('--color-button-hover', 'oklch(0.82 0 266.82)');
			document.documentElement.style.setProperty('--color-hist', '#e5e7eb');
			document.documentElement.style.setProperty('--button-text-color', 'black');
			break;
	}

	// Sauvegarde le theme dans localStorage.
	localStorage.setItem('theme', themeName);

	// Force la mise a jour des boutons.
	updateButtonStyles();
}

function updateButtonStyles() {
	const buttons = document.querySelectorAll('button');

	buttons.forEach(button => {
		const el = button as HTMLElement;
		el.style.backgroundColor = '';
		el.style.backgroundColor = 'var(-color-button)';
		el.style.color = 'var(--button-text-color)';
	});
}

/**
 * @brief Attache les ecouteurs d'evenements aux boutons des themes.
 */
export function attachThemeListeners() {
	const themeButtons = document.querySelectorAll('[data-theme]');

	themeButtons.forEach(button => {
		button.addEventListener('click', (event) => {
			const target = event.currentTarget as HTMLElement;
			const theme = target.getAttribute('data-theme');
			if (theme)
				changeTheme(theme);
		});
	});
}

/**
 * @brief Initialise le theme au chargement de la page.
 */
export function initTheme() {
	const savedTheme = localStorage.getItem('theme') || 'CP'; // Theme par defaut.
	changeTheme(savedTheme);
}