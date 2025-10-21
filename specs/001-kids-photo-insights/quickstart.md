# Quickstart: 儿童拍照智能日记（uni-app + FastAPI）

## Prerequisites
- Node.js ≥ 18（建议配合 pnpm 或 npm）
- HBuilderX（可选，用于 iOS/Android 原生打包与权限配置）
- Python 3.11（FastAPI 开发/测试）
- 可选：AWS 账户（API Gateway + Lambda + S3）

## Environment
- `API_BASE_URL`: 云端分析服务地址（例如 `https://api.example.com`）
- `API_KEY`: 云端分析服务密钥（HTTP 头 `X-API-Key`）
- `RETENTION_DAYS`: 默认保留天数（建议 7）

## Run (Frontend / uni-app)
1. 创建项目（任选其一）：
   - CLI：`npx @dcloudio/create-uni-app kids-photo-insights`
   - 或使用 HBuilderX：新建 uni-app 项目并命名 `kids-photo-insights`
2. 进入项目并安装依赖：`npm install`（或 `pnpm install`）
3. 开发模式（H5）：`npm run dev:h5`
4. 配置环境变量（Vite）：在 `.env.development`/`.env.production` 中设置 `VITE_API_BASE_URL` 与 `VITE_API_KEY`
5. 相机/图片：优先使用 `uni.chooseImage`；原生打包时通过 HBuilderX 配置相机权限（Android `CAMERA`，iOS `NSCameraUsageDescription`）

## Run (Backend / FastAPI - Dev Stub)
1. 创建虚拟环境：`python -m venv .venv && .venv\Scripts\activate`
2. 安装依赖：`pip install fastapi uvicorn pydantic`
3. 启动：`uvicorn app.main:app --reload`（示例；参考 `specs/001-kids-photo-insights/contracts/openapi.yaml`）

## Testing
- Frontend：`vitest`（单元）+ `playwright`（e2e）
- Backend：`pytest`（单元与集成）；按 `openapi.yaml` 做合约测试

## CI Gates（按宪章）
- Lint/格式化无错误；静态分析无高危
- 覆盖率：总体≥80%、核心≥90%
- 性能预算：前端首屏 < 2s；后端 p95 < 200ms；分析文本 ≤ 15s
- 可访问性：WCAG AA

## Notes
- 离线：无网络时可拍照并缓存草稿；分析在网络恢复后自动执行。
- 隐私：云端分析短保留（默认 7 天），用户可随时删除；应用不在云端保存完整日记。