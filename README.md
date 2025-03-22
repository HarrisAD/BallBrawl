# BallBrawl

A 2D multiplayer game where players compete to collect and throw balls at each other while navigating obstacles.

## Game Overview

In BallBrawl, two players face off in an arena filled with collectible balls and obstacles. The objective is to knock out your opponent by hitting them with thrown balls while avoiding being hit yourself.

### Core Mechanics

- **Movement**: Players can freely move around the 2D arena
- **Ball Collection**: Pick up balls scattered across the arena
- **Throwing**: Aim and throw balls at your opponent
- **Dodging**: Avoid balls thrown by your opponent
- **Obstacles**: Hide behind barriers like barrels for protection

## Development Roadmap

### Phase 1: Canvas Setup
- Create the HTML canvas element
- Set up the basic game loop
- Implement simple rendering functions

### Phase 2: Player Basics
- Add player sprites
- Implement basic movement controls
- Add player boundaries

### Phase 3: Ball Implementation
- Create ball objects
- Implement ball rendering
- Add basic collision detection

### Phase 4: Collection Mechanics
- Allow players to pick up balls
- Show visual indicators for held balls
- Implement ball inventory system

### Phase 5: Throwing Mechanics
- Add aiming controls
- Implement ball throwing physics
- Add trajectory calculations

### Phase 6: Hit Detection
- Implement player-ball collision
- Add knockback effects
- Create hit animations

### Phase 7: Obstacles
- Add barrel obstacles
- Implement obstacle collision
- Create obstacle rendering

### Phase 8: Game States
- Add start/pause/end game states
- Implement score tracking
- Create win conditions

### Phase 9: UI Elements
- Add health/lives indicators
- Create scoring display
- Implement game messages

### Phase 10: Local Multiplayer
- Set up dual controls
- Implement split controls (WASD vs Arrows)
- Add player distinction (colors/sprites)

### Phase 11: Polish
- Add sound effects
- Implement basic animations
- Refine controls and feel

### Phase 12: Online Basics
- Set up basic WebSocket connection
- Implement state synchronization
- Add simple matchmaking

## Technical Stack

- **Frontend**: HTML5 Canvas, JavaScript
- **Game Engine**: Custom or Phaser.js
- **Physics**: Simple custom physics for ball trajectories
- **Multiplayer**: WebSockets for real-time gameplay

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Use WASD for Player 1 and arrow keys for Player 2

## Contributing

We welcome contributions! Please check the Issues tab for current tasks.

## License

This project is licensed under the MIT License - see the LICENSE file for details.