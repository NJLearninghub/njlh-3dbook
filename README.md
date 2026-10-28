# NJ Learning Hub · 3D Physics & Maths Book

Interactive 3D labs for NCERT Class 11–12 Physics and Maths, by **Nihal Jani** (NJ Learning Hub, Ahmedabad).
Live: https://njlearninghub.github.io/njlh-3dbook/

- `index.html`: the landing page, built at runtime from `catalog.json` (filters, covers, progress badges).
- `catalog.json`: every NCERT chapter (rationalised books). `status: live | soon`.
- `engine/`: shared engine (three.js 0.160 via import map, no build step). Includes `core.js`, `camera.js`, `stages.js`, `sketch.js`, `ui.js`, `progress.js` and `theme.css`.
- `chapters/<slug>/`: one folder per lab, holding `content.js`, `model.js`, `world.js`, `console.js` and `index.html`. Start from `chapters/_template/`.
- `two-hearts/`: legacy single-file lab (petrol vs electric car), still live.
- `projectile-circular/`: redirects to the new chapters.

To add a chapter, see [docs/ADDING_A_CHAPTER.md](docs/ADDING_A_CHAPTER.md).
Run locally with `python3 -m http.server 8000`, then open http://localhost:8000/.

© NJ Learning Hub. All rights reserved.
