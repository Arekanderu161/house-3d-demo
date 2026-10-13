import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

const canvas = document.querySelector("#house-canvas");
const layerControls = document.querySelector("#layer-controls");
const explodeRange = document.querySelector("#explode-range");
const explodeOutput = document.querySelector("#explode-output");
const partLayer = document.querySelector("#part-layer");
const partTitle = document.querySelector("#part-title");
const partCopy = document.querySelector("#part-copy");
const partSpecs = document.querySelector("#part-specs");
const fitButton = document.querySelector("#fit-view");
const autoButton = document.querySelector("#toggle-auto");
const showAllButton = document.querySelector("#show-all");
const stage = document.querySelector(".stage");
const viewButtons = document.querySelectorAll("[data-view]");

const layers = [
  { id: "structure", label: "Коробка", color: 0xd9d4c8 },
  { id: "roof", label: "Крыша", color: 0x9e4730 },
  { id: "openings", label: "Окна", color: 0x2e8fbe },
  { id: "engineering", label: "Инженерия", color: 0x0f8b8d },
  { id: "site", label: "Участок", color: 0x6a8d73 },
];

const partData = [
  {
    id: "foundation",
    title: "Монолитная плита",
    layer: "structure",
    copy: "Основание вынесено отдельным слоем, чтобы быстро показать пятно застройки и привязку к участку.",
    size: [6.8, 0.32, 5.2],
    position: [0, 0.16, 0],
    explode: [0, -1.1, 0],
    color: 0xbfc4bd,
    specs: { Материал: "Ж/б", Размер: "6.8 x 5.2 м", Стадия: "КЖ" },
  },
  {
    id: "ground-floor",
    title: "Первый этаж",
    layer: "structure",
    copy: "Несущие стены и основной объем дома выделены как отдельная часть для согласования планировки.",
    size: [5.7, 1.65, 4.05],
    position: [-0.25, 1.14, 0],
    explode: [-1.2, 0.1, 0],
    color: 0xe0ded4,
    specs: { Площадь: "82 м²", Высота: "3.1 м", Стадия: "АР" },
  },
  {
    id: "second-floor",
    title: "Второй этаж",
    layer: "structure",
    copy: "Верхний объем можно разнести от первого этажа, чтобы показать поэтажную структуру проекта.",
    size: [4.95, 1.45, 3.65],
    position: [-0.52, 2.72, -0.12],
    explode: [-2.0, 0.85, -0.3],
    color: 0xebe8df,
    specs: { Площадь: "76 м²", Комнаты: "3", Стадия: "АР" },
  },
  {
    id: "garage",
    title: "Гараж",
    layer: "structure",
    copy: "Пристройка показывает, как можно проверять дополнительные объемы до выпуска рабочих чертежей.",
    size: [2.35, 1.35, 2.7],
    position: [3.35, 0.98, 0.64],
    explode: [2.2, 0.2, 0.55],
    color: 0xd2d6cf,
    specs: { Машиномест: "1", Ворота: "2.4 м", Узел: "Примыкание" },
  },
  {
    id: "roof-main",
    title: "Скатная крыша",
    layer: "roof",
    copy: "Кровля отделяется от коробки как монтажный узел: стропила, уклон, свесы и покрытия.",
    type: "roof",
    size: [6.35, 1.35, 4.55],
    position: [-0.4, 3.72, -0.05],
    explode: [0, 2.0, 0],
    color: 0xa74830,
    specs: { Уклон: "32°", Покрытие: "Фальц", Стадия: "КР" },
  },
  {
    id: "garage-roof",
    title: "Крыша гаража",
    layer: "roof",
    copy: "Дополнительная кровля помогает увидеть места водоотвода и стыков с основным фасадом.",
    type: "roof",
    size: [2.75, 0.75, 3.05],
    position: [3.35, 1.88, 0.64],
    explode: [2.5, 1.25, 0.7],
    color: 0xb9563c,
    specs: { Уклон: "18°", Покрытие: "Металл", Узел: "Ендова" },
  },
  {
    id: "terrace",
    title: "Терраса",
    layer: "site",
    copy: "Открытая зона вынесена в слой участка, чтобы связать архитектуру с благоустройством.",
    size: [3.2, 0.16, 1.5],
    position: [-1.1, 0.42, -2.9],
    explode: [-0.4, -0.4, -1.5],
    color: 0x9b7753,
    specs: { Площадь: "14 м²", Настил: "Термодерево", Узел: "Выпуск" },
  },
  {
    id: "windows-front",
    title: "Фасадное остекление",
    layer: "openings",
    copy: "Окна сгруппированы, чтобы быстро оценить световые проемы и ритм фасада.",
    type: "windowSet",
    position: [-0.55, 1.75, -2.06],
    explode: [-0.2, 0.35, -1.4],
    color: 0x5bbad1,
    specs: { Проемов: "5", Профиль: "70 мм", Стеклопакет: "2 камеры" },
  },
  {
    id: "windows-side",
    title: "Боковые окна",
    layer: "openings",
    copy: "Отдельный набор боковых проемов помогает видеть конфликты с несущими и инженерными трассами.",
    type: "sideWindowSet",
    position: [-3.12, 1.86, 0.1],
    explode: [-1.55, 0.2, 0],
    color: 0x79c8dc,
    specs: { Проемов: "4", Высота: "1.2 м", Узел: "Перемычка" },
  },
  {
    id: "stairs",
    title: "Лестничный узел",
    layer: "engineering",
    copy: "Внутренний узел показывает вертикальные связи и помогает проверять проходы между этажами.",
    type: "stairs",
    position: [0.95, 1.33, 0.7],
    explode: [0.7, 0.6, 1.25],
    color: 0x4b6670,
    specs: { Маршей: "2", Ширина: "1.05 м", Подъем: "17 см" },
  },
  {
    id: "utilities",
    title: "Инженерные трассы",
    layer: "engineering",
    copy: "Цветные каналы обозначают вентиляцию, воду и электрику в компактной демонстрационной форме.",
    type: "pipes",
    position: [0.65, 1.82, 0.05],
    explode: [1.35, 0.45, 1.3],
    color: 0x0f8b8d,
    specs: { Контуры: "3", Шахта: "Санузел", Проверка: "Коллизии" },
  },
];

