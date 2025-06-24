import { showHome, startGame } from "./script.js";
import { t } from "../lang/i18n.js"
import {screenReader} from "./screenReader.js";
import {navigate, onNavigate} from "./popstate.js";

enum KeyBindings{
	UP = 87,
	DOWN = 83,
	UP2 = 38,
	DOWN2 = 40
}

enum BonusType {
	WALL,
	ICE,
	POTION,
	SPEED
}


const MAX_SCORE = 5;

let isPaused = false; // Variable pour gérer l'état de pause
let pauseDuration = 2000; // Durée de la pause en millisecondes (2 secondes)
let gameOver = false;

export class GameBonus{
	private gameCanvas: HTMLCanvasElement | null;
	private gameContext: CanvasRenderingContext2D | null;
	private gameStartTime: number = Date.now();
	public static keysPressed: boolean[] = [];
	public static player1Score: number = 0;
	public static player2Score: number = 0;
	private player1: Paddle;
	private player2: Paddle2;

	private bonuses: Bonus[] = [];
	private lastBonusTime: number = 0;
	private bonusStartTime: number = Date.now();
	public staticWalls: StaticWall[] = []; // Liste pour le bonus Wall

	private ball: Ball;

	public static ScreenReader = screenReader.getInstance();

	private createStaticWallLater(x: number, y: number) { //Bonus WALL
		setTimeout(() =>
		{
			const wall = new StaticWall(x, y);
			this.staticWalls.push(wall);
			if (this.staticWalls.length > 3)
			{
				this.staticWalls.shift();
			}
		}, 300) // Ajout différé
	}

	private freezePlayers(except: 'player1' | 'player2' | null)  //Bonus ICE
	{
		const freezeDuration = 1250;

		if (except !== 'player1') this.player1.freeze(freezeDuration);
		if (except !== 'player2') this.player2.freeze(freezeDuration);
	}

