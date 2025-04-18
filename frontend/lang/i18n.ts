type Lang = 'en' | 'fr' | 'es';
let currentLang: Lang = 'en';
let translations: Record<string, string> = {};

export async function loadLanguage(lang: Lang) {
	const res = await fetch(`/lang/${lang}.json`);
	translations = await res.json();
	currentLang = lang;
	localStorage.setItem('lang', lang);
}

export function t(key: string): string {
	return translations[key] || key;
}


export function getCurrentLang(): Lang {
	return currentLang;
}