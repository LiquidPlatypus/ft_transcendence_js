import { showHome, startGame } from "./script.js";
import { t } from "../lang/i18n.js"
import {erase} from "sisteransi";
import line = erase.line;
import {bgColor} from "ansi-styles";

enum KeyBindings{
	UP = 90,
	DOWN = 83,
	UP2 = 38,
	DOWN2 = 40
}

const MAX_SCORE = 5;

let isPaused = false; // Variable pour gérer l'état de pause
let pauseDuration = 2000; // Durée de la pause en millisecondes (2 secondes)
let gameOver = false;

export class Game{
	private gameCanvas: HTMLCanvasElement | null;
	private gameContext: CanvasRenderingContext2D | null;
	private gameStartTime: number = Date.now();
	public static keysPressed: boolean[] = [];
	public static player1Score: number = 0;
	public static player2Score: number = 0;
	private player1: Paddle;
	private player2: Paddle2;

	private ball: Ball;

	constructor() {
		const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
		if (!canvas)
			throw new Error("Element canvas non-trouve");

		this.gameCanvas = canvas;
		this.gameContext = this.gameCanvas.getContext("2d");
		if (!this.gameContext)
			throw new Error("Impossible de recuperer 2D rendering context");

		this.gameContext.font = "30px Orbitron";

		window.addEventListener("keydown", function(e){
			Game.keysPressed[e.which] = true;
		});

		window.addEventListener("keyup", function(e){
			Game.keysPressed[e.which] = false;
		});

		const paddleWidth:number = 20, paddleHeight:number = 50, ballSize:number = 10, wallOffset:number = 20;

		this.player1 = new Paddle(paddleWidth, paddleHeight, wallOffset, this.gameCanvas.height / 2 - paddleHeight / 2);
		this.player2 = new Paddle2(paddleWidth, paddleHeight, this.gameCanvas.width - (wallOffset + paddleWidth), this.gameCanvas.height / 2 - paddleHeight / 2);
		this.ball = new Ball(ballSize, ballSize, this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2);
	}

	getCanvasColors() {
		const styles = getComputedStyle(document.body);
		return {
			bgColor: styles.getPropertyValue('--canvas-bg-color').trim() || '#000',
			lineColor: styles.getPropertyValue('--canvas-line-color').trim() || '#fff',
			textColor: styles.getPropertyValue('--canvas-text-color').trim() || '#fff',
			entityColor: styles.getPropertyValue('--canvas-entity-color').trim() || '#fff',
		};
	}

	drawBoardDetails(){
		if (!this.gameContext || !this.gameCanvas)
			return ;

		const { lineColor, textColor } = this.getCanvasColors();

		// Trace les contours du terrain.
		this.gameContext.strokeStyle = lineColor;
		this.gameContext.lineWidth = 5;
		this.gameContext.strokeRect(10,10,this.gameCanvas.width - 20 ,this.gameCanvas.height - 20);

		// Trace la ligne au centre du terrain.
		for (let i = 0; i + 30 < this.gameCanvas.height; i += 30) {
			this.gameContext.fillStyle = lineColor;
			this.gameContext.fillRect(this.gameCanvas.width / 2 - 2, i + 10, 5, 20); // Cense etre 2.5 mais vu que pixel = entier, arrondi a 2.
		}

		// Defini les informations du match et des joueurs.
		const currentMatchId = localStorage.getItem('currentMatchId');
		const currentMatchType = localStorage.getItem('currentMatchType');
		const tournamentMode = localStorage.getItem('tournamentMode') === 'true';

		// Recupere les bons noms de joueurs.
		let player1Alias = localStorage.getItem('player1Alias') || 'Joueur 1';
		let player2Alias = localStorage.getItem('player2Alias') || 'Joueur 2';
		console.log(localStorage);

		// S'assure d'afficher les bons noms en fonction du match lors d'un tournoi.
		if (tournamentMode && currentMatchType) {
			if (currentMatchType === 'final') {
				player1Alias = localStorage.getItem('finalPlayer1Alias') || player1Alias;
				player2Alias = localStorage.getItem('finalPlayer2Alias') || player2Alias;
			} else if (currentMatchType === 'third-place') {
				player1Alias = localStorage.getItem('thirdPlacePlayer1Alias') || player1Alias;
				player2Alias = localStorage.getItem('thirdPlacePlayer2Alias') || player2Alias;
			}
		}

		console.log("Current match ID:", currentMatchId);
		console.log("Current match type:", currentMatchType);
		console.log("Tournament mode:", tournamentMode);
		console.log("Player 1 name:", player1Alias);
		console.log("Player 2 name:", player2Alias);

		this.gameContext!.font = "20px Orbitron";
		this.gameContext!.fillStyle = textColor;
		this.gameContext!.textAlign = "center";

		// Affiche le nom des joueurs au dessus du score.
		this.gameContext!.fillText(player1Alias, this.gameCanvas!.width / 4, 30);
		this.gameContext!.fillText(player2Alias, (3 * this.gameCanvas!.width) / 4, 30);

		// Affiche les scores.
		this.gameContext.textAlign = "center";
		this.gameContext.fillText(Game.player1Score.toString(), this.gameCanvas.width / 4, 55);
		this.gameContext.fillText(Game.player2Score.toString(), (3 * this.gameCanvas.width) / 4, 55);
	}
	draw() {
		if (!this.gameContext || !this.gameCanvas)
			return ;

		const { bgColor } = this.getCanvasColors();

		this.gameContext.fillStyle = bgColor;
		this.gameContext.fillRect(0,0,this.gameCanvas.width,this.gameCanvas.height);

		this.drawBoardDetails();
		this.player1.draw(this.gameContext);
		this.player2.draw(this.gameContext);
		this.ball.draw(this.gameContext);
	}
	update() {
		if (!this.gameCanvas)
			return ;

		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas);
		this.ball.update(this.player1, this.player2, this.gameCanvas);
	}
	gameLoop() {
		if (gameOver) return;

		const currentTime = Date.now();
		if (currentTime - this.gameStartTime < pauseDuration) {
			this.draw();
			requestAnimationFrame(() => this.gameLoop());
			return;
		}

		this.update();
		this.draw();
		requestAnimationFrame(() => this.gameLoop());
	}

	public static setGameOver(state: boolean): void {
		gameOver = state;
	}

	public static isGameOver(): boolean {
		return gameOver;
	}
}

