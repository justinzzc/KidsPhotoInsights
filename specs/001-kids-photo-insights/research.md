# Research: 儿童拍照智能日记（更新：uni-app 前端 + FastAPI 后端）

## Cross-platform Frontend
- Decision: uni-app（Vue 3 + Vite + TypeScript）
- Rationale: 以 Web 技术栈实现 iOS/Android/H5，降低前端学习与招聘成本；生态成熟（状态管理 Pinia、网络 axios/uni.request、打包与权限管理）；HBuilderX 支持原生打包与权限配置（相机、存储）。
- Alternatives: Flutter（性能与原生体验更好，但团队需 Dart/Flutter 能力；与 Web/H5 复用较少）；React Native（生态强但与小程序/H5多端支持不如 uni-app；原生桥兼容性与维护成本高）。

## Backend Stack & Hosting
- Decision: FastAPI（Python 3.11）部署在 API Gateway + Lambda；临时图像对象存储 S3（默认 7 天生命周期），不保存业务敏感数据。
- Rationale: 快速开发、类型安全（Pydantic）、冷启动可控；与 S3 生命周期策略契合短保留；OpenAPI 生成简便。
- Alternatives: Node.js + Express（类型安全需额外保障）；Cloud Run/Azure Functions（可行但团队更熟悉 AWS）。

## Vision/Analysis Provider
- Decision: 使用通用视觉分析（如 GPT-4o/多模态 Vision）+ 规则生成状态/心情/建议。
- Rationale: 语义理解能力强，能快速验证产品价值；建议生成质量较高。
- Alternatives: Rekognition/Google Vision（识别强但生成能力有限）；端侧 MLKit（隐私佳但质量/耗电受限）。

## Privacy & Retention
- Decision: 云端分析；默认短保留 7 天；用户可配置并随时删除；前端仅缓存草稿与离线队列。
- Rationale: 与 FR-010 一致；兼顾隐私与可用性；离线可恢复。
- Alternatives: 纯本地分析（隐私最佳但效果受限）；长期保留（合规风险高）。

## Offline & Sync Strategy
- Decision: 前端本地队列（失败重试+指数退避）；网络恢复后自动上传；UI 显示“待分析/队列中/已同步”状态；S3 预签名 URL 上传，后端回调入库分析结果。
- Rationale: 降低丢单与阻塞；提供可见性与用户控制。
- Alternatives: 阻塞等待网络（体验差）；后台静默无提示（不可控）。

## Multi-child Management
- Decision: 手动选择孩子身份；允许更改与合并标注。
- Rationale: 简化与可控；避免误识别造成困扰；符合家长预期。
- Alternatives: 自动识别（需人脸库与合规复杂度高）；半自动（仍需校验与额外UX）。

## Testing & Quality Gates
- Decision: 前端使用 `vitest` + `@vue/test-utils`；端到端使用 `playwright`；后端 `pytest` + 合约测试。覆盖率总体≥80%、核心≥90%；性能与可访问性纳入 CI 闸门。
- Rationale: 与宪章一致，保障重构与稳定性。
- Alternatives: 降低门槛（短期加速但长期风险高）。

## Open Questions (Resolved)
- Target Platform: iOS 15+ / Android 10+（uni-app 打包）与 H5 开发预览。
- Backend Region: AWS（区域依合规选择，默认 ap-southeast-1 或国内区域视准入政策）。
- Data Boundary: 云端仅分析结果与临时对象；日记主体数据保留在前端本地存储。