import time
import json
import re
from services.ai_service import AIService
from app.utils.logger import get_logger

logger = get_logger("RAGService")


class RAGService:

    def __init__(self, vector_store):
        self.vector_store = vector_store
        logger.info("RAGService initialized with vector store")

    # =====================================
    # Chat (Single or Multi-Document)
    # =====================================

    def ask(
        self,
        question: str,
        document_id: str | list[str] | None = None
    ) -> dict:
        start_time = time.perf_counter()
        logger.info(f"RAG ask request: '{question[:80]}' (doc_id={document_id})")

        documents = self.vector_store.search(
            question=question,
            document_id=document_id,
            k=6
        )

        if not documents:
            logger.info(f"No matching documents found for query in doc_id={document_id}")
            return {
                "answer": "I couldn't find this information in your uploaded document.",
                "sources": []
            }

        logger.info(f"Retrieved {len(documents)} context chunks for prompt generation")
        context = "\n\n".join(documents)

        prompt = f"""
You are EduMind AI, a strict, zero-hallucination academic AI assistant.

CRITICAL INSTRUCTIONS:
- Answer ONLY using the uploaded document context below.
- Never invent facts, make assumptions, or extrapolate outside the context.
- If the exact answer is missing from the document, you MUST respond EXACTLY:
"I couldn't find this information in your uploaded document."
- Include exact section headings or citations where possible.

DOCUMENT CONTEXT:
{context}

USER QUESTION:
{question}

GROUNDED ANSWER:
"""

        answer = AIService.generate(prompt)
        elapsed = (time.perf_counter() - start_time) * 1000

        logger.info(f"RAG query answered successfully in {elapsed:.2f}ms")
        return {
            "answer": answer,
            "sources": documents
        }

    # =====================================
    # Semantic Search with Scoring
    # =====================================

    def semantic_search(
        self,
        query: str,
        document_id: str | list[str] | None = None,
        k: int = 6
    ) -> list[dict]:
        return self.vector_store.search_with_scores(
            question=query,
            document_id=document_id,
            k=k
        )

    # =====================================
    # Get Full Document Context
    # =====================================

    def get_document_context(
        self,
        document_id: str | list[str] | None = None
    ) -> str:
        return self.vector_store.get_document_context(document_id)

    # =====================================
    # Executive & Comprehensive Summary
    # =====================================

    def generate_summary(
        self,
        document_id: str | list[str] | None = None
    ) -> str:
        start_time = time.perf_counter()
        logger.info(f"Generating high-volume full-explanation summary for document_id={document_id}")

        context = self.get_document_context(document_id)
        word_count = len(context.split())
        estimated_reading_time = max(1, round(word_count / 200))

        prompt = f"""
You are EduMind AI, a world-class academic researcher and master study guide author.

Generate an exhaustive, deep, and fully explained master study guide summarizing the uploaded document.

CRITICAL REQUIREMENTS:
- Minimum 400 to 700+ words.
- Base ALL explanations strictly on the provided document content.
- Do NOT hallucinate.

Format in clean, rich Markdown with this exact structure:

### ⏱️ Reading Metrics
- **Estimated Reading Time**: ~{estimated_reading_time} minutes
- **Document Scope**: Academic Syllabus / Chapter Analysis

### 📌 1. Executive Summary & Core Purpose
- Overarching thesis, core background, and primary motivation.

### 🎯 2. Fundamental Concepts & Theoretical Framework
- In-depth breakdown of primary definitions, theories, and core principles.

### 🔍 3. Step-by-Step Deep Dive & Key Formulas / Mechanics
- Detailed workflows, equations, mathematical derivations, or algorithmic steps with concrete examples from the text.

### 🔑 4. High-Yield Keywords & Core Terminology Glossary
- Alphabetical glossary of vital technical terms and domain vocabulary with definitions.

### 💡 5. Key Takeaways & Exam Insights
- Must-remember exam points and practical takeaways.

DOCUMENT CONTENT:
{context[:25000]}
"""

        summary = AIService.generate(prompt)
        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Summary generated in {elapsed:.2f}ms")
        return summary

    # =====================================
    # AI Notes Generator (Class, Exam, Revision, One-Page, Bullet)
    # =====================================

    def generate_notes(
        self,
        document_id: str | list[str] | None = None,
        note_type: str = "detailed"
    ) -> str:
        start_time = time.perf_counter()
        logger.info(f"Generating notes (type={note_type}) for document_id={document_id}")

        context = self.get_document_context(document_id)

        if note_type == "exam":
            prompt = f"""
You are EduMind AI. Generate **High-Yield Exam Notes** based strictly on the uploaded document.

Format in rich Markdown:
### 🎓 High-Yield Exam Master Notes

#### ⚡ Must-Know Formulas & Key Laws
(List all vital formulas, theorems, and definitions with units/meanings)

#### 🎯 High-Probability Exam Questions & Detailed Answers
(Top 5-8 conceptual exam questions likely to appear with model answers)

#### ⚠️ Common Exam Traps & Misconceptions
(Tricky distinctions and pitfalls students often get wrong)

#### 📝 Rapid Recall Cheat Sheet
(High-density bullet points for last-minute review before walking into the exam)

DOCUMENT CONTENT:
{context[:22000]}
"""
        elif note_type == "revision":
            prompt = f"""
You are EduMind AI. Generate **Rapid Revision Notes** for fast active recall based strictly on the uploaded document.

Format in clean Markdown:
### ⚡ Rapid Revision Notes (Active Recall Sprint)

#### 📌 Core Concept Summaries
(2-sentence crisp summaries for every major topic in the document)

#### 🔄 Comparison Matrices & Trade-offs
(Markdown tables comparing interrelated paradigms, concepts, or methods)

#### 🧠 Self-Testing Questions
(10 rapid-fire active recall questions to test memory retention)

DOCUMENT CONTENT:
{context[:22000]}
"""
        elif note_type == "one_page":
            prompt = f"""
You are EduMind AI. Generate a **Condensed One-Page Cheat Sheet / Master Notes** synthesizing the entire document on one clean page.

Format in clean Markdown:
### 📄 One-Page Master Synthesis

- **Core Theme**: (1 crisp sentence)
- **Foundational Principles**: (3-4 high-impact bullets)
- **Key Equations / Mechanics**: (Formulas or core algorithmic flow)
- **Vital Terminology**: (Top 8 must-remember terms)
- **Actionable Takeaways**: (Key conclusions)

DOCUMENT CONTENT:
{context[:22000]}
"""
        elif note_type == "bullet":
            prompt = f"""
You are EduMind AI. Generate comprehensive **Hierarchical Bullet-Point Notes** based strictly on the uploaded document.

Format in clean Markdown with nested bullets, bold terms, and key definitions:
### 📝 Structured Bullet-Point Notes

DOCUMENT CONTENT:
{context[:22000]}
"""
        else: # detailed / class notes
            prompt = f"""
You are EduMind AI, an elite university professor. Generate comprehensive, lecture-grade **Detailed Class Notes** based strictly on the uploaded document.

Format in rich Markdown:
### 📚 Comprehensive Class Notes & Study Guide

#### 1. Introduction & Contextual Background
#### 2. Deep Theoretical Foundations
#### 3. Step-by-Step Mechanisms & Derivations
#### 4. Case Studies & Real-World Examples
#### 5. Formulas, Equations & Working Logic
#### 6. Summary Review & Discussion Questions

DOCUMENT CONTENT:
{context[:25000]}
"""

        notes = AIService.generate(prompt)
        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Notes generated ({note_type}) in {elapsed:.2f}ms")
        return notes

    # =====================================
    # Interactive Mind Map Tree Generator
    # =====================================

    def generate_mindmap(
        self,
        document_id: str | list[str] | None = None
    ) -> dict:
        start_time = time.perf_counter()
        logger.info(f"Generating mindmap tree for document_id={document_id}")

        context = self.get_document_context(document_id)
        prompt = f"""
You are EduMind AI. Extract a rich, hierarchical Mind Map from the document.

Return ONLY a valid JSON object representing a tree of concept nodes.
Do NOT use markdown code blocks or conversational text.

Structure format:
{{
  "id": "root",
  "label": "Central Document Topic",
  "color": "#0ea5e9",
  "children": [
    {{
      "id": "node-1",
      "label": "Primary Chapter 1",
      "color": "#6366f1",
      "children": [
        {{ "id": "node-1-1", "label": "Key Concept A", "color": "#8b5cf6" }},
        {{ "id": "node-1-2", "label": "Key Concept B", "color": "#8b5cf6" }}
      ]
    }},
    {{
      "id": "node-2",
      "label": "Primary Chapter 2",
      "color": "#10b981",
      "children": [
        {{ "id": "node-2-1", "label": "Mechanism 1", "color": "#14b8a6" }},
        {{ "id": "node-2-2", "label": "Mechanism 2", "color": "#14b8a6" }}
      ]
    }}
  ]
}}

DOCUMENT CONTENT:
{context[:15000]}
"""

        raw = AIService.generate(prompt)
        elapsed = (time.perf_counter() - start_time) * 1000

        # Clean raw output to extract JSON
        clean_json = raw.strip()
        match = re.search(r"\{.*\}", clean_json, re.DOTALL)
        if match:
            clean_json = match.group(0)

        try:
            tree = json.loads(clean_json)
            logger.info(f"Mind map JSON parsed successfully in {elapsed:.2f}ms")
            return tree
        except Exception as e:
            logger.warning(f"Failed parsing mindmap JSON directly ({e}). Building fallback tree.")
            return {
                "id": "root",
                "label": "Document Mind Map",
                "color": "#0ea5e9",
                "children": [
                    {"id": "node-1", "label": "Core Foundations", "color": "#6366f1", "children": []},
                    {"id": "node-2", "label": "Key Methodologies", "color": "#10b981", "children": []},
                    {"id": "node-3", "label": "Important Outcomes", "color": "#f59e0b", "children": []}
                ]
            }

    # =====================================
    # Study Planner Generator
    # =====================================

    def generate_study_plan(
        self,
        document_id: str | list[str] | None = None,
        plan_type: str = "weekly"
    ) -> str:
        start_time = time.perf_counter()
        logger.info(f"Generating study plan ({plan_type}) for document_id={document_id}")

        context = self.get_document_context(document_id)

        if plan_type == "cram_1day":
            prompt = f"""
You are EduMind AI, an elite academic coach.
Generate an intensive, hour-by-hour **1-Day Emergency Revision Plan (Cram Schedule)** based strictly on this document.

Format in rich Markdown with clean headings, time blocks, and checkboxes:
### ⚡ 1-Day Final Exam Sprint Schedule

#### 🌅 Morning: Core Theory & High-Yield Foundations (08:00 - 12:00)
- [ ] **08:00 - 09:30 | Core Principles**: Deep dive into primary definitions and fundamental theorems.
- [ ] **09:30 - 10:45 | High-Probability Concepts**: Master key mechanisms and theoretical frameworks.
- [ ] **10:45 - 12:00 | Active Recall**: Write down core concept maps from memory and review flashcards.

#### ☀️ Afternoon: Deep Mechanics & Problem Solving (13:00 - 17:00)
- [ ] **13:00 - 14:30 | Step-by-Step Walkthroughs**: Review formulas, derivations, and comparative trade-offs.
- [ ] **14:30 - 15:45 | Critical Edge Cases & Common Traps**: Identify frequent exam misconceptions.
- [ ] **15:45 - 17:00 | Practice Questions Drill**: Rapid-fire practice quiz and self-testing on weak areas.

#### 🌙 Evening: Rapid-Fire Recall & Polish (18:00 - 21:30)
- [ ] **18:00 - 19:30 | Complete Glossary Blitz**: Review every definition and technical term.
- [ ] **19:30 - 20:45 | Key Takeaways & Cheat Sheet Review**: Final consolidation of high-yield bullet points.
- [ ] **20:45 - 21:30 | Confidence Check & Mental Reset**: Quick sanity review and rest.

DOCUMENT CONTENT:
{context[:20000]}
"""
        elif plan_type == "monthly":
            prompt = f"""
You are EduMind AI. Generate a comprehensive **4-Week Mastery Study Curriculum (Monthly Plan)** tailored specifically to the topics in this document.

Format in rich Markdown with clean weekly modules, target objectives, daily breakdowns, and checkboxes:
### 🗓️ 4-Week Comprehensive Mastery Curriculum

#### 📘 Week 1: Foundational Theory & Conceptual Grounding
- **Target Goals**: Master core definitions, historical context, and primary frameworks.
- [ ] **Days 1-2**: Introduction to core objectives and fundamental principles.
- [ ] **Days 3-4**: In-depth theoretical grounding and term definitions.
- [ ] **Days 5-6**: Active flashcard review and foundational quiz.
- [ ] **Day 7**: Milestone Review: Summarize Week 1 takeaways.

#### 📗 Week 2: Deep Mechanics, Methodologies & Evidence
- **Target Goals**: Understand step-by-step algorithms, formulas, and mechanisms.
- [ ] **Days 8-10**: Granular analysis of core mechanisms and workflows.
- [ ] **Days 11-13**: Problem-solving drills and mathematical foundations.
- [ ] **Day 14**: Intermediate Assessment: Full concept evaluation.

#### 📙 Week 3: Advanced Applications & Synthesis
- **Target Goals**: Connect disparate topics, contrast alternatives, and resolve edge cases.
- [ ] **Days 15-17**: Comparative trade-off analysis and nuance exploration.
- [ ] **Days 18-20**: Comprehensive practice quizzes and active recall drills.
- [ ] **Day 21**: Weakness Remediation: Target challenging topics.

#### 📕 Week 4: Final Consolidation & Exam Readiness
- **Target Goals**: Peak recall retention, timed simulations, and speed mastery.
- [ ] **Days 22-24**: Full simulated exam conditions & timed quizzes.
- [ ] **Days 25-26**: Master glossary & cheat sheet memorization.
- [ ] **Days 27-28**: Final polish and peak performance readiness.

DOCUMENT CONTENT:
{context[:20000]}
"""
        else: # weekly
            prompt = f"""
You are EduMind AI. Generate a highly structured **7-Day Study Sprint Plan (Weekly Plan)** based specifically on the content of this document.

Format in clean Markdown with day-by-day goals, active recall tasks, and checkboxes:
### 📅 7-Day Structured Study Sprint

#### 🎯 Day 1: Orientation & Foundational Scope
- [ ] Read the executive summary and understand document goals.
- [ ] Identify primary themes and extract core glossary definitions.

#### 🎯 Day 2: Core Principles & Primary Concepts
- [ ] Deep dive into foundational theories and why they matter.
- [ ] Review 10 AI-generated flashcards for Day 2 topics.

#### 🎯 Day 3: Step-by-Step Mechanisms & Workflows
- [ ] Analyze the detailed processes, algorithms, or formulas in detail.
- [ ] Take a 5-question practice quiz to benchmark understanding.

#### 🎯 Day 4: Deep Dive & Nuance Analysis
- [ ] Examine critical examples, evidence, and comparative trade-offs.
- [ ] Review common failure modes and tricky distinctions.

#### 🎯 Day 5: Active Recall & Flashcard Mastery
- [ ] Full flashcard deck review across all document sections.
- [ ] Test yourself without looking at notes (Feynman Technique).

#### 🎯 Day 6: Comprehensive Practice Exam
- [ ] Complete full practice quiz under test conditions.
- [ ] Synthesize a 1-page condensed study sheet.

#### 🎯 Day 7: Final Milestone Synthesis & Mastery Check
- [ ] Speed-review complete terminology glossary.
- [ ] Revisit high-yield key takeaways.

DOCUMENT CONTENT:
{context[:20000]}
"""

        plan = AIService.generate(prompt)
        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Study plan generated in {elapsed:.2f}ms")
        return plan

    # =====================================
    # High-Yield Flashcards (20–50 Cards)
    # =====================================

    def generate_flashcards(
        self,
        document_id: str | list[str] | None = None
    ) -> str:
        start_time = time.perf_counter()
        logger.info(f"Generating high-yield flashcard deck (20-30 cards) for document_id={document_id}")

        context = self.get_document_context(document_id)
        prompt = f"""
You are an expert academic tutor creating comprehensive study flashcards from a document.

REQUIREMENT:
Create 20 to 30 high-value study flashcards covering key definitions, concepts, mechanisms, formulas, and facts from the text.

Each card MUST have:
1. "question": Clear, direct question.
2. "answer": Accurate, concise answer grounded strictly in the document.
3. "difficulty": "Easy", "Medium", or "Hard".
4. "chapter": Relevant chapter or topic name.

Return ONLY a valid JSON array of objects. Do NOT wrap in markdown fences or add conversational text.

Example format:
[
  {{
    "question": "What is the primary function of mitochondria?",
    "answer": "To generate most of the chemical energy (ATP) needed to power the cell.",
    "difficulty": "Easy",
    "chapter": "Cellular Biology"
  }}
]

DOCUMENT CONTENT:
{context[:22000]}
"""

        response = AIService.generate(prompt)
        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Flashcards LLM response received in {elapsed:.2f}ms")
        return response

    # =====================================
    # High-Yield Quiz (20–30 MCQs)
    # =====================================

    def generate_quiz(
        self,
        document_id: str | list[str] | None = None
    ) -> str:
        start_time = time.perf_counter()
        logger.info(f"Generating high-yield practice quiz (20 MCQs) for document_id={document_id}")

        context = self.get_document_context(document_id)
        prompt = f"""
You are an expert university examiner. Generate a rigorous 15 to 20 question multiple-choice quiz based strictly on the provided document.

Each question must have:
1. "question": Clear, precise question.
2. "options": Array of exactly 4 distinct answer choices.
3. "answer": Exact string matching one of the 4 choices.
4. "explanation": Thorough 1-2 sentence explanation of why this answer is correct based on the document.
5. "difficulty": "Easy", "Medium", or "Hard".
6. "chapter": Relevant topic / section name.

Return ONLY a valid JSON array of objects. Do NOT include markdown code fences or conversational text.

Example format:
[
  {{
    "question": "Which process converts glucose into pyruvate?",
    "options": ["Glycolysis", "Krebs Cycle", "Photosynthesis", "Oxidative Phosphorylation"],
    "answer": "Glycolysis",
    "explanation": "Glycolysis is the metabolic pathway that converts glucose into pyruvate, releasing energy in the process.",
    "difficulty": "Easy",
    "chapter": "Metabolic Pathways"
  }}
]

DOCUMENT CONTENT:
{context[:22000]}
"""

        response = AIService.generate(prompt)
        elapsed = (time.perf_counter() - start_time) * 1000
        logger.info(f"Quiz LLM response received in {elapsed:.2f}ms")
        return response