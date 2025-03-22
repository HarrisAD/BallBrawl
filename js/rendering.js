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
    ctx.fillText(`Phase 7: ${gameState.phase}`, GAME_WIDTH / 2, 60);
    
    // Draw controls info (smaller text at the bottom)
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    ctx.fillText('Player 1: WASD to move, E to collect, Q to aim/throw', GAME_WIDTH / 2, GAME_HEIGHT - 25);
    ctx.fillText('Player 2: Arrow keys to move, / to collect, . to aim/throw', GAME_WIDTH / 2, GAME_HEIGHT - 10);
}