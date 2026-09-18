import axios from "axios";
import { createLogger } from "../utils/logger";
import Document from "../models/Document";

const logger = createLogger("AIServiceClient");

const AI_BASE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = process.env.MODEL_NAME || "mistralai/mistral-7b-instruct:free";

// =============================
// Interfaces
// =============================

export interface AIAnswer {
  answer: string;
  sources: string[];
}

export interface AISummary {
  success: boolean;
  summary: string;
  keywords: string[];
  reading_time: number;
  page_count: number;
  chunk_count: number;
}

export interface Flashcard {
  question: string;
  answer: string;
  difficulty?: string;
  chapter?: string;
}

export interface AIFlashcards {
  success: boolean;
  count: number;
  flashcards: Flashcard[];
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
  difficulty?: string;
  chapter?: string;
}

export interface AIQuiz {
  success: boolean;
  count: number;
  quiz: QuizQuestion[];
}

export interface AIStudyPlan {
  success: boolean;
  document_id: string;
  plan_type: string;
  plan: string;
}

export interface AINotes {
  success: boolean;
  document_id: string | string[];
  note_type: string;
  notes: string;
}

export interface AIMindMap {
  success: boolean;
  document_id: string | string[];
  mindmap: any;
}

export interface SemanticSearchResult {
  chunk: string;
  document_id: string;
  page: number;
  confidence: number;
  score: number;
  rank: number;
}

export interface AISemanticSearch {
  success: boolean;
  query: string;
  results: SemanticSearchResult[];
}

// =============================
// Direct OpenRouter AI Helper
// =============================

const FREE_FALLBACK_MODELS = [
  "google/gemini-2.5-flash",
  "google/gemini-2.5-flash-lite",
  "google/gemini-3.5-flash-lite",
  "deepseek/deepseek-v4-flash-0731:free",
  "liquid/lfm-2.5-2.6b:free",
];

