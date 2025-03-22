// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;

// Game state object
const gameState = {
    running: true,
    lastTime: 0
};

// Initialize the game
function init() {
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

// Main game loop
function gameLoop(timestamp) {
    // Calculate delta time (time since last frame)
    const deltaTime = timestamp - (gameState.lastTime || timestamp);
    gameState.lastTime = timestamp;
    
    // Clear the canvas
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // Update game logic
    update(deltaTime);
    
    // Render game objects
    render();
    
    // Continue the game loop if game is running
    if (gameState.running) {
        requestAnimationFrame(gameLoop);
    }
}

// Update game logic
function update(deltaTime) {
    // In Phase 1, we're just setting up the structure
    // Game logic will be added in later phases
}

// Render game objects
function render() {
    // Draw game title
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('BallBrawl', GAME_WIDTH / 2, GAME_HEIGHT / 2);
    
    // Draw instructions
    ctx.font = '16px Arial';
    ctx.fillText('Phase 1: Canvas Setup', GAME_WIDTH / 2, GAME_HEIGHT / 2 + 40);
}

// Initialize the game when the page loads
window.addEventListener('load', init);