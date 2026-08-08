from contextlib import contextmanager

from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from .config import settings


Base = declarative_base()


def _create_engine():
    database_url = settings.database_url
    if database_url.startswith("sqlite"):
        return create_engine(
            "sqlite:///:memory:",
            future=True,
            echo=False,
            connect_args={"check_same_thread": False},
            poolclass=StaticPool
        )

    return create_engine(
        database_url,
        future=True,
        echo=False,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )


engine = _create_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def init_db():
    from .models import crm  # noqa: F401

    Base.metadata.create_all(bind=engine)


def database_status() -> dict:
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        return {
            "status": "ok",
            "driver": engine.url.drivername
        }
    except Exception as exc:  # pragma: no cover - startup/health guard
        return {
            "status": "degraded",
            "driver": engine.url.drivername,
            "error": str(exc)
        }


@contextmanager
def session_scope():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


def get_db():
    with session_scope() as db:
        yield db
