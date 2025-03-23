// Ball-related code

// Arrays to store balls
const balls = [];
const thrownBalls = [];
const ballEffects = []; // For visual effects like flashes

// Invisibility powerup
let invisibilityPowerup = {
    active: false,
    x: 0,
    y: 0,
    radius: BALL_SIZE / 2,
    spawnTime: 0,
    nextSpawnTime: 0,
    pulseSize: 0,
    pulseDirection: 0.2,
    rotation: 0,
    rotationSpeed: 0.03,
    scale: 1
};

// Create balls at random positions
function createBalls() {
    for (let i = 0; i < BALL_COUNT; i++) {
        createBall();
    }
    
    // Initialize first invisibility powerup spawn
    invisibilityPowerup.nextSpawnTime = Date.now() + getRandomSpawnInterval();
}

// Get a random spawn interval for invisibility powerup
function getRandomSpawnInterval() {
    return Math.random() * (INVISIBILITY_SPAWN_INTERVAL_MAX - INVISIBILITY_SPAWN_INTERVAL_MIN) + INVISIBILITY_SPAWN_INTERVAL_MIN;
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
        collectedAt: 0, // time when ball was collected (for respawning)
        pulseSize: 0, // for pulsing animation
        pulseDirection: 0.2, // pulse growth rate
        rotation: Math.random() * Math.PI * 2, // random initial rotation
        rotationSpeed: (Math.random() * 0.02) - 0.01, // random rotation speed
        glowIntensity: 0.5 + Math.random() * 0.5, // random glow intensity
        scale: 1, // for scale animations
        spawnAnimation: 0 // for spawn animation progress
    };
    
    // Add the ball to the balls array
    balls.push(ball);
}

// Create a visual effect (flash, explosion, etc.)
function createBallEffect(x, y, color, type) {
    const effect = {
        x: x,
        y: y,
        color: color,
        type: type,
        radius: BALL_SIZE,
        alpha: 1,
        lifeTime: 0,
        maxLifeTime: 20 // frames of animation
    };
    
    ballEffects.push(effect);
}

// Spawn the invisibility powerup
function spawnInvisibilityPowerup() {
    // Only spawn if not already active
    if (invisibilityPowerup.active) return;
    
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
        console.warn('Could not find an ideal powerup position');
    }
    
    // Set up the invisibility powerup
    invisibilityPowerup = {
        active: true,
        x: x,
        y: y,
        radius: BALL_SIZE / 2,
        spawnTime: Date.now(),
        nextSpawnTime: 0,
        pulseSize: 0,
        pulseDirection: 0.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: 0.03,
        scale: 0 // Start with scale 0 for spawn animation
    };
    
    // Create spawn effect
    createBallEffect(x, y, 'white', 'spawn');
}

// Update invisibility powerup state
function updateInvisibilityPowerup(deltaTime) {
    const currentTime = Date.now();
    
    // Check if it's time to spawn a new powerup
    if (!invisibilityPowerup.active && currentTime >= invisibilityPowerup.nextSpawnTime && gameState.status === GAME_STATE.PLAYING) {
        spawnInvisibilityPowerup();
    }
    
    // Update active powerup
    if (invisibilityPowerup.active) {
        // Update animation properties
        invisibilityPowerup.rotation += invisibilityPowerup.rotationSpeed;
        invisibilityPowerup.pulseSize += invisibilityPowerup.pulseDirection;
        
        // Increase scale for spawn animation
        if (invisibilityPowerup.scale < 1) {
            invisibilityPowerup.scale = Math.min(1, invisibilityPowerup.scale + deltaTime * 2);
        }
        
        // Control pulse animation
        if (invisibilityPowerup.pulseSize > 2) invisibilityPowerup.pulseDirection = -0.2;
        if (invisibilityPowerup.pulseSize < 0) invisibilityPowerup.pulseDirection = 0.2;
        
        // Check if powerup should disappear
        if (currentTime - invisibilityPowerup.spawnTime > INVISIBILITY_ACTIVE_DURATION) {
            invisibilityPowerup.active = false;
            invisibilityPowerup.nextSpawnTime = currentTime + getRandomSpawnInterval();
        }
        
        // Check collision with players
        if (isColliding(player1, invisibilityPowerup)) {
            collectInvisibilityPowerup(player1);
        } else if (isColliding(player2, invisibilityPowerup)) {
            collectInvisibilityPowerup(player2);
        }
    }
}

