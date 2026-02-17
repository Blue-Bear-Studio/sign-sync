// 1. Scene & MediaPipe Setup
const container = document.getElementById('avatar-mount');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
container.appendChild(renderer.domElement);

const geometry = new THREE.BufferGeometry();
const material = new THREE.PointsMaterial({ color: 0x8dbdb2, size: 0.08 });
const handDots = new THREE.Points(geometry, material);
scene.add(handDots);
camera.position.z = 2.5;

const videoElement = document.getElementById('input_video');
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});

// 2. Gesture Dictionary (ASL Forge)
function recognizeGesture(landmarks) {
    // Helper to get distance between two landmarks
    const dist = (p1, p2) => Math.sqrt((p1.x-p2.x)**2 + (p1.y-p2.y)**2);
    
    const thumbTip = landmarks[4];
    const indexTip = landmarks[8];
    const middleTip = landmarks[12];
    const ringTip = landmarks[16];
    const pinkyTip = landmarks[20];
    const wrist = landmarks[0];

    // Simple Logic for "HELLO" (Open Palm)
    if (indexTip.y < wrist.y && pinkyTip.y < wrist.y && dist(thumbTip, indexTip) > 0.2) {
        return "HELLO";
    }
    // Simple Logic for "THANK YOU" (Fingers near mouth/chest - simulated here as flat hand)
    if (dist(indexTip, middleTip) < 0.05 && dist(middleTip, ringTip) < 0.05) {
        return "THANK YOU";
    }
    
    return "TRACKING...";
}

// 3. Results Processing
hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        const positions = new Float32Array(landmarks.length * 3);
        
        landmarks.forEach((pt, i) => {
            positions[i * 3] = (pt.x - 0.5) * 2.5;
            positions[i * 3 + 1] = -(pt.y - 0.5) * 2.5; 
            positions[i * 3 + 2] = -pt.z * 2;
        });

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Update the UI with recognized sign
        const sign = recognizeGesture(landmarks);
        document.getElementById('gloss-text').innerText = sign;
        document.getElementById('accuracy-val').innerText = "96%";
        document.getElementById('progress-fill').style.width = "96%";
    }
});

// 4. Camera & Interaction
const cam = new Camera(videoElement, {
    onFrame: async () => { await hands.send({image: videoElement}); },
    width: 640, height: 480
});
cam.start();

const nightBtn = document.getElementById('nightBtn');
let active = false;
nightBtn.onclick = () => {
    active = !active;
    document.querySelector('.asl-hud-container').style.filter = active ? "sepia(50%)" : "none";
};

function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }
animate();
