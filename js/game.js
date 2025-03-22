// Game-related code

// Game state object
const gameState = {
    status: GAME_STATE.START,
    lastTime: 0,
    phase: 'Game States',
    roundWinner: null,
    matchWinner: null,
    roundTimer: ROUND_TIME_LIMIT,
    scores: {
        player1: 0,
        player2: 0
    },
    roundNumber: 1,
    pauseStartTime: 0,
    timePaused: 0
};

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time (time since last frame)
    let deltaTime = 0;
    
    if (gameState.lastTime) {
        deltaTime = timestamp - gameState.lastTime;
        
        // If game was paused, don't count that time
        if (gameState.status === GAME_STATE.PAUSED) {
            gameState.timePaused += deltaTime;
            deltaTime = 0;
        }
    }
    
    gameState.lastTime = timestamp;
    
    // Convert to seconds for easier calculation
    const deltaSeconds = deltaTime / 1000;
    
    // Clear the canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Update game logic based on current state
    switch (gameState.status) {
        case GAME_STATE.PLAYING:
            updateRoundTimer(deltaSeconds);
            update(deltaSeconds);
            break;
            
        case GAME_STATE.PAUSED:
        case GAME_STATE.START:
        case GAME_STATE.ROUND_OVER:
        case GAME_STATE.MATCH_OVER:
            // No updates in these states
            break;
    }
    
    // Render game objects
    render();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
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

// Update the round timer
function updateRoundTimer(deltaTime) {
    // Decrement the timer
    gameState.roundTimer -= deltaTime;
    
    // If time runs out, end the round
    if (gameState.roundTimer <= 0) {
        endRound(determineRoundWinner());
    }
}

// Determine the winner of the round based on current health
function determineRoundWinner() {
    if (player1.health > player2.health) {
        return 1;
    } else if (player2.health > player1.health) {
        return 2;
    } else {
        // It's a tie, no winner
        return 0;
    }
}

// Start a new round
function startRound() {
    // Reset players
    resetPlayers();
    
    // Reset balls
    resetBalls();
    
    // Reset round timer
    gameState.roundTimer = ROUND_TIME_LIMIT;
    
    // Set the game state to playing
    gameState.status = GAME_STATE.PLAYING;
    
    // Clear the round winner
    gameState.roundWinner = null;
}

// End the current round
function endRound(winner) {
    // Set the game state to round over
    gameState.status = GAME_STATE.ROUND_OVER;
    
    // Set the round winner
    gameState.roundWinner = winner;
    
    // Update scores
    if (winner === 1) {
        gameState.scores.player1++;
    } else if (winner === 2) {
        gameState.scores.player2++;
    }
    
    // Check if the match is over
    if (gameState.scores.player1 >= MATCH_SCORE_TO_WIN) {
        endMatch(1);
    } else if (gameState.scores.player2 >= MATCH_SCORE_TO_WIN) {
        endMatch(2);
    }
    
    // Increment round number
    gameState.roundNumber++;
}

// End the match
function endMatch(winner) {
    gameState.status = GAME_STATE.MATCH_OVER;
    gameState.matchWinner = winner;
}

// Toggle pause state
function togglePause() {
    if (gameState.status === GAME_STATE.PLAYING) {
        gameState.status = GAME_STATE.PAUSED;
        gameState.pauseStartTime = Date.now();
    } else if (gameState.status === GAME_STATE.PAUSED) {
        gameState.status = GAME_STATE.PLAYING;
        gameState.timePaused += Date.now() - gameState.pauseStartTime;
    }
}

// Reset the entire game for a new match
function resetMatch() {
    // Reset players
    resetPlayers();
    
    // Reset balls
    resetBalls();
    
    // Reset game state
    gameState.roundWinner = null;
    gameState.matchWinner = null;
    gameState.roundTimer = ROUND_TIME_LIMIT;
    gameState.scores = {
        player1: 0,
        player2: 0
    };
    gameState.roundNumber = 1;
    gameState.timePaused = 0;
    
    // Set the game state to start
    gameState.status = GAME_STATE.START;
}

// Initialize the game
function initGame() {
    // Create obstacles
    createObstacles();
    
    // Create initial balls
    createBalls();
    
    // Reset match to initialize everything
    resetMatch();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}