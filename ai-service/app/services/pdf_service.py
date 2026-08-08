import time
import pymupdf as fitz
from app.utils.logger import get_logger

logger = get_logger("PDFService")

class PDFService:

    @staticmethod
    def extract_text(pdf_path: str) -> str:
        start_time = time.perf_counter()
        logger.info(f"Opening PDF for text extraction: {pdf_path}")

        try:
            doc = fitz.open(pdf_path)
            page_count = len(doc)
            text = ""

            for page_num, page in enumerate(doc, 1):
                page_text = page.get_text()
                text += page_text

            doc.close()
            elapsed = (time.perf_counter() - start_time) * 1000

            logger.info(
                f"Successfully extracted text from {pdf_path}: "
                f"{page_count} pages, {len(text)} characters ({len(text.split())} words) in {elapsed:.2f}ms"
            )

            return text

        except Exception as e:
            logger.error(f"Failed to extract text from {pdf_path}: {e}", exc_info=True)
            raise