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
    lineOfSight: true // whether player has line of sight to opponent
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
    lineOfSight: true // whether player has line of sight to opponent
};

// Update player position based on movement flags
function updatePlayerPosition(player, deltaTime) {
    let newX = player.x;
    let newY = player.y;
    
    if (player.isKnockedBack) {
        // Update knockback physics
        newX += player.knockbackVelocityX * deltaTime;
        newY += player.knockbackVelocityY * deltaTime;
        
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
        if (player.moveUp) newY -= moveDistance;
        if (player.moveDown) newY += moveDistance;
        if (player.moveLeft) newX -= moveDistance;
        if (player.moveRight) newX += moveDistance;
    }
    
    // Apply boundary constraints
    newX = Math.max(player.width / 2, Math.min(GAME_WIDTH - player.width / 2, newX));
    newY = Math.max(player.height / 2, Math.min(GAME_HEIGHT - player.height / 2, newY));
    
    // Check for obstacle collisions
    const playerRect = {
        x: newX - player.width / 2,
        y: newY - player.height / 2,
        width: player.width,
        height: player.height
    };
    
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
        
        if (xCollision) canMoveX = false;
        if (yCollision) canMoveY = false;
    }
    
    // Apply movement based on collision checks
    if (canMoveX) player.x = newX;
    if (canMoveY) player.y = newY;
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
    
    // Check if player is defeated
    if (player.health <= 0) {
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