import { Request, Response } from "express";
import mongoose from "mongoose";
import axios from "axios";

import Conversation from "../models/Conversation";
import Chat from "../models/Chat";
import Document from "../models/Document";
import ActivityLog from "../models/ActivityLog";
import { AIService } from "../services/ai.service";
import { createLogger } from "../utils/logger";

const logger = createLogger("ChatController");

export class ChatController {
  static async chat(req: Request, res: Response) {
    const startTime = Date.now();

    try {
      const { conversationId, question, documentId } = req.body;
      const userId = (req as any).user?._id;

      if (!question || question.trim() === "") {
        logger.warn("Chat rejected: Empty question");
        return res.status(400).json({
          success: false,
          message: "Question is required",
        });
      }

      let conversation: any = null;

      // 1. If conversationId is provided and valid, look it up
      if (conversationId && mongoose.Types.ObjectId.isValid(conversationId)) {
        conversation = await Conversation.findById(conversationId);
      }

      // 2. If no valid conversation found by conversationId, check documentId
      if (!conversation && documentId && mongoose.Types.ObjectId.isValid(documentId)) {
        if (userId) {
          conversation = await Conversation.findOne({
            user: userId,
            document: documentId,
          }).sort({ updatedAt: -1 });

          if (!conversation) {
            const doc = await Document.findById(documentId);
            conversation = await Conversation.create({
              user: userId,
              document: documentId,
              title: doc?.title || "New Study Conversation",
            });
          }
        }
      }

      // 3. If still no conversation, find latest conversation for user
      if (!conversation && userId) {
        conversation = await Conversation.findOne({ user: userId }).sort({
          updatedAt: -1,
        });
      }

      const docId = conversation?.document
        ? conversation.document.toString()
        : documentId && mongoose.Types.ObjectId.isValid(documentId)
        ? documentId
        : undefined;

      logger.info(
        `Processing chat query: "${question.substring(0, 80)}" (doc: ${docId || "all"}, conv: ${conversation?._id || "none"})`
      );

      // Ask AI RAG service
      const aiResult = await AIService.ask(question, docId);

      let userMessage: any = null;
      let assistantMessage: any = null;

      // Save messages if conversation exists
      if (conversation) {
        userMessage = await Chat.create({
          conversation: conversation._id,
          role: "user",
          message: question,
        });

        assistantMessage = await Chat.create({
          conversation: conversation._id,
          role: "assistant",
          message: aiResult.answer,
          sources: aiResult.sources || [],
        });

        await Conversation.findByIdAndUpdate(conversation._id, {
          $set: { updatedAt: new Date() },
        });
      }

      // Log activity
      if (userId) {
        await ActivityLog.create({
          user: userId,
          activityType: "chat_query",
          title: `Asked: "${question.substring(0, 50)}${question.length > 50 ? "..." : ""}"`,
          documentId: docId && mongoose.Types.ObjectId.isValid(docId) ? docId : undefined,
          metadata: {
            sourcesCount: aiResult.sources?.length || 0,
            conversationId: conversation?._id,
          },
        }).catch((err) => logger.warn("Failed saving chat activity log:", err));
      }

      const elapsed = Date.now() - startTime;
      logger.info(`Chat flow completed in ${elapsed}ms`);

      return res.status(200).json({
        success: true,
        answer: aiResult.answer,
        sources: aiResult.sources || [],
        conversationId: conversation?._id,
        messages: {
          user: userMessage,
          assistant: assistantMessage,
        },
      });
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(`Chat error after ${elapsed}ms: ${error.message}`, error);

      return res.status(500).json({
        success: false,
        message: error.message || "Internal Server Error",
      });
    }
  }

