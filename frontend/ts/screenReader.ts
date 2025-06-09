import {getCurrentLang, t} from "../lang/i18n.js";

/**
 * @brief Classe gerant la fonctionnalité de lecture d'ecran.
 */
export class screenReader {
	private static instance: screenReader;
	private enabled: boolean = false;
	private speechSynthesis: SpeechSynthesis;
	private voice: SpeechSynthesisVoice | undefined;
	private volume: number = 1.0;
	private rate: number = 1.0;
	private pitch: number = 1.0;
	private queue: string[] = [];
	private speaking: boolean = false;

	private constructor() {
		this.speechSynthesis = window.speechSynthesis;

		// Cherche une voix francaise.
		this.loadVoices();
		// Ecoute l'evenement voiceschanged pour les navigateurs qui chargent les voix asynchronement.
		this.speechSynthesis.addEventListener('voiceschanged', () => this.loadVoices());

		// Ecoute les changements de langue pour mettre a jour la voix.
		document.addEventListener('languageChanged', () => {
			this.loadVoices();
		});

		// Charge l'état depuis le localStorage si dispo.
		const savedState = localStorage.getItem('screenReaderEnabled');
		if (savedState)
			this.enabled = savedState === 'true';
	}

	/**
	 * @brief Recupere l'instance de screenReader.
	 */
	public static getInstance(): screenReader {
		if (!screenReader.instance)
			screenReader.instance = new screenReader();
		return screenReader.instance;
	}

	/**
	 * @brief  Charge les voix dispo et essaie de prendre la voix francaise.
	 */
	private loadVoices(): void {
		const voices = this.speechSynthesis.getVoices();
		const currentLang = getCurrentLang();

		// Map les langues aux codes de lange pour les voix.
		const langMap: Record<string, string[]> = {
			'fr': ['fr-FR', 'fr-CA', 'fr'],
			'en': ['en-US', 'en-GB', 'en-AU', 'en'],
			'es': ['es-ES', 'es-MX', 'es-AR', 'es']
		};

		const targetLangCodes = langMap[currentLang] || ['en'];

		// Cherche une voix correspondant a la langue actuelle.
		let selectedVoice = this.findVoiceByLanguage(voices, targetLangCodes);

		// Si pas de voix pour la langue courante, utilise la pre;iere dispo.
		if (!selectedVoice && voices.length > 0)
			selectedVoice = voices[0];

		this.voice = selectedVoice;
		console.log(`Voix sélectionnée pour ${currentLang}:`, this.voice?.name, this.voice?.lang);

		// Ajuste la vitesse en fonction de la langue.
		this.adjustRateForLanguage(currentLang);
	}

	/**
	 * @brief Trouve une voix correspondant aux codes de langue donnes.
	 * @param voices voix.
	 * @param langCodes codes de langue.
	 */
	private findVoiceByLanguage(voices: SpeechSynthesisVoice[], langCodes: string[]): SpeechSynthesisVoice | undefined {
		// Cherche en premier une correspondance exacte.
		for (const langCode of langCodes) {
			const exactMatch = voices.find(voice => voice.lang === langCode);
			if (exactMatch)
				return exactMatch;
		}

		// Ou une correspondance partielle.
		for (const langCode of langCodes) {
			const partialMatch = voices.find(voice => voice.lang.startsWith(langCode.split('-')[0]));
			if (partialMatch)
				return partialMatch;
		}

		return undefined;
	}

	/**
	 * @brief Ajuste la vitesse en fonction de la langue choisie.
	 * @param lang langue choisie.
	 * @private
	 */
	private adjustRateForLanguage(lang: string): void {
		const baseRate = this.rate;
		switch (lang) {
			case 'fr':
				this.rate = Math.max(0.1, baseRate * 0.9);
				break;

			case 'es':
				this.rate = Math.max(0.1, baseRate * 0.95);
				break;

			case 'en':

			default:
				break;
		}
	}

	/**
	 * @brief Active ou desactive le screen reader.
	 * @param enabled actif ou non.
	 */
	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;
		localStorage.setItem('screenReaderEnabled', enabled.toString());

