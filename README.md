# 🧠 EduMind AI

**EduMind AI** is an advanced, full-stack AI-powered study companion designed to supercharge cognitive learning. It transforms static documents (PDFs) into interactive study materials, including AI chat, automated summaries, flashcards, quizzes, study plans, and mind maps.

## 🚀 Features

- **🔐 Secure Authentication:** JWT-based access and refresh tokens, email verification, and strict password policies.
- **📄 Document Processing:** Upload PDFs securely via Cloudinary.
- **🤖 AI Document Chat:** Chat directly with your uploaded documents using RAG (Retrieval-Augmented Generation).
- **📝 Automated Summaries:** Instantly generate Markdown summaries and key concepts.
- **🗂️ Flashcards & Quizzes:** Auto-generate interactive flashcards and multiple-choice quizzes to test your knowledge.
- **🗺️ Interactive Mind Maps:** Visualize complex topics with AI-generated mind maps.
- **📅 Study Planner:** Get AI-generated weekly, monthly, or cram study plans.
- **⚡ Superfast AI Processing:** Seamless integration with Groq's Llama 3.1 8B Instant model for sub-second responses.

## 🛠️ Tech Stack

**Frontend (Client)**
- React (Vite)
- TypeScript
- Tailwind CSS & Framer Motion (Animations)
- Zustand (State Management)
- React Router DOM
- Axios

**Backend (Server)**
- Node.js & Express.js
- TypeScript
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcrypt
- Cloudinary (File Storage)
- Groq Cloud API (LLM Integration)

**AI Microservice (Python - Optional)**
- FastAPI
- PyPDF2 / FAISS (Vector Storage)
- Sentence Transformers

## ⚙️ Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- MongoDB Database (Atlas or Local)
- Cloudinary Account
- Groq API Key

### 1. Clone the repository
```bash
git clone https://github.com/Devender38/EduMind-AI.git
cd EduMind-AI
```

### 2. Setup the Backend Server
```bash
cd server
npm install
```
Create a `.env` file in the `server` directory with the required variables (MongoDB URI, JWT Secrets, Cloudinary Keys, Groq API Key).
Run the server:
```bash
npm run dev
```

### 3. Setup the Frontend Client
```bash
cd ../client
npm install
```
Create a `.env` file in the `client` directory and set `VITE_API_URL=http://localhost:5000/api`.
Run the client:
```bash
npm run dev
```

### 4. Setup the AI Service (Optional - if not using direct Groq API)
```bash
cd ../ai-service
python -m venv venv
# Windows: .\venv\Scripts\activate
# Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## 🌐 Live Demo
- **Frontend:** [https://edu-mind-ai-two.vercel.app/](https://edu-mind-ai-two.vercel.app/)

## 🤝 Contributing
Contributions, issues, and feature requests are welcome!

## 📝 License
This project is licensed under the MIT License.
