# AGENT.md - 项目上下文与指令

此文件为 AGENT 提供必要的上下文，以便理解并参与 **《谍影钱庄》MVP (Spy-Bank-MVP)** 项目。

## 1. 项目概准 (Project Overview)
**《谍影钱庄》MVP** 是一款专门为微信小程序开发的银行/博弈类桌游辅助工具，基于 **微信云开发 (WeChat CloudBase)**。游戏采用 1940 年代复古谍战风格，玩家（特工）在高度紧张的金融谍战背景下管理资产、执行转账并与 DM（主持人）互动。

- **核心技术栈：** 微信小程序 (WXML, WXSS, JavaScript), 微信云开发 (云函数, 云数据库)。
- **核心架构：**
  - `miniprogram/`: 前端小程序应用代码。
  - `cloudfunctions/`: 后端逻辑及敏感操作（如转账、角色绑定）。
  - `docs/`: 完整的项目文档，包括 PRD、API 协议和团队规范。

## 2. 构建与运行 (Building and Running)
本项目主要通过 **微信开发者工具** 进行管理。

- **初始化步骤：**
  1. 打开微信开发者工具并导入项目根目录。
  2. 确保 `miniprogramRoot` 和 `cloudfunctionRoot` 分别正确指向 `miniprogram/` 和 `cloudfunctions/`（已在 `project.config.json` 中配置）。
  3. 如有需要，在 `miniprogram/` 和各个云函数目录中运行 `npm install`。
  4. 若添加了外部包，请使用开发者工具中的“构建 npm”功能。
- **测试与调试：**
  - 使用“云开发”控制台管理数据库和云函数。
  - 使用内置模拟器进行前端测试。
  - QA 脚本和测试用例详见 `docs/05_QA安全测试压测用例_v1.2.md`。

## 3. 开发规范 (Development Conventions)
项目遵循严格的工程和审美标准，以确保 MVP 的一致性。

- **Git 策略：** 轻量级 Git Flow。
  - `main`: 生产就绪代码（受保护）。
  - `develop`: 开发集成分支（受保护）。
  - `feature/*`: 个人功能开发分支。
  - `bugfix/*`: Bug 修复分支。
- **Commit 信息：** 遵循 Angular 规范 (`feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `chore:`)。
- **视觉风格：** 1940 年代“复古谍战” (Retro Spy)。
  - 核心色值：`#E8E2D0` (做旧纸张色), `#2B2B2B` (油墨黑), `#8B0000` (印章红)。
  - UI 生成请参考 `.cursorrules`。
- **安全性：** 所有关键业务逻辑（资产操作、角色绑定）**必须**在 `cloudfunctions/` 中实现。
- **忽略规则：** 严禁提交 `project.private.config.json` 或 `node_modules`。

## 4. 关键目录结构 (Key Directory Structure)
- `miniprogram/pages/`: 包含主要应用视图（index, asset, dm-panel）。
- `docs/`: 
  - `01_产品需求文档_PRD.md`: 核心产品逻辑与游戏规模（8-12人）。
  - `03_云数据库表结构_v1.2.md`: 数据库 Schema 定义。
  - `04_API协议与实时规范_v1.2.md`: 前后端通讯协议。
  - `06_Git协同规范_v1.2.md`: 详细的团队协作规则。

## 5. 给 Gemini 的指令上下文
在协助此项目时：
- **风格风格：** 在 UI 建议中严格遵守 1940 年代复古审美。
- **逻辑实现：** 涉及数据敏感任务时，优先考虑云函数实现。
- **参考文档：** 在提出任何更改建议前，务必查阅 `docs/` 文件夹中的具体 API 和数据库定义。
- **工作流：** 提醒用户创建特性分支并遵循 Commit 信息格式。