// Collect invisibility powerup
function collectInvisibilityPowerup(player) {
    // Already collected or player is knocked back
    if (!invisibilityPowerup.active || player.isKnockedBack) return;
    
    // Create collection effect
    createBallEffect(invisibilityPowerup.x, invisibilityPowerup.y, 'white', 'collect');
    
    // Deactivate powerup
    invisibilityPowerup.active = false;
    invisibilityPowerup.nextSpawnTime = Date.now() + getRandomSpawnInterval();
    
    // Apply invisibility to player
    player.isInvisible = true;
    player.invisibleEndTime = Date.now() + INVISIBILITY_DURATION;
    
    // Create invisibility effect around player
    createBallEffect(player.x, player.y, 'white', 'invisibility');
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
            // Create a collection effect
            createBallEffect(ball.x, ball.y, ball.color, 'collect');
            
            // Collect the ball
            ball.active = false;
            ball.collectedAt = Date.now();
            player.inventory++;
            
            // Play collection animation
            if (player === player1) {
                player.collectAnimation = 15; // animation frames
            } else {
                player.collectAnimation = 15;
            }
            
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
    
    // Trigger throw animation
    player.throwAnimation = 10; // animation frames
    
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
        owner: player === player1 ? 1 : 2, // Track which player threw the ball
        trail: [], // For trail effect
        trailTimer: 0 // Timer for adding trail points
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
        
        // Reset animation properties
        ball.pulseSize = 0;
        ball.pulseDirection = 0.2;
        ball.rotation = Math.random() * Math.PI * 2;
        ball.rotationSpeed = (Math.random() * 0.02) - 0.01;
        ball.glowIntensity = 0.5 + Math.random() * 0.5;
        
        // Set up spawn animation
        ball.scale = 0;
        ball.spawnAnimation = 1;
        
        // Create a spawn effect
        createBallEffect(ball.x, ball.y, ball.color, 'spawn');
        
        // Activate the ball
        ball.active = true;
    }
}

