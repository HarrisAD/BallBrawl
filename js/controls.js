// Controls-related code

// Set up keyboard controls
function setupControls() {
    // Add event listeners for keydown
    window.addEventListener('keydown', function(e) {
        // Game state controls
        if (e.key === 'Enter') {
            // Start game or next round
            if (gameState.status === GAME_STATE.START || gameState.status === GAME_STATE.ROUND_OVER) {
                startRound();
            } else if (gameState.status === GAME_STATE.MATCH_OVER) {
                resetMatch();
            }
        }
        
        if (e.key === 'p' || e.key === 'P') {
            // Toggle pause
            if (gameState.status === GAME_STATE.PLAYING || gameState.status === GAME_STATE.PAUSED) {
                togglePause();
            }
        }
        
        if (e.key === 'r' || e.key === 'R') {
            // Reset match
            if (gameState.status === GAME_STATE.MATCH_OVER) {
                resetMatch();
            }
        }
        
        // Only process gameplay controls if the game is in playing state
        if (gameState.status !== GAME_STATE.PLAYING) return;
        
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
        
        // Aiming controls (now just toggles aiming mode)
        if (e.key === 'q') player1.aiming = true;
        if (e.key === '.') player2.aiming = true;
    });
    
    // Add event listeners for keyup
    window.addEventListener('keyup', function(e) {
        // Only process gameplay controls if the game is in playing state
        if (gameState.status !== GAME_STATE.PLAYING) return;
        
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
        
        // Throwing controls - throw on key release
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