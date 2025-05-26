import { t } from "../lang/i18n.js"
import {erase} from "sisteransi";
import line = erase.line;

enum KeyBindings{
	UPONE = 65, //A
	DOWNONE = 81, //Q
	UPTWO = 38, //fleche haut
	DOWNTWO = 40, //fleche bas
	RIGHTONE = 79, //O
	LEFTONE = 73, //I
	RIGHTTWO = 86, //V
	LEFTTWO = 67 //C
}

const MAX_SCORE = 5;

let isPaused = false; // Variable pour gérer l'état de pause
let pauseDuration = 2000; // Durée de la pause en millisecondes (2 secondes)
let gameOver = false;

export class GameFour {
	private gameCanvas: HTMLCanvasElement | null;
	private gameContext: CanvasRenderingContext2D | null;
	public static keysPressed: boolean[] = [];
	public static player1Score: number = 0;
	public static player2Score: number = 0;
	public static player3Score: number = 0;
	public static player4Score: number = 0;
	private player1: Paddle;
	private player2: Paddle2;
	private player3: Paddle3;
	private player4: Paddle4;
	private ball: Ball;

	constructor(){
		const canvas = document.getElementById("game-canvas") as HTMLCanvasElement | null;
		if (!canvas)
			throw new Error("Element canvas non-trouve");

		this.gameCanvas = canvas;
		this.gameContext = this.gameCanvas.getContext("2d");
		if (!this.gameContext)
			throw new Error("Impossible de recuperer 2D rendering context");

		this.gameContext.font = "30px Orbitron";

		window.addEventListener("keydown", function(e){
			GameFour.keysPressed[e.which] = true;
		});

		window.addEventListener("keyup", function(e){
			GameFour.keysPressed[e.which] = false;
		});

		let paddleWidth:number = 15, paddleHeight:number = 50, ballSize:number = 10, wallOffset:number = 20;

		this.player1 = new Paddle(paddleWidth, paddleHeight, wallOffset, this.gameCanvas.height / 2 - paddleWidth / 2 - paddleHeight / 2);
		this.player2 = new Paddle2(paddleWidth, paddleHeight, this.gameCanvas.width - (wallOffset + paddleWidth), this.gameCanvas.height / 2 - paddleHeight / 2);
		this.player3 = new Paddle3(paddleHeight, paddleWidth, this.gameCanvas.width / 2 - paddleHeight / 2, wallOffset);
		this.player4 = new Paddle4(paddleHeight, paddleWidth, this.gameCanvas.width / 2 - paddleHeight / 2, this.gameCanvas.height - (wallOffset + paddleWidth));
		this.ball = new Ball(ballSize, ballSize, 0, 0, this.gameCanvas.width, this.gameCanvas.height);
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

		// Affiche la couleur.
		for (let i = 0; i + 30 < this.gameCanvas.height; i += 30) {
			this.gameContext.fillStyle = lineColor;
		}

		// Affiche noms des joueurs.
		const player1Alias = localStorage.getItem('player1Alias') || 'Joueur 1';
		const player2Alias = localStorage.getItem('player2Alias') || 'Joueur 2';
		const player3Alias = localStorage.getItem('player3Alias') || 'Joueur 3';
		const player4Alias = localStorage.getItem('player4Alias') || 'Joueur 4';

		this.gameContext!.font = "20px Orbitron";
		this.gameContext!.fillStyle = textColor;
		this.gameContext!.textAlign = "center";

		// Position des noms des joueurs.
		this.gameContext.fillText(player1Alias, this.gameCanvas.width / 3, (this.gameCanvas.height / 2) - 25);
		this.gameContext.fillText(player2Alias, (3 * this.gameCanvas.width) / 4.60, (this.gameCanvas.height / 2) - 25);
		this.gameContext.fillText(player3Alias, this.gameCanvas.width / 2, (this.gameCanvas.height / 4) - 25);
		this.gameContext.fillText(player4Alias, this.gameCanvas.width / 2, ((3 * this.gameCanvas.height) / 4) - 25);

		// Affiche les scores.
		this.gameContext.textAlign = "center";
		this.gameContext.fillText(GameFour.player1Score.toString(), this.gameCanvas.width / 3, this.gameCanvas.height / 2);
		this.gameContext.fillText(GameFour.player2Score.toString(), (3 * this.gameCanvas.width) / 4.60, this.gameCanvas.height / 2);
		this.gameContext.fillText(GameFour.player3Score.toString(), this.gameCanvas.width / 2, this.gameCanvas.height / 4);
		this.gameContext.fillText(GameFour.player4Score.toString(), this.gameCanvas.width / 2, (3 * this.gameCanvas.height) / 4);


	}

