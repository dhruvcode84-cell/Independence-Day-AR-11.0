import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { MindARThree } from "mindar-image-three";
import { CONFIG } from "./config.js";
import {
  createAnimatedFlag,
  createParticles,
  createFighterJetFlyby,
  animateFighterJetFlyby
} from "./effects.js";

const SCENE_LAYOUT = {
  contentRoot: {
    position: { x: 0, y: 0.04, z: 0.00 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1
  },
  contactShadow: {
    position: { x: 0, y: -0.32, z: 0.17 },
    rotation: { x: -90, y: 0, z: 0 },
    scale: { x: 1.5, y: 1.08, z: 1.5 }
  },
  gradientWall: {
    position: { x: 0, y: 0, z: -0.36 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1
  },
  stage: {
    position: { x: 0, y: -0.36, z: 0.13 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: { x: 1, y: 0.82, z: 1 }
  },
  stageAccents: {
    position: { x: 0, y: -0.32, z: 0.17 },
    rotation: { x: -90, y: 0, z: 0 },
    scale: { x: 1.9, y: 1.48, z: 1.9 }
  },
  // premiumLightRings: {
  //   position: { x: 0, y: 0, z: 0 },
  //   rotation: { x: -90, y: 0, z: 0 },
  //   scale: 1
  // },
  indiaGate: {
    position: { x: -0.34, y: -0.26, z: 0 },
    rotation: { x: 0, y: 185, z: 2 },
    scale: 1
  },
  flag: {
    position: { x: -0.40, y: 0.40, z: -0.17 },
    rotation: { x: 0, y: 2.3, z: 0 },
    scale: 0.7
  },
  videoPanel: {
    position: { x: 0.08, y: 0.12, z: 0.27 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1.02
  },
  greetingPanel: {
    position: { x: 0.62, y: 0.05, z: -0.24 },
    rotation: { x: 0, y: -5.7, z: 0 },
    scale: 0.92
  },
  chakra: {
    position: { x: 0, y: 0, z: -0.36 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1.5
  },
  wallLogo: {
    position: { x: 0.68, y: 0.50, z: 0.1 },
    rotation: { x: 0, y: -5.7, z: 0 },
    scale: 1
  },
  // trails: {
  //   position: { x: -0.08, y: -0.05, z: 0.14 },
  //   rotation: { x: 0, y: 0, z: 0 },
  //   scale: 0.92
  // },
  fighterJet: {
    // Background flyby. Existing model positions above remain unchanged.
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
  },
  particles: {
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    scale: 1
  }
};

function applyLayout(object, layout) {
  if (!object || !layout) return;

  const position = layout.position ?? {};
  object.position.set(
    position.x ?? 0,
    position.y ?? 0,
    position.z ?? 0
  );

  const rotation = layout.rotation ?? {};
  object.rotation.set(
    THREE.MathUtils.degToRad(rotation.x ?? 0),
    THREE.MathUtils.degToRad(rotation.y ?? 0),
    THREE.MathUtils.degToRad(rotation.z ?? 0)
  );

  const scale = layout.scale ?? 1;
  if (typeof scale === "number") {
    object.scale.setScalar(scale);
  } else {
    object.scale.set(
      scale.x ?? 1,
      scale.y ?? 1,
      scale.z ?? 1
    );
  }
}

function canvasTexture(width, height, draw) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Unable to create canvas context.");
  draw(context, width, height);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

function roundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, radius);
    return;
  }
  const r = Math.min(radius, width / 2, height / 2);
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function createGreetingPanel() {
  const texture = canvasTexture(900, 1120, (ctx, width, height) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "rgba(5,23,36,.98)");
    gradient.addColorStop(1, "rgba(1,9,16,.96)");
    ctx.fillStyle = gradient;
    roundedRect(ctx, 10, 10, width - 20, height - 20, 54);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,151,36,.88)";
    ctx.lineWidth = 8;
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ff8a00";
    ctx.font = "900 78px Arial";
    ctx.fillText("HAPPY", width / 2, 145);
    ctx.fillStyle = "#ffffff";
    ctx.font = "900 72px Arial";
    ctx.fillText("INDEPENDENCE", width / 2, 260);
    ctx.fillStyle = "#31b55b";
    ctx.font = "900 88px Arial";
    ctx.fillText("DAY!", width / 2, 375);
    ctx.strokeStyle = "rgba(255,255,255,.25)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(120, 450);
    ctx.lineTo(780, 450);
    ctx.stroke();
    ctx.fillStyle = "#dce8ee";
    ctx.font = "500 43px Arial";
    ["Freedom in mind,", "Faith in our words,", "Pride in our hearts,", "Memories in our souls."].forEach((line, index) => {
      ctx.fillText(line, width / 2, 565 + index * 72);
    });
    ctx.fillStyle = "#ff8a00";
    ctx.font = "900 68px Arial";
    ctx.fillText("JAI HIND!", width / 2, 980);
  });

  const panel = new THREE.Mesh(
    new THREE.PlaneGeometry(0.48, 0.60),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      side: THREE.DoubleSide,
      toneMapped: false
    })
  );
  return panel;
}

