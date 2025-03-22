// Controls-related code

// Set up keyboard controls
function setupControls() {
    // Add event listeners for keydown
    window.addEventListener('keydown', function(e) {
        // Player 1 controls (WASD)
        if (e.key === 'w') player1.moveUp = true;
        if (e.key === 's') player1.moveDown = true;
        if (e.key === 'a') player1.moveLeft = true;
        if (e.key === 'd') player1.moveRight = true;
        
        // Player 2 controls (Arrow keys)
        if (e.key === 'ArrowUp') player2.moveUp = true;
        if (e.key === 'ArrowDown') player2.moveDown = true;
        if (e.key === 'ArrowLeft') player2.moveLeft = true;
        if (e.key === 'ArrowRight') player2.moveRight = true;
        
        // Ball collection controls
        if (e.key === 'e') collectBall(player1);
        if (e.key === '/') collectBall(player2);
        
        // Aiming controls
        if (e.key === 'q') player1.aiming = true;
        if (e.key === '.') player2.aiming = true;
        
        // Restart game if game over
        if (e.key === 'r' && gameState.gameOver) {
            resetGame();
        }
    });
    
    // Add event listeners for keyup
    window.addEventListener('keyup', function(e) {
        // Player 1 controls (WASD)
        if (e.key === 'w') player1.moveUp = false;
        if (e.key === 's') player1.moveDown = false;
        if (e.key === 'a') player1.moveLeft = false;
        if (e.key === 'd') player1.moveRight = false;
        
        // Player 2 controls (Arrow keys)
        if (e.key === 'ArrowUp') player2.moveUp = false;
        if (e.key === 'ArrowDown') player2.moveDown = false;
        if (e.key === 'ArrowLeft') player2.moveLeft = false;
        if (e.key === 'ArrowRight') player2.moveRight = false;
        
        // Throwing controls
        if (e.key === 'q' && player1.aiming) {
            throwBall(player1);
            player1.aiming = false;
        }
        if (e.key === '.' && player2.aiming) {
            throwBall(player2);
            player2.aiming = false;
        }
    });
}