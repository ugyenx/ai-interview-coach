# 📘 InterviewAI — Detailed System Architecture & Study Revision Guide

This document is a comprehensive study and revision guide for **InterviewAI**. It describes every module, algorithm, lifecycle event, and architectural pattern in detail. Use this to prepare for projects defenses, viva voce examinations, or technical reviews.

---

## 🎯 1. System Vision & Objective
The core objective of InterviewAI is to provide an end-to-end, high-fidelity mock preparation application. Traditional platforms separate interview tools (e.g., LeetCode for DSA, ATS checkers for resume tweaking, and static text lists for behavioral preparation). InterviewAI consolidates these into a single platform driven by:
1. **Interactive AI Conversations**: Standardized behavioral/technical voice mock interviews.
2. **Proctored Algorithmic Coding**: Secure Docker-sandboxed DSA compilers.
3. **Automated ATS Auditing**: Hybrid textual & OCR document scanning.
4. **Gamification Analytics**: Real-time state syncing to keep users engaged.

---

## 🗺️ 2. Comprehensive System Architecture

The layout below illustrates how client actions, external services, databases, and local runtime hosts communicate:

```
+------------------------------------------------------------------------------------------------+
|                                        CLIENT (Vite + React)                                   |
|                                                                                                |
|   +-------------------+     +-------------------------+     +--------------------------+       |
|   |    AuthContext    |     |   ResumeAnalyzer Page   |     |    CodingArena Page      |       |
|   | - Session Token   |     | - PDF.js Extraction     |     | - Solution Canvas        |       |
|   | - Profile State   |     | - Tesseract OCR Canvas  |     | - Dynamic Problem Selector|      |
|   | - Streak & XP Math|     | - Alignment Insights    |     | - Session Timer Tracker  |       |
|   +---------+---------+     +------------+------------+     +------------+-------------+       |
+-------------|----------------------------|-------------------------------|---------------------+
              | (Auth Sync)                | (JSON Payload)                | (Execution Request)
              v                            v                               v
+-------------|-------------+   +----------|----------+   +----------------|---------------------+
|      FIREBASE SERVICES      |   |     GROQ LLM API     |   |      LOCAL RUNTIME HOST (Port 3001) |
|                           |   |                      |   |                                     |
|  +---------------------+  |   |  +----------------+  |   |   +-----------------------------+   |
|  | Firebase Auth       |  |   |  | Llama-3.1-8b   |  |   |   | server.cjs (Express API)    |   |
|  | - User Creds        |  |   |  | - Dialogs      |  |   |   | - Temporarily saves scripts |   |
|  +---------------------+  |   |  | - Evaluations  |  |   |   | - Spawns Docker Subprocess  |   |
|  +---------------------+  |   |  | - Resume Match |  |   |   +--------------+--------------+   |
|  | Firestore Database  |  |   |  +----------------+  |   |                  |                  |
|  | - /users/{uid}      |  |   +----------------------+   |                  v                  |
|  | - /interviews       |  |                              |   +-----------------------------+   |
|  | - /practice_sub...  |  |                              |   |    DOCKER CONTAINER SYSTEM  |   |
|  +---------------------+  |                              |   |  - node:18-alpine           |   |
+---------------------------+                              |   |  - python:3.9-slim          |   |
                                                           |   |  - gcc:latest               |   |
                                                           |   +-----------------------------+   |
                                                           +-------------------------------------+
```

---

## 🔍 3. Deep-Dive Feature Breakdown & Lifecycles

### 🎙️ A. Interactive Mock Interview Room & Speech Engine
The interview room simulates a panel session where a virtual voice-enabled bot interviews the candidate.

#### 1. Speech Engine and Event Lifecycle
The system wraps browser-native speech synthesis inside React hooks to output audio question dialogs:
* **`window.speechSynthesis`**: Controls the speaking queue.
* **`SpeechSynthesisUtterance`**: Models the speaking parameters (pitch, volume, language, and string content).
* **The Non-Blocking Timer Logic**:
  * An interval counts seconds for the current session (`timerActive` state).
  * We hook into the Utterance lifecycle events:
    * `onstart`: Triggered when the AI starts speaking. The code executes `setTimerActive(false)` to halt the candidate's timer.
    * `onend`: Triggered when the voice finishes. The code executes `setTimerActive(true)` to resume the clock.
    * `onerror`: If speaking fails, it resumes the timer so candidate progress is not frozen.

