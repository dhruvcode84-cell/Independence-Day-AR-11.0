# Interactive AR Controls

The AR scene now supports:

- One-finger horizontal drag: rotate the complete AR composition.
- Two-finger pinch: resize from 0.60x to 2.50x.
- Double tap: smoothly reset rotation and scale.
- Home/reset button: smoothly reset rotation and scale.
- Swipe inertia: rotation continues briefly after release.
- Idle auto-rotation: starts after five seconds without interaction.
- Gesture guidance: appears after target detection and fades after interaction.
- Optional haptic feedback on supported devices.

## Important architecture

MindAR controls `anchor.group`. User transformations are applied only to:

```
anchor.group
└── interactionGroup
    └── contentRoot
```

Do not move, rotate, or scale `anchor.group` directly.

## Deployment

Keep your working `assets/card.mind` file in the assets folder, then upload the full folder to GitHub Pages, Netlify, Vercel, or an HTTPS web server.
