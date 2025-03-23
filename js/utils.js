// Utility functions

// Get a random color for balls
function getRandomBallColor() {
    const colors = ['yellow', 'green', 'orange', 'purple', 'cyan'];
    return colors[Math.floor(Math.random() * colors.length)];
}

// Get canvas and context (used by multiple modules)
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Convert color to RGB values for use in rgba()
function getColorRGB(color) {
    // Create a temporary div to compute the RGB values
    const tempDiv = document.createElement("div");
    tempDiv.style.color = color;
    tempDiv.style.display = "none";
    document.body.appendChild(tempDiv);
    
    // Get computed style
    const computedColor = window.getComputedStyle(tempDiv).color;
    
    // Remove the temporary element
    document.body.removeChild(tempDiv);
    
    // If we have a computed RGB value
    if (computedColor.startsWith("rgb")) {
        // Extract only the r,g,b values without the "rgb(" and ")" parts
        return computedColor.replace(/^rgba?\(|\)$/g, '').replace(/\s/g, '');
    }
    
    // Default fallback colors for common names if computation fails
    const colorMap = {
        'yellow': '255,255,0',
        'green': '0,128,0',
        'orange': '255,165,0',
        'purple': '128,0,128',
        'cyan': '0,255,255',
        'red': '255,0,0',
        'blue': '0,0,255',
        'darkred': '139,0,0',
        'darkblue': '0,0,139'
    };
    
    return colorMap[color] || '255,255,255'; // default to white if color not found
}