	private invertPlayersControls(except: 'player1' | 'player2' | null) {
		const invertDuration = 4000; // 4 secondes

		if (except !== 'player1') this.player1.invertControls(invertDuration);
		if (except !== 'player2') this.player2.invertControls(invertDuration);
	}


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
			GameBonus.keysPressed[e.which] = true;
		});

		window.addEventListener("keyup", function(e){
			GameBonus.keysPressed[e.which] = false;
		});

		const paddleWidth:number = 20, paddleHeight:number = 50, ballSize:number = 10, wallOffset:number = 20;

		this.player1 = new Paddle(paddleWidth, paddleHeight, wallOffset, this.gameCanvas.height / 2 - paddleHeight / 2);
		this.player2 = new Paddle2(paddleWidth, paddleHeight, this.gameCanvas.width - (wallOffset + paddleWidth), this.gameCanvas.height / 2 - paddleHeight / 2);
		
		// Set game reference for AI paddle
		this.player2.setGameRef(this);
		
		this.ball = new Ball(ballSize, ballSize, this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2);
		this.ball.setGameRef(this);
		this.ball.setOnGoalCallback(() => {
			this.bonuses = []; // Supprime tous les bonus
			this.bonusStartTime = Date.now(); // Redémarre le chrono
			this.lastBonusTime = 0; // Réinitialise le timer de cooldown
		})

		window.addEventListener("popstate", this.handlePopState.bind(this));

		this.cleanupNavigateListener = onNavigate(() => {
			if (!GameBonus.isGameOver()) {
				GameBonus.setGameOver(true);
				this.handlePlayerLeave();
			}
		});
	}

	private cleanupNavigateListener: (() => void) | null = null; // Pour stocker la fonction de désabonnement

	private handlePlayerLeave() {
		const victoryMessageElement = document.getElementById("");
		if (victoryMessageElement) {
			const menu_btn = document.getElementById("menu-btn");
			if (menu_btn) {
				menu_btn.addEventListener("click", () => {
					// Nettoyer le stockage local si nécessaire
					localStorage.removeItem('currentMatchId');
					localStorage.removeItem("player1Alias");
					localStorage.removeItem("player2Alias");
					localStorage.removeItem("player3Alias");
					localStorage.removeItem("player4Alias");
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
					navigate('/home');
					showHome();
				});
			}
		}
		GameBonus.setGameOver(true);
	}

	private handlePopState() {
		if (!GameBonus.isGameOver()) {
			GameBonus.setGameOver(true);
		}
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
		this.gameContext!.fillText(player1Alias, this.gameCanvas!.width / 4, 25);
		this.gameContext!.fillText(player2Alias, (3 * this.gameCanvas!.width) / 4, 25);

		// Affiche les scores.
		this.gameContext.textAlign = "center";
		this.gameContext.fillText(GameBonus.player1Score.toString(), this.gameCanvas.width / 4, 50);
		this.gameContext.fillText(GameBonus.player2Score.toString(), (3 * this.gameCanvas.width) / 4, 50);
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
		this.bonuses.forEach(bonus => bonus.draw(this.gameContext!));
		this.staticWalls.forEach(wall => wall.draw(this.gameContext!));
	}
	update() {
		if (!this.gameCanvas)
			return ;

		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas, this.ball);
		this.ball.update(this.player1, this.player2, this.gameCanvas);

		//partie bonus
		const now = Date.now();
		const elapsed = now - this.bonusStartTime;

		// Bonus à partir de 7 secondes
		if (elapsed > 7000 && now - this.lastBonusTime >= 4000)
		{
			if (this.bonuses.length >= 3)
				this.bonuses.shift();

			const bonusX = this.gameCanvas!.width / 4 + Math.random() * (this.gameCanvas!.width / 2);
			const bonusY = 20 + Math.random() * (this.gameCanvas!.height - 40);
			const bonusType = Math.floor(Math.random() * 4); // 0-3

			this.bonuses.push(new Bonus(bonusX, bonusY, bonusType));
			this.lastBonusTime = now;
		}


		this.bonuses = this.bonuses.filter(bonus =>
		{
			const collision =
				this.ball.x < bonus.x + bonus.width &&
				this.ball.x + this.ball.width > bonus.x &&
				this.ball.y < bonus.y + bonus.height &&
				this.ball.y + this.ball.height > bonus.y;

			if (collision) {
				screenReader.getInstance().handleBonusHit();

				switch (bonus.type) {
					case BonusType.WALL:
						console.log("Mur activé : création d'un mur statique");

						// Retarder la création du mur à après la suppression du bonus
						this.createStaticWallLater(bonus.x + bonus.width / 2, bonus.y + bonus.height / 2);
						break;
					case BonusType.ICE:
						console.log("Flocon activé : ralentit la balle");
						const lastTouched = this.ball.getLastTouchedBy();
						this.freezePlayers(lastTouched);
						break;
					case BonusType.POTION:
						const lastTouchedPO = this.ball.getLastTouchedBy();
						this.invertPlayersControls(lastTouchedPO);
						break;
					case BonusType.SPEED:
						this.ball.increaseSpeed(1.1);
						break;
				}
				return false;
			}
			return true;
		})


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

	private invertedUntil: number = 0;

	public invertControls(duration: number)
	{
		this.invertedUntil = Date.now() + duration;
	}


	private frozenUntil: number = 0;

	public freeze(duration: number)
	{
		this.frozenUntil = Date.now() + duration;
	}

	update(canvas: HTMLCanvasElement){
		if (Date.now() < this.frozenUntil)  // Lié au Bonus ICE
		{
			this.yVal = 0;
			return;
		}

		const isInverted = Date.now() < this.invertedUntil; // Lié au Bonus POTION

		if (GameBonus.keysPressed[KeyBindings.UP])
		{
			this.yVal = isInverted ? 1 : -1;
			if ((this.y <= 20 && !isInverted) || (this.y + this.height >= canvas.height - 20 && isInverted))
			{
				this.yVal = 0;
			}
		}
		else if (GameBonus.keysPressed[KeyBindings.DOWN])
		{
			this.yVal = isInverted ? -1 : 1;
			if ((this.y + this.height >= canvas.height - 20 && !isInverted) || (this.y <= 20 && isInverted))
			{
				this.yVal = 0;
			}
		}
		else
		{
			this.yVal = 0;
		}


		this.y += this.yVal * this.speed;
	}
}

export class Paddle2 extends Entity {
	private speed: number = 10;
	private aiLastDecisionTime: number = 0;
	private aiDecisionInterval: number = 1000;
	private static isAIEnabled: boolean = false;
	private centerY: number = 0;
	private gameRef: GameBonus | null = null;
	
	// Simulated keyboard state
	private isUpPressed: boolean = false;
	private isDownPressed: boolean = false;
	
	// Movement control
	private targetY: number = 0;
	private approachingBall: boolean = false;

	// Bonus states
	private invertedUntil: number = 0;
	private frozenUntil: number = 0;
	
