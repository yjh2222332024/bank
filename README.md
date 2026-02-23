# 《谍影钱庄》MVP 项目开发手册 (Internal Only)

本项目是基于**微信小程序原生框架**与**微信云开发**构建的桌游资产管理系统。

## 1. 核心技术栈与硬性约束
*   **前端**: 微信小程序原生 (WXML/WXSS/JS)。**严禁使用 Uniapp/Taro**。
*   **后端**: 微信云开发 (Node.js 16+ 云函数)。
*   **数据库**: 云开发 NoSQL。
*   **安全红线**:
    *   **原子更新**: 所有余额增减必须使用 `db.command.inc`，禁止前端计算后覆盖。
    *   **权限管控**: 敏感逻辑（转账、结算）必须封装在云函数中，严禁小程序端直写数据库。

## 2. 团队分支与协作规范
*   **主分支体系**:
    *   `main`: 生产稳定分支，仅限 PM/总负责人合并。
    *   `develop`: 开发集成分支，所有功能分支的汇聚点。
*   **特性分支 (`feature/*`)**:
    *   `feature/dm-init`: DM 管理端 UI。
    *   `feature/player-init`: 玩家资产看板 UI。
    *   `feature/backend-core`: 核心交易、转账云函数。
    *   `feature/qa-scripts`: 压测与自动化测试脚本。
*   **合并流程**: `feature/*` -> 发起 PR -> PM 审核日志与代码 -> 合并至 `develop`。

## 3. 开发纪律 (强制执行)
*   **日志先行 (Log First)**: 在编码前，必须在 `docs/logs/` 提交技术方案日志。未见日志的代码不予 Review。
*   **提交频率**: 每位成员**每周至少提交一次**有效代码/进度至对应的 `feature` 分支。
*   **Commit 格式**: `<type>: <description>` (例如 `feat: 实现原子转账逻辑`, `fix: 修复选角并发冲突`)。

## 4. 目录结构
*   `/miniprogram`: 前端业务代码。
*   `/cloudfunctions`: 后端核心逻辑。
*   `/docs`: 包含 PRD、API 协议、数据库 Schema 及 **开发日志 (Logs)**。
*   `AGENTS.md`: AI 辅助开发的提示词约束。

## 5. 环境配置
1. 导入项目至微信开发者工具。
2. 在 `project.config.json` 中确认云环境 ID。
3. 运行 `npm install` 前请确认处于正确的目录下（`/miniprogram` 或具体的云函数文件夹）。

--- 
**最近更新**: 2026-02-23
