from fastapi import FastAPI, Depends, Header, HTTPException
from pydantic import BaseModel
import base64
import time

from .config import Settings
from .schemas import AnalysisResult, Suggestion, SuggestionItem
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