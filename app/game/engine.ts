import { TILE_SIZE, COLS, ROWS, TILE, BUNGALOW_MAP, PLAYER_START, CLUE_MESSAGES } from "./constants";
import type { GameState, GhostState, InteractableObject, GameConfig, Vec2, PlayerState } from "./types";

const GHOST_COLORS = ["#6a0dad", "#8b0000", "#004d00", "#1a1a5e"];
const GHOST_NAMES = ["Banshee", "Wraith", "Shade", "Specter"];

function tileAt(col: number, row: number): number {
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return TILE.WALL;
  return BUNGALOW_MAP[row][col];
}

function isWalkable(col: number, row: number, objects: InteractableObject[]): boolean {
  const tile = tileAt(col, row);
  if (tile === TILE.WALL) return false;
  if (tile === TILE.DOOR_LOCKED) {
    const door = objects.find(o => o.col === col && o.row === row && o.type === "door");
    if (door && door.locked) return false;
  }
  return true;
}

function pixelToTile(px: number): number {
  return Math.floor(px / TILE_SIZE);
}

function distance(ax: number, ay: number, bx: number, by: number): number {
  return Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2);
}

function generateGhostPatrolPoints(index: number): Vec2[] {
  // Give each ghost a predefined patrol route
  const routes: Vec2[][] = [
    [ // Corridor patrols
      { x: 2 * TILE_SIZE + 24, y: 7 * TILE_SIZE + 24 },
      { x: 10 * TILE_SIZE + 24, y: 7 * TILE_SIZE + 24 },
      { x: 10 * TILE_SIZE + 24, y: 9 * TILE_SIZE + 24 },
      { x: 2 * TILE_SIZE + 24, y: 9 * TILE_SIZE + 24 },
    ],
    [
      { x: 1 * TILE_SIZE + 24, y: 1 * TILE_SIZE + 24 },
      { x: 4 * TILE_SIZE + 24, y: 1 * TILE_SIZE + 24 },
      { x: 4 * TILE_SIZE + 24, y: 5 * TILE_SIZE + 24 },
      { x: 1 * TILE_SIZE + 24, y: 5 * TILE_SIZE + 24 },
    ],
    [
      { x: 12 * TILE_SIZE + 24, y: 1 * TILE_SIZE + 24 },
      { x: 19 * TILE_SIZE + 24, y: 1 * TILE_SIZE + 24 },
      { x: 19 * TILE_SIZE + 24, y: 5 * TILE_SIZE + 24 },
      { x: 12 * TILE_SIZE + 24, y: 5 * TILE_SIZE + 24 },
    ],
    [
      { x: 11 * TILE_SIZE + 24, y: 11 * TILE_SIZE + 24 },
      { x: 19 * TILE_SIZE + 24, y: 11 * TILE_SIZE + 24 },
      { x: 19 * TILE_SIZE + 24, y: 13 * TILE_SIZE + 24 },
      { x: 11 * TILE_SIZE + 24, y: 13 * TILE_SIZE + 24 },
    ],
  ];
  return routes[index % routes.length];
}

export function createInitialGameState(config: GameConfig): GameState {
  // Collect all interactable objects from map
  const objects: InteractableObject[] = [];
  let keyIndex = 0;
  let clueIndex = 0;

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = BUNGALOW_MAP[row][col];
      if (tile === TILE.KEY) {
        objects.push({
          id: `key-${keyIndex}`,
          type: "key",
          col, row,
          collected: false,
        });
        keyIndex++;
      } else if (tile === TILE.CLUE) {
        objects.push({
          id: `clue-${clueIndex}`,
          type: "clue",
          col, row,
          collected: false,
          message: CLUE_MESSAGES[clueIndex % CLUE_MESSAGES.length],
        });
        clueIndex++;
      } else if (tile === TILE.EXIT) {
        objects.push({
          id: "exit",
          type: "exit",
          col, row,
          collected: false,
          locked: true,
        });
      } else if (tile === TILE.DOOR_LOCKED) {
        objects.push({
          id: `door-${col}-${row}`,
          type: "door",
          col, row,
          collected: false,
          locked: true,
        });
      } else if (tile === TILE.TORCH) {
        objects.push({
          id: `torch-${col}-${row}`,
          type: "torch",
          col, row,
          collected: false,
        });
      }
    }
  }

  const keysOnMap = objects.filter(o => o.type === "key").length;
  const totalClues = objects.filter(o => o.type === "clue").length;

  // Create ghosts
  const ghosts: GhostState[] = [];
  const numGhosts = Math.min(Math.max(config.ghostCount, 1), 4);
  for (let i = 0; i < numGhosts; i++) {
    const patrol = generateGhostPatrolPoints(i);
    ghosts.push({
      id: i,
      x: patrol[0].x,
      y: patrol[0].y,
      speed: 1.2 + i * 0.2,
      direction: { x: 1, y: 0 },
      aggroRange: 160 + i * 20,
      isChasing: false,
      phase: (i * Math.PI) / 2,
      opacity: 0.75,
      color: GHOST_COLORS[i % GHOST_COLORS.length],
      size: 18 + i * 2,
      patrolPoints: patrol,
      patrolIndex: 0,
      patrolTimer: 0,
    });
  }

  const playerX = PLAYER_START.col * TILE_SIZE + 4;
  const playerY = PLAYER_START.row * TILE_SIZE + 4;

  return {
    phase: "intro",
    player: {
      x: playerX,
      y: playerY,
      speed: config.playerSpeed,
      keys: 0,
      totalKeys: keysOnMap,
      hasExitKey: false,
      health: 100,
      flashlight: 180,
      inventory: [],
    },
    ghosts,
    objects,
    camera: { x: 0, y: 0 },
    frame: 0,
    flickerValue: 1,
    jumpScare: { active: false, timer: 0, face: "👻" },
    showMessage: null,
    messageTimer: 0,
    cluesRead: 0,
    totalClues,
    keysOnMap,
  };
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  interact: boolean;
}