class Entity{
	width:number;
	height:number;
	x:number;
	y:number;
	xVal:number = 0;
	yVal:number = 0;
	constructor(w:number, h:number, x:number, y:number){
		this.width = w;
		this.height = h;
		this.x = x;
		this.y =y;
	}

	private getCanvasColors() {
		const styles = getComputedStyle(document.body);
		return {
			entityColor: styles.getPropertyValue('--canvas-entity-color').trim() || '#fff',
		}
	}

	draw(context: CanvasRenderingContext2D){
		const { entityColor } = this.getCanvasColors();
		context.fillStyle = entityColor;
		context.fillRect(this.x,this.y,this.width,this.height);
	}
}

class Paddle extends Entity{

	private speed:number = 10;

	constructor(w:number, h:number, x:number, y:number){
		super(w,h,x,y);
	}

	update(canvas: HTMLCanvasElement){
		if (Game.keysPressed[KeyBindings.UP]){
			this.yVal = -1;
			if (this.y <= 20){
				this.yVal = 0
			}
		}
		else if (Game.keysPressed[KeyBindings.DOWN]){
			this.yVal = +1;
			if (this.y + this.height >= canvas.height - 20){
				this.yVal = 0
			}
		}
		else{
			this.yVal = 0;
		}

		this.y += this.yVal * this.speed;
	}
}

class Paddle2 extends Entity{

	private speed:number = 10;

	constructor(w:number, h:number, x:number, y:number){
		super(w,h,x,y);
	}

	update(canvas: HTMLCanvasElement){
		if (Game.keysPressed[KeyBindings.UP2]){
			this.yVal = -1;
			if (this.y <= 20){
				this.yVal = 0
			}
		}
		else if (Game.keysPressed[KeyBindings.DOWN2]){
			this.yVal = +1;
			if (this.y + this.height >= canvas.height - 20){
				this.yVal = 0
			}
		}
		else{
			this.yVal = 0;
		}

		this.y += this.yVal * this.speed;
	}
}

class Ball extends Entity{

	private speed:number = 5;
	private lastTouchedBy: 'player1' | 'player2' | null = null;

	public getLastTouchedBy(): 'player1' | 'player2' | null
	{
		return this.lastTouchedBy;
	}

	constructor(w: number, h: number, x: number, y: number){
		super(w, h, x, y);
		const randomDirection = Math.floor(Math.random() * 2) +1;
		if (randomDirection % 2)
			this.xVal = 1;
		else
			this.xVal = -1;
		this.yVal = 1;
	}

