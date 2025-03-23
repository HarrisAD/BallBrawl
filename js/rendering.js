// Rendering-related code

// Render game objects
function render() {
    // Draw obstacles (first, so they're behind other objects)
    drawObstacles();
    
    // Draw balls (collectible)
    drawBalls();
    
    // Draw thrown balls
    drawThrownBalls();
    
    // Draw players
    drawPlayer(player1);
    drawPlayer(player2);
    
    // Draw aiming lines if players are aiming (only in playing state)
    if (gameState.status === GAME_STATE.PLAYING) {
        if (player1.aiming) drawAimLine(player1);
        if (player2.aiming) drawAimLine(player2);
    }
    
    // Draw game info
    drawGameInfo();
    
    // Draw health bars
    drawHealthBars();
    
    // Draw score board
    drawScoreboard();
    
    // Draw round timer
    drawRoundTimer();
    
    // Draw state-specific overlays
    switch (gameState.status) {
        case GAME_STATE.START:
            drawStartScreen();
            break;
        case GAME_STATE.PAUSED:
            drawPauseScreen();
            break;
        case GAME_STATE.ROUND_OVER:
            drawRoundOverScreen();
            break;
        case GAME_STATE.MATCH_OVER:
            drawMatchOverScreen();
            break;
    }
}

// Draw obstacles
function drawObstacles() {
    for (const obstacle of obstacles) {
        // Create a gradient for barrel effect
        const gradient = ctx.createLinearGradient(
            obstacle.x, obstacle.y, 
            obstacle.x + obstacle.width, obstacle.y
        );
        gradient.addColorStop(0, '#8B4513'); // SaddleBrown
        gradient.addColorStop(0.5, '#A0522D'); // Sienna
        gradient.addColorStop(1, '#8B4513'); // SaddleBrown
        
        // Draw the barrel body
        ctx.fillStyle = gradient;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
        
        // Draw barrel rings (horizontal)
        const ringCount = 3;
        const ringHeight = obstacle.height / (ringCount + 1);
        
        ctx.strokeStyle = '#654321'; // DarkBrown
        ctx.lineWidth = 3;
        
        for (let i = 1; i <= ringCount; i++) {
            const y = obstacle.y + i * ringHeight;
            
            ctx.beginPath();
            ctx.moveTo(obstacle.x, y);
            ctx.lineTo(obstacle.x + obstacle.width, y);
            ctx.stroke();
        }
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
        // Draw trail first (so it's behind the ball)
        drawBallTrail(ball);
        
        // Draw the ball
        drawBall(ball);
    }
    
    // Draw ball effects
    drawBallEffects();
}

// Draw ball effects
function drawBallEffects() {
    for (const effect of ballEffects) {
        ctx.globalAlpha = effect.alpha;
        
        switch (effect.type) {
            case 'collect':
                // Expanding circle
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'impact':
                // Explosion effect
                const gradient = ctx.createRadialGradient(
                    effect.x, effect.y, 0,
                    effect.x, effect.y, effect.radius
                );
                gradient.addColorStop(0, effect.color);
                gradient.addColorStop(1, 'transparent');
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'hit':
                // Star-like explosion
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = 3;
                
                for (let i = 0; i < 8; i++) {
                    const angle = i * Math.PI / 4;
                    const innerRadius = effect.radius * 0.3;
                    const outerRadius = effect.radius;
                    
                    ctx.beginPath();
                    ctx.moveTo(
                        effect.x + innerRadius * Math.cos(angle),
                        effect.y + innerRadius * Math.sin(angle)
                    );
                    ctx.lineTo(
                        effect.x + outerRadius * Math.cos(angle),
                        effect.y + outerRadius * Math.sin(angle)
                    );
                    ctx.stroke();
                }
                break;
                
            case 'spawn':
                // Expanding pulsing circle
                ctx.strokeStyle = effect.color;
                ctx.lineWidth = Math.max(1, 3 * (1 - effect.lifeTime / effect.maxLifeTime));
                
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
        }
    }
    
    // Reset alpha
    ctx.globalAlpha = 1.0;
}

