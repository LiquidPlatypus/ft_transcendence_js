var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var KeyBindings;
(function (KeyBindings) {
    KeyBindings[KeyBindings["UPONE"] = 65] = "UPONE";
    KeyBindings[KeyBindings["DOWNONE"] = 81] = "DOWNONE";
    KeyBindings[KeyBindings["UPTWO"] = 38] = "UPTWO";
    KeyBindings[KeyBindings["DOWNTWO"] = 40] = "DOWNTWO";
    KeyBindings[KeyBindings["RIGHTONE"] = 79] = "RIGHTONE";
    KeyBindings[KeyBindings["LEFTONE"] = 73] = "LEFTONE";
    KeyBindings[KeyBindings["RIGHTTWO"] = 86] = "RIGHTTWO";
    KeyBindings[KeyBindings["LEFTTWO"] = 67] = "LEFTTWO"; //C
})(KeyBindings || (KeyBindings = {}));
const MAX_SCORE = 5;
let isPaused = false; // Variable pour gérer l'état de pause
let pauseDuration = 2000; // Durée de la pause en millisecondes (2 secondes)
let gameOver = false;
export class GameFour {
    constructor() {
        this.gameLoop = () => {
            if (gameOver)
                return;
            this.update();
            this.draw();
            requestAnimationFrame(this.gameLoop);
        };
        const canvas = document.getElementById("game-canvas");
        if (!canvas)
            throw new Error("Element canvas non-trouve");
        this.gameCanvas = canvas;
        this.gameContext = this.gameCanvas.getContext("2d");
        if (!this.gameContext)
            throw new Error("Impossible de recuperer 2D rendering context");
        this.gameContext.font = "30px Orbitron";
        window.addEventListener("keydown", function (e) {
            GameFour.keysPressed[e.which] = true;
        });
        window.addEventListener("keyup", function (e) {
            GameFour.keysPressed[e.which] = false;
        });
        let paddleWidth = 15, paddleHeight = 50, ballSize = 10, wallOffset = 20;
        this.player1 = new Paddle(paddleWidth, paddleHeight, wallOffset, this.gameCanvas.height / 2 - paddleWidth / 2 - paddleHeight / 2);
        this.player2 = new Paddle2(paddleWidth, paddleHeight, this.gameCanvas.width - (wallOffset + paddleWidth), this.gameCanvas.height / 2 - paddleHeight / 2);
        this.player3 = new Paddle3(paddleHeight, paddleWidth, this.gameCanvas.width / 2 - paddleHeight / 2, wallOffset);
        this.player4 = new Paddle4(paddleHeight, paddleWidth, this.gameCanvas.width / 2 - paddleHeight / 2, this.gameCanvas.height - (wallOffset + paddleWidth));
        this.ball = new Ball(ballSize, ballSize, this.gameCanvas.width / 2 - ballSize / 2, this.gameCanvas.height / 2 - ballSize / 2);
    }
    drawBoardDetails() {
        if (!this.gameContext || !this.gameCanvas)
            return;
        //draw court outline
        this.gameContext.strokeStyle = "#fff";
        this.gameContext.lineWidth = 5;
        this.gameContext.strokeRect(10, 10, this.gameCanvas.width - 20, this.gameCanvas.height - 20);
        //draw color
        for (let i = 0; i + 30 < this.gameCanvas.height; i += 30) {
            this.gameContext.fillStyle = "#fff";
        }
        //draw scores
        this.gameContext.textAlign = "center";
        this.gameContext.fillText(GameFour.player1Score.toString(), this.gameCanvas.width / 3, this.gameCanvas.height / 2);
        this.gameContext.fillText(GameFour.player2Score.toString(), (3 * this.gameCanvas.width) / 4.60, this.gameCanvas.height / 2);
        this.gameContext.fillText(GameFour.player3Score.toString(), this.gameCanvas.width / 2, this.gameCanvas.height / 4);
        this.gameContext.fillText(GameFour.player4Score.toString(), this.gameCanvas.width / 2, (3 * this.gameCanvas.height) / 4);
    }
    draw() {
        if (!this.gameContext || !this.gameCanvas)
            return;
        this.gameContext.fillStyle = "#000";
        this.gameContext.fillRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
        this.drawBoardDetails();
        this.player1.draw(this.gameContext);
        this.player2.draw(this.gameContext);
        this.player3.draw(this.gameContext);
        this.player4.draw(this.gameContext);
        this.ball.draw(this.gameContext);
    }
    update() {
        if (!this.gameCanvas)
            return;
        this.player1.update(this.gameCanvas);
        this.player2.update(this.gameCanvas);
        this.player3.update(this.gameCanvas);
        this.player4.update(this.gameCanvas);
        this.ball.update(this.player1, this.player2, this.player3, this.player4, this.gameCanvas);
    }
    static setGameOver(state) {
        gameOver = state;
    }
    static isGameOver() {
        return gameOver;
    }
}
GameFour.keysPressed = [];
GameFour.player1Score = 0;
GameFour.player2Score = 0;
GameFour.player3Score = 0;
GameFour.player4Score = 0;
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
        if (GameFour.keysPressed[KeyBindings.UPONE]) {
            this.yVal = -1;
            if (this.y <= 20) {
                this.yVal = 0;
            }
        }
        else if (GameFour.keysPressed[KeyBindings.DOWNONE]) {
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
        if (GameFour.keysPressed[KeyBindings.UPTWO]) {
            this.yVal = -1;
            if (this.y <= 20) {
                this.yVal = 0;
            }
        }
        else if (GameFour.keysPressed[KeyBindings.DOWNTWO]) {
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
class Paddle3 extends Entity {
    constructor(w, h, x, y) {
        super(w, h, x, y);
        this.speed = 10;
    }
    update(canvas) {
        if (GameFour.keysPressed[KeyBindings.LEFTONE]) {
            this.xVal = -1;
            if (this.x <= 20) {
                this.xVal = 0;
            }
        }
        else if (GameFour.keysPressed[KeyBindings.RIGHTONE]) {
            this.xVal = +1;
            if (this.x + this.width >= canvas.width - 20) {
                this.xVal = 0;
            }
        }
        else {
            this.xVal = 0;
        }
        this.x += this.xVal * this.speed;
    }
}
class Paddle4 extends Entity {
    constructor(w, h, x, y) {
        super(w, h, x, y);
        this.speed = 10;
    }
    update(canvas) {
        if (GameFour.keysPressed[KeyBindings.LEFTTWO]) {
            this.xVal = -1;
            if (this.x <= 20) {
                this.xVal = 0;
            }
        }
        else if (GameFour.keysPressed[KeyBindings.RIGHTTWO]) {
            this.xVal = +1;
            if (this.x + this.width >= canvas.width - 20) {
                this.xVal = 0;
            }
        }
        else {
            this.xVal = 0;
        }
        this.x += this.xVal * this.speed;
    }
}
class Ball extends Entity {
    constructor(w, h, x, y) {
        super(w, h, x, y);
        this.speed = 5;
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
        }
        else {
            this.xVal = -1;
        }
        this.yVal = (Math.random() * 2 - 1) * 2; // Direction verticale aléatoire
    }
    checkGameEnd() {
        return __awaiter(this, void 0, void 0, function* () {
            const highestScore = Math.max(GameFour.player1Score, GameFour.player2Score, GameFour.player3Score, GameFour.player4Score);
            if (highestScore >= MAX_SCORE) {
                // Déterminer le gagnant
                let winner = "";
                if (GameFour.player1Score >= MAX_SCORE)
                    winner = "Joueur 1";
                else if (GameFour.player2Score >= MAX_SCORE)
                    winner = "Joueur 2";
                else if (GameFour.player3Score >= MAX_SCORE)
                    winner = "Joueur 3";
                else if (GameFour.player4Score >= MAX_SCORE)
                    winner = "Joueur 4";
                // Enregistrer les scores
                const matchId = localStorage.getItem('currentMatchId');
                if (matchId) {
                    try {
                        const response = yield fetch("/api/players/match/score", {
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
                    // Import dynamique pour éviter les problèmes de référence circulaire
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
        });
    }
    update(player1, player2, player3, player4, canvas) {
        // Si le jeu est en pause, on ne met pas à jour la position de la balle
        if (isPaused)
            return;
        // Vérification des buts dans les camps respectifs
        if (this.x <= 0) {
            GameFour.player1Score += 1;
            this.resetBallPosition(); // Réinitialiser la position de la balle au centre
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                this.checkGameEnd();
            }, pauseDuration);
        }
        if (this.x + this.width >= canvas.width) {
            GameFour.player2Score += 1;
            this.resetBallPosition(); // Réinitialiser la position de la balle au centre
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                this.checkGameEnd();
            }, pauseDuration);
        }
        if (this.y <= 0) {
            GameFour.player3Score += 1;
            this.resetBallPosition(); // Réinitialiser la position de la balle au centre
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                this.checkGameEnd();
            }, pauseDuration);
        }
        if (this.y + this.height >= canvas.height) {
            GameFour.player4Score += 1;
            this.resetBallPosition(); // Réinitialiser la position de la balle au centre
            isPaused = true;
            setTimeout(() => {
                isPaused = false;
                this.checkGameEnd();
            }, pauseDuration);
        }
        // Collision avec player 1
        if (this.x <= player1.x + player1.width &&
            this.x >= player1.x &&
            this.y + this.height >= player1.y &&
            this.y <= player1.y + player1.height) {
            let relativeY = (this.y + this.height / 2) - (player1.y + player1.height / 2);
            let normalizedY = relativeY / (player1.height / 2); // Normalisation de la position verticale
            this.xVal = 1;
            this.yVal = normalizedY * 1.2; // Ajuste l'angle en fonction de la collision
        }
        // Collision avec player 2
        if (this.x + this.width >= player2.x &&
            this.x <= player2.x + player2.width &&
            this.y + this.height >= player2.y &&
            this.y <= player2.y + player2.height) {
            let relativeY = (this.y + this.height / 2) - (player2.y + player2.height / 2);
            let normalizedY = relativeY / (player2.height / 2); // Normalisation de la position verticale
            this.xVal = -1;
            this.yVal = normalizedY * 1.2; // Ajuste l'angle en fonction de la collision
        }
        // Collision avec player 3 (paddle vertical)
        if (this.y <= player3.y + player3.height &&
            this.y >= player3.y &&
            this.x + this.width >= player3.x &&
            this.x <= player3.x + player3.width) {
            let relativeX = (this.x + this.width / 2) - (player3.x + player3.width / 2);
            let normalizedX = relativeX / (player3.width / 2);
            this.yVal = 1;
            this.xVal = normalizedX * 1.2;
        }
        // Collision avec player 4 (paddle vertical)
        if (this.y + this.height >= player4.y &&
            this.y <= player4.y + player4.height &&
            this.x + this.width >= player4.x &&
            this.x <= player4.x + player4.width) {
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
