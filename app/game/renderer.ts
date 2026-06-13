import { TILE_SIZE, COLS, ROWS, TILE, BUNGALOW_MAP, DEFAULT_COLORS } from "./constants";
import type { GameState, GameConfig } from "./types";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 8, g: 8, b: 8 };
}

function drawTorch(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  frame: number
): void {
  // Torch flame
  const flameSize = 6 + 2 * Math.sin(frame * 0.15);
  const gradient = ctx.createRadialGradient(cx, cy - 2, 0, cx, cy, flameSize);
  gradient.addColorStop(0, "rgba(255, 200, 50, 0.9)");
  gradient.addColorStop(0.5, "rgba(255, 100, 10, 0.6)");
  gradient.addColorStop(1, "rgba(200, 30, 0, 0)");
  ctx.beginPath();
  ctx.arc(cx, cy, flameSize, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Torch glow on map
  const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 60);
  glow.addColorStop(0, "rgba(255, 120, 10, 0.12)");
  glow.addColorStop(1, "rgba(255, 80, 0, 0)");
  ctx.beginPath();
  ctx.arc(cx, cy, 60, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();
}

function drawGhost(
  ctx: CanvasRenderingContext2D,
  gx: number,
  gy: number,
  color: string,
  size: number,
  opacity: number,
  frame: number,
  phase: number,
  isChasing: boolean
): void {
  ctx.save();
  ctx.globalAlpha = opacity;

  const bobY = gy + 3 * Math.sin(frame * 0.08 + phase);
  const r = hexToRgb(color);

  // Body glow
  const glow = ctx.createRadialGradient(gx, bobY, 0, gx, bobY, size * 2.5);
  glow.addColorStop(0, `rgba(${r.r}, ${r.g}, ${r.b}, 0.4)`);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.arc(gx, bobY, size * 2.5, 0, Math.PI * 2);
  ctx.fillStyle = glow;
  ctx.fill();

  // Ghost head
  ctx.beginPath();
  ctx.arc(gx, bobY - size * 0.3, size, 0, Math.PI);
  // Wiggly skirt
  ctx.lineTo(gx - size, bobY + size * 0.3);
  const segments = 4;
  const segW = (size * 2) / segments;
  for (let i = 0; i < segments; i++) {
    const cx2 = gx - size + segW * i + segW / 2;
    const wobble = 3 * Math.sin(frame * 0.1 + i * 0.8 + phase);
    ctx.quadraticCurveTo(
      cx2, bobY + size * 0.8 + wobble,
      gx - size + segW * (i + 1), bobY + size * 0.3
    );
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  // Eyes
  const eyeOffset = size * 0.35;
  ctx.fillStyle = isChasing ? "#ff0000" : "#ffffff";
  ctx.beginPath();
  ctx.ellipse(gx - eyeOffset, bobY - size * 0.35, size * 0.22, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(gx + eyeOffset, bobY - size * 0.35, size * 0.22, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pupils
  ctx.fillStyle = "#000000";
  ctx.beginPath();
  ctx.arc(gx - eyeOffset, bobY - size * 0.3, size * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(gx + eyeOffset, bobY - size * 0.3, size * 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  frame: number,
  health: number
): void {
  const cx = px + 12;
  const cy = py + 12;
  const bob = 2 * Math.sin(frame * 0.12);

  // Flashlight cone (drawn behind player)
  const coneGrad = ctx.createRadialGradient(cx, cy + bob, 0, cx, cy + bob, 120);
  coneGrad.addColorStop(0, "rgba(255, 240, 200, 0.18)");
  coneGrad.addColorStop(0.5, "rgba(255, 220, 150, 0.06)");
  coneGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.arc(cx, cy + bob, 120, 0, Math.PI * 2);
  ctx.fillStyle = coneGrad;
  ctx.fill();

  // Player body glow
  const healthColor = health > 50 ? "200, 200, 200" : health > 25 ? "255, 150, 0" : "255, 50, 50";
  const bodyGlow = ctx.createRadialGradient(cx, cy + bob, 0, cx, cy + bob, 20);
  bodyGlow.addColorStop(0, `rgba(${healthColor}, 0.3)`);
  bodyGlow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.beginPath();
  ctx.arc(cx, cy + bob, 20, 0, Math.PI * 2);
  ctx.fillStyle = bodyGlow;
  ctx.fill();

  // Body
  ctx.fillStyle = "#c8c8c8";
  ctx.beginPath();
  ctx.roundRect(px + 3, py + 4 + bob, 18, 20, 4);
  ctx.fill();

  // Head
  ctx.fillStyle = "#f0c090";
  ctx.beginPath();
  ctx.arc(cx, py + 4 + bob, 8, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#333";
  ctx.beginPath();
  ctx.arc(cx - 3, py + 3 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + 3, py + 3 + bob, 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Flashlight icon
  ctx.fillStyle = "#ffd700";
  ctx.beginPath();
  ctx.arc(cx + 8, py + 8 + bob, 3, 0, Math.PI * 2);
  ctx.fill();
}

export function renderGame(
  canvas: HTMLCanvasElement,
  state: GameState,
  config: GameConfig
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const W = canvas.width;
  const H = canvas.height;
  const { camera, player, ghosts, objects, frame, flickerValue } = state;

  // Clear
  ctx.fillStyle = config.backgroundColor || DEFAULT_COLORS.background;
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);

  // Draw floor tiles
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const tile = BUNGALOW_MAP[row][col];
      const tx = col * TILE_SIZE;
      const ty = row * TILE_SIZE;

      if (tile === TILE.WALL) {
        // Wall
        ctx.fillStyle = config.wallColor || DEFAULT_COLORS.wall;
        ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);
        // Wall border highlight
        ctx.fillStyle = "rgba(80,0,0,0.4)";
        ctx.fillRect(tx, ty, TILE_SIZE, 2);
        ctx.fillRect(tx, ty, 2, TILE_SIZE);
        // Wall texture
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        for (let j = 0; j < 3; j++) {
          ctx.fillRect(tx + 8 + j * 12, ty + 4 + (row % 2) * 8, 8, 3);
        }
      } else {
        // Floor
        const alt = (row + col) % 2 === 0;
        ctx.fillStyle = alt
          ? (config.floorColor || DEFAULT_COLORS.floor)
          : DEFAULT_COLORS.floorAlt;
        ctx.fillRect(tx, ty, TILE_SIZE, TILE_SIZE);

        // Subtle floor crack
        if ((row * 7 + col * 3) % 11 === 0) {
          ctx.strokeStyle = "rgba(80,0,0,0.12)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tx + 8, ty + 10);
          ctx.lineTo(tx + 30, ty + 28);
          ctx.stroke();
        }
      }

      if (tile === TILE.DOOR_LOCKED || tile === TILE.DOOR_OPEN) {
        const door = objects.find(o => o.col === col && o.row === row && o.type === "door");
        const isLocked = door ? door.locked !== false : tile === TILE.DOOR_LOCKED;
        ctx.fillStyle = isLocked ? DEFAULT_COLORS.lockedDoor : DEFAULT_COLORS.openDoor;
        ctx.fillRect(tx + 4, ty + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        // Door frame
        ctx.strokeStyle = isLocked ? "#660000" : "#3a1a1a";
        ctx.lineWidth = 3;
        ctx.strokeRect(tx + 4, ty + 4, TILE_SIZE - 8, TILE_SIZE - 8);
        // Lock icon
        if (isLocked) {
          ctx.fillStyle = "#ffd700";
          ctx.beginPath();
          ctx.arc(tx + TILE_SIZE / 2, ty + TILE_SIZE / 2, 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }

  // Draw objects
  for (const obj of objects) {
    if (obj.collected && obj.type !== "door" && obj.type !== "exit" && obj.type !== "torch") continue;
    if (obj.collected && obj.type === "door") continue;

    const ox = obj.col * TILE_SIZE + TILE_SIZE / 2;
    const oy = obj.row * TILE_SIZE + TILE_SIZE / 2;

    if (obj.type === "key") {
      // Key glow
      const pulse = 0.7 + 0.3 * Math.sin(frame * 0.1 + obj.col);
      const keyGlow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 18);
      keyGlow.addColorStop(0, `rgba(255, 215, 0, ${0.5 * pulse})`);
      keyGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(ox, oy, 18, 0, Math.PI * 2);
      ctx.fillStyle = keyGlow;
      ctx.fill();

      // Key body
      ctx.fillStyle = "#ffd700";
      ctx.beginPath();
      ctx.arc(ox - 4, oy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#b8a000";
      ctx.beginPath();
      ctx.arc(ox - 4, oy, 4, 0, Math.PI * 2);
      ctx.fill();
      // Key shaft
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(ox - 1, oy - 2, 14, 4);
      ctx.fillRect(ox + 8, oy + 2, 3, 5);
      ctx.fillRect(ox + 4, oy + 2, 3, 4);

    } else if (obj.type === "clue") {
      // Parchment glow
      const clueGlow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 14);
      clueGlow.addColorStop(0, "rgba(26, 58, 26, 0.8)");
      clueGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(ox, oy, 14, 0, Math.PI * 2);
      ctx.fillStyle = clueGlow;
      ctx.fill();
      // Paper icon
      ctx.fillStyle = "#2a5a2a";
      ctx.fillRect(ox - 8, oy - 10, 16, 20);
      ctx.fillStyle = "#1a3a1a";
      for (let line = 0; line < 4; line++) {
        ctx.fillRect(ox - 5, oy - 7 + line * 5, 10, 2);
      }

    } else if (obj.type === "exit") {
      // Exit door — big and ominous
      const exitLocked = obj.locked !== false;
      const exitGlow = ctx.createRadialGradient(ox, oy, 0, ox, oy, 28);
      exitGlow.addColorStop(0, exitLocked ? "rgba(139,0,0,0.5)" : "rgba(0,200,0,0.5)");
      exitGlow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.beginPath();
      ctx.arc(ox, oy, 28, 0, Math.PI * 2);
      ctx.fillStyle = exitGlow;
      ctx.fill();
      ctx.fillStyle = exitLocked ? "#4a0000" : "#003300";
      ctx.fillRect(ox - 14, oy - 18, 28, 34);
      ctx.strokeStyle = exitLocked ? "#8b0000" : "#00aa00";
      ctx.lineWidth = 3;
      ctx.strokeRect(ox - 14, oy - 18, 28, 34);
      // EXIT text
      ctx.fillStyle = exitLocked ? "#ff4444" : "#44ff44";
      ctx.font = "bold 8px Inter";
      ctx.textAlign = "center";
      ctx.fillText("EXIT", ox, oy + 3);

    } else if (obj.type === "torch") {
      drawTorch(ctx, ox, oy, frame);
    }
  }

  // Draw ghosts
  for (const ghost of ghosts) {
    drawGhost(
      ctx,
      ghost.x,
      ghost.y,
      ghost.color,
      ghost.size,
      ghost.opacity * flickerValue,
      frame,
      ghost.phase,
      ghost.isChasing
    );
  }

  // Draw player
  drawPlayer(ctx, player.x, player.y, frame, player.health);

  ctx.restore(); // un-translate camera

  // Darkness vignette — centered on player in screen space
  const playerScreenX = player.x + 12 - camera.x;
  const playerScreenY = player.y + 12 - camera.y;
  const lightRadius = player.flashlight * flickerValue;

  const darkness = ctx.createRadialGradient(
    playerScreenX, playerScreenY, lightRadius * 0.3,
    playerScreenX, playerScreenY, lightRadius
  );
  darkness.addColorStop(0, "rgba(0,0,0,0)");
  darkness.addColorStop(0.6, "rgba(0,0,0,0.75)");
  darkness.addColorStop(1, "rgba(0,0,0,0.97)");

  ctx.fillStyle = darkness;
  ctx.fillRect(0, 0, W, H);

  // HUD
  drawHUD(ctx, state, config, W, H);
}

function drawHUD(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  config: GameConfig,
  W: number,
  H: number
): void {
  const { player, showMessage, cluesRead, totalClues } = state;
  const textColor = config.hudTextColor || DEFAULT_COLORS.hud;

  // Health bar
  const hbW = 120;
  const hbH = 10;
  const hbX = 16;
  const hbY = 16;
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(hbX - 2, hbY - 2, hbW + 4, hbH + 4);
  ctx.fillStyle = "#330000";
  ctx.fillRect(hbX, hbY, hbW, hbH);
  const healthColor = player.health > 60 ? "#44ff44" : player.health > 30 ? "#ffaa00" : "#ff2222";
  ctx.fillStyle = healthColor;
  ctx.fillRect(hbX, hbY, hbW * (player.health / 100), hbH);
  ctx.fillStyle = textColor;
  ctx.font = "10px Inter";
  ctx.textAlign = "left";
  ctx.fillText(`HEALTH`, hbX, hbY - 3);

  // Keys indicator
  ctx.fillStyle = textColor;
  ctx.font = "12px Inter";
  ctx.textAlign = "left";
  const keysText = `🗝 ${player.keys} / ${player.totalKeys}`;
  ctx.fillText(keysText, hbX, hbY + hbH + 18);

  // Clues
  ctx.fillText(`📜 ${cluesRead} / ${totalClues}`, hbX, hbY + hbH + 34);

  // Exit status
  if (player.hasExitKey) {
    ctx.fillStyle = "#44ff44";
    ctx.font = "bold 11px Inter";
    ctx.fillText("EXIT UNLOCKED — ESCAPE!", hbX, hbY + hbH + 52);
  }

  // Center message
  if (showMessage) {
    const msgW = Math.min(W - 60, 480);
    const msgX = (W - msgW) / 2;
    const msgY = H - 90;
    ctx.fillStyle = "rgba(0,0,0,0.82)";
    ctx.beginPath();
    ctx.roundRect(msgX, msgY, msgW, 56, 8);
    ctx.fill();
    ctx.strokeStyle = "#8b0000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = "#e8e8e8";
    ctx.font = "italic 13px Special Elite, serif";
    ctx.textAlign = "center";
    // Word-wrap basic
    const words = showMessage.split(" ");
    let line = "";
    let lineY = msgY + 22;
    for (const word of words) {
      const test = line + word + " ";
      const metrics = ctx.measureText(test);
      if (metrics.width > msgW - 24 && line !== "") {
        ctx.fillText(line.trim(), W / 2, lineY);
        line = word + " ";
        lineY += 18;
      } else {
        line = test;
      }
    }
    ctx.fillText(line.trim(), W / 2, lineY);
  }

  // Controls hint (bottom right)
  ctx.fillStyle = "rgba(232,232,232,0.35)";
  ctx.font = "10px Inter";
  ctx.textAlign = "right";
  ctx.fillText("WASD / Arrow Keys to move", W - 12, H - 10);
}

export function renderIntro(
  canvas: HTMLCanvasElement,
  config: GameConfig,
  gameTitle: string,
  gameSubtitle: string,
  gameDescription: string,
  startButtonLabel: string,
  onStart: () => void,
  frame: number
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  // Background
  ctx.fillStyle = "#080808";
  ctx.fillRect(0, 0, W, H);

  // Animated fog / mist
  for (let i = 0; i < 8; i++) {
    const fogX = (Math.sin(frame * 0.005 + i * 0.8) * W * 0.6 + W / 2) % W;
    const fogY = H * 0.3 + i * 40 + Math.sin(frame * 0.004 + i) * 20;
    const fogGrad = ctx.createRadialGradient(fogX, fogY, 0, fogX, fogY, 120 + i * 15);
    fogGrad.addColorStop(0, "rgba(26, 10, 10, 0.15)");
    fogGrad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = fogGrad;
    ctx.fillRect(0, 0, W, H);
  }

  // Blood drips from top
  ctx.fillStyle = "#8b0000";
  for (let i = 0; i < 7; i++) {
    const dx = W * 0.1 + i * W * 0.13;
    const dripH = 30 + i * 12 + 15 * Math.sin(frame * 0.03 + i);
    ctx.beginPath();
    ctx.moveTo(dx, 0);
    ctx.lineTo(dx + 4, dripH * 0.7);
    ctx.arc(dx + 2, dripH * 0.7, 4 + i * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Title
  const titleFlicker = 0.85 + 0.15 * Math.sin(frame * 0.08);
  ctx.globalAlpha = titleFlicker;
  ctx.fillStyle = "#8b0000";
  ctx.font = `bold ${Math.min(W / 10, 72)}px Creepster, cursive`;
  ctx.textAlign = "center";
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 20 + 10 * Math.sin(frame * 0.06);
  ctx.fillText(gameTitle, W / 2, H * 0.28);
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;

  // Subtitle
  ctx.fillStyle = "#c0a0a0";
  ctx.font = `${Math.min(W / 25, 22)}px Special Elite, serif`;
  ctx.textAlign = "center";
  ctx.fillText(gameSubtitle, W / 2, H * 0.38);

  // Description box
  const descW = Math.min(W - 80, 500);
  const descX = (W - descW) / 2;
  const descY = H * 0.44;
  ctx.fillStyle = "rgba(20, 0, 0, 0.7)";
  ctx.beginPath();
  ctx.roundRect(descX, descY, descW, 90, 8);
  ctx.fill();
  ctx.strokeStyle = "#4a0000";
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = "#b8b0b0";
  ctx.font = "italic 13px Special Elite, serif";
  ctx.textAlign = "center";
  // Word wrap description
  const words = gameDescription.split(" ");
  let line = "";
  let ly = descY + 24;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > descW - 30 && line !== "") {
      ctx.fillText(line.trim(), W / 2, ly);
      line = word + " ";
      ly += 18;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), W / 2, ly);

  // Start button
  const btnW = Math.min(W - 100, 260);
  const btnH = 52;
  const btnX = (W - btnW) / 2;
  const btnY = H * 0.68;
  const btnPulse = 0.8 + 0.2 * Math.sin(frame * 0.07);

  ctx.fillStyle = `rgba(139, 0, 0, ${btnPulse})`;
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 6);
  ctx.fill();
  ctx.strokeStyle = "#ff2222";
  ctx.lineWidth = 2;
  ctx.shadowColor = "#ff0000";
  ctx.shadowBlur = 10 * btnPulse;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.fillStyle = "#e8e8e8";
  ctx.font = `bold ${Math.min(W / 30, 18)}px Creepster, cursive`;
  ctx.textAlign = "center";
  ctx.fillText(startButtonLabel, W / 2, btnY + btnH / 2 + 6);

  // Controls hint
  ctx.fillStyle = "rgba(200,180,180,0.4)";
  ctx.font = "11px Inter";
  ctx.textAlign = "center";
  ctx.fillText("WASD or Arrow Keys to move • Approach objects to interact", W / 2, H * 0.84);

  // Spider web corners
  drawSpiderWeb(ctx, 0, 0, 80);
  drawSpiderWeb(ctx, W, 0, 80, true);
}

function drawSpiderWeb(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  flipX = false
): void {
  ctx.save();
  ctx.translate(x, y);
  if (flipX) ctx.scale(-1, 1);
  ctx.strokeStyle = "rgba(180,180,200,0.2)";
  ctx.lineWidth = 0.8;
  const rings = 4;
  for (let r = 1; r <= rings; r++) {
    const rs = (size / rings) * r;
    ctx.beginPath();
    ctx.moveTo(0, rs);
    ctx.lineTo(rs * 0.7, rs * 0.7);
    ctx.lineTo(rs, 0);
    ctx.stroke();
    // Arc segment
    ctx.beginPath();
    ctx.arc(0, 0, rs, 0, Math.PI / 2);
    ctx.stroke();
  }
  ctx.restore();
}

export function renderEndScreen(
  canvas: HTMLCanvasElement,
  won: boolean,
  message: string,
  onRestart: () => void,
  frame: number,
  appName: string
): void {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  ctx.fillStyle = won ? "#000d00" : "#0d0000";
  ctx.fillRect(0, 0, W, H);

  // Animated background
  for (let i = 0; i < 12; i++) {
    const ex = (Math.cos(frame * 0.004 + i * 0.52) * W * 0.4 + W / 2);
    const ey = (Math.sin(frame * 0.004 + i * 0.52) * H * 0.4 + H / 2);
    const eg = ctx.createRadialGradient(ex, ey, 0, ex, ey, 80);
    const color = won ? "0, 60, 0" : "60, 0, 0";
    eg.addColorStop(0, `rgba(${color}, 0.15)`);
    eg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = eg;
    ctx.fillRect(0, 0, W, H);
  }

  // Big icon
  ctx.font = `${Math.min(W / 6, 80)}px serif`;
  ctx.textAlign = "center";
  ctx.shadowColor = won ? "#00ff00" : "#ff0000";
  ctx.shadowBlur = 30 + 10 * Math.sin(frame * 0.07);
  ctx.fillText(won ? "🌙" : "💀", W / 2, H * 0.28);
  ctx.shadowBlur = 0;

  // Status
  ctx.fillStyle = won ? "#44ff44" : "#ff4444";
  ctx.font = `bold ${Math.min(W / 10, 60)}px Creepster, cursive`;
  ctx.textAlign = "center";
  ctx.shadowColor = won ? "#00aa00" : "#aa0000";
  ctx.shadowBlur = 15;
  ctx.fillText(won ? "ESCAPED!" : "GAME OVER", W / 2, H * 0.44);
  ctx.shadowBlur = 0;

  // Message
  ctx.fillStyle = "#c8c8c8";
  ctx.font = "italic 15px Special Elite, serif";
  ctx.textAlign = "center";
  const msgW = Math.min(W - 60, 440);
  const words = message.split(" ");
  let line = "";
  let ly = H * 0.54;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > msgW && line !== "") {
      ctx.fillText(line.trim(), W / 2, ly);
      line = word + " ";
      ly += 20;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), W / 2, ly);

  // Replay button
  const btnW = 200;
  const btnH = 50;
  const btnX = (W - btnW) / 2;
  const btnY = H * 0.7;
  ctx.fillStyle = "rgba(139,0,0,0.9)";
  ctx.beginPath();
  ctx.roundRect(btnX, btnY, btnW, btnH, 6);
  ctx.fill();
  ctx.strokeStyle = "#ff4444";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#e8e8e8";
  ctx.font = "bold 16px Creepster, cursive";
  ctx.textAlign = "center";
  ctx.fillText("Play Again", W / 2, btnY + btnH / 2 + 6);

  // App name
  ctx.fillStyle = "rgba(180,150,150,0.4)";
  ctx.font = "11px Inter";
  ctx.textAlign = "center";
  ctx.fillText(appName, W / 2, H - 14);
}