// Draw trail for a thrown ball
function drawBallTrail(ball) {
    if (!ball.trail || ball.trail.length === 0) return;
    
    for (let i = 0; i < ball.trail.length; i++) {
        const trailPoint = ball.trail[i];
        
        // Skip points with no alpha
        if (trailPoint.alpha <= 0) continue;
        
        // Calculate trail point size based on position in trail
        const trailSize = ball.radius * (i / ball.trail.length);
        
        // Draw trail point
        ctx.globalAlpha = trailPoint.alpha * 0.7;
        ctx.fillStyle = ball.color;
        ctx.beginPath();
        ctx.arc(trailPoint.x, trailPoint.y, trailSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Reset alpha
    ctx.globalAlpha = 1.0;
}

// Draw a single ball
function drawBall(ball) {
    // Save context for transformations
    ctx.save();
    
    // Apply scale transformation for spawn animation
    if (ball.scale !== undefined && ball.scale !== 1) {
        ctx.translate(ball.x, ball.y);
        ctx.scale(ball.scale, ball.scale);
        ctx.translate(-ball.x, -ball.y);
    }
    
    // Update ball animation properties if it's a collectible ball
    if (ball.pulseDirection !== undefined) {
        // Update pulse animation
        ball.pulseSize += ball.pulseDirection;
        if (ball.pulseSize > 3) ball.pulseDirection = -0.2;
        if (ball.pulseSize < 0) ball.pulseDirection = 0.2;
        
        // Update rotation
        ball.rotation += ball.rotationSpeed;
    }
    
    // Draw glow effect for collectible balls
    if (ball.glowIntensity !== undefined) {
        const gradientSize = ball.radius * 2;
        const gradient = ctx.createRadialGradient(
            ball.x, ball.y, ball.radius * 0.5,
            ball.x, ball.y, ball.radius * 2.5
        );
        gradient.addColorStop(0, ball.color);
        gradient.addColorStop(0.5, `rgba(${getColorRGB(ball.color)}, 0.5)`); // 50% opacity
        gradient.addColorStop(1, `rgba(${getColorRGB(ball.color)}, 0)`); // 0% opacity
        
        ctx.globalAlpha = 0.3 * ball.glowIntensity;
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }
    
    // Draw the main ball
    const displayRadius = ball.pulseSize !== undefined ? 
        ball.radius + ball.pulseSize : ball.radius;
    
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, displayRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Add a shine effect
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.beginPath();
    ctx.arc(ball.x - ball.radius/3, ball.y - ball.radius/3, ball.radius/3, 0, Math.PI * 2);
    ctx.fill();
    
    // For collectible balls, add a pattern
    if (ball.rotation !== undefined) {
        ctx.save();
        ctx.translate(ball.x, ball.y);
        ctx.rotate(ball.rotation);
        
        // Draw a simple pattern on top of the ball
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, ball.radius * 0.6, 0, Math.PI, true);
        ctx.stroke();
        
        ctx.restore();
    }
    
    // Restore original context
    ctx.restore();
}

// Draw aim line for a player
function drawAimLine(player) {
    // Check if aim line would hit an obstacle
    let endX = player.x;
    let endY = player.y;
    let hitObstacle = false;
    
    // Simulate the path of the aim line to check for obstacles
    for (let distance = 0; distance <= AIM_LINE_LENGTH; distance += 5) {
        const checkX = player.x + Math.cos(player.aimAngle) * distance;
        const checkY = player.y + Math.sin(player.aimAngle) * distance;
        
        for (const obstacle of obstacles) {
            if (pointRectCollision({x: checkX, y: checkY}, obstacle)) {
                endX = checkX;
                endY = checkY;
                hitObstacle = true;
                break;
            }
        }
        
        if (hitObstacle) {
            break;
        } else {
            endX = checkX;
            endY = checkY;
        }
    }
    
    if (!hitObstacle) {
        endX = player.x + Math.cos(player.aimAngle) * AIM_LINE_LENGTH;
        endY = player.y + Math.sin(player.aimAngle) * AIM_LINE_LENGTH;
    }
    
    // Draw the aim line
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x, player.y);
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
    // Create shadow effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(
        player.x, 
        player.y + player.height / 2 + 3, 
        player.width / 2, 
        player.width / 4, 
        0, 0, Math.PI * 2
    );
    ctx.fill();
    
    // Apply knock back visual effect
    let playerScale = 1.0;
    let playerRotation = 0;
    
    if (player.isKnockedBack) {
        // Calculate scale based on knockback time
        const knockbackProgress = player.knockbackTime / KNOCKBACK_DURATION;
        playerScale = 1.0 + Math.sin(knockbackProgress * Math.PI) * 0.2;
        
        // Add slight rotation based on knockback direction
        playerRotation = Math.atan2(player.knockbackVelocityY, player.knockbackVelocityX) 
            + Math.PI / 2; // Adjust so player rotates properly
    }
    
    // Save context for transformations
    ctx.save();
    
    // Apply rotation and scale
    ctx.translate(player.x, player.y);
    ctx.rotate(playerRotation);
    ctx.scale(playerScale, playerScale);
    
    // Set player color (flash white if invincible)
    if (player.isInvincible && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.fillStyle = 'white';
    } else {
        ctx.fillStyle = player.color;
    }
    
    // Draw player rectangle
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    
    // Draw player features based on direction
    // We'll add simple eyes to indicate player facing direction
    ctx.fillStyle = 'white';
    
    // Calculate eye direction based on aim angle
    const eyeOffsetX = Math.cos(player.aimAngle) * 5;
    const eyeOffsetY = Math.sin(player.aimAngle) * 5;
    
    // Left eye
    ctx.beginPath();
    ctx.arc(-player.width / 4 + eyeOffsetX, -player.height / 4 + eyeOffsetY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Right eye
    ctx.beginPath();
    ctx.arc(player.width / 4 + eyeOffsetX, -player.height / 4 + eyeOffsetY, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw collection animation if active
    if (player.collectAnimation > 0) {
        // Decrease animation counter
        player.collectAnimation--;
        
        // Draw collection particles
        const particleCount = 5;
        const animationProgress = 1 - player.collectAnimation / 15;
        
        ctx.fillStyle = player.color;
        
        for (let i = 0; i < particleCount; i++) {
            const angle = i * (Math.PI * 2) / particleCount;
            const distance = animationProgress * player.width;
            
            const particleX = Math.cos(angle) * distance;
            const particleY = Math.sin(angle) * distance;
            const particleSize = (1 - animationProgress) * 4;
            
            ctx.globalAlpha = 1 - animationProgress;
            ctx.beginPath();
            ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }
    
    // Draw throw animation if active
    if (player.throwAnimation > 0) {
        // Decrease animation counter
        player.throwAnimation--;
        
        // Calculate throw direction
        const throwX = Math.cos(player.aimAngle) * player.width;
        const throwY = Math.sin(player.aimAngle) * player.width;
        
        // Draw throw line
        ctx.strokeStyle = player.color;
        ctx.lineWidth = (player.throwAnimation / 10) * 3; // Line gets thinner as animation progresses
        ctx.globalAlpha = player.throwAnimation / 10;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(throwX, throwY);
        ctx.stroke();
        
        // Reset alpha
        ctx.globalAlpha = 1.0;
    }
    
    // Restore original context
    ctx.restore();
    
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
    const barWidth = 30;
    const barHeight = 100;
    const padding = 10;
    
    // Draw player 1 health bar (left side)
    drawHealthBar(padding, GAME_HEIGHT / 2 - barHeight / 2, barWidth, barHeight, player1.health, MAX_HEALTH, 'red', 'P1');
    
    // Draw player 2 health bar (right side)
    drawHealthBar(GAME_WIDTH - padding - barWidth, GAME_HEIGHT / 2 - barHeight / 2, barWidth, barHeight, player2.health, MAX_HEALTH, 'blue', 'P2');
}

// Draw a health bar
function drawHealthBar(x, y, width, height, currentHealth, maxHealth, color, label) {
    // Draw background container
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - 5, y - 25, width + 10, height + 40);
    
    // Draw player label
    ctx.fillStyle = color;
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + width / 2, y - 8);
    
    // Draw background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, width, height);
    
    // Calculate health height (vertical health bar)
    const healthHeight = (currentHealth / maxHealth) * height;
    const healthY = y + height - healthHeight;
    
    // Draw health (from bottom to top)
    ctx.fillStyle = color;
    ctx.fillRect(x, healthY, width, healthHeight);
    
    // Draw border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, width, height);
    
    // Draw health points as heart symbols
    for (let i = 0; i < maxHealth; i++) {
        const heartY = y + height - (i + 0.5) * (height / maxHealth);
        
        if (i < currentHealth) {
            // Filled heart for remaining health
            drawHeart(x + width / 2, heartY, 8, color);
        } else {
            // Empty heart for lost health
            drawHeartOutline(x + width / 2, heartY, 8, color);
        }
    }
}