#### 2. Proctoring & Tab Cheat Detection
To evaluate session integrity, the application acts as a proctoring layer:
* **Focus Event Listeners**:
  ```javascript
  window.addEventListener('blur', handleWindowFocusLoss);
  window.addEventListener('focus', handleWindowFocusGain);
  document.addEventListener('visibilitychange', handleVisibilityChange);
  ```
* **Infraction Logging**: When `document.visibilityState === 'hidden'` or window focus is lost (`blur`), a counter increments.
* **Trust Score Calculation**:
  $$\text{Trust Score} = \max\left(0, 100 - (\text{Infractions} \times 15)\right)$$
  This trust score is uploaded alongside the final evaluations to warn users of excessive external lookups.

#### 3. Interview Evaluation Generation
Upon clicking **Complete Assessment**, the transcript array (storing user typed answers and audio transcripts synced with AI questions) is passed to `generateInterviewEvaluation(transcript)` in `src/services/aiService.js`.
* Prompt engineering instructs Groq to score structural alignment and compute detailed subscores:
  * **Clarity**: Evaluation of vocabulary, directness, and grammar.
  * **Technical Depth**: Review of tech stacks, frameworks, and architectural definitions mentioned.
  * **Behavioral Fit**: Assessment of team collaboration and conflict-resolution answers.

---

### 💻 B. Coding Arena & Docker Sandbox Execution
The Coding Arena is an algorithmic environment compiling JS, Python, and C++.

#### 1. Sandbox Compilation Protocol (Docker Integration)
To run user-submitted code safely, a backend service is built using Node.js (`server.cjs`) running on port `3001` with local Docker execution:

```
[Client solution input] 
      │
      ▼ (HTTP POST /run to Port 3001)
[server.cjs Express Handler]
      │
      ├─► 1. Read Language & Code body
      ├─► 2. Read Assertion script from questions.js
      ├─► 3. Concatenate user code + assertions
      ├─► 4. Save to unique temp file: ./tmp/run_[timestamp].[ext]
      │
      ▼
[Execute Docker Spawning Command]
  docker run --rm \
             --network none \
             --cpus="0.5" \
             --memory="128m" \
             -v C:/Users/.../ai-interview-coach/tmp:/app \
             node:18-alpine node /app/run_[timestamp].js
      │
      ▼ (Capture Process stdout & stderr)
[Response formatting]
      │
      ├─► Parse container return logs
      ├─► Delete ./tmp/run_[timestamp].[ext]
      │
      ▼ (HTTP Response JSON)
[Client Console display UI]
```

* **Assertion Injection**: The frontend joins user-written class definitions (e.g. `class LRUCache`) with test runners containing validation runs (e.g. `const cache = new LRUCache(2); cache.put(1, 1); if (cache.get(1) !== 1) throw new Error("Test Failed");`).
* **Security Controls Applied**:
  * `--rm`: Automatically deletes the container instance immediately on shutdown.
  * `--network none`: Disables internet access so malicious code cannot fetch external scripts or execute DDOS calls.
  * `--cpus="0.5"` & `--memory="128m"`: Caps computing resources to prevent host node memory depletion loops (e.g., `while(true)`).

#### 2. Graded vs. Practice State Segregation
* **DSA Practice**: When in the "Problem Description" tab, clicking **Submit Practice** executes runs. If it compiles successfully and assertions pass, the problem ID is marked completed locally and updated in Firestore collection `practice_submissions`. This segregates standalone tests from the candidate's official Mock Interview histories.
* **Mock Assessment**: In the "AI Interview Panel" tab, clicking **Complete Assessment** uploads the code and increments official user XP (+150 XP), updating the candidate's dashboard interview timeline.

---

### 📄 C. Resume & ATS Analyzer
The ATS Analyzer validates and critiques resumes against job descriptions.

#### 1. Page Extraction & Canvas OCR Fallback
```
                       [Upload File]
                             │
                             ▼
                    (Check File Extension)
                             │
            ┌────────────────┴────────────────┐
            ▼ (txt, md, csv)                  ▼ (pdf)
     [FileReader readAsText]           [pdfjs-dist load Document]
            │                                 │
            │                                 ▼
            │                         (Extract text content)
            │                                 │
            │                        (String Length < 20?)
            │                                 │
            │                      ┌──────────┴──────────┐
            │                      ▼ (No)                ▼ (Yes: Scanned PDF)
            │               [Extract Text Runs]     [For each PDF Page]
            │                      │                     │
            │                      │                     ▼
            │                      │             1. Render page to Canvas
            │                      │             2. Run Tesseract.js OCR
            │                      │             3. Accumulate OCR string text
            │                      │                     │
            v                      v                     v
      +────────────────────────────────────────────────────────+
      |               Concatenated Resume Text Buffer          |
      +────────────────────────────────────────────────────────+
```

