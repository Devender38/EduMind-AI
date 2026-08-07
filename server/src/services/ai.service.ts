import axios from "axios";
import { createLogger } from "../utils/logger";

const logger = createLogger("AIServiceClient");

const AI_BASE_URL =
  process.env.AI_SERVICE_URL ||
  "http://127.0.0.1:8000";

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

export class AIService {

  /**
   * Upload and index PDF to Python AI Service
   */
  static async uploadPDF(
    pdfUrl: string,
    documentId: string
  ) {
    const startTime = Date.now();
    logger.info(`[POST /extract-url] Requesting AI indexing for doc: ${documentId} | URL: ${pdfUrl}`);

    try {
      const response = await axios.post(
        `${AI_BASE_URL}/extract-url`,
        {
          pdf_url: pdfUrl,
          document_id: documentId,
        },
        {
          timeout: 300000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(
        `[POST /extract-url] Document indexed successfully in ${elapsed}ms (pages: ${response.data.pageCount}, chunks: ${response.data.chunkCount})`
      );
      return response.data;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(
        `[POST /extract-url] Failed indexing document ${documentId} after ${elapsed}ms: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

  /**
   * Chat with AI RAG (supports single or multi-doc)
   */
  static async ask(
    question: string,
    documentId?: string | string[]
  ): Promise<AIAnswer> {
    const startTime = Date.now();
    logger.info(`[POST /chat] Sending query to AI: "${question.substring(0, 80)}" (doc: ${JSON.stringify(documentId) || "none"})`);

    try {
      const response = await axios.post<AIAnswer>(
        `${AI_BASE_URL}/chat`,
        {
          question,
          document_id: documentId,
        },
        {
          timeout: 300000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(
        `[POST /chat] AI Answer received in ${elapsed}ms (sources: ${response.data.sources?.length || 0})`
      );
      return response.data;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(
        `[POST /chat] AI query failed after ${elapsed}ms: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

  /**
   * Generate AI Summary
   */
  static async summary(
    documentId: string | string[]
  ): Promise<AISummary> {
    const startTime = Date.now();
    logger.info(`[POST /summary] Requesting AI summary for doc: ${JSON.stringify(documentId)}`);

    try {
      const response = await axios.post<AISummary>(
        `${AI_BASE_URL}/summary`,
        {
          document_id: documentId,
        },
        {
          timeout: 300000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`[POST /summary] AI summary received in ${elapsed}ms`);
      return response.data;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(
        `[POST /summary] Failed generating summary after ${elapsed}ms: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

  /**
   * Generate AI Study Plan (weekly, monthly, cram_1day)
   */
  static async studyPlan(
    documentId: string | string[],
    planType: string = "weekly"
  ): Promise<AIStudyPlan> {
    const startTime = Date.now();
    logger.info(`[POST /planner] Requesting AI study plan (${planType}) for doc: ${JSON.stringify(documentId)}`);

    try {
      const response = await axios.post<AIStudyPlan>(
        `${AI_BASE_URL}/planner`,
        {
          document_id: documentId,
          plan_type: planType,
        },
        {
          timeout: 300000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`[POST /planner] AI study plan (${planType}) received in ${elapsed}ms`);
      return response.data;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(
        `[POST /planner] Failed generating study plan after ${elapsed}ms: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

  /**
   * Generate AI Notes (detailed, exam, revision, one_page, bullet)
   */
  static async notes(
    documentId: string | string[],
    noteType: string = "detailed"
  ): Promise<AINotes> {
    const startTime = Date.now();
    logger.info(`[POST /notes/generate] Requesting AI notes (${noteType}) for doc: ${JSON.stringify(documentId)}`);

    try {
      const response = await axios.post<AINotes>(
        `${AI_BASE_URL}/notes/generate`,
        {
          document_id: documentId,
          note_type: noteType,
        },
        {
          timeout: 300000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`[POST /notes/generate] AI notes (${noteType}) generated in ${elapsed}ms`);
      return response.data;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(
        `[POST /notes/generate] Failed generating notes after ${elapsed}ms: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

  /**
   * Generate AI Mind Map Tree
   */
  static async mindmap(
    documentId: string | string[]
  ): Promise<AIMindMap> {
    const startTime = Date.now();
    logger.info(`[POST /mindmap/generate] Requesting AI mindmap for doc: ${JSON.stringify(documentId)}`);

    try {
      const response = await axios.post<AIMindMap>(
        `${AI_BASE_URL}/mindmap/generate`,
        {
          document_id: documentId,
        },
        {
          timeout: 300000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`[POST /mindmap/generate] AI mindmap generated in ${elapsed}ms`);
      return response.data;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(
        `[POST /mindmap/generate] Failed generating mindmap after ${elapsed}ms: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

  /**
   * Semantic Search across indexed vectors with confidence scores
   */
  static async semanticSearch(
    query: string,
    documentId?: string | string[],
    k: number = 6
  ): Promise<AISemanticSearch> {
    const startTime = Date.now();
    logger.info(`[POST /search/semantic] Semantic search for: "${query.substring(0, 60)}"`);

    try {
      const response = await axios.post<AISemanticSearch>(
        `${AI_BASE_URL}/search/semantic`,
        {
          query,
          document_id: documentId,
          k,
        },
        {
          timeout: 300000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`[POST /search/semantic] Found ${response.data.results?.length || 0} matches in ${elapsed}ms`);
      return response.data;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(
        `[POST /search/semantic] Semantic search failed after ${elapsed}ms: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

  /**
   * Generate AI Flashcards
   */
  static async flashcards(
    documentId: string | string[]
  ): Promise<AIFlashcards> {
    const startTime = Date.now();
    logger.info(`[POST /flashcards] Requesting AI flashcards for doc: ${JSON.stringify(documentId)}`);

    try {
      const response = await axios.post<AIFlashcards>(
        `${AI_BASE_URL}/flashcards`,
        {
          document_id: documentId,
        },
        {
          timeout: 300000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`[POST /flashcards] Generated ${response.data.count} flashcards in ${elapsed}ms`);
      return response.data;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(
        `[POST /flashcards] Failed generating flashcards after ${elapsed}ms: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

  /**
   * Generate AI Quiz
   */
  static async quiz(
    documentId: string | string[]
  ): Promise<AIQuiz> {
    const startTime = Date.now();
    logger.info(`[POST /quiz] Requesting AI quiz for doc: ${JSON.stringify(documentId)}`);

    try {
      const response = await axios.post<AIQuiz>(
        `${AI_BASE_URL}/quiz`,
        {
          document_id: documentId,
        },
        {
          timeout: 300000,
        }
      );

      const elapsed = Date.now() - startTime;
      logger.info(`[POST /quiz] Generated ${response.data.count} quiz questions in ${elapsed}ms`);
      return response.data;
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(
        `[POST /quiz] Failed generating quiz after ${elapsed}ms: ${error.response?.data?.detail || error.message}`
      );
      throw error;
    }
  }

}