// Player-related code

// Create player 1
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
    health: MAX_HEALTH, // player health
    isKnockedBack: false, // whether player is currently knocked back
    knockbackTime: 0, // time remaining in knockback
    knockbackVelocityX: 0, // knockback velocity X
    knockbackVelocityY: 0, // knockback velocity Y
    isInvincible: false, // whether player is currently invincible
    invincibleEndTime: 0, // when invincibility ends
    isInvisible: false, // whether player is invisible
    invisibleEndTime: 0, // when invisibility ends
    collectAnimation: 0, // frames of collect animation
    throwAnimation: 0, // frames of throw animation
    lineOfSight: true, // whether player has line of sight to opponent
    // These go in both player1 and player2 definitions
    // Physics properties for momentum
    velocityX: 0,
    velocityY: 0,
    acceleration: PLAYER_ACCELERATION,
    friction: PLAYER_FRICTION,
    maxSpeed: PLAYER_SPEED,

    // Dash properties
    isDashing: false,
    dashDirection: { x: 0, y: 0 },
    dashEndTime: 0,
    lastDashTime: 0,

    // Trail for movement
    trail: [],
    trailUpdateTimer: 0,

    // Visual effect properties
    lastParticleTime: 0,
    visualEffects: {
        glow: false,
        glowColor: 'white',
        glowIntensity: 0,
        glowMaxIntensity: 1.0,
        pulseSize: 0,
        pulseDirection: 0.1
    }
};

// Create player 2
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
    health: MAX_HEALTH, // player health
    isKnockedBack: false, // whether player is currently knocked back
    knockbackTime: 0, // time remaining in knockback
    knockbackVelocityX: 0, // knockback velocity X
    knockbackVelocityY: 0, // knockback velocity Y
    isInvincible: false, // whether player is currently invincible
    invincibleEndTime: 0, // when invincibility ends
    isInvisible: false, // whether player is invisible
    invisibleEndTime: 0, // when invisibility ends
    collectAnimation: 0, // frames of collect animation
    throwAnimation: 0, // frames of throw animation
    lineOfSight: true, // whether player has line of sight to opponent
    // These go in both player1 and player2 definitions
// Physics properties for momentum
    velocityX: 0,
    velocityY: 0,
    acceleration: PLAYER_ACCELERATION,
    friction: PLAYER_FRICTION,
    maxSpeed: PLAYER_SPEED,

    // Dash properties
    isDashing: false,
    dashDirection: { x: 0, y: 0 },
    dashEndTime: 0,
    lastDashTime: 0,

    // Trail for movement
    trail: [],
    trailUpdateTimer: 0,

    // Visual effect properties
    lastParticleTime: 0,
    visualEffects: {
        glow: false,
        glowColor: 'white',
        glowIntensity: 0,
        glowMaxIntensity: 1.0,
        pulseSize: 0,
        pulseDirection: 0.1
    }
};