function createVideoPanel(video) {
  const group = new THREE.Group();
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(0.76, 0.45, 0.045),
    new THREE.MeshPhysicalMaterial({
      color: 0x06141e,
      metalness: 0.50,
      roughness: 0.18,
      clearcoat: 1,
      clearcoatRoughness: 0.12
    })
  );

  const glow = new THREE.Mesh(
    new THREE.PlaneGeometry(0.80, 0.49),
    new THREE.MeshBasicMaterial({
      color: 0x21b8c3,
      transparent: true,
      opacity: 0.16,
      depthWrite: false
    })
  );
  glow.position.z = -0.026;

  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.colorSpace = THREE.SRGBColorSpace;
  videoTexture.minFilter = THREE.LinearFilter;
  videoTexture.magFilter = THREE.LinearFilter;
  videoTexture.generateMipmaps = false;

  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.70, 0.39),
    new THREE.MeshBasicMaterial({
      map: videoTexture,
      side: THREE.DoubleSide,
      toneMapped: false
    })
  );
  screen.position.z = 0.026;

  group.add(glow, frame, screen);
  group.userData.screen = screen;
  return group;
}

function replaceMeshMaterial(root, resolver) {
  root.traverse((object) => {
    if (!object.isMesh) return;
    const material = resolver(object);
    if (material) {
      object.material = material;
      object.material.needsUpdate = true;
    }
    object.castShadow = true;
    object.receiveShadow = true;
    if (object.geometry) object.geometry.computeVertexNormals();
  });
}

function styleStage(stage) {
  const palette = [
    new THREE.MeshPhysicalMaterial({ color: 0x06131c, metalness: 0.62, roughness: 0.24, clearcoat: 0.90 }),
    new THREE.MeshPhysicalMaterial({ color: 0x0c2a35, metalness: 0.48, roughness: 0.28, clearcoat: 0.78 }),
    new THREE.MeshPhysicalMaterial({ color: 0x174653, metalness: 0.38, roughness: 0.30, clearcoat: 0.72 })
  ];
  let index = 0;
  replaceMeshMaterial(stage, () => palette[Math.min(index++, palette.length - 1)]);
}

function styleIndiaGate(gate) {
  const sandstoneMain = new THREE.MeshStandardMaterial({ color: 0xc88b4a, roughness: 0.67, metalness: 0.03 });
  const sandstoneLight = new THREE.MeshStandardMaterial({ color: 0xe3b675, roughness: 0.60, metalness: 0.02 });
  const sandstoneDark = new THREE.MeshStandardMaterial({ color: 0x985a31, roughness: 0.77, metalness: 0.02 });
  let index = 0;
  replaceMeshMaterial(gate, (mesh) => {
    const name = mesh.name.toLowerCase();
    if (name.includes("step") || name.includes("base")) return sandstoneDark;
    if (name.includes("arch") || name.includes("cap") || name.includes("top")) return sandstoneLight;
    const fallback = [sandstoneMain, sandstoneLight, sandstoneMain, sandstoneDark];
    return fallback[index++ % fallback.length];
  });
}

