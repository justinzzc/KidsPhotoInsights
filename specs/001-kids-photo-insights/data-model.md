# Data Model: 儿童拍照智能日记

## Entities & Relationships

### DiaryEntry
- Fields:
  - `id: string`（UUID）
  - `timestamp: string`（ISO 8601）
  - `location?: { lat: number; lng: number; name?: string }`
  - `photoRef: string`（本地/云端资源标识）
  - `text: string`（生成/编辑后的日记文本）
  - `mood?: '愉快' | '平静' | '沮丧' | '兴奋' | '疲劳'`
  - `weather?: '晴' | '多云' | '雨' | '雪' | '阴' | '风'`
  - `childState?: '活跃' | '疲劳' | '专注' | '放松' | '不适'`
  - `suggestions?: Suggestion[]`
  - `childId?: string`
  - `status: 'draft' | 'saved' | 'exported'`
- Validation:
  - `text` 非空（保存时）
  - `photoRef` 必填
  - `timestamp` 必填、有效时间戳
- Relationships:
  - 1:1 `Photo`
  - 0..1 `AnalysisResult`
  - 0..n `Suggestion`
- State Transitions:
  - `draft -> saved -> exported`

### Photo
- Fields:
  - `id: string`
  - `uri: string`（本地路径或 S3 预签名 URL）
  - `createdAt: string`（ISO 8601）
  - `qualityMetrics?: { brightness: number; blur: number; occlusion: number }`
  - `facesCount?: number`
  - `processedFlag: boolean`
- Validation:
  - `uri` 必填
  - `createdAt` 必填

### AnalysisResult
- Fields:
  - `id: string`
  - `childState?: DiaryEntry.childState`
  - `mood?: DiaryEntry.mood`
  - `weather?: DiaryEntry.weather`
  - `tags?: string[]`
  - `confidence?: number`（0..1）
  - `notes?: string`
  - `suggestions?: Suggestion[]`
- Validation:
  - `confidence` 范围 0..1

### Suggestion
- Fields:
  - `id: string`
  - `category: '出行' | '健康' | '学习' | '娱乐' | '其他'`
  - `items: { name: string; qty?: number; unit?: string }[]`
  - `reasoning: string`
  - `source?: 'analysis' | 'user' | 'template'`
- Validation:
  - `items` 至少包含 1 项
  - `reasoning` 非空

## Notes
- 词汇枚举可国际化；存储时建议统一英文枚举并在 UI 层做本地化映射。
- `DiaryEntry` 的结构化字段与生成文本需保持一致性（编辑时同步更新）。
- 云端分析不保存 `DiaryEntry`；仅产生临时 `AnalysisResult` 与建议，用于合并入本地日记。