// Update player position based on movement flags and momentum
function updatePlayerPosition(player, deltaTime) {
    const currentTime = Date.now();
    
    // Update trail
    player.trailUpdateTimer += deltaTime;
    if (player.trailUpdateTimer > 0.05) { // Update every 50ms
        player.trailUpdateTimer = 0;
        
        // Only add position to trail if moving significantly
        const isMoving = Math.abs(player.velocityX) > 20 || Math.abs(player.velocityY) > 20;
        
        if (isMoving || player.isDashing) {
            // Add current position to trail
            player.trail.unshift({
                x: player.x,
                y: player.y,
                alpha: player.isDashing ? 0.7 : 0.4,
                width: player.isDashing ? 3 : 2
            });
            
            // Limit trail length
            if (player.trail.length > TRAIL_LENGTH) {
                player.trail.pop();
            }
        } else if (player.trail.length > 0) {
            // Fade out trail when not moving
            for (const point of player.trail) {
                point.alpha *= 0.8;
            }
            
            // Remove fully faded points
            player.trail = player.trail.filter(point => point.alpha > 0.05);
        }
    }
    
    // Handle dash
    if (player.isDashing) {
        // Check if dash should end
        if (currentTime >= player.dashEndTime) {
            player.isDashing = false;
        } else {
            // Apply dash movement
            const dashSpeed = player.maxSpeed * DASH_SPEED;
            player.x += player.dashDirection.x * dashSpeed * deltaTime;
            player.y += player.dashDirection.y * dashSpeed * deltaTime;
            
            // Create occasional dash particles
            if (Math.random() > 0.7) {
                createParticleEffect(player.x, player.y, player.color, 'dash', 2);
            }
            
            // Skip regular movement while dashing
            return;
        }
    }
    
    // If player is knocked back, handle separately
    if (player.isKnockedBack) {
        // Update knockback physics
        player.x += player.knockbackVelocityX * deltaTime;
        player.y += player.knockbackVelocityY * deltaTime;
        
        // Reduce knockback time
        player.knockbackTime -= deltaTime;
        
        // End knockback if time is up
        if (player.knockbackTime <= 0) {
            player.isKnockedBack = false;
            
            // Reset velocities when knockback ends
            player.velocityX = 0;
            player.velocityY = 0;
        }
        return;
    }
    
    // If player is aiming, don't apply movement
    if (player.aiming) return;
    
    // Calculate acceleration based on input
    let accelerationX = 0;
    let accelerationY = 0;
    
    if (player.moveUp) accelerationY = -player.acceleration;
    if (player.moveDown) accelerationY = player.acceleration;
    if (player.moveLeft) accelerationX = -player.acceleration;
    if (player.moveRight) accelerationX = player.acceleration;
    
    // Apply acceleration to velocity
    player.velocityX += accelerationX * deltaTime;
    player.velocityY += accelerationY * deltaTime;
    
    // If no movement input, apply friction to slow down
    if (!player.moveUp && !player.moveDown && !player.moveLeft && !player.moveRight) {
        player.velocityX *= player.friction;
        player.velocityY *= player.friction;
        
        // Stop completely if velocity is very small
        if (Math.abs(player.velocityX) < 0.1) player.velocityX = 0;
        if (Math.abs(player.velocityY) < 0.1) player.velocityY = 0;
    }
    
    // Apply speed limit
    const speed = Math.sqrt(player.velocityX * player.velocityX + player.velocityY * player.velocityY);
    if (speed > player.maxSpeed) {
        const ratio = player.maxSpeed / speed;
        player.velocityX *= ratio;
        player.velocityY *= ratio;
    }
    
    // Calculate new position based on velocity
    let newX = player.x + player.velocityX * deltaTime;
    let newY = player.y + player.velocityY * deltaTime;
    
    // Apply boundary constraints
    newX = Math.max(player.width / 2, Math.min(GAME_WIDTH - player.width / 2, newX));
    newY = Math.max(player.height / 2, Math.min(GAME_HEIGHT - player.height / 2, newY));
    
    // Check for obstacle collisions
    let canMoveX = true;
    let canMoveY = true;
    
    for (const obstacle of obstacles) {
        // Check if moving in X direction would cause a collision
        const xCollision = rectRectCollision(
            {x: newX - player.width / 2, y: player.y - player.height / 2, width: player.width, height: player.height},
            obstacle
        );
        
        // Check if moving in Y direction would cause a collision
        const yCollision = rectRectCollision(
            {x: player.x - player.width / 2, y: newY - player.height / 2, width: player.width, height: player.height},
            obstacle
        );
        
        if (xCollision) {
            canMoveX = false;
            // Bounce off obstacles with reduced velocity
            player.velocityX = -player.velocityX * 0.3;
        }
        
        if (yCollision) {
            canMoveY = false;
            // Bounce off obstacles with reduced velocity
            player.velocityY = -player.velocityY * 0.3;
        }
    }
    
    // Apply movement based on collision checks
    if (canMoveX) player.x = newX;
    if (canMoveY) player.y = newY;
    
    // Attract nearby balls when close for better pickup experience
    for (const ball of balls) {
        if (!ball.active) continue;
        
        const dx = player.x - ball.x;
        const dy = player.y - ball.y;
        const distSquared = dx * dx + dy * dy;
        
        if (distSquared < PICKUP_ATTRACTION_RANGE * PICKUP_ATTRACTION_RANGE) {
            // Calculate attraction strength (stronger when closer)
            const dist = Math.sqrt(distSquared);
            const strength = Math.max(0, 1 - dist / PICKUP_ATTRACTION_RANGE) * 0.1;
            
            // Move ball slightly toward player for easier pickup
            ball.x += dx * strength;
            ball.y += dy * strength;
        }
    }
}

