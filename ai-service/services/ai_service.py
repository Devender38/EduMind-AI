import os
import json
import time
import requests
from dotenv import load_dotenv
from app.utils.logger import get_logger

load_dotenv()
logger = get_logger("AIService")


class AIService:

    @staticmethod
    def generate(prompt: str) -> str:
        provider = os.getenv("AI_PROVIDER", "ollama").lower()
        logger.info(f"Dispatching LLM generation request to provider: '{provider}' (prompt length: {len(prompt)} chars)")

        if provider == "ollama":
            return AIService._ollama(prompt)

        raise Exception(f"Unsupported AI Provider: {provider}")

    @staticmethod
    def _ollama(prompt: str) -> str:
        url = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
        model = os.getenv("OLLAMA_MODEL", "llama3")

        start_time = time.perf_counter()
        logger.info(f"Calling Ollama endpoint at {url} using model '{model}'...")

        try:
            response = requests.post(
                url,
                json={
                    "model": model,
                    "prompt": prompt,
                    "stream": False
                },
                timeout=300
            )
            response.raise_for_status()
            data = response.json()
            generated_text = data.get("response", "").strip()

            elapsed = (time.perf_counter() - start_time) * 1000
            logger.info(
                f"Ollama generation completed in {elapsed:.2f}ms (Generated {len(generated_text)} chars / {len(generated_text.split())} words)"
            )
            return generated_text

        except requests.exceptions.RequestException as e:
            logger.error(f"Ollama request failed on {url}: {e}", exc_info=True)
            raise

    # ====================================
    # Generate AI Summary
    # ====================================

    @staticmethod
    def generate_summary(text: str) -> dict:
        logger.info(f"Generating detailed summary for text snippet ({len(text)} chars)...")
        prompt = f"""
You are EduMind AI.

Read the following document and return ONLY valid JSON. Provide a detailed, in-depth explanation summary of AT LEAST 200 to 400 words explaining the core concepts, mechanisms, and key takeaways.

JSON format:

{{
  "summary":"A comprehensive, multi-paragraph in-depth explanation covering background, core principles, step-by-step mechanisms, and crucial takeaways with rich detail (minimum 200 words).",
  "keywords":[
      "keyword1",
      "keyword2",
      "keyword3",
      "keyword4",
      "keyword5"
  ]
}}

Rules:
- Summary must be detailed and at least 200 words in length.
- Extract 5 to 8 relevant keywords.
- Output ONLY valid JSON without markdown wrapping.

DOCUMENT:
{text[:15000]}
"""

        result = AIService.generate(prompt)

        try:
            data = json.loads(result)
            logger.info(f"Parsed summary JSON successfully with {len(data.get('keywords', []))} keywords")
            return data
        except Exception as e:
            logger.warning(f"Raw LLM response was not valid JSON ({e}). Falling back to plain text summary.")
            return {
                "summary": result,
                "keywords": []
            }