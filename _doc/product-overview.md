# Product Overview

## Identity
- **Name**: Horror in the Bangala
- **Type**: Browser-based single-player horror escape game
- **Platform**: Web browser — no download, no account, no install required

## What It Is
A single-player browser horror game set inside a large, dark bungalow. The player finds themselves trapped inside with no apparent way out. The objective is to explore the bungalow room by room, discover clues and items, solve puzzles, and find and reach the exit to escape.

## Core Gameplay Loop
1. Player starts trapped inside a big, dark bungalow
2. Explore rooms — each contains clues, items, or locked obstacles
3. Solve puzzles and unlock doors to advance deeper through the bungalow
4. Encounter horror events and threats that sustain tension
5. Reach the exit to escape and complete the game

## Target Audience
- Horror game enthusiasts seeking a quick, accessible scare
- Browser game players who enjoy escape-room style puzzle mechanics
- Casual gamers wanting an intense short-form experience with zero install friction

## Key Features
- Room-by-room bungalow navigation
- Puzzle mechanics: keys, locked doors, hidden clues, riddles
- Horror events: unpredictable scares and lurking threats
- Atmospheric design: dim lighting, ambient tension from the first moment
- Single clear objective — find the exit
- Instant browser play: open a link, begin the nightmare

## Brand & Tone
- Dark, atmospheric, and tense — editorial horror aesthetic
- Accessible: zero friction, browser-native
- Short-form: completable in a single session (~15–30 minutes)
- No bloat — one bungalow, one objective, one session

## Strategic Principles
- **Friction-zero entry**: player should be inside the game within seconds of clicking a link
- **Atmosphere-first**: visual and audio design creates dread before mechanics appear
- **Tight scope**: one bungalow, one escape objective — depth through atmosphere and puzzle design, not feature sprawl

## Built — Confirmed Implementation
- **Perspective**: Top-down 2D HTML5 Canvas (React Router + Canvas API)
- **Map**: 21×15 tile bungalow with rooms, walls, locked doors, torch positions, and one exit
- **Mechanics**: Collect 3 keys → doors unlock → reach the exit to win; 5 hidden clues
- **Enemies**: 4 ghost AI with patrol + aggro-chase; health damage on contact
- **Atmosphere**: Radial darkness vignette, flashlight effect, jump scare triggers, flicker effect
- **Controls**: Keyboard (WASD/arrows) + touch/swipe for mobile
- **Screens**: Gothic intro with blood-drip animation, win screen, lose screen
- **Configurables**: gameTitle, playerSpeed, ghostCount, enableJumpScares, enableFlickerEffect, wall/floor/HUD colors, win/lose messages
