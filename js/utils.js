// Utility functions

// Get a random color for balls
function getRandomBallColor() {
    const colors = ['yellow', 'green', 'orange', 'purple', 'cyan'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Get canvas and context (used by multiple modules)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');