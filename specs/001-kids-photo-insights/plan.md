# Implementation Plan: 儿童拍照智能日记

**Branch**: `001-kids-photo-insights` | **Date**: 2025-10-21 | **Spec**: `specs/001-kids-photo-insights/spec.md`
**Input**: Feature specification from `/specs/001-kids-photo-insights/spec.md`

## Summary

- Primary: 拍照后自动生成文字并保存为日记（P1）；AI 分析状态/天气/心情并给出建议（P2）；导出图片/分享（P3）。
- Technical approach: 前端使用 uni-app（Vue 3 + Vite）跨平台实现 iOS/Android/H5；后端使用 FastAPI 提供 REST 云端分析；本地缓存草稿与离线队列；云端仅短期保留分析数据（默认 7 天）。

## Technical Context

**Language/Version**: TypeScript（Node 18+）、Vue 3 + Vite；Python 3.11（FastAPI）
**Primary Dependencies**: `vue@3`、`pinia`、`axios`；后端 FastAPI、Pydantic、Uvicorn
**Storage**: 前端使用 localStorage/IndexedDB（草稿与日记索引）；自建 MinIO（S3 兼容，对象存储，默认 7 天生命周期策略可配置）；PostgreSQL 持久化（日记元数据/可选文本、审计日志与指标）；分析服务严格最小化保留
**Testing**: 前端 `vitest` + `@vue/test-utils`（单元）、`playwright`（端到端）；后端 `pytest` + 合约测试（OpenAPI）
**Target Platform**: 现代浏览器（Chrome/Edge/Firefox/Safari）；自托管服务器（Docker Compose，Nginx 反向代理）
**项目结构**: `frontend/vue3-web`（新 Vue 3 项目） + `backend`（现有 FastAPI 服务）
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

frontend/vue3-web/
├── src/
│   ├── components/
│   ├── services/
│   ├── stores/
│   ├── types/
│   └── utils/
├── public/
└── package.json

frontend/uniapp/  # 废弃
```

**Structure Decision**: 选用 Frontend + Backend 结构；前端以 Vue 3 + Vite 组织特性模块与状态管理；后端以 FastAPI 提供 `/v1/analyze-photo` 等 REST 接口并输出 OpenAPI；测试按单元、端到端与合约划分。

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| 无 | N/A | N/A |

## 前端技术栈
- Vue 3 + TypeScript + Vite
- 纯 Web 实现，支持现代浏览器
- 使用标准 Web API（FileReader、localStorage 等）
- 不再使用 uni-app，避免多端依赖复杂性

### 技术栈切换实施计划
- **目标**：从 uni-app 切换到标准 Vue 3 实现
- **时间**：1 天
- **实施步骤**：
  1. 创建新的 Vue 3 项目结构（`frontend/vue3-web`）
  2. 迁移现有功能到标准 Web API
  3. 使用 localStorage 替代 uni-app Storage
  4. 使用标准文件 API 替代 uni.chooseImage
  5. 保持现有业务逻辑不变
- **状态**：✅ 计划已制定，准备实施

### 功能迁移对照表
| uni-app API | Web 标准替代方案 | 说明 |
|-------------|-----------------|------|
| `uni.chooseImage` | `<input type="file" accept="image/*">` | 标准文件选择 |
| `uni.setStorage` | `localStorage.setItem()` | 浏览器本地存储 |
| `uni.getStorage` | `localStorage.getItem()` | 读取本地存储 |
| `uni.removeStorage` | `localStorage.removeItem()` | 删除本地存储 |
| `uni.request` | `fetch()` 或 `axios` | HTTP 请求 |
| `uni.showLoading` | 自定义加载组件 | Vue 组件实现 |
| `uni.showToast` | 自定义提示组件 | Vue 组件实现 |

### 依赖配置调整
**移除的依赖**（uni-app 相关）：
- `@dcloudio/uni-app`
- `@dcloudio/vite-plugin-uni`
- `@dcloudio/uni-components`
- 其他 `@dcloudio/*` 相关包

**新增的核心依赖**（Vue 3 标准）：
- `vue@^3.4.0`
- `vue-router@^4.2.0`
- `pinia@^2.1.0`
- `axios@^1.6.0`
- `@vitejs/plugin-vue@^5.0.0`

**开发依赖**：
- `vite@^5.0.0`
- `typescript@^5.3.0`
- `vue-tsc@^1.8.0`

### 实施时间安排
| 阶段 | 任务 | 预计时间 | 状态 |
|------|------|----------|------|
| 第1阶段 | 创建 Vue 3 项目结构 | 2小时 | 待开始 |
| 第2阶段 | 迁移核心功能组件 | 4小时 | 待开始 |
| 第3阶段 | API 服务层适配 | 2小时 | 待开始 |
| 第4阶段 | 状态管理迁移 | 2小时 | 待开始 |
| 第5阶段 | 测试与验证 | 2小时 | 待开始 |
| **总计** | **技术栈切换完成** | **12小时** | **计划中** |

### 风险与注意事项
1. **依赖兼容性**：确保所有 Vue 3 相关依赖版本兼容
2. **API 适配**：后端 API 接口保持不变，仅前端调用方式调整
3. **存储迁移**：需要考虑用户数据从 uni-app Storage 到 localStorage 的迁移
4. **UI 组件**：需要重新实现或替换 uni-app 专用组件
5. **构建配置**：Vite 配置需要重新适配 Vue 3 项目

