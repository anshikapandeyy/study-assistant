# Study Assistant

An interactive, AI-driven study tool built with React that turns notes or free-form topics into elegant, structured 3D flashcards and multiple-choice quizzes using Gemini 3.5 Flash.

This project implements a secure backend proxy to prevent leaking API credentials, handles LLM failures gracefully (empty outputs, API outages, malformed JSON, and race conditions), and works beautifully across desktop and mobile browsers.

---

## Features

### 🌟 Core Features
- **Flexible Inputs**: Paste lecture notes (up to 3000 characters) or enter a brief topic description.
- **Structured AI Generation**: Backend validates and sanitizes raw JSON output using structural schema constraints.
- **3D Interactive Flashcards**: Flip cards using 3D perspective animations, mark cards as *Mastered* or *Needs Practice*, and shuffle the deck.
- **Adaptive Quiz Deck**: Take a 5-question multiple-choice quiz. Get immediate visual feedback on choices with inline explanation boxes.
- **Fail-Safe & Race-Condition Proof**:
  - Uses `AbortController` to cancel pending API calls if the user fires a new request, preventing older slow requests from overwriting newer ones.
  - Implements a secondary parser/sanitizer to recover from missing fields, incorrect indices, or empty fields from the AI.
  - Encompassed in a React `ErrorBoundary` to gracefully capture unexpected render failures.

### 🚀 Stretch Accomplishments
- **Session History & Offline Mode**: Saves up to 10 generated study sets to local storage (`localStorage`). Users can reload them instantly or clear them without invoking the API again.
- **Incorrect Answer Re-testing**:
  - For Flashcards: Option to review only the cards marked *Needs Practice*.
  - For Quizzes: Option to retry only the questions answered incorrectly.
- **Seamless Tabs**: Switch back and forth between Flashcards and Quiz modes for the same study set.
- **Keyboard Navigation**: Flip cards via `Space`, navigate cards via `Left/Right Arrows`, and mark mastery using `Up/Down Arrows`.
- **Aesthetic Dark Theme**: Premium Glassmorphic design with smooth hover micro-animations and glowing indicators.

---

## Technology Stack

- **Frontend**: React 19, Vite, Lucide React (Icons)
- **Styling**: Vanilla CSS Custom Variables & transitions (no heavy libraries, optimized for mobile)
- **Backend Proxy**: Node.js, Express, Cors, Dotenv
- **AI SDK**: Google Gen AI SDK (`@google/genai`) invoking Gemini 3.5 Flash

---

## Setup & Running Locally

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed (v18+ recommended).

### 2. Install Dependencies
Run this single command in the project root directory. It will install root dev-dependencies and automatically trigger dependency installs in both the `frontend/` and `backend/` subdirectories:
```bash
npm install
```

### 3. Configure API Key
1. Navigate to the `backend` directory.
2. Copy the `.env.example` file and rename it to `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Open `backend/.env` and paste your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

### 4. Start the Application
From the root directory, run:
```bash
npm start
```
This launches both the **Express backend proxy (Port 3001)** and the **Vite React dev server (Port 5173)** concurrently. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## AI-Usage Note
- Scaffolding the React components, configuring Vite, and designing the CSS 3D flipping transforms were accelerated using **Antigravity (Gemini 3.5 Flash)**.
- Structural schema definitions were cross-referenced with the new official Google Gen AI SDK documentation.

---

## Known Limitations
1. **Input Length**: Restricted to 3000 characters to prevent prompt truncation and optimize response latency.
2. **Offline Generation**: Although previously saved sets can be studied offline, generating *new* sets requires an active internet connection to contact the backend proxy and Gemini.
3. **Local Storage Limit**: Cap at 10 saved sessions to prevent browser quota exhaustion.

---

## Time Spent
- **Total Time**: ~8 hours
  - *Architecture & Backend Setup*: 4 hour
  - *Frontend State & Core Components*: 2 hours
  - *Failure Handling (AbortController, Sanitizer, Error Boundary)*: 1.5 hours
  - *Testing & Refinements (Keyboard binds, LocalStorage history)*: 0.5 hours
