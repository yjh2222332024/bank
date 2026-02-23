# GEMINI.md - 项目上下文与指令 (v1.1)

此文件为 Gemini 提供必要的上下文，以便理解并参与 **《谍影钱庄》MVP (Spy-Bank-MVP) ** 项目。

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
- **视觉风格：** 在 UI 建议中严格遵守 1940 年代复古审美。
- **逻辑实现：** 涉及数据敏感任务时，优先考虑云函数实现。
- **参考文档：** 在提出任何更改建议前，务必查阅 `docs/` 文件夹中的具体 API 和数据库定义。
- **工作流：** 提醒用户创建特性分支并遵循 Commit 信息格式。

## 6. UI 视觉设计语言 (Design System) —— “黄铜与油墨” (Brass & Ink)

为了确保《谍影钱庄》的“1940s 复古谍战”风格在多成员协作中不走样，全员必须遵循以下设计指南：

### 🎨 核心调色盘 (The Palette)
- **📜 底色 (Background)**: `#E8E2D0` (陈年羊皮纸 / 做旧报纸色) —— 消除现代屏幕刺眼感，奠定复古基调。
- **🖋️ 主文字 (Typography)**: `#2B2B2B` (干涸墨黑) —— 非纯黑，模拟旧式油墨印刷质感。
- **㊙️ 强调色/警告 (Action)**: `#8B0000` (机密印章红) —— 用于“转出”、“锁定”、“绝密”等核心交互，以及盖章动效。
- **💰 资产/成功 (Wealth)**: `#A67C00` (脏黄铜金) —— 替代传统的绿色，用于金额增加、金条显示、保险柜元素。
- **🌑 辅助/次要 (Secondary)**: `#5C5C5C` (铅笔灰) —— 用于次要说明、已读信息、脚注。

### 🖼️ 视觉组件规范 (Component Specs)
- **卡片 (Cards)**: 
  - 边框: `1px solid #2B2B2B` (模拟手绘或粗糙印刷线)。
  - 细节: 右上角增加“回形针”或“折角”占位符，模拟纸质档案感。
- **按钮 (Buttons)**:
  - 形状: 矩形，边缘微圆，模拟橡胶印章。
  - 交互: 点击时产生 `1px` 下沉位移，模拟“用力按压印章”的物理感。
- **资产显示**: 
  - 金额变动不使用红绿，增加时使用“黄铜金”字体，减少时使用“墨黑”加删除线或油墨晕开效果。

### 🎬 动效与声效 (Motion & Sound)
- **核心交互**: 交易成功时，屏幕中央落下半透明红色“已入账”印章。
- **数字滚动**: 资产变动采用老式机械点钞机的滚动效果。
- **触觉反馈**: 关键操作伴随手机轻微震动（Haptic Feedback）。

### 🛠️ AI 提示词建议 (For AI Vibe Coding)
在生成 UI 代码时，请确保添加后缀指令：“*Use high-contrast flat design, avoid modern gradients/shadows, prioritize 1940s newspaper layout aesthetics.*”