	update(player1: Paddle, player2: Paddle2, canvas: HTMLCanvasElement){

		// Si le jeu est en pause, on ne met pas à jour la position de la balle.
		if (isPaused)
			return ;

		// check le haut.
		if (this.y <= 10)
			this.yVal = 1;

		// check le bas.
		if (this.y + this.height >= canvas.height - 10)
			this.yVal = -1;

		// check but player 2.
		if (this.x <= 0) {
			Game.player2Score += 1;
			this.resetPosition(canvas);
			if (!this.checkGameEnd("Joueur 2")) {
			} else
				return;
		}

		// Collision avec joueur 1.
		if (this.x <= player1.x + player1.width &&
			this.x >= player1.x &&
			this.y + this.height >= player1.y &&
			this.y <= player1.y + player1.height) {
			let relativeY = (this.y + this.height / 2) - (player1.y + player1.height / 2);
			let normalizedY = relativeY / (player1.height / 2);  // Normalisation de la position verticale.
			this.xVal = 1;
			this.yVal = normalizedY * 1.2;  // Ajuste l'angle en fonction de la collision.
			this.lastTouchedBy = 'player1';
		}

		// Collision avec joueur 2.
		if (this.x + this.width >= player2.x &&
			this.x <= player2.x + player2.width &&
			this.y + this.height >= player2.y &&
			this.y <= player2.y + player2.height) {
			let relativeY = (this.y + this.height / 2) - (player2.y + player2.height / 2);
			let normalizedY = relativeY / (player2.height / 2);  // Normalisation de la position verticale.
			this.xVal = -1;
			this.yVal = normalizedY * 1.2;  // Ajuste l'angle en fonction de la collision.
			this.lastTouchedBy = 'player2';
		}

		// Fait en sorte que la balle se déplace a une vitesse constante meme en diagonale.
		const length = Math.sqrt(this.xVal * this.xVal + this.yVal * this.yVal);
		this.x += (this.xVal / length) * this.speed;
		this.y += (this.yVal / length) * this.speed;
	}

	// Reset la position de la balle.
	private resetPosition(canvas: HTMLCanvasElement) {
		this.x = canvas.width / 2 - this.width / 2;
		this.y = canvas.height / 2 - this.height / 2;
		isPaused = true;
		setTimeout(() => { isPaused = false; }, pauseDuration);
	}

