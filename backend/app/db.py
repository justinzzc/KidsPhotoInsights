import os
import uuid
from typing import Optional, Any

_pool: Optional[Any] = None
DATABASE_URL = os.getenv("DATABASE_URL", "")
_asyncpg: Any = None


async def init_db() -> None:
    """Initialize Postgres pool and create minimal tables if configured.
    Gracefully skip if DATABASE_URL not set or asyncpg missing.
    """
    global _pool, _asyncpg
    if not DATABASE_URL:
        # DB disabled in current environment
        return
    try:
        import asyncpg as _apg  # lazy import to avoid hard dependency when unused
        _asyncpg = _apg
    except ModuleNotFoundError:
        print("asyncpg not installed; skipping DB init")
        return

    _pool = await _asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
    async with _pool.acquire() as conn:
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS diary_entries (
              id UUID PRIMARY KEY,
              ts TIMESTAMP NOT NULL,
              text TEXT,
              mood TEXT,
              weather TEXT
            );
            """
        )
        await conn.execute(
            """
            CREATE TABLE IF NOT EXISTS photos (
              id UUID PRIMARY KEY,
              entry_id UUID REFERENCES diary_entries(id) ON DELETE CASCADE,
              ref TEXT,
              processed BOOLEAN DEFAULT FALSE
            );
            """
        )


async def insert_diary_entry(text: str, mood: Optional[str], weather: Optional[str], ts_seconds: float) -> Optional[str]:
    """Insert a minimal diary entry and return its id; return None if DB disabled."""
    if _pool is None:
        return None
    entry_id = str(uuid.uuid4())
    async with _pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO diary_entries(id, ts, text, mood, weather) VALUES($1, to_timestamp($2), $3, $4, $5)",
            entry_id,
            ts_seconds,
            text,
            mood,
            weather,
        )
    return entry_id