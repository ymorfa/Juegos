# Arma el Mejor Equipo

A two-player, hot-seat game: players bid on random animals to build teams, each player orders their team in secret, then they watch an automatic 1-vs-1 elimination battle. Everything follows the repo-level conventions in `../CLAUDE.md`.

To check balance, run `node tools/balance.js`. It has every animal fight every other one in its biome, using the real `js/animals.js` and `js/combat.js`. Run it after changing stats or combat constants.

## Files (in load order, from `index.html`)

- `js/animals.js`: `LAND` and `SEA` are lists of `[name, emoji, hp, atk, def, spd, move]`. `BIOMES` maps each biome key (`tierra`/`mar`) to its animal objects, label and the "regresa a…" text.
  - The header comment explains what each stat represents; values are based on the real animal's traits.
  - A biome needs at least 16 animals, because the largest teams are 8 each.
- `js/combat.js`: holds `POWER`, `DEF_K`, `SPD_BASE`, `calcDamage()`, `interval()`, `power()`, `stars()`, `STATS` and `STAT_MAX`.
- `js/cards.js`: `RARITY` maps stars to a rarity (común, bronce, plata, oro, holográfica), which sets the card frame through the `.r-<key>` classes in `styles.css`. `cardHTML()` builds the big card (with `flip` for the reveal animation) and `miniCard()` the small cards used in team slots, the battle bench, the lineup and the setup fan.
- `js/state.js`: `app`, `START_PTS` (fixed at 100), the global state `S` (created in `setup.js`), and the helpers `full`, `pname`, `elig`, `broke`.
- `js/screens/*.js`: one file per screen, `setup` → `auction` → `lineup` → `battle` → `result`. Screens call each other's `render*`/flow functions through globals.
- `js/main.js`: calls `renderSetup()`.

## Mechanics that span several files

- **Auction** (`S.auc`: `animal, bid, leader, turn, passes, done, locked, msg`). The flow is `nextAnimal` → `doBid`/`doPass` → `award` or `resolveNoBids`.
  - A player who passes is out for that animal. While `u.passes===1`, the other player only gets a "take it for 1 point" button, and `doBid` awards immediately.
  - `autoCheck()` auto-passes after 1.3s when the player whose turn it is can't bid.
  - If both players pass, `resolveNoBids()` puts the animal back into `S.pool` at a random position (never as the very next one) and adds it to `S.rejected`. `award` clears that set. With `S.raffle` on, there's instead a 50% chance the animal goes free to a random player.
  - `overReason()` decides when the auction ends: both teams full, empty bag, no points left (without raffle), or every animal still in the bag has been rejected.
- **Lineup** `renderLineup(i, show)`: a `passDevice()` screen, then player `i`'s team only, with ▲▼ buttons, quick-sort buttons (by stat or ⭐ power) and 1–5 stat icons scaled by `STAT_MAX`. Call it as `renderLineup()`, never as a raw click handler, because the click event would be passed in as `i`.
- **Battle** `runBattle()`, an async loop over `S.T` (per-battle copies of the teams, with `cur`, `kos`, `out`, `next`).
  - Speed is a turn meter: the fighter with the lower `next` acts and adds `interval(a) = 1000/(spd+SPD_BASE)` to it. A fighter that comes in starts counting from the time of the knockout.
  - Damage is `POWER × atk × DEF_K/(DEF_K+def)`, minimum 1. With `S.dice` on, damage is multiplied by a random 0.85–1.0, and there's a 1/16 chance of a ×1.5 crit.
  - `sleep()` is scaled by `speed`. Cancellation uses `battleToken`: every `await` must be followed by `if(!alive())return;`, and `renderResult` increments the token.
- **Stars** are quintiles of `power()` across all biomes, so they adjust when the roster changes.
- The biome is set as `data-biome` on `<html>`. In `styles.css` this swaps the table color and pattern (paw prints or waves) and the card art colors `--art-sky`/`--art-ground`. The battle arena uses those same art colors.

The "¿Cómo se juega?" rules text in `js/screens/setup.js` describes these mechanics. Keep it in sync when they change.
