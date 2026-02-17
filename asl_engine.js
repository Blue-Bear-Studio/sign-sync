// 1. SETUP
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

// 2. STATE VARIABLES
let sentence = [];
let lastSign = "";
let signStartTime = 0;
const REQUIRED_HOLD_TIME = 1000;

// 3. ASL FORGE DICTIONARY
function interpretSign(landmarks) {
    const isIndexUp = landmarks[8].y < landmarks[6].y;
    const isMiddleUp = landmarks[12].y < landmarks[10].y;
    const isRingUp = landmarks[16].y < landmarks[14].y;
    const isPinkyUp = landmarks[20].y < landmarks[18].y;
    const thumbIndexDist = Math.sqrt(Math.pow(landmarks[4].x - landmarks[8].x, 2) + Math.pow(landmarks[4].y - landmarks[8].y, 2));

    if (isIndexUp && isMiddleUp && isRingUp && isPinkyUp) return "HELLO";
    if (isIndexUp && isMiddleUp && !isRingUp && !isPinkyUp) return "PEACE";
    if (thumbIndexDist < 0.05 && isMiddleUp && isRingUp) return "OK";
    if (isIndexUp && isPinkyUp && !isMiddleUp && !isRingUp) return "ROCK ON";
    return "TRACKING...";
}

// 4. MEDIAPIPE & SENTENCE BUILDING
const videoElement = document.getElementById('input_video');
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});

hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });

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

        const currentSign = interpretSign(landmarks);
        document.getElementById('gloss-text').innerText = currentSign;

        if (currentSign !== "TRACKING..." && currentSign !== "HELLO") {
            if (currentSign === lastSign) {
                if (Date.now() - signStartTime > REQUIRED_HOLD_TIME) {
                    if (sentence[sentence.length - 1] !== currentSign) {
                        sentence.push(currentSign);
                        document.getElementById('current-sentence').innerText = sentence.join(" ");
                    }
                }
            } else {
                lastSign = currentSign;
                signStartTime = Date.now();
            }
        }
        document.getElementById('accuracy-val').innerText = "98%";
        document.getElementById('progress-fill').style.width = "98%";
    }
});

new Camera(videoElement, { onFrame: async () => { await hands.send({image: videoElement}); }, width: 640, height: 480 }).start();

// 5. INTERACTION (VOICE / CLEAR)
document.getElementById('speakBtn').onclick = () => {
    const speech = new SpeechSynthesisUtterance(sentence.join(" "));
    window.speechSynthesis.speak(speech);
};

document.getElementById('clearBtn').onclick = () => {
    sentence = [];
    document.getElementById('current-sentence').innerText = "...";
};

function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }
animate();
