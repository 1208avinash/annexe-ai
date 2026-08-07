from contextlib import contextmanager

try:
    from sqlalchemy import create_engine
    from sqlalchemy.orm import sessionmaker
except ImportError:  # pragma: no cover - compile-only fallback
    create_engine = None
    sessionmaker = None

from .config import settings


engine = create_engine(settings.database_url, future=True, echo=False) if create_engine else None
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False) if sessionmaker and engine else None


@contextmanager
def session_scope():
    if SessionLocal is None:
        yield None
        return

    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
