from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class SuggestionItem(BaseModel):
    name: str
    qty: Optional[float] = None
    unit: Optional[str] = None

class Suggestion(BaseModel):
    id: str
    category: str
    items: List[SuggestionItem]
    reasoning: str
    source: Optional[str] = None

class AnalysisResult(BaseModel):
    childState: Optional[str] = None
    mood: Optional[str] = None
    weather: Optional[str] = None
    tags: List[str] = []
    suggestions: List[Suggestion] = []

class DiaryEntry(BaseModel):
    id: str
    ts: float
    text: Optional[str] = None
    mood: Optional[str] = None
    weather: Optional[str] = None
    # 新增字段，支持前端需求
    title: Optional[str] = None
    content: Optional[str] = None
    created_at: Optional[str] = Field(None, description="ISO format timestamp")
    image_url: Optional[str] = None
    scene: Optional[str] = None
    suggestion: Optional[Dict[str, Any]] = None
    
    def model_post_init(self, __context):
        """自动生成 created_at 字段"""
        if self.created_at is None and self.ts:
            self.created_at = datetime.fromtimestamp(self.ts).isoformat()
        # 如果没有 content 但有 text，使用 text 作为 content
        if self.content is None and self.text:
            self.content = self.text

class DiaryCreateRequest(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    mood: Optional[str] = None
    weather: Optional[str] = None
    image_url: Optional[str] = None
    scene: Optional[str] = None
    suggestion: Optional[Dict[str, Any]] = None

class AnalyzeRequest(BaseModel):
    imageBase64: str
    timestamp: Optional[float] = None
    regionHint: Optional[str] = None