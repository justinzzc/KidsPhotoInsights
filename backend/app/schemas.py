from typing import List, Optional
from pydantic import BaseModel

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