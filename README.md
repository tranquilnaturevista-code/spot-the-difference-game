# Lantern Garden — Spot the Difference

[![Best Spot The Difference Game](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/tranquilnaturevista-code/spot-the-difference-game/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)
[![Reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/tranquilnaturevista-code/spot-the-difference-game/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451)

**Lantern Garden** is an original spot-the-difference game that plays offline
in a desktop browser from static files. Two pictures of the same garden at
dusk hang side by side — a cottage with a lit window, a cat on the fence, a
paper lantern, a pond with a frog, fireflies — and eight things are different
between them. Find them all before the clock runs you down.

## How to play

- Open `game/index.html` in desktop Chrome (or serve `game/` with
  `node serve.ts` and open http://localhost:8080). No network, no build step.
- **Mouse:** click a difference on either picture. A green ring marks it on
  both pictures.
- **Keyboard:** move the crosshair with the arrow keys (Shift moves faster),
  Tab jumps between the two pictures, Enter or Space checks the spot.
- **H** hints at one difference still unfound (−25 points), **P** pauses,
  **R** restarts, **Esc** goes back to the title screen.
- Each difference found scores 100 points; a wrong click costs 15. Finishing
  earns a time bonus against a 2-minute par. The best score is kept on the
  device.

## The eight differences

1. Moon phase — full on the left, crescent on the right
2. Missing apple — three apples on the tree, two on the right
3. Cottage window — lit with a cat silhouette, dark on the right
4. Lantern colour — warm yellow, red on the right
5. Cat on the fence — sitting there on the left, gone on the right
6. Butterfly — above the flowers on the left, gone on the right
7. Frog on the lily pad — on the left, gone on the right
8. Mushroom cap — red with white spots, plain brown on the right

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `/output/dossier.json` with the vendored library.
- `vendor/makefun-game.ts` — the kit's library, copied unchanged.
- `game/` — the playable game as static files: `index.html`, `style.css` and
  `src/` (`main.js` boot and loop, `scene.js` the garden painting,
  `differences.js` the eight differences, `state.js` score and timer,
  `input.js` mouse and keyboard, `render.js` panels, markers and overlays,
  `audio.js` synthesised sounds, `shots.js` the screenshot scenes).
- `screenshots/` — four real renders of the game's own code: mid-game with
  three differences found, the title screen, late game with six found, and
  the win screen with all eight found.
- `shots.json` — the `?shot=` scenes each screenshot was taken from.

Everything in the game is drawn with canvas paths or synthesised with
WebAudio — no image, font or sound file is loaded, and the game makes no
network request. Its idea, art, sounds and names are its own.
