# UPICON Enterprise Independence Day WebAR — WOW Edition

Production-ready Three.js + MindAR WebAR package featuring:

- Curved saffron-to-white-to-green gradient exhibition wall
- UPICON logo at the upper-right above the greeting panel
- India Gate hero object on the left
- Centered floating leadership video panel
- Animated Indian flag, static Ashoka Chakra and subtle particles
- Background fighter-jet flyby with animated saffron, white and green smoke
- Clean stage composition without the removed decorative trails or premium light rings
- Drag to rotate, pinch to resize, double-tap/reset
- Landing UI with a non-repetitive CSS experience blueprint (the previous screenshot preview was removed)

## Required final step

Create `assets/card.mind` from `assets/card.png` using the MindAR Image Target Compiler, then place it in the `assets` folder. Camera-based image tracking cannot start without this compiled target file.

## Run locally

Use a local HTTPS server or deploy the folder to GitHub Pages, Netlify or Vercel. Camera access requires HTTPS (except localhost).


## Fighter-jet controls

The fighter jet is procedural, so no additional GLB file is required. Its position, scale and timing are controlled in `js/ar-scene.js` under `SCENE_LAYOUT.fighterJet`. All finalized 3D-model positions are preserved.