function movePlayer(
  state: GameState,
  input: InputState,
  config: GameConfig
): void {
  const { player, objects } = state;
  let dx = 0;
  let dy = 0;

  if (input.up) dy -= player.speed;
  if (input.down) dy += player.speed;
  if (input.left) dx -= player.speed;
  if (input.right) dx += player.speed;

  // Normalize diagonal
  if (dx !== 0 && dy !== 0) {
    dx *= 0.707;
    dy *= 0.707;
  }

  const playerSize = 20;
  const margin = 4;

  // Try X movement
  const newX = player.x + dx;
  const left = Math.floor((newX + margin) / TILE_SIZE);
  const right = Math.floor((newX + playerSize - margin) / TILE_SIZE);
  const top = Math.floor((player.y + margin) / TILE_SIZE);
  const bottom = Math.floor((player.y + playerSize - margin) / TILE_SIZE);

  if (
    isWalkable(left, top, objects) &&
    isWalkable(right, top, objects) &&
    isWalkable(left, bottom, objects) &&
    isWalkable(right, bottom, objects)
  ) {
    player.x = newX;
  }

  // Try Y movement
  const newY = player.y + dy;
  const left2 = Math.floor((player.x + margin) / TILE_SIZE);
  const right2 = Math.floor((player.x + playerSize - margin) / TILE_SIZE);
  const top2 = Math.floor((newY + margin) / TILE_SIZE);
  const bottom2 = Math.floor((newY + playerSize - margin) / TILE_SIZE);

  if (
    isWalkable(left2, top2, objects) &&
    isWalkable(right2, top2, objects) &&
    isWalkable(left2, bottom2, objects) &&
    isWalkable(right2, bottom2, objects)
  ) {
    player.y = newY;
  }

  // Clamp to map bounds
  player.x = Math.max(4, Math.min(player.x, (COLS - 1) * TILE_SIZE - playerSize));
  player.y = Math.max(4, Math.min(player.y, (ROWS - 1) * TILE_SIZE - playerSize));
}

function updateGhosts(state: GameState): void {
  const { player, ghosts, objects } = state;
  const playerCX = player.x + 12;
  const playerCY = player.y + 12;

  for (const ghost of ghosts) {
    const dist = distance(ghost.x, ghost.y, playerCX, playerCY);
    ghost.isChasing = dist < ghost.aggroRange;

    if (ghost.isChasing) {
      // Chase player
      const dx = playerCX - ghost.x;
      const dy = playerCY - ghost.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const speed = ghost.speed * 1.4;
      ghost.x += (dx / len) * speed;
      ghost.y += (dy / len) * speed;
      ghost.direction = { x: dx / len, y: dy / len };
    } else {
      // Patrol
      ghost.patrolTimer++;
      const target = ghost.patrolPoints[ghost.patrolIndex];
      const dx = target.x - ghost.x;
      const dy = target.y - ghost.y;
      const dist2 = Math.sqrt(dx * dx + dy * dy);
      if (dist2 < 8) {
        ghost.patrolIndex = (ghost.patrolIndex + 1) % ghost.patrolPoints.length;
      } else {
        const len = dist2 || 1;
        ghost.x += (dx / len) * ghost.speed;
        ghost.y += (dy / len) * ghost.speed;
        ghost.direction = { x: dx / len, y: dy / len };
      }
    }

    // Ghost opacity wave
    ghost.phase += 0.03;
    ghost.opacity = 0.6 + 0.25 * Math.sin(ghost.phase);
  }
}

