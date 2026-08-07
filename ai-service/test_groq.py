from app.llm.groq_service import GroqService

context = """
Artificial Intelligence is a branch of Computer Science.
Machine Learning is a subset of Artificial Intelligence.
"""

question = "What is Artificial Intelligence?"

answer = GroqService.generate_answer(
    context,
    question
)

print("\nAI Answer:\n")
print(answer)