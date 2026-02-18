import os

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.ext.asyncio.session import AsyncSession

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

# Handle sync vs async engines for open source compatibility
if "aiosqlite" in DATABASE_URL or "asyncpg" in DATABASE_URL:
    engine = create_async_engine(DATABASE_URL, echo=True)
else:
    engine = create_engine(DATABASE_URL, echo=True)


async def get_session():
    if isinstance(engine, AsyncEngine):
        async with AsyncSession(engine) as session:
            yield session
    else:
        with Session(engine) as session:
            yield session


async def init_db():
    if isinstance(engine, AsyncEngine):
        async with engine.begin() as conn:
            await conn.run_sync(SQLModel.metadata.create_all)
    else:
        SQLModel.metadata.create_all(engine)
