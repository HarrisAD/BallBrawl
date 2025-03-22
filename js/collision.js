// Collision detection functions

// Check if a player and a ball are colliding
function isColliding(player, ball) {
    // Calculate the closest point on the player's box to the ball's center
    const closestX = Math.max(player.x - player.width / 2, Math.min(ball.x, player.x + player.width / 2));
    const closestY = Math.max(player.y - player.height / 2, Math.min(ball.y, player.y + player.height / 2));
    
    // Calculate the distance between the closest point and the ball's center
    const distanceX = closestX - ball.x;
    const distanceY = closestY - ball.y;
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    
    // Return true if the distance is less than the ball's radius (squared)
    return distanceSquared <= ball.radius * ball.radius;
}

// Check for collision between a circle and a rectangle
function circleRectCollision(circle, rect) {
    // Find the closest point to the circle within the rectangle
    const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
    
    // Calculate the distance between the circle's center and this closest point
    const distanceX = circle.x - closestX;
    const distanceY = circle.y - closestY;
    
    // If the distance is less than the circle's radius, an intersection occurs
    const distanceSquared = distanceX * distanceX + distanceY * distanceY;
    return distanceSquared < circle.radius * circle.radius;
}

// Check for collision between two rectangles
function rectRectCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

// Check if a point is inside a rectangle
function pointRectCollision(point, rect) {
    return (
        point.x >= rect.x &&
        point.x <= rect.x + rect.width &&
        point.y >= rect.y &&
        point.y <= rect.y + rect.height
    );
}