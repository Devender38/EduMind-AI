from app.services.ai_service import AIService


class FlashcardService:

    @staticmethod
    def generate_flashcards(context: str):

        prompt = f"""
You are EduMind AI.

Generate study flashcards ONLY from the document.

Rules:

- Use ONLY the document.
- Never invent information.
- Generate 10 flashcards.
- Output ONLY valid JSON.
- No markdown.
- No explanation.

Format:

[
  {{
    "question":"...",
    "answer":"..."
  }}
]

DOCUMENT

{context}

OUTPUT
"""

        return AIService.generate(prompt)