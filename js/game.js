// Game-related code

// Game state object
const gameState = {
    running: true,
    lastTime: 0,
    phase: 'Obstacles',
    gameOver: false,
    winner: null
};

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

// Reset the game
function resetGame() {
    // Reset players
    resetPlayers();
    
    // Reset balls
    resetBalls();
    
    // Reset game state
    gameState.gameOver = false;
    gameState.winner = null;
}

// Initialize the game
function initGame() {
    // Create obstacles
    createObstacles();
    
    // Create initial balls
    createBalls();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}