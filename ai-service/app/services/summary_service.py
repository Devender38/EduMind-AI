from app.services.ai_service import AIService


class SummaryService:

    @staticmethod
    def generate_summary(context: str):

        prompt = f"""
You are EduMind AI.

Your task is to summarize the uploaded study material.

Rules:

- Use ONLY the provided document.
- Never add outside knowledge.
- Keep the summary between 150 and 250 words.
- Explain in simple English.
- Use bullet points whenever possible.
- Highlight the most important concepts.
- Do not write introduction or conclusion.
- If the document is empty reply:

"No summary could be generated."

---------------------------------------
DOCUMENT
---------------------------------------

{context}

---------------------------------------
OUTPUT FORMAT
---------------------------------------

Summary:

• Point 1

• Point 2

• Point 3

• Point 4

• Point 5

"""

        return AIService.generate(prompt)