function styleChakra(chakra) {
  const blue = new THREE.MeshPhysicalMaterial({
    color: 0x063d9b,
    emissive: 0x020c27,
    emissiveIntensity: 0.18,
    metalness: 0.52,
    roughness: 0.22,
    clearcoat: 0.95,
    clearcoatRoughness: 0.12,
    side: THREE.DoubleSide
  });
  replaceMeshMaterial(chakra, () => blue.clone());
}

function loadModel(loader, url) {
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => resolve(gltf.scene), undefined, reject);
  });
}

function normalizeModel(model, { rotation, targetSize, axis = "height" }) {
  model.rotation.set(rotation.x, rotation.y, rotation.z);
  model.updateMatrixWorld(true);

  let box = new THREE.Box3().setFromObject(model);
  const size = box.getSize(new THREE.Vector3());
  const current = axis === "width" ? size.x : axis === "depth" ? size.z : size.y;
  const scale = current > 0 ? targetSize / current : 1;
  model.scale.multiplyScalar(scale);
  model.updateMatrixWorld(true);

  box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  const minimum = box.min.clone();
  model.position.x -= center.x;
  model.position.z -= center.z;
  model.position.y -= minimum.y;
  return model;
}

function createStageAccents() {
  const group = new THREE.Group();
  const settings = [
    { inner: 0.68, outer: 0.72, color: 0xff8a00, y: 0 },
    { inner: 0.61, outer: 0.65, color: 0xffffff, y: 0.002 },
    { inner: 0.54, outer: 0.58, color: 0x169447, y: 0.004 }
  ];

  settings.forEach(({ inner, outer, color, y }) => {
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(inner, outer, 96),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.90,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: false
      })
    );
    ring.position.z = y;
    group.add(ring);
  });

  return group;
}


function createCurvedGradientWall(logoUrl) {
  const group = new THREE.Group();
  const width = 2.05;
  const height = 1.08;
  const geometry = new THREE.PlaneGeometry(width, height, 64, 24);
  const position = geometry.attributes.position;
  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const normalized = x / (width * 0.5);
    // Positive Z bends the wall toward the viewer without rotating the group.
    // This preserves the saffron-to-green gradient and keeps the logo readable.
    position.setZ(i, 0.16 * normalized * normalized);
  }
  geometry.computeVertexNormals();

  const material = new THREE.ShaderMaterial({
    side: THREE.DoubleSide,
    transparent: true,
    uniforms: { opacity: { value: 0.96 } },
    vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `
      varying vec2 vUv; uniform float opacity;
      float ring(vec2 p,float r,float w){return 1.0-smoothstep(w,w+0.006,abs(length(p)-r));}
      void main(){
        vec3 saffron=vec3(1.0,.39,.035); vec3 cream=vec3(1.0,.91,.72); vec3 green=vec3(.02,.46,.16);
        vec3 col=mix(saffron,cream,smoothstep(.05,.48,vUv.x));
        col=mix(col,green,smoothstep(.54,.98,vUv.x));
        float vignette=1.0-.34*length(vUv-.5);
        float pattern=ring((vUv-vec2(.50,.50))*vec2(1.65,1.0),.18,.004);
        col += vec3(.45,.30,.10)*pattern*.15;
        gl_FragColor=vec4(col*vignette,opacity);
      }`
  });
  const wall = new THREE.Mesh(geometry, material);
  wall.position.set(0, 0.16, -0.04);
  wall.receiveShadow = true;
  group.add(wall);

  // const edgeMaterial = new THREE.MeshBasicMaterial({color:0xffd28a,transparent:true,opacity:.80,toneMapped:false});
  // const topEdge = new THREE.Mesh(new THREE.BoxGeometry(2.02,.018,.025), edgeMaterial);
  // topEdge.position.set(0,.70,.05);
  // group.add(topEdge);

  const texture = new THREE.TextureLoader().load(logoUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(.48,.16), new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false,depthWrite:false}));
  applyLayout(logo, SCENE_LAYOUT.wallLogo);
  group.add(logo);
  return group;
}

