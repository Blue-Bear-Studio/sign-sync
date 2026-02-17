const scene = new THREE.Scene();
const container = document.getElementById('avatar-mount');
const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const geometry = new THREE.IcosahedronGeometry(0.5, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x8dbdb2, wireframe: true });
const handMock = new THREE.Mesh(geometry, material);
scene.add(handMock);

camera.position.z = 1.5;

function animate() {
    requestAnimationFrame(animate);
    handMock.rotation.y += 0.01;
    renderer.render(scene, camera);
}
animate();
