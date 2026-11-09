# Stark Skies: Tunnel Run — Overdrive

A standalone, silent Canvas escape game split into HTML, CSS, and vanilla JavaScript. Iron Man is trapped in a damaged Stark flight tunnel; eight clean ring passes charge and unlock the distant exit. A sequence-loop bug jams the hatch and leads into the required in-world console repair. The tunnel and rear-facing Iron Man art are bundled locally; gameplay does not fetch external assets.

## Run

Open `index.html` in a modern browser. For local development, serve this folder with any static file server. No build step or runtime dependency is required.

## Controls and flow

- Use the keyboard flight controls and terminal commands described by the in-game HUD.
- The title and JARVIS opening explain the eight-pass escape objective. The far hatch remains visible, gains cyan-white charge after each clean pass, jams red after two corrupted visual gates, and opens into a bright exterior after the console repair.
- The first ring passes at 6 seconds; each next gate is scheduled 2 seconds later. A centered red-and-cyan tunnel image moves with camera sway, banking, and player-following parallax. Environmental light hoops cycle continuously from the vanishing point toward the camera, and both hand repulsors leave persistent blue trails.
- Progress advances only on a clean pass and reads `0/8` through `8/8`. A missed required ring schedules another attempt on the same cadence; retries continue until all eight counted passes are complete. Two corrupted gates follow as bug signals and never count toward the objective.
- The game remains silent and score-free.

See `assets/ASSET-CREDITS.txt` for image sources and terms. Browser preview and visual review are left to the user.