function createPremiumLightRings() {
  const group = new THREE.Group();
  const colors=[0xff7900,0xffffff,0x14c85a];
  colors.forEach((color,index)=>{
    const curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(-.88,-.28,.30+index*.014),
      new THREE.Vector3(-.25,-.34,.42+index*.014),
      new THREE.Vector3(.35,-.34,.43+index*.014),
      new THREE.Vector3(.90,-.27,.31+index*.014)
    ]);
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,64,.012,8,false),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.92,toneMapped:false,depthWrite:false}));
    group.add(mesh);
  });
  return group;
}
export class ARExperience {
  constructor({ container, video, onStatus, onTargetFound, onTargetLost }) {
    this.container = container;
    this.video = video;
    this.onStatus = onStatus;
    this.onTargetFound = onTargetFound;
    this.onTargetLost = onTargetLost;
    this.mindar = null;
    this.interactionGroup = null;
    this.contentRoot = null;
    this.flagMaterial = null;
    this.chakra = null;
    this.particles = null;
    this.fighterJet = null;
    this.targetVisible = false;

    // User interaction state.
    this.interactionElement = null;
    this.activePointers = new Map();
    this.gestureMode = null;
    this.lastPointerX = 0;
    this.lastPointerTime = 0;
    this.previousPinchDistance = 0;
    this.lastTapTime = 0;
    this.rotationTarget = 0;
    this.rotationCurrent = 0;
    this.rotationVelocity = 0;
    this.scaleTarget = 1;
    this.scaleCurrent = 1;
    this.resetting = false;
    this.lastInteractionTime = performance.now();
    this.onInteraction = null;
    this.boundHandlers = null;
  }

  async targetExists() {
    try {
      return (await fetch(CONFIG.targetFile, { method: "HEAD", cache: "no-store" })).ok;
    } catch {
      return false;
    }
  }

