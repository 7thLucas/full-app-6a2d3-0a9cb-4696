import { useEffect, useRef, useCallback, useState } from "react";
import { createInitialGameState, updateGame, triggerJumpScare, type InputState } from "./engine";
import { renderGame, renderIntro, renderEndScreen } from "./renderer";
import type { GameState, GameConfig } from "./types";

interface GameCanvasProps {
  config: GameConfig;
  gameTitle: string;
  gameSubtitle: string;
  gameDescription: string;
  startButtonLabel: string;
  winMessage: string;
  loseMessage: string;
  appName: string;
}

export function GameCanvas({
  config,
  gameTitle,
  gameSubtitle,
  gameDescription,
  startButtonLabel,
  winMessage,
  loseMessage,
  appName,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef<GameState>(createInitialGameState(config));
  const inputRef = useRef<InputState>({
    up: false, down: false, left: false, right: false, interact: false,
  });
  const frameRef = useRef<number>(0);
  const animRef = useRef<number>(0);
  const introFrameRef = useRef<number>(0);

  // track canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ w: 800, h: 600 });

  // resize handler
  useEffect(() => {
    function handleResize() {
      setCanvasSize({ w: window.innerWidth, h: window.innerHeight });
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // keyboard input
  useEffect(() => {
    const keyMap: Record<string, keyof InputState> = {
      ArrowUp: "up", w: "up", W: "up",
      ArrowDown: "down", s: "down", S: "down",
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right",
      e: "interact", E: "interact", " ": "interact", Enter: "interact",
    };

    function onKeyDown(e: KeyboardEvent) {
      const action = keyMap[e.key];
      if (action) {
        inputRef.current[action] = true;
        e.preventDefault();
      }
    }
    function onKeyUp(e: KeyboardEvent) {
      const action = keyMap[e.key];
      if (action) {
        inputRef.current[action] = false;
      }
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  // Touch / click for intro start or restart
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const W = canvas.width;
    const H = canvas.height;

    const phase = stateRef.current.phase;

    if (phase === "intro") {
      // Check start button
      const btnW = Math.min(W - 100, 260);
      const btnH = 52;
      const btnX = (W - btnW) / 2;
      const btnY = H * 0.68;
      if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
        stateRef.current = { ...stateRef.current, phase: "playing" };
      }
    } else if (phase === "win" || phase === "lose") {
      // Check replay button
      const btnW = 200;
      const btnH = 50;
      const btnX = (W - btnW) / 2;
      const btnY = H * 0.7;
      if (x >= btnX && x <= btnX + btnW && y >= btnY && y <= btnY + btnH) {
        stateRef.current = createInitialGameState(config);
        stateRef.current.phase = "playing";
      }
    }
  }, [config]);

  // Touch controls for mobile
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const threshold = 12;

    inputRef.current.up = dy < -threshold;
    inputRef.current.down = dy > threshold;
    inputRef.current.left = dx < -threshold;
    inputRef.current.right = dx > threshold;
    e.preventDefault();
  }, []);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    inputRef.current = { up: false, down: false, left: false, right: false, interact: false };
  }, []);

  // Main game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function loop() {
      if (!canvas) return;
      frameRef.current++;
      introFrameRef.current++;

      const state = stateRef.current;
      const W = canvas.width;
      const H = canvas.height;

      if (state.phase === "intro") {
        renderIntro(
          canvas,
          config,
          gameTitle,
          gameSubtitle,
          gameDescription,
          startButtonLabel,
          () => { stateRef.current = { ...stateRef.current, phase: "playing" }; },
          introFrameRef.current
        );
      } else if (state.phase === "playing") {
        const onJumpScare = () => {
          stateRef.current = triggerJumpScare(stateRef.current);
        };
        stateRef.current = updateGame(
          stateRef.current,
          inputRef.current,
          config,
          W,
          H,
          onJumpScare
        );
        renderGame(canvas, stateRef.current, config);

        // Jump scare overlay
        if (stateRef.current.jumpScare.active) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const progress = 1 - stateRef.current.jumpScare.timer / 40;
            const alpha = Math.sin(progress * Math.PI);
            ctx.fillStyle = `rgba(139, 0, 0, ${alpha * 0.7})`;
            ctx.fillRect(0, 0, W, H);
            ctx.font = `${Math.min(W / 3, 180)}px serif`;
            ctx.textAlign = "center";
            ctx.globalAlpha = alpha;
            ctx.fillText(stateRef.current.jumpScare.face, W / 2, H / 2 + 60);
            ctx.globalAlpha = 1;
          }
        }
      } else if (state.phase === "win") {
        renderEndScreen(canvas, true, winMessage, () => {
          stateRef.current = createInitialGameState(config);
          stateRef.current.phase = "playing";
        }, frameRef.current, appName);
      } else if (state.phase === "lose") {
        renderEndScreen(canvas, false, loseMessage, () => {
          stateRef.current = createInitialGameState(config);
          stateRef.current.phase = "playing";
        }, frameRef.current, appName);
      }

      animRef.current = requestAnimationFrame(loop);
    }

    animRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [config, gameTitle, gameSubtitle, gameDescription, startButtonLabel, winMessage, loseMessage, appName]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasSize.w}
      height={canvasSize.h}
      style={{ display: "block", width: "100vw", height: "100vh", cursor: "crosshair" }}
      onClick={handleCanvasClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    />
  );
}
