var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let currentLang = 'en';
let translations = {};
export function loadLanguage(lang) {
    return __awaiter(this, void 0, void 0, function* () {
        const res = yield fetch(`/lang/${lang}.json`);
        translations = yield res.json();
        currentLang = lang;
        localStorage.setItem('lang', lang);
    });
}
export function t(key, vars) {
    let text = translations[key] || key;
    if (vars) {
        for (const [k, v] of Object.entries(vars)) {
            text = text.replace(`{{${k}}}`, String(v));
        }
    }
    return text;
}
export function getCurrentLang() {
    return currentLang;
}
