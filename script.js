import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const canvas = document.getElementById("three-canvas");
const overlay = document.getElementById("overlay");
const typingText = document.getElementById("typingText");
const openButton = document.getElementById("openButton");
const nextButton = document.getElementById("nextButton");
const closeButton = document.getElementById("closeButton");
const letterUI = document.getElementById("letterUI");
const envelopeImage = document.getElementById("envelopeImage");
const banner = document.getElementById("banner");

const pages = [
  "Chúc bạn Lan luôn vui vẻ, xinh đẹp và tỏa sáng.",
  "Hy vọng mỗi ngày mới đều đầy ắp tiếng cười, bất ngờ dễ thương và thật nhiều kỷ niệm đáng nhớ.",
  "Cảm ơn bạn vì đã là một người bạn tuyệt vời. Chúc sinh nhật của bạn ngập tràn hạnh phúc!"
];

let currentPage = 0;
let charIndex = 0;
let typingTimer = null;
let isTyping = false;

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setClearColor(0x090912, 1);

const camera = new THREE.PerspectiveCamera(36, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 1.35, 2.7);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;
controls.enableZoom = true;
controls.minDistance = 2.4;
controls.maxDistance = 7;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.8;
controls.minPolarAngle = Math.PI / 4;
controls.maxPolarAngle = Math.PI / 1.65;

const ambient = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambient);

const directional = new THREE.DirectionalLight(0xffffff, 1.05);
directional.position.set(2, 4.8, 2);
scene.add(directional);

const rimLight = new THREE.DirectionalLight(0x86c1ff, 0.45);
rimLight.position.set(-2, 2, -2);
scene.add(rimLight);

const hemiLight = new THREE.HemisphereLight(0xddeeff, 0x111122, 0.38);
scene.add(hemiLight);

function createFallbackCake() {
  const cakeGroup = new THREE.Group();

  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0xf4b1b1, roughness: 0.5, metalness: 0.06 });
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.35, metalness: 0.1 });
  const candleMaterial = new THREE.MeshStandardMaterial({ color: 0xffd35d, roughness: 0.3, metalness: 0.2 });

  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 0.5, 48), baseMaterial);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.4, 48), whiteMaterial);
  top.position.y = 0.45;
  cakeGroup.add(bottom, top);

  for (let i = 0; i < 5; i += 1) {
    const candle = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.6, 12), candleMaterial);
    const angle = (i / 5) * Math.PI * 2;
    candle.position.set(Math.cos(angle) * 0.7, 0.8, Math.sin(angle) * 0.7);
    cakeGroup.add(candle);
  }

  const plate = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, 0.12, 48), new THREE.MeshStandardMaterial({ color: 0xd9d9e3, roughness: 0.6 }));
  plate.position.y = -0.26;
  cakeGroup.add(plate);

  cakeGroup.position.set(0, -0.9, 0);
  scene.add(cakeGroup);
}

const loader = new GLTFLoader();
loader.load(
  "resources/models/scene.gltf",
  gltf => {
    console.log("GLTF model loaded", gltf);
    const model = gltf.scene;
    model.traverse(child => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const scaleFactor = 1.2 / maxDim;
    model.scale.setScalar(scaleFactor);
    box.setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    model.position.sub(center);
    model.position.y =  0.66+size.y * scaleFactor * 0.5;
    model.rotation.y = Math.PI * 0.75;
    scene.add(model);
    controls.target.set(0, 0, 0);
    controls.update();
  },
  xhr => {
    if (xhr.lengthComputable) {
      console.log(`Loading model: ${Math.round((xhr.loaded / xhr.total) * 100)}%`);
    }
  },
  error => {
    console.error("Không thể tải mô hình:", error);
    createFallbackCake();
  }
);

function resize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resize);

function animate() {
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

function typePage() {
  const pageText = pages[currentPage];
  typingText.textContent = "";
  charIndex = 0;
  isTyping = true;
  nextButton.disabled = true;
  closeButton.classList.add("hidden");
  nextButton.classList.remove("hidden");

  typingTimer = setInterval(() => {
    if (charIndex < pageText.length) {
      typingText.textContent += pageText.charAt(charIndex);
      charIndex += 1;
    } else {
      clearInterval(typingTimer);
      isTyping = false;
      nextButton.disabled = false;
      if (currentPage === pages.length - 1) {
        nextButton.classList.add("hidden");
        closeButton.classList.remove("hidden");
      }
    }
  }, 35);
}

openButton.addEventListener("click", () => {
  envelopeImage.src = "resources/images/envelope_open.png";
  overlay.classList.remove("hidden");
  openButton.disabled = true;
  currentPage = 0;
  typePage();
});

nextButton.addEventListener("click", () => {
  if (isTyping) {
    clearInterval(typingTimer);
    typingText.textContent = pages[currentPage];
    isTyping = false;
    nextButton.disabled = false;
    if (currentPage === pages.length - 1) {
      nextButton.classList.add("hidden");
      closeButton.classList.remove("hidden");
    }
    return;
  }

  if (currentPage < pages.length - 1) {
    currentPage += 1;
    typePage();
  }
});

closeButton.addEventListener("click", () => {
  overlay.classList.add("hidden");
  letterUI.classList.add("hidden");
  banner.classList.add("hidden");
});

animate();
