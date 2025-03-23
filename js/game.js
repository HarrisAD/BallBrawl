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

// Screen shake effect variables
const screenShake = {
    active: false,
    intensity: 0,
    duration: 0,
    startTime: 0,
    offsetX: 0,
    offsetY: 0
};

// Camera smoothing
const camera = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    smoothSpeed: 0.1, // Adjustment speed (0-1)
    shake: {
        active: false,
        intensity: 0,
        duration: 0,
        startTime: 0,
        offsetX: 0,
        offsetY: 0
    }
};

// Time scaling for hit-stop effect
let timeScale = 1.0;
let timeScaleResetTime = 0;

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
    
    // Apply time scaling to delta time
    const currentTimeScale = updateTimeScale();
    deltaTime = deltaTime * currentTimeScale;
    
    // Convert to seconds for easier calculation
    const deltaSeconds = deltaTime / 1000;
    
    // Rest of the function remains the same
    // ...
}

// Trigger screen shake effect
function triggerScreenShake(intensity, duration) {
    camera.shake.active = true;
    camera.shake.intensity = intensity;
    camera.shake.duration = duration;
    camera.shake.startTime = Date.now();
}

// Update screen shake effect
function updateScreenShake() {
    if (!screenShake.active) return;
    
    const currentTime = Date.now();
    const elapsedTime = currentTime - screenShake.startTime;
    
    // Check if shake duration has elapsed
    if (elapsedTime >= screenShake.duration) {
        screenShake.active = false;
        screenShake.offsetX = 0;
        screenShake.offsetY = 0;
        return;
    }
    
    // Calculate remaining intensity based on elapsed time
    const remainingIntensity = screenShake.intensity * (1 - elapsedTime / screenShake.duration);
    
    // Update shake offsets with random values
    screenShake.offsetX = (Math.random() * 2 - 1) * remainingIntensity;
    screenShake.offsetY = (Math.random() * 2 - 1) * remainingIntensity;
}

// Update camera position
function updateCamera(deltaTime) {
    // Camera follows the centroid of both players
    camera.targetX = (player1.x + player2.x) / 2;
    camera.targetY = (player1.y + player2.y) / 2;
    
    // Smooth camera movement
    camera.x += (camera.targetX - camera.x) * camera.smoothSpeed;
    camera.y += (camera.targetY - camera.y) * camera.smoothSpeed;
    
    // Update camera shake
    if (camera.shake.active) {
        const currentTime = Date.now();
        const elapsedTime = currentTime - camera.shake.startTime;
        
        // Check if shake duration has elapsed
        if (elapsedTime >= camera.shake.duration) {
            camera.shake.active = false;
            camera.shake.offsetX = 0;
            camera.shake.offsetY = 0;
            return;
        }
        
        // Calculate remaining intensity based on elapsed time
        const remainingIntensity = camera.shake.intensity * (1 - elapsedTime / camera.shake.duration);
        
        // Update shake offsets with random values
        camera.shake.offsetX = (Math.random() * 2 - 1) * remainingIntensity;
        camera.shake.offsetY = (Math.random() * 2 - 1) * remainingIntensity;
    }
}

// Set time scale for hit-stop effects
function setTimeScale(scale, duration) {
    timeScale = scale;
    timeScaleResetTime = Date.now() + duration;
}

// Update time scale
function updateTimeScale() {
    if (timeScale !== 1.0 && Date.now() >= timeScaleResetTime) {
        timeScale = 1.0;
    }
    return timeScale;
}

// Update game logic
function update(deltaTime) {
    // Update camera
    updateCamera(deltaTime);
    
    // Update screen shake effect
    updateScreenShake();
    
    // Update player 1 position
    updatePlayerPosition(player1, deltaTime);
    
    // Update player 2 position
    updatePlayerPosition(player2, deltaTime);
    
    // Update aiming angles (auto-aim at opponents)
    updateAimingAngles();
    
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