# Research: 儿童拍照智能日记

## Cross-platform Framework
- Decision: Flutter 3.x（Dart 3.x）
- Rationale: 单一代码库交付 iOS/Android；成熟相机生态（camera 插件）、出色 UI 性能与一致性；集成测试与CI工具完备。
- Alternatives: React Native（JS/TS生态强但性能与一致性略弱）；Kotlin Multiplatform（iOS支持度与生态仍在完善）。

## Backend Stack & Hosting
- Decision: FastAPI（Python 3.11）在 AWS API Gateway + Lambda；临时图像对象存储 S3（默认 7 天生命周期策略），不保存业务敏感数据。
- Rationale: 快速开发、类型安全（Pydantic）、冷启动可控；与 S3 生命周期策略自然契合短保留；易于导出 OpenAPI 合约。
- Alternatives: Node.js + Express（生态广但类型安全需额外保障）；Azure Functions/GCP Cloud Run（可行但现阶段团队更熟悉 AWS）。

## Vision/Analysis Provider
- Decision: 采用通用视觉分析服务（如 OpenAI Vision/GPT-4o）结合轻量规则生成孩子状态/心情/建议。
- Rationale: 对非结构化图像的语义理解能力强；可快速验证价值；建议生成质量高。
- Alternatives: AWS Rekognition（检测强但情绪/建议生成能力有限）；Google Vision（识别可靠但生成需额外模型）；On-device MLKit（隐私最佳但端侧推理质量与耗电成本限制）。

## Privacy & Retention
- Decision: 云端分析，默认短保留 7 天；用户可配置保留期并随时删除；本地仅缓存草稿与离线队列。
- Rationale: 与 FR-010 一致；兼顾隐私与可用性；离线可恢复。
- Alternatives: 纯本地分析（隐私最佳但效果受限）；长期保留（合规风险高）。

## Offline & Sync Strategy
- Decision: 本地队列（失败重试+指数退避）；网络恢复后自动上传分析；UI 显示待分析状态与进度；与 S3 采用预签名 URL 上传。
- Rationale: 降低丢单与阻塞；更好的用户可见性与控制。
- Alternatives: 直接阻塞等待网络（体验差）；后台静默无提示（不可控）。

## Multi-child Management
- Decision: 手动选择孩子身份；允许更改与合并标注。
- Rationale: 简化与可控；避免误识别造成困扰；与家长预期一致。
- Alternatives: 自动识别（需人脸库与合规复杂度高）；半自动（仍需校验流程与额外UX）。

## Testing & Quality Gates
- Decision: 覆盖率：总体≥80%、核心≥90%；合约测试覆盖 `/v1/analyze-photo`；集成测试覆盖拍照→分析→保存→导出流程；性能基准纳入 CI。
- Rationale: 与宪章一致；确保可重构性与性能稳定。
- Alternatives: 降低门槛（短期加速但长期风险高）。

## Open Questions (Resolved)
- Target Platform: iOS 15+ / Android 10+（Flutter）。
- Backend Region: AWS（区域依项目合规选择，默认 ap-southeast-1 或 cn 区域视准入政策）。
- Data Model Boundary: 云端仅分析结果与临时对象；日记主体数据保留在本地。