  static async transcribeVoice(req: Request, res: Response) {
    try {
      const { audio, mimeType } = req.body;
      if (!audio) {
        return res.status(400).json({ success: false, message: "No audio data provided" });
      }

      const apiKey = process.env.OPENROUTER_API_KEY || "";
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: "OPENROUTER_API_KEY is not configured in Render environment variables.",
        });
      }

      const audioMime = mimeType || "audio/webm";
      const audioUrl = audio.startsWith("data:") ? audio : `data:${audioMime};base64,${audio}`;

      const response = await axios.post(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          model: "google/gemini-2.5-flash",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "You are a voice transcription assistant for students. Listen carefully to this audio recording and transcribe the spoken words into clear text. If the student spoke in Hindi, English, or Hinglish, transcribe it accurately. Output ONLY the transcribed text. If the audio is silent or unintelligible, output an empty string. Do not include any explanations, introductory remarks, or quotation marks.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: audioUrl,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://edumind-ai.vercel.app",
            "X-Title": "EduMind AI Voice",
          },
          timeout: 25000,
        }
      );

      const transcribed = response.data?.choices?.[0]?.message?.content?.trim() || "";
      const cleaned = transcribed
        .replace(/^(the audio is silent|no speech detected|silent)\.?$/i, "")
        .trim();

      return res.json({
        success: true,
        text: cleaned,
      });
    } catch (error: any) {
      logger.error("Audio transcription error:", error.response?.data || error.message);
      return res.status(500).json({
        success: false,
        message: error.response?.data?.error?.message || "Failed to transcribe audio",
      });
    }
  }

  static async voiceTutor(req: Request, res: Response) {
    const startTime = Date.now();
    try {
      const {
        question,
        documentId,
        language = "en-US",
        level = "beginner",
        mode = "explain",
        history = [],
      } = req.body;
      const userId = (req as any).user?._id;

      if (!question || !question.trim()) {
        return res.status(400).json({
          success: false,
          message: "Topic or question is required",
        });
      }

      logger.info(
        `Voice tutor query: "${question.substring(0, 80)}" [${language} | ${level} | ${mode}]`
      );

      const result = await AIService.voiceTutor({
        question: question.trim(),
        documentId,
        language,
        level,
        mode,
        conversationHistory: history,
      });

      // Log activity
      if (userId) {
        await ActivityLog.create({
          user: userId,
          activityType: "voice_tutor",
          title: `Voice Tutor: "${question.substring(0, 50)}${question.length > 50 ? "..." : ""}"`,
          documentId:
            documentId && mongoose.Types.ObjectId.isValid(documentId)
              ? documentId
              : undefined,
          metadata: {
            language,
            level,
            mode,
            sourcesCount: result.sources.length,
          },
        }).catch((err) => logger.warn("Failed saving voice tutor activity log:", err));
      }

      const elapsed = Date.now() - startTime;
      logger.info(`Voice tutor response generated in ${elapsed}ms`);

      return res.status(200).json({
        success: true,
        answer: result.answer,
        sources: result.sources,
        suggestedFollowups: result.suggestedFollowups,
      });
    } catch (error: any) {
      const elapsed = Date.now() - startTime;
      logger.error(`Voice tutor error after ${elapsed}ms: ${error.message}`, error);
      return res.status(500).json({
        success: false,
        message: error.message || "Voice Tutor failed to respond",
      });
    }
  }

  static async tts(req: Request, res: Response) {
    try {
      const rawText = ((req.query.text as string) || "").trim();
      const lang = ((req.query.lang as string) || "en").slice(0, 10);

      if (!rawText) {
        return res.status(400).send("Text is required");
      }

      // Clean markdown and formatting symbols for clear speech
      const clean = rawText
        .replace(/#{1,6}\s+/g, "")
        .replace(/[*_`#>~[\]()]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      const langLower = lang.toLowerCase();
      let targetLang = "en";
      if (langLower.startsWith("hi") || langLower.includes("hinglish")) targetLang = "hi";
      else if (langLower.startsWith("bn")) targetLang = "bn";
      else if (langLower.startsWith("ta")) targetLang = "ta";
      else if (langLower.startsWith("te")) targetLang = "te";
      else if (langLower.startsWith("mr")) targetLang = "mr";
      else if (langLower.startsWith("es")) targetLang = "es";
      else if (langLower.startsWith("fr")) targetLang = "fr";
      else if (langLower.includes("in")) targetLang = "en-IN";

      // Google translate_tts has a strict ~200 character limit per request.
      // Split into word-safe chunks of max 175 characters.
      const words = clean.slice(0, 800).split(/\s+/);
      const chunks: string[] = [];
      let currentChunk = "";

      for (const word of words) {
        if (!word) continue;
        if ((currentChunk + " " + word).trim().length <= 175) {
          currentChunk = (currentChunk + " " + word).trim();
        } else {
          if (currentChunk) chunks.push(currentChunk);
          currentChunk = word.slice(0, 175);
        }
      }
      if (currentChunk) chunks.push(currentChunk);

      if (chunks.length === 0) {
        return res.status(400).send("No readable text provided");
      }

      // Fetch each chunk in parallel from Google TTS
      const buffers = await Promise.all(
        chunks.map(async (chunk) => {
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
            targetLang
          )}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

          const resp = await axios.get(ttsUrl, {
            headers: {
              "User-Agent":
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              Referer: "https://translate.google.com/",
            },
            responseType: "arraybuffer",
            timeout: 10000,
          });

          return Buffer.from(resp.data);
        })
      );

      // Concatenate MP3 binary streams seamlessly
      const mergedAudio = Buffer.concat(buffers);

      res.set({
        "Content-Type": "audio/mpeg",
        "Cross-Origin-Resource-Policy": "cross-origin",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400",
      });

      return res.send(mergedAudio);
    } catch (error: any) {
      logger.error("TTS audio stream error:", error.message);
      return res.status(500).send("TTS audio failed");
    }
  }
}