* **PDF.js Text Runner**: Parses binary streams to extract text items.
* **OCR Canvas Pipeline**:
  1. The page viewport is scaled to `2.0` (high resolution) to capture details clearly.
  2. The page draws to a virtual `<canvas>` element via `page.render()`.
  3. `Tesseract.recognize(canvas, 'eng')` parses the canvas pixel array to output raw English characters.

#### 2. Compatibility Evaluation
The resume string and job requirements are passed to Groq API's **Llama-3.1-8b-instant** model.
* Configured with JSON constraints (`response_format: { type: "json_object" }`).
* Evaluates keyword density (categorizing items as `found` or `missing`), pinpoints weak statements, creates metric-driven rewrites, and constructs a custom introductory profile summary.

---

### ⚙️ D. Gamification & Progression Mechanics
Users stay engaged by earning experience points (XP) and leveling up.

#### 1. Daily Streak Increment Algorithm
When the `AuthContext` mounts or receives a session change:
1. Fetches `/users/{uid}` from Firestore.
2. Reads `lastActiveDate` and computes standard day differences:
   ```javascript
   const today = new Date().toDateString();
   const lastActive = new Date(profile.lastActiveDate).toDateString();
   const diffDays = Math.ceil(Math.abs(new Date(today) - new Date(lastActive)) / (1000 * 60 * 60 * 24));
   ```
3. Updates streak counters:
   * `diffDays === 1`: Increments `streak` by 1.
   * `diffDays > 1`: Resets `streak` to 1 (broken streak).
   * `diffDays === 0`: Streak remains the same.
4. Writes the current time back as the new `lastActiveDate`.

#### 2. Level Up Math Formula
The total XP increments dynamically (+150 XP on graded mocks, +50 XP on resume audits). Level calculations use a static 300 XP bracket step:
$$\text{Level} = \left\lfloor \frac{\text{Total XP}}{300} \right\rfloor + 1$$
* Whenever `newLevel > previousLevel`, the context awards the user a *Level X Mastery* badge and updates the Firestore achievements array.

---

## 📚 4. Crucial Computer Science Concepts & Patterns Applied

1. **Separation of Concerns (SoC)**
   * UI components (`CodingArenaPage.jsx`, `SettingsPage.jsx`) focus only on rendering states.
   * Data access and backend APIs are decoupled into modular clients (`src/services/aiService.js`, `src/services/codeExecutionService.js`).
2. **React Context API State Syncing**
   * Global profile data and XP changes are stored in `AuthContext` to instantly sync the top-level progression bars (Sidebar, Dashboard) without complex prop-drilling.
3. **Decentralized Client-Side Compute**
   * Heavy OCR operations are offloaded to Web Workers using `Tesseract.js` inside the browser, saving database processing power.
4. **Virtualization & Sandboxing**
   * Encapsulates running programs in isolated virtual runtime nodes (Docker) to enforce clean sandboxing constraints.

---

## 🙋 5. Review & Exam Defenses preparation Q&A

**Q1: Why did we switch the Resume Analyzer from Gemini to Groq?**
* **Answer**: Gemini endpoints (like `gemini-2.5-flash`) often encounter 503 (High Demand) rate limits under free-tier developer keys. Groq offers highly available, fast inference endpoints (e.g. `llama-3.1-8b-instant`) with strict JSON schema outputs, eliminating text-parsing crashes.

**Q2: What prevents infinite loops in user coding submissions?**
* **Answer**: When server.cjs spawns the Docker run command, it defines container resource caps, and utilizes container timeout rules. If a process does not complete within 5 seconds, the runtime daemon halts it.

**Q3: How does the system read scanned PDF files?**
* **Answer**: It reads text nodes first. If the page yields fewer than 20 characters, it flags the document as scanned, renders each PDF page to an HTML canvas at double-scale, and uses `Tesseract.js` client-side optical character recognition to read the text.

**Q4: How does the proctoring engine detect cheating?**
* **Answer**: It listens to window `blur` and `visibilitychange` events. Swapping tabs triggers these event hooks, incrementing an infraction counter which decreases the final "Trust Score" by 15% per violation.
