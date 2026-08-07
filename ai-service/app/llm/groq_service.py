import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

MODEL = os.getenv(
    "MODEL_NAME",
    "llama-3.1-8b-instant"
)


class GroqService:

    @staticmethod
    def generate_answer(context: str, question: str):

        prompt = f"""
You are EduMind AI.

Answer ONLY using the context below.

If the answer is not present in the context,
reply:

"I couldn't find this information in the uploaded document."

Context:
{context}

Question:
{question}
"""

        response = client.chat.completions.create(
            model=MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=700
        )

        return response.choices[0].message.content