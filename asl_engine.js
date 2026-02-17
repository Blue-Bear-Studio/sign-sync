// 1. SCENE SETUP
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

// 2. TEACHER MODE STATE
const lessonPlan = [
    { name: "HELLO", img: "assets/hello.png" },
    { name: "PEACE", img: "assets/peace.png" },
    { name: "OK", img: "assets/ok.png" },
    { name: "ROCK ON", img: "assets/rockon.png" }
];

let currentLessonIndex = 0;
let masteryScore = 0;
let sentence = [];

// 3. ASL FORGE DICTIONARY (Logic Core)
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

// 4. MEDIAPIPE & LEARNING LOOP
const videoElement = document.getElementById('input_video');
const hands = new Hands({locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`});

hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });

hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // Update 3D Skeletal View
        const positions = new Float32Array(landmarks.length * 3);
        landmarks.forEach((pt, i) => {
            positions[i * 3] = (pt.x - 0.5) * 2.5;
            positions[i * 3 + 1] = -(pt.y - 0.5) * 2.5; 
            positions[i * 3 + 2] = -pt.z * 2;
        });
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const currentSign = interpretSign(landmarks);
        const target = lessonPlan[currentLessonIndex];
        
        document.getElementById('gloss-text').innerText = currentSign;
        document.getElementById('target-sign').innerText = target.name;
        document.getElementById('guide-pic').src = target.img;

        // Mastery & Feedback Logic
        if (currentSign === target.name) {
            masteryScore += 1.5; // Fill speed
            document.getElementById('progress-fill').style.background = "var(--studio-teal)";
        } else {
            if (masteryScore > 0) masteryScore -= 0.5; // Depletion speed
            document.getElementById('progress-fill').style.background = "#444";
        }

        document.getElementById('progress-fill').style.width = masteryScore + "%";
        document.getElementById('accuracy-val').innerText = Math.floor(masteryScore) + "%";

        // Level Up Logic
        if (masteryScore >= 100) {
            masteryScore = 0;
            const learnedWord = target.name;
            sentence.push(learnedWord);
            document.getElementById('current-sentence').innerText = sentence.join(" ");
            
            currentLessonIndex = (currentLessonIndex + 1) % lessonPlan.length;
            
            const msg = new SpeechSynthesisUtterance(`${learnedWord} confirmed. Next sign.`);
            window.speechSynthesis.speak(msg);
        }
    }
});

// 5. CAMERA & CONTROLS
new Camera(videoElement, { onFrame: async () => { await hands.send({image: videoElement}); }, width: 640, height: 480 }).start();

document.getElementById('speakBtn').onclick = () => {
    const speech = new SpeechSynthesisUtterance(sentence.join(" "));
    window.speechSynthesis.speak(speech);
};

document.getElementById('clearBtn').onclick = () => {
    sentence = [];
    masteryScore = 0;
    document.getElementById('current-sentence').innerText = "...";
};

function animate() { requestAnimationFrame(animate); renderer.render(scene, camera); }
animate();
