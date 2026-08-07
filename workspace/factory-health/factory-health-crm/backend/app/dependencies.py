from .database import session_scope


def get_db():
    with session_scope() as db:
        yield db