		if (enabled) {
			// Utilise une cle de traduction si disponible.
			const message = this.getLocalizedMessage('screenReaderEnabled', "Lecteur d'écran activé");
			this.speak(message);
		} else {
			const message = this.getLocalizedMessage('screenReaderDisabled', "Lecteur d'écran désactivé");
			this.speak(message);
		}
	}

	/**
	 * @brief Obtient un message localise ou utilise un fallback.
	 * @param key phrase a traduire.
	 * @param fallback si fonctionne pas.
	 * @param vars a mettre dans la phrase.
	 * @private
	 */
	private getLocalizedMessage(key: string, fallback: string, vars?: Record<string, string | number | null>): string {
		console.log('🔍 getLocalizedMessage called with:', { key, fallback, vars });

		try {
			// Essaie d'abord d'obtenir la traduction sans variables.
			const rawTranslation = t(key);
			console.log('📝 Raw translation result:', rawTranslation);

			// Si on a une traduction valide (differente de la cle.)
			if (rawTranslation && rawTranslation !== key) {
				// Applique manuellement les variables.
				if (vars) {
					let text = rawTranslation;
					for (const [k, v] of Object.entries(vars)) {
						console.log(`🔄 Replacing {{${k}}} with "${v}" in "${text}"`);
						text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
					}
					console.log('✅ Final translated text:', text);
					return text;
				}
				return rawTranslation;
			}

			// Sinon utilise le fallback.
			console.log('⚠️ No translation found, using fallback');
			if (vars && fallback) {
				let text = fallback;
				for (const [k, v] of Object.entries(vars)) {
					console.log(`🔄 Fallback: Replacing {{${k}}} with "${v}" in "${text}"`);
					text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
				}
				console.log('✅ Final fallback text:', text);
				return text;
			}
			return fallback;

		} catch (error) {
			console.error('❌ Error in getLocalizedMessage:', error);
			// En cas d'erreur, utilise le fallback avec substitution.
			if (vars && fallback) {
				let text = fallback;
				for (const [k, v] of Object.entries(vars)) {
					text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
				}
				console.log('🔧 Error fallback with substitution:', text);
				return text;
			}
			return fallback;
		}
	}

	/**
	 * @brief Verifie si le screen reader est actif.
	 */
	public isEnabled(): boolean {
		return this.enabled;
	}

	/**
	 * @brief Lit le texte.
	 * @param text texte à lire.
	 * @param priority priorité du texte.
	 */
	public speak(text: string, priority: boolean = false): void {
		if (!this.enabled)
			return ;

		if (priority) {
			// Annule les annonces en cours pour le message prioritaire.
			this.speechSynthesis.cancel();
			this.queue = [];
			this.speaking = false;
		}

		// Ajoute le texte a la file d'attente.
		this.queue.push(text);

		// Si aucune lecture n'est en cours, commence à lire.
		if (!this.speaking)
			this.processQueue();
	}

	/**
	 * @brief Traite la file d'attente.
	 */
	private processQueue(): void {
		if (this.queue.length === 0){
			this.speaking = false;
			return ;
		}

		this.speaking = true;
		const text = this.queue.shift() || "";

		const utterance = new SpeechSynthesisUtterance(text);
		utterance.volume = this.volume;
		utterance.rate = this.rate;
		utterance.pitch = this.pitch;

		if (this.voice)
			utterance.voice = this.voice;

		utterance.onend = () => this.processQueue();

		this.speechSynthesis.speak(utterance);
	}

	/**
	 * @brief Regle le volume (0.0 a 1.0).
	 * @param volume valeur du volume.
	 */
	public setvolume(volume: number): void {
		this.volume = Math.max(0, Math.min(1, volume));
	}

	/**
	 * @brief Regle la vitesse (0.1 a 10).
	 * @param rate valeur de la vitesse.
	 */
	public setRate(rate: number): void {
		this.rate = Math.max(0.1, Math.min(10, rate));
		// Reapplique l'ajustement de langue.
		this.adjustRateForLanguage(getCurrentLang());
	}

	/**
	 * @brief Regle la hauteur de la voix (0 a 2).
	 * @param pitch valeur de la hauteur.
	 */
	public setPitch(pitch: number): void {
		this.pitch = Math.max(0, Math.min(2, pitch));
	}

	/**
	 * @brief Annonce le score.
	 * @param player1Score score du j1.
	 * @param player2Score score du j2.
	 * @param player3Score score du j3.
	 * @param player4Score score du j4.
	 */
	public announceScore(player1Score: number, player2Score: number, player3Score: number | null, player4Score: number | null): void {
		if (!this.enabled)
			return ;

		const player1Name = localStorage.getItem('player1Alias') || this.getLocalizedMessage('player1Default', 'Joueur 1');
		const player2Name = localStorage.getItem('player2Alias') || this.getLocalizedMessage('player2Default', 'Joueur 2');

		if (!player3Score) {
			const scoreMessage = this.getLocalizedMessage('scoreAnnouncement', 'Score: {{player1}} {{score1}}, {{player2}} {{score2}}', {
				player1: player1Name,
				score1: player1Score,
				player2: player2Name,
				score2: player2Score
			});
			this.speak(scoreMessage);
		}

		if (player3Score) {
			const player3Name = localStorage.getItem('player3Alias') || this.getLocalizedMessage('player3Default', 'Joueur 3');
			const player4Name = localStorage.getItem('player4Alias') || this.getLocalizedMessage('player4Default', 'Joueur 4');

			const scoreMessage = this.getLocalizedMessage('scoreAnnouncement4Players', 'Score: {{player1}} {{score1}}, {{player2}} {{score2}}, {{player3}} {{score3}}, {{player4}} {{score4}}', {
				player1: player1Name,
				score1: player1Score,
				player2: player2Name,
				score2: player2Score,
				player3: player3Name,
				score3: player3Score,
				player4: player4Name,
				score4: player4Score
			});
			this.speak(scoreMessage);
		}
	}

	/**
	 * @brief Annonce un evenement du jeu.
	 * @param event event a annoncer.
	 */
	public announceGameEvent(event: string): void {
		if (!this.enabled)
			return ;
		this.speak(event);
	}

	/**
	 * @brief Annonce un changement de page.
	 * @param pageName nom de la page.
	 */
	public announcePageChange(pageName: string): void {
		if (!this.enabled)
			return ;

		console.log('Announcing page change for:', pageName);
		console.log('Current language:', getCurrentLang());

		const message = this.getLocalizedMessage('pageLoaded', 'Page {{pageName}} chargée', { pageName });
		console.log('Final message:', message);

		this.speak(message, true);
	}

	/**
	 * @brief Met à jour la voix selon la langue courante.
	 */
	public updateVoiceForCurrentLanguage(): void {
		this.loadVoices();
	}
}