	constructor(w: number, h: number, x: number, y: number) {
		super(w, h, x, y);
		this.centerY = y;
		this.targetY = y;
	}

	public setGameRef(game: GameBonus) {
		this.gameRef = game;
	}

	public static setAIEnabled(enabled: boolean) {
		this.isAIEnabled = enabled;
		console.log("AI Enabled:", enabled); // Debug log
	}

	public static isAIActive(): boolean {
		return this.isAIEnabled;
	}

	public resetAIState() {
		this.aiLastDecisionTime = 0;
		this.y = this.centerY;
		this.targetY = this.centerY;
		this.yVal = 0;
		this.isUpPressed = false;
		this.isDownPressed = false;
		this.approachingBall = false;
	}

	private predictBallPosition(ball: Ball, canvas: HTMLCanvasElement): number {
		if (!ball) return this.centerY;

		const distanceX = this.x - ball.x;
		const currentBallSpeed = ball.getSpeed(); // Use actual ball speed
		const timeToReach = Math.abs(distanceX / (ball.xVal * currentBallSpeed));
		
		let predictedX = ball.x;
		let predictedY = ball.y;
		let velocityX = ball.xVal;
		let velocityY = ball.yVal;
		
		// Simulate ball movement until it reaches our x-position or hits a wall
		while (predictedX < this.x && predictedX > 0) {
			// Check for collisions with static walls
			if (this.gameRef && this.gameRef.staticWalls) {
				for (const wall of this.gameRef.staticWalls) {
					if (predictedX < wall.x + wall.width &&
						predictedX + ball.width > wall.x &&
						predictedY < wall.y + wall.height &&
						predictedY + ball.height > wall.y) {
						
						// Calculate which side of the wall we'll hit
						const overlapX = Math.min(
							Math.abs(predictedX + ball.width - wall.x),
							Math.abs(predictedX - (wall.x + wall.width))
						);
						const overlapY = Math.min(
							Math.abs(predictedY + ball.height - wall.y),
							Math.abs(predictedY - (wall.y + wall.height))
						);

						if (overlapX < overlapY) {
							velocityX *= -1; // Horizontal bounce
						} else {
							velocityY *= -1; // Vertical bounce
						}
					}
				}
			}

			// Update predicted position
			predictedX += velocityX * currentBallSpeed;
			predictedY += velocityY * currentBallSpeed;
			
			// Account for bounces off top/bottom walls
			if (predictedY < 0 || predictedY > canvas.height) {
				velocityY *= -1;
			}
		}
		
		return Math.max(20, Math.min(canvas.height - 20 - this.height, predictedY));
	}

	private updateMovement() {
		const paddleCenter = this.y + this.height / 2;
		const distanceToTarget = this.targetY - paddleCenter;
		const stoppingDistance = 15; // Distance to start slowing down
		
		// Reset both keys
		this.isUpPressed = false;
		this.isDownPressed = false;
		
		if (Math.abs(distanceToTarget) > stoppingDistance) {
			// Move towards target
			if (distanceToTarget < 0) {
				this.isUpPressed = true;
			} else {
				this.isDownPressed = true;
			}
		} else if (this.approachingBall) {
			// Fine adjustment when ball is approaching
			if (Math.abs(distanceToTarget) > 5) {
				if (distanceToTarget < 0) {
					this.isUpPressed = true;
				} else {
					this.isDownPressed = true;
				}
			}
		}
	}

	public freeze(duration: number) {
		this.frozenUntil = Date.now() + duration;
	}

	public invertControls(duration: number) {
		this.invertedUntil = Date.now() + duration;
	}

