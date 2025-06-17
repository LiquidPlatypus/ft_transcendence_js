import {getCurrentLang, t} from "../lang/i18n.js";

/**
 * @brief Classe gerant la fonctionnalité de lecture d'ecran.
 */
export class screenReader {
	private static instance: screenReader;
	private enabled: boolean = false;
	private speechSynthesis: SpeechSynthesis;
	private voice: SpeechSynthesisVoice | null = null;
	private volume: number = 1.0;
	private rate: number = 1.0;
	private pitch: number = 1.0;
	private queue: string[] = [];
	private speaking: boolean = false;
	private browserType: string = '';
	private isFirefox: boolean = false;
	private sounds: Map<string, HTMLAudioElement> = new Map();

	private listenersInitialized: boolean = false;

	private lastButtonAnnouncement: number = 0;
	private readonly BUTTON_ANNOUNCEMENT_DELAY = 1500;

	private currentSpeakTimeoutId: number | null = null;
	private currentUtterance: SpeechSynthesisUtterance | null = null;

	private constructor() {
		this.speechSynthesis = window.speechSynthesis;
		this.browserType = this.detectBrowser();
		this.isFirefox = this.browserType === 'firefox';

//		console.log(`Navigateur detecte: ${this.browserType}`);
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

		this.loadSound('paddleGauche', '../static/beep_paddle_gauche.mp3');
		this.loadSound('paddleDroit', '../static/beep_paddle_droit.mp3');
		this.loadSound('paddleHaut', '../static/beep_paddle_haut.mp3');
		this.loadSound('paddleBas', '../static/beep_paddle_bas.mp3');
		this.loadSound('wall', '../static/wall.mp3');
		this.loadSound('bonus', '../static/bonus.mp3');
		this.loadSound('scoreP1', '../static/scoreP1.mp3');
		this.loadSound('scoreP2', '../static/scoreP2.mp3');
		this.loadSound('scoreP3', '../static/scoreP3.mp3');
		this.loadSound('scoreP4', '../static/scoreP4.mp3');

		this.initializeGlobalListeners();
	}

	/**
	 * @brief Annule les annonces en cours et dans la queue.
	 */
	public cancelSpeech(): void {
		console.log(`🗣️ [cancelSpeech] Annulation de la lecture en cours et effacement de la file.`);
		this.speechSynthesis.cancel();
		this.queue = [];
		this.speaking = false;
		this.clearSpeakTimeout(); // Clear any pending speak timeout
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
//		console.log('Application des optimisations du lecteur d\'écrans pour Firefox');

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

//		console.log(`Voix disponibles dans ${this.browserType} (${voices.length}):`, voices.map(v => `${v.name} (${v.lang}) [Local: ${v.localService}]`));

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
//		console.log(`Voix sélectionnée:`, {name: this.voice?.name, lang: this.voice?.lang, local: this.voice?.localService, browser: this.browserType});

		this.adjustParametersForBrowserAndVoice(currentLang, this.voice);
	}

	/**
	 * @brief Trouve la meilleure voix selon le navigateur.
	 * @param voices voix.
	 * @param lang langue.
	 * @param langCodes code de langue.
	 */
	private findBestVoiceForBrowser(voices: SpeechSynthesisVoice[], lang: string, langCodes: string[]): SpeechSynthesisVoice {
		if (this.isFirefox)
			return this.findBestFirefoxVoice(voices, lang, langCodes);
		else
			return this.findBestChromeVoice(voices, lang, langCodes);
	}

