import os

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./dev.db")
sqlite_url = "sqlite:///./dev.db"

# Use SQLite if postgres driver is missing
if DATABASE_URL.startswith("postgresql"):
    try:
        import psycopg2  # noqa: F401
    except ImportError:
        print("Postgres driver (psycopg2) not found, falling back to SQLite")
        DATABASE_URL = sqlite_url

engine = create_engine(DATABASE_URL, echo=True)


def get_session():
    with Session(engine) as session:
        yield session


def init_db():
    SQLModel.metadata.create_all(engine)
