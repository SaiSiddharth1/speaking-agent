import { useState } from "react";

const phases = [
    {
        id: 1,
        title: "Phase 1 — Setup & Foundation",
        color: "#00C9A7",
        accent: "#00FFC8",
        icon: "⚙️",
        duration: "Days 1–7",
        days: [
            {
                day: 1,
                title: "Project Bootstrap",
                branch: "feature/project-setup",
                commit: "chore: initialize repo structure",
                goal: "Create GitHub repo, define folder structure for frontend & backend",
                tasks: [
                    "Create GitHub repo: speaking-agent",
                    "Create /frontend and /backend folders",
                    "Add root .gitignore (node_modules, __pycache__, .env)",
                    "Write a solid README.md with project overview",
                    "Push first commit to main branch",
                ],
                concepts: ["Monorepo structure", "Git branching strategy"],
                avoid: "Don't over-engineer the folder structure. Keep it flat for now.",
                done: "Repo is live on GitHub with clean structure",
            },
            {
                day: 2,
                title: "FastAPI Backend Init",
                branch: "feature/backend-init",
                commit: "feat: initialize FastAPI project",
                goal: "Set up a running FastAPI server with a health check route",
                tasks: [
                    "cd /backend → create virtual environment",
                    "pip install fastapi uvicorn python-dotenv",
                    "Create main.py with a GET /health endpoint",
                    "Create requirements.txt",
                    "Test server runs: uvicorn main:app --reload",
                ],
                concepts: ["FastAPI basics", "Virtual environments", "REST endpoints"],
                avoid: "Don't add DB or auth yet. Just get the server running.",
                done: "GET /health returns { status: ok } in browser",
            },
            {
                day: 3,
                title: "MySQL + DB Connection",
                branch: "feature/db-setup",
                commit: "feat: add MySQL connection and base config",
                goal: "Connect FastAPI to MySQL, verify connection works",
                tasks: [
                    "Install MySQL locally (or use XAMPP/Docker)",
                    "Create database: speaking_agent",
                    "pip install sqlalchemy pymysql",
                    "Create database.py with engine + session",
                    "Test connection with a simple query",
                ],
                concepts: ["SQLAlchemy ORM", "Connection strings", "Session management"],
                avoid: "Don't create all tables yet. Just verify connection.",
                done: "FastAPI connects to MySQL without errors",
            },
            {
                day: 4,
                title: "Expo React Native Init",
                branch: "feature/frontend-init",
                commit: "feat: initialize Expo React Native project",
                goal: "Run a working Expo app on your phone or emulator",
                tasks: [
                    "npx create-expo-app frontend --template blank-typescript",
                    "cd frontend → npx expo start",
                    "Scan QR code with Expo Go app on phone",
                    "Edit App.tsx — see your change live",
                    "Add folder structure: /screens /components /hooks /services",
                ],
                concepts: ["Expo workflow", "Metro bundler", "Hot reload"],
                avoid: "Don't install navigation yet. Understand the basics first.",
                done: "App runs on real device with live reload working",
            },
            {
                day: 5,
                title: "Navigation Setup",
                branch: "feature/navigation",
                commit: "feat: add React Navigation stack",
                goal: "Navigate between 2 screens (Home → Practice)",
                tasks: [
                    "npm install @react-navigation/native @react-navigation/stack",
                    "Install peer deps: react-native-screens, react-native-safe-area-context",
                    "Create HomeScreen.tsx and PracticeScreen.tsx",
                    "Set up AppNavigator with Stack.Navigator",
                    "Add a button that navigates between screens",
                ],
                concepts: ["Stack Navigator", "Screen params", "Navigation props"],
                avoid: "Don't build real screens yet — just placeholders with titles.",
                done: "Can navigate back and forth between 2 placeholder screens",
            },
            {
                day: 6,
                title: "Environment Config",
                branch: "feature/env-config",
                commit: "chore: add environment config and API base setup",
                goal: "Set up .env files, API base URL config, and axios",
                tasks: [
                    "Create backend/.env → DATABASE_URL, SECRET_KEY",
                    "Create frontend/.env → EXPO_PUBLIC_API_URL",
                    "npm install axios",
                    "Create frontend/services/api.ts with axios instance",
                    "Test: frontend calls GET /health from backend",
                ],
                concepts: ["Environment variables", "Axios interceptors", "CORS basics"],
                avoid: "Don't hardcode any URLs or secrets in code.",
                done: "Frontend successfully calls backend health check",
            },
            {
                day: 7,
                title: "Week 1 Review & Cleanup",
                branch: "main (merge all)",
                commit: "chore: phase 1 complete - setup & foundation",
                goal: "Review everything built, fix issues, merge to main",
                tasks: [
                    "Test full stack: frontend ↔ backend ↔ DB",
                    "Clean up any hardcoded values",
                    "Update README with setup instructions",
                    "Merge all feature branches → main",
                    "Tag release: v0.1.0-setup",
                ],
                concepts: ["Code review mindset", "Git tagging"],
                avoid: "Don't skip this day. Cleanup prevents debt.",
                done: "Clean main branch. Anyone can clone and run the project.",
            },
        ],
    },
    {
        id: 2,
        title: "Phase 2 — Authentication System",
        color: "#6C63FF",
        accent: "#A79BFF",
        icon: "🔐",
        duration: "Days 8–16",
        days: [
            {
                day: 8,
                title: "User Model & Schema",
                branch: "feature/auth-system",
                commit: "feat: add User model and DB schema",
                goal: "Create the User table in MySQL via SQLAlchemy",
                tasks: [
                    "Create models/user.py with SQLAlchemy User model",
                    "Fields: id, email, password_hash, name, created_at",
                    "Create schemas/user.py with Pydantic schemas",
                    "Run Base.metadata.create_all() to create table",
                    "Verify table exists in MySQL",
                ],
                concepts: ["SQLAlchemy models", "Pydantic validation", "DB migrations basics"],
                avoid: "Don't use Alembic yet. Just create_all() for MVP.",
                done: "users table exists in MySQL with correct columns",
            },
            {
                day: 9,
                title: "Register Endpoint",
                branch: "feature/auth-system",
                commit: "feat: add user registration endpoint",
                goal: "POST /auth/register creates a user with hashed password",
                tasks: [
                    "pip install passlib[bcrypt]",
                    "Create auth/router.py with POST /register",
                    "Hash password with bcrypt before saving",
                    "Return user data (never return password)",
                    "Test with Postman or FastAPI /docs",
                ],
                concepts: ["Password hashing", "Bcrypt", "FastAPI routers"],
                avoid: "Never store plain text passwords. Ever.",
                done: "POST /register creates user in DB with hashed password",
            },
            {
                day: 10,
                title: "Login + JWT Tokens",
                branch: "feature/auth-system",
                commit: "feat: add login with JWT token generation",
                goal: "POST /auth/login returns a JWT access token",
                tasks: [
                    "pip install python-jose[cryptography]",
                    "Create utils/jwt.py with create_token and verify_token",
                    "Add POST /auth/login endpoint",
                    "Verify email + password → return access_token",
                    "Test login with correct and wrong credentials",
                ],
                concepts: ["JWT structure", "HS256 signing", "Token expiry"],
                avoid: "Don't put your SECRET_KEY in code. Use .env.",
                done: "Login returns a valid JWT. Wrong password returns 401.",
            },
            {
                day: 11,
                title: "Auth Middleware",
                branch: "feature/auth-system",
                commit: "feat: add JWT auth dependency for protected routes",
                goal: "Create a reusable auth dependency for protected endpoints",
                tasks: [
                    "Create dependencies/auth.py with get_current_user()",
                    "Decode JWT and return user from DB",
                    "Add protected test route: GET /users/me",
                    "Test with valid token → returns user",
                    "Test with no token → returns 401",
                ],
                concepts: ["FastAPI Depends()", "Bearer tokens", "HTTP 401 vs 403"],
                avoid: "Don't protect all routes yet. Just test the pattern.",
                done: "GET /users/me works with token, fails without it",
            },
            {
                day: 12,
                title: "Login Screen UI",
                branch: "feature/auth-screens",
                commit: "feat: add Login and Register screens",
                goal: "Build clean Login and Register screens in React Native",
                tasks: [
                    "Create screens/LoginScreen.tsx with email + password fields",
                    "Create screens/RegisterScreen.tsx",
                    "Add basic form validation (empty fields check)",
                    "Style with StyleSheet — keep it clean",
                    "Add loading state (ActivityIndicator while API call)",
                ],
                concepts: ["TextInput", "useState for forms", "KeyboardAvoidingView"],
                avoid: "Don't use any form library yet. Plain useState is enough.",
                done: "Both screens look good, have validation, have loading state",
            },
            {
                day: 13,
                title: "Connect Auth to Backend",
                branch: "feature/auth-screens",
                commit: "feat: connect auth screens to backend API",
                goal: "Real login/register that calls your FastAPI backend",
                tasks: [
                    "Create services/authService.ts with login() and register()",
                    "On login success: save JWT to AsyncStorage",
                    "On register success: auto-login or redirect to Login",
                    "Handle errors: show inline error messages",
                    "Create useAuth() hook for auth state",
                ],
                concepts: ["AsyncStorage", "Auth state management", "Error UX"],
                avoid: "Don't use Redux yet. useContext or simple state is fine.",
                done: "Real users can register and log in from the phone",
            },
            {
                day: 14,
                title: "Auth Guard + Navigation",
                branch: "feature/auth-screens",
                commit: "feat: add auth guard and navigator split",
                goal: "Redirect to Login if not authenticated, Home if logged in",
                tasks: [
                    "Create AuthNavigator (Login, Register)",
                    "Create AppNavigator (Home, Practice)",
                    "Create RootNavigator that switches based on auth state",
                    "Read token from AsyncStorage on app start",
                    "Add Logout button that clears token",
                ],
                concepts: ["Conditional navigation", "App state on mount", "UX flow"],
                avoid: "Don't flash wrong screen on startup. Handle loading state.",
                done: "Logged out → Login screen. Logged in → Home screen. Logout works.",
            },
            {
                day: 15,
                title: "Token Refresh + API Auth",
                branch: "feature/auth-screens",
                commit: "feat: add auth header to all API requests",
                goal: "Every API call automatically includes the JWT token",
                tasks: [
                    "Add axios request interceptor: attach Authorization header",
                    "Add axios response interceptor: handle 401 → logout",
                    "Test protected route from frontend (GET /users/me)",
                    "Store user data in context after login",
                    "Show user name on Home screen",
                ],
                concepts: ["Axios interceptors", "Token auto-attach", "401 handling"],
                avoid: "Don't manually add token to every request. Use interceptor.",
                done: "All API calls have token. 401 anywhere logs user out.",
            },
            {
                day: 16,
                title: "Auth Phase Review",
                branch: "main",
                commit: "feat: complete auth system - login, register, JWT",
                goal: "Full auth flow works end to end. Merge and tag.",
                tasks: [
                    "Full flow test: Register → Login → See home → Logout → Login again",
                    "Test edge cases: wrong password, duplicate email",
                    "Clean up console.logs",
                    "Merge to main",
                    "Tag: v0.2.0-auth",
                ],
                concepts: ["E2E thinking", "Happy path + edge cases"],
                avoid: "Don't move to next phase with broken auth. It's the foundation.",
                done: "Auth works perfectly. Tag on GitHub.",
            },
        ],
    },
    {
        id: 3,
        title: "Phase 3 — Voice Recording & STT",
        color: "#FF6B6B",
        accent: "#FFB3B3",
        icon: "🎤",
        duration: "Days 17–28",
        days: [
            {
                day: 17,
                title: "Audio Permissions + Recording",
                branch: "feature/voice-recording",
                commit: "feat: add audio recording with Expo AV",
                goal: "Record voice on phone and play it back",
                tasks: [
                    "npx expo install expo-av",
                    "Request microphone permission on component mount",
                    "Create useAudioRecorder() hook",
                    "Implement startRecording() and stopRecording()",
                    "Play back the recorded audio with Audio.Sound",
                ],
                concepts: ["expo-av", "Audio.Recording API", "Permissions flow"],
                avoid: "Test on real device — emulator microphone is unreliable.",
                done: "Can record voice and hear it played back on phone",
            },
            {
                day: 18,
                title: "Recording UI",
                branch: "feature/voice-recording",
                commit: "feat: build voice recording UI with visual feedback",
                goal: "Beautiful record button with recording state feedback",
                tasks: [
                    "Build PracticeScreen with a large Record button",
                    "Button states: idle → recording → processing",
                    "Show recording timer (00:00 counting up)",
                    "Pulsing animation while recording (Animated API)",
                    "Show waveform placeholder (static bars for now)",
                ],
                concepts: ["Animated API", "Button states", "UX for voice apps"],
                avoid: "Don't spend more than 1hr on animations. Ship working UI first.",
                done: "Screen looks professional. Record → Stop flow is clear.",
            },
            {
                day: 19,
                title: "Upload Audio to Backend",
                branch: "feature/voice-recording",
                commit: "feat: upload recorded audio to FastAPI backend",
                goal: "Send recorded .m4a file from phone to backend",
                tasks: [
                    "Create FormData with audio file in React Native",
                    "POST to /speech/upload with multipart form data",
                    "Create FastAPI endpoint POST /speech/upload",
                    "Save file to backend /uploads/ folder",
                    "Return filename or file_id in response",
                ],
                concepts: ["FormData in React Native", "multipart/form-data", "File storage"],
                avoid: "Don't skip error handling — network errors are common with file uploads.",
                done: "Recorded file appears in backend /uploads/ folder",
            },
            {
                day: 20,
                title: "Whisper STT Integration",
                branch: "feature/stt",
                commit: "feat: integrate Whisper speech-to-text",
                goal: "Convert uploaded audio file to text using Whisper",
                tasks: [
                    "pip install openai-whisper (or use Groq Whisper API)",
                    "Create services/stt.py with transcribe(file_path) function",
                    "Add transcription to the upload endpoint",
                    "Return transcribed text in response",
                    "Test with a recording of yourself speaking",
                ],
                concepts: ["Whisper model sizes", "Groq Whisper API (faster)", "Audio formats"],
                avoid: "Use Groq's Whisper API instead of local — much faster on Windows.",
                done: "Upload audio → get back accurate English transcription",
            },
            {
                day: 21,
                title: "Display Transcription",
                branch: "feature/stt",
                commit: "feat: display STT transcription on practice screen",
                goal: "Show what the user said as text after recording",
                tasks: [
                    "After upload: show loading state ('Listening...')",
                    "Display transcribed text in a card below recording button",
                    "Handle empty transcription (silence detected)",
                    "Add 'Try again' button to re-record",
                    "Store transcription in component state",
                ],
                concepts: ["Loading states for async", "Error UX"],
                avoid: "Don't store anything to DB yet. Just display it.",
                done: "Record → Upload → See your words as text on screen",
            },
            {
                day: 22,
                title: "Groq LLM Setup",
                branch: "feature/ai-conversation",
                commit: "feat: setup Groq API client for LLM conversation",
                goal: "Send a message to LLaMA 3 via Groq and get a response",
                tasks: [
                    "Get Groq API key (free at console.groq.com)",
                    "pip install groq",
                    "Create services/llm.py with get_response(message) function",
                    "Create POST /chat/respond endpoint",
                    "Test: send 'Hello' → get AI response",
                ],
                concepts: ["Groq API", "LLaMA 3 70B", "System prompts"],
                avoid: "Keep your system prompt simple for now. Refine later.",
                done: "FastAPI returns an AI-generated English coaching response",
            },
            {
                day: 23,
                title: "Coaching System Prompt",
                branch: "feature/ai-conversation",
                commit: "feat: add English coach system prompt to LLM",
                goal: "LLM behaves as a professional English speaking coach",
                tasks: [
                    "Write a detailed system prompt for the AI coach",
                    "Prompt should: correct grammar, give feedback, encourage",
                    "Include: user's transcription → AI responds with feedback",
                    "Add conversation_history parameter to maintain context",
                    "Test 3+ turn conversation in Postman",
                ],
                concepts: ["System prompts", "Conversation history", "Few-shot examples"],
                avoid: "Don't make the prompt too long. Keep it focused on coaching.",
                done: "AI responds like a real English coach with useful feedback",
            },
            {
                day: 24,
                title: "Edge-TTS Integration",
                branch: "feature/tts",
                commit: "feat: add Edge-TTS text-to-speech for AI responses",
                goal: "Convert AI text response to audio using Edge-TTS",
                tasks: [
                    "pip install edge-tts",
                    "Create services/tts.py with speak(text) → saves audio file",
                    "Choose a natural English voice (en-US-AriaNeural)",
                    "Return audio file URL in chat response",
                    "Test: AI response text → playable audio file",
                ],
                concepts: ["edge-tts async API", "Neural TTS voices", "Audio file serving"],
                avoid: "Cache TTS files if same text repeats — saves time.",
                done: "Backend generates audio from AI text. File is accessible via URL.",
            },
            {
                day: 25,
                title: "Play AI Voice in App",
                branch: "feature/tts",
                commit: "feat: auto-play AI voice response in practice screen",
                goal: "App automatically plays the AI coach's voice after recording",
                tasks: [
                    "After getting chat response: fetch audio URL",
                    "Use expo-av to play the audio file from URL",
                    "Show 'Coach is speaking...' state while audio plays",
                    "Add skip button to stop playback",
                    "Show AI text response as subtitle while playing",
                ],
                concepts: ["Audio.Sound.createAsync()", "Remote audio URLs", "UX state machine"],
                avoid: "Handle network errors — audio URL might load slowly.",
                done: "Full loop: Record → Transcribe → AI responds → Hear coach voice",
            },
            {
                day: 26,
                title: "Conversation Session",
                branch: "feature/ai-conversation",
                commit: "feat: multi-turn conversation session management",
                goal: "Maintain full conversation history across multiple turns",
                tasks: [
                    "Store conversation history in backend (in-memory session or DB)",
                    "Create Session model: session_id, user_id, messages[]",
                    "Each turn: append user message + AI response to session",
                    "Frontend keeps track of session_id",
                    "Display conversation history as chat bubbles",
                ],
                concepts: ["Session management", "Chat history structure", "React list rendering"],
                avoid: "Don't store audio files in DB — just file paths.",
                done: "Can have a 5-turn conversation that maintains context",
            },
            {
                day: 27,
                title: "Practice Topics",
                branch: "feature/ai-conversation",
                commit: "feat: add topic selection for practice sessions",
                goal: "Let user choose what to practice before starting",
                tasks: [
                    "Create topics list: Job Interview, Daily Conversation, Storytelling, Debate",
                    "TopicSelectScreen with cards for each topic",
                    "Pass selected topic to system prompt context",
                    "AI adapts coaching style based on topic",
                    "Store topic in session record",
                ],
                concepts: ["Topic-driven prompts", "Screen-to-screen params"],
                avoid: "4 topics max for MVP. Don't add 20 options.",
                done: "User picks a topic → AI coaching is tailored to that topic",
            },
            {
                day: 28,
                title: "Voice Phase Review",
                branch: "main",
                commit: "feat: complete voice + AI conversation pipeline",
                goal: "Full voice practice loop works. Merge and tag.",
                tasks: [
                    "Full session test: Topic → Record → Transcribe → AI Feedback → Voice Response",
                    "Test 5-turn conversation",
                    "Fix any audio glitches or slow responses",
                    "Merge to main",
                    "Tag: v0.3.0-voice",
                ],
                concepts: ["End-to-end testing", "Latency awareness"],
                avoid: "If response time > 5s, investigate which step is slow.",
                done: "Smooth voice practice session from start to finish",
            },
        ],
    },
    {
        id: 4,
        title: "Phase 4 — Scoring & Feedback Engine",
        color: "#F59E0B",
        accent: "#FCD34D",
        icon: "📊",
        duration: "Days 29–42",
        days: [
            {
                day: 29,
                title: "Scoring Architecture",
                branch: "feature/scoring-engine",
                commit: "feat: design and scaffold scoring engine",
                goal: "Understand what to score and how. Design the engine.",
                tasks: [
                    "Define 5 scoring dimensions: Grammar, Fluency, Confidence, Clarity, Vocabulary",
                    "Scoring scale: 0-100 per dimension",
                    "Design ScoreResult schema: {grammar: 72, fluency: 85, ...}",
                    "Create services/scorer.py placeholder",
                    "Decide: rule-based scoring vs LLM-based scoring",
                ],
                concepts: ["Scoring rubrics", "LLM-as-judge pattern", "Schema design"],
                avoid: "Don't overcomplicate. LLM scoring is simplest and most accurate for MVP.",
                done: "Clear scoring schema defined. scorer.py file exists.",
            },
            {
                day: 30,
                title: "LLM-Based Scorer",
                branch: "feature/scoring-engine",
                commit: "feat: implement LLM scoring for all 5 dimensions",
                goal: "Use Groq LLaMA to score a transcript on all 5 dimensions",
                tasks: [
                    "Write scoring prompt: 'Score this English speech on: ...'",
                    "Ask LLM to return ONLY JSON: {grammar: X, fluency: X, ...}",
                    "Create score_transcript(transcript) function in scorer.py",
                    "Test with 3 sample transcripts (good, medium, poor)",
                    "Validate JSON output is consistent",
                ],
                concepts: ["Structured LLM output", "JSON mode prompting", "Scoring consistency"],
                avoid: "Add json_object response format if model supports it.",
                done: "Transcripts scored reliably. JSON output is parseable.",
            },
            {
                day: 31,
                title: "Grammar Feedback",
                branch: "feature/scoring-engine",
                commit: "feat: add specific grammar correction feedback",
                goal: "AI identifies specific grammar mistakes and corrects them",
                tasks: [
                    "Extend scoring prompt to also return: grammar_errors[]",
                    "Each error: { original: '...', correction: '...', tip: '...' }",
                    "Create grammar feedback component in React Native",
                    "Highlight error phrases in the transcription",
                    "Show correction below each highlighted phrase",
                ],
                concepts: ["Inline annotations", "Text highlighting in RN", "Feedback UX"],
                avoid: "Max 3 errors shown per session to avoid overwhelming user.",
                done: "Grammar mistakes shown clearly with corrections",
            },
            {
                day: 32,
                title: "Fluency Analysis",
                branch: "feature/scoring-engine",
                commit: "feat: add fluency and filler word detection",
                goal: "Detect filler words (um, uh, like) and speaking pace",
                tasks: [
                    "Count filler words in transcript (um, uh, like, you know)",
                    "Calculate words per minute (words / recording_duration_seconds * 60)",
                    "Good pace: 120-160 WPM. Too fast > 180, too slow < 100",
                    "Return fluency breakdown in score result",
                    "Display WPM + filler count in feedback card",
                ],
                concepts: ["WPM calculation", "Regex for filler detection", "Pace feedback"],
                avoid: "Don't penalize non-native speakers too harshly. Be encouraging.",
                done: "Fluency card shows WPM and filler word count",
            },
            {
                day: 33,
                title: "Confidence Score",
                branch: "feature/scoring-engine",
                commit: "feat: add confidence scoring based on language patterns",
                goal: "Score confidence based on hedging language and assertiveness",
                tasks: [
                    "Detect hedging phrases: 'I think maybe', 'I'm not sure but', 'possibly'",
                    "Detect confidence markers: assertive sentences, active voice",
                    "Let LLM score confidence 0-100 with explanation",
                    "Show confidence tip: 'Try speaking in complete, direct sentences'",
                    "Add motivational message based on score",
                ],
                concepts: ["Linguistic confidence markers", "Motivational UX"],
                avoid: "This is subjective — LLM scoring works better than rules here.",
                done: "Confidence score shown with actionable tip",
            },
            {
                day: 34,
                title: "Session Summary Screen",
                branch: "feature/scoring-engine",
                commit: "feat: build session summary with score cards",
                goal: "Show a complete summary after each practice session",
                tasks: [
                    "Create SessionSummaryScreen",
                    "Show 5 score bars (animated 0 → actual score)",
                    "Show total score (average of 5 dimensions)",
                    "Show top 1 improvement tip from AI",
                    "Add 'Practice Again' and 'Go to Dashboard' buttons",
                ],
                concepts: ["Animated bars", "Score aggregation", "Session end UX"],
                avoid: "Don't show all errors here. Just top insight + overall score.",
                done: "Beautiful summary screen with animated scores",
            },
            {
                day: 35,
                title: "Store Sessions in DB",
                branch: "feature/scoring-engine",
                commit: "feat: persist sessions and scores to MySQL",
                goal: "Save every practice session and scores to database",
                tasks: [
                    "Create Session model (user_id, topic, transcript, scores, created_at)",
                    "Create Score model linked to Session",
                    "After session: POST /sessions/save endpoint",
                    "Store full session data on session end",
                    "GET /sessions/history returns user's past sessions",
                ],
                concepts: ["DB relationships", "One-to-many (User → Sessions)"],
                avoid: "Don't store audio files in DB — only file path references.",
                done: "Sessions saved to DB. Can retrieve history from API.",
            },
            {
                day: 36,
                title: "Pronunciation Hints",
                branch: "feature/scoring-engine",
                commit: "feat: add pronunciation tips to AI feedback",
                goal: "AI suggests which words the user might be mispronouncing",
                tasks: [
                    "Add pronunciation dimension to scoring prompt",
                    "Ask LLM: identify words in transcript likely mispronounced",
                    "Return: [{word: 'particularly', tip: 'Focus on -ar- not -ler-'}]",
                    "Show pronunciation tips card in session summary",
                    "Add phonetic hint for each flagged word",
                ],
                concepts: ["Phonetics basics", "LLM-guided pronunciation coaching"],
                avoid: "LLM can't hear audio — it infers from context. That's fine for MVP.",
                done: "1-3 pronunciation tips appear in session summary",
            },
            {
                day: 37,
                title: "Vocabulary Enhancement",
                branch: "feature/scoring-engine",
                commit: "feat: add vocabulary upgrade suggestions",
                goal: "AI suggests better word choices for the user's level",
                tasks: [
                    "Ask LLM to identify basic words that could be upgraded",
                    "Return: [{used: 'good', suggestion: 'excellent / commendable', context: '...'}]",
                    "Show vocabulary upgrade card in feedback",
                    "Link to example sentence using the upgraded word",
                    "Score vocabulary: 0-100 based on word sophistication",
                ],
                concepts: ["Lexical diversity", "Word choice coaching"],
                avoid: "Suggest max 3 vocabulary upgrades. Don't overwhelm.",
                done: "Vocabulary section shows upgrade suggestions with examples",
            },
            {
                day: 38,
                title: "Feedback Quality Testing",
                branch: "feature/scoring-engine",
                commit: "test: validate scoring accuracy with diverse samples",
                goal: "Test scoring with real recordings — make sure it makes sense",
                tasks: [
                    "Record 5 test sessions yourself (beginner, intermediate, strong)",
                    "Verify scores are logical (better speech = higher score)",
                    "Check grammar feedback accuracy",
                    "Adjust prompts if scores feel off",
                    "Document what the system scores well vs poorly",
                ],
                concepts: ["Prompt iteration", "Evaluation loop", "Human-in-the-loop"],
                avoid: "Don't over-tune for your own voice. Test with different accents.",
                done: "Scoring feels accurate and fair across different speech samples",
            },
            {
                day: 39,
                title: "Daily Challenge Mode",
                branch: "feature/scoring-engine",
                commit: "feat: add daily speaking challenge topics",
                goal: "Show a daily prompt that users practice with",
                tasks: [
                    "Create a list of 30 speaking prompts (1 per day)",
                    "Backend: GET /challenges/today returns today's prompt",
                    "Show challenge card on Home screen",
                    "Practice with challenge → session tagged as challenge session",
                    "Show streak counter for daily challenges",
                ],
                concepts: ["Daily content rotation", "Streak logic", "Engagement patterns"],
                avoid: "Keep prompts realistic and motivating, not too difficult.",
                done: "Daily challenge appears on Home screen and is practiceble",
            },
            {
                day: 40,
                title: "Feedback Phase Review",
                branch: "main",
                commit: "feat: complete scoring and feedback engine",
                goal: "All scoring dimensions work. Merge and tag.",
                tasks: [
                    "Test complete session: Record → Score → Summary → Save to DB",
                    "Verify all 5 scoring dimensions work",
                    "Clean up prompts and response parsing",
                    "Merge to main",
                    "Tag: v0.4.0-scoring",
                ],
                concepts: ["System integration testing"],
                avoid: "Don't move on if scores are wildly inaccurate. Fix prompts first.",
                done: "Scoring engine works reliably. Data is saved.",
            },
            {
                day: 41,
                title: "Score Trends API",
                branch: "feature/dashboard",
                commit: "feat: add score trends and analytics API",
                goal: "API returns user's score history for charting",
                tasks: [
                    "GET /analytics/trends returns last 7 sessions with scores",
                    "Calculate averages per dimension over time",
                    "Calculate overall improvement: latest avg vs first avg",
                    "Return weekly summary data",
                    "Test with seed data (create fake sessions)",
                ],
                concepts: ["Aggregation queries", "Analytics data shape"],
                avoid: "Don't over-engineer. Simple array of {date, scores} is enough.",
                done: "API returns chartable trend data per user",
            },
            {
                day: 42,
                title: "Progress Dashboard Screen",
                branch: "feature/dashboard",
                commit: "feat: build progress dashboard with score charts",
                goal: "Show user's improvement over time in a beautiful dashboard",
                tasks: [
                    "Install: npm install react-native-chart-kit (or Victory Native)",
                    "Create DashboardScreen",
                    "Line chart: Overall score trend over last 7 sessions",
                    "Bar chart: Latest session — all 5 dimensions",
                    "Stats row: Total sessions, Current streak, Best score",
                ],
                concepts: ["react-native-chart-kit", "Data visualization for mobile"],
                avoid: "Keep charts simple. 2 charts max on this screen.",
                done: "Dashboard shows beautiful, real data from user's sessions",
            },
        ],
    },
    {
        id: 5,
        title: "Phase 5 — Polish & Product Layer",
        color: "#10B981",
        accent: "#6EE7B7",
        icon: "✨",
        duration: "Days 43–55",
        days: [
            {
                day: 43,
                title: "Streak & Achievement System",
                branch: "feature/gamification",
                commit: "feat: add streak tracking and milestone badges",
                goal: "Reward users for consistent practice with streaks and badges",
                tasks: [
                    "Track consecutive daily practice days in DB",
                    "Award badges: 3-day streak, 10 sessions, first 80+ score",
                    "Create AchievementScreen with badge grid",
                    "Push local notification reminders (expo-notifications)",
                    "Show streak fire emoji on Home screen",
                ],
                concepts: ["Gamification patterns", "Expo notifications", "Local DB queries"],
                avoid: "Don't add too many badges. 5-8 meaningful ones.",
                done: "Streaks tracked. Badges unlock. Reminder notification works.",
            },
            {
                day: 44,
                title: "Profile Screen",
                branch: "feature/product-layer",
                commit: "feat: add user profile screen",
                goal: "Show user info, level, total stats, and settings",
                tasks: [
                    "Create ProfileScreen",
                    "Show: name, email, member since, total sessions, best score",
                    "Show level: Beginner (0-40) / Intermediate (40-70) / Advanced (70+)",
                    "Add avatar placeholder (initials-based)",
                    "Link to settings from profile",
                ],
                concepts: ["Level system design", "Profile UX patterns"],
                avoid: "No image upload yet. Initials avatar is fine.",
                done: "Profile shows real user data and level",
            },
            {
                day: 45,
                title: "Settings Screen",
                branch: "feature/product-layer",
                commit: "feat: add settings screen with preferences",
                goal: "Let users customize their experience",
                tasks: [
                    "Create SettingsScreen",
                    "Options: Daily reminder on/off, notification time, preferred voice",
                    "Choose AI coach voice (male/female, accent)",
                    "Dark/light mode toggle (if time allows)",
                    "Save preferences to AsyncStorage",
                ],
                concepts: ["Settings UX", "AsyncStorage for preferences"],
                avoid: "Don't implement dark mode if it takes > 2hrs. Skip for now.",
                done: "Settings save and apply correctly",
            },
            {
                day: 46,
                title: "Session History Screen",
                branch: "feature/product-layer",
                commit: "feat: add session history list with replay",
                goal: "Let users browse and review past practice sessions",
                tasks: [
                    "Create HistoryScreen with FlatList of past sessions",
                    "Each item: date, topic, overall score, duration",
                    "Tap session → SessionDetailScreen",
                    "SessionDetail: full transcript, all scores, AI feedback",
                    "Add 'Practice this topic again' button",
                ],
                concepts: ["FlatList", "Pagination basics", "Detail view pattern"],
                avoid: "Load max 20 sessions at first. Add pagination later.",
                done: "Can browse session history and review any past session",
            },
            {
                day: 47,
                title: "Home Screen Redesign",
                branch: "feature/product-layer",
                commit: "feat: redesign home screen as proper app dashboard",
                goal: "Make the Home screen feel like a real product",
                tasks: [
                    "Redesign HomeScreen layout",
                    "Show: greeting, today's challenge, quick stats, streak",
                    "Large 'Start Practice' CTA button",
                    "Recent sessions mini-list (last 3)",
                    "Progress ring or score preview",
                ],
                concepts: ["Information hierarchy", "Hero section UX"],
                avoid: "Keep it scannable in under 3 seconds. Don't crowd it.",
                done: "Home screen looks like a real app. Feels motivating.",
            },
            {
                day: 48,
                title: "Onboarding Flow",
                branch: "feature/product-layer",
                commit: "feat: add onboarding screens for new users",
                goal: "Guide new users through the app on first launch",
                tasks: [
                    "Create 3 onboarding screens (splash illustrations + text)",
                    "Screen 1: What this app does",
                    "Screen 2: How sessions work",
                    "Screen 3: Set daily goal (5, 10, 15 min/day)",
                    "Store onboarding_complete in AsyncStorage",
                ],
                concepts: ["First-run experience", "Onboarding UX patterns"],
                avoid: "3 screens max. Users want to start, not read.",
                done: "New users see onboarding once then never again",
            },
            {
                day: 49,
                title: "Loading States & Skeletons",
                branch: "feature/ux-polish",
                commit: "feat: add loading skeletons and better UX states",
                goal: "Every screen should handle loading, empty, and error states",
                tasks: [
                    "Add skeleton loaders to Dashboard and History screens",
                    "Add empty states: 'No sessions yet. Start practicing!'",
                    "Add network error states with retry button",
                    "Add pull-to-refresh on History and Dashboard",
                    "Ensure all buttons disable while loading",
                ],
                concepts: ["Skeleton UI", "Empty states", "Error boundaries"],
                avoid: "A blank white screen while loading = bad UX. Always show something.",
                done: "Every screen has loading, empty, and error handled",
            },
            {
                day: 50,
                title: "Micro-interactions & Animation",
                branch: "feature/ux-polish",
                commit: "feat: add micro-interactions and score animations",
                goal: "Make the app feel alive and delightful to use",
                tasks: [
                    "Animate score bars in session summary (0 → score over 1.5s)",
                    "Add haptic feedback on record start/stop (expo-haptics)",
                    "Animate achievement badge unlock",
                    "Add spring animation to record button press",
                    "Smooth screen transitions",
                ],
                concepts: ["Animated API", "expo-haptics", "Spring physics"],
                avoid: "Don't add animation everywhere. Only 4-5 key moments.",
                done: "App feels responsive and polished, not sluggish",
            },
            {
                day: 51,
                title: "Error Handling & Resilience",
                branch: "feature/ux-polish",
                commit: "feat: add comprehensive error handling throughout app",
                goal: "App should never crash. Every error should be caught.",
                tasks: [
                    "Add try/catch to every API call",
                    "Add global error boundary (React ErrorBoundary)",
                    "Handle: network timeout, server error, audio failure",
                    "Show user-friendly error messages (not raw errors)",
                    "Log errors to console with context (not to user)",
                ],
                concepts: ["ErrorBoundary", "Graceful degradation", "User-facing errors"],
                avoid: "Never show stack traces to users.",
                done: "App handles all errors gracefully. Never shows a crash screen.",
            },
            {
                day: 52,
                title: "Performance Optimization",
                branch: "feature/performance",
                commit: "perf: optimize API calls, memoization, and load times",
                goal: "App should be fast and not lag on mid-range phones",
                tasks: [
                    "Add React.memo to heavy components",
                    "Add useMemo/useCallback where lists re-render unnecessarily",
                    "Backend: add indexes to sessions table (user_id, created_at)",
                    "Add response caching for repeated API calls",
                    "Measure and fix slow screens (> 300ms response)",
                ],
                concepts: ["React.memo", "DB indexes", "API caching basics"],
                avoid: "Don't optimize prematurely. Only optimize what's measurably slow.",
                done: "App loads fast. API responses under 2s.",
            },
            {
                day: 53,
                title: "Security Audit",
                branch: "feature/security",
                commit: "security: audit and harden backend endpoints",
                goal: "Ensure app is secure before deployment",
                tasks: [
                    "Review all endpoints: are they protected with auth?",
                    "Add rate limiting to auth endpoints (pip install slowapi)",
                    "Ensure user can only see their own sessions",
                    "Sanitize all text inputs before processing",
                    "Rotate SECRET_KEY, verify .env is in .gitignore",
                ],
                concepts: ["Auth authorization (ownership)", "Rate limiting", "Input sanitization"],
                avoid: "Check GitHub — make sure no secrets were ever committed.",
                done: "No unauthenticated access to user data. Rate limits in place.",
            },
            {
                day: 54,
                title: "Code Cleanup & Refactor",
                branch: "main",
                commit: "refactor: clean up, remove dead code, improve naming",
                goal: "Make the codebase clean and readable",
                tasks: [
                    "Remove all console.log() debug statements",
                    "Extract magic strings to constants",
                    "Organize imports alphabetically",
                    "Add JSDoc/type hints to all major functions",
                    "Review and delete unused files",
                ],
                concepts: ["Code hygiene", "Maintainability"],
                avoid: "Don't refactor everything. Focus on the messiest files.",
                done: "Code is clean, consistent, and ready for others to read",
            },
            {
                day: 55,
                title: "Product Phase Review",
                branch: "main",
                commit: "feat: v0.5.0 - complete product layer",
                goal: "Full product review. Fix any remaining issues.",
                tasks: [
                    "Full user journey test: Onboard → Practice → Score → Dashboard → History",
                    "Test on 2 different devices/screen sizes",
                    "Gather your own feedback: what feels broken?",
                    "Fix top 3 issues",
                    "Tag: v0.5.0-product",
                ],
                concepts: ["User journey testing", "Dogfooding"],
                avoid: "Be honest with yourself. If something feels bad, fix it.",
                done: "App feels like a real product. Ready for deployment prep.",
            },
        ],
    },
    {
        id: 6,
        title: "Phase 6 — Deployment & Launch",
        color: "#8B5CF6",
        accent: "#C4B5FD",
        icon: "🚀",
        duration: "Days 56–65",
        days: [
            {
                day: 56,
                title: "Docker Backend",
                branch: "feature/deployment",
                commit: "feat: dockerize FastAPI backend",
                goal: "Backend runs in a Docker container",
                tasks: [
                    "Create backend/Dockerfile",
                    "Create docker-compose.yml (api + mysql + volume)",
                    "Test: docker-compose up → all services run",
                    "Add .dockerignore",
                    "Ensure environment variables work in Docker",
                ],
                concepts: ["Docker basics", "docker-compose", "Container networking"],
                avoid: "Don't deploy yet. Just get Docker working locally.",
                done: "docker-compose up runs the full stack locally",
            },
            {
                day: 57,
                title: "Deploy Backend to Cloud",
                branch: "feature/deployment",
                commit: "feat: deploy backend to cloud server",
                goal: "Backend is live at a public URL",
                tasks: [
                    "Choose: Railway.app (easiest free) or Render.com",
                    "Push backend to Railway via GitHub connect",
                    "Set environment variables in Railway dashboard",
                    "Verify /health endpoint is live at public URL",
                    "Test from Postman with public URL",
                ],
                concepts: ["Railway.app", "Cloud deployment", "Environment config in cloud"],
                avoid: "Don't use a personal credit card — Railway free tier is enough.",
                done: "Backend live at https://your-app.railway.app/health",
            },
            {
                day: 58,
                title: "Update Frontend for Production",
                branch: "feature/deployment",
                commit: "feat: configure frontend for production API",
                goal: "Frontend points to live backend URL",
                tasks: [
                    "Update EXPO_PUBLIC_API_URL to production backend URL",
                    "Remove any localhost references",
                    "Test all API calls work with production backend",
                    "Add Sentry or basic error logging (optional)",
                    "Test on real device with production backend",
                ],
                concepts: ["Environment config for prod", "Production testing"],
                avoid: "Test every feature with the real production backend.",
                done: "App works end-to-end with production backend",
            },
            {
                day: 59,
                title: "Build Expo App",
                branch: "feature/deployment",
                commit: "feat: create production build with EAS",
                goal: "Create a distributable app build",
                tasks: [
                    "npm install -g eas-cli",
                    "eas login (create Expo account if needed)",
                    "eas build:configure",
                    "eas build --profile preview --platform android",
                    "Download and install the .apk on real device",
                ],
                concepts: ["EAS Build", "APK vs AAB", "Preview builds"],
                avoid: "Don't submit to Play Store yet. Preview build for testing.",
                done: "APK installed on phone. App works with production backend.",
            },
            {
                day: 60,
                title: "Beta Testing",
                branch: "feature/deployment",
                commit: "test: beta testing and bug fixes",
                goal: "Share with 2-3 people. Get real feedback.",
                tasks: [
                    "Share APK with 2-3 friends/family",
                    "Provide simple test script: register, practice, check score",
                    "Collect bugs and feedback",
                    "Fix top 3 most critical bugs",
                    "Re-build and share fixed version",
                ],
                concepts: ["Beta testing", "Bug prioritization", "User feedback"],
                avoid: "Don't defend your design. Listen. Users are always right about UX.",
                done: "App tested by real users. Critical bugs fixed.",
            },
            {
                day: 61,
                title: "Final Bug Fixes",
                branch: "main",
                commit: "fix: final bug fixes from beta testing",
                goal: "Fix all reported issues. Polish final experience.",
                tasks: [
                    "Review all beta feedback",
                    "Fix any crash-level bugs first",
                    "Improve any confusing UX flows",
                    "Final accessibility check (font sizes, contrast)",
                    "Final test on 2 devices",
                ],
                concepts: ["Bug triage", "P0/P1/P2 prioritization"],
                avoid: "Don't add new features now. Fix, don't expand.",
                done: "App is stable, polished, and bug-free",
            },
            {
                day: 62,
                title: "App Store Prep (Android)",
                branch: "main",
                commit: "chore: app store assets and metadata",
                goal: "Prepare everything needed for Play Store submission",
                tasks: [
                    "Write app title, description, keywords",
                    "Create screenshots (5 required for Play Store)",
                    "Design app icon (1024x1024)",
                    "Create feature graphic (1024x500)",
                    "Privacy Policy page (required — use a simple generator)",
                ],
                concepts: ["ASO basics", "Play Store requirements"],
                avoid: "Don't submit without reading Play Store policy — apps get rejected.",
                done: "All store assets ready. Description and screenshots done.",
            },
            {
                day: 63,
                title: "Production Build & Submit",
                branch: "main",
                commit: "chore: production build submitted to Play Store",
                goal: "Submit app to Google Play Store",
                tasks: [
                    "eas build --profile production --platform android",
                    "Create Google Play Console account ($25 one-time)",
                    "Upload AAB to Play Console",
                    "Fill in store listing",
                    "Submit for review (2-7 days review time)",
                ],
                concepts: ["AAB format", "Play Console", "Release tracks"],
                avoid: "Start with Internal Testing track, not Public.",
                done: "App submitted to Play Store. Awaiting review.",
            },
            {
                day: 64,
                title: "Monitoring & Analytics",
                branch: "feature/monitoring",
                commit: "feat: add basic monitoring and usage analytics",
                goal: "Know when your app breaks and how users use it",
                tasks: [
                    "Add Sentry to backend (pip install sentry-sdk)",
                    "Add basic analytics: count sessions per day",
                    "Create admin endpoint: GET /admin/stats (daily sessions, users)",
                    "Set up UptimeRobot for backend health check monitoring",
                    "Document any known limitations",
                ],
                concepts: ["Sentry", "Uptime monitoring", "Operational awareness"],
                avoid: "Don't add full analytics suite. Just basics to start.",
                done: "You get notified if backend crashes. Know basic usage stats.",
            },
            {
                day: 65,
                title: "🎉 Project Complete — Launch Day",
                branch: "main",
                commit: "release: v1.0.0 - Speaking Agent launched! 🚀",
                goal: "Final review, documentation, celebrate shipping!",
                tasks: [
                    "Update README with full setup instructions",
                    "Document API endpoints",
                    "Write a launch post (LinkedIn, Twitter, Reddit r/learnprogramming)",
                    "Tag final release: v1.0.0",
                    "Plan v1.1 improvements (optional)",
                ],
                concepts: ["Shipping mindset", "Developer portfolio", "Continuous improvement"],
                avoid: "Don't wait for perfect. Ship and iterate.",
                done: "🎉 Speaking Agent is LIVE. You built a real AI app. Congratulations.",
            },
        ],
    },
];

