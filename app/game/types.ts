export interface Vec2 {
  x: number;
  y: number;
}

export interface PlayerState {
  x: number; // pixel x
  y: number; // pixel y
  speed: number;
  keys: number; // keys collected
  totalKeys: number;
  hasExitKey: boolean;
  health: number; // 0-100
  flashlight: number; // light radius
  inventory: string[];
}

export interface GhostState {
  id: number;
  x: number;
  y: number;
  speed: number;
  direction: Vec2;
  aggroRange: number;
  isChasing: boolean;
  phase: number; // oscillation phase
  opacity: number;
  color: string;
  size: number;
  patrolPoints: Vec2[];
  patrolIndex: number;
  patrolTimer: number;
}

export interface InteractableObject {
  id: string;
  type: "key" | "clue" | "exit" | "door" | "torch";
  col: number;
  row: number;
  collected: boolean;
  locked?: boolean;
  message?: string;
}

export type GamePhase =
  | "intro"
  | "playing"
  | "paused"
  | "jumpScare"
  | "win"
  | "lose";

export interface JumpScareState {
  active: boolean;
  timer: number;
  face: string; // emoji or symbol
}

export interface GameState {
  phase: GamePhase;
  player: PlayerState;
  ghosts: GhostState[];
  objects: InteractableObject[];
  camera: Vec2;
  frame: number;
  flickerValue: number;
  jumpScare: JumpScareState;
  showMessage: string | null;
  messageTimer: number;
  cluesRead: number;
  totalClues: number;
  keysOnMap: number;
}

export interface GameConfig {
  playerSpeed: number;
  ghostCount: number;
  enableJumpScares: boolean;
  enableFlickerEffect: boolean;
  backgroundColor: string;
  hudTextColor: string;
  wallColor: string;
  floorColor: string;
  winMessage: string;
  loseMessage: string;
}
