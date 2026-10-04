# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A collection of small browser games the user makes with their niece. All UI text is in Spanish and written for kids. There is no build step, package manager, linter or test suite, and the directory is not a git repo. The only external dependency is Google Fonts (Bagel Fat One, Lexend).

To run it, open `index.html` (the games menu) or a game's `index.html` directly in a browser, for example `xdg-open index.html`. Everything must keep working from `file://`, which is why games use **classic `<script>` tags, not ES modules** (modules are blocked by CORS on `file://`). Scripts share globals, and load order in each game's `index.html` matters.

## Layout

- `index.html`: the games menu. Add one `.game-card` link per game.
- `shared/`: code reused by every game.
  - `base.css`: color and type tokens, light/dark theme, `.panel`, `.btn` (`.primary`, `.big`), form fields, `.seg` pill radios, `.title`/`.logo`, the `.secret` pass-the-device screen, confetti, the menu's `.game-card` and the `.home-link`.
  - `utils.js`: `$`, `esc` (HTML-escape), `shuffle`, `confetti()`, `passDevice()` (hides secret info between two players on one device).
- `<game-folder>/`: one folder per game, each with its own `index.html`, `styles.css`, `js/` and its own `CLAUDE.md`.
- `Arma el Mejor Equipo.html`: the old single-file version from before the refactor. The current version is `arma-el-mejor-equipo/`.

## Adding a new game

Create `<nombre-del-juego>/index.html`. Link `../shared/base.css` before the game's own CSS, and load `../shared/utils.js` before the game's scripts. Include `<a class="home-link" href="../index.html">← Todos los juegos</a>`, then add a card to the root `index.html`.

Follow the pattern of the existing game:
- a global state object, plus one file per screen under `js/screens/`;
- each screen has a `render*()` function that rebuilds `#app` with `innerHTML` and then reattaches `onclick` handlers;
- `js/main.js` starts the game.

## Visual system

The games are a "table" (`--table`, with an optional `--table-pattern`) that holds flat panels and collectible cards.
- **Panels** have an ink outline and no shadow.
- **Cards** are the only elements with depth and shine, so save them for the content that matters most.
- **Colors:** ink is `#241B3A` (used instead of black), the main action is `--gold`, and each player has their color.
- **Type:** `--display` (Bagel Fat One) for titles, names and big numbers; `--body` (Lexend) for everything else. Sizes come from the 1.25 scale `--t-*`.
- Text placed directly on the table uses `--on-table`.
- Motion: no decorative animation. Use it only to respond to the game (reveals, hits, celebrations).

## Conventions

- Interpolate any user-entered text (player names) through `esc()`.
- Colors are CSS custom properties on `:root`. Dark-mode values are defined in two places: under `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])`, and again under `:root[data-theme="dark"]`. Games add their own tokens the same way.
- Player colors are `--p1`/`--p2`, used through the `.c1`/`.c2` (background) and `.pc1`/`.pc2` (text) classes.
- Respect `prefers-reduced-motion` for animations.
- Layouts must work at phone width.
