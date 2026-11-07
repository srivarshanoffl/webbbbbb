# Black Widow: Dead Frequency

A standalone full-screen covert story puzzle built with HTML, CSS, and vanilla JavaScript. Open `index.html` directly in a modern desktop browser. Black Widow enters a photographic steel vault, memorizes a field note, opens the frequency locks, steals an encrypted archive drive, and runs for extraction. The story now tracks three chapters, uses camera pushes to focus the reveal and lock work, adds subtle mouse parallax to the set lighting, animates the note disappearing at the end of its four-second reveal, and releases the vault locks in sequence before the wheel turns. Security mistakes trigger a short scene hit and a red scan sweep. A forward walking pose and a calm relay stance carry the character between beats. There is no build step, external runtime dependency, sound, game timer, or scoring system.

## Play

Begin the operation and memorize the three whole-number frequencies shown on the recovered paper. It disappears after four seconds. Tune each frequency in its own full-screen round: a rotary dial, a draggable signal graph, then three mechanical number wheels. Release each lock to advance. A wrong number triggers a security reset with a new code and another short reveal. Clear all three rounds to open the vault, steal the exposed Archive 07 drive, continue past the in-world signal interruption, and finish the escape. The **FIX NOW** button is deliberately inert.

Use mouse input on the sliders or keyboard arrows while a slider is focused. Tab changes controls; Enter on a slider submits the current tuning. **Reset** returns to the opening scene.

## Files

- `index.html` — full-screen scene, story states, sliders, interruption, and ending.
- `styles.css` — photo grading, cinematic vault staging, control styling, and transitions.
- `game.js` — code generation, timed reveal, tuning validation, reset, bug, and escape states.
- `assets/` — the locally bundled vault photograph, two Black Widow poses, and the original vector architecture overlay. Downloaded comparison candidates are kept in `assets/candidates/` and are not referenced by the game.

See [`assets/ASSET-CREDITS.txt`](assets/ASSET-CREDITS.txt) for asset source details and stated terms.
