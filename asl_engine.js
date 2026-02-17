// 1. LESSON PLAN
const lessonPlan = ["HELLO", "PEACE", "OK", "ROCK ON"];
let currentLessonIndex = 0;
let masteryScore = 0;

// 2. MODIFIED RESULTS LOOP
hands.onResults((results) => {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
        const landmarks = results.multiHandLandmarks[0];
        
        // ... (Keep your 3D rendering code here) ...

        const currentSign = interpretSign(landmarks);
        const target = lessonPlan[currentLessonIndex];
        
        document.getElementById('gloss-text').innerText = currentSign;
        document.getElementById('target-sign').innerText = target;

        // 3. TEACHING LOGIC: Match Check
        if (currentSign === target) {
            masteryScore += 2; // Increase progress while holding correct sign
            document.getElementById('instruction-text').style.color = "var(--studio-teal)";
        } else {
            if (masteryScore > 0) masteryScore -= 1; // Slowly drop if you lose the shape
            document.getElementById('instruction-text').style.color = "var(--text-dim)";
        }

        // 4. Update Progress Bar
        document.getElementById('progress-fill').style.width = masteryScore + "%";
        document.getElementById('accuracy-val').innerText = masteryScore + "%";

        // 5. Success Trigger
        if (masteryScore >= 100) {
            masteryScore = 0;
            currentLessonIndex = (currentLessonIndex + 1) % lessonPlan.length;
            // Play a success sound or flash
            window.speechSynthesis.speak(new SpeechSynthesisUtterance("Correct! Next sign."));
        }
    }
});
