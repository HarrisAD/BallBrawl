// Obstacle-related code

// Array to store obstacles
const obstacles = [];

// Create obstacles
function createObstacles() {
    obstacles.length = 0; // Clear existing obstacles
    for (let i = 0; i < OBSTACLE_COUNT; i++) {
        createObstacle();
    }
}

// Create a single obstacle
function createObstacle() {
    // Define obstacle properties
    const minSize = 40;
    const maxSize = 80;
    const width = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    const height = Math.floor(Math.random() * (maxSize - minSize + 1)) + minSize;
    
    // Set a minimum padding from the edges
    const padding = 50;
    
    // Set a minimum distance from players
    const minPlayerDistance = 100;
    
    // Generate a random position
    let x, y;
    let validPosition = false;
    
    // Keep trying until we find a valid position
    const maxAttempts = 100;
    let attempts = 0;
    
    while (!validPosition && attempts < maxAttempts) {
        attempts++;
        
        // Generate a random position within the canvas (with padding)
        x = Math.random() * (GAME_WIDTH - width - 2 * padding) + padding;
        y = Math.random() * (GAME_HEIGHT - height - 2 * padding) + padding;
        
        // Check distance from players
        const distToPlayer1 = Math.sqrt(Math.pow(x - player1.x, 2) + Math.pow(y - player1.y, 2));
        const distToPlayer2 = Math.sqrt(Math.pow(x - player2.x, 2) + Math.pow(y - player2.y, 2));
        
        // Check distance from other obstacles
        let tooCloseToObstacle = false;
        for (const obstacle of obstacles) {
            const distToObstacle = Math.sqrt(Math.pow(x - obstacle.x, 2) + Math.pow(y - obstacle.y, 2));
            if (distToObstacle < width + obstacle.width) {
                tooCloseToObstacle = true;
                break;
            }
        }
        
        // Position is valid if it's far enough from players and other obstacles
        if (distToPlayer1 > minPlayerDistance && distToPlayer2 > minPlayerDistance && !tooCloseToObstacle) {
            validPosition = true;
        }
    }
    
    // If we couldn't find a valid position, use the last attempted one
    if (!validPosition) {
        console.warn('Could not find an ideal obstacle position');
    }
    
    // Create the obstacle
    const obstacle = {
        x: x,
        y: y,
        width: width,
        height: height,
        color: '#8B4513' // Brown color for barrels
    };
    
    // Add the obstacle to the obstacles array
    obstacles.push(obstacle);
}