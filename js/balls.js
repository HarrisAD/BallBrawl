// Ball-related code

// Arrays to store balls
const balls = [];
const thrownBalls = [];

// Create balls at random positions
function createBalls() {
    for (let i = 0; i < BALL_COUNT; i++) {
        createBall();
    }
}

// Create a single ball at a random position
function createBall() {
    // Set a minimum distance from obstacles
    const minObstacleDistance = BALL_SIZE * 2;
    
    // Generate a random position
    let x, y;
    let validPosition = false;
    
    // Keep trying until we find a valid position
    const maxAttempts = 100;
    let attempts = 0;
    
    while (!validPosition && attempts < maxAttempts) {
        attempts++;
        
        // Generate a random position within the canvas
        x = Math.random() * (GAME_WIDTH - BALL_SIZE * 2) + BALL_SIZE;
        y = Math.random() * (GAME_HEIGHT - BALL_SIZE * 2) + BALL_SIZE;
        
        // Check distance from obstacles
        let tooCloseToObstacle = false;
        for (const obstacle of obstacles) {
            if (circleRectCollision({x, y, radius: BALL_SIZE / 2}, obstacle)) {
                tooCloseToObstacle = true;
                break;
            }
        }
        
        // Position is valid if it's far enough from obstacles
        if (!tooCloseToObstacle) {
            validPosition = true;
        }
    }
    
    // If we couldn't find a valid position, use the last attempted one
    if (!validPosition) {
        console.warn('Could not find an ideal ball position');
    }
    
    // Create a new ball
    const ball = {
        x: x,
        y: y,
        radius: BALL_SIZE / 2,
        color: getRandomBallColor(),
        active: true, // ball is available for collection
        collectedAt: 0 // time when ball was collected (for respawning)
    };
    
    // Add the ball to the balls array
    balls.push(ball);
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
        // Place ball at a new random position, avoiding obstacles
        let validPosition = false;
        let newX, newY;
        const maxAttempts = 100;
        let attempts = 0;
        
        while (!validPosition && attempts < maxAttempts) {
            attempts++;
            
            newX = Math.random() * (GAME_WIDTH - BALL_SIZE * 2) + BALL_SIZE;
            newY = Math.random() * (GAME_HEIGHT - BALL_SIZE * 2) + BALL_SIZE;
            
            // Check collision with obstacles
            let collisionDetected = false;
            for (const obstacle of obstacles) {
                if (circleRectCollision({x: newX, y: newY, radius: BALL_SIZE / 2}, obstacle)) {
                    collisionDetected = true;
                    break;
                }
            }
            
            if (!collisionDetected) {
                validPosition = true;
            }
        }
        
        ball.x = newX || Math.random() * (GAME_WIDTH - BALL_SIZE * 2) + BALL_SIZE;
        ball.y = newY || Math.random() * (GAME_HEIGHT - BALL_SIZE * 2) + BALL_SIZE;
        ball.active = true;
    }
}

// Update thrown balls (move them and check for collisions)
function updateThrownBalls(deltaTime) {
    for (let i = thrownBalls.length - 1; i >= 0; i--) {
        const ball = thrownBalls[i];
        
        // Calculate new position
        const newX = ball.x + ball.vx * deltaTime;
        const newY = ball.y + ball.vy * deltaTime;
        
        // Check for wall collisions
        if (newX - ball.radius < 0 || newX + ball.radius > GAME_WIDTH ||
            newY - ball.radius < 0 || newY + ball.radius > GAME_HEIGHT) {
            // Remove the ball when it hits a wall
            thrownBalls.splice(i, 1);
            continue;
        }
        
        // Check for obstacle collisions
        let obstacleHit = false;
        for (const obstacle of obstacles) {
            if (circleRectCollision({x: newX, y: newY, radius: ball.radius}, obstacle)) {
                // Remove the ball when it hits an obstacle
                thrownBalls.splice(i, 1);
                obstacleHit = true;
                break;
            }
        }
        
        if (obstacleHit) {
            continue;
        }
        
        // Update ball position if no collisions
        ball.x = newX;
        ball.y = newY;
        
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

// Reset balls to their initial state
function resetBalls() {
    // Clear thrown balls
    thrownBalls.length = 0;
    
    // Reset collectible balls
    balls.forEach(ball => {
        ball.active = true;
        ball.x = Math.random() * (GAME_WIDTH - BALL_SIZE * 2) + BALL_SIZE;
        ball.y = Math.random() * (GAME_HEIGHT - BALL_SIZE * 2) + BALL_SIZE;
    });
}