// Draw a heart symbol
function drawHeart(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(
        x, y - size / 2,
        x - size, y - size / 2,
        x - size, y + size / 4
    );
    ctx.bezierCurveTo(
        x - size, y + size,
        x, y + size * 1.5,
        x, y + size * 1.5
    );
    ctx.bezierCurveTo(
        x, y + size * 1.5,
        x + size, y + size,
        x + size, y + size / 4
    );
    ctx.bezierCurveTo(
        x + size, y - size / 2,
        x, y - size / 2,
        x, y + size / 4
    );
    ctx.fill();
}

// Draw a heart outline
function drawHeartOutline(x, y, size, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);
    ctx.bezierCurveTo(
        x, y - size / 2,
        x - size, y - size / 2,
        x - size, y + size / 4
    );
    ctx.bezierCurveTo(
        x - size, y + size,
        x, y + size * 1.5,
        x, y + size * 1.5
    );
    ctx.bezierCurveTo(
        x, y + size * 1.5,
        x + size, y + size,
        x + size, y + size / 4
    );
    ctx.bezierCurveTo(
        x + size, y - size / 2,
        x, y - size / 2,
        x, y + size / 4
    );
    ctx.stroke();
}

// Draw scoreboard
function drawScoreboard() {
    const scoreboardWidth = 160;
    const scoreboardHeight = 40;
    const x = 10; // Move to top-left corner
    const y = 10;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, scoreboardWidth, scoreboardHeight);
    
    // Draw border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, scoreboardWidth, scoreboardHeight);
    
    // Draw scores
    ctx.font = '20px Arial';
    ctx.textAlign = 'center';
    
    // Player 1 score
    ctx.fillStyle = 'red';
    ctx.fillText(gameState.scores.player1.toString(), x + 40, y + 28);
    
    // Vs text
    ctx.fillStyle = 'white';
    ctx.fillText('-', x + 80, y + 28);
    
    // Player 2 score
    ctx.fillStyle = 'blue';
    ctx.fillText(gameState.scores.player2.toString(), x + 120, y + 28);
    
    // Draw round number
    ctx.fillStyle = 'white';
    ctx.font = '14px Arial';
    ctx.textAlign = 'left';
    ctx.fillText(`Round ${gameState.roundNumber}`, x + 10, y + 15);
}