const layerState = new Map(layers.map((layer) => [layer.id, true]));
const selectable = [];
const modelRoot = new THREE.Group();
const drawingRoot = new THREE.Group();
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let selectedPart = null;
let explodeAmount = 0;
let autoOrbit = false;
let currentView = "facade";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe7edeb);
scene.fog = new THREE.Fog(0xe7edeb, 12, 30);

const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
camera.position.set(7.6, 5.2, 8.4);

const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.dampingFactor = 0.07;
controls.minDistance = 5;
controls.maxDistance = 18;
controls.target.set(0, 1.75, 0);

scene.add(modelRoot);
scene.add(drawingRoot);

const hemi = new THREE.HemisphereLight(0xffffff, 0x6b7b78, 2.2);
scene.add(hemi);

const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(5, 9, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.near = 1;
sun.shadow.camera.far = 22;
sun.shadow.camera.left = -9;
sun.shadow.camera.right = 9;
sun.shadow.camera.top = 9;
sun.shadow.camera.bottom = -9;
scene.add(sun);

const fill = new THREE.DirectionalLight(0x9fd2d3, 1.2);
fill.position.set(-5, 3, -4);
scene.add(fill);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(18, 14, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x9fb6a1, roughness: 0.92 }),
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(18, 18, 0x789286, 0xb9c9be);
grid.position.y = 0.012;
scene.add(grid);

buildLayerControls();
buildHouse();
selectPart(null);
setDrawingView(currentView);
resizeRenderer();
renderer.setAnimationLoop(animate);

fitButton.addEventListener("click", fitView);
autoButton.addEventListener("click", () => {
  autoOrbit = !autoOrbit;
  autoButton.classList.toggle("active", autoOrbit);
  autoButton.setAttribute("aria-pressed", String(autoOrbit));
});

