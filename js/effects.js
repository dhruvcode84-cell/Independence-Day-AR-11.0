import * as THREE from "three";

export function createAnimatedFlag() {
  const flagWidth = 1.04;
  const flagHeight = 0.64;
  const poleHeight = 1.50;
  const poleTopClearance = 0.04;

  const geometry = new THREE.PlaneGeometry(flagWidth, flagHeight, 72, 32);

  const material = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    side: THREE.DoubleSide,
    transparent: true,
    vertexShader: `
      uniform float time;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        vec3 p = position;
        float freeEdge = smoothstep(0.0, 1.0, uv.x);

        p.z += sin(uv.x * 11.5 - time * 3.0) * 0.055 * freeEdge;
        p.z += sin(uv.x * 22.0 - time * 4.2) * 0.010 * freeEdge;
        p.y += sin(uv.x * 7.0 - time * 1.8) * 0.012 * freeEdge;

        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;

      float lineSegment(vec2 p, vec2 a, vec2 b, float width) {
        vec2 pa = p - a;
        vec2 ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return 1.0 - smoothstep(width, width + 0.0025, length(pa - ba * h));
      }

      void main() {
        vec3 saffronTop = vec3(1.0, 0.58, 0.06);
        vec3 saffronBottom = vec3(0.94, 0.32, 0.00);
        vec3 whiteTop = vec3(1.0, 1.0, 1.0);
        vec3 whiteBottom = vec3(0.88, 0.92, 0.94);
        vec3 greenTop = vec3(0.05, 0.60, 0.23);
        vec3 greenBottom = vec3(0.00, 0.34, 0.10);

        vec3 color;

        if (vUv.y > 0.666) {
          float band = (vUv.y - 0.666) / 0.334;
          color = mix(saffronBottom, saffronTop, band);
        } else if (vUv.y > 0.333) {
          float band = (vUv.y - 0.333) / 0.333;
          color = mix(whiteBottom, whiteTop, band);
        } else {
          float band = vUv.y / 0.333;
          color = mix(greenBottom, greenTop, band);
        }

        // Ashoka Chakra: outer ring, centre hub and 24 spokes.
        vec2 p = vUv - vec2(0.50, 0.50);
        p.x *= 1.79;

        float distanceFromCentre = length(p);
        vec3 navy = vec3(0.02, 0.12, 0.48);

        float ring = 1.0 - smoothstep(
          0.006,
          0.011,
          abs(distanceFromCentre - 0.102)
        );

        float hub = 1.0 - smoothstep(
          0.012,
          0.018,
          distanceFromCentre
        );

        float spokes = 0.0;

        for (int i = 0; i < 24; i++) {
          float angle = float(i) * 6.28318530718 / 24.0;
          vec2 endpoint = vec2(cos(angle), sin(angle)) * 0.094;
          spokes = max(
            spokes,
            lineSegment(p, vec2(0.0), endpoint, 0.0032)
          );
        }

        float chakraMask = max(max(ring, hub), spokes)
          * (1.0 - smoothstep(0.108, 0.116, distanceFromCentre));

        color = mix(color, navy, chakraMask);

        // Cloth shading and fold highlights.
        float folds = 0.87 + 0.13 * sin(vUv.x * 24.0);
        float highlight = 0.05 * sin(vUv.x * 48.0 + vUv.y * 5.0);
        color = color * folds + highlight;

        gl_FragColor = vec4(color, 1.0);
      }
    `
  });

  const group = new THREE.Group();

  // The cloth is shifted slightly right so its left edge meets the pole.
  const clothX = 0.18;
  const clothY = 0.20;

  const flag = new THREE.Mesh(geometry, material);
  flag.position.set(clothX, clothY, 0);
  flag.renderOrder = 2;

  const goldMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xd7a84d,
    metalness: 0.82,
    roughness: 0.20,
    clearcoat: 0.75,
    clearcoatRoughness: 0.16
  });

  // Align the pole exactly with the cloth's left edge.
  const poleX = clothX - flagWidth / 2 - 0.012;
  const flagTopY = clothY + flagHeight / 2;
  const poleTopY = flagTopY + poleTopClearance;
  const poleCentreY = poleTopY - poleHeight / 2;

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.022, poleHeight, 24),
    goldMaterial
  );
  pole.position.set(poleX, poleCentreY, -0.025);
  pole.castShadow = true;
  pole.receiveShadow = true;

  const finialRadius = 0.045;
  const finial = new THREE.Mesh(
    new THREE.SphereGeometry(finialRadius, 24, 24),
    goldMaterial
  );
  finial.position.set(
    poleX,
    poleTopY + finialRadius * 0.78,
    -0.02
  );
  finial.castShadow = true;

  // A small connector hides any visual gap between cloth and pole.
  const connector = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, flagHeight * 0.96, 0.018),
    goldMaterial
  );
  connector.position.set(
    poleX + 0.015,
    clothY,
    -0.018
  );

  group.add(flag, pole, connector, finial);
  group.userData.flagMaterial = material;
  group.userData.flagMesh = flag;
  group.userData.poleMesh = pole;
  group.userData.finialMesh = finial;

  return group;
}