  async start() {
    if (!(await this.targetExists())) throw new Error("card.mind is missing");

    this.mindar = new MindARThree({
      container: this.container,
      imageTargetSrc: CONFIG.targetFile,
      maxTrack: 1,
      filterMinCF: 0.001,
      filterBeta: 0.01,
      uiLoading: "yes",
      uiScanning: "no",
      uiError: "yes"
    });

    const { renderer, scene, camera } = this.mindar;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    scene.add(new THREE.HemisphereLight(0xeaf6ff, 0x150e09, 2.15));
    const key = new THREE.DirectionalLight(0xffd4a4, 4.0);
    key.position.set(1.8, 2.6, 3.0);
    key.castShadow = true;
    scene.add(key);
    const rim = new THREE.DirectionalLight(0x35c2cd, 1.8);
    rim.position.set(-2.0, 1.2, 1.8);
    scene.add(rim);
    const fill = new THREE.DirectionalLight(0xffffff, 1.1);
    fill.position.set(0, 0.4, 3.0);
    scene.add(fill);

    const anchor = this.mindar.addAnchor(0);

    // MindAR owns anchor.group transforms. Never rotate or scale it directly.
    // interactionGroup receives all user rotation and zoom gestures.
    this.interactionGroup = new THREE.Group();
    this.interactionGroup.visible = false;
    anchor.group.add(this.interactionGroup);

    // contentRoot retains the cinematic entrance and floating animation.
    this.contentRoot = new THREE.Group();
    applyLayout(this.contentRoot, SCENE_LAYOUT.contentRoot);
    this.interactionGroup.add(this.contentRoot);

    const contactShadow = new THREE.Mesh(
      new THREE.CircleGeometry(0.94, 96),
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.22,
        depthWrite: false,
        side: THREE.DoubleSide
      })
    );
    applyLayout(contactShadow, SCENE_LAYOUT.contactShadow);
    contactShadow.renderOrder = -1;
    this.contentRoot.add(contactShadow);

    const gradientWall = createCurvedGradientWall(CONFIG.wallLogo);
    applyLayout(gradientWall, SCENE_LAYOUT.gradientWall);
    this.contentRoot.add(gradientWall);

    const loader = new GLTFLoader();
    const [stageModel, gateModel, chakraModel] = await Promise.all([
      loadModel(loader, CONFIG.models.stage),
      loadModel(loader, CONFIG.models.indiaGate),
      loadModel(loader, CONFIG.models.chakra)
    ]);

    // Stage: flat, centred and visually secondary.
    styleStage(stageModel);
    const stage = new THREE.Group();
    stage.add(normalizeModel(stageModel, {
      rotation: new THREE.Euler(-Math.PI / 2, 0, 0),
      targetSize: 1.48,
      axis: "width"
    }));
    applyLayout(stage, SCENE_LAYOUT.stage);

    const stageAccents = createStageAccents();
    applyLayout(stageAccents, SCENE_LAYOUT.stageAccents);

    // Premium light rings intentionally removed for a cleaner final composition.
    this.contentRoot.add(stage, stageAccents);

    // India Gate: upright focal object, left of centre.
    styleIndiaGate(gateModel);
    const gate = new THREE.Group();
    gate.add(normalizeModel(gateModel, {
      rotation: new THREE.Euler(-Math.PI / 2, 0.04, 0),
      targetSize: 0.66,
      axis: "height"
    }));
    applyLayout(gate, SCENE_LAYOUT.indiaGate);
    this.contentRoot.add(gate);

    // Independent Chakra: clear, blue and in front of the stage.
    styleChakra(chakraModel);
    const chakra = new THREE.Group();
    chakra.add(normalizeModel(chakraModel, {
      rotation: new THREE.Euler(0, 0, 0),
      targetSize: 0.22,
      axis: "width"
    }));
    applyLayout(chakra, SCENE_LAYOUT.chakra);
    this.chakra = chakra;
    this.contentRoot.add(chakra);

    // Flag behind the monument, with shader-rendered 24-spoke Chakra.
    const flag = createAnimatedFlag();
    applyLayout(flag, SCENE_LAYOUT.flag);
    this.flagMaterial = flag.userData.flagMaterial;

    const videoPanel = createVideoPanel(this.video);
    const greetingPanel = createGreetingPanel();
    const particles = createParticles();

    applyLayout(videoPanel, SCENE_LAYOUT.videoPanel);
    applyLayout(greetingPanel, SCENE_LAYOUT.greetingPanel);
    applyLayout(particles, SCENE_LAYOUT.particles);

    this.particles = particles;

    // Lightweight procedural fighter jet with tricolour smoke.
    // It is added as a separate background object and does not alter any
    // finalized positions of the stage, wall, flag, India Gate, video,
    // greeting panel, Chakra or logo.
    const fighterJet = createFighterJetFlyby();
    applyLayout(fighterJet, SCENE_LAYOUT.fighterJet);
    this.fighterJet = fighterJet;

    this.contentRoot.add(
      fighterJet,
      flag,
      videoPanel,
      greetingPanel,
      particles
    );

    anchor.onTargetFound = async () => {
      this.targetVisible = true;
      this.interactionGroup.visible = true;
      this.contentRoot.scale.setScalar(0.025);
      this.onStatus?.("Card detected • Experience active");
      this.onTargetFound?.();
      this.video.muted = true;
      try {
        await this.video.play();
      } catch {
        // Mobile browsers may require a user gesture.
      }
    };

    anchor.onTargetLost = () => {
      this.targetVisible = false;
      this.interactionGroup.visible = false;
      this.video.pause();
      this.onStatus?.("Point your camera at the UPICON greeting card");
      this.onTargetLost?.();
    };

    await this.mindar.start();
    this.onStatus?.("Point your camera at the UPICON greeting card");

    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      const time = clock.getElapsedTime();

      if (this.flagMaterial) this.flagMaterial.uniforms.time.value = time;
      // if (this.chakra) {
      //   this.chakra.rotation.z =
      //     THREE.MathUtils.degToRad(SCENE_LAYOUT.chakra.rotation.z) + time * 0.42;
      // }

      if (this.chakra) {
  this.chakra.rotation.z = THREE.MathUtils.degToRad(
    SCENE_LAYOUT.chakra.rotation.z
  );
}
      if (this.particles) {
        this.particles.rotation.z = Math.sin(time * 0.24) * 0.06;
        this.particles.position.y =
          SCENE_LAYOUT.particles.position.y + Math.sin(time * 0.72) * 0.018;
      }

      if (this.fighterJet) {
        animateFighterJetFlyby(
          this.fighterJet,
          time,
          SCENE_LAYOUT.fighterJet
        );
      }

      if (this.targetVisible && this.contentRoot) {
        const entranceScale = THREE.MathUtils.lerp(this.contentRoot.scale.x, 1, 0.105);
        this.contentRoot.scale.setScalar(entranceScale);
        this.contentRoot.position.y =
          SCENE_LAYOUT.contentRoot.position.y + Math.sin(time * 0.82) * 0.004;
        this.contentRoot.rotation.z = Math.sin(time * 0.50) * 0.003;
      }

      this.updateInteraction(time);
      renderer.render(scene, camera);
    });
  }

  attachInteractions(element, { onInteraction } = {}) {
    this.detachInteractions();
    if (!element) return;

    this.interactionElement = element;
    this.onInteraction = onInteraction;
    element.style.touchAction = "none";

    const pointerDown = (event) => {
      if (!this.targetVisible) return;
      event.preventDefault();
      element.setPointerCapture?.(event.pointerId);
      this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.lastInteractionTime = performance.now();
      this.resetting = false;
      this.onInteraction?.();

      if (this.activePointers.size === 1) {
        const now = performance.now();
        if (now - this.lastTapTime < 320) {
          this.resetView(true);
          this.lastTapTime = 0;
          navigator.vibrate?.(18);
          return;
        }
        this.lastTapTime = now;
        this.gestureMode = "rotate";
        this.lastPointerX = event.clientX;
        this.lastPointerTime = now;
        this.rotationVelocity = 0;
      } else if (this.activePointers.size === 2) {
        this.gestureMode = "pinch";
        this.previousPinchDistance = this.getPinchDistance();
        this.rotationVelocity = 0;
      }
    };

    const pointerMove = (event) => {
      if (!this.targetVisible || !this.activePointers.has(event.pointerId)) return;
      event.preventDefault();
      this.activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
      this.lastInteractionTime = performance.now();
      this.onInteraction?.();

      if (this.activePointers.size === 1 && this.gestureMode === "rotate") {
        const now = performance.now();
        const deltaX = event.clientX - this.lastPointerX;
        const deltaTime = Math.max(now - this.lastPointerTime, 8);
        const rotationDelta = deltaX * 0.008;
        this.rotationTarget += rotationDelta;
        this.rotationVelocity = THREE.MathUtils.clamp(
          rotationDelta / (deltaTime / 16.67),
          -0.12,
          0.12
        );
        this.lastPointerX = event.clientX;
        this.lastPointerTime = now;
      } else if (this.activePointers.size === 2) {
        this.gestureMode = "pinch";
        const distance = this.getPinchDistance();
        if (this.previousPinchDistance > 0) {
          const factor = distance / this.previousPinchDistance;
          this.scaleTarget = THREE.MathUtils.clamp(
            this.scaleTarget * factor,
            0.60,
            2.50
          );
        }
        this.previousPinchDistance = distance;
      }
    };

    const pointerUp = (event) => {
      if (this.activePointers.has(event.pointerId)) {
        this.activePointers.delete(event.pointerId);
      }
      element.releasePointerCapture?.(event.pointerId);
      this.lastInteractionTime = performance.now();

      if (this.activePointers.size === 1) {
        const remaining = [...this.activePointers.values()][0];
        this.gestureMode = "rotate";
        this.lastPointerX = remaining.x;
        this.lastPointerTime = performance.now();
        this.previousPinchDistance = 0;
      } else if (this.activePointers.size === 0) {
        this.gestureMode = null;
        this.previousPinchDistance = 0;
      }
    };

    const contextMenu = (event) => event.preventDefault();
    this.boundHandlers = { pointerDown, pointerMove, pointerUp, contextMenu };
    element.addEventListener("pointerdown", pointerDown, { passive: false });
    element.addEventListener("pointermove", pointerMove, { passive: false });
    element.addEventListener("pointerup", pointerUp, { passive: false });
    element.addEventListener("pointercancel", pointerUp, { passive: false });
    element.addEventListener("contextmenu", contextMenu);
  }

  detachInteractions() {
    const element = this.interactionElement;
    const handlers = this.boundHandlers;
    if (element && handlers) {
      element.removeEventListener("pointerdown", handlers.pointerDown);
      element.removeEventListener("pointermove", handlers.pointerMove);
      element.removeEventListener("pointerup", handlers.pointerUp);
      element.removeEventListener("pointercancel", handlers.pointerUp);
      element.removeEventListener("contextmenu", handlers.contextMenu);
    }
    this.activePointers.clear();
    this.interactionElement = null;
    this.boundHandlers = null;
  }

  getPinchDistance() {
    const points = [...this.activePointers.values()];
    if (points.length < 2) return 0;
    return Math.hypot(points[1].x - points[0].x, points[1].y - points[0].y);
  }

  resetView(withHaptic = false) {
    this.rotationTarget = 0;
    this.scaleTarget = 1;
    this.rotationVelocity = 0;
    this.resetting = true;
    this.lastInteractionTime = performance.now();
    if (withHaptic) navigator.vibrate?.(18);
  }

  updateInteraction() {
    if (!this.interactionGroup) return;

    const isTouching = this.activePointers.size > 0;
    const idleFor = performance.now() - this.lastInteractionTime;

    // Preserve gentle momentum after a horizontal swipe.
    if (!isTouching && Math.abs(this.rotationVelocity) > 0.00008) {
      this.rotationTarget += this.rotationVelocity;
      this.rotationVelocity *= 0.925;
    }

    // Museum-style idle rotation begins after five seconds without input.
    if (!isTouching && !this.resetting && idleFor > 5000) {
      this.rotationTarget += 0.0017;
    }

    this.rotationCurrent = THREE.MathUtils.lerp(
      this.rotationCurrent,
      this.rotationTarget,
      this.resetting ? 0.14 : 0.18
    );
    this.scaleCurrent = THREE.MathUtils.lerp(
      this.scaleCurrent,
      this.scaleTarget,
      this.resetting ? 0.14 : 0.18
    );

    this.interactionGroup.rotation.y = this.rotationCurrent;
    this.interactionGroup.scale.setScalar(this.scaleCurrent);

    if (
      this.resetting &&
      Math.abs(this.rotationCurrent) < 0.002 &&
      Math.abs(this.scaleCurrent - 1) < 0.002
    ) {
      this.rotationCurrent = 0;
      this.rotationTarget = 0;
      this.scaleCurrent = 1;
      this.scaleTarget = 1;
      this.interactionGroup.rotation.y = 0;
      this.interactionGroup.scale.setScalar(1);
      this.resetting = false;
    }
  }

  async stop() {
    this.targetVisible = false;
    this.video?.pause();
    if (this.mindar) {
      this.mindar.renderer.setAnimationLoop(null);
      await this.mindar.stop();
    }
    this.mindar = null;
    this.interactionGroup = null;
    this.contentRoot = null;
    this.flagMaterial = null;
    this.chakra = null;
    this.particles = null;
    this.fighterJet = null;
  }
}