showAllButton.addEventListener("click", () => {
  for (const layer of layers) layerState.set(layer.id, true);
  syncLayerButtons();
  applyLayerVisibility();
});

explodeRange.addEventListener("input", () => {
  explodeAmount = Number(explodeRange.value) / 100;
  explodeOutput.textContent = `${explodeRange.value}%`;
  updateExplode();
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => applyPreset(button.dataset.preset));
});

viewButtons.forEach((button) => {
  button.addEventListener("click", () => setDrawingView(button.dataset.view));
});

canvas.addEventListener("pointerdown", onPointerDown);
window.addEventListener("resize", resizeRenderer);

function buildLayerControls() {
  layers.forEach((layer) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = layer.label;
    button.dataset.layer = layer.id;
    button.style.setProperty("--layer-color", `#${layer.color.toString(16).padStart(6, "0")}`);
    button.addEventListener("click", () => {
      layerState.set(layer.id, !layerState.get(layer.id));
      syncLayerButtons();
      applyLayerVisibility();
      if (selectedPart && !layerState.get(selectedPart.userData.layer)) selectPart(null);
    });
    layerControls.appendChild(button);
  });
  syncLayerButtons();
}

function buildHouse() {
  partData.forEach((data) => {
    const part = createPart(data);
    part.userData = { ...data, base: new THREE.Vector3(...(data.position ?? [0, 0, 0])) };
    part.position.copy(part.userData.base);
    modelRoot.add(part);
    selectable.push(part);
  });

  addSiteDetails();
  addDrawingDetails();
  updateExplode();
}

function createPart(data) {
  if (data.type === "roof") return createRoofPart(data);
  if (data.type === "windowSet") return createWindowSet(data);
  if (data.type === "sideWindowSet") return createSideWindowSet(data);
  if (data.type === "stairs") return createStairs(data);
  if (data.type === "pipes") return createPipes(data);

  const group = new THREE.Group();
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...data.size),
    new THREE.MeshStandardMaterial({
      color: data.color,
      roughness: 0.72,
      metalness: 0.02,
    }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  group.add(mesh);
  addEdges(mesh, 0x26343a, 0.22);
  return group;
}

function createRoofPart(data) {
  const [width, height, depth] = data.size;
  const vertices = new Float32Array([
    -width / 2, -height / 2, -depth / 2,
    width / 2, -height / 2, -depth / 2,
    0, height / 2, -depth / 2,
    -width / 2, -height / 2, depth / 2,
    width / 2, -height / 2, depth / 2,
    0, height / 2, depth / 2,
  ]);
  const indices = [0, 1, 2, 3, 5, 4, 0, 3, 4, 0, 4, 1, 1, 4, 5, 1, 5, 2, 2, 5, 3, 2, 3, 0];
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();

  const mesh = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.58, metalness: 0.05 }),
  );
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  const group = new THREE.Group();
  group.add(mesh);
  addEdges(mesh, 0x52291f, 0.34);
  return group;
}

function createWindowSet(data) {
  const group = new THREE.Group();
  [
    [-1.85, -0.46, 0, 0.75, 0.72],
    [-0.68, -0.46, 0, 0.75, 0.72],
    [0.75, -0.46, 0, 0.75, 0.72],
    [-1.35, 1.02, 0, 0.66, 0.62],
    [0.35, 1.02, 0, 0.66, 0.62],
  ].forEach(([x, y, z, w, h]) => {
    group.add(createWindowPane(x, y, z, w, h, 0.08, data.color));
  });
  return group;
}

function createSideWindowSet(data) {
  const group = new THREE.Group();
  [
    [0, -0.44, -1.1],
    [0, -0.44, 0.85],
    [0, 0.94, -1.0],
    [0, 0.94, 0.75],
  ].forEach(([x, y, z]) => {
    const pane = createWindowPane(x, y, z, 0.08, 0.66, 0.68, data.color);
    group.add(pane);
  });
  return group;
}

