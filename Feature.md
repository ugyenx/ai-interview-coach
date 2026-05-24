# 🎥 InterviewAI — Live Video Face Detection & Sentiment Analysis Engine

This document provides a detailed breakdown of the **Real-Time Webcam Streaming, Face Detection, and Sentiment Analysis Engine** integrated into the InterviewAI Mock Room. Use this guide to understand how client-side deep learning operates in the browser.

---

## 🎯 1. Overview & Objectives
Rather than simply displaying a dummy static webcam viewport, InterviewAI includes an active behavioral monitor. During a mock session, the browser captures the candidate's camera stream to run light, client-side neural networks. 

This engine produces real-time behavioral parameters:
1. **Confidence Score**: Measures relaxed focus and neutral/happy ratios.
2. **Stress Level Index**: Flags nervous micro-expressions (fear, sadness, anger, disgust).
3. **Eye Contact Alignment**: Verifies active head posture facing the screen.
4. **Facial Landmarks Overlay**: Renders green dot trackers overlaying eyebrows, eyes, nose, mouth, and jaw structures on the video canvas.

---

## 🛠️ 2. Core Technologies Used
* **Web MediaDevices API (`navigator.mediaDevices.getUserMedia`)**: Standard browser hook requesting permission to read local user webcam hardware streams.
* **HTML5 `<video>` & `<canvas>` Elements**: The video tag handles the raw hardware frame output, while the canvas overlays dynamic drawings on top of the mirrored video frames.
* **Face-API.js (`@vladmandic/face-api`)**: A specialized, optimized build of TensorFlow.js trained to detect facial landmarks and classify facial expressions directly in the browser's JavaScript environment.

---

## 🧠 3. Neural Network Models Loaded
At session initialization, three model weights are downloaded from jsDelivr's CDN endpoint:
1. **Tiny Face Detector**: A compact, CPU/GPU-friendly model designed for real-time mobile/web face detection. It calculates bounding-box coordinates for face regions.
2. **68 Point Face Landmark Model**: Detects 68 distinct landmarks mapping the candidate's head shape, eyes, nose, mouth, and brows.
3. **Face Expression Model**: Evaluates the mouth shape and eye spacing to output classification confidence values for 7 key emotions: *neutral*, *happy*, *sad*, *angry*, *fearful*, *disgusted*, and *surprised*.

---

## 💻 4. Logical Workflow & Calculations

### Step A: Stream Initialization & Teardown
When the Interview Room mounts, a React effect hooks into the camera state:
```javascript
navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
  .then(stream => {
    streamRef.current = stream;
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
  })
```
* **Cleanup Lifecycle**: When the component unmounts or the user toggles the camera off, a teardown method triggers `track.stop()` on all video tracks to release camera hardware and disable the active webcam LED indicator on the user's laptop.

### Step B: The Face-API Detection Loop
To prevent CPU bottlenecking or dropping frame rates, calculations are decoupled:
* **Overlay Rendering**: Runs continuously using `requestAnimationFrame()` to render scanlines and grids at a smooth 60fps.
* **AI Model Scanning**: Runs on a throttled interval (every **500ms**) using an async function to detect faces without blocking browser paint cycles:
```javascript
const detection = await faceapi.detectSingleFace(
  videoRef.current, 
  new faceapi.TinyFaceDetectorOptions()
).withFaceLandmarks().withFaceExpressions();
```

### Step C: Sentiment Metrics Mathematics
The raw emotion weights returned by Face-API range from `0.0` to `1.0`. They are mapped to progress metrics using the formulas below:

#### 1. Confidence Score
Evaluates the proportion of neutral and positive emotions:
$$\text{Confidence} = (\text{expressions.happy} + \text{expressions.neutral}) \times 100$$

#### 2. Stress Index
Measures negative micro-expressions indicative of high tension or anxiety:
$$\text{Stress} = \min\left(100, (\text{expressions.fear} + \text{expressions.sad} + \text{expressions.angry} + \text{expressions.disgusted}) \times 100 \times 2\right)$$
*(Note: A scaling factor of $\times 2$ is applied to ensure subtle micro-expressions register visibly on the dashboard gauge).*

#### 3. Eye Contact Tracker
* **Face Present**: If a face boundary is successfully matched in the viewport, the code registers eye contact:
  $$\text{Eye Contact} = 95 + \text{RandomOffset}(0 \text{ to } 5)$$
* **Face Missing**: If the candidate turns away or leaves the frame, face detection returns `null`, and the rating drops:
  $$\text{Eye Contact} = 0$$

#### 4. Landmark Vector Drawing
If detection succeeds, coordinates are scaled to match the canvas dimensions:
```javascript
const displaySize = { width: canvasRef.current.width, height: canvasRef.current.height };
const resizedDetections = faceapi.resizeResults(detection, displaySize);
resizedDetections.landmarks.positions.forEach(p => {
  ctx.beginPath();
  ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
  ctx.fill();
});
```

---

## 🎓 5. Interview Defense Preparation Q&A

**Q1: Why is TFW/Face-API run on the client instead of a backend server?**
* **Answer**: Client-side execution eliminates massive backend video encoding workloads. Uploading raw video frames to a centralized server would require substantial bandwidth and processing power. Computing features in-browser via JavaScript Web Workers ensures complete data privacy and scales efficiently.

**Q2: What happens if the user blocks camera permission?**
* **Answer**: The stream utility catches the permission rejection gracefully, showing a warning in the logs, and displaying a `"CAMERA INSTANCE OFFLINE"` screen overlay. The system then defaults to stable baseline metrics (e.g. 85% Confidence, 30% Stress) to prevent application crashes.

**Q3: How do you achieve 60fps animations alongside slow ML models?**
* **Answer**: We separate the visual grid scanner animation from the face detection run. The visual scanner loop runs via browser-managed `requestAnimationFrame` (high priority, ~60Hz), while the heavy tensor computation runs asynchronously inside a `setInterval` scheduled every `500ms`, keeping interactions highly responsive.
