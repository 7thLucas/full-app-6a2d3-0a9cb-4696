import { useEffect, useState } from "react";
import { useConfigurables } from "~/modules/configurables";
import { GameCanvas } from "~/game/GameCanvas";
import type { GameConfig } from "~/game/types";

export default function IndexPage() {
  const { config, loading } = useConfigurables();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent SSR mismatch — canvas is client-only
  if (!mounted || loading) {
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          background: "#080808",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        {/* Loading screen with horror aesthetic */}
        <div
          style={{
            fontFamily: "'Creepster', cursive",
            color: "#8b0000",
            fontSize: "clamp(28px, 5vw, 52px)",
            textShadow: "0 0 20px #ff0000",
            letterSpacing: "0.05em",
          }}
        >
          {config?.appName || "Horror in the Bangala"}
        </div>
        <div
          style={{
            fontFamily: "Inter, sans-serif",
            color: "#555",
            fontSize: "13px",
            letterSpacing: "0.1em",
          }}
        >
          Loading...
        </div>
        <LoadingDots />
      </div>
    );
  }

  const gameConfig: GameConfig = {
    playerSpeed: config?.playerSpeed ?? 3,
    ghostCount: config?.ghostCount ?? 3,
    enableJumpScares: config?.enableJumpScares ?? true,
    enableFlickerEffect: config?.enableFlickerEffect ?? true,
    backgroundColor: config?.backgroundColor ?? "#080808",
    hudTextColor: config?.hudTextColor ?? "#e8e8e8",
    wallColor: config?.wallColor ?? "#1a0a0a",
    floorColor: config?.floorColor ?? "#0d0d0d",
    winMessage: config?.winMessage ?? "You escaped! But the bangala remembers you...",
    loseMessage: config?.loseMessage ?? "The darkness claimed you. Game Over.",
  };

  return (
    <div id="game-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Special+Elite&display=swap');
        body { margin: 0; padding: 0; overflow: hidden; background: #080808; }
        * { box-sizing: border-box; }
      `}</style>
      <GameCanvas
        config={gameConfig}
        gameTitle={config?.gameTitle ?? "Horror in the Bangala"}
        gameSubtitle={config?.gameSubtitle ?? "Can you escape the haunted bungalow?"}
        gameDescription={
          config?.gameDescription ??
          "You are trapped inside a dark, cursed bungalow. Find the keys, uncover clues, and escape before the ghosts consume you."
        }
        startButtonLabel={config?.startButtonLabel ?? "Enter the Bangala"}
        winMessage={gameConfig.winMessage}
        loseMessage={gameConfig.loseMessage}
        appName={config?.appName ?? "Horror in the Bangala"}
      />
    </div>
  );
}

function LoadingDots() {
  const [dots, setDots] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => (d + 1) % 4);
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ color: "#8b0000", fontSize: "20px", letterSpacing: "4px", minWidth: "30px" }}>
      {"•".repeat(dots)}
    </div>
  );
}
