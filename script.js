document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Error: Canvas element with ID "gameCanvas" not found.');
        return;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Error: Failed to get 2D rendering context for canvas.');
        return;
    }

    // Game variables
let score = 0;
let lives = 3;
let gameStarted = false; // Tracks if the game has started (ball launched)

// Ball properties
let x = canvas.width / 2;
let y = canvas.height - 30;
let dx = 2;
let dy = -2;
const ballRadius = 10;

// Paddle properties
const paddleHeight = 10;
const paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

// Brick properties
const brickRowCount = 3;
const brickColumnCount = 5;
const brickWidth = 75;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 30;

const bricks = [];
for (let c = 0; c < brickColumnCount; c++) {
    bricks[c] = [];
    for (let r = 0; r < brickRowCount; r++) {
        bricks[c][r] = { x: 0, y: 0, status: 1 };
    }
}

// Control state
let rightPressed = false;
let leftPressed = false;

document.addEventListener('keydown', keyDownHandler, false);
document.addEventListener('keyup', keyUpHandler, false);
document.addEventListener("mousemove", mouseMoveHandler, false);
document.addEventListener('mousedown', mouseDownHandler, false); // Added for click to launch


function mouseDownHandler(e) {
    // Check for left click (button code 0) and if the game hasn't started yet
    if (e.button === 0 && !gameStarted) {
        gameStarted = true;
        // dx and dy should have been reset to their initial values (e.g., 2, -2)
        // when a life was lost or at game initialization.
        // If there's a scenario where they might not be, uncomment and set them:
        // dx = 2;
        // dy = -2;
    }
}

function keyDownHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = true;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === 'Right' || e.key === 'ArrowRight') {
        rightPressed = false;
    } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
        leftPressed = false;
    }
}

function mouseMoveHandler(e) {
    const relativeX = e.clientX - canvas.offsetLeft;
    if (relativeX > 0 && relativeX < canvas.width) {
        paddleX = relativeX - paddleWidth / 2;
    }
}


function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                    dy = -dy;
                    b.status = 0;
                    score++;
                    // drawScore(); // Already called in draw()
                    if (score === brickRowCount * brickColumnCount) {
                        return true; // Game won
                    }
                }
            }
        }
    }
}

function drawBall() {
    ctx.beginPath();
    ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = '#0095DD';
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#0095DD';
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    document.getElementById('score').textContent = 'Score: ' + score;
}

function drawLives() {
    document.getElementById('lives').textContent = 'Lives: ' + lives;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawBall();
    drawPaddle();
    drawScore();
    drawLives();

    if (!gameStarted) {
        // Ball follows the paddle
        x = paddleX + (paddleWidth / 2);
        y = canvas.height - paddleHeight - ballRadius;
        // Ensure dx/dy are reset to initial launch values (optional, but good practice)
        // dx = 2;
        // dy = -2;
        // Note: dx/dy are currently reset when a life is lost anyway.
        // If we want the ball to show a specific direction before launch, set them here.
        // For now, their values from previous state (e.g. after life loss) will persist until launch.

    } else {
        // Game has started, ball is moving

        // Brick collision detection
        const gameWon = collisionDetection();
        if (gameWon) {
            alert('YOU WIN, CONGRATULATIONS!');
            document.location.reload();
            return; // Stop the game loop if won
        }

        // Wall collisions
        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }

        // Top wall collision OR Paddle/Bottom wall collision
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) { // Hits bottom area
            if (x > paddleX && x < paddleX + paddleWidth) { // Hits paddle
                dy = -dy;
            } else { // Misses paddle
                lives--;
                if (!lives) {
                    alert('GAME OVER');
                    document.location.reload();
                    // No need to set gameStarted = false here, page reloads.
                } else {
                    // Reset ball position for next life
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    dx = 2; // Reset speed
                    dy = -2; // Reset speed
                    paddleX = (canvas.width - paddleWidth) / 2;
                    gameStarted = false; // Return to pre-launch state
                }
            }
        }

        // Actual ball position update
        x += dx;
        y += dy;
    }

    // Paddle movement (keyboard controls) - should always be active
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 7;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 7;
    }

    requestAnimationFrame(draw);
    } // End of draw function

    // Initial call to start the animation loop
    draw();
}); // End of DOMContentLoaded
