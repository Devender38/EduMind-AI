import json
import re
from app.utils.logger import get_logger

logger = get_logger("JSONParser")


class JSONParser:

    @staticmethod
    def clean_text(text: str) -> str:
        """Strips markdown code fences and extraneous text surrounding JSON."""
        # Remove ```json and ``` codeblocks
        cleaned = re.sub(r"^```(?:json)?\s*", "", text.strip(), flags=re.MULTILINE)
        cleaned = re.sub(r"\s*```$", "", cleaned.strip(), flags=re.MULTILINE)
        return cleaned.strip()

    @staticmethod
    def parse_dict(text: str) -> dict:
        """Parses a JSON object from text."""
        cleaned = JSONParser.clean_text(text)
        try:
            res = json.loads(cleaned)
            if isinstance(res, dict):
                return res
        except Exception:
            pass

        # Extract first { to last }
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(cleaned[start:end + 1])
            except Exception as e:
                logger.warning(f"Failed extracting dict JSON substring: {e}")

        return {}

    @staticmethod
    def parse_list(text: str) -> list:
        """Parses a JSON list / array from text."""
        cleaned = JSONParser.clean_text(text)
        try:
            res = json.loads(cleaned)
            if isinstance(res, list):
                return res
        except Exception:
            pass

        # Extract first [ to last ]
        start = cleaned.find("[")
        end = cleaned.rfind("]")
        if start != -1 and end != -1 and end > start:
            try:
                return json.loads(cleaned[start:end + 1])
            except Exception as e:
                logger.warning(f"Failed extracting list JSON substring: {e}")

        return []