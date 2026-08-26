from app.database import init_db

try:
    from alembic import command
    from alembic.config import Config
except ImportError:
    command = None
    Config = None


def main():
    if command and Config:
        config = Config("alembic.ini")
        command.upgrade(config, "head")
    else:
        init_db()


if __name__ == "__main__":
    main()