	update(canvas: HTMLCanvasElement, ball?: Ball) {
		const now = Date.now();
		const isFrozen = now < this.frozenUntil;
		const isInverted = now < this.invertedUntil;

		// If frozen by ICE bonus, no movement allowed
		if (isFrozen) {
			this.yVal = 0;
			return;
		}

		if (Paddle2.isAIEnabled && ball) {
			// Update AI decisions every second
			if (now - this.aiLastDecisionTime >= this.aiDecisionInterval) {
				this.aiLastDecisionTime = now;
				
				// Check if ball is moving towards AI
				this.approachingBall = ball.xVal > 0;
				
				if (this.approachingBall) {
					// Ball is coming towards us
					if (ball.x > 300) { // Only predict when ball is in our half
						this.targetY = this.predictBallPosition(ball, canvas);
					}
				} else {
					// Ball moving away, return to center if we're far from it
					const paddleCenter = this.y + this.height / 2;
					const distanceToCenter = Math.abs(paddleCenter - this.centerY);
					
					if (distanceToCenter > 50) {
						this.targetY = this.centerY;
					}
				}
			}
			
			// Update movement every frame based on current target
			this.updateMovement();
			
			// Apply simulated keyboard input with inversion handling
			if (isInverted) {
				if (this.isUpPressed) {
					this.yVal = 1;
				} else if (this.isDownPressed) {
					this.yVal = -1;
				} else {
				this.yVal = 0;
			}
			} else {
				if (this.isUpPressed) {
					this.yVal = -1;
				} else if (this.isDownPressed) {
					this.yVal = 1;
				} else {
					this.yVal = 0;
				}
			}
		} else {
			// Human player control with bonus effects
			if (isInverted) {
				if (GameBonus.keysPressed[KeyBindings.UP2]) {
					this.yVal = 1;
				} else if (GameBonus.keysPressed[KeyBindings.DOWN2]) {
					this.yVal = -1;
				} else {
				this.yVal = 0;
			}
			} else {
				if (GameBonus.keysPressed[KeyBindings.UP2]) {
					this.yVal = -1;
				} else if (GameBonus.keysPressed[KeyBindings.DOWN2]) {
					this.yVal = 1;
				} else {
					this.yVal = 0;
				}
			}
		}

		// Apply movement with boundary checks
		if (this.y <= 20 && this.yVal < 0) {
			this.yVal = 0;
		}
		if (this.y + this.height >= canvas.height - 20 && this.yVal > 0) {
			this.yVal = 0;
		}

		this.y += this.yVal * this.speed;
	}
}

class Bonus extends Entity {
	public type: BonusType;

	constructor(x: number, y: number, type?: BonusType) {
		super(20, 20, x, y);
		this.type = type ?? Math.floor(Math.random() * 4); // bonus aléatoire
	}

	draw(context: CanvasRenderingContext2D) {
		switch (this.type) {
			case BonusType.WALL:
				context.fillStyle = "#8B4513"; // Marron
				context.fillRect(this.x, this.y, this.width, this.height);
				break;
			case BonusType.ICE:
				context.fillStyle = "#00f0ff"; // Bleu clair
				context.beginPath();
				context.moveTo(this.x + this.width / 2, this.y);
				context.lineTo(this.x + this.width, this.y + this.height);
				context.lineTo(this.x, this.y + this.height);
				context.closePath();
				context.fill();
				break;
			case BonusType.POTION:
				context.fillStyle = "#ff00ff"; // Magenta
				context.beginPath();
				context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
				context.fill();
				break;
			case BonusType.SPEED:
				context.fillStyle = "#FFD700"; // Jaune
				context.beginPath();
				context.moveTo(this.x, this.y);
				context.lineTo(this.x + this.width, this.y + this.height / 2);
				context.lineTo(this.x, this.y + this.height);
				context.closePath();
				context.fill();
				break;
		}
	}
}

class StaticWall extends Entity {
	constructor(x: number, y: number) {
		super(40, 40, x - 10, y - 10); // Centre le mur sur le point d'impact
	}

	draw(context: CanvasRenderingContext2D) {
		context.fillStyle = "#8B4513"; //
		context.fillRect(this.x, this.y, this.width, this.height);
	}
}



class Ball extends Entity{

	private gameRef!: GameBonus;
	private lastTouchedBy: 'player1' | 'player2' | null = null;
	private baseSpeed: number = 5; // Vitesse initiale
	private speed: number = this.baseSpeed; // Lié au bonus SPEED

	public getSpeed(): number {
		return this.speed;
	}

	public setGameRef(game: GameBonus)
	{
		this.gameRef = game;
	}

	public getLastTouchedBy(): 'player1' | 'player2' | null
	{
		return this.lastTouchedBy;
	}

	public increaseSpeed(factor: number)
	{
		this.speed *= factor;
		console.log(`Vitesse augmentée : ${this.speed.toFixed(2)}`);
	}

	private onGoalCallback: (() => void) | null = null; //Pour réinitialiser les bonus, appel dans GameBonus

