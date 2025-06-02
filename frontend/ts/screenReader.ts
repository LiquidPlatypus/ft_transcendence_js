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

		// Essaie de trouver une voix francaise.
		let frenchVoice = voices.find(voice => voice.lang.includes('fr'));

		// Si pas de voix fr, utilise la première voix dispo.
		if (!frenchVoice && voices.length > 0)
			frenchVoice = voices[0];

		this.voice = frenchVoice;
		console.log("Voix sélectionnée:", this.voice?.name);
	}

	/**
	 * @brief Active ou desactive le screen reader.
	 * @param enabled actif ou non.
	 */
	public setEnabled(enabled: boolean): void {
		this.enabled = enabled;
		localStorage.setItem('screenReaderEnabled', enabled.toString());

		if (enabled)
			this.speak("Lecteur d'écran activé");
		this.speak("Lecteur d'écran activé");
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

		const player1Name = localStorage.getItem('player1Alias') || 'Joueur 1';
		const player2Name = localStorage.getItem('player2Alias') || 'Joueur 2';

		if (!player3Score)
			this.speak(`Score: ${player1Name} ${player1Score}, ${player2Name} ${player2Score}`);

		if (player3Score) {
			const player3Name = localStorage.getItem('player3Alias') || 'Joueur 3';
			const player4Name = localStorage.getItem('player4Alias') || 'Joueur 4';

			this.speak(`Score: ${player1Name} ${player1Score}, ${player2Name} ${player2Score}, ${player3Name} ${player3Score}, ${player4Name} ${player4Score}`);
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
		this.speak(`Page ${pageName} chargée`, true);
	}
}