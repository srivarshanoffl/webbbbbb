# Captain America: Safe Passage

A full-screen 2.5D escort game built with HTML, CSS, and vanilla JavaScript.

## Run

Open `index.html` in a modern browser. If the browser blocks local image loading, serve this folder using any static HTTP server.

## Controls

- Desktop: A/D or left/right arrows move Captain America with his attached shield. Drag the shield to reposition both together.
- Touch: use the left/right buttons or drag the shield; Captain America follows it.

There are three sections. The civilians advance after each section. At the break between Sections 2 and 3, one civilian falls; Continue opens the signal-bug screen, and Fix Now shows them get back up before the final escort. The group reaches the far edge before the completion scene. Incoming debris follows a visible path toward them. Dragging the attached shield repositions Captain America and his blocking point together. Centered shield impacts ricochet threats back; edge impacts deflect them off course. A missed hazard retries the current section. The bug-fix function is intentionally empty. The game has no timer, score, leaderboard, or popup window.

## Project files

- `index.html` — full-screen scene, HUD, touch controls, and in-scene states
- `styles.css` — comic treatment, environment, character presentation, responsive layout, and effects
- `game.js` — movement, pointer-based shield placement, path collision, deflection, checkpoint retry, and progression
- `assets/` — cinematic Captain America and civilian art, the generated falling debris obstacle, shield vector art, and city backdrop

See `assets/ASSET-CREDITS.txt` for asset sources and notes.
