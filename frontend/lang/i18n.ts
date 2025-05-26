type Lang = 'en' | 'fr' | 'es';
let currentLang: Lang = 'en';
let translations: Record<string, string> = {};

export async function loadLanguage(lang: Lang) {
	const res = await fetch(`/lang/${lang}.json`);
	translations = await res.json();
	currentLang = lang;

	document.documentElement.lang = lang;

	localStorage.setItem('lang', lang);
}

export function t(key: string, vars?: Record<string, string | number>): string {
	let text = translations[key] || key;
	if (vars) {
		for (const [k, v] of Object.entries(vars)) {
			text = text.replace(`{{${k}}}`, String(v));
		}
	}
	return text;
}


export function getCurrentLang(): Lang {
	return currentLang;
}