export function createParticles() {
  const count = 130;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  const palette = [0xff8a00, 0xffffff, 0x20a653, 0x19b8bd].map((value) => new THREE.Color(value));

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 2.15;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 1.25;
    positions[i * 3 + 2] = 0.20 + Math.random() * 0.72;
    const color = palette[Math.floor(Math.random() * palette.length)];
    colors.set([color.r, color.g, color.b], i * 3);
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  return new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      size: 0.018,
      vertexColors: true,
      transparent: true,
      opacity: 0.78,
      depthWrite: false
    })
  );
}


/**
 * Creates a lightweight, procedural fighter jet and three smoke streams.
 * No external GLB is required, which keeps the WebAR payload small.
 * The model points along the local +X axis.
 */
export function createFighterJetFlyby() {
  const root = new THREE.Group();
  root.name = "fighterJetFlyby";

  const jet = new THREE.Group();
  jet.name = "fighterJet";

  const metal = new THREE.MeshPhysicalMaterial({
    color: 0x758694,
    metalness: 0.76,
    roughness: 0.28,
    clearcoat: 0.55,
    clearcoatRoughness: 0.18
  });
  const darkMetal = new THREE.MeshStandardMaterial({
    color: 0x24333e,
    metalness: 0.64,
    roughness: 0.34
  });
  const canopyMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x163b52,
    emissive: 0x071824,
    emissiveIntensity: 0.35,
    metalness: 0.25,
    roughness: 0.12,
    transparent: true,
    opacity: 0.92,
    clearcoat: 1
  });

  // Fuselage, nose and rear body.
  const fuselage = new THREE.Mesh(
    new THREE.CylinderGeometry(0.055, 0.082, 0.58, 18),
    metal
  );
  fuselage.rotation.z = -Math.PI / 2;
  fuselage.position.x = 0.02;

  const nose = new THREE.Mesh(
    new THREE.ConeGeometry(0.056, 0.22, 18),
    metal
  );
  nose.rotation.z = -Math.PI / 2;
  nose.position.x = 0.42;

  const exhaust = new THREE.Mesh(
    new THREE.CylinderGeometry(0.058, 0.072, 0.12, 18),
    darkMetal
  );
  exhaust.rotation.z = -Math.PI / 2;
  exhaust.position.x = -0.34;

  // Delta wings are intentionally simple for mobile performance.
  const wingShape = new THREE.Shape();
  wingShape.moveTo(-0.20, 0);
  wingShape.lineTo(0.12, 0.30);
  wingShape.lineTo(0.20, 0.05);
  wingShape.lineTo(0.08, 0);
  wingShape.closePath();
  const wingGeometry = new THREE.ShapeGeometry(wingShape);

  const leftWing = new THREE.Mesh(wingGeometry, metal);
  leftWing.rotation.x = Math.PI / 2;
  leftWing.position.set(-0.02, 0, 0.01);

  const rightWing = leftWing.clone();
  rightWing.scale.y = -1;

  const tailWingGeometry = new THREE.BoxGeometry(0.16, 0.014, 0.18);
  const tailWing = new THREE.Mesh(tailWingGeometry, metal);
  tailWing.position.set(-0.25, 0, 0.01);

  const fin = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.14, 0.018),
    metal
  );
  fin.position.set(-0.24, 0.075, 0);
  fin.rotation.z = -0.22;

  const canopy = new THREE.Mesh(
    new THREE.SphereGeometry(0.085, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2),
    canopyMaterial
  );
  canopy.scale.set(1.55, 0.62, 0.75);
  canopy.position.set(0.15, 0.055, 0);

  jet.add(fuselage, nose, exhaust, leftWing, rightWing, tailWing, fin, canopy);
  jet.traverse((object) => {
    if (object.isMesh) {
      object.castShadow = true;
      object.receiveShadow = true;
    }
  });

  const smoke = createJetSmokeStreams();
  smoke.position.set(-0.38, 0, 0);

  root.add(smoke, jet);
  root.userData.jet = jet;
  root.userData.smoke = smoke;
  root.userData.baseOpacity = 1;
  return root;
}