const phaseColors = phases.map((p) => p.color);

export default function SpeakingAgentRoadmap() {
    const [activePhase, setActivePhase] = useState(0);
    const [activeDay, setActiveDay] = useState(null);
    const [expandedDay, setExpandedDay] = useState(null);

    const currentPhase = phases[activePhase];
    const allDays = phases.flatMap((p) => p.days);
    const totalDays = allDays.length;

    return (
        <div style={{ fontFamily: "'DM Mono', 'Courier New', monospace", background: "#0A0A0F", minHeight: "100vh", color: "#E2E8F0" }}>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0A0A0F; }
        ::-webkit-scrollbar-thumb { background: #2D2D4E; border-radius: 3px; }
        .phase-btn:hover { transform: translateY(-2px); }
        .day-card:hover { border-color: var(--phase-color) !important; }
        .task-item::before { content: "→"; margin-right: 8px; opacity: 0.6; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .fade-in { animation: fadeIn 0.3s ease forwards; }
      `}</style>

            {/* Header */}
            <div style={{ background: "linear-gradient(135deg, #0A0A0F 0%, #12122A 100%)", borderBottom: "1px solid #1E1E3F", padding: "40px 24px 32px" }}>
                <div style={{ maxWidth: 900, margin: "0 auto" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                        <span style={{ fontSize: 32 }}>🎯</span>
                        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: "#FFF" }}>
                            Speaking Agent
                        </h1>
                    </div>
                    <p style={{ color: "#6B7280", fontSize: 13, marginBottom: 24 }}>
                        65-Day Build Roadmap · 1–2 hrs/day · React Native + FastAPI + AI
                    </p>
                    {/* Phase progress bar */}
                    <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                        {phases.map((p, i) => (
                            <div key={i} style={{ flex: 1, height: 4, background: i <= activePhase ? p.color : "#1E1E3F", borderRadius: 2, transition: "background 0.3s" }} />
                        ))}
                    </div>
                    {/* Stats */}
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                        {[
                            { label: "Total Days", val: totalDays },
                            { label: "Phases", val: phases.length },
                            { label: "Current Phase", val: `${activePhase + 1}/${phases.length}` },
                            { label: "Phase Days", val: currentPhase.days.length },
                        ].map((s, i) => (
                            <div key={i}>
                                <div style={{ fontSize: 20, fontWeight: 500, color: currentPhase.color }}>{s.val}</div>
                                <div style={{ fontSize: 11, color: "#4B5563", textTransform: "uppercase", letterSpacing: 1 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
                {/* Phase Selector */}
                <div style={{ display: "flex", gap: 8, marginBottom: 28, flexWrap: "wrap" }}>
                    {phases.map((p, i) => (
                        <button
                            key={i}
                            className="phase-btn"
                            onClick={() => { setActivePhase(i); setExpandedDay(null); }}
                            style={{
                                background: activePhase === i ? p.color : "#12122A",
                                border: `1px solid ${activePhase === i ? p.color : "#1E1E3F"}`,
                                color: activePhase === i ? "#000" : "#9CA3AF",
                                padding: "8px 14px",
                                borderRadius: 8,
                                fontSize: 12,
                                cursor: "pointer",
                                transition: "all 0.2s",
                                fontFamily: "'DM Mono', monospace",
                                fontWeight: 500,
                            }}
                        >
                            {p.icon} {p.title.split("—")[1]?.trim() || p.title}
                        </button>
                    ))}
                </div>

                {/* Phase Header */}
                <div style={{
                    background: `linear-gradient(135deg, ${currentPhase.color}15, ${currentPhase.color}05)`,
                    border: `1px solid ${currentPhase.color}30`,
                    borderRadius: 12,
                    padding: "20px 24px",
                    marginBottom: 20,
                    "--phase-color": currentPhase.color,
                }} className="fade-in">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div>
                            <span style={{ fontSize: 24, marginRight: 10 }}>{currentPhase.icon}</span>
                            <span style={{ fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 800, color: currentPhase.color }}>
                                {currentPhase.title}
                            </span>
                        </div>
                        <span style={{ fontSize: 12, color: currentPhase.accent, background: `${currentPhase.color}20`, padding: "4px 12px", borderRadius: 20, border: `1px solid ${currentPhase.color}30` }}>
                            {currentPhase.duration}
                        </span>
                    </div>
                </div>

                {/* Days Grid */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }} className="fade-in">
                    {currentPhase.days.map((day, i) => {
                        const isExpanded = expandedDay === day.day;
                        return (
                            <div
                                key={day.day}
                                className="day-card"
                                style={{
                                    background: isExpanded ? `${currentPhase.color}10` : "#0F0F1E",
                                    border: `1px solid ${isExpanded ? currentPhase.color + "60" : "#1E1E3F"}`,
                                    borderRadius: 10,
                                    overflow: "hidden",
                                    transition: "all 0.2s",
                                    cursor: "pointer",
                                    "--phase-color": currentPhase.color,
                                }}
                                onClick={() => setExpandedDay(isExpanded ? null : day.day)}
                            >
                                {/* Day Header */}
                                <div style={{ display: "flex", alignItems: "center", padding: "14px 18px", gap: 14 }}>
                                    <div style={{
                                        background: isExpanded ? currentPhase.color : `${currentPhase.color}20`,
                                        color: isExpanded ? "#000" : currentPhase.color,
                                        fontWeight: 700,
                                        fontSize: 11,
                                        padding: "4px 10px",
                                        borderRadius: 6,
                                        minWidth: 52,
                                        textAlign: "center",
                                        transition: "all 0.2s",
                                        flexShrink: 0,
                                    }}>
                                        DAY {day.day}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 14, fontWeight: 500, color: isExpanded ? "#FFF" : "#CBD5E1" }}>{day.title}</div>
                                        <div style={{ fontSize: 11, color: "#4B5563", marginTop: 2 }}>🌿 {day.branch}</div>
                                    </div>
                                    <div style={{ fontSize: 11, color: isExpanded ? currentPhase.color : "#374151", padding: "3px 8px", borderRadius: 4, background: isExpanded ? `${currentPhase.color}20` : "transparent" }}>
                                        {day.tasks.length} tasks {isExpanded ? "▲" : "▼"}
                                    </div>
                                </div>

                                {/* Expanded Content */}
                                {isExpanded && (
                                    <div style={{ padding: "0 18px 18px", animation: "fadeIn 0.2s ease" }}>
                                        {/* Goal */}
                                        <div style={{ background: "#0A0A0F", border: "1px solid #1E1E3F", borderRadius: 8, padding: "10px 14px", marginBottom: 14 }}>
                                            <div style={{ fontSize: 10, color: "#4B5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🎯 Goal</div>
                                            <div style={{ fontSize: 13, color: "#94A3B8" }}>{day.goal}</div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
                                            {/* Tasks */}
                                            <div style={{ background: "#0A0A0F", border: "1px solid #1E1E3F", borderRadius: 8, padding: "10px 14px", gridColumn: "1 / -1" }}>
                                                <div style={{ fontSize: 10, color: "#4B5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>📋 Tasks</div>
                                                {day.tasks.map((t, ti) => (
                                                    <div key={ti} className="task-item" style={{ display: "flex", fontSize: 12, color: "#94A3B8", marginBottom: 5, lineHeight: 1.5 }}>
                                                        <span style={{ color: currentPhase.color, marginRight: 8, flexShrink: 0 }}>→</span>
                                                        <span>{t}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                                            {/* Concepts */}
                                            <div style={{ background: "#0A0A0F", border: "1px solid #1E1E3F", borderRadius: 8, padding: "10px 14px" }}>
                                                <div style={{ fontSize: 10, color: "#4B5563", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>🧠 Learn</div>
                                                {day.concepts.map((c, ci) => (
                                                    <div key={ci} style={{ fontSize: 11, color: "#6B7280", marginBottom: 3 }}>• {c}</div>
                                                ))}
                                            </div>

                                            {/* Avoid */}
                                            <div style={{ background: "#0A0A0F", border: "1px solid #2D1515", borderRadius: 8, padding: "10px 14px" }}>
                                                <div style={{ fontSize: 10, color: "#7F1D1D", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>⚠️ Avoid</div>
                                                <div style={{ fontSize: 11, color: "#6B7280", lineHeight: 1.5 }}>{day.avoid}</div>
                                            </div>
                                        </div>

                                        {/* Done criteria */}
                                        <div style={{ background: `${currentPhase.color}10`, border: `1px solid ${currentPhase.color}30`, borderRadius: 8, padding: "10px 14px", marginTop: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
                                            <span style={{ fontSize: 14 }}>✅</span>
                                            <div>
                                                <div style={{ fontSize: 10, color: currentPhase.color, textTransform: "uppercase", letterSpacing: 1, marginBottom: 3 }}>Definition of Done</div>
                                                <div style={{ fontSize: 12, color: "#94A3B8" }}>{day.done}</div>
                                            </div>
                                        </div>

                                        {/* Commit */}
                                        <div style={{ marginTop: 10, padding: "6px 12px", background: "#0D0D1A", borderRadius: 6, border: "1px solid #1A1A2E" }}>
                                            <span style={{ fontSize: 10, color: "#374151" }}>git commit: </span>
                                            <span style={{ fontSize: 11, color: "#4ADE80", fontFamily: "monospace" }}>{day.commit}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div style={{ textAlign: "center", marginTop: 40, padding: "20px", borderTop: "1px solid #1E1E3F", color: "#374151", fontSize: 12 }}>
                    <div style={{ marginBottom: 8 }}>Click any day to expand. Build one day at a time. 🔥</div>
                    <div>Speaking Agent · {totalDays} days · v1.0.0 awaits</div>
                </div>
            </div>
        </div>
    );
}