// Draw round timer
function drawRoundTimer() {
    // Only show timer during active gameplay
    if (gameState.status !== GAME_STATE.PLAYING && gameState.status !== GAME_STATE.PAUSED) {
        return;
    }
    
    const timerWidth = 80;
    const timerHeight = 30;
    const x = GAME_WIDTH - timerWidth - 10; // Move to top-right corner
    const y = 10;
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x, y, timerWidth, timerHeight);
    
    // Draw border
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, timerWidth, timerHeight);
    
    // Format time as MM:SS
    const minutes = Math.floor(Math.max(0, gameState.roundTimer) / 60);
    const seconds = Math.floor(Math.max(0, gameState.roundTimer) % 60);
    const timeStr = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    
    // Draw time
    ctx.fillStyle = gameState.roundTimer <= 10 ? 'red' : 'white'; // Red when <= 10 seconds
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(timeStr, x + timerWidth / 2, y + 22);
}

// Draw start screen
function drawStartScreen() {
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw title
    ctx.fillStyle = 'white';
    ctx.font = '64px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('BALLBRAWL', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60);
    
    // Draw subtitle
    ctx.font = '24px Arial';
    ctx.fillText('First to win ' + MATCH_SCORE_TO_WIN + ' rounds wins the match!', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    
    // Draw start instructions
    ctx.font = '36px Arial';
    ctx.fillText('Press ENTER to start', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
}

// Draw pause screen
function drawPauseScreen() {
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw pause text
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSED', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);
    
    // Draw resume instructions
    ctx.font = '24px Arial';
    ctx.fillText('Press P to resume', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
}

// Draw round over screen
function drawRoundOverScreen() {
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw round over text
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('ROUND OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60);
    
    // Draw round winner text
    ctx.font = '36px Arial';
    if (gameState.roundWinner === 0) {
        ctx.fillStyle = 'yellow';
        ctx.fillText('It\'s a tie!', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    } else {
        const winnerColor = gameState.roundWinner === 1 ? 'red' : 'blue';
        ctx.fillStyle = winnerColor;
        ctx.fillText(`Player ${gameState.roundWinner} wins the round!`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    }
    
    // Draw next round instructions
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText('Press ENTER to continue', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
}

// Draw match over screen
function drawMatchOverScreen() {
    // Draw semi-transparent overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Draw match over text
    ctx.fillStyle = 'white';
    ctx.font = '48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('MATCH OVER', GAME_WIDTH / 2, GAME_HEIGHT / 2 - 60);
    
    // Draw match winner text
    ctx.font = '36px Arial';
    const winnerColor = gameState.matchWinner === 1 ? 'red' : 'blue';
    ctx.fillStyle = winnerColor;
    ctx.fillText(`Player ${gameState.matchWinner} wins the match!`, GAME_WIDTH / 2, GAME_HEIGHT / 2);
    
    // Draw final score
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.fillText(`Final Score: ${gameState.scores.player1} - ${gameState.scores.player2}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
    
    // Draw restart instructions
    ctx.fillText('Press R to play again', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
}

// Draw game information
function drawGameInfo() {
    // Draw game title (always visible)
    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('BallBrawl', GAME_WIDTH / 2, 20);
    
    // Only show full game info in the start screen or game over screens
    if (gameState.status === GAME_STATE.START || 
        gameState.status === GAME_STATE.ROUND_OVER || 
        gameState.status === GAME_STATE.MATCH_OVER) {
        
        // Draw controls info in a more visible box at the bottom
        const controlsWidth = 600;
        const controlsHeight = 80;
        const x = GAME_WIDTH / 2 - controlsWidth / 2;
        const y = GAME_HEIGHT - controlsHeight - 10;
        
        // Draw semi-transparent background for controls
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(x, y, controlsWidth, controlsHeight);
        
        // Draw border
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y,controlsWidth, controlsHeight);
        
        // Draw controls text
        ctx.textAlign = 'center';
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText('Controls', x + controlsWidth / 2, y + 20);
        
        ctx.font = '14px Arial';
        ctx.fillText('Player 1: WASD to move, E to collect, Q to aim/throw', x + controlsWidth / 2, y + 40);
        ctx.fillText('Player 2: Arrow keys to move, / to collect, . to aim/throw', x + controlsWidth / 2, y + 60);
        ctx.fillText('Game: ENTER to start/continue, P to pause, R to restart', x + controlsWidth / 2, y + 80);
    }
    
    // Draw state indicator (small text in upper corner)
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'right';
    
    let stateText = '';
    switch (gameState.status) {
        case GAME_STATE.START:
            stateText = 'PRESS ENTER TO START';
            break;
        case GAME_STATE.PLAYING:
            stateText = 'GAME IN PROGRESS';
            break;
        case GAME_STATE.PAUSED:
            stateText = 'GAME PAUSED';
            break;
        case GAME_STATE.ROUND_OVER:
            stateText = 'ROUND OVER';
            break;
        case GAME_STATE.MATCH_OVER:
            stateText = 'MATCH OVER';
            break;
    }
    
    ctx.fillText(stateText, GAME_WIDTH - 10, 40);
    
    // Draw phase indicator
    ctx.font = '12px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'right';
    ctx.fillText(`Phase 9: UI Elements`, GAME_WIDTH - 10, 60);
}