function createWindowPane(x, y, z, width, height, depth, color) {
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.12, height + 0.12, depth + 0.04),
    new THREE.MeshStandardMaterial({ color: 0x2d3738, roughness: 0.5 }),
  );
  frame.position.set(x, y, z);
  frame.castShadow = true;

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(width, height, depth + 0.07),
    new THREE.MeshPhysicalMaterial({
      color,
      roughness: 0.1,
      metalness: 0.05,
      transmission: 0.25,
      transparent: true,
      opacity: 0.68,
    }),
  );
  glass.position.set(x, y, z - 0.015);

  const item = new THREE.Group();
  item.add(frame, glass);
  return item;
}

function createStairs(data) {
  const group = new THREE.Group();
  for (let i = 0; i < 9; i += 1) {
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(1.25, 0.12, 0.34),
      new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.62 }),
    );
    step.position.set(0, i * 0.13, i * -0.18);
    step.castShadow = true;
    group.add(step);
  }
  return group;
}

function createPipes(data) {
  const group = new THREE.Group();
  const pipeMaterial = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.35, metalness: 0.15 });
  const hotMaterial = new THREE.MeshStandardMaterial({ color: 0xc66f3d, roughness: 0.35, metalness: 0.1 });
  const airMaterial = new THREE.MeshStandardMaterial({ color: 0x516e93, roughness: 0.35, metalness: 0.1 });

  group.add(createPipe([0, 0, 0], [0, 1.6, 0], 0.045, pipeMaterial));
  group.add(createPipe([0, 1.6, 0], [1.4, 1.6, 0], 0.045, pipeMaterial));
  group.add(createPipe([-0.34, 0.18, 0.24], [-0.34, 1.35, 0.24], 0.035, hotMaterial));
  group.add(createPipe([-0.34, 1.35, 0.24], [-1.25, 1.35, 0.24], 0.035, hotMaterial));
  group.add(createPipe([0.28, 0.22, -0.25], [0.28, 1.48, -0.25], 0.055, airMaterial));
  group.add(createPipe([0.28, 1.48, -0.25], [0.28, 1.48, -1.2], 0.055, airMaterial));
  return group;
}

function createPipe(start, end, radius, material) {
  const startVector = new THREE.Vector3(...start);
  const endVector = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(endVector, startVector);
  const geometry = new THREE.CylinderGeometry(radius, radius, direction.length(), 18);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(startVector).add(endVector).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  mesh.castShadow = true;
  return mesh;
}

function addEdges(mesh, color, opacity) {
  const edges = new THREE.LineSegments(
    new THREE.EdgesGeometry(mesh.geometry),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
  mesh.add(edges);
}

function addSiteDetails() {
  const pathMaterial = new THREE.MeshStandardMaterial({ color: 0xd4c5a4, roughness: 0.86 });
  const path = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.035, 4.4), pathMaterial);
  path.position.set(2.55, 0.04, -3.25);
  path.receiveShadow = true;
  scene.add(path);

  const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x5d8565, roughness: 0.9 });
  const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x7c5b3e, roughness: 0.8 });
  [
    [-5.3, -3.6, 0.9],
    [5.7, -3.9, 0.7],
    [-5.8, 3.8, 0.75],
  ].forEach(([x, z, s]) => {
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08 * s, 0.11 * s, 0.65 * s, 8), trunkMaterial);
    trunk.position.set(x, 0.34 * s, z);
    trunk.castShadow = true;
    scene.add(trunk);
    const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 * s, 1), treeMaterial);
    crown.position.set(x, 0.98 * s, z);
    crown.castShadow = true;
    scene.add(crown);
  });
}