	private async checkGameEnd(winner: string): Promise<boolean> {
		if (Game.player1Score >= MAX_SCORE || Game.player2Score >= MAX_SCORE) {
			// Sauvegarde les scores pour le match actuel.
			const matchId = localStorage.getItem('currentMatchId');
			if (matchId) {
				try {
					const response = await fetch("/api/players/match/score", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							matchId: parseInt(matchId),
							player1Score: Game.player1Score,
							player2Score: Game.player2Score
						}),
					});
					const result = await response.json();
					console.log("Résultat sauvegardé:", result);
				} catch (error) {
					console.error("Erreur lors de l'enregistrement des scores:", error);
				}
			}

			// Check si on est dans un tournoi et si un match est en attente.
			const tournamentMode = localStorage.getItem('tournamentMode') === 'true';
			const pendingMatchId = localStorage.getItem('pendingMatchId');
			const semifinal1Id = localStorage.getItem('semifinal1Id');
			const semifinal2Id = localStorage.getItem('semifinal2Id');

			if (tournamentMode && pendingMatchId) {
				// S'affiche lorse que un autre match est encore en attente.
				const victoryMessageElement = document.getElementById("Pong");
				if (victoryMessageElement) {
					victoryMessageElement.innerHTML = `
				<p class="font-extrabold">${this.getWinnerAlias(winner)} ${t("as_won")}</p>
				<p>${t("?next_match")}</p>
				<div class="flex justify-center mt-4">
					<button id="next-match-btn" class="btn rounded-lg border p-4 shadow">${t("next_match_btn")}</button>
				</div>
			`;

					const nextMatchBtn = document.getElementById("next-match-btn");
					if (nextMatchBtn) {
						nextMatchBtn.addEventListener("click", async () => {
							try {
								// Sauvegarde le gagnant du match actuel.
								if (matchId === semifinal1Id) {
									localStorage.setItem('semifinal1Winner', winner === 'Joueur 1' ?
										localStorage.getItem('player1Id') || '' :
										localStorage.getItem('player2Id') || '');
									localStorage.setItem('semifinal1Loser', winner === 'Joueur 1' ?
										localStorage.getItem('player2Id') || '' :
										localStorage.getItem('player1Id') || '');

									// Set le match en attente en tant que match actuel.
									localStorage.setItem('currentMatchId', pendingMatchId);

									// Met a jour les noms des joueurs pour le prochain mach.
									localStorage.setItem('player1Alias', localStorage.getItem('player3Alias') || 'Joueur 3');
									localStorage.setItem('player2Alias', localStorage.getItem('player4Alias') || 'Joueur 4');

									// Reset l'etat du jeu.
									Game.player1Score = 0;
									Game.player2Score = 0;
									Game.setGameOver(false);

									// Demarre le prochain match.
									startGame(2, 'normal');
								} else if (matchId === semifinal2Id) {
									// Stock le gagant de la semi-final.
									localStorage.setItem('semifinal2Winner', winner === 'Joueur 1' ?
										localStorage.getItem('player3Id') || '' :
										localStorage.getItem('player4Id') || '');
									localStorage.setItem('semifinal2Loser', winner === 'Joueur 1' ?
										localStorage.getItem('player4Id') || '' :
										localStorage.getItem('player3Id') || '');

									// Creer le dernier match apres celui-ci.
									const currentTournamentId = localStorage.getItem('currentTournamentId');
									if (currentTournamentId) {
										try {
											// Recupere les gagnants des deux semi-finals.
											const semifinal1Winner = localStorage.getItem('semifinal1Winner') || '';
											const semifinal2Winner = localStorage.getItem('semifinal2Winner') || '';
											const semifinal1Loser = localStorage.getItem('semifinal1Loser') || '';
											const semifinal2Loser = localStorage.getItem('semifinal2Loser') || '';

											// Creer la final (gagnants).
											const finalMatchResponse = await fetch(`/api/tournaments/${currentTournamentId}/matches`, {
												method: 'POST',
												headers: {'Content-Type': 'application/json'},
												body: JSON.stringify({
													player1_id: semifinal1Winner,
													player2_id: semifinal2Winner,
													round: 'final',
													match_number: 3,
													gameType: 'pong'
												})
											});

											const finalMatchData = await finalMatchResponse.json();

											// Creer le match de la troisieme place (perdants).
											const thirdPlaceMatchResponse = await fetch(`/api/tournaments/${currentTournamentId}/matches`, {
												method: 'POST',
												headers: {'Content-Type': 'application/json'},
												body: JSON.stringify({
													player1_id: semifinal1Loser,
													player2_id: semifinal2Loser,
													round: 'third-place',
													match_number: 4,
													gameType: 'pong'
												})
											});

											const thirdPlaceMatchData = await thirdPlaceMatchResponse.json();

											// Recupere le nom des joueurs pour les deux nouveaux matchs.
											const winner1Name = await getAliasById(semifinal1Winner);
											const winner2Name = await getAliasById(semifinal2Winner);
											const loser1Name = await getAliasById(semifinal1Loser);
											const loser2Name = await getAliasById(semifinal2Loser);

											// Stock le nom des joueurs pour la final.
											localStorage.setItem("finalPlayer1Alias", winner1Name);
											localStorage.setItem("finalPlayer2Alias", winner2Name);

											// Stock le nom des joueurs pour le match de la troisieme place.
											localStorage.setItem("thirdPlacePlayer1Alias", loser1Name);
											localStorage.setItem("thirdPlacePlayer2Alias", loser2Name);

											// Setup du match final.
											localStorage.setItem("currentMatchId", finalMatchData.matchId.toString());
											localStorage.setItem("pendingMatchId", thirdPlaceMatchData.matchId.toString());
											localStorage.setItem("currentMatchType", "final");
											localStorage.setItem("pendingMatchType", "third-place");

											// Met a jour les noms des joueurs pour les afficher sur l'UI correctement.
											localStorage.setItem('player1Alias', winner1Name);
											localStorage.setItem('player2Alias', winner2Name);

											// Reset l'etat du jeu.
											Game.player1Score = 0;
											Game.player2Score = 0;
											Game.setGameOver(false);

											// Demarre la finale.
											startGame(2, 'normal');
										} catch (error) {
											console.error("Error creating final matches:", error);
										}
									}
								} else if (localStorage.getItem('currentMatchType') === 'final') {
									const tournamentWinnerAlias = this.getWinnerAlias(winner);
									localStorage.setItem('tournamentWinnerAlias', tournamentWinnerAlias);

									// Apres la finale. match pour la troisieme place.
									localStorage.setItem('currentMatchId', localStorage.getItem('pendingMatchId') || '');
									localStorage.removeItem('pendingMatchId');
									localStorage.setItem('currentMatchType', 'third-place');

									// Met a jour le nom des joueurs pour la troisieme place.
									localStorage.setItem('player1Alias', localStorage.getItem('thirdPlacePlayer1Alias') || 'Joueur 1');
									localStorage.setItem('player2Alias', localStorage.getItem('thirdPlacePlayer2Alias') || 'Joueur 2');

									// Reset l'etat du jeu.
									Game.player1Score = 0;
									Game.player2Score = 0;
									Game.setGameOver(false);

									// Demarre le match pour la troisieme place.
									startGame(2, 'normal');
								} else {
									// Si c'etait le match pour la troisieme place (dernier match).
									localStorage.removeItem('pendingMatchId');
									localStorage.removeItem('currentMatchType');
									localStorage.removeItem('pendingMatchType');
									localStorage.removeItem('currentMatchId');
									startGame(2, 'normal');
								}
							} catch (error) {
								console.error("Error in tournament progression:", error);
							}
						});
					}
				}
			} else if (tournamentMode && !pendingMatchId) {
				// C'était le dernier match du tournoi (match pour la 3ème place).
				const victoryMessageElement = document.getElementById("Pong");
				if (victoryMessageElement) {
					// Utiliser le gagnant de la finale qui a été stocké précédemment.
					const tournamentWinner = localStorage.getItem('tournamentWinnerAlias') || 'Vainqueur du tournoi';

					victoryMessageElement.innerHTML = `
							<p class="font-extrabold">${tournamentWinner} ${t("tournament_win")}</p>
							<div class="flex justify-center mt-4">
								<button id="menu-btn" class="btn rounded-lg border p-4 shadow">${t("menu")}</button>
							</div>
						`;

					const menu_btn = document.getElementById("menu-btn");
					if (menu_btn) {
						menu_btn.addEventListener("click", () => {
							// Nettoyage du mode tournoi.
							localStorage.removeItem('tournamentMode');
							localStorage.removeItem('semifinal1Id');
							localStorage.removeItem('semifinal2Id');
							localStorage.removeItem('semifinal1Winner');
							localStorage.removeItem('semifinal1Loser');
							localStorage.removeItem('semifinal2Winner');
							localStorage.removeItem('semifinal2Loser');
							localStorage.removeItem('player1Id');
							localStorage.removeItem('player2Id');
							localStorage.removeItem('player3Id');
							localStorage.removeItem('player4Id');
							localStorage.removeItem('currentTournamentId');
							localStorage.removeItem('tournamentWinnerAlias');
							showHome();
						});
					}
				}
			} else {
				// Fin de match normal (hors tournoi).
				const victoryMessageElement = document.getElementById("Pong");
				if (victoryMessageElement) {
					victoryMessageElement.innerHTML = `
						<p class="font-extrabold">${this.getWinnerAlias(winner)} ${t("as_won")}</p>
						<div class="flex justify-center">
							<button id="menu-btn" class="btn rounded-lg border p-4 shadow">${t("menu")}</button>
						</div>
					`;

					// Nettoie le localStorage.
					const menu_btn = document.getElementById("menu-btn");
					if (menu_btn) {
						menu_btn.addEventListener("click", () => {
							localStorage.removeItem('currentMatchId');
							localStorage.removeItem("player1Alias");
							localStorage.removeItem("player2Alias");
							localStorage.removeItem("player3Alias");
							localStorage.removeItem("player4Alias");
							showHome();
						});
					}
				}
			}

			gameOver = true;
			return true;
		}
		return false;
	}

	private getWinnerAlias(winner: string): string {
		if (winner === 'Joueur 1')
			return localStorage.getItem('player1Alias') || 'Joueur 1';
		else
			return localStorage.getItem('player2Alias') || 'Joueur 2';
	}
}

async function getAliasById(playerId: string | null): Promise<string> {
	if (!playerId) {
		console.log("Warning: getAliasById called with null playerId");
		return "Joueur ?";
	}

	console.log(`Fetching alias for player ID: ${playerId}`);

	try {
		const res = await fetch(`/api/players/${playerId}`);
		if (!res.ok)
			throw new Error(`API error: ${res.status}`);

		const data = await res.json();
		console.log(`Player data:`, data);

		if (data.success && data.player && data.player.name) {
			console.log(`Found name for player ${playerId}: ${data.player.name}`);
			return data.player.name;
		} else {
			console.warn(`No valid name found for player ${playerId}`, data);
			return "Joueur ?";
		}
	} catch (e) {
		console.error(`Error fetching alias for player ${playerId}:`, e);
		return "Joueur ?";
	}
}