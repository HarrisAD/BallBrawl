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
const THROW_SPEED = 400; // pixels per second
const AIM_LINE_LENGTH = 50; // length of aiming line
const KNOCKBACK_FORCE = 300; // knockback force when hit
const KNOCKBACK_DURATION = 0.2; // knockback duration in seconds
const INVINCIBILITY_DURATION = 1000; // invincibility period after being hit (milliseconds)
const MAX_HEALTH = 3; // maximum health points

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
    lastCollectTime: 0, // to prevent rapid collection
    aiming: false, // whether player is currently aiming
    aimAngle: 0, // angle of aim in radians
    aimSpeed: Math.PI / 2, // rotation speed in radians per second
    health: MAX_HEALTH, // player health
    isKnockedBack: false, // whether player is currently knocked back
    knockbackTime: 0, // time remaining in knockback
    knockbackVelocityX: 0, // knockback velocity X
    knockbackVelocityY: 0, // knockback velocity Y
    isInvincible: false, // whether player is currently invincible
    invincibleEndTime: 0 // when invincibility ends
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
    lastCollectTime: 0, // to prevent rapid collection
    aiming: false, // whether player is currently aiming
    aimAngle: Math.PI, // angle of aim in radians (start aiming left)
    aimSpeed: Math.PI / 2, // rotation speed in radians per second
    health: MAX_HEALTH, // player health
    isKnockedBack: false, // whether player is currently knocked back
    knockbackTime: 0, // time remaining in knockback
    knockbackVelocityX: 0, // knockback velocity X
    knockbackVelocityY: 0, // knockback velocity Y
    isInvincible: false, // whether player is currently invincible
    invincibleEndTime: 0 // when invincibility ends
};

// Balls array
const balls = [];
const thrownBalls = []; // Track balls that have been thrown

// Game state object
const gameState = {
    running: true,
    lastTime: 0,
    phase: 'Hit Detection',
    gameOver: false,
    winner: null
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
        
        // Aiming controls
        if (e.key === 'q') player1.aiming = true;
        if (e.key === '.') player2.aiming = true;
        
        // Restart game if game over
        if (e.key === 'r' && gameState.gameOver) {
            resetGame();
        }
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
        
        // Throwing controls
        if (e.key === 'q' && player1.aiming) {
            throwBall(player1);
            player1.aiming = false;
        }
        if (e.key === '.' && player2.aiming) {
            throwBall(player2);
            player2.aiming = false;
        }
    });
}

// Reset the game
function resetGame() {
    // Reset player positions and states
    player1.x = 200;
    player1.y = 300;
    player1.inventory = 0;
    player1.health = MAX_HEALTH;
    player1.isKnockedBack = false;
    player1.isInvincible = false;
    
    player2.x = 600;
    player2.y = 300;
    player2.inventory = 0;
    player2.health = MAX_HEALTH;
    player2.isKnockedBack = false;
    player2.isInvincible = false;
    
    // Clear thrown balls
    thrownBalls.length = 0;
    
    // Reset game state
    gameState.gameOver = false;
    gameState.winner = null;
    
    // Reset collectible balls
    balls.forEach(ball => {
        ball.active = true;
        ball.x = Math.random() * (GAME_WIDTH - BALL_SIZE * 2) + BALL_SIZE;
        ball.y = Math.random() * (GAME_HEIGHT - BALL_SIZE * 2) + BALL_SIZE;
    });
}

