import os
import uuid
from typing import Optional, Any, List, Dict
from dotenv import load_dotenv

# 加载 .env 文件
load_dotenv()

_pool: Optional[Any] = None
DATABASE_URL = os.getenv("DATABASE_URL", "")
_asyncpg: Any = None


async def init_db() -> None:
    """Initialize Postgres pool and create minimal tables if configured.
    Gracefully skip if DATABASE_URL not set or asyncpg missing.
    """
    global _pool, _asyncpg
    print(f"init_db called, DATABASE_URL: {DATABASE_URL}")
    if not DATABASE_URL:
        # DB disabled in current environment
        print("DATABASE_URL not set, skipping DB init")
        return
    try:
        import asyncpg as _apg  # lazy import to avoid hard dependency when unused
        _asyncpg = _apg
        print("asyncpg imported successfully")
    except ModuleNotFoundError:
        print("asyncpg not installed; skipping DB init")
        return

    try:
        _pool = await _asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=5)
        print(f"Database pool created successfully: {_pool}")
    except Exception as e:
        print(f"Failed to create database pool: {e}")
        return
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


async def fetch_diary_entries(limit: int = 20) -> List[Dict[str, Any]]:
    """Fetch latest diary entries; return [] if DB disabled."""
    print("fetch_diary_entries:", limit ,_pool)
    if _pool is None:
        return []
    async with _pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id::text AS id, EXTRACT(EPOCH FROM ts) AS ts, text, mood, weather FROM diary_entries ORDER BY ts DESC LIMIT $1",
            limit,
        )
    """日志输出"""
    print("fetch_diary_entries:", rows)
    return [dict(r) for r in rows]


async def delete_diary_entry(entry_id: str) -> bool:
    """Delete diary entry by id; return False if not found or DB disabled."""
    if _pool is None:
        return False
    async with _pool.acquire() as conn:
        res = await conn.execute("DELETE FROM diary_entries WHERE id = $1", entry_id)
    # asyncpg returns 'DELETE <count>'
    return res.startswith("DELETE ") and res.split(" ")[-1] != "0"