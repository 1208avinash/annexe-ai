import unittest

from fastapi.testclient import TestClient

from app.database import init_db, session_scope
from app.main import app
from app.services.crm_service import CRMService


class AuthTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        with session_scope() as db:
            CRMService().bootstrap(db)

    def setUp(self):
        self.client = TestClient(app)

    def test_login_and_me(self):
        login = self.client.post("/auth/login", json={"email": "admin@annexe.ai", "password": "Admin123!"})
        self.assertEqual(login.status_code, 200)
        token = login.json()["access_token"]
        me = self.client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["email"], "admin@annexe.ai")