// Update thrown balls (move them and check for collisions)
function updateThrownBalls(deltaTime) {
    // Update ball effects
    updateBallEffects();
    
    // Update invisibility powerup
    updateInvisibilityPowerup(deltaTime);
    
    // Update collectible balls
    for (let i = 0; i < balls.length; i++) {
        const ball = balls[i];
        
        // Skip inactive balls
        if (!ball.active) continue;
        
        // Update spawn animation if active
        if (ball.spawnAnimation > 0) {
            ball.spawnAnimation += deltaTime * 3;
            
            // Update scale based on animation progress
            if (ball.spawnAnimation <= 1) {
                ball.scale = ball.spawnAnimation;
            } else {
                ball.scale = 1;
                ball.spawnAnimation = 0;
            }
        }
    }
    
    // Update player invisibility status
    const currentTime = Date.now();
    
    // Check and update player1 invisibility
    if (player1.isInvisible && currentTime >= player1.invisibleEndTime) {
        player1.isInvisible = false;
        // Create effect when invisibility ends
        createBallEffect(player1.x, player1.y, 'white', 'invisibility');
    }
    
    // Check and update player2 invisibility
    if (player2.isInvisible && currentTime >= player2.invisibleEndTime) {
        player2.isInvisible = false;
        // Create effect when invisibility ends
        createBallEffect(player2.x, player2.y, 'white', 'invisibility');
    }
    
    // Update thrown balls
    for (let i = thrownBalls.length - 1; i >= 0; i--) {
        const ball = thrownBalls[i];
        
        // Add to trail timer
        ball.trailTimer += deltaTime;
        
        // Add trail point every 0.05 seconds
        if (ball.trailTimer >= 0.05) {
            ball.trail.push({
                x: ball.x,
                y: ball.y,
                alpha: 1.0
            });
            
            // Reset timer
            ball.trailTimer = 0;
            
            // Limit trail length
            if (ball.trail.length > 10) {
                ball.trail.shift();
            }
        }
        
        // Update trail alpha
        for (let j = 0; j < ball.trail.length; j++) {
            ball.trail[j].alpha -= deltaTime * 2;
            if (ball.trail[j].alpha < 0) ball.trail[j].alpha = 0;
        }
        
        // Calculate new position
        const newX = ball.x + ball.vx * deltaTime;
        const newY = ball.y + ball.vy * deltaTime;
        
        // Check for wall collisions
        if (newX - ball.radius < 0 || newX + ball.radius > GAME_WIDTH ||
            newY - ball.radius < 0 || newY + ball.radius > GAME_HEIGHT) {
            // Create a wall impact effect
            createBallEffect(ball.x, ball.y, ball.color, 'impact');
            
            // Remove the ball when it hits a wall
            thrownBalls.splice(i, 1);
            continue;
        }
        
        // Check for obstacle collisions
        let obstacleHit = false;
        for (const obstacle of obstacles) {
            if (circleRectCollision({x: newX, y: newY, radius: ball.radius}, obstacle)) {
                // Create an obstacle impact effect
                createBallEffect(ball.x, ball.y, ball.color, 'impact');
                
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
        if (ball.owner === 2 && !player1.isInvincible && !player1.isInvisible && isColliding(player1, ball)) {
            // Create a hit effect
            createBallEffect(ball.x, ball.y, ball.color, 'hit');
            
            // Apply knockback and remove the ball
            applyKnockback(player1, ball);
            thrownBalls.splice(i, 1);
            continue;
        }
        
        // Check collision with player 2 (if ball was thrown by player 1)
        if (ball.owner === 1 && !player2.isInvincible && !player2.isInvisible && isColliding(player2, ball)) {
            // Create a hit effect
            createBallEffect(ball.x, ball.y, ball.color, 'hit');
            
            // Apply knockback and remove the ball
            applyKnockback(player2, ball);
            thrownBalls.splice(i, 1);
            continue;
        }
    }
}

// Update visual effects for balls
function updateBallEffects() {
    for (let i = ballEffects.length - 1; i >= 0; i--) {
        const effect = ballEffects[i];
        
        // Update lifetime
        effect.lifeTime++;
        
        // Update properties based on effect type
        switch (effect.type) {
            case 'collect':
                effect.radius += 2;
                effect.alpha = 1 - (effect.lifeTime / effect.maxLifeTime);
                break;
                
            case 'impact':
                effect.radius += 3;
                effect.alpha = 1 - (effect.lifeTime / effect.maxLifeTime);
                break;
                
            case 'hit':
                effect.radius += 4;
                effect.alpha = 1 - (effect.lifeTime / effect.maxLifeTime);
                break;
                
            case 'spawn':
                effect.radius += 1;
                effect.alpha = 1 - (effect.lifeTime / effect.maxLifeTime);
                break;
                
            case 'invisibility':
                effect.radius += 2.5;
                effect.alpha = 1 - (effect.lifeTime / effect.maxLifeTime);
                break;
        }
        
        // Remove effect when lifetime is over
        if (effect.lifeTime >= effect.maxLifeTime) {
            ballEffects.splice(i, 1);
        }
    }
}

// Reset balls to their initial state
function resetBalls() {
    // Clear thrown balls
    thrownBalls.length = 0;
    
    // Clear effects
    ballEffects.length = 0;
    
    // Reset collectible balls
    balls.forEach(ball => {
        ball.active = true;
        ball.x = Math.random() * (GAME_WIDTH - BALL_SIZE * 2) + BALL_SIZE;
        ball.y = Math.random() * (GAME_HEIGHT - BALL_SIZE * 2) + BALL_SIZE;
        ball.scale = 1;
        ball.spawnAnimation = 0;
    });
    
    // Reset invisibility powerup
    invisibilityPowerup.active = false;
    invisibilityPowerup.nextSpawnTime = Date.now() + getRandomSpawnInterval();
}