function addDrawingDetails() {
  drawingRoot.add(createDimensionLine([-3.4, 0.08, -3.05], [3.4, 0.08, -3.05], "6.80 м", [0, 0, -0.32]));
  drawingRoot.add(createDimensionLine([-3.72, 0.08, -2.6], [-3.72, 0.08, 2.6], "5.20 м", [-0.34, 0, 0]));
  drawingRoot.add(createDimensionLine([4.35, 0.16, 2.45], [4.35, 4.38, 2.45], "4.85 м", [0.28, 0, 0]));

  [
    [-3.4, 0.03, -2.6, 3.4, 0.03, -2.6],
    [-3.4, 0.03, 2.6, 3.4, 0.03, 2.6],
    [-3.4, 0.03, -2.6, -3.4, 0.03, 2.6],
    [3.4, 0.03, -2.6, 3.4, 0.03, 2.6],
    [-3.4, 0.03, 0, 3.4, 0.03, 0],
    [0, 0.03, -2.6, 0, 0.03, 2.6],
  ].forEach((coords) => {
    drawingRoot.add(createLine(coords.slice(0, 3), coords.slice(3), 0xd7f2ff, 0.46));
  });

  const section = new THREE.Mesh(
    new THREE.BoxGeometry(0.035, 4.5, 5.7),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
    }),
  );
  section.position.set(0.45, 2.1, 0);
  drawingRoot.add(section);
}

function createDimensionLine(start, end, label, labelOffset) {
  const group = new THREE.Group();
  const material = new THREE.LineBasicMaterial({ color: 0xdff6ff, transparent: true, opacity: 0.86 });
  const startVector = new THREE.Vector3(...start);
  const endVector = new THREE.Vector3(...end);
  const direction = new THREE.Vector3().subVectors(endVector, startVector).normalize();
  const reference = Math.abs(direction.y) > 0.7 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const tick = new THREE.Vector3().crossVectors(direction, reference).normalize().multiplyScalar(0.22);

  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([startVector, endVector]), material));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([startVector.clone().sub(tick), startVector.clone().add(tick)]), material));
  group.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([endVector.clone().sub(tick), endVector.clone().add(tick)]), material));

  const labelSprite = createLabel(label);
  labelSprite.position.copy(startVector).lerp(endVector, 0.5).add(new THREE.Vector3(...labelOffset));
  group.add(labelSprite);
  return group;
}

function createLine(start, end, color, opacity) {
  return new THREE.Line(
    new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...start), new THREE.Vector3(...end)]),
    new THREE.LineBasicMaterial({ color, transparent: true, opacity }),
  );
}

function createLabel(text) {
  const labelCanvas = document.createElement("canvas");
  labelCanvas.width = 256;
  labelCanvas.height = 64;
  const ctx = labelCanvas.getContext("2d");
  ctx.clearRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.fillStyle = "rgba(12, 42, 75, 0.74)";
  ctx.fillRect(0, 0, labelCanvas.width, labelCanvas.height);
  ctx.strokeStyle = "rgba(223, 246, 255, 0.92)";
  ctx.strokeRect(1, 1, labelCanvas.width - 2, labelCanvas.height - 2);
  ctx.fillStyle = "#f3fbff";
  ctx.font = "700 24px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, labelCanvas.width / 2, labelCanvas.height / 2);

  const texture = new THREE.CanvasTexture(labelCanvas);
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true }));
  sprite.scale.set(1.15, 0.29, 1);
  return sprite;
}

