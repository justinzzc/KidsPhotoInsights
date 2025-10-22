from fastapi import FastAPI, Depends, Header, HTTPException
from pydantic import BaseModel
import base64
import time
import uuid
from datetime import datetime

from .config import Settings
from .schemas import AnalysisResult, Suggestion, SuggestionItem, DiaryEntry, DiaryCreateRequest, AnalyzeRequest
from . import db
from .services.minio_client import ensure_minio_bucket

settings = Settings()
app = FastAPI(title="Kids Photo Insights", version="0.1.0")


@app.on_event("startup")
async def startup():
    # Initialize DB and MinIO if configured
    await db.init_db()
    try:
        ensure_minio_bucket()
    except Exception as e:  # pragma: no cover
        print(f"MinIO setup skipped: {e}")


def verify_api_key(x_api_key: str | None = Header(default=None)):
    # Require API key only if configured
    if settings.API_KEY and x_api_key != settings.API_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized")


class AnalyzeRequest(BaseModel):
    imageBase64: str
    timestamp: float | None = None
    regionHint: str | None = None


@app.get("/v1/health")
async def health():
    return {"status": "ok"}


@app.get("/v1/diary-entries", response_model=list[DiaryEntry])
async def list_diaries(_: None = Depends(verify_api_key)):
    items = await db.fetch_diary_entries(limit=20)
    return items


@app.post("/v1/diary-entries", response_model=DiaryEntry)
async def create_diary(req: DiaryCreateRequest, _: None = Depends(verify_api_key)):
    """创建新的日记条目"""
    # 生成唯一ID和时间戳
    entry_id = str(uuid.uuid4())
    ts = time.time()
    
    # 创建日记条目
    diary_entry = DiaryEntry(
        id=entry_id,
        ts=ts,
        title=req.title,
        content=req.content,
        text=req.content,  # 保持向后兼容
        mood=req.mood,
        weather=req.weather,
        image_url=req.image_url,
        scene=req.scene,
        suggestion=req.suggestion
    )
    
    try:
        # 保存到数据库
        await db.insert_diary_entry(
            text=req.content or req.title or "",
            mood=req.mood,
            weather=req.weather,
            ts_seconds=ts
        )
    except Exception as e:
        print(f"Database save error: {e}")
        # 即使数据库保存失败，也返回创建的对象（用于开发测试）
    
    return diary_entry


@app.delete("/v1/diary-entries/{entry_id}", status_code=204)
async def delete_diary(entry_id: str, _: None = Depends(verify_api_key)):
    deleted = await db.delete_diary_entry(entry_id)
    if not deleted:
        # No content either way for simplicity in MVP; could return 404 later
        return


@app.post("/v1/analyze-photo", response_model=AnalysisResult)
async def analyze_photo(req: AnalyzeRequest, _: None = Depends(verify_api_key)):
    # Basic validation of base64 payload
    try:
        base64.b64decode(req.imageBase64.split(",")[-1], validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid imageBase64")

    # Stubbed analysis result
    result = AnalysisResult(
        childState="活跃",
        mood="愉快",
        weather="晴",
        tags=["outdoor", "child"],
        suggestions=[
            Suggestion(
                id="sugg-1",
                category="出行",
                items=[SuggestionItem(name="水壶"), SuggestionItem(name="帽子")],
                reasoning="阳光较强，补水与防晒更好",
                source="analysis",
            )
        ],
    )

    # Auto-save minimal diary entry per FR-005 (if DB configured)
    ts = req.timestamp or time.time()
    text = f"孩子状态: {result.childState or '未知'}；心情: {result.mood or '未知'}；天气: {result.weather or '未知'}"
    try:
        await db.insert_diary_entry(text=text, mood=result.mood, weather=result.weather, ts_seconds=ts)
    except Exception as e:  # pragma: no cover
        # Non-fatal: saving is best-effort
        print(f"Diary save skipped: {e}")

    return result