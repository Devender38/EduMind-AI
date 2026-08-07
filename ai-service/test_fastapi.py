import unittest
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from main import app
import app.routes.flashcards as flashcards_route
import app.routes.quiz as quiz_route


class TestAIServiceEndpoints(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.client_cm = TestClient(app)
        cls.client = cls.client_cm.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client_cm.__exit__(None, None, None)

    def test_root_endpoint(self):
        response = self.client.get("/")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("service"), "EduMind AI")

    def test_health_endpoint(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertEqual(data.get("status"), "Healthy")

    def test_stats_endpoint(self):
        response = self.client.get("/stats")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))
        self.assertIn("total_vectors", data)

    def test_flashcards_endpoint_mocked(self):
        mock_rag = MagicMock()
        mock_rag.generate_flashcards.return_value = """
        [
            {"question": "What is Mitochondria?", "answer": "Powerhouse of the cell."}
        ]
        """
        original_rag = flashcards_route.rag_service
        try:
            flashcards_route.rag_service = mock_rag
            response = self.client.post("/flashcards", json={"document_id": "test_doc_123"})
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(data.get("success"))
            self.assertEqual(data.get("count"), 1)
            self.assertEqual(len(data.get("flashcards")), 1)
            self.assertEqual(data["flashcards"][0]["question"], "What is Mitochondria?")
        finally:
            flashcards_route.rag_service = original_rag

    def test_quiz_endpoint_mocked(self):
        mock_rag = MagicMock()
        mock_rag.generate_quiz.return_value = """
        [
            {
                "question": "What is the capital of France?",
                "options": ["Paris", "Berlin", "Madrid", "Rome"],
                "answer": "Paris"
            }
        ]
        """
        original_rag = quiz_route.rag_service
        try:
            quiz_route.rag_service = mock_rag
            response = self.client.post("/quiz", json={"document_id": "test_doc_123"})
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertTrue(data.get("success"))
            self.assertEqual(data.get("count"), 1)
            self.assertEqual(len(data.get("quiz")), 1)
            self.assertEqual(data["quiz"][0]["answer"], "Paris")
        finally:
            quiz_route.rag_service = original_rag

    def test_clear_endpoint(self):
        response = self.client.delete("/clear")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(data.get("success"))


if __name__ == "__main__":
    unittest.main()
