# 儿童拍照智能日记 - 后端服务

基于 FastAPI 的后端服务，为儿童拍照智能日记应用提供图片分析、日记管理等核心功能。

## 🚀 功能特性

- **📸 图片分析**: 接收 Base64 编码的图片，分析儿童状态、心情、天气等信息
- **📝 日记管理**: 自动保存分析结果为日记条目，支持查询和删除
- **🔐 API 安全**: 支持 API Key 认证保护接口
- **💾 数据存储**: 支持 PostgreSQL 数据库存储
- **📦 文件存储**: 集成 MinIO 对象存储服务
- **🏥 健康检查**: 提供服务健康状态检查接口

## 📋 API 接口

### 健康检查
```http
GET /v1/health
```

### 图片分析
```http
POST /v1/analyze-photo
Content-Type: application/json
X-API-Key: your-api-key (可选)

{
  "imageBase64": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ...",
  "timestamp": 1640995200.0,
  "regionHint": "北京"
}
```

**响应示例:**
```json
{
  "childState": "活跃",
  "mood": "愉快",
  "weather": "晴",
  "tags": ["outdoor", "child"],
  "suggestions": [
    {
      "id": "sugg-1",
      "category": "出行",
      "items": [
        {"name": "水壶"},
        {"name": "帽子"}
      ],
      "reasoning": "阳光较强，补水与防晒更好",
      "source": "analysis"
    }
  ]
}
```

### 日记列表
```http
GET /v1/diary-entries
X-API-Key: your-api-key (可选)
```

**响应示例:**
```json
[
  {
    "id": "diary-123",
    "ts": 1640995200.0,
    "text": "孩子状态: 活跃；心情: 愉快；天气: 晴",
    "mood": "愉快",
    "weather": "晴"
  }
]
```

### 删除日记
```http
DELETE /v1/diary-entries/{entry_id}
X-API-Key: your-api-key (可选)
```

## 🛠️ 技术栈

- **Web 框架**: FastAPI 0.110.0
- **ASGI 服务器**: Uvicorn 0.29.0
- **数据验证**: Pydantic 2.7.1
- **数据库**: PostgreSQL (通过 asyncpg)
- **对象存储**: MinIO 7.1.13
- **测试框架**: pytest 7.4.0

## 📦 安装与运行

### 环境要求
- Python 3.8+
- PostgreSQL (可选)
- MinIO (可选)

### 1. 安装依赖
```bash
cd backend
pip install -r requirements.txt
```

### 2. 环境配置
创建 `.env` 文件或设置环境变量：

```bash
# API 安全 (可选)
API_KEY=your-secret-api-key

# 数据库配置 (可选)
DATABASE_URL=postgresql://user:password@localhost:5432/kids_diary

# MinIO 对象存储配置 (可选)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=kids-photo-temp

# 数据保留天数
RETENTION_DAYS=7
```

### 3. 启动服务
```bash
# 开发模式
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 生产模式
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

服务将在 `http://localhost:8000` 启动

### 4. 查看 API 文档
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## 🐳 Docker 部署

### 构建镜像
```bash
docker build -t kids-photo-backend .
```

### 运行容器
```bash
docker run -d \
  --name kids-photo-backend \
  -p 8000:8000 \
  -e API_KEY=your-secret-key \
  -e DATABASE_URL=postgresql://user:pass@db:5432/kids_diary \
  kids-photo-backend
```

## 🧪 测试

### 运行测试
```bash
# 运行所有测试
pytest

# 运行特定测试文件
pytest tests/test_api.py

# 生成覆盖率报告
pytest --cov=app tests/
```

### 手动测试 API
```bash
# 健康检查
curl http://localhost:8000/v1/health

# 图片分析 (需要有效的 base64 图片数据)
curl -X POST http://localhost:8000/v1/analyze-photo \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"imageBase64": "data:image/jpeg;base64,..."}'

# 获取日记列表
curl http://localhost:8000/v1/diary-entries \
  -H "X-API-Key: your-api-key"
```

## 📁 项目结构

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI 应用入口
│   ├── config.py        # 配置管理
│   ├── schemas.py       # Pydantic 数据模型
│   ├── db.py           # 数据库操作
│   └── services/
│       └── minio_client.py  # MinIO 客户端
├── tests/
│   └── test_api.py     # API 测试
├── Dockerfile          # Docker 构建文件
├── requirements.txt    # Python 依赖
├── pytest.ini        # pytest 配置
└── README.md          # 项目文档
```

## 🔧 配置说明

### 环境变量

| 变量名 | 描述 | 默认值 | 必需 |
|--------|------|--------|------|
| `API_KEY` | API 访问密钥 | 空 | 否 |
| `DATABASE_URL` | PostgreSQL 连接字符串 | 空 | 否 |
| `MINIO_ENDPOINT` | MinIO 服务端点 | 空 | 否 |
| `MINIO_ACCESS_KEY` | MinIO 访问密钥 | 空 | 否 |
| `MINIO_SECRET_KEY` | MinIO 秘密密钥 | 空 | 否 |
| `MINIO_BUCKET` | MinIO 存储桶名称 | `kids-photo-temp` | 否 |
| `RETENTION_DAYS` | 数据保留天数 | `7` | 否 |

### 可选依赖说明

- **数据库**: 如果不配置 `DATABASE_URL`，日记数据将不会持久化存储
- **MinIO**: 如果不配置 MinIO 相关参数，文件存储功能将被跳过
- **API Key**: 如果不设置 `API_KEY`，所有接口都可以无认证访问

## 🚨 注意事项

1. **图片格式**: 目前支持 Base64 编码的图片数据，建议使用 JPEG 格式
2. **数据保留**: 系统会根据 `RETENTION_DAYS` 设置自动清理过期数据
3. **安全性**: 生产环境建议设置 `API_KEY` 保护接口安全
4. **性能**: 图片分析功能目前为模拟实现，实际部署时需要集成真实的 AI 分析服务

## 📝 开发说明

### 添加新的 API 接口
1. 在 `app/schemas.py` 中定义请求/响应模型
2. 在 `app/main.py` 中添加路由处理函数
3. 在 `tests/test_api.py` 中添加对应的测试用例

### 数据库操作
- 数据库相关操作封装在 `app/db.py` 中
- 使用 asyncpg 进行异步数据库操作
- 支持自动初始化数据库表结构

### 错误处理
- 使用 FastAPI 的 HTTPException 处理错误
- 所有外部依赖（数据库、MinIO）的错误都会被捕获并优雅处理
- 服务在缺少外部依赖时仍能正常启动和运行

## 📄 许可证

本项目仅供学习和研究使用。