# Fighter Jet Background Update

This build preserves the finalized positions of the existing AR elements.

## Added

- Procedural low-poly fighter jet; no external GLB required.
- Repeating left-to-right background flyby.
- Animated saffron, white and green smoke streams.
- Fade-in and fade-out at the edges of the AR composition.
- Centralized flight controls under `SCENE_LAYOUT.fighterJet` in `js/ar-scene.js`.

## Preserved

- Stage position
- Gradient wall and UPICON logo
- India Gate position
- Flag position and cloth animation
- Video panel position
- Greeting panel position
- Static 3D Ashoka Chakra
- Particles
- Free rotation, inertia, pinch zoom and reset controls

## Adjust the jet

Open `js/ar-scene.js` and edit:

```js
fighterJet: {
  position: { x: -1.28, y: 0.48, z: -0.27 },
  rotation: { x: 0, y: 0, z: -4 },
  scale: 0.34,
  flight: {
    startX: -1.28,
    endX: 1.28,
    duration: 7.5,
    pause: 2.5,
    verticalArc: 0.07
  }
}
```

- Increase `y` to fly higher.
- Decrease `z` to move farther behind.
- Change `scale` to resize.
- Increase `duration` to slow the flight.
- Increase `pause` to wait longer between flybys.
