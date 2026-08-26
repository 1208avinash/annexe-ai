import unittest

from fastapi.testclient import TestClient

from app.database import init_db, session_scope
from app.main import app
from app.services.crm_service import CRMService


class HealthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        with session_scope() as db:
            CRMService().bootstrap(db)

    def setUp(self):
        self.client = TestClient(app)

    def test_health(self):
        response = self.client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_ready(self):
        response = self.client.get("/ready")
        self.assertEqual(response.status_code, 200)
        self.assertIn("database", response.json())

    def test_version(self):
        response = self.client.get("/version")
        self.assertEqual(response.status_code, 200)
        self.assertIn("version", response.json())
