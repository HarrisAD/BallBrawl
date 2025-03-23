// Controls-related code

// Dash control variables
const dashControls = {
    player1: {
        up: { lastPress: 0, count: 0 },
        down: { lastPress: 0, count: 0 },
        left: { lastPress: 0, count: 0 },
        right: { lastPress: 0, count: 0 }
    },
    player2: {
        up: { lastPress: 0, count: 0 },
        down: { lastPress: 0, count: 0 },
        left: { lastPress: 0, count: 0 },
        right: { lastPress: 0, count: 0 }
    },
    doubleTapWindow: 300 // milliseconds
};

// Try to perform a dash in the given direction
function tryDash(player, dirX, dirY) {
    const currentTime = Date.now();
    
    // Check if dash is on cooldown
    if (currentTime - player.lastDashTime < DASH_COOLDOWN) {
        return;
    }
    
    // Start dash
    player.isDashing = true;
    player.dashEndTime = currentTime + DASH_DURATION;
    player.lastDashTime = currentTime;
    
    // Set dash direction (normalized)
    const length = Math.sqrt(dirX * dirX + dirY * dirY);
    if (length > 0) {
        player.dashDirection = {
            x: dirX / length,
            y: dirY / length
        };
    } else {
        // Default to forward dash based on last movement
        player.dashDirection = {
            x: player.velocityX !== 0 ? Math.sign(player.velocityX) : 0,
            y: player.velocityY !== 0 ? Math.sign(player.velocityY) : 0
        };
    }
    
    // Create dash effect
    createParticleEffect(
        player.x, 
        player.y, 
        player.color, 
        'dash', 
        15
    );
}

// Set up keyboard controls
function setupControls() {
    // Add event listeners for keydown
window.addEventListener('keydown', function(e) {
    // Game state controls remain the same
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
    
    const currentTime = Date.now();
    
    // Player 1 controls (WASD)
    if (e.key === 'w') {
        // Only trigger if key wasn't already down
        if (!player1.moveUp) {
            // Double-tap detection for dash
            const control = dashControls.player1.up;
            if (currentTime - control.lastPress < dashControls.doubleTapWindow) {
                control.count++;
                if (control.count === 2) {
                    tryDash(player1, 0, -1); // Dash up
                    control.count = 0;
                }
            } else {
                control.count = 1;
            }
            control.lastPress = currentTime;
        }
        player1.moveUp = true;
    }
    
    if (e.key === 's') {
        if (!player1.moveDown) {
            // Double-tap detection for dash
            const control = dashControls.player1.down;
            if (currentTime - control.lastPress < dashControls.doubleTapWindow) {
                control.count++;
                if (control.count === 2) {
                    tryDash(player1, 0, 1); // Dash down
                    control.count = 0;
                }
            } else {
                control.count = 1;
            }
            control.lastPress = currentTime;
        }
        player1.moveDown = true;
    }
    
    if (e.key === 'a') {
        if (!player1.moveLeft) {
            // Double-tap detection for dash
            const control = dashControls.player1.left;
            if (currentTime - control.lastPress < dashControls.doubleTapWindow) {
                control.count++;
                if (control.count === 2) {
                    tryDash(player1, -1, 0); // Dash left
                    control.count = 0;
                }
            } else {
                control.count = 1;
            }
            control.lastPress = currentTime;
        }
        player1.moveLeft = true;
    }
    
    if (e.key === 'd') {
        if (!player1.moveRight) {
            // Double-tap detection for dash
            const control = dashControls.player1.right;
            if (currentTime - control.lastPress < dashControls.doubleTapWindow) {
                control.count++;
                if (control.count === 2) {
                    tryDash(player1, 1, 0); // Dash right
                    control.count = 0;
                }
            } else {
                control.count = 1;
            }
            control.lastPress = currentTime;
        }
        player1.moveRight = true;
    }
    
    // Player 2 controls (Arrow keys)
    if (e.key === 'ArrowUp') {
        if (!player2.moveUp) {
            // Double-tap detection for dash
            const control = dashControls.player2.up;
            if (currentTime - control.lastPress < dashControls.doubleTapWindow) {
                control.count++;
                if (control.count === 2) {
                    tryDash(player2, 0, -1); // Dash up
                    control.count = 0;
                }
            } else {
                control.count = 1;
            }
            control.lastPress = currentTime;
        }
        player2.moveUp = true;
    }
    
    if (e.key === 'ArrowDown') {
        if (!player2.moveDown) {
            // Double-tap detection for dash
            const control = dashControls.player2.down;
            if (currentTime - control.lastPress < dashControls.doubleTapWindow) {
                control.count++;
                if (control.count === 2) {
                    tryDash(player2, 0, 1); // Dash down
                    control.count = 0;
                }
            } else {
                control.count = 1;
            }
            control.lastPress = currentTime;
        }
        player2.moveDown = true;
    }
    
    if (e.key === 'ArrowLeft') {
        if (!player2.moveLeft) {
            // Double-tap detection for dash
            const control = dashControls.player2.left;
            if (currentTime - control.lastPress < dashControls.doubleTapWindow) {
                control.count++;
                if (control.count === 2) {
                    tryDash(player2, -1, 0); // Dash left
                    control.count = 0;
                }
            } else {
                control.count = 1;
            }
            control.lastPress = currentTime;
        }
        player2.moveLeft = true;
    }
    
    if (e.key === 'ArrowRight') {
        if (!player2.moveRight) {
            // Double-tap detection for dash
            const control = dashControls.player2.right;
            if (currentTime - control.lastPress < dashControls.doubleTapWindow) {
                control.count++;
                if (control.count === 2) {
                    tryDash(player2, 1, 0); // Dash right
                    control.count = 0;
                }
            } else {
                control.count = 1;
            }
            control.lastPress = currentTime;
        }
        player2.moveRight = true;
    }
    
    // Ball collection controls (unchanged)
    if (e.key === 'e') collectBall(player1);
    if (e.key === '/') collectBall(player2);
    
    // Aiming controls (unchanged)
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