	private findBestFirefoxVoice(voices: SpeechSynthesisVoice[], lang: string, langCodes: string[]): SpeechSynthesisVoice{
//		console.log('Recherche une voix optimisée pour Firefox');

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
//				console.log(`🎯 Voix Firefox préférée trouvée: ${voice.name}`);
				return voice;
			}
		}

		// 2. Priorise les voix locales (meilleures en général)
		for (const langCode of langCodes) {
			const localVoice = voices.find(voice =>
				voice.lang === langCode && voice.localService
			);
			if (localVoice) {
//				console.log(`🏠 Voix locale Firefox: ${localVoice.name}`);
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
	private findBestChromeVoice(voices: SpeechSynthesisVoice[], lang: string, langCodes: string[]): SpeechSynthesisVoice {
//		console.log('🌐 Recherche voix optimisée Chrome');

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
//				console.log(`🎯 Voix Chrome préférée: ${voice.name}`);
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
	private adjustParametersForBrowserAndVoice(lang: string, voice: SpeechSynthesisVoice | null): void {
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
//			console.log('Application des ajustements spécifiques à Firefox');

			// firefox avec eSpeak (Linux) - pas ouf.
			if (voiceName.includes('espeak') || voiceName.includes('festival')) {
				this.rate *= 0.7;
				this.pitch = basePitch * 1.2;
				this.volume = Math.min(1.0, this.volume * 1.1);
//				console.log('Ajustement eSpeak/Festival appliqués');
			}

			// Firefox avec voix Microsoft (Windows).
			else if (voiceName.includes('microsoft')) {
				this.rate *= 0.95;
//				console.log('Ajustements Microsoft Firefox appliqués');
			}

			// Autres voix Firefox.
			else {
				this.rate *= 0.85;
//				console.log('Ajustements génériques Firefox appliqués');
			}
		}

		// Ajustements Chrome/autres.
		else {
			if (voiceName.includes('google')) {
				this.pitch = basePitch * 0.95;
//				console.log('Ajustements Google appliqués');
			}
		}

		// Limites de securite.
		this.rate = Math.max(0.1, Math.min(10, this.rate));
		this.pitch = Math.max(0, Math.min(2, this.pitch));

//		console.log(` Paramètres finaux: rate=${this.rate.toFixed(2)}, pitch=${this.pitch.toFixed(2)}, volume=${this.volume.toFixed(2)}`);
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
			this.cancelSpeech();
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
//		console.log('🔍 getLocalizedMessage called with:', { key, fallback, vars });

		try {
			// Essaie d'abord d'obtenir la traduction sans variables.
			const rawTranslation = t(key);
//			console.log('📝 Raw translation result:', rawTranslation);

			// Si on a une traduction valide (differente de la cle.)
			if (rawTranslation && rawTranslation !== key) {
				// Applique manuellement les variables.
				if (vars) {
					let text = rawTranslation;
					for (const [k, v] of Object.entries(vars)) {
//						console.log(`🔄 Replacing {{${k}}} with "${v}" in "${text}"`);
						text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
					}
//					console.log('✅ Final translated text:', text);
					return text;
				}
				return rawTranslation;
			}

			// Sinon utilise le fallback.
			console.log('⚠️ No translation found, using fallback');
			if (vars && fallback) {
				let text = fallback;
				for (const [k, v] of Object.entries(vars)) {
//					console.log(`🔄 Fallback: Replacing {{${k}}} with "${v}" in "${text}"`);
					text = text.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
				}
//				console.log('✅ Final fallback text:', text);
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
//		console.log(`🗣️ [speak] Demande: "${text}", Priority: ${priority}, Enabled: ${this.enabled}`);

		if (!this.enabled) {
//			console.log(`🗣️ [speak] Lecteur désactivé, abandon`);
			return;
		}

		// Modification : Vérifie si on peut interrompre une annonce de bouton récente
		if (priority) {
			const now = Date.now();
			const timeSinceLastButton = now - this.lastButtonAnnouncement;

			// Si une annonce de bouton a eu lieu récemment, on attend avant d'interrompre
			if (timeSinceLastButton < this.BUTTON_ANNOUNCEMENT_DELAY) {
				console.log(`🗣️ [speak] Annonce de bouton récente, délai avant interruption`);
				setTimeout(() => {
					this.speak(text, true);
				}, this.BUTTON_ANNOUNCEMENT_DELAY - timeSinceLastButton);
				return;
			}

			console.log(`🗣️ [speak] Message prioritaire - Annulation en cours`);
			this.speechSynthesis.cancel();
			this.queue = [];
			this.speaking = false;
		}

		this.queue.push(text);
//		console.log(`🗣️ [speak] Ajouté à la queue. Taille: ${this.queue.length}`);

		if (!this.speaking) {
//			console.log(`🗣️ [speak] Pas de lecture en cours, démarrage`);
			this.processQueue();
		} else {
//			console.log(`🗣️ [speak] Lecture en cours, ajout à la queue`);
		}
	}

	/**
	 * @brief Traite la file d'attente.
	 */
	private processQueue(): void {
		console.log(`📋 [processQueue] Queue: ${this.queue.length}, Speaking: ${this.speaking}`);

		if (this.queue.length === 0) {
			this.speaking = false;
			return;
		}

		this.speaking = true;
		const text = this.queue.shift() || "";

		// Diviser TOUS les textes longs (pas seulement Firefox)
		if (text.length > 100) {
			console.log(`📋 [processQueue] Texte long détecté (${text.length} chars), division`);
			const chunks = this.splitTextSafely(text);

			// Remettre les chunks restants en début de queue
			this.queue.unshift(...chunks.slice(1));

			// Traiter le premier chunk
			this.speakChunk(chunks[0]);
		} else {
			this.speakChunk(text);
		}
	}

	private splitTextSafely(text: string): string[] {
		const maxLength = 80; // Très court pour éviter les problèmes
		const chunks: string[] = [];

		// Divise par phrases
		const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

		let currentChunk = '';

		for (const sentence of sentences) {
			const trimmed = sentence.trim();

			if (currentChunk.length + trimmed.length > maxLength && currentChunk.length > 0) {
				chunks.push(currentChunk.trim() + '.');
				currentChunk = trimmed;
			} else {
				currentChunk += (currentChunk.length > 0 ? '. ' : '') + trimmed;
			}
		}

		if (currentChunk.trim().length > 0) {
			chunks.push(currentChunk.trim() + (currentChunk.endsWith('.') ? '' : '.'));
		}

		// Si pas de division possible, force la division par mots
		if (chunks.length === 1 && chunks[0].length > maxLength) {
			const words = chunks[0].split(' ');
			chunks.length = 0;
			currentChunk = '';

			for (const word of words) {
				if (currentChunk.length + word.length > maxLength && currentChunk.length > 0) {
					chunks.push(currentChunk.trim());
					currentChunk = word;
				} else {
					currentChunk += (currentChunk.length > 0 ? ' ' : '') + word;
				}
			}

			if (currentChunk.trim().length > 0) {
				chunks.push(currentChunk.trim());
			}
		}

		console.log(`✂️ Texte divisé en ${chunks.length} chunks:`, chunks.map(c => `"${c.substring(0, 30)}..."`));
		return chunks.length > 0 ? chunks : [text];
	}

	/**
	 * @brief Pronoce un chunk de texte.
	 * @param text texte a prononcer.
	 */
	private speakChunk(text: string, forceQueue: boolean = false, isRetry: boolean = false): void {
		if (!this.enabled) {
			this.clearSpeakTimeout(); // Clear any pending timeout if screen reader is disabled
			return;
		}

		if (!text) {
			console.warn(`⚠️ [speakChunk] Tentative de parler un texte vide.`);
			this.processQueue();
			return;
		}

		// Clear any previous timeout for this speak operation
		this.clearSpeakTimeout();

		// Ensure we don't try to speak if already speaking and not forcing,
		// or if the queue is empty and nothing is pending.
		if (this.speaking && !forceQueue) {
			console.log(`💬 [speakChunk] Déjà en train de parler ou en file d'attente. Texte: "${text.substring(0, 30)}..."`);
			return;
		}

		// Cancel current speech before starting a new one if it's a forced speak (e.g., important announcement)
		// or if we are restarting after an error/interruption.
		if (this.speaking) {
			console.log(`🔄 [speakChunk] Annulation avant lancement`);
			this.speechSynthesis.cancel();
			this.speaking = false;
		}

		const utterance = new SpeechSynthesisUtterance(text);
		this.currentUtterance = utterance; // Store the current utterance

		// (Keep your existing voice, volume, rate, pitch settings)
		utterance.voice = this.voice;
		utterance.volume = this.volume;
		utterance.rate = this.rate;
		utterance.pitch = this.pitch;

		utterance.onstart = () => {
			console.log(`✅ [speakChunk] ONSTART: "${text.substring(0, 30)}..."`);
			this.speaking = true;
			this.clearSpeakTimeout(); // Clear timeout once speech actually starts
		};

		utterance.onend = () => {
			console.log(`✅ [speakChunk] ONEND: "${text.substring(0, 30)}..."`);
			this.speaking = false;
			this.clearSpeakTimeout(); // Clear timeout on successful end
			this.processQueue(); // Process the next item in the queue
		};

		utterance.onerror = (event) => {
			console.error(`❌ [speakChunk] ONERROR: ${event.error} pour "${text.substring(0, 30)}..."`);
			this.clearSpeakTimeout(); // Clear timeout on error

			if (event.error === 'interrupted') {
				console.log(`🔄 [speakChunk] Reprise après erreur`);
				// Do NOT call this.speechSynthesis.cancel() here. The speech is already interrupted.
				// Just mark as not speaking and let processQueue handle the next (or retry) chunk.
				this.speaking = false;
				this.processQueue(); // Try to process the queue again
			} else {
				console.error(`🔴 [speakChunk] Erreur non gérée: ${event.error}`);
				this.speaking = false;
				this.processQueue(); // Move to next item if it's a non-recoverable error
			}
		};

		// Set a timeout for the utterance to prevent indefinite hangs
		// This is the problematic timeout that caused "Bouton 4" issues.
		// We will make it specific to the *current* utterance and clear it properly.
		this.currentSpeakTimeoutId = window.setTimeout(() => {
			console.warn(`❌ [speakChunk] TIMEOUT après 15000ms pour: "${text.substring(0, 30)}..."`);
			console.warn(`❌ [speakChunk] État au timeout - speaking: ${this.speaking}, pending: ${this.speechSynthesis.pending}`);

			// If timeout occurs, assume something went wrong and cancel current speech
			this.speechSynthesis.cancel();
			this.speaking = false;
			this.clearSpeakTimeout(); // Clear the timeout just in case
			this.processQueue(); // Try to process the next item
		}, 15000); // 15 seconds timeout

		this.speechSynthesis.speak(utterance);
	}

	private clearSpeakTimeout(): void {
		if (this.currentSpeakTimeoutId !== null) {
			clearTimeout(this.currentSpeakTimeoutId);
			this.currentSpeakTimeoutId = null;
		}
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
		this.cancelSpeech();
		this.speak(event);
	}

	/**
	 * @brief Annonce un changement de page.
	 * @param pageName nom de la page.
	 */
	public announcePageChange(pageName: string): void {
		if (!this.enabled)
			return ;

		this.cancelSpeech();

		const message = this.getLocalizedMessage('pageLoaded', 'Page {{pageName}} chargée', { pageName });
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

	/**
	 * @brief Charge les sons.
	 * @param name du son.
	 * @param path du son.
	 */
	private loadSound(name: string, path: string): void {
		const audio = new Audio(path);
		this.sounds.set(name, audio);
	}

	/**
	 * @brief Joue le son.
	 * @param name du son.
	 */
	public playSound(name: string): void {
		if (this.enabled) {
			const sound = this.sounds.get(name);
			if (sound) {
				sound.currentTime = 0;
				sound.play();
			}
		}
	}

	// Méthodes pour les événements de jeu spécifiques.
	public handleLeftPaddleHit(): void {
		this.playSound('paddleGauche');
	}

	public handleRightPaddleHit(): void {
		this.playSound('paddleDroit');
	}

	public handleUpPaddleHit(): void {
		this.playSound('paddleHaut');
	}

	public handleDownPaddleHit(): void {
		this.playSound('paddleBas');
	}

	public handleWallHit(): void {
		this.playSound('wall');
	}

	public handleBonusHit(): void {
		this.playSound('bonus');
	}

	public handleScoreP1Hit(): void {
		this.playSound('scoreP1');
	}

	public handleScoreP2Hit(): void {
		this.playSound('scoreP2');
	}

	public handleScoreP3Hit(): void {
		this.playSound('scoreP3');
	}

	public handleScoreP4Hit(): void {
		this.playSound('scoreP4');
	}
}