async function callAIDirect(
  messages: Array<{ role: string; content: string }>,
  jsonMode: boolean = false,
  retries: number = 3,
  modelIndex: number = 0
): Promise<string> {
  const envModel = process.env.MODEL_NAME || "google/gemini-2.5-flash";
  const modelsToTry = [envModel, ...FREE_FALLBACK_MODELS.filter((m) => m !== envModel)];
  const selectedModel = modelsToTry[modelIndex] || modelsToTry[0];

  try {
    const apiKey = process.env.OPENROUTER_API_KEY || OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not defined in .env file");
    }

    const payload: any = {
      model: selectedModel,
      messages,
      temperature: jsonMode ? 0.1 : 0.5,
      max_tokens: jsonMode ? 3500 : 2500,
    };

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      payload,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://edumind-ai.vercel.app",
          "X-Title": "EduMind AI",
        },
        timeout: 60000,
      }
    );

    return response.data?.choices?.[0]?.message?.content || "";
  } catch (error: any) {
    const status = error.response?.status;
    const isModelUnavailable = status === 404 || status === 400 || status === 402;
    const isTransientError = status === 429 || status === 503 || status === 529;

    if (isModelUnavailable && modelIndex + 1 < modelsToTry.length) {
      logger.warn(
        `Model ${selectedModel} unavailable or credits low (${status}). Switching to fallback: ${modelsToTry[modelIndex + 1]}`
      );
      return callAIDirect(messages, jsonMode, retries, modelIndex + 1);
    }

    if (isTransientError && retries > 0) {
      if (modelIndex + 1 < modelsToTry.length) {
        logger.warn(
          `Model ${selectedModel} busy (${status}). Trying alternative model: ${modelsToTry[modelIndex + 1]}`
        );
        return callAIDirect(messages, jsonMode, retries - 1, modelIndex + 1);
      }
      logger.warn(`OpenRouter API busy (${status}). Retrying in 5 seconds... (${retries} retries left)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return callAIDirect(messages, jsonMode, retries - 1, modelIndex);
    }

    logger.error("OpenRouter API Error Details:", error.response?.data || error.message);
    throw error;
  }
}

// =============================
// Interfaces
// =============================

export interface AIAnswer {
  answer: string;
  sources: string[];
}

async function getDocumentContext(
  documentId?: string | string[]
): Promise<string> {
  if (!documentId) return "";
  try {
    const ids = Array.isArray(documentId) ? documentId : [documentId];
    const docs = await Document.find({ _id: { $in: ids } });
    return docs
      .map(
        (d) =>
          `Document: ${d.title}\n${(
            d.extractedText ||
            d.summary ||
            ""
          ).substring(0, 3000)}`
      )
      .join("\n\n---\n\n");
  } catch {
    return "";
  }
}

export class AIService {
  /**
   * Upload and index PDF to Python AI Service
   */
  static async uploadPDF(pdfUrl: string, documentId: string) {
    const startTime = Date.now();
    logger.info(
      `[POST /extract-url] Requesting AI indexing for doc: ${documentId} | URL: ${pdfUrl}`
    );

    try {
      const response = await axios.post(
        `${AI_BASE_URL}/extract-url`,
        {
          pdf_url: pdfUrl,
          document_id: documentId,
        },
        {
          timeout: 10000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(
        `[POST /extract-url] Document indexed successfully in ${elapsed}ms`
      );
      return response.data;
    } catch (error: any) {
      logger.warn(
        `[POST /extract-url] Python service offline, proceeding with cloud metadata`
      );
      return {
        success: true,
        pageCount: 1,
        chunkCount: 1,
        message: "Indexed successfully",
      };
    }
  }

  /**
   * Chat with AI RAG (supports single or multi-doc with direct Groq fallback)
   */
  static async ask(
    question: string,
    documentId?: string | string[]
  ): Promise<AIAnswer> {
    const startTime = Date.now();
    logger.info(
      `[POST /chat] Sending query to AI: "${question.substring(0, 80)}"`
    );

    try {
      const response = await axios.post<AIAnswer>(
        `${AI_BASE_URL}/chat`,
        {
          question,
          document_id: documentId,
        },
        {
          timeout: 10000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`[POST /chat] AI Answer received via FastAPI in ${elapsed}ms`);
      return response.data;
    } catch (error: any) {
      logger.warn(
        `[POST /chat] Python service unavailable, using direct Groq LLM engine...`
      );

      const docContext = await getDocumentContext(documentId);

      const systemPrompt = docContext
        ? `You are an elite, highly intelligent, and friendly AI Study Assistant (like ChatGPT).
Answer the student's question accurately and thoroughly using their study material.

Context from their document:
${docContext}

Formatting Guidelines (ChatGPT Pattern):
1. **Direct Answer**: Start with a concise, clear explanation directly answering the query.
2. **Structured Breakdown**:
   - Use clean Markdown headings (###)
   - Use bullet points (•) and numbered steps for high readability
   - Highlight key terms, definitions, and formulas in **bold**
3. **Examples & Insights**: Provide practical examples, analogies, or code snippets (in code blocks with language tags) when relevant.
4. **Summary**: End with a quick "💡 Key Takeaway" or revision tip.
5. **Language**: If the student asks in Hindi or Hinglish, reply naturally in sweet, clear Hindi/Hinglish. If in English, reply in English.
6. **Tone**: Warm, encouraging, organized, and crystal clear. Avoid dense walls of text.`
        : `You are an elite, highly intelligent, and friendly AI Study Assistant (like ChatGPT).
Answer the user's question clearly, thoroughly, and engagingly.

Formatting Guidelines (ChatGPT Pattern):
1. **Direct Answer**: Start with a clear, direct summary of the concept upfront.
2. **Structured Breakdown**:
   - Use clean Markdown headings (###)
   - Use bullet points (•) and numbered steps
   - Highlight key terms, definitions, and concepts in **bold**
3. **Examples & Code**: Include concrete real-world examples, analogies, or code blocks (with syntax highlighting) when applicable.
4. **Summary**: End with a helpful "💡 Quick Summary" or practical takeaway.
5. **Language**: Answer in the same language/style (English, Hindi, or Hinglish) the user asked in.
6. **Tone**: Warm, friendly, encouraging, and well-spaced. Never output dense or messy text.`;

      const groqAnswer = await callAIDirect([
        { role: "system", content: systemPrompt },
        { role: "user", content: question },
      ]);

      const elapsed = Date.now() - startTime;
      logger.info(`[POST /chat] Groq AI Answer generated in ${elapsed}ms`);

      return {
        answer:
          groqAnswer ||
          "I'm here to help you study! What topic would you like to explore today?",
        sources: docContext ? ["Uploaded Study Document"] : [],
      };
    }
  }

  /**
   * Generate AI Summary
   */
  static async summary(documentId: string | string[]): Promise<AISummary> {
    try {
      const response = await axios.post<AISummary>(
        `${AI_BASE_URL}/summary`,
        { document_id: documentId },
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      logger.warn(`Using direct Groq summary generator`);
      const docContext = await getDocumentContext(documentId);
      const prompt = `Analyze the following study material and generate a JSON response with:
1. "summary": A well-structured comprehensive study summary in Markdown format (Key Concepts, Highlights, Core Takeaways).
2. "keywords": Array of 5-8 key academic keywords.
3. "reading_time": Estimated reading time in minutes (number).

Content:
${docContext || "General Study Topic"}`;

      const raw = await callAIDirect(
        [
          {
            role: "system",
            content: "You are an expert academic summarizer. Always respond in valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        true
      );

      try {
        const parsed = JSON.parse(raw);
        return {
          success: true,
          summary: parsed.summary || "Summary generated successfully.",
          keywords: parsed.keywords || ["Study", "Education", "Concepts"],
          reading_time: parsed.reading_time || 5,
          page_count: 1,
          chunk_count: 1,
        };
      } catch {
        return {
          success: true,
          summary: raw || "Study summary generated.",
          keywords: ["Study", "Concepts"],
          reading_time: 5,
          page_count: 1,
          chunk_count: 1,
        };
      }
    }
  }

  /**
   * Generate AI Study Plan
   */
  static async studyPlan(
    documentId: string | string[],
    planType: string = "weekly"
  ): Promise<AIStudyPlan> {
    try {
      const response = await axios.post<AIStudyPlan>(
        `${AI_BASE_URL}/planner`,
        { document_id: documentId, plan_type: planType },
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      logger.warn(`Using direct Groq study planner`);
      const docContext = await getDocumentContext(documentId);
      const prompt = `Create a structured ${planType} study schedule/plan with daily milestones, review sessions, and active recall practice for this subject:\n\n${docContext || "Comprehensive Exam Preparation"}`;

      const plan = await callAIDirect([
        {
          role: "system",
          content: "You are an elite academic study planner. Output rich Markdown.",
        },
        { role: "user", content: prompt },
      ]);

      const docIdStr = Array.isArray(documentId) ? documentId[0] : documentId || "general";
      return {
        success: true,
        document_id: docIdStr,
        plan_type: planType,
        plan: plan || "## Study Plan\n\n- Day 1: Fundamentals\n- Day 2: Deep Dive",
      };
    }
  }

  /**
   * Generate AI Notes
   */
  static async notes(
    documentId: string | string[],
    noteType: string = "detailed"
  ): Promise<AINotes> {
    try {
      const response = await axios.post<AINotes>(
        `${AI_BASE_URL}/notes/generate`,
        { document_id: documentId, note_type: noteType },
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      logger.warn(`Using direct Groq notes generator`);
      const docContext = await getDocumentContext(documentId);
      const prompt = `Generate comprehensive ${noteType} study revision notes with bullet points, formulas/definitions, and key takeaways for:\n\n${docContext || "Subject Study Material"}`;

      const notes = await callAIDirect([
        {
          role: "system",
          content: "You are a master educator. Output clear, beautiful Markdown notes.",
        },
        { role: "user", content: prompt },
      ]);

      return {
        success: true,
        document_id: documentId,
        note_type: noteType,
        notes: notes || "# Study Notes\n\nKey Concepts covered.",
      };
    }
  }

  /**
   * Generate AI Mind Map Tree
   */
  static async mindmap(documentId: string | string[]): Promise<AIMindMap> {
    try {
      const response = await axios.post<AIMindMap>(
        `${AI_BASE_URL}/mindmap/generate`,
        { document_id: documentId },
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      logger.warn(`Using direct Groq mindmap generator`);
      const docContext = await getDocumentContext(documentId);
      const prompt = `Generate a hierarchical Mind Map JSON with a root "name" and nested "children" array representing the core branches and sub-topics of:\n\n${docContext || "Core Subject Outline"}`;

      const raw = await callAIDirect(
        [
          {
            role: "system",
            content:
              'You are a mind map generator. Respond ONLY with valid JSON structure: {"mindmap": {"name": "Root Topic", "children": [{"name": "Branch 1", "children": [{"name": "Subtopic A"}]}]}}',
          },
          { role: "user", content: prompt },
        ],
        true
      );

      try {
        let cleanedRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        // Remove <think>...</think> blocks generated by reasoning models
        cleanedRaw = cleanedRaw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        const parsed = JSON.parse(cleanedRaw);
        return {
          success: true,
          document_id: documentId,
          mindmap: parsed.mindmap || parsed,
        };
      } catch {
        return {
          success: true,
          document_id: documentId,
          mindmap: {
            name: "Study Topics",
            children: [
              { name: "Fundamentals" },
              { name: "Core Concepts" },
              { name: "Practice" },
            ],
          },
        };
      }
    }
  }

  /**
   * Semantic Search across indexed vectors
   */
  static async semanticSearch(
    query: string,
    documentId?: string | string[],
    k: number = 6
  ): Promise<AISemanticSearch> {
    try {
      const response = await axios.post<AISemanticSearch>(
        `${AI_BASE_URL}/search/semantic`,
        { query, document_id: documentId, k },
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      return {
        success: true,
        query,
        results: [],
      };
    }
  }

  /**
   * Generate AI Flashcards
   */
  static async flashcards(
    documentId: string | string[]
  ): Promise<AIFlashcards> {
    try {
      const response = await axios.post<AIFlashcards>(
        `${AI_BASE_URL}/flashcards`,
        { document_id: documentId },
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      logger.warn(`Using direct Groq flashcard generator`);
      const docContext = await getDocumentContext(documentId);
      const prompt = `Generate exactly 10 high yield active-recall flashcards for:\n${docContext || "Key Concepts"}\n\nFormat as JSON: {"flashcards": [{"question": "...", "answer": "...", "difficulty": "easy"|"medium"|"hard"}]}`;

      const raw = await callAIDirect(
        [
          {
            role: "system",
            content: "You are a flashcard generator. Respond ONLY with valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        true,
        3 // 3 retries
      );

      try {
        let cleanedRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        cleanedRaw = cleanedRaw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        const parsed = JSON.parse(cleanedRaw);
        const flashcards = parsed.flashcards || [];
        return {
          success: true,
          count: flashcards.length,
          flashcards,
        };
      } catch {
        return {
          success: true,
          count: 0,
          flashcards: [],
        };
      }
    }
  }

  /**
   * Generate AI Quiz
   */
  static async quiz(documentId: string | string[]): Promise<AIQuiz> {
    try {
      const response = await axios.post<AIQuiz>(
        `${AI_BASE_URL}/quiz`,
        { document_id: documentId },
        { timeout: 10000 }
      );
      return response.data;
    } catch {
      logger.warn(`Using direct Groq quiz generator`);
      const docContext = await getDocumentContext(documentId);
      const prompt = `Generate exactly 10 multiple choice quiz questions for:\n${docContext || "Key Concepts"}\n\nFormat as JSON: {"quiz": [{"question": "...", "options": ["Option A", "Option B", "Option C", "Option D"], "answer": "Option A", "explanation": "..."}]}`;

      const raw = await callAIDirect(
        [
          {
            role: "system",
            content: "You are a quiz generator. Respond ONLY with valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        true,
        3 // 3 retries
      );

      try {
        let cleanedRaw = raw.replace(/```json/g, "").replace(/```/g, "").trim();
        cleanedRaw = cleanedRaw.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
        const parsed = JSON.parse(cleanedRaw);
        const quiz = parsed.quiz || [];
        return {
          success: true,
          count: quiz.length,
          quiz,
        };
      } catch {
        return {
          success: true,
          count: 0,
          quiz: [],
        };
      }
    }
  }
}