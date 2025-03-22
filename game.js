// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const PLAYER_SIZE = 30;
const PLAYER_SPEED = 200; // pixels per second
const BALL_SIZE = 15;
const BALL_COUNT = 10;

// Players
const player1 = {
    x: 200,
    y: 300,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    color: 'red',
    speed: PLAYER_SPEED,
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false
};

const player2 = {
    x: 600,
    y: 300,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    color: 'blue',
    speed: PLAYER_SPEED,
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false
};

// Balls array
const balls = [];

// Game state object
const gameState = {
    running: true,
    lastTime: 0,
    phase: 'Ball Implementation'
};

// Initialize the game
function init() {
    // Set up keyboard controls
    setupControls();
    
    // Create initial balls
    createBalls();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Create balls at random positions
function createBalls() {
    for (let i = 0; i < BALL_COUNT; i++) {
        createBall();
    }
}

// Create a single ball at a random position
function createBall() {
    // Create a new ball at a random position
    const ball = {
        x: Math.random() * (GAME_WIDTH - BALL_SIZE * 2) + BALL_SIZE,
        y: Math.random() * (GAME_HEIGHT - BALL_SIZE * 2) + BALL_SIZE,
        radius: BALL_SIZE / 2,
        color: getRandomBallColor()
    };
    
    // Add the ball to the balls array
    balls.push(ball);
}

// Generate a random color for balls
function getRandomBallColor() {
    const colors = ['yellow', 'green', 'orange', 'purple', 'cyan'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Set up keyboard controls
function setupControls() {
    // Add event listeners for keydown
    window.addEventListener('keydown', function(e) {
        // Player 1 controls (WASD)
        if (e.key === 'w') player1.moveUp = true;
        if (e.key === 's') player1.moveDown = true;
        if (e.key === 'a') player1.moveLeft = true;
        if (e.key === 'd') player1.moveRight = true;
        
        // Player 2 controls (Arrow keys)
        if (e.key === 'ArrowUp') player2.moveUp = true;
        if (e.key === 'ArrowDown') player2.moveDown = true;
        if (e.key === 'ArrowLeft') player2.moveLeft = true;
        if (e.key === 'ArrowRight') player2.moveRight = true;
    });
    
    // Add event listeners for keyup
    window.addEventListener('keyup', function(e) {
        // Player 1 controls (WASD)
        if (e.key === 'w') player1.moveUp = false;
        if (e.key === 's') player1.moveDown = false;
        if (e.key === 'a') player1.moveLeft = false;
        if (e.key === 'd') player1.moveRight = false;
        
        // Player 2 controls (Arrow keys)
        if (e.key === 'ArrowUp') player2.moveUp = false;
        if (e.key === 'ArrowDown') player2.moveDown = false;
        if (e.key === 'ArrowLeft') player2.moveLeft = false;
        if (e.key === 'ArrowRight') player2.moveRight = false;
    });
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time (time since last frame)
    const deltaTime = timestamp - (gameState.lastTime || timestamp);
    gameState.lastTime = timestamp;
    
    // Convert to seconds for easier calculation
    const deltaSeconds = deltaTime / 1000;
    
    // Clear the canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Update game logic
    update(deltaSeconds);
    
    // Render game objects
    render();
    
    // Continue the game loop if game is running
    if (gameState.running) {
        requestAnimationFrame(gameLoop);
    }
}

// Update game logic
function update(deltaTime) {
    // Update player 1 position
    updatePlayerPosition(player1, deltaTime);
    
    // Update player 2 position
    updatePlayerPosition(player2, deltaTime);
    
    // Check player-ball collisions
    checkBallCollisions();
}

// Update player position based on movement flags
function updatePlayerPosition(player, deltaTime) {
    // Calculate movement based on player speed and delta time
    const moveDistance = player.speed * deltaTime;
    
    // Update position based on movement flags
    if (player.moveUp) player.y -= moveDistance;
    if (player.moveDown) player.y += moveDistance;
    if (player.moveLeft) player.x -= moveDistance;
    if (player.moveRight) player.x += moveDistance;
    
    // Apply boundary constraints
    player.x = Math.max(player.width / 2, Math.min(GAME_WIDTH - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(GAME_HEIGHT - player.height / 2, player.y));
}

// Check for collisions between players and balls
function checkBallCollisions() {
    // In this phase, we just detect collisions but don't do anything with them yet
    // We'll add collection functionality in the next phase
    
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        
        // Check collision with player 1
        if (isColliding(player1, ball)) {
            // Log collision with player 1 (for testing)
            console.log('Player 1 collided with ball', i);
        }
        
        // Check collision with player 2
        if (isColliding(player2, ball)) {
            // Log collision with player 2 (for testing)
            console.log('Player 2 collided with ball', i);
        }
    }
}

// Check if a player and a ball are colliding
function isColliding(player, ball) {
    // Calculate the closest point on the player's box to the ball's center
    const closestX = Math.max(player.x - player.width / 2, Math.min(ball.x, player.x + player.width / 2));
    const closestY = Math.max(player.y - player.height / 2, Math.min(ball.y, player.y + player.height / 2));
    
    // Calculate the distance between the closest point and the ball's center
    const distanceX = closestX - ball.x;
    const distanceY = closestY - ball.y;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    // Return true if the distance is less than the ball's radius (squared)
    return distanceSquared <= ball.radius * ball.radius;
}

// Render game objects
function render() {
    // Draw balls
    drawBalls();
    
    // Draw players
    drawPlayer(player1);
    drawPlayer(player2);
    
    // Draw game info
    drawGameInfo();
}

// Draw all balls
function drawBalls() {
    for (const ball of balls) {
        drawBall(ball);
    }
}

// Draw a single ball
function drawBall(ball) {
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
}

// Draw a player
function drawPlayer(player) {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
}

// Draw game information
function drawGameInfo() {
    // Draw game title
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('BallBrawl', GAME_WIDTH / 2, 30);
    
    // Draw phase info
    ctx.font = '16px Arial';
    ctx.fillText(`Phase 3: ${gameState.phase}`, GAME_WIDTH / 2, 60);
    
    // Draw controls info
    ctx.font = '14px Arial';
    ctx.fillText('Player 1: WASD to move', 120, 30);
    ctx.fillText('Player 2: Arrow keys to move', GAME_WIDTH - 120, 30);
}

// Initialize the game when the page loads
window.addEventListener('load', init);