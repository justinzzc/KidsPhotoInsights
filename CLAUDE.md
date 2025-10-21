# test-spec Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-21

## Active Technologies
- Flutter 3.x (Dart 3.x); Python 3.11 (FastAPI) + Flutter `camera`, `riverpod`, `dio`, `hive`; FastAPI, Pydantic, Uvicorn (001-kids-photo-insights)
- TypeScript（Node 18+）、Vue 3（uni-app + Vite）；Python 3.11（FastAPI） + `@dcloudio/uni-app`、`@dcloudio/vite-plugin-uni`、`vue@3`、`pinia`、`axios`；后端 FastAPI、Pydantic、Uvicorn (001-kids-photo-insights)
- 前端使用 `uni.setStorage`/IndexedDB（草稿与日记索引）；云端 S3（临时图像对象，7 天生命周期策略）；分析服务不保存业务数据 (001-kids-photo-insights)

## Project Structure
```
src/
tests/
```

## Commands
cd src; pytest; ruff check .

## Code Style
Flutter 3.x (Dart 3.x); Python 3.11 (FastAPI): Follow standard conventions

## Recent Changes
- 001-kids-photo-insights: Added TypeScript（Node 18+）、Vue 3（uni-app + Vite）；Python 3.11（FastAPI） + `@dcloudio/uni-app`、`@dcloudio/vite-plugin-uni`、`vue@3`、`pinia`、`axios`；后端 FastAPI、Pydantic、Uvicorn
- 001-kids-photo-insights: Added Flutter 3.x (Dart 3.x); Python 3.11 (FastAPI) + Flutter `camera`, `riverpod`, `dio`, `hive`; FastAPI, Pydantic, Uvicorn

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