	public setOnGoalCallback(callback: () => void) {
		this.onGoalCallback = callback;
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
			return;

		// check le haut.
		if (this.y <= 10) {
			this.yVal = 1;
			screenReader.getInstance().handleWallHit();
		}

		// check le bas.
		if (this.y + this.height >= canvas.height - 10) {
			this.yVal = -1;
			screenReader.getInstance().handleWallHit();
		}

		// check but player 2.
		if (this.x <= 0) {
			GameBonus.player2Score += 1;

			screenReader.getInstance().handleScoreP2Hit();

			this.resetPosition(canvas);
			if (this.onGoalCallback) {
				this.onGoalCallback(); // Réinitialise bonus et minuteur
			}
			if (!this.checkGameEnd("Joueur 2")) {
			} else
				return;
		}

		// check but player 1.
		if (this.x + this.width >= canvas.width) {
			GameBonus.player1Score += 1;

			screenReader.getInstance().handleScoreP1Hit();

			this.resetPosition(canvas);
			if (this.onGoalCallback) {
				this.onGoalCallback(); // Réinitialise bonus et minuteur
			}
			if (!this.checkGameEnd("Joueur 1")) {
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

			screenReader.getInstance().handleLeftPaddleHit();
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

			screenReader.getInstance().handleRightPaddleHit();
		}

		// Collision avec les murs statiques
		for (const wall of this.gameRef.staticWalls) {
			if (this.x < wall.x + wall.width &&
				this.x + this.width > wall.x &&
				this.y < wall.y + wall.height &&
				this.y + this.height > wall.y) {

				// Inversion de direction (effet "rebond") selon la direction de collision
				const overlapX = (this.x + this.width / 2) - (wall.x + wall.width / 2);
				const overlapY = (this.y + this.height / 2) - (wall.y + wall.height / 2);

				screenReader.getInstance().handleWallHit();

				if (Math.abs(overlapX) > Math.abs(overlapY)) {
					this.xVal *= -1; // rebond horizontal
				} else {
					this.yVal *= -1; // rebond vertical
				}
				break;
			}
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
		this.speed = this.baseSpeed; // Réinitialise la vitesse
		isPaused = true;
		setTimeout(() => { isPaused = false; }, pauseDuration);
	}


	private async checkGameEnd(winner: string): Promise<boolean> {
		if (GameBonus.player1Score >= MAX_SCORE || GameBonus.player2Score >= MAX_SCORE) {
			// Sauvegarde les scores pour le match actuel.
			const matchId = localStorage.getItem('currentMatchId');
			if (matchId) {
				try {
					const response = await fetch("/api/players/match/score", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							matchId: parseInt(matchId),
							player1Score: GameBonus.player1Score,
							player2Score: GameBonus.player2Score
						}),
					});
					const result = await response.json();
					console.log("Résultat sauvegardé:", result);
				} catch (error) {
					console.error("Erreur lors de l'enregistrement des scores:", error);
				}
			}

			// Check if we're in a tournament
			const inTournament = localStorage.getItem('currentTournamentId') !== null;
			const tournamentMode = localStorage.getItem('tournamentMode') === 'true';

			// Only proceed with tournament logic if we're actually in a tournament
			if (inTournament && tournamentMode) {
			const pendingMatchId = localStorage.getItem('pendingMatchId');
			const semifinal1Id = localStorage.getItem('semifinal1Id');
			const semifinal2Id = localStorage.getItem('semifinal2Id');

				if (pendingMatchId) {
					// Tournament match logic...
					// ... existing tournament code ...
				}
			}

			// Always show victory message, regardless of tournament mode
				const victoryMessageElement = document.getElementById("Pong");
				if (victoryMessageElement) {
					const winnerAlias = this.getWinnerAlias(winner);

					const screenReaderInstance = screenReader.getInstance();
					screenReaderInstance.announceScore(GameBonus.player1Score, GameBonus.player2Score, null, null);
					screenReaderInstance.speak(`${winnerAlias} ${t("as_won")}`);

					victoryMessageElement.innerHTML = `
						<p class="font-extrabold">${this.getWinnerAlias(winner)} ${t("as_won")}</p>
						<div class="flex justify-center">
						<button id="menu-btn" class="btn btn-fixed rounded-lg border p-4 shadow">${t("menu")}</button>
						</div>
					`;

				// Clean up localStorage for regular matches
					const menu_btn = document.getElementById("menu-btn");
					if (menu_btn) {
						menu_btn.addEventListener("click", () => {
						if (!inTournament) {
							localStorage.removeItem('currentMatchId');
							localStorage.removeItem('tournamentMode');
							localStorage.removeItem("player1Alias");
							localStorage.removeItem("player2Alias");
							localStorage.removeItem("player3Alias");
							localStorage.removeItem("player4Alias");
						}

						navigate('/home');
						showHome();
					});
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