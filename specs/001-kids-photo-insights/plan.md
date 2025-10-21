# Implementation Plan: 儿童拍照智能日记

**Branch**: `001-kids-photo-insights` | **Date**: 2025-10-21 | **Spec**: `specs/001-kids-photo-insights/spec.md`
**Input**: Feature specification from `/specs/001-kids-photo-insights/spec.md`

## Summary

- Primary: 拍照后自动生成文字并保存为日记（P1）；AI 分析状态/天气/心情并给出建议（P2）；导出图片/分享（P3）。
- Technical approach: 前端使用 uni-app（Vue 3 + Vite）跨平台实现 iOS/Android/H5；后端使用 FastAPI 提供 REST 云端分析；本地缓存草稿与离线队列；云端仅短期保留分析数据（默认 7 天）。

## Technical Context

**Language/Version**: TypeScript（Node 18+）、Vue 3（uni-app + Vite）；Python 3.11（FastAPI）
**Primary Dependencies**: `@dcloudio/uni-app`、`@dcloudio/vite-plugin-uni`、`vue@3`、`pinia`、`axios`；后端 FastAPI、Pydantic、Uvicorn
**Storage**: 前端使用 `uni.setStorage`/IndexedDB（草稿与日记索引）；云端 S3（临时图像对象，7 天生命周期策略）；分析服务不保存业务数据
**Testing**: 前端 `vitest` + `@vue/test-utils`（单元）、`playwright`（端到端）；后端 `pytest` + 合约测试（OpenAPI）
**Target Platform**: iOS 15+ 与 Android 10+（uni-app 打包）; H5 开发预览；云端 REST API（API Gateway + Lambda）
**Project Type**: frontend + backend
**Performance Goals**: 首屏/页面可交互 < 2s；分析文本可见 ≤ 15s；后端 p95 响应 < 200ms
**Constraints**: 离线可用（排队重试）；隐私与短保留（7 天）；可访问性达 WCAG AA
**Scale/Scope**: 首批 1k DAU；每日 3–5 张/人；图片传输 < 5MB/次

## Constitution Check

- 代码质量门：统一格式化与 lint；静态分析无高危；代码评审必需。
- 测试门：总体覆盖≥80%（核心≥90%）；关键交互具备集成与合约测试；无基准回归。
- 性能门：后端 p95 < 200ms；前端首屏 < 2s；分析结果 ≤ 15s 可见。
- UX 门：统一设计令牌与组件；文案风格一致；可访问性达 WCAG AA。
- 安全与合规：依赖漏洞扫描；密钥集中管理；数据默认 7 天短保留，可随时删除。

Gate evaluation: 规划阶段无已知违反；Phase 1 设计输出后复核并记录。

## Project Structure

### Documentation (this feature)

```
specs/001-kids-photo-insights/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
└── tasks.md  # via /speckit.tasks
```

### Source Code (repository root)

```
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

frontend/uniapp/
├── src/
│   ├── pages/
│   ├── components/
│   ├── stores/
│   ├── services/
│   └── App.vue
├── manifest.json
├── pages.json
└── tests/
    ├── unit/
    └── e2e/
```

**Structure Decision**: 选用 Frontend + Backend 结构；前端以 uni-app（Vue 3 + Vite）组织特性模块与状态管理；后端以 FastAPI 提供 `/v1/analyze-photo` 等 REST 接口并输出 OpenAPI；测试按单元、端到端与合约划分。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 无 | N/A | N/A |

