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

class Game{
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
			Game.keysPressed[e.which] = true;
		});

		window.addEventListener("keyup", function(e){
			Game.keysPressed[e.which] = false;
		});

		var paddleWidth:number = 15, paddleHeight:number = 50, ballSize:number = 10, wallOffset:number = 20;

		this.player1 = new Paddle(paddleWidth, paddleHeight, wallOffset, this.gameCanvas.height / 2 - paddleWidth / 2 - paddleHeight / 2);
		this.player2 = new Paddle2(paddleWidth, paddleHeight, this.gameCanvas.width - (wallOffset + paddleWidth), this.gameCanvas.height / 2 - paddleHeight / 2);
		this.player3 = new Paddle3(paddleHeight, paddleWidth, this.gameCanvas.width / 2 - paddleHeight / 2, wallOffset);
		this.player4 = new Paddle4(paddleHeight, paddleWidth, this.gameCanvas.width / 2 - paddleHeight / 2, this.gameCanvas.height - (wallOffset + paddleWidth));
		this.ball = new Ball(ballSize, ballSize,  this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2);
	}

	drawBoardDetails(){
		if (!this.gameContext || !this.gameCanvas)
			return ;

		//draw court outline
		this.gameContext.strokeStyle = "#fff";
		this.gameContext.lineWidth = 5;
		this.gameContext.strokeRect(10,10,this.gameCanvas.width - 20 ,this.gameCanvas.height - 20);

		//draw color
		for (let i = 0; i + 30 < this.gameCanvas.height; i += 30) {
			this.gameContext.fillStyle = "#fff";
		}
		
		//draw scores
		this.gameContext.fillText(Game.player1Score.toString(), 280, 350);
		this.gameContext.fillText(Game.player2Score.toString(), 420, 350);
		this.gameContext.fillText(Game.player3Score.toString(), 350, 280);
		this.gameContext.fillText(Game.player4Score.toString(), 350, 420);
	}

	draw(){
		if (!this.gameContext || !this.gameCanvas)
			return ;

		this.gameContext.fillStyle = "#000";
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

	gameLoop(){
		game.update();
		game.draw();
		requestAnimationFrame(game.gameLoop);
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
		if (Game.keysPressed[KeyBindings.UPONE]){
			this.yVal = -1;
			if (this.y <= 20){
				this.yVal = 0
			}
		}
		else if (Game.keysPressed[KeyBindings.DOWNONE]){
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
		if (Game.keysPressed[KeyBindings.UPTWO]){
			this.yVal = -1;
			if (this.y <= 20){
				this.yVal = 0
			}
		}
		else if (Game.keysPressed[KeyBindings.DOWNTWO]){
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
		if (Game.keysPressed[KeyBindings.LEFTONE]){
			this.xVal = -1;
			if (this.x <= 20){
				this.xVal = 0
			}
		}
		else if (Game.keysPressed[KeyBindings.RIGHTONE]){
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
		if (Game.keysPressed[KeyBindings.LEFTTWO]){
			this.xVal = -1;
			if (this.x <= 20){
				this.xVal = 0
			}
		}
		else if (Game.keysPressed[KeyBindings.RIGHTTWO]){
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

	constructor(w: number, h: number, x: number, y: number) {
        super(w, h, x, y);
        this.resetBallPosition(); // Positionne la balle au centre du terrain avec une direction aléatoire
    }

    // Fonction pour réinitialiser la position de la balle après un but
    resetBallPosition() {
		let margin = 50; // Taille de la zone au centre
		this.x = 700 / 2 - this.width / 2 + (Math.random() * margin - margin / 2);
		this.y = 700 / 2 - this.height / 2 + (Math.random() * margin - margin / 2);
	
		// Réinitialisation de la direction de la balle
		let randomDirection = Math.floor(Math.random() * 2) + 1;
		if (randomDirection % 2) {
			this.xVal = 1;
		} else {
			this.xVal = -1;
		}
		this.yVal = (Math.random() * 2 - 1) * 2; // Direction verticale aléatoire
	}

	update(player1: Paddle, player2: Paddle2, player3: Paddle3, player4: Paddle4, canvas: HTMLCanvasElement) {
        // Si le jeu est en pause, on ne met pas à jour la position de la balle
        if (isPaused) return;

        // Vérification des buts dans les camps respectifs
        if (this.x <= 0) {
            Game.player1Score += 1;
            this.resetBallPosition();  // Réinitialiser la position de la balle au centre
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
            }, pauseDuration);
        }

        if (this.x + this.width >= canvas.width) {
            Game.player2Score += 1;
            this.resetBallPosition();  // Réinitialiser la position de la balle au centre
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
            }, pauseDuration);
        }

        if (this.y <= 0) {
            Game.player3Score += 1;
            this.resetBallPosition();  // Réinitialiser la position de la balle au centre
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
            }, pauseDuration);
        }

        if (this.y + this.height >= canvas.height) {
            Game.player4Score += 1;
            this.resetBallPosition();  // Réinitialiser la position de la balle au centre
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
            }, pauseDuration);
        }

        // Collision avec player 1
        if (this.x <= player1.x + player1.width && this.y + this.height >= player1.y && this.y <= player1.y + player1.height) {
            let relativeY = (this.y + this.height / 2) - (player1.y + player1.height / 2);
            let normalizedY = relativeY / (player1.height / 2);  // Normalisation de la position verticale
            this.xVal = 1;
            this.yVal = normalizedY * 1.2;  // Ajuste l'angle en fonction de la collision
        }

        // Collision avec player 2
        if (this.x + this.width >= player2.x && this.y + this.height >= player2.y && this.y <= player2.y + player2.height) {
            let relativeY = (this.y + this.height / 2) - (player2.y + player2.height / 2);
            let normalizedY = relativeY / (player2.height / 2);  // Normalisation de la position verticale
            this.xVal = -1;
            this.yVal = normalizedY * 1.2;  // Ajuste l'angle en fonction de la collision
        }

        // Collision avec player 3 (paddle vertical)
        if (this.y <= player3.y + player3.height && this.x + this.width >= player3.x && this.x <= player3.x + player3.width) {
            let relativeX = (this.x + this.width / 2) - (player3.x + player3.width / 2);
            let normalizedX = relativeX / (player3.width / 2);
            this.yVal = 1;
            this.xVal = normalizedX * 1.2;
        }

        // Collision avec player 4 (paddle vertical)
        if (this.y + this.height >= player4.y && this.x + this.width >= player4.x && this.x <= player4.x + player4.width) {
            let relativeX = (this.x + this.width / 2) - (player4.x + player4.width / 2);
            let normalizedX = relativeX / (player4.width / 2);
            this.yVal = -1;
            this.xVal = normalizedX * 1.2;
        }

        // Mise à jour de la position de la balle
        this.x += this.xVal * this.speed;
        this.y += this.yVal * this.speed;
    }
}

var game = new Game();
requestAnimationFrame(game.gameLoop);