// Auto-aim at the opponent
function updateAimingAngles() {
    // If player 1 is aiming, auto-aim at player 2
    if (player1.aiming) {
        // Don't target invisible players
        if (!player2.isInvisible) {
            // Calculate angle from player 1 to player 2
            const dx = player2.x - player1.x;
            const dy = player2.y - player1.y;
            player1.aimAngle = Math.atan2(dy, dx);
            
            // Check for obstacles in the line of sight
            const lineOfSight = hasLineOfSight(player1, player2);
            
            // If line of sight is blocked, make aiming indicator look different
            // This is a visual cue only - you can still throw, but might hit an obstacle
            player1.lineOfSight = lineOfSight;
        }
    }
    
    // If player 2 is aiming, auto-aim at player 1
    if (player2.aiming) {
        // Don't target invisible players
        if (!player1.isInvisible) {
            // Calculate angle from player 2 to player 1
            const dx = player1.x - player2.x;
            const dy = player1.y - player2.y;
            player2.aimAngle = Math.atan2(dy, dx);
            
            // Check for obstacles in the line of sight
            const lineOfSight = hasLineOfSight(player2, player1);
            
            // If line of sight is blocked, make aiming indicator look different
            player2.lineOfSight = lineOfSight;
        }
    }
}

// Check if there's a clear line of sight between two players
function hasLineOfSight(player1, player2) {
    // If the target is invisible, there's no line of sight
    if ((player1 === window.player1 && player2.isInvisible) || 
        (player1 === window.player2 && player1.isInvisible)) {
        return false;
    }
    
    // Perform ray casting from player1 to player2
    const dx = player2.x - player1.x;
    const dy = player2.y - player1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Set a small step size for ray casting
    const stepSize = 10;
    const steps = Math.ceil(distance / stepSize);
    
    // Check points along the line
    for (let i = 1; i < steps; i++) {
        const ratio = i / steps;
        const checkX = player1.x + dx * ratio;
        const checkY = player1.y + dy * ratio;
        
        // Check if this point collides with any obstacle
        for (const obstacle of obstacles) {
            if (pointRectCollision({x: checkX, y: checkY}, obstacle)) {
                return false; // Line of sight blocked
            }
        }
    }
    
    return true; // Clear line of sight
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
    
    // End invisibility if player is hit
    if (player.isInvisible) {
        player.isInvisible = false;
    }
    
    // Reduce health
    player.health--;
    
    // Trigger screen shake effect - intensity based on remaining health
    const shakeIntensity = 10 - (player.health * 2); // More intense at lower health
    triggerScreenShake(shakeIntensity, 300); // 300ms of shake
    
    // Add screen flash effect
    const flashColor = player === player1 ? 'rgba(255,0,0,0.2)' : 'rgba(0,0,255,0.2)';
    addScreenFlash(flashColor, 200); // Flash for 200ms
    
    // Add hit stop effect (brief pause on impact)
    setTimeScale(0.1, 100); // Slow to 10% for 100ms
    
    // Check if player is defeated
    if (player.health <= 0) {
        // Extra intense shake on defeat
        triggerScreenShake(15, 500);
        
        // End the round with the other player as winner
        endRound(player === player1 ? 2 : 1);
    }
}

// Reset players to their initial state
function resetPlayers() {
    // Reset player 1
    player1.x = 200;
    player1.y = 300;
    player1.inventory = 0;
    player1.health = MAX_HEALTH;
    player1.isKnockedBack = false;
    player1.isInvincible = false;
    player1.isInvisible = false;
    player1.collectAnimation = 0;
    player1.throwAnimation = 0;
    player1.aiming = false;
    player1.lineOfSight = true;
    
    // Reset player 2
    player2.x = 600;
    player2.y = 300;
    player2.inventory = 0;
    player2.health = MAX_HEALTH;
    player2.isKnockedBack = false;
    player2.isInvincible = false;
    player2.isInvisible = false;
    player2.collectAnimation = 0;
    player2.throwAnimation = 0;
    player2.aiming = false;
    player2.lineOfSight = true;
}