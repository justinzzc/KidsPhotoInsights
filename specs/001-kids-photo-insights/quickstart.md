# Quickstart: 儿童拍照智能日记

## Prerequisites
- Flutter（stable channel，3.x）与 Dart（3.x）
- Python 3.11（FastAPI 开发/测试）
- 可选：AWS 账户用于 API Gateway + Lambda + S3（或替换为本地 FastAPI 开发）

## Environment
- `API_BASE_URL`: 云端分析服务地址（例如 `https://api.example.com`）
- `API_KEY`: 云端分析服务的访问密钥（HTTP 头 `X-API-Key`）
- `RETENTION_DAYS`: 默认保留天数（建议 7）

## Run (Mobile / Flutter)
1. 进入 `mobile/kids_photo_insights/`
2. 安装依赖：`flutter pub get`
3. 运行：`flutter run`
4. 在应用内设置 `API_BASE_URL` 与 `API_KEY`（或通过配置文件/环境变量注入）

## Run (Backend / FastAPI - Dev Stub)
> 如果尚未部署到云端，可本地运行分析服务的开发桩（不保存数据，仅返回模拟/占位结果）。

1. 创建虚拟环境：`python -m venv .venv && .venv\Scripts\activate`
2. 安装依赖：`pip install fastapi uvicorn pydantic`（以及需要的分析依赖）
3. 启动：`uvicorn app.main:app --reload`（示例；实际入口依项目结构）
4. 校验 OpenAPI：参考 `specs/001-kids-photo-insights/contracts/openapi.yaml`

## Testing
- Mobile：`flutter test`（单元）与 `flutter test integration_test`（集成）
- Backend：`pytest`（单元与集成）；合约测试基于 `openapi.yaml`

## CI Gates（按宪章）
- Lint/格式化通过；静态分析无高危
- 覆盖率：总体≥80%、核心≥90%
- 性能预算：移动首屏 < 2s；后端 p95 < 200ms
- 可访问性：WCAG AA

## Notes
- 离线：无网络时可拍照并缓存草稿；分析会在网络恢复后自动执行。
- 隐私：云端分析短保留（默认 7 天），用户可随时删除；应用不在云端保存完整日记。