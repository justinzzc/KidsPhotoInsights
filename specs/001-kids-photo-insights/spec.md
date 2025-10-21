# Feature Specification: 儿童拍照智能日记

**Feature Branch**: `001-kids-photo-insights`  
**Created**: 2025-10-21  
**Status**: Draft  
**Input**: User description: "我想做一拍照记录小孩日常的智能APP，拍照后，根据图片能分析出了孩子的状态 天气 心情  最后给一些建议跟推荐物品 拍照后自动出文字 可以自动保存成日记 也可以导出图片"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - 拍照后自动生成文字并保存为日记 (Priority: P1)

用户打开应用，完成一次拍照，系统自动分析并生成日记文本（含孩子状态、天气、心情摘要），用户可一键保存。

**Why this priority**: 这是核心价值路径，最小可行产品（MVP）即可验证产品价值。

**Independent Test**: 仅实现拍照与自动生成文本，即可形成完整日记条目并保存，无需其他故事支持。

**Acceptance Scenarios**:

1. **Given** 用户打开应用并拍照，**When** 分析完成生成文字，**Then** 显示可编辑的文本并可一键保存为日记。
2. **Given** 用户保存日记，**When** 返回首页或日记列表，**Then** 新条目已出现且时间戳正确。

---

### User Story 2 - AI 分析状态/天气/心情与建议推荐 (Priority: P2)

拍照后，系统展示孩子状态（活跃/疲劳等）、天气（晴/雨等）与心情（愉快/平静/沮丧等）并给出建议与推荐物品（如雨伞、水壶、零食）。

**Why this priority**: 增强实用性与差异化体验，提升留存与满意度。

**Independent Test**: 仅依赖拍照输入即可生成分析与建议，能独立演示与验证。

**Acceptance Scenarios**:

1. **Given** 完成拍照，**When** 系统展示分析结果，**Then** 包含状态、天气、心情与至少 3 条建议（含理由）。
2. **Given** 用户查看建议，**When** 点击“加入日记文本”，**Then** 建议内容合并进文本并保留用户可编辑性。

---

### User Story 3 - 导出图片/分享（含文字叠加） (Priority: P3)

用户可将原图或带文字叠加的图片导出至相册或分享渠道。

**Why this priority**: 完成闭环场景，提升传播与成就感，促进持续使用。

**Independent Test**: 不依赖其他故事即可独立导出与分享。

**Acceptance Scenarios**:

1. **Given** 已保存日记，**When** 选择导出带文字叠加的图片，**Then** 导出成功且文字清晰、布局合理。
2. **Given** 用户选择分享，**When** 完成分享流程，**Then** 接收方可清晰看到图片与文字内容。

---

### Edge Cases

- 未检测到孩子或多人：提示选择主体或允许以“无主体”记入。
- 光线差/遮挡：提示重拍或使用亮度增强；避免误判。
- 无网络：离线缓存拍照与草稿文本，稍后自动分析与同步。
- 敏感内容：对可能不适宜公开的图像提供标记与导出水印选项。
- 权限未授权：引导授权相机/相册/定位；拒绝时仍允许基本拍照与本地保存。
- 重复拍照：提供“合并到同一日记”或“新建日记”选项。

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: 系统 MUST 支持拍照并记录时间戳；用户授权时可记录地点信息。
- **FR-002**: 系统 MUST 自动生成日记文本，涵盖孩子状态、天气与心情摘要；文本可编辑与撤销。
- **FR-003**: 系统 MUST 在单次拍照后“快速”返回分析与文本（面向用户体验，见成功标准）。
- **FR-004**: 系统 MUST 提供至少 3 条建议与推荐物品，并给出简要理由；用户可选择加入到日记文本。
- **FR-005**: 系统 MUST 自动保存为日记条目，并支持用户编辑、删除与再次导出。
- **FR-006**: 系统 MUST 支持导出图片（原图/文字叠加版本），导出后用户可分享。
- **FR-007**: 系统 MUST 提供隐私与家长控制设置，包括数据可见范围与分享提醒。
- **FR-008**: 系统 MUST 支持离线拍照与草稿保存；网络恢复后自动分析与同步。
- **FR-009**: 系统 MUST 支持多孩管理：不自动识别，用户手动选择孩子身份；支持更改与合并标注。
- **FR-010**: 系统 MUST 采用云端分析并默认短保留（7天）；本地仅缓存必要草稿；支持用户配置保留周期与随时删除；无网络时延迟分析并提示。

### Key Entities *(include if feature involves data)*

- **DiaryEntry**: 表示一次日记记录；属性含 id、timestamp、location?、photoRef、text、mood、weather、suggestions[]。
- **Photo**: 表示原始拍照对象；属性含 id、binaryRef、qualityMetrics、facesCount?、processedFlag。
- **AnalysisResult**: 表示分析输出；属性含 childState、mood、weather、tags[]、confidence?、notes。
- **Suggestion**: 表示建议条目；属性含 category（出行/健康/学习等）、items[]、reasoning。

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 用户在一次拍照后 ≤15 秒看到自动生成文本并可保存日记。
- **SC-002**: 90% 的拍照分析返回可读结果（无崩溃与明显误判）；失败有清晰指引与恢复路径。
- **SC-003**: 80% 用户对建议“有用”打分 ≥4/5；建议采纳率 ≥50%。
- **SC-004**: 95% 用户首次使用即可完成保存与导出操作（不超过 3 步）。
- **SC-005**: 每周活跃用户中 70% 至少生成 3 条日记（参与度）。