	draw(){
		if (!this.gameContext || !this.gameCanvas)
			return ;

		const { bgColor } = this.getCanvasColors();

		this.gameContext.fillStyle = bgColor;
		this.gameContext.fillRect(0,0,this.gameCanvas.width,this.gameCanvas.height);

		this.drawBoardDetails();
		this.player1.draw(this.gameContext);
		this.player2.draw(this.gameContext);
		this.player3.draw(this.gameContext);
		this.player4.draw(this.gameContext);
		this.ball.draw(this.gameContext);
	}

	update(){
		if (!this.gameCanvas)
			return ;

		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas);
		this.player3.update(this.gameCanvas);
		this.player4.update(this.gameCanvas);
		this.ball.update(this.player1, this.player2, this.player3, this.player4, this.gameCanvas);
	}

	gameLoop = () => {
		if (gameOver) return;
		this.update();
		this.draw();
		requestAnimationFrame(this.gameLoop);
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
		if (GameFour.keysPressed[KeyBindings.UPONE]){
			this.yVal = -1;
			if (this.y <= 20){
				this.yVal = 0
			}
		}
		else if (GameFour.keysPressed[KeyBindings.DOWNONE]){
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
		if (GameFour.keysPressed[KeyBindings.UPTWO]){
			this.yVal = -1;
			if (this.y <= 20){
				this.yVal = 0
			}
		}
		else if (GameFour.keysPressed[KeyBindings.DOWNTWO]){
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

class Paddle3 extends Entity{

	private speed:number = 10;

	constructor(w:number, h:number, x:number, y:number){
		super(w,h,x,y);
	}

	update(canvas: HTMLCanvasElement){
		if (GameFour.keysPressed[KeyBindings.LEFTONE]){
			this.xVal = -1;
			if (this.x <= 20){
				this.xVal = 0
			}
		}
		else if (GameFour.keysPressed[KeyBindings.RIGHTONE]){
			this.xVal = +1;
			if (this.x + this.width >= canvas.width - 20){
				this.xVal = 0
			}
		}
		else{
			this.xVal = 0;
		}

		this.x += this.xVal * this.speed;
	}
}

class Paddle4 extends Entity{

	private speed:number = 10;

	constructor(w:number, h:number, x:number, y:number){
		super(w,h,x,y);
	}

	update(canvas: HTMLCanvasElement){
		if (GameFour.keysPressed[KeyBindings.LEFTTWO]){
			this.xVal = -1;
			if (this.x <= 20){
				this.xVal = 0
			}
		}
		else if (GameFour.keysPressed[KeyBindings.RIGHTTWO]){
			this.xVal = +1;
			if (this.x + this.width >= canvas.width - 20){
				this.xVal = 0
			}
		}
		else{
			this.xVal = 0;
		}

		this.x += this.xVal * this.speed;
	}
}

class Ball extends Entity{

	private speed:number = 5;
	private canvasWidth: number;
	private canvasHeight: number;

	constructor(w: number, h: number, x: number, y: number, canvasWidth: number, canvasHeight: number) {
		super(w, h, x, y);
		this.canvasWidth = canvasWidth;
		this.canvasHeight = canvasHeight;
		this.resetBallPosition(); // Positionne la balle au centre du terrain avec une direction aléatoire
	}

	// Fonction pour reinitialiser la position de la balle apres un but.
	resetBallPosition() {
		let margin = 50;
		this.x = this.canvasWidth / 2 - this.width / 2 + (Math.random() * margin - margin / 2);
		this.y = this.canvasHeight / 2 - this.height / 2 + (Math.random() * margin - margin / 2);

		let randomDirection = Math.floor(Math.random() * 2) + 1;
		this.xVal = randomDirection % 2 ? 1 : -1;
		this.yVal = (Math.random() * 2 - 1) * 2;
	}

	async checkGameEnd(): Promise<boolean> {
		const highestScore = Math.max(
			GameFour.player1Score,
			GameFour.player2Score,
			GameFour.player3Score,
			GameFour.player4Score
		);

		if (highestScore >= MAX_SCORE) {
			// Determiner le gagnant.
			let winner = "";
			if (GameFour.player1Score >= MAX_SCORE) winner = "Joueur 1";
			else if (GameFour.player2Score >= MAX_SCORE) winner = "Joueur 2";
			else if (GameFour.player3Score >= MAX_SCORE) winner = "Joueur 3";
			else if (GameFour.player4Score >= MAX_SCORE) winner = "Joueur 4";

			// Enregistrer les scores.
			const matchId = localStorage.getItem('currentMatchId');
			if (matchId) {
				try {
					const response = await fetch("/api/players/match4/score", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({
							matchId: parseInt(matchId),
							player1Score: GameFour.player1Score,
							player2Score: GameFour.player2Score,
							player3Score: GameFour.player3Score,
							player4Score: GameFour.player4Score
						}),
					});
					const result = await response.json();
					console.log("Résultat sauvegardé:", result);

					// Supprimer l'ID du match du localStorage.
					localStorage.removeItem('currentMatchId');
				} catch (error) {
					console.error("Erreur lors de l'enregistrement des scores:", error);
				}
			}

			const victoryMessageElement = document.getElementById("Pong");
			if (victoryMessageElement) {
				victoryMessageElement.innerHTML = `
					<p class="font-extrabold">${this.getWinnerAlias(winner)} ${t("as_lost")}</p>
					<div class="flex justify-center">
						<button id="menu-btn" class="btn rounded-lg border p-4 shadow">${t("menu")}</button>
					</div>
				`;

				// Import dynamique pour eviter les problemes de reference circulaire.
				import('./script.js').then(module => {
					const menu_btn = document.getElementById("menu-btn");
					if (menu_btn)
						menu_btn.addEventListener("click", () => module.showHome());
				});
			}
			GameFour.setGameOver(true);
			return true;
		}
		return false;
	}

	update(player1: Paddle, player2: Paddle2, player3: Paddle3, player4: Paddle4, canvas: HTMLCanvasElement) {
		// Si le jeu est en pause, on ne met pas a jour la position de la balle.
		if (isPaused) return;

		// Verification des buts dans les camps respectifs.
		if (this.x <= 0) {
			GameFour.player1Score += 1;
			this.resetBallPosition();  // Reinitialiser la position de la balle au centre.
			isPaused = true;
			setTimeout(() => {
				isPaused = false;
				this.checkGameEnd();
			}, pauseDuration);
		}

		if (this.x + this.width >= canvas.width) {
			GameFour.player2Score += 1;
			this.resetBallPosition();  // Reinitialiser la position de la balle au centre.
			isPaused = true;
			setTimeout(() => {
				isPaused = false;
				this.checkGameEnd();
			}, pauseDuration);
		}

		if (this.y <= 0) {
			GameFour.player3Score += 1;
			this.resetBallPosition();  // Reinitialiser la position de la balle au centre.
			isPaused = true;
			setTimeout(() => {
				isPaused = false;
				this.checkGameEnd();
			}, pauseDuration);
		}

		if (this.y + this.height >= canvas.height) {
			GameFour.player4Score += 1;
			this.resetBallPosition();  // Reinitialiser la position de la balle au centre.
			isPaused = true;
			setTimeout(() => {
				isPaused = false;
				this.checkGameEnd();
			}, pauseDuration);
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
		}

		// Collision avec jooueur 2.
		if (this.x + this.width >= player2.x &&
			this.x <= player2.x + player2.width &&
			this.y + this.height >= player2.y &&
			this.y <= player2.y + player2.height) {
			let relativeY = (this.y + this.height / 2) - (player2.y + player2.height / 2);
			let normalizedY = relativeY / (player2.height / 2);  // Normalisation de la position verticale.
			this.xVal = -1;
			this.yVal = normalizedY * 1.2;  // Ajuste l'angle en fonction de la collision.
		}

		// Collision avec joueur 3 (paddle vertical).
		if (this.y <= player3.y + player3.height &&
			this.y >= player3.y &&
			this.x + this.width >= player3.x &&
			this.x <= player3.x + player3.width) {
			let relativeX = (this.x + this.width / 2) - (player3.x + player3.width / 2);
			let normalizedX = relativeX / (player3.width / 2);
			this.yVal = 1;
			this.xVal = normalizedX * 1.2;
		}

		// Collision avec joueur 4 (paddle vertical).
		if (this.y + this.height >= player4.y &&
			this.y <= player4.y + player4.height &&
			this.x + this.width >= player4.x &&
			this.x <= player4.x + player4.width) {
			let relativeX = (this.x + this.width / 2) - (player4.x + player4.width / 2);
			let normalizedX = relativeX / (player4.width / 2);
			this.yVal = -1;
			this.xVal = normalizedX * 1.2;
		}

		// Mise a jour de la position de la balle.
		const length = Math.sqrt(this.xVal * this.xVal + this.yVal * this.yVal);
		this.x += (this.xVal / length) * this.speed;
		this.y += (this.yVal / length) * this.speed;
	}

	private getWinnerAlias(winner: string): string {
		if (winner === "Joueur 1")
			return "Joueur 1";
		else if (winner === "Joueur 2")
			return "Joueur 2";
		else if (winner === "Joueur 3")
			return "Joueur 3";
		else
			return "Joueur 4";
	}
}