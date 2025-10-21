# Tasks: 儿童拍照智能日记（uni-app + FastAPI，自托管）

本任务清单依据 `spec.md`、`plan.md`、`research.md`、`openapi.yaml` 与 `quickstart.md` 汇总，目标是按 P1→P2→P3 分阶段交付，并满足宪章中的质量与隐私闸门。部署采用 Docker Compose，自托管 MinIO（S3 兼容）与 PostgreSQL。

## 里程碑与范围
- M0 基础设施与项目骨架（准备期）
- M1 MVP（P1：拍照→自动生成文字→保存日记）
- M2 Insights（P2：状态/天气/心情与建议推荐）
- M3 Export（P3：导出图片/分享）
- M4 Hardening（隐私/保留/运维与质量闸门）

## M0 基础设施与项目骨架
- 建后端骨架（FastAPI）与配置加载：`API_KEY`、`DATABASE_URL`、`MINIO_*`、`RETENTION_DAYS`
- 集成 PostgreSQL：连接、迁移（用户/日记/照片/分析结果/审计）
- 集成 MinIO：SDK 客户端、桶初始化脚本（`kids-photo-temp`）、生命周期策略（默认 7 天）
- 定义基础路由：`GET /v1/health`（健康检查）、错误处理与日志（结构化日志）
- 输出 OpenAPI（`openapi.yaml` 对齐）与合约测试框架（pytest + requests）
- 后端容器化：`Dockerfile`、`docker-compose.yaml`（与 `deploy/` 示例一致）
- 前端项目初始化（uni-app，Vue 3 + Vite + TS），环境变量（`VITE_API_BASE_URL`、`VITE_API_KEY`）
- 前端基础结构：项目页路由、Pinia、请求封装与错误提示组件

## M1 MVP（P1：拍照→自动文字→保存日记）
- 前端：拍照/选图页（H5 使用 `uni.chooseImage`；原生通过权限申请与相机组件）
- 前端：本地草稿与离线队列（`uni.setStorage`/IndexedDB；状态“待分析/队列中/已同步”）
- 后端：`POST /v1/analyze-photo`（接受 base64 图像与时间戳；返回最小可用文本与结构化字段）
- 后端：写入 PostgreSQL 元数据（DiaryEntry、Photo 基本字段），可选保存生成文本
- 后端：输入验证（Pydantic）、异常处理与性能保护（body 限制、超时）
- 合约测试：`/v1/analyze-photo` 请求/响应模式校验；错误用例（400/401/413）
- 前端：保存日记与列表页（本地→可选云端同步开关，UI 编辑与撤销）
- e2e：首拍到保存的端到端用例（Playwright，H5）

## M2 Insights（P2：分析与建议）
- 后端：集成视觉/生成提供方（如 OpenAI 多模态），抽象服务层与可替换实现
- 后端：建议生成规则与分类（出行/健康/学习/娱乐/其他），结构化 `Suggestion` 输出
- 新增后端：`POST /v1/photos/upload-url`（MinIO 预签名上传），与 `analyze-photo` 协作（支持两种输入：base64 与对象引用）
- 后端：分析结果入库（AnalysisResult），与日记合并策略
- 前端：结果页展示状态/天气/心情与建议；“加入到文本”操作与编辑同步
- 性能与稳健：队列重试、指数退避、失败提示与人工重试入口
- 合约测试：新增上传端点与分析响应的契约用例
- e2e：选择图片→上传→分析→建议合并→保存的完整路径

## M3 Export（P3：导出与分享）
- 前端：文字叠加渲染（画布/HTML 渲染到图片），布局与清晰度测试
- 前端：导出到相册/分享（平台差异与权限提示，HBuilderX 配置）
- 后端：可选生成带文字叠加的服务端渲染（如需统一效果）
- e2e：导出与分享流程验证（含敏感内容水印选项）

## M4 Hardening（隐私/保留/运维与质量闸门）
- 隐私与保留：MinIO 生命周期策略验证；一键删除/擦除后端接口与前端入口
- 数据边界：默认本地；云端同步为可选；设置页开关与说明
- 审计与指标：后端记录关键操作日志与基础指标（分析次数、平均时延）
- 安全：API Key 校验、速率限制（基础级别）、依赖漏洞扫描
- 可观测性：结构化日志、健康检查、简单告警（restart + error 计数）
- CI 闸门：覆盖率总体≥80%/核心≥90%；性能预算（后端 p95 < 200ms；分析 ≤15s）；可访问性（WCAG AA）

## 交付与验收
- 交付物：
  - 前端：拍照/选图页、结果页、日记列表、导出与分享、设置页
  - 后端：`/v1/health`、`/v1/analyze-photo`、`/v1/photos/upload-url`（预签名）、数据模型与迁移、日志与审计
  - 部署：Dockerfile、Compose、MinIO 桶初始化与生命周期规则、Nginx 反代（可选）
  - 测试：前端单元与 e2e；后端单元/集成与合约；性能基准
- 验收标准：满足 `spec.md` 的 FR 与 `Success Criteria`；通过宪章质量闸门；端到端场景稳定可复现。

## 依赖与注意事项
- 环境变量需在前后端分别配置（Vite/后端），保持与 `quickstart.md` 一致
- MinIO 桶名称与生命周期需与 `RETENTION_DAYS` 同步（默认 7 天，可配置）
- 大图传输与处理需设定大小上限（例如 5MB/次）与清晰的错误提示
- 平台差异（iOS/Android/H5）在拍照与导出处需分别验证与处理