# Adding a chapter

Each chapter is a folder in `chapters/<slug>/` with five small files. The shared engine in `/engine/` does everything else: renderer, stage, camera, glass UI, steps, quiz, progress, keyboard and low-fps fallback.

| File | What goes in it | Rules |
|---|---|---|
| `content.js` | slug, title, NCERT mapping, guiding question, **steps**, quiz | Only data. KaTeX `$…$` allowed in text. |
| `model.js` | the physics/maths as pure functions + `defaults` + `readouts()` | **No three.js.** Real SI numbers. `supportsReal=true` adds the Ideal/Real switch. |
| `world.js` | `build(lab)` → `{layers, shots, update, onStep, onParam, action, play}` | Use `engine/sketch.js` helpers so every chapter looks the same. |
| `console.js` | sliders, readouts, buttons, formula | Only data. |
| `index.html` | copy of the template; change `<title>` | – |

## Steps
```js
{id, title, question, action, expected, conclusion, ref?, math?,
 shot:'overview',     // camera shot name from world.shots
 set:{u:20},          // params applied on entering the step
 layers:['a','b'],    // which world.layers are visible (omit = all)
 mode:'real',         // only if model.supportsReal
 auto:'fire',         // world.action id run on entry
 focus:['u']}         // sliders to highlight
```
Aim for 5–8 steps: observe → isolate a variable → predict → measure → special case → real world.

## Shots
`{pos:[x,y,z], target:[x,y,z], fov, drift?, portrait?:{pos,target,fov}}`. Design for a landscape view; the rig auto-widens for phones (or give a `portrait` override). The scene floor is y = 0 and about 20 × 12 units are on paper.

## Stages
`paper`: drafting-table paper, ink-outline objects (default for physics). `graph`: graph-paper sheet with x/y/z axes (maths: functions, vectors, 3D geometry, conics, calculus). `night`: dark ground with bloom (energy, EM waves, optics glow).

## Sketch helpers (`engine/sketch.js`)
`ink(geo,{mat,hull})`, `fill(color,glow)`, `arrow(color,{text})` (call `a.set(from,vec)`, add `a.label` to a layer), `label(text)`, `line(color,{dashed})`, `trail(color,max)`, `hatch(w,h)`, `axes({size})`, `grid()`, `plot(f,{from,to})`, `canvasTex()`.

## Publish
1. `cp -r chapters/_template chapters/<slug>` and fill in the files.
2. Add or flip the `catalog.json` entry: `status:"live"`, `path:"chapters/<slug>/"`, `cover:"covers/<slug>.jpg"`, `steps:[…titles]`.
3. Serve locally (`python3 -m http.server`), open `/chapters/<slug>/` and check every step on a phone-size window. `window.__lab` exposes `go(i)`, `param(k,v)`, `snapshot()` for tests.
4. Make the cover: a 1280×800 screenshot saved as `covers/<slug>.jpg`.
5. Commit and push. GitHub Pages rebuilds in about a minute.
