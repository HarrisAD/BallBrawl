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
const BALL_RESPAWN_TIME = 3000; // milliseconds
const MAX_INVENTORY = 3; // maximum number of balls a player can hold

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
    moveRight: false,
    inventory: 0, // number of balls held
    lastCollectTime: 0 // to prevent rapid collection
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
    moveRight: false,
    inventory: 0, // number of balls held
    lastCollectTime: 0 // to prevent rapid collection
};

// Balls array
const balls = [];
const collectedBalls = []; // Track balls that have been collected

// Game state object
const gameState = {
    running: true,
    lastTime: 0,
    phase: 'Collection Mechanics'
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
        color: getRandomBallColor(),
        active: true, // ball is available for collection
        collectedAt: 0 // time when ball was collected (for respawning)
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
        
        // Ball collection controls
        if (e.key === 'e') collectBall(player1);
        if (e.key === '/') collectBall(player2);
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

// Collect a ball if player is near one
function collectBall(player) {
    // Check if player can hold more balls
    if (player.inventory >= MAX_INVENTORY) {
        return;
    }
    
    // Check for balls within collection range
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        
        // Skip balls that are not active (already collected)
        if (!ball.active) {
            continue;
        }
        
        // Check if player is colliding with the ball
        if (isColliding(player, ball)) {
            // Collect the ball
            ball.active = false;
            ball.collectedAt = Date.now();
            player.inventory++;
            
            // Schedule ball respawn
            setTimeout(() => respawnBall(i), BALL_RESPAWN_TIME);
            
            // Exit the loop after collecting one ball
            break;
        }
    }
}

// Respawn a collected ball
function respawnBall(index) {
    const ball = balls[index];
    
    // Only respawn if the ball is still inactive
    if (!ball.active) {
        // Place ball at a new random position
        ball.x = Math.random() * (GAME_WIDTH - BALL_SIZE * 2) + BALL_SIZE;
        ball.y = Math.random() * (GAME_HEIGHT - BALL_SIZE * 2) + BALL_SIZE;
        ball.active = true;
    }
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
        // Only draw active balls
        if (ball.active) {
            drawBall(ball);
        }
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
    // Draw player rectangle
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - player.width / 2, player.y - player.height / 2, player.width, player.height);
    
    // Draw inventory indicators
    drawInventory(player);
}

// Draw player's ball inventory
function drawInventory(player) {
    const indicatorSize = 8;
    const spacing = 4;
    const startX = player.x - ((indicatorSize + spacing) * MAX_INVENTORY) / 2 + spacing / 2;
    const y = player.y - player.height / 2 - spacing - indicatorSize;
    
    // Draw max inventory slots
    for (let i = 0; i < MAX_INVENTORY; i++) {
        const x = startX + i * (indicatorSize + spacing);
        
        // Draw empty slot
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, indicatorSize, indicatorSize);
        
        // Fill slot if ball is held
        if (i < player.inventory) {
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, indicatorSize, indicatorSize);
        }
    }
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
    ctx.fillText(`Phase 4: ${gameState.phase}`, GAME_WIDTH / 2, 60);
    
    // Draw controls info
    ctx.font = '14px Arial';
    ctx.fillText('Player 1: WASD to move, E to collect', 150, 30);
    ctx.fillText('Player 2: Arrow keys to move, / to collect', GAME_WIDTH - 150, 30);
}

// Initialize the game when the page loads
window.addEventListener('load', init);