
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");


const canvasHeight = canvas.height
const canvasWidth = canvas.width

const PLAYER_WIDTH = 25;
const PLAYER_HEIGHT = 25;
const PLAYER_SPEED = 480; // pixels per second

const PLAYER_START_X = (canvasWidth / 2) - (PLAYER_WIDTH / 2);
const PLAYER_START_Y = canvasHeight - PLAYER_HEIGHT;

const FALLING_OBJECT_HEIGHT = 35;
const FALLING_OBJECT_WIDTH = 35;

const PRESSED_KEYS = {}


function drawCanvas() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    ctx.fillStyle = "#c3cdd6";
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function renderScore() {
    ctx.font = '25px Arial';
    ctx.fillStyle = '#d6045bff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`SCORE: ${player.score}`, 10, 10);
}

function renderGameOver() {
    ctx.font = '50px Impact';
    ctx.fillStyle = '#b61500ff';
    ctx.strokeStyle = 'black'
    ctx.textBaseline = 'middle'
    ctx.textAlign = 'center';

    ctx.fillText('GAME OVER !', canvasWidth / 2, canvasHeight / 2);
    ctx.font = '25px Impact';
    ctx.fillStyle = '#0a6320ff';
    ctx.fillText('Press "R" to restart', canvasWidth / 2, canvasHeight / 2 + 100);
}


// =========================   PLAYER LOGIC   =========================

class Player {
    constructor() {
        this.x = PLAYER_START_X;
        this.y = PLAYER_START_Y;
        this.speed = PLAYER_SPEED;
        this.score = 0;
        this.isAlive = true;
    }

    incrementScore() {
        this.score += 1;
    }

    movePlayer(deltaTime) {
        const moveDistance = (this.speed * deltaTime) / 1000;
        if (PRESSED_KEYS["ArrowLeft"] || PRESSED_KEYS["a"]) {
            this.x -= moveDistance;
        }
        if (PRESSED_KEYS["ArrowRight"] || PRESSED_KEYS["d"]) {
            this.x += moveDistance;
        }
        if (PRESSED_KEYS["ArrowUp"] || PRESSED_KEYS["w"]) {
            this.y -= moveDistance;
        }
        if (PRESSED_KEYS["ArrowDown"] || PRESSED_KEYS["s"]) {
            this.y += moveDistance;
        }

        // stay inside canvas boundary
        this.x = Math.min(Math.max(0, this.x), canvasWidth - PLAYER_WIDTH);
        this.y = Math.min(Math.max(0, this.y), canvasHeight - PLAYER_HEIGHT);

        // update position
        ctx.fillStyle = "#bb333fff";
        ctx.fillRect(this.x, this.y, PLAYER_WIDTH, PLAYER_HEIGHT);
    }

    resetPlayer() {
        this.score = 0;
        this.x = PLAYER_START_X;
        this.y = PLAYER_START_Y;
        this.isAlive = true;
    }
}


// =========================   FALLING BLOCKS   =========================

class Block {
    // Creates a Block with random attributes;
    constructor() {
        this.x = getRandomX();
        this.y = 0;
        this.speed = getRandomSpeed();
    }
}


class FallingBlocks {
    constructor() {
        this.blocks = [];
    }

    initBlocks() {
        this.blocks = []
        for (let i = 1; i <= 8; i++) {
            this.blocks.push( new Block() )
        }
    }

    updatePosition(deltaTime) {

        for (let i = 0; i < this.blocks.length; i++) {

            let x = this.blocks[i].x;
            let y = this.blocks[i].y;

            ctx.fillStyle = "#4335c5ff";
            ctx.fillRect(x, y, FALLING_OBJECT_WIDTH, FALLING_OBJECT_HEIGHT);

            this.blocks[i].y = y + (this.blocks[i].speed * deltaTime) / 1000;

            // Block Out-of-bounds
            if (this.blocks[i].y > canvas.height) {
                this.blocks[i].y = 0;
                this.blocks[i].x = getRandomX();
                this.blocks[i].speed = getRandomSpeed();

                player.incrementScore(); // increment score when each blocks passes by
            }
        }
    }
}


// =========================   UTIL FUNCTIONS   =========================

function getRandomBlocks() {
    return Math.ceil(Math.random() * 3) + 5;
}

function getRandomX() {
    let val = Math.random();
    return Math.floor(val * (canvasWidth - FALLING_OBJECT_WIDTH))
}

// Generates random speed b/w 360 to 720
function getRandomSpeed() {
    let val = Math.random();
    return (Math.ceil(val * 4) + 10) * 60;
}

function detectCollision() {

    for (let block of fallingBlocks.blocks) {

        let x_diff = Math.abs(player.x - block.x)
        let y_diff = Math.abs(player.y - block.y)

        if (x_diff < PLAYER_WIDTH && y_diff < PLAYER_HEIGHT) {
            player.isAlive = false;
        }
    }
}

function handleRestart(event) {
    if (event.key === "r" && !player.isAlive) { // && gameOverHandled == true was suggested as well in IF condition; but really needed ?
        for(let key in PRESSED_KEYS) {
            PRESSED_KEYS[key] = false;
        }

        player.resetPlayer();
        fallingBlocks.initBlocks();
        gameOverHandled = false;
        lastTime = 0;
        requestAnimationFrame(gameLoop);
    }

}

// =========================   MAIN GAME LOOP   =========================

let animationId;
let gameOverHandled = false;
let lastTime = 0;
function gameLoop(timestamp) {
    if (lastTime === 0) {
        lastTime = timestamp;
    }
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    if (player.isAlive) {
        drawCanvas();
        
        player.movePlayer(deltaTime);
        
        fallingBlocks.updatePosition(deltaTime);
        
        detectCollision();
        
        renderScore();

        animationId = requestAnimationFrame(gameLoop)
    }
    else {
        cancelAnimationFrame( animationId );
        if (!gameOverHandled) {
            renderGameOver();
            gameOverHandled = true;
        }
    }
}

const player = new Player();
const fallingBlocks = new FallingBlocks();
fallingBlocks.initBlocks();
requestAnimationFrame(gameLoop);


// =========================   EVENT LISTNERS   =========================

document.addEventListener('keydown', function (event) {
    const handled = ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","a","d","w","s"," "].includes(event.key);
    if (handled){
        event.preventDefault();
        PRESSED_KEYS[event.key] = true;
    }

});


document.addEventListener('keyup', function (event) {

    PRESSED_KEYS[event.key] = false;

});

document.addEventListener('keyup', handleRestart)