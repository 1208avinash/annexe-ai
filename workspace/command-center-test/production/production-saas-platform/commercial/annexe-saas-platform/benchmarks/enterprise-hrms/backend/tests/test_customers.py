import unittest

from fastapi.testclient import TestClient

from app.database import init_db, session_scope
from app.main import app
from app.services.crm_service import CRMService


class CustomerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        with session_scope() as db:
            CRMService().bootstrap(db)

    def setUp(self):
        self.client = TestClient(app)
        login = self.client.post("/auth/login", json={"email": "admin@annexe.ai", "password": "Admin123!"})
        self.token = login.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_list_customers(self):
        response = self.client.get("/customers", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertGreaterEqual(len(response.json()), 3)

    def test_get_customer(self):
        response = self.client.get("/customers/1", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], 1)
