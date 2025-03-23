// Game constants
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const PLAYER_SIZE = 30;
const PLAYER_SPEED = 200; // pixels per second
const BALL_SIZE = 15;
const BALL_COUNT = 10;
const BALL_RESPAWN_TIME = 3000; // milliseconds
const MAX_INVENTORY = 3; // maximum number of balls a player can hold
const THROW_SPEED = 400; // pixels per second
const AIM_LINE_LENGTH = 50; // length of aiming line
const KNOCKBACK_FORCE = 300; // knockback force when hit
const KNOCKBACK_DURATION = 0.2; // knockback duration in seconds
const INVINCIBILITY_DURATION = 1000; // invincibility period after being hit (milliseconds)
const MAX_HEALTH = 3; // maximum health points
const OBSTACLE_COUNT = 5; // number of obstacles
const MATCH_SCORE_TO_WIN = 3; // number of rounds to win the match
const ROUND_TIME_LIMIT = 60; // time limit in seconds for each round

// Invisibility powerup constants
const INVISIBILITY_DURATION = 5000; // milliseconds
const INVISIBILITY_SPAWN_INTERVAL_MIN = 15000; // minimum spawn interval in milliseconds
const INVISIBILITY_SPAWN_INTERVAL_MAX = 30000; // maximum spawn interval in milliseconds
const INVISIBILITY_ACTIVE_DURATION = 10000; // how long the powerup stays on screen

// Game state constants
const GAME_STATE = {
    START: 'start',
    PLAYING: 'playing',
    PAUSED: 'paused',
    ROUND_OVER: 'round_over',
    MATCH_OVER: 'match_over'
};