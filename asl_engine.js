// 1. Scene Setup
const container = document.getElementById('avatar-mount');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

// 2. The Wireframe Avatar Mock
const geometry = new THREE.IcosahedronGeometry(1, 1);
const material = new THREE.MeshBasicMaterial({ 
    color: 0x8dbdb2, 
    wireframe: true,
    transparent: true,
    opacity: 0.8
});
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);
camera.position.z = 3;

// 3. Night Mode Logic
const nightBtn = document.getElementById('nightBtn');
let nightActive = false;

nightBtn.onclick = () => {
    nightActive = !nightActive;
    document.querySelector('.asl-hud-container').style.filter = 
        nightActive ? "sepia(50%) saturate(120%) hue-rotate(-20deg)" : "none";
};

// 4. Animation
function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.005;
    renderer.render(scene, camera);
}
animate();