// Collect a ball if player is near one
function collectBall(player) {
    // Don't collect when knocked back
    if (player.isKnockedBack) {
        return;
    }
    
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

// Throw a ball in the direction the player is aiming
function throwBall(player) {
    // Don't throw when knocked back
    if (player.isKnockedBack) {
        return;
    }
    
    // Check if player has balls to throw
    if (player.inventory <= 0) {
        return;
    }
    
    // Reduce player's inventory
    player.inventory--;
    
    // Calculate throw direction based on aim angle
    const vx = Math.cos(player.aimAngle) * THROW_SPEED;
    const vy = Math.sin(player.aimAngle) * THROW_SPEED;
    
    // Create a new thrown ball
    const thrownBall = {
        x: player.x + Math.cos(player.aimAngle) * (player.width / 2 + 5),
        y: player.y + Math.sin(player.aimAngle) * (player.height / 2 + 5),
        radius: BALL_SIZE / 2,
        color: player.color === 'red' ? 'darkred' : 'darkblue', // Tint based on player
        vx: vx,
        vy: vy,
        owner: player === player1 ? 1 : 2 // Track which player threw the ball
    };
    
    // Add the ball to the thrown balls array
    thrownBalls.push(thrownBall);
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

// Apply knockback to a player when hit
function applyKnockback(player, ball) {
    // Calculate knockback direction (normalized vector from ball to player)
    const dx = player.x - ball.x;
    const dy = player.y - ball.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Apply knockback velocity
    player.knockbackVelocityX = (dx / distance) * KNOCKBACK_FORCE;
    player.knockbackVelocityY = (dy / distance) * KNOCKBACK_FORCE;
    
    // Set knockback state
    player.isKnockedBack = true;
    player.knockbackTime = KNOCKBACK_DURATION;
    
    // Apply invincibility
    player.isInvincible = true;
    player.invincibleEndTime = Date.now() + INVINCIBILITY_DURATION;
    
    // Reduce health
    player.health--;
    
    // Check if player is defeated
    if (player.health <= 0) {
        gameState.gameOver = true;
        gameState.winner = player === player1 ? 2 : 1;
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
    
    // Update game logic if not game over
    if (!gameState.gameOver) {
        update(deltaSeconds);
    }
    
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
    
    // Update aiming angles if players are aiming
    updateAimingAngles(deltaTime);
    
    // Update thrown balls
    updateThrownBalls(deltaTime);
    
    // Update invincibility state
    updateInvincibility();
}

// Update player position based on movement flags
function updatePlayerPosition(player, deltaTime) {
    if (player.isKnockedBack) {
        // Update knockback physics
        player.x += player.knockbackVelocityX * deltaTime;
        player.y += player.knockbackVelocityY * deltaTime;
        
        // Reduce knockback time
        player.knockbackTime -= deltaTime;
        
        // End knockback if time is up
        if (player.knockbackTime <= 0) {
            player.isKnockedBack = false;
        }
    } else {
        // Calculate movement based on player speed and delta time
        const moveDistance = player.speed * deltaTime;
        
        // Update position based on movement flags
        if (player.moveUp) player.y -= moveDistance;
        if (player.moveDown) player.y += moveDistance;
        if (player.moveLeft) player.x -= moveDistance;
        if (player.moveRight) player.x += moveDistance;
    }
    
    // Apply boundary constraints
    player.x = Math.max(player.width / 2, Math.min(GAME_WIDTH - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(GAME_HEIGHT - player.height / 2, player.y));
}

// Update invincibility state for both players
function updateInvincibility() {
    const currentTime = Date.now();
    
    // Update player 1 invincibility
    if (player1.isInvincible && currentTime >= player1.invincibleEndTime) {
        player1.isInvincible = false;
    }
    
    // Update player 2 invincibility
    if (player2.isInvincible && currentTime >= player2.invincibleEndTime) {
        player2.isInvincible = false;
    }
}

// Update aiming angles for players who are aiming
function updateAimingAngles(deltaTime) {
    // Rotate Player 1's aim angle counterclockwise when aiming
    if (player1.aiming) {
        player1.aimAngle -= player1.aimSpeed * deltaTime;
        // Keep angle within 0 to 2π range
        if (player1.aimAngle < 0) player1.aimAngle += Math.PI * 2;
    }
    
    // Rotate Player 2's aim angle counterclockwise when aiming
    if (player2.aiming) {
        player2.aimAngle -= player2.aimSpeed * deltaTime;
        // Keep angle within 0 to 2π range
        if (player2.aimAngle < 0) player2.aimAngle += Math.PI * 2;
    }
}

// Update thrown balls (move them and check for collisions)
function updateThrownBalls(deltaTime) {
    for (let i = thrownBalls.length - 1; i >= 0; i--) {
        const ball = thrownBalls[i];
        
        // Update ball position
        ball.x += ball.vx * deltaTime;
        ball.y += ball.vy * deltaTime;
        
        // Check for wall collisions
        // Left or right wall
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > GAME_WIDTH) {
            // Remove the ball when it hits a wall
            thrownBalls.splice(i, 1);
            continue;
        }
        
        // Top or bottom wall
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > GAME_HEIGHT) {
            // Remove the ball when it hits a wall
            thrownBalls.splice(i, 1);
            continue;
        }
        
        // Check for player collisions (only if ball is not owned by this player)
        // Check collision with player 1 (if ball was thrown by player 2)
        if (ball.owner === 2 && !player1.isInvincible && isColliding(player1, ball)) {
            // Apply knockback and remove the ball
            applyKnockback(player1, ball);
            thrownBalls.splice(i, 1);
            continue;
        }
        
        // Check collision with player 2 (if ball was thrown by player 1)
        if (ball.owner === 1 && !player2.isInvincible && isColliding(player2, ball)) {
            // Apply knockback and remove the ball
            applyKnockback(player2, ball);
            thrownBalls.splice(i, 1);
            continue;
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
    // Draw balls (collectible)
    drawBalls();
    
    // Draw thrown balls
    drawThrownBalls();
    
    // Draw players
    drawPlayer(player1);
    drawPlayer(player2);
    
    // Draw aiming lines if players are aiming
    if (player1.aiming) drawAimLine(player1);
    if (player2.aiming) drawAimLine(player2);
    
    // Draw game info
    drawGameInfo();
    
    // Draw health bars
    drawHealthBars();
    
    // Draw game over message if game is over
    if (gameState.gameOver) {
        drawGameOver();
    }
}

// Draw all collectible balls
function drawBalls() {
    for (const ball of balls) {
        // Only draw active balls
        if (ball.active) {
            drawBall(ball);
        }
    }
}

// Draw all thrown balls
function drawThrownBalls() {
    for (const ball of thrownBalls) {
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

// Draw aim line for a player
function drawAimLine(player) {
    const startX = player.x;
    const startY = player.y;
    const endX = startX + Math.cos(player.aimAngle) * AIM_LINE_LENGTH;
    const endY = startY + Math.sin(player.aimAngle) * AIM_LINE_LENGTH;
    
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    
    // Draw arrowhead
    const arrowSize = 5;
    const angle = player.aimAngle;
    
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(
        endX - arrowSize * Math.cos(angle - Math.PI / 6),
        endY - arrowSize * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
        endX - arrowSize * Math.cos(angle + Math.PI / 6),
        endY - arrowSize * Math.sin(angle + Math.PI / 6)
    );
    ctx.closePath();
    ctx.fillStyle = player.color;
    ctx.fill();
}

// Draw a player
function drawPlayer(player) {
    // Set player color (flash white if invincible)
    if (player.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.fillStyle = 'white';
    } else {
        ctx.fillStyle = player.color;
    }
    
    // Draw player rectangle
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

// Draw health bars for both players
function drawHealthBars() {
    const barWidth = 100;
    const barHeight = 15;
    const padding = 10;
    
    // Draw player 1 health bar (left side)
    drawHealthBar(padding, padding, barWidth, barHeight, player1.health, MAX_HEALTH, 'red');
    
    // Draw player 2 health bar (right side)
    drawHealthBar(GAME_WIDTH - padding - barWidth, padding, barWidth, barHeight, player2.health, MAX_HEALTH, 'blue');
}

// Draw a health bar
function drawHealthBar(x, y, width, height, currentHealth, maxHealth, color) {
    // Draw background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);
    
    // Draw health
    const healthWidth = (currentHealth / maxHealth) * width;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, healthWidth, height);
    
    // Draw border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Draw health text
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${currentHealth}/${maxHealth}`, x + width / 2, y + height / 2 + 4);
}

// Draw game over message
function drawGameOver() {
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw game over text
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('GAME OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 40);
    
    // Draw winner text
    if (gameState.winner) {
        ctx.font = '36px Arial';
        const winnerColor = gameState.winner === 1 ? 'red' : 'blue';
        ctx.fillStyle = winnerColor;
        ctx.fillText(`Player ${gameState.winner} wins!`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20);
    }
    
    // Draw restart instructions
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Press R to restart', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
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
    ctx.fillText(`Phase 6: ${gameState.phase}`, GAME_WIDTH / 2, 60);
    
    // Draw controls info (smaller text at the bottom)
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillText('Player 1: WASD to move, E to collect, Q to aim/throw', GAME_WIDTH / 2, GAME_HEIGHT - 25);
    ctx.fillText('Player 2: Arrow keys to move, / to collect, . to aim/throw', GAME_WIDTH / 2, GAME_HEIGHT - 10);
}

// Initialize the game when the page loads
window.addEventListener('load', init);