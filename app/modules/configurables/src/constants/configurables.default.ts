/*
 * Default Configurable Data — seeded into Mongo on first boot.
 *
 * BEFORE EDITING: read ./RULES.md (especially R5: schema and defaults must
 * stay in sync) and ./configurables.schema.ts. For per-type schema and
 * default-value samples, see RULES.md §5 "Field Type Reference".
 */

export type TBrandColor = {
  primary: string;
  secondary: string;
  accent: string;
};

export type TDefaultConfigurableData = {
  appName: string;
  logoUrl: string;
  brandColor: TBrandColor;
  // Game-specific configurables
  gameTitle: string;
  gameSubtitle: string;
  gameDescription: string;
  playerSpeed: number;
  ghostCount: number;
  enableJumpScares: boolean;
  enableFlickerEffect: boolean;
  backgroundColor: string;
  hudTextColor: string;
  wallColor: string;
  floorColor: string;
  startButtonLabel: string;
  winMessage: string;
  loseMessage: string;
};

export const defaultConfigurablesData: TDefaultConfigurableData = {
  appName: "Horror in the Bangala",
  logoUrl: "FILL_LOGO_URL_HERE",
  brandColor: {
    primary: "#8b0000",
    secondary: "#6b0000",
    accent: "#1a3a1a",
  },
  // Game configurables
  gameTitle: "Horror in the Bangala",
  gameSubtitle: "Can you escape the haunted bungalow?",
  gameDescription:
    "You are trapped inside a dark, cursed bungalow. Find the keys, uncover clues, and escape before the ghosts consume you. Not for the faint of heart.",
  playerSpeed: 3,
  ghostCount: 3,
  enableJumpScares: true,
  enableFlickerEffect: true,
  backgroundColor: "#080808",
  hudTextColor: "#e8e8e8",
  wallColor: "#1a0a0a",
  floorColor: "#0d0d0d",
  startButtonLabel: "Enter the Bangala",
  winMessage: "You escaped! But the bangala remembers you...",
  loseMessage: "The darkness claimed you. Game Over.",
};