function checkCollisions(state: GameState, config: GameConfig, onJumpScare: () => void): void {
  const { player, ghosts, objects } = state;
  const playerCX = player.x + 12;
  const playerCY = player.y + 12;
  const playerCol = pixelToTile(playerCX);
  const playerRow = pixelToTile(playerCY);

  // Ghost collision
  for (const ghost of ghosts) {
    const dist = distance(ghost.x, ghost.y, playerCX, playerCY);
    if (dist < 24) {
      player.health -= 0.8;
      if (player.health <= 0) {
        player.health = 0;
        state.phase = "lose";
        return;
      }
      // Knockback player
      const dx = playerCX - ghost.x;
      const dy = playerCY - ghost.y;
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      player.x += (dx / len) * 5;
      player.y += (dy / len) * 5;

      if (config.enableJumpScares && !state.jumpScare.active && Math.random() < 0.02) {
        onJumpScare();
      }
    }
  }

  // Object pickup
  for (const obj of objects) {
    if (obj.collected) continue;
    const objCX = obj.col * TILE_SIZE + TILE_SIZE / 2;
    const objCY = obj.row * TILE_SIZE + TILE_SIZE / 2;
    const dist = distance(playerCX, playerCY, objCX, objCY);

    if (obj.type === "key" && dist < TILE_SIZE * 0.8) {
      obj.collected = true;
      player.keys++;
      state.showMessage = `Key found! (${player.keys}/${player.totalKeys})`;
      state.messageTimer = 120;

      // Last key unlocks the exit
      if (player.keys >= player.totalKeys) {
        player.hasExitKey = true;
        const exitObj = objects.find(o => o.type === "exit");
        if (exitObj) exitObj.locked = false;
        state.showMessage = "All keys collected! Find the EXIT!";
        state.messageTimer = 180;
      }
    } else if (obj.type === "clue" && dist < TILE_SIZE * 0.8) {
      obj.collected = true;
      state.cluesRead++;
      state.showMessage = obj.message || "...";
      state.messageTimer = 200;
    } else if (obj.type === "exit" && !obj.locked && dist < TILE_SIZE * 0.9) {
      state.phase = "win";
    } else if (obj.type === "door" && obj.locked && dist < TILE_SIZE * 0.9 && player.keys > 0) {
      obj.locked = false;
      obj.collected = true;
      // Also update the map visually
      state.showMessage = "Door unlocked!";
      state.messageTimer = 90;
    }
  }
}

function updateFlicker(state: GameState, enableFlicker: boolean): void {
  if (!enableFlicker) {
    state.flickerValue = 1;
    return;
  }
  state.frame++;
  // Rare dramatic flicker
  if (Math.random() < 0.003) {
    state.flickerValue = 0.1 + Math.random() * 0.5;
  } else {
    // Subtle ongoing noise
    state.flickerValue += (1 - state.flickerValue) * 0.1;
    state.flickerValue *= 0.98 + Math.random() * 0.04;
    state.flickerValue = Math.max(0.6, Math.min(1.0, state.flickerValue));
  }
}

function updateCamera(state: GameState, viewW: number, viewH: number): void {
  const mapW = COLS * TILE_SIZE;
  const mapH = ROWS * TILE_SIZE;
  const targetX = state.player.x + 12 - viewW / 2;
  const targetY = state.player.y + 12 - viewH / 2;
  state.camera.x = Math.max(0, Math.min(targetX, mapW - viewW));
  state.camera.y = Math.max(0, Math.min(targetY, mapH - viewH));
}

export function updateGame(
  state: GameState,
  input: InputState,
  config: GameConfig,
  viewW: number,
  viewH: number,
  onJumpScare: () => void
): GameState {
  if (state.phase !== "playing") return state;

  const next = { ...state };

  // Message countdown
  if (next.messageTimer > 0) {
    next.messageTimer--;
    if (next.messageTimer === 0) next.showMessage = null;
  }

  // Jump scare countdown
  if (next.jumpScare.active) {
    next.jumpScare = { ...next.jumpScare, timer: next.jumpScare.timer - 1 };
    if (next.jumpScare.timer <= 0) {
      next.jumpScare = { active: false, timer: 0, face: "👻" };
    }
  }

  movePlayer(next, input, config);
  updateGhosts(next);
  checkCollisions(next, config, onJumpScare);
  updateFlicker(next, config.enableFlickerEffect);
  updateCamera(next, viewW, viewH);

  return next;
}

export function triggerJumpScare(state: GameState): GameState {
  const faces = ["👹", "💀", "👻", "🕷️", "😱"];
  return {
    ...state,
    jumpScare: {
      active: true,
      timer: 40,
      face: faces[Math.floor(Math.random() * faces.length)],
    },
  };
}
