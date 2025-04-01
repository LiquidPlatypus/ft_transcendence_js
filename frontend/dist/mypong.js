var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { showHome } from "./script.js";
var KeyBindings;
(function (KeyBindings) {
    KeyBindings[KeyBindings["UP"] = 90] = "UP";
    KeyBindings[KeyBindings["DOWN"] = 83] = "DOWN";
    KeyBindings[KeyBindings["UP2"] = 38] = "UP2";
    KeyBindings[KeyBindings["DOWN2"] = 40] = "DOWN2";
})(KeyBindings || (KeyBindings = {}));
const MAX_SCORE = 5;
let isPaused = false; // Variable pour gérer l'état de pause
let pauseDuration = 2000; // Durée de la pause en millisecondes (2 secondes)
let gameOver = false;
export class Game {
    constructor() {
        const canvas = document.getElementById("game-canvas");
        if (!canvas)
            throw new Error("Element canvas non-trouve");
        this.gameCanvas = canvas;
        this.gameContext = this.gameCanvas.getContext("2d");
        if (!this.gameContext)
            throw new Error("Impossible de recuperer 2D rendering context");
        this.gameContext.font = "30px Orbitron";
        window.addEventListener("keydown", function (e) {
            Game.keysPressed[e.which] = true;
        });
        window.addEventListener("keyup", function (e) {
            Game.keysPressed[e.which] = false;
        });
        const paddleWidth = 20, paddleHeight = 50, ballSize = 10, wallOffset = 20;
        this.player1 = new Paddle(paddleWidth, paddleHeight, wallOffset, this.gameCanvas.height / 2 - paddleWidth / 2);
        this.player2 = new Paddle2(paddleWidth, paddleHeight, this.gameCanvas.width - (wallOffset + paddleWidth), this.gameCanvas.height / 2 - paddleHeight / 2);
        this.ball = new Ball(ballSize, ballSize, this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2);
    }
    drawBoardDetails() {
        if (!this.gameContext || !this.gameCanvas)
            return;
        //draw court outline
        this.gameContext.strokeStyle = "#fff";
        this.gameContext.lineWidth = 5;
        this.gameContext.strokeRect(10, 10, this.gameCanvas.width - 20, this.gameCanvas.height - 20);
        //draw center lines
        for (let i = 0; i + 30 < this.gameCanvas.height; i += 30) {
            this.gameContext.fillStyle = "#fff";
            this.gameContext.fillRect(this.gameCanvas.width / 2 - 10, i + 10, 15, 20);
        }
        //draw scores
        this.gameContext.fillText(Game.player1Score.toString(), 280, 50);
        this.gameContext.fillText(Game.player2Score.toString(), 390, 50);
    }
    draw() {
        if (!this.gameContext || !this.gameCanvas)
            return;
        this.gameContext.fillStyle = "#000";
        this.gameContext.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.drawBoardDetails();
        this.player1.draw(this.gameContext);
        this.player2.draw(this.gameContext);
        this.ball.draw(this.gameContext);
    }
    update() {
        if (!this.gameCanvas)
            return;
        this.player1.update(this.gameCanvas);
        this.player2.update(this.gameCanvas);
        this.ball.update(this.player1, this.player2, this.gameCanvas);
    }
    gameLoop() {
        if (gameOver)
            return;
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    static setGameOver(state) {
        gameOver = state;
    }
    static isGameOver() {
        return gameOver;
    }
}
Game.keysPressed = [];
Game.player1Score = 0;
Game.player2Score = 0;
class Entity {
    constructor(w, h, x, y) {
        this.xVal = 0;
        this.yVal = 0;
        this.width = w;
        this.height = h;
        this.x = x;
        this.y = y;
    }
    draw(context) {
        context.fillStyle = "#fff";
        context.fillRect(this.x, this.y, this.width, this.height);
    }
}
class Paddle extends Entity {
    constructor(w, h, x, y) {
        super(w, h, x, y);
        this.speed = 10;
    }
    update(canvas) {
        if (Game.keysPressed[KeyBindings.UP]) {
            this.yVal = -1;
            if (this.y <= 20) {
                this.yVal = 0;
            }
        }
        else if (Game.keysPressed[KeyBindings.DOWN]) {
            this.yVal = +1;
            if (this.y + this.height >= canvas.height - 20) {
                this.yVal = 0;
            }
        }
        else {
            this.yVal = 0;
        }
        this.y += this.yVal * this.speed;
    }
}
class Paddle2 extends Entity {
    constructor(w, h, x, y) {
        super(w, h, x, y);
        this.speed = 10;
    }
    update(canvas) {
        if (Game.keysPressed[KeyBindings.UP2]) {
            this.yVal = -1;
            if (this.y <= 20) {
                this.yVal = 0;
            }
        }
        else if (Game.keysPressed[KeyBindings.DOWN2]) {
            this.yVal = +1;
            if (this.y + this.height >= canvas.height - 20) {
                this.yVal = 0;
            }
        }
        else {
            this.yVal = 0;
        }
        this.y += this.yVal * this.speed;
    }
}
class Ball extends Entity {
    constructor(w, h, x, y) {
        super(w, h, x, y);
        this.speed = 5;
        const randomDirection = Math.floor(Math.random() * 2) + 1;
        if (randomDirection % 2)
            this.xVal = 1;
        else
            this.xVal = -1;
        this.yVal = 1;
    }
    update(player1, player2, canvas) {
        // Si le jeu est en pause, on ne met pas à jour la position de la balle
        if (isPaused)
            return;
        //check le haut
        if (this.y <= 10)
            this.yVal = 1;
        //check le bas
        if (this.y + this.height >= canvas.height - 10)
            this.yVal = -1;
        //check but player 2
        if (this.x <= 0) {
            Game.player2Score += 1;
            this.resetPosition(canvas);
            if (!this.checkGameEnd("Joueur 2")) {
            }
            else
                return;
        }
        //check but player 1
        if (this.x + this.width >= canvas.width) {
            Game.player1Score += 1;
            this.resetPosition(canvas);
            if (!this.checkGameEnd("Joueur 1")) {
            }
            else
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
    resetPosition(canvas) {
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height / 2 - this.height / 2;
        isPaused = true;
        setTimeout(() => { isPaused = false; }, pauseDuration);
    }
    checkGameEnd(winner) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Game.player1Score >= MAX_SCORE || Game.player2Score >= MAX_SCORE) {
                // Enregistrer les scores
                const matchId = localStorage.getItem('currentMatchId');
                if (matchId) {
                    try {
                        const response = yield fetch("/api/players/match/score", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                matchId: parseInt(matchId),
                                player1Score: Game.player1Score,
                                player2Score: Game.player2Score
                            }),
                        });
                        const result = yield response.json();
                        console.log("Résultat sauvegardé:", result);
                        // Supprimer l'ID du match du localStorage
                        localStorage.removeItem('currentMatchId');
                    }
                    catch (error) {
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
        });
    }
}