function syncLayerButtons() {
  layerControls.querySelectorAll("button").forEach((button) => {
    const active = layerState.get(button.dataset.layer);
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function applyLayerVisibility() {
  selectable.forEach((part) => {
    part.visible = layerState.get(part.userData.layer);
  });
}

function applyPreset(preset) {
  const activeLayers = {
    shell: ["structure", "roof"],
    engineering: ["structure", "engineering"],
    facade: ["structure", "roof", "openings", "site"],
  }[preset];

  layers.forEach((layer) => layerState.set(layer.id, activeLayers.includes(layer.id)));
  syncLayerButtons();
  applyLayerVisibility();
}

function setDrawingView(view) {
  currentView = view;
  viewButtons.forEach((button) => {
    const active = button.dataset.view === view;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  stage.classList.toggle("drawing-mode", view !== "iso");
  drawingRoot.visible = view !== "iso";
  autoOrbit = false;
  autoButton.classList.remove("active");
  autoButton.setAttribute("aria-pressed", "false");

  const views = {
    iso: { position: [7.6, 5.2, 8.4], target: [0, 1.72, 0], zoom: 1 },
    plan: { position: [0.02, 12.5, 0.02], target: [0, 0.25, 0], zoom: 1.2 },
    facade: { position: [0, 2.7, -12.5], target: [0, 2.05, 0], zoom: 1.05 },
    section: { position: [9.8, 3.15, 0.05], target: [0.25, 1.95, 0], zoom: 1.08 },
  };
  const preset = views[view];
  camera.position.set(...preset.position);
  controls.target.set(...preset.target);
  camera.zoom = preset.zoom;
  camera.updateProjectionMatrix();
  controls.update();
  applyDrawingMaterials();
}

function applyDrawingMaterials() {
  const drawing = currentView !== "iso";
  scene.background = new THREE.Color(drawing ? 0x123c69 : 0xe7edeb);
  scene.fog = drawing ? null : new THREE.Fog(0xe7edeb, 12, 30);
  ground.visible = !drawing;
  grid.visible = !drawing;

  selectable.forEach((part) => {
    part.traverse((child) => {
      if (!child.isMesh || !child.material) return;
      if (!child.userData.baseMaterial) child.userData.baseMaterial = child.material;
      if (!child.userData.drawingMaterial) {
        child.userData.drawingMaterial = new THREE.MeshBasicMaterial({
          color: child.userData.baseColor ?? child.material.color,
          transparent: true,
          opacity: 0.18,
          wireframe: true,
        });
      }
      child.material = drawing ? child.userData.drawingMaterial : child.userData.baseMaterial;
    });
  });
  if (selectedPart) setPartHighlight(selectedPart, true);
}

function updateExplode() {
  selectable.forEach((part) => {
    const base = part.userData.base;
    const explode = new THREE.Vector3(...part.userData.explode);
    part.position.copy(base).addScaledVector(explode, easeOutCubic(explodeAmount));
  });
}

function onPointerDown(event) {
  const rect = canvas.getBoundingClientRect();
  pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(selectable.filter((part) => part.visible), true);
  const hitPart = hits.length ? findSelectableRoot(hits[0].object) : null;
  selectPart(hitPart);
}

function findSelectableRoot(object) {
  let current = object;
  while (current && !selectable.includes(current)) current = current.parent;
  return current;
}

function selectPart(part) {
  selectedPart = part;
  selectable.forEach((item) => setPartHighlight(item, item === part));

  if (!part) {
    partLayer.textContent = "Проект дома";
    partTitle.textContent = "Общая модель";
    partCopy.textContent =
      "Наглядный макет показывает, как проект раскладывается на конструктивные элементы, пригодные для чертежей, спецификации и согласования.";
    renderSpecs({ Этажность: "2", Площадь: "158 м²", Состав: "АР / КР / КЖ" });
    return;
  }

  const layer = layers.find((item) => item.id === part.userData.layer);
  partLayer.textContent = layer?.label ?? "Деталь";
  partTitle.textContent = part.userData.title;
  partCopy.textContent = part.userData.copy;
  renderSpecs(part.userData.specs);
}

function setPartHighlight(part, active) {
  part.traverse((child) => {
    if (!child.isMesh || !child.material) return;
    if (!child.userData.baseColor) child.userData.baseColor = child.material.color.clone();
    child.material.color.copy(child.userData.baseColor);
    child.material.emissive?.set(active ? 0x123f41 : 0x000000);
    child.material.emissiveIntensity = active ? 0.28 : 0;
  });
}

function renderSpecs(specs) {
  partSpecs.innerHTML = "";
  Object.entries(specs).forEach(([term, value]) => {
    const wrapper = document.createElement("div");
    const dt = document.createElement("dt");
    const dd = document.createElement("dd");
    dt.textContent = term;
    dd.textContent = value;
    wrapper.append(dt, dd);
    partSpecs.appendChild(wrapper);
  });
}

function fitView() {
  setDrawingView(currentView);
}

function resizeRenderer() {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  renderer.setSize(width, height, false);
  camera.aspect = width / Math.max(height, 1);
  camera.updateProjectionMatrix();
}

function animate() {
  if (autoOrbit) modelRoot.rotation.y += 0.004;
  controls.update();
  renderer.render(scene, camera);
}

function easeOutCubic(value) {
  return 1 - Math.pow(1 - value, 3);
}