function createJetSmokeStreams() {
  const smokeRoot = new THREE.Group();
  smokeRoot.name = "fighterJetSmoke";

  const colors = [0xff7a00, 0xffffff, 0x138808];
  const verticalOffsets = [0.055, 0, -0.055];
  const count = 56;

  colors.forEach((color, streamIndex) => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const basePositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i += 1) {
      const progress = i / (count - 1);
      const x = -progress * 1.18;
      const y = verticalOffsets[streamIndex] + (Math.random() - 0.5) * 0.018;
      const z = (Math.random() - 0.5) * 0.025;
      positions.set([x, y, z], i * 3);
      basePositions.set([x, y, z], i * 3);
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const points = new THREE.Points(
      geometry,
      new THREE.PointsMaterial({
        color,
        size: streamIndex === 1 ? 0.040 : 0.044,
        sizeAttenuation: true,
        transparent: true,
        opacity: streamIndex === 1 ? 0.72 : 0.78,
        depthWrite: false,
        blending: THREE.NormalBlending
      })
    );

    points.userData.basePositions = basePositions;
    points.userData.streamIndex = streamIndex;
    smokeRoot.add(points);
  });

  return smokeRoot;
}

/**
 * Animates one repeating left-to-right background flyby.
 * layout.flight controls timing and range without affecting any other element.
 */
export function animateFighterJetFlyby(flyby, elapsedTime, layout) {
  if (!flyby || !layout) return;

  const flight = layout.flight ?? {};
  const startX = flight.startX ?? -1.28;
  const endX = flight.endX ?? 1.28;
  const duration = Math.max(flight.duration ?? 7.5, 0.1);
  const pause = Math.max(flight.pause ?? 2.5, 0);
  const cycleDuration = duration + pause;
  const cycleTime = elapsedTime % cycleDuration;
  const baseY = layout.position?.y ?? 0.48;
  const baseZ = layout.position?.z ?? -0.27;
  const verticalArc = flight.verticalArc ?? 0.07;

  if (cycleTime >= duration) {
    flyby.visible = false;
    return;
  }

  flyby.visible = true;
  const progress = cycleTime / duration;
  // Smooth start and finish, avoiding a mechanical constant-speed appearance.
  const eased = progress * progress * (3 - 2 * progress);

  flyby.position.x = THREE.MathUtils.lerp(startX, endX, eased);
  flyby.position.y = baseY + Math.sin(progress * Math.PI) * verticalArc;
  flyby.position.z = baseZ;

  const baseRotation = layout.rotation ?? {};
  flyby.rotation.x = THREE.MathUtils.degToRad(baseRotation.x ?? 0);
  flyby.rotation.y = THREE.MathUtils.degToRad(baseRotation.y ?? 0);
  flyby.rotation.z =
    THREE.MathUtils.degToRad(baseRotation.z ?? -4) +
    Math.sin(progress * Math.PI * 2) * 0.045;

  // Fade in/out near stage edges.
  const fadeIn = THREE.MathUtils.smoothstep(progress, 0.0, 0.10);
  const fadeOut = 1 - THREE.MathUtils.smoothstep(progress, 0.86, 1.0);
  const opacity = Math.min(fadeIn, fadeOut);

  const smoke = flyby.userData.smoke;
  if (smoke) {
    smoke.children.forEach((stream) => {
      const attribute = stream.geometry.attributes.position;
      const base = stream.userData.basePositions;
      const streamIndex = stream.userData.streamIndex ?? 0;

      for (let i = 0; i < attribute.count; i += 1) {
        const bx = base[i * 3];
        const by = base[i * 3 + 1];
        const bz = base[i * 3 + 2];
        const age = i / Math.max(attribute.count - 1, 1);

        attribute.setXYZ(
          i,
          bx - ((elapsedTime * 0.08 + age * 0.04) % 0.08),
          by + Math.sin(elapsedTime * 2.1 + i * 0.34 + streamIndex) * (0.006 + age * 0.012),
          bz + Math.cos(elapsedTime * 1.7 + i * 0.29) * age * 0.012
        );
      }
      attribute.needsUpdate = true;
      stream.material.opacity = opacity * (streamIndex === 1 ? 0.68 : 0.75);
    });
  }
}

export function createTricolorTrails() {
  const group = new THREE.Group();
  const colors = [0xff8a00, 0xffffff, 0x20a653];

  colors.forEach((color, index) => {
    const y = 0.30 - index * 0.075;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.22, y, 0.36),
      new THREE.Vector3(0.56, y + 0.10, 0.42),
      new THREE.Vector3(0.92, y + 0.19, 0.48)
    ]);

    const trail = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 42, 0.012, 8, false),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.80,
        depthWrite: false
      })
    );

    group.add(trail);
  });

  group.position.set(0.18, 0.15, 0.08);
  group.scale.setScalar(0.86);
  return group;
}
