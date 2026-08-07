from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import declarative_base, sessionmaker

from .config import settings


Base = declarative_base()

if settings.database_url.startswith("sqlite"):
    engine = create_engine(
        "sqlite:///:memory:",
        future=True,
        echo=False,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
else:
    engine = create_engine(settings.database_url, future=True, echo=False)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


def init_db():
    from .models import crm  # noqa: F401

    Base.metadata.create_all(bind=engine)


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
