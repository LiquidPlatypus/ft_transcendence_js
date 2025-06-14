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
	private browserType: string = '';
	private isFirefox: boolean = false;

	private listenersInitialized: boolean = false;

	private constructor() {
		this.speechSynthesis = window.speechSynthesis;
		this.browserType = this.detectBrowser();
		this.isFirefox = this.browserType === 'firefox';

		console.log(`Navigateur detecte: ${this.browserType}`);
		if (this.isFirefox)
			this.setupFirefoxOptimizations();

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

		this.initializeGlobalListeners();
	}

	/**
	 * @brief Detecte le navigateur utilise.
	 */
	private detectBrowser(): string {
		const userAgent = navigator.userAgent.toLowerCase();

		if (userAgent.includes('firefox')) return 'firefox';
		if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome';

		return 'unknown';
	}

	/**
	 * @brief Configuration pour Firefox.
	 */
	private setupFirefoxOptimizations(): void {
		console.log('Application des optimisations du lecteur d\'écrans pour Firefox');

		setTimeout(() => {
			this.loadVoices();
		}, 1000);

		setInterval(() => {
			if (this.speechSynthesis.getVoices().length === 0)
				this.loadVoices();
		}, 30000);
	}
	/**
	 * @brief  Charge les voix dispo.
	 */
	private loadVoices(): void {
		if (this.isFirefox)
			this.speechSynthesis.cancel();

		const voices = this.speechSynthesis.getVoices();
		const currentLang = getCurrentLang();

		console.log(`Voix disponibles dans ${this.browserType} (${voices.length}):`, voices.map(v => `${v.name} (${v.lang}) [Local: ${v.localService}]`));

		// Map les langues aux codes de lange pour les voix.
		const langMap: Record<string, string[]> = {
			'fr': ['fr-FR', 'fr-CA', 'fr'],
			'en': ['en-US', 'en-GB', 'en-AU', 'en'],
			'es': ['es-ES', 'es-MX', 'es-AR', 'es']
		};

		const targetLangCodes = langMap[currentLang] || ['en'];

		// Cherche une voix correspondant a la langue actuelle.
		let selectedVoice = this.findBestVoiceForBrowser(voices, currentLang, targetLangCodes);
		if (!selectedVoice && voices.length > 0)
			selectedVoice = voices[0];

		this.voice = selectedVoice;
		console.log(`Voix sélectionnée:`, {name: this.voice?.name, lang: this.voice?.lang, local: this.voice?.localService, browser: this.browserType});

		this.adjustParametersForBrowserAndVoice(currentLang, this.voice);
	}

	/**
	 * @brief Trouve la meilleure voix selon le navigateur.
	 * @param voices voix.
	 * @param lang langue.
	 * @param langCodes code de langue.
	 */
	private findBestVoiceForBrowser(voices: SpeechSynthesisVoice[], lang: string, langCodes: string[]): SpeechSynthesisVoice | undefined {
		if (this.isFirefox)
			return this.findBestFirefoxVoice(voices, lang, langCodes);
		else
			return this.findBestChromeVoice(voices, lang, langCodes);
	}

	private findBestFirefoxVoice(voices: SpeechSynthesisVoice[], lang: string, langCodes: string[]): SpeechSynthesisVoice | undefined {
		console.log('Recherche une voix optimisée pour Firefox');

		const firefoxPreferred: Record<string, string[]> = {
			'fr': [
				'Microsoft Hortense', // Windows
				'Amélie', 'Virginie', 'Thomas', // macOS
				'French', 'Français', // Générique
				'eSpeak French' // Linux backup
			],
			'en': [
				'Microsoft Zira', 'Microsoft David', // Windows
				'Alex', 'Samantha', 'Victoria', // macOS
				'English', 'US English', 'UK English' // Générique
			],
			'es': [
				'Microsoft Helena', 'Microsoft Sabina', // Windows
				'Monica', 'Paulina', // macOS
				'Spanish', 'Español' // Générique
			]
		};

		const preferred = firefoxPreferred[lang] || [];

		// 1. Cherche dans les voix préférées Firefox
		for (const prefName of preferred) {
			const voice = voices.find(v =>
				v.name.toLowerCase().includes(prefName.toLowerCase()) &&
				langCodes.some(code => v.lang.toLowerCase().includes(code.toLowerCase()))
			);
			if (voice) {
				console.log(`🎯 Voix Firefox préférée trouvée: ${voice.name}`);
				return voice;
			}
		}

		// 2. Priorise les voix locales (meilleures en général)
		for (const langCode of langCodes) {
			const localVoice = voices.find(voice =>
				voice.lang === langCode && voice.localService
			);
			if (localVoice) {
				console.log(`🏠 Voix locale Firefox: ${localVoice.name}`);
				return localVoice;
			}
		}

		// 3. Correspondance exacte
		for (const langCode of langCodes) {
			const exactMatch = voices.find(voice => voice.lang === langCode);
			if (exactMatch) return exactMatch;
		}

		// 4. Correspondance partielle
		for (const langCode of langCodes) {
			const partialMatch = voices.find(voice =>
				voice.lang.startsWith(langCode.split('-')[0])
			);
			if (partialMatch) return partialMatch;
		}

		return voices[0];
	}

	/**
	 * @brief Optimisation pour Chrome/autres navigateurs.
	 * @param voices voix.
	 * @param lang langue.
	 * @param langCodes code de langue.
	 */
	private findBestChromeVoice(voices: SpeechSynthesisVoice[], lang: string, langCodes: string[]): SpeechSynthesisVoice | undefined {
		console.log('🌐 Recherche voix optimisée Chrome');

		// Chrome préfère les voix Google en ligne.
		const chromePreferred: Record<string, string[]> = {
			'fr': ['Google français', 'Microsoft Hortense', 'Amélie'],
			'en': ['Google US English', 'Google UK English Female', 'Microsoft Zira'],
			'es': ['Google español', 'Microsoft Helena', 'Monica']
		};

		const preferred = chromePreferred[lang] || [];

		for (const prefName of preferred) {
			const voice = voices.find(v =>
				v.name.toLowerCase().includes(prefName.toLowerCase())
			);
			if (voice) {
				console.log(`🎯 Voix Chrome préférée: ${voice.name}`);
				return voice;
			}
		}

		// Fallback standard.
		for (const langCode of langCodes) {
			const exactMatch = voices.find(voice => voice.lang === langCode);
			if (exactMatch) return exactMatch;
		}

		return voices[0];
	}

	/**
	 * @brief Ajuste les parametres en fonction du navigateur et de la voix.
	 * @param lang langue.
	 * @param voice voix.
	 */
	private adjustParametersForBrowserAndVoice(lang: string, voice: SpeechSynthesisVoice | undefined): void {
		const baseRate = 1.0;
		const basePitch = 1.0;

		switch (lang) {
			case 'fr':
				this.rate = baseRate * 0.9;
				break;

			case 'es':
				this.rate = baseRate * 0.95;
				break;

			default:
				this.rate = baseRate;
				break;
		}

		if (!voice)
			return ;

		const voiceName = voice.name.toLowerCase();

		// Ajustement specifiques a Firefox.
		if (this.isFirefox) {
			console.log('Application des ajustements spécifiques à Firefox');

			// firefox avec eSpeak (Linux) - pas ouf.
			if (voiceName.includes('espeak') || voiceName.includes('festival')) {
				this.rate *= 0.7;
				this.pitch = basePitch * 1.2;
				this.volume = Math.min(1.0, this.volume * 1.1);
				console.log('Ajustement eSpeak/Festival appliqués');
			}

			// Firefox avec voix Microsoft (Windows).
			else if (voiceName.includes('microsoft')) {
				this.rate *= 0.95;
				console.log('Ajustements Microsoft Firefox appliqués');
			}

			// Autres voix Firefox.
			else {
				this.rate *= 0.85;
				console.log('Ajustements génériques Firefox appliqués');
			}
		}

		// Ajustements Chrome/autres.
		else {
			if (voiceName.includes('google')) {
				this.pitch = basePitch * 0.95;
				console.log('Ajustements Google appliqués');
			}
		}

		// Limites de securite.
		this.rate = Math.max(0.1, Math.min(10, this.rate));
		this.pitch = Math.max(0, Math.min(2, this.pitch));

		console.log(` Paramètres finaux: rate=${this.rate.toFixed(2)}, pitch=${this.pitch.toFixed(2)}, volume=${this.volume.toFixed(2)}`);
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

		// Fix pour Firefox: divise les textes longs.
//		if (this.isFirefox && text.length > 200) {
//			const chunks = this.splitTextForFirefox(text);
//			this.queue.unshift(...chunks.slice(1));
//			this.speakChunk(chunks[0]);
//		} else
			this.speakChunk(text);
	}

	/**
	 * @brief Divise le texte pour Firefox.
	 * @param text text a diviser.
	 */
	private splitTextForFirefox(text: string): string[] {
		const maxLength = 150;
		const chunks: string[] = [];

		// Divise par phrases en premier.
		const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

		let currentChunk = '';

		for (const sentence of sentences) {
			if (currentChunk.length + sentence.length > maxLength && currentChunk.length > 0) {
				chunks.push(currentChunk.trim());
				currentChunk = sentence;
			} else
				currentChunk += (currentChunk.length > 0 ? '. ' : '') + sentence;
		}

		if (currentChunk.trim().length > 0)
			chunks.push(currentChunk.trim());

		return chunks.length > 0 ? chunks : [text];
	}

	/**
	 * @brief Pronoce un chunk de texte.
	 * @param text texte a prononcer.
	 */
	private speakChunk(text: string): void {
		const utterance = new SpeechSynthesisUtterance(text);
		utterance.volume = this.volume;
		utterance.rate = this.rate;
		utterance.pitch = this.pitch;

		if (this.voice)
			utterance.voice = this.voice;

		// Gestion d'erreur.
		utterance.onerror = (event) => {
			console.error('Erreur de synthèse:', event);

			if (this.isFirefox) {
				// Fix Firefox: recharge les voix et reessaie.
				setTimeout(() => {
					console.log('Retry Firefox après erreur');
					this.loadVoices();
					setTimeout(() => this.processQueue(), 500);
				}, 200);
			} else
				setTimeout(() => this.processQueue(), 100);
		};

		utterance.onend = () => {
			this.processQueue();
		};

		// Timeout plus long pour Firefox.
		const timeoutDuration = this.isFirefox ? 15000 : 10000
		const timeoutId = setTimeout(() => {
			console.warn(`Timeout ${this.browserType}`);
			this.speechSynthesis.cancel();
			this.processQueue();
		}, timeoutDuration);

		utterance.onend = () => {
			clearTimeout(timeoutId);
			this.processQueue();
		};

		this.speechSynthesis.speak(utterance);
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
	 * @brief Annonce l'element focus.
	 * @param element element focus.
	 */
	public announceFocusedElement(element: HTMLElement): void {
		if (!this.enabled)
			return;

		let announcement = '';

		// Priorité à aria-label, puis title, puis textContent, puis alt
		const text = element.getAttribute('aria-label') ||
			element.getAttribute('title') ||
			element.textContent?.trim() ||
			element.getAttribute('alt') || '';

		const role = element.getAttribute('role') || element.tagName.toLowerCase();

		if (role === 'button' || element.tagName.toLowerCase() === 'button') {
			const buttonText = this.getLocalizedMessage('buttonFocused', 'Bouton {{text}}', { text });
			announcement = buttonText;
		} else if (element.tagName.toLowerCase() === 'img') {
			const imageText = this.getLocalizedMessage('imageFocused', 'Image {{text}}', { text });
			announcement = imageText;
		} else {
			announcement = text || this.getLocalizedMessage('elementFocused', 'Élément sélectionné');
		}

		if (announcement) {
			this.speak(announcement);
		}
	}

	/**
	 * @brief Initialise les event listeners globaux.
	 */
	public initializeGlobalListeners(): void {
		// Evite de dupliquer les listeners.
		if (this.listenersInitialized) return;
		this.listenersInitialized = true;

		// Ecouteur global pour tous les elements qui recoivent le focus.
		document.addEventListener('focusin', (event) => {
			const target = event.target as HTMLElement;
			if (target && (
				target.tagName === 'BUTTON' ||
				target.getAttribute('role') === 'button' ||
				target.tagName === 'A' ||
				target.tagName === 'INPUT' ||
				target.tagName === 'SELECT' ||
				target.tagName === 'TEXTAREA'
			)) {
				this.announceFocusedElement(target);
			}
		});
	}
}