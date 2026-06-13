// Game tile constants
export const TILE_SIZE = 48;
export const COLS = 21;
export const ROWS = 15;

// Tile types
export const TILE = {
  WALL: 1,
  FLOOR: 0,
  DOOR_LOCKED: 2,
  DOOR_OPEN: 3,
  KEY: 4,
  CLUE: 5,
  EXIT: 6,
  TORCH: 7,
} as const;

export type TileType = (typeof TILE)[keyof typeof TILE];

// The bungalow map — a haunted multi-room layout
// 1=wall, 0=floor, 2=locked door, 3=open door, 4=key, 5=clue, 6=exit, 7=torch
export const BUNGALOW_MAP: number[][] = [
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  [1,7,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,4,0,1],
  [1,0,0,0,0,1,0,5,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,3,0,0,0,0,0,3,0,0,7,0,0,0,0,0,1],
  [1,0,4,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,5,0,0,0,1],
  [1,1,1,3,1,1,1,1,2,1,1,1,1,1,3,1,1,1,2,1,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
  [1,0,5,0,0,0,0,0,0,0,7,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,4,0,0,0,0,1],
  [1,1,1,2,1,1,1,1,3,1,1,1,1,1,3,1,1,1,3,1,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,5,0,0,0,1],
  [1,0,0,0,0,0,5,0,0,0,1,0,0,0,0,0,0,0,0,0,1],
  [1,0,0,0,0,0,0,0,0,0,1,0,0,7,0,0,0,0,6,0,1],
  [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

// Player starting position (tile coords)
export const PLAYER_START = { col: 1, row: 1 };

// Key required to open the exit (col 18, row 13)
export const EXIT_KEY_REQUIRED = true;

// Clue messages scattered around rooms
export const CLUE_MESSAGES = [
  "The key to freedom lies where shadows gather...",
  "She watches from the mirror. Don't look back.",
  "Three keys open three locks. Find them all.",
  "The child laughed here once. Now only silence.",
  "The exit is sealed. Only the master key will open it.",
];

// Colors (defaults — overridden by configurables)
export const DEFAULT_COLORS = {
  background: "#080808",
  wall: "#1a0a0a",
  floor: "#0d0d0d",
  floorAlt: "#0f0f0f",
  key: "#ffd700",
  exitDoor: "#8b0000",
  openDoor: "#3a1a1a",
  lockedDoor: "#2a1010",
  torch: "#ff6600",
  clue: "#1a3a1a",
  hud: "#e8e8e8",
  ghost: "#6a0dad",
  player: "#e8e8e8",
};
