# House 3D Demo

Interactive browser demo for a house design workflow: selectable structural layers,
exploded view, project specifications, and compact presentation controls.

## What is inside

- `index.html` - static entry point with local Three.js import map.
- `styles.css` - responsive interface and presentation layer.
- `app.js` - Three.js scene, raycasting, layers, exploded view, and presets.
- `vendor/three` - minimal vendored Three.js files used by the demo.

## Run locally

```bash
npx serve . -l 4173
```

Then open `http://localhost:4173`.

## GitHub Pages

This project is static. Push the folder to a repository and enable GitHub Pages
from the repository root.

## Attribution

The 3D renderer uses Three.js, MIT license. The demo geometry is custom procedural
geometry created for this project.
