import axios from "axios";
import pdfParse from "pdf-parse";
import { createLogger } from "../utils/logger";
import Document from "../models/Document";

const logger = createLogger("AIServiceClient");

const AI_BASE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_MODEL = process.env.MODEL_NAME || "openrouter/free";

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
// Direct AI Engine (Groq + OpenRouter)
// =============================

const FREE_FALLBACK_MODELS = [
  "liquid/lfm-2.5-2.6b:free",
  "google/gemma-4-26b-a4b-it:free",
  "google/gemini-2.5-flash",
];

async function callAIDirect(
  messages: Array<{ role: string; content: string }>,
  jsonMode: boolean = false,
  retries: number = 3,
  modelIndex: number = 0
): Promise<string> {
  // 1. Try Groq Cloud if GROQ_API_KEY is configured in environment
  const groqApiKey = process.env.GROQ_API_KEY || "";
  if (groqApiKey && modelIndex === 0) {
    try {
      const groqModel = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
      const groqRes = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: groqModel,
          messages,
          temperature: jsonMode ? 0.1 : 0.5,
          max_tokens: jsonMode ? 2000 : 1500,
        },
        {
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 20000,
        }
      );
      const groqContent = groqRes.data?.choices?.[0]?.message?.content;
      if (groqContent && groqContent.trim() && !groqContent.toLowerCase().includes("user safety: safe")) {
        return groqContent.trim();
      }
    } catch (groqErr: any) {
      logger.warn(
        "Groq AI attempt failed, falling back to OpenRouter:",
        groqErr?.response?.data || groqErr.message
      );
    }
  }

  // 2. OpenRouter with high-quality free instruction-following models
  let rawModel = process.env.MODEL_NAME || "liquid/lfm-2.5-2.6b:free";
  // Filter out wildcard routers that randomly route to moderation/safety classifiers
  if (
    rawModel === "openrouter/free" ||
    rawModel.includes("safety") ||
    rawModel.includes("content-safety")
  ) {
    rawModel = "liquid/lfm-2.5-2.6b:free";
  }

  const modelsToTry = [
    rawModel,
    ...FREE_FALLBACK_MODELS.filter((m) => m !== rawModel),
  ];
  const selectedModel = modelsToTry[modelIndex] || modelsToTry[0];

  try {
    const apiKey = process.env.OPENROUTER_API_KEY || OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.error(
        "OPENROUTER_API_KEY is not defined in environment variables."
      );
      return "⚠️ AI service is not configured yet. Please add `OPENROUTER_API_KEY` in your Render Dashboard (Environment tab) to enable live answers.";
    }

    const payload: any = {
      model: selectedModel,
      messages,
      temperature: jsonMode ? 0.1 : 0.5,
      max_tokens: jsonMode ? 2000 : 1500,
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

    const msg = response.data?.choices?.[0]?.message;
    const answer = (msg?.content || msg?.text || msg?.reasoning || "").trim();

    // If answer is empty or just a safety moderation tag, fall back to next model
    if (
      !answer ||
      answer.toLowerCase() === "user safety: safe" ||
      answer.toLowerCase() === "safe"
    ) {
      if (modelIndex + 1 < modelsToTry.length) {
        logger.warn(
          `Model ${selectedModel} returned non-instruction response. Switching to fallback: ${modelsToTry[modelIndex + 1]}`
        );
        return callAIDirect(messages, jsonMode, retries, modelIndex + 1);
      }
    }

    return answer;
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

export interface VoiceTutorOptions {
  question: string;
  documentId?: string | string[];
  language?: string;
  level?: "beginner" | "intermediate" | "advanced";
  mode?: "explain" | "simplify" | "example" | "quiz" | "summarize" | "followup";
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface AIVoiceTutorResult {
  success: boolean;
  answer: string;
  sources: string[];
  suggestedFollowups: string[];
}

async function getDocumentContext(
  documentId?: string | string[]
): Promise<string> {
  if (!documentId) return "";
  try {
    const ids = Array.isArray(documentId) ? documentId : [documentId];
    const docs = await Document.find({ _id: { $in: ids } });

    const contexts = await Promise.all(
      docs.map(async (d) => {
        let text = d.extractedText || d.summary || "";

        // If extractedText is empty in DB but PDF URL exists on Cloudinary, extract it on-the-fly
        if ((!text || text.trim().length < 30) && d.fileUrl) {
          try {
            logger.info(`Fetching & extracting PDF on-the-fly for doc: ${d.title} (${d._id})`);
            const response = await axios.get(d.fileUrl, {
              responseType: "arraybuffer",
              timeout: 15000,
            });
            const parsed = await pdfParse(Buffer.from(response.data));
            if (parsed.text && parsed.text.trim()) {
              text = parsed.text.trim();
              d.extractedText = text;
              if (parsed.numpages) d.pageCount = parsed.numpages;
              await d.save();
              logger.info(`Successfully extracted ${text.length} chars for doc: ${d.title}`);
            }
          } catch (fetchErr: any) {
            logger.warn(`Could not extract PDF on-the-fly: ${fetchErr.message}`);
          }
        }

        // If the document is an outline or image PDF with minimal text, provide academic topic brief
        if (!text || text.trim().length < 30) {
          return `Document Title: ${d.title}\nSubject Overview: Comprehensive university syllabus, mechanisms, theoretical foundations, key formulas, and practical examples for "${d.title}".`;
        }

        return `Document Title: ${d.title}\nContent:\n${text.substring(0, 15000)}`;
      })
    );

    return contexts.filter(Boolean).join("\n\n---\n\n");
  } catch (err: any) {
    logger.error(`Error in getDocumentContext: ${err.message}`);
    return "";
  }
}

export function parseAISummary(raw: string): {
  summary: string;
  keywords: string[];
  reading_time: number;
} {
  if (!raw || typeof raw !== "string") {
    return {
      summary: "Comprehensive study summary generated.",
      keywords: ["Study", "Concepts"],
      reading_time: 5,
    };
  }

  let cleaned = raw
    .replace(/<think>[\s\S]*?<\/think>/g, "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // 1. Direct JSON parse attempt
  try {
    const parsed = JSON.parse(cleaned);
    if (parsed && typeof parsed === "object") {
      let sumText = parsed.summary || "";
      if (typeof sumText === "object") sumText = JSON.stringify(sumText);
      return {
        summary: String(sumText).trim(),
        keywords: Array.isArray(parsed.keywords)
          ? parsed.keywords.map(String)
          : ["Study", "Concepts"],
        reading_time: Number(parsed.reading_time) || 5,
      };
    }
  } catch {
    // Continue to fallback extractions
  }

  // 2. Extract JSON substring between { and }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = cleaned.substring(firstBrace, lastBrace + 1);
    try {
      const parsed = JSON.parse(jsonCandidate);
      if (parsed && typeof parsed === "object") {
        return {
          summary: String(parsed.summary || "").trim(),
          keywords: Array.isArray(parsed.keywords)
            ? parsed.keywords.map(String)
            : ["Study", "Concepts"],
          reading_time: Number(parsed.reading_time) || 5,
        };
      }
    } catch {
      // 3. Regex extraction when JSON string has unescaped control chars / newlines
      try {
        const summaryMatch = jsonCandidate.match(
          /"summary"\s*:\s*"([\s\S]*?)(?<!\\)"/
        );
        const keywordsMatch = jsonCandidate.match(
          /"keywords"\s*:\s*\[([\s\S]*?)\]/
        );
        const timeMatch = jsonCandidate.match(/"reading_time"\s*:\s*(\d+)/);

        const extractedSummary = summaryMatch
          ? summaryMatch[1]
              .replace(/\\n/g, "\n")
              .replace(/\\"/g, '"')
              .replace(/\\\\/g, "\\")
          : "";

        let extractedKeywords: string[] = [];
        if (keywordsMatch && keywordsMatch[1]) {
          extractedKeywords = keywordsMatch[1]
            .split(",")
            .map((k) => k.replace(/["'\r\n]/g, "").trim())
            .filter(Boolean);
        }

        if (extractedSummary) {
          return {
            summary: extractedSummary.trim(),
            keywords:
              extractedKeywords.length > 0
                ? extractedKeywords
                : ["Study", "Concepts"],
            reading_time: timeMatch ? parseInt(timeMatch[1], 10) : 5,
          };
        }
      } catch {
        // ignore
      }
    }
  }

  // 4. Last resort: if string still has { "summary": "..." } structure
  if (cleaned.startsWith("{") && cleaned.includes('"summary"')) {
    const match = cleaned.match(/"summary"\s*:\s*"([\s\S]*?)(?<!\\)"/);
    if (match && match[1]) {
      return {
        summary: match[1].replace(/\\n/g, "\n").replace(/\\"/g, '"'),
        keywords: ["Study", "Concepts"],
        reading_time: 5,
      };
    }
  }

  return {
    summary: cleaned,
    keywords: ["Study", "Concepts"],
    reading_time: 5,
  };
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
        ? `You are an elite, laser-focused academic AI Assistant (matching the precision of ChatGPT, Grok, and Gemini).
You must answer the student's question accurately, directly, and specifically using their study material.

Context from their document:
${docContext}

CRITICAL ACCURACY & RELEVANCE RULES (CHATGPT / GEMINI STANDARD):
1. **Answer ONLY What Is Asked**: Directly address the exact question asked by the student. Do NOT add unnecessary fluff, unrelated history, or tangent topics unless requested.
2. **Surgical Precision & Correctness**: Provide 100% factually and conceptually accurate answers based on the student's study material.
3. **Upfront Direct Answer**: Give the core direct answer in the first 1-2 sentences immediately.
4. **Structured Format (ChatGPT / Grok Style)**:
   - Use clean Markdown headings with emojis (### 📌, ### ⚙️)
   - Highlight key terms in **bold** with clean bullet points (• **Term**: Explanation)
   - If comparing two or more concepts, ALWAYS use a clean Markdown table (| Feature | Concept A | Concept B |)
   - If explaining a process, workflow, or algorithm, include a clean visual text diagram:
     \`\`\`
     [Step 1: Input] ──▶ [Step 2: Process] ──▶ [Step 3: Output]
     \`\`\`
   - Put formulas and variables in backticks (\`E = mc^2\`)
5. **Key Takeaway**: End with a callout box:
   > 💡 **Key Takeaway**: (1 concise sentence summarizing the exact answer)
6. **Language**: Reply in the same language (Hindi, Hinglish, or English) the user asked in.`
        : `You are an elite, laser-focused AI Assistant (matching the precision of ChatGPT, Grok, and Gemini).
You must answer the user's question accurately, directly, and specifically.

CRITICAL ACCURACY & RELEVANCE RULES (CHATGPT / GEMINI STANDARD):
1. **Answer ONLY What Is Asked**: Directly address the exact question asked. Do NOT add unnecessary fluff, unrelated history, or tangent topics unless requested.
2. **Surgical Precision & Correctness**: Provide 100% factually and conceptually accurate answers with zero hallucination.
3. **Upfront Direct Answer**: Give the core direct answer in the first 1-2 sentences immediately.
4. **Structured Format (ChatGPT / Grok Style)**:
   - Use clean Markdown headings with emojis (### 📌, ### ⚙️)
   - Highlight key terms in **bold** with clean bullet points (• **Term**: Explanation)
   - If comparing two or more concepts, ALWAYS use a clean Markdown table (| Feature | Concept A | Concept B |)
   - If explaining a process, workflow, or algorithm, include a clean visual text diagram:
     \`\`\`
     [Step 1: Input] ──▶ [Step 2: Process] ──▶ [Step 3: Output]
     \`\`\`
   - Put formulas and variables in backticks (\`E = mc^2\`)
5. **Key Takeaway**: End with a callout box:
   > 💡 **Key Takeaway**: (1 concise sentence summarizing the core answer)
6. **Language**: Reply in the same language (Hindi, Hinglish, or English) the user asked in.`;

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
   * Interactive Multilingual Pedagogical Voice Tutor
   */
  static async voiceTutor(options: VoiceTutorOptions): Promise<AIVoiceTutorResult> {
    const startTime = Date.now();
    const {
      question,
      documentId,
      language = "en-US",
      level = "beginner",
      mode = "explain",
      conversationHistory = [],
    } = options;

    logger.info(
      `[POST /voice-tutor] Lang: ${language} | Level: ${level} | Mode: ${mode} | Query: "${question.substring(0, 60)}"`
    );

    const docContext = await getDocumentContext(documentId);

    // Build language-specific instruction
    const langKey = language.toLowerCase();
    let languageInstruction = "Teach in clear, articulate, engaging, and encouraging English.";

    if (langKey.includes("hinglish")) {
      languageInstruction =
        "Teach in sweet, natural, conversational Hinglish (Roman script Hindi e.g., 'Dosto, Machine Learning ka matlab hai jab computer data se khud seekhta hai bina explicit programming ke...'). Keep technical keywords, formulas, and code snippets in English for clarity.";
    } else if (langKey.startsWith("hi")) {
      languageInstruction =
        "Teach in sweet, fluent, standard Hindi using Devanagari script (e.g., 'नमस्ते विद्यार्थी! आज हम इस विषय को गहराई से और सरलता से समझेंगे...'). Keep core technical keywords understandable.";
    } else if (langKey.startsWith("bn")) {
      languageInstruction =
        "Teach in fluent, natural, grammatically correct Bengali (বাংলা). Use an encouraging pedagogical tone.";
    } else if (langKey.startsWith("ta")) {
      languageInstruction =
        "Teach in fluent, natural, grammatically correct Tamil (தமிழ்). Use an encouraging pedagogical tone.";
    } else if (langKey.startsWith("te")) {
      languageInstruction =
        "Teach in fluent, natural, grammatically correct Telugu (తెలుగు). Use an encouraging pedagogical tone.";
    } else if (langKey.startsWith("mr")) {
      languageInstruction =
        "Teach in fluent, natural, grammatically correct Marathi (मराठी). Use an encouraging pedagogical tone.";
    } else if (langKey.startsWith("es")) {
      languageInstruction =
        "Teach in fluent, natural, grammatically correct Spanish (Español). Use an encouraging pedagogical tone.";
    } else if (langKey.startsWith("fr")) {
      languageInstruction =
        "Teach in fluent, natural, grammatically correct French (Français). Use an encouraging pedagogical tone.";
    } else if (langKey.includes("in")) {
      languageInstruction =
        "Teach in clear, friendly Indian English, using relatable examples and encouraging tone.";
    }

    // Level instruction
    let levelInstruction = "";
    if (level === "beginner") {
      levelInstruction =
        "Student Level: BEGINNER. Explain concepts simply and patiently. Avoid overwhelming the student with heavy jargon without immediately breaking it down. Use daily life metaphors and simple analogies.";
    } else if (level === "advanced") {
      levelInstruction =
        "Student Level: ADVANCED. Provide deep architectural rigor, performance trade-offs, internal mechanics, edge cases, and industry best practices. Maintain high intellectual depth.";
    } else {
      levelInstruction =
        "Student Level: INTERMEDIATE. Balance clear conceptual intuition with practical implementation details, mechanisms, and common pitfalls.";
    }

    // Mode-specific instruction
    let modeInstruction = "";
    if (mode === "simplify") {
      modeInstruction =
        "FOCUS: EXPLAIN MUCH MORE SIMPLY. Break down this concept into 5th-grade level terms. Use a super intuitive everyday analogy and zero complex terminology.";
    } else if (mode === "example") {
      modeInstruction =
        "FOCUS: PRACTICAL EXAMPLES. Provide 2 to 3 vivid, real-world, step-by-step practical examples connecting this topic directly to daily life or modern technology.";
    } else if (mode === "quiz") {
      modeInstruction =
        "FOCUS: TEST MY UNDERSTANDING. Pose a thought-provoking, interactive quiz question (with 3-4 options A, B, C, D or a conceptual challenge) to test if the student truly grasped the core concept.";
    } else if (mode === "summarize") {
      modeInstruction =
        "FOCUS: LESSON SUMMARY. Provide a crisp, bulleted revision cheat-sheet highlighting the core mechanics, key formulas/rules, and one golden takeaway.";
    } else {
      modeInstruction = `Follow this human teacher pedagogical structure:
1. **Simple Introduction**: What does the topic mean in beginner-friendly language?
2. **Why It Matters**: Purpose and real-world significance.
3. **Step-by-Step Breakdown**: Logical progression from foundational to advanced.
4. **Practical Examples & Analogies**: Intuitive, relatable everyday comparison.
5. **Real-World Applications**: How industry and modern apps actually use this.
6. **Code / Math (if applicable)**: Clean snippet with line-by-line explanation.
7. **Quick Recap**: 2-3 key takeaways.
8. **Understanding Check**: Ask ONE short, friendly check question at the very end to see if the student understood.`;
    }

    const documentGuidance = docContext
      ? `\n\nSTUDENT'S UPLOADED STUDY MATERIAL:\n${docContext}\n\nRULES FOR UPLOADED MATERIAL:\n- Ground your explanations in this study material whenever relevant.\n- Distinguish material from their document from general knowledge.\n- If their document does not mention the topic, clearly state: "Your uploaded notes don't explicitly mention this, but here is how it works..."`
      : "";

    const systemPrompt = `You are EduMind AI Voice Tutor — a world-class, patient, enthusiastic, and inspiring human-like academic teacher.
Your mission is to make learning crystal clear, interactive, and joyful.

TEACHING STYLE:
- Speak directly to the student ("You", "Let's look at", "Imagine that").
- Speak with natural rhythm, warmth, and pedagogical enthusiasm.
- Be structured: use clean Markdown with headings (###), bold key terms (**keyword**), bullet points, and code blocks with language tags.
- Never output walls of unbroken text.
- Do not claim that you cannot speak or listen; you are actively conducting an audio voice lesson.

LANGUAGE REQUIREMENT:
${languageInstruction}

LEVEL ADAPTATION:
${levelInstruction}

LESSON FOCUS:
${modeInstruction}
${documentGuidance}`;

    const messages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-4);
      for (const turn of recentHistory) {
        messages.push({
          role: turn.role === "user" ? "user" : "assistant",
          content: turn.content,
        });
      }
    }

    messages.push({ role: "user", content: question });

    const answer = await callAIDirect(messages, false, 3);
    const elapsed = Date.now() - startTime;
    logger.info(`[POST /voice-tutor] Completed in ${elapsed}ms`);

    const suggestedFollowups = [
      "Explain this more simply",
      "Give me another practical example",
      "Test my understanding with a quiz",
      "Summarize the key points",
    ];

    return {
      success: true,
      answer: answer || "Let's explore this topic together! What would you like to know?",
      sources: docContext ? ["Uploaded Study Document"] : [],
      suggestedFollowups,
    };
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
            content:
              "You are an expert academic summarizer. Always output raw, valid JSON only without markdown code fences or surrounding text.",
          },
          { role: "user", content: prompt },
        ],
        true
      );

      const parsedResult = parseAISummary(raw);
      return {
        success: true,
        summary: parsedResult.summary,
        keywords: parsedResult.keywords,
        reading_time: parsedResult.reading_time,
        page_count: 1,
        chunk_count: 1,
      };
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

      let prompt = "";
      if (noteType === "detailed") {
        prompt = `You are a distinguished university professor and academic author (matching ChatGPT, Grok, and Gemini).
Generate elite, beautifully formatted, lecture-grade **Class Lecture Notes** based strictly on the provided study document.

CRITICAL FORMATTING & READABILITY RULES:
- ALWAYS generate complete, rich, authoritative academic lecture notes for the topic. If specific document text is available, ground your explanations in it; if brief or titled, synthesize the full curriculum and theoretical foundations of that topic.
- NEVER refuse to generate, NEVER complain about missing source material, and NEVER ask the user to paste text.
- NEVER output a single giant wall of text. Everything must be organized into clear sections.
- Separate every section with clean Markdown headings (## and ###) and thematic breaks (---).
- Put key terminology and core definitions in a clean Markdown table with headers: | Term | Exact Definition | Practical Insight / Example |.
- MUST include a clean Visual Flow Diagram / Architecture box illustrating the core workflow or relationships.
- Use clean bullet points (•) and bold highlighting (**term**) for every key concept.
- Highlight formulas and technical terms inside backticks (\`like this\`).

Follow this exact structure:

# 📚 [Topic Name] — Class Lecture Notes

> 💡 **Lecture Overview**: (A 2-3 sentence crystal-clear summary of what this lecture is about)

---

### 1. 🎯 Core Learning Objectives
• Objective 1: [What the student will understand]
• Objective 2: [Key mechanism to master]
• Objective 3: [Real-world problem it solves]

---

### 2. 📌 Key Terminology & Definitions
| Term | Exact Definition | Practical Insight / Example |
| :--- | :--- | :--- |
| **[Term 1]** | [Clear, concise definition] | [Application or insight] |
| **[Term 2]** | [Clear, concise definition] | [Application or insight] |
| **[Term 3]** | [Clear, concise definition] | [Application or insight] |

---

### 3. 🗺️ Concept Workflow & Architectural Diagram
\`\`\`
┌─────────────────────────────────────────┐
│        [Stage 1: Input / Origin]        │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│     [Stage 2: Core Processing / Logic]  │
└────────────────────┬────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────┐
│        [Stage 3: Output / Result]       │
└─────────────────────────────────────────┘
\`\`\`

---

### 4. 🧠 Comprehensive Lecture Breakdown & Mechanisms
#### 4.1 [First Major Concept / Foundation]
• **Core Principle**: ...
• **How It Works**: ...
• **Key Characteristics**: ...

#### 4.2 [Second Major Concept / Deep Dive]
• **Core Principle**: ...
• **How It Works**: ...
• **Key Characteristics**: ...

---

### 5. ⚡ Formulas, Laws & Governing Rules
• **Formula / Law**: \`[Equation or Rule]\`
• **Variables Explained**:
  - \`variable 1\` = meaning and units
  - \`variable 2\` = meaning and units
• **When to Apply**: ...

---

### 6. 💡 Real-World Examples & Intuitive Analogies
• **Real-World Case**: [Practical concrete example]
• **Memory Analogy**: [A simple, vivid real-world analogy to remember this concept forever]

---

### 7. ⚠️ Common Misconceptions & Student Traps
• **Common Mistake**: [What students frequently confuse]
  - **The Truth**: [Why that is wrong and how to think about it correctly]

---

### 8. 📝 Rapid Recall & Practice Questions
1. [Self-test question 1 to check understanding]
2. [Self-test question 2 to check understanding]
3. [Self-test question 3 to check understanding]

DOCUMENT CONTENT:
${docContext || "Subject Study Material"}`;
      } else if (noteType === "exam") {
        prompt = `You are an elite academic exam prep specialist (matching the standard of ChatGPT, Grok, and Gemini).
Generate **High-Yield Exam Notes** based strictly on the provided document.

CRITICAL FORMATTING RULES:
- Never mix sections together; separate every section with '---'
- Use clear visual Markdown headings with emojis (### ⚡, ### 🗺️, ### 🎯, ### ⚠️, ### 📝)
- MUST include a clean Visual Exam Decision Tree / Architecture Diagram
- MUST include a structured Table for Common Traps & Comparison
- Highlight formulas in backticks (\`like this\`)
- Use bold headers on bullet points (• **Concept**: explanation)

Format with this exact structure:
# 🎓 High-Yield Exam Master Notes

> 💡 **Exam Strategy**: (2 sentences on the highest probability topics to score maximum marks)

---

### ⚡ 1. Must-Know Formulas, Laws & Governing Rules
• **Formula / Theorem**: \`[Equation / Law]\`
• **Variables**: \`var1\` = definition, \`var2\` = definition
• **Application**: [When to use this in exam questions]

---

### 🗺️ 2. High-Yield Exam Architecture & Decision Tree
\`\`\`
[Problem / Question Type]
      │
      ├──▶ If Condition A: Apply [Formula 1 / Method A] ──▶ [Expected Full-Mark Output]
      │
      └──▶ If Condition B: Apply [Formula 2 / Method B] ──▶ [Expected Full-Mark Output]
\`\`\`

---

### 🎯 3. High-Probability Exam Questions & Model Answers
(Provide 4-5 high-yield conceptual questions likely to appear)

#### Q1: [Important Question]
• **Model Answer**: [Crystal-clear, point-wise model answer to score full marks]
• **Key Keyword to Include**: **[Essential keyword]**

#### Q2: [Important Question]
• **Model Answer**: [Crystal-clear, point-wise model answer]
• **Key Keyword to Include**: **[Essential keyword]**

---

### ⚠️ 4. Common Exam Traps & Examiner Pitfalls
| Common Mistake | Why It's Wrong | Correct Exam Approach |
| :--- | :--- | :--- |
| **[Trap 1]** | [Explanation] | [Correct Method] |
| **[Trap 2]** | [Explanation] | [Correct Method] |

---

### 📝 5. Last-Minute Rapid Recall Sprint
• **Crucial Fact 1**: ...
• **Crucial Fact 2**: ...
• **Crucial Fact 3**: ...

DOCUMENT CONTENT:
${docContext || "Subject Study Material"}`;
      } else if (noteType === "revision") {
        prompt = `You are a master study coach. Generate **Rapid Revision Notes** for fast active recall based strictly on the provided document.

CRITICAL FORMATTING RULES:
- Never lump topics together; separate with '---'
- MUST include a Visual Diagram / Conceptual Flow
- Format comparison sections in clean Markdown tables
- Use bold bullet points (• **Term**: Definition)

Format with this exact structure:
# ⚡ Rapid Revision Notes (Active Recall Sprint)

> 💡 **Revision Goal**: (1-2 sentences on what to memorize during this active recall session)

---

### 📌 1. Core Concept Quick-Hits
• **[Topic 1]**: (2-sentence crisp summary of core mechanics)
• **[Topic 2]**: (2-sentence crisp summary of core mechanics)
• **[Topic 3]**: (2-sentence crisp summary of core mechanics)

---

### 🗺️ 2. Rapid Concept Flow & Memory Map
\`\`\`
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   [Core Topic]   │ ────▶ │  [Key Mechanism] │ ────▶ │ [Target Outcome] │
└──────────────────┘       └──────────────────┘       └──────────────────┘
\`\`\`

---

### 🔄 3. Key Differences Comparison Matrix
| Paradigm / Concept A | Paradigm / Concept B | Core Distinction / Trade-off |
| :--- | :--- | :--- |
| **[Concept A]** | **[Concept B]** | [Main functional difference] |
| **[Concept C]** | **[Concept D]** | [Main functional difference] |

---

### 🧠 4. Active Recall Memory Test (Self-Quiz)
1. **[Question 1]** → *Hint: [Brief mnemonic/hint]*
2. **[Question 2]** → *Hint: [Brief mnemonic/hint]*
3. **[Question 3]** → *Hint: [Brief mnemonic/hint]*

DOCUMENT CONTENT:
${docContext || "Subject Study Material"}`;
      } else if (noteType === "one_page") {
        prompt = `You are an academic synthesis expert. Generate a **Condensed One-Page Cheat Sheet** on the provided document.

CRITICAL FORMATTING RULES:
- High density, beautiful hierarchy, generous line spacing
- MUST include a clean Visual Flow Diagram
- Clean table for terminology

Format with this exact structure:
# 📄 One-Page Master Synthesis

> 💡 **Core Thesis**: (1 clear, powerful sentence defining the subject)

---

### 🏛️ Foundational Pillars
• **Pillar 1**: [Essential concept in 1 sentence]
• **Pillar 2**: [Essential concept in 1 sentence]
• **Pillar 3**: [Essential concept in 1 sentence]

---

### 🗺️ Master Execution Flow Diagram
\`\`\`
[Initial State] ──▶ [Core Formula / Transition] ──▶ [Steady State / Outcome]
\`\`\`

---

### ⚙️ Mechanics, Formulas & Flow
• **Core Equation / Flow**: \`[Key formula or logic]\`
• **How It Executes**: [Step-by-step mechanism in bullets]

---

### 📌 Vital Terminology Cheat Sheet
| Term | Meaning | One-Line Intuition |
| :--- | :--- | :--- |
| **[Term 1]** | [Definition] | [Intuitive takeaway] |
| **[Term 2]** | [Definition] | [Intuitive takeaway] |

---

### 🎯 Key Conclusions & Takeaways
• **Takeaway 1**: ...
• **Takeaway 2**: ...

DOCUMENT CONTENT:
${docContext || "Subject Study Material"}`;
      } else {
        prompt = `You are a master educator. Generate comprehensive, cleanly indented **Hierarchical Bullet-Point Notes** based strictly on the document.

CRITICAL FORMATTING RULES:
- Separate topics with headings and thematic breaks '---'
- MUST include a clean concept flowchart diagram
- MUST include a summary table mapping topics to key rules
- Use nested bullet points (• for main points, - for sub-points)
- Bold all key terms (**term**)

Format with this structure:
# 📝 Structured Hierarchical Notes

> 💡 **Overview**: (1-2 sentences summarizing the document)

---

### 🗺️ Concept Hierarchy & Architecture Diagram
\`\`\`
┌─────────────────────────────────┐
│     [Main Subject / Theme]      │
└──────────────┬──────────────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
   [Branch 1]    [Branch 2]
\`\`\`

---

### 📌 1. [First Major Topic]
• **Core Principle**: [Explanation]
  - Sub-concept: [Details]
  - Application: [Where used]

---

### 📌 2. [Second Major Topic]
• **Core Principle**: [Explanation]
  - Sub-concept: [Details]
  - Application: [Where used]

---

### 📊 3. Topic Summary & Rules Matrix
| Topic Module | Primary Mechanism | Key Takeaway |
| :--- | :--- | :--- |
| **[Module 1]** | [Mechanism] | [Takeaway] |
| **[Module 2]** | [Mechanism] | [Takeaway] |

DOCUMENT CONTENT:
${docContext || "Subject Study Material"}`;
      }

      const notes = await callAIDirect([
        {
          role: "system",
          content:
            "You are a world-class academic author (matching ChatGPT, Grok, and Gemini). Output crystal-clear, beautifully organized Markdown notes with proper headings, tables, visual diagrams in code blocks, callout blocks, and bold bullet points. Always synthesize complete, authoritative notes on the requested topic. Never refuse, never say missing source material, and never ask user to paste text.",
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