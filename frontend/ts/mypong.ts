import { showHome } from "./script.js";

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

		this.player1 = new Paddle(paddleWidth, paddleHeight, wallOffset, this.gameCanvas.height / 2 - paddleWidth / 2);
		this.player2 = new Paddle2(paddleWidth, paddleHeight, this.gameCanvas.width - (wallOffset + paddleWidth), this.gameCanvas.height / 2 - paddleHeight / 2);
		this.ball = new Ball(ballSize, ballSize, this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2);
	}

	drawBoardDetails(){
		if (!this.gameContext || !this.gameCanvas)
			return ;

		//draw court outline
		this.gameContext.strokeStyle = "#fff";
		this.gameContext.lineWidth = 5;
		this.gameContext.strokeRect(10,10,this.gameCanvas.width - 20 ,this.gameCanvas.height - 20);

		//draw center lines
		for (let i = 0; i + 30 < this.gameCanvas.height; i += 30) {
			this.gameContext.fillStyle = "#fff";
			this.gameContext.fillRect(this.gameCanvas.width / 2 - 10, i + 10, 15, 20);
		}

		//draw scores
		this.gameContext.textAlign = "center";
		this.gameContext.fillText(Game.player1Score.toString(), this.gameCanvas.width / 4, 50);
		this.gameContext.fillText(Game.player2Score.toString(), (3 * this.gameCanvas.width) / 4, 50);
	}
	draw(){
		if (!this.gameContext || !this.gameCanvas)
			return ;

		this.gameContext.fillStyle = "#000";
		this.gameContext.fillRect(0,0,this.gameCanvas.width,this.gameCanvas.height);

		this.drawBoardDetails();
		this.player1.draw(this.gameContext);
		this.player2.draw(this.gameContext);
		this.ball.draw(this.gameContext);
	}
	update(){
		if (!this.gameCanvas)
			return ;

		this.player1.update(this.gameCanvas);
		this.player2.update(this.gameCanvas);
		this.ball.update(this.player1, this.player2, this.gameCanvas);
	}
	gameLoop(){
		if (gameOver) return ;
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
	draw(context: CanvasRenderingContext2D){
		context.fillStyle = "#fff";
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

		 // Si le jeu est en pause, on ne met pas à jour la position de la balle
		if (isPaused) return;

		//check le haut
		if (this.y <= 10)
			this.yVal = 1;

		//check le bas
		if (this.y  + this.height >= canvas.height - 10)
			this.yVal = -1;

		//check but player 2
		if (this.x <= 0) {
			Game.player2Score += 1;
			this.resetPosition(canvas);
			if (!this.checkGameEnd("Joueur 2")) {
			} else
				return;
		}

		//check but player 1
		if (this.x + this.width >= canvas.width) {
			Game.player1Score += 1;
			this.resetPosition(canvas);
			if (!this.checkGameEnd("Joueur 1")) {
			} else
				return;
		}

		//check player 1 collision
		if (this.x <= player1.x + player1.width &&
			this.y >= player1.y &&
			this.y + this.height <= player1.y + player1.height) {
			this.xVal = -1;
		}

		//check player 2 collision
		if (this.x + this.width >= player2.x &&
			this.y >= player2.y &&
			this.y + this.height <= player2.y + player2.height) {
			this.xVal = -1;
		}

		this.x += this.xVal * this.speed;
		this.y += this.yVal * this.speed;
		}

	private resetPosition(canvas: HTMLCanvasElement) {
		this.x = canvas.width / 2 - this.width / 2;
		this.y = canvas.height / 2 - this.height / 2;
		isPaused = true;
		setTimeout(() => { isPaused = false; }, pauseDuration);
	}

	private async checkGameEnd(winner: string): Promise<boolean> {
		if (Game.player1Score >= MAX_SCORE || Game.player2Score >= MAX_SCORE) {
			// Enregistrer les scores
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

					// Supprimer l'ID du match du localStorage
					localStorage.removeItem('currentMatchId');
				} catch (error) {
					console.error("Erreur lors de l'enregistrement des scores:", error);
				}
			}

			const victoryMessageElement = document.getElementById("Pong");
			if (victoryMessageElement) {
				victoryMessageElement.innerHTML = `
					<p class="font-extrabold">${winner} a gagné !</p>
					<div class="flex justify-center">
						<button id="menu-btn" class="btn rounded-lg border p-4 shadow">Menu</button>
					</div>
				`;

				const menu_btn = document.getElementById("menu-btn");
				if (menu_btn)
					menu_btn.addEventListener("click", () => showHome());
			}
			gameOver = true;
			return true;
		}
		return false;
	}
}
