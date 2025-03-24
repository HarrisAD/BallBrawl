# BallBrawl

A 2D multiplayer game where players compete to collect and throw balls at each other while navigating obstacles.

## Game Overview

In BallBrawl, two players face off in an arena filled with collectible balls and obstacles. The objective is to knock out your opponent by hitting them with thrown balls while avoiding being hit yourself.

### Core Mechanics

- **Movement**: Players can freely move around the 2D arena with momentum-based physics
- **Ball Collection**: Pick up balls scattered across the arena
- **Throwing**: Aim and throw balls at your opponent
- **Dodging**: Avoid balls thrown by your opponent
- **Obstacles**: Hide behind barriers like barrels for protection
- **Powerups**: Collect the invisibility powerup to become temporarily invisible

## Features Implemented

- **Player Controls**: WASD for Player 1, Arrow Keys for Player 2
- **Core Gameplay**: Collection, aiming, throwing, and hit detection
- **Visual Effects**: Particle systems, screen shake, hit effects
- **Game UI**: Health bars, score tracking, timers
- **Game States**: Start, playing, paused, round over, match over
- **Special Abilities**: Double-tap dash, invisibility powerup
- **Physics**: Momentum-based movement, knockback on hits
- **Game Feel**: Screen shake, hit-stop, visual feedback

## Development Roadmap

### ✅ Phase 1: Canvas Setup
- Create the HTML canvas element
- Set up the basic game loop
- Implement simple rendering functions

### ✅ Phase 2: Player Basics
- Add player sprites
- Implement basic movement controls
- Add player boundaries

### ✅ Phase 3: Ball Implementation
- Create ball objects
- Implement ball rendering
- Add basic collision detection

### ✅ Phase 4: Collection Mechanics
- Allow players to pick up balls
- Show visual indicators for held balls
- Implement ball inventory system

### ✅ Phase 5: Throwing Mechanics
- Add aiming controls
- Implement ball throwing physics
- Add trajectory calculations

### ✅ Phase 6: Hit Detection
- Implement player-ball collision
- Add knockback effects
- Create hit animations

### ✅ Phase 7: Obstacles
- Add barrel obstacles
- Implement obstacle collision
- Create obstacle rendering

### ✅ Phase 8: Game States
- Add start/pause/end game states
- Implement score tracking
- Create win conditions

### ✅ Phase 9: UI Elements
- Add health/lives indicators
- Create scoring display
- Implement game messages

### ✅ Phase 10: Local Multiplayer
- Set up dual controls
- Implement split controls (WASD vs Arrows)
- Add player distinction (colors/sprites)

### ✅ Phase 11: Polish
- Add particle effects
- Implement screen shake and hit-stop
- Add movement momentum
- Implement player trails
- Add invisibility powerup
- Refine controls and game feel

### Phase 12: Online Basics
- Set up basic WebSocket connection
- Implement state synchronization
- Add simple matchmaking

### Future Phases
- Sound effects and music
- Additional powerups
- More arena types
- Character customization
- Mobile support
- Game mode variants

## Technical Stack

- **Frontend**: HTML5 Canvas, JavaScript
- **Game Engine**: Custom
- **Physics**: Simple custom physics for ball trajectories
- **Multiplayer**: WebSockets for real-time gameplay (planned)

## Controls

### Player 1
- **Movement**: WASD keys
- **Double-tap Movement**: Double-tap WASD for dash
- **Collect**: E key
- **Aim/Throw**: Hold Q to aim, release to throw

### Player 2
- **Movement**: Arrow keys
- **Double-tap Movement**: Double-tap arrows for dash
- **Collect**: / (forward slash) key
- **Aim/Throw**: Hold . (period) to aim, release to throw

### Game Controls
- **Start/Next Round**: Enter
- **Pause/Resume**: P
- **Restart**: R (when match is over)

## Getting Started

1. Clone the repository
2. Open `index.html` in your browser
3. Use WASD for Player 1 and arrow keys for Player 2

## Contributing

We welcome contributions! Please check the Issues tab for current tasks.

## License

This project is licensed under the MIT License - see the LICENSE file for details.