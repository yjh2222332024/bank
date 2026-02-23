# Git 仓库协同与代码规范 (MVP v1.2)

**适用对象**：全体研发成员（前端 A/B，后端 C，QA D）
**目标**：保障多人开发微信小程序和云函数时“不炸库、不冲突、可追溯”，确保代码平稳合入。
**总则**：所有的代码变动必须通过 Merge Request (MR) 进行，**绝对严禁**任何人向 `main` 和 `develop` 分支直接 Push 代码。

---

## 一、 分支管理模型 (Git Flow 极简版)

我们采用轻量级的敏捷分支策略，核心分支分为以下四类：

* **`main` (主分支 - 生产环境)**：绝对稳定的发版代码。仅限总负责人（Lead）在提审发布小程序时进行合并。
* **`develop` (开发/联调分支 - 测试环境)**：日常前后端联调和 QA 测试的基准分支。所有人开发完的功能都要汇聚于此。
* **`feature/*` (功能分支)**：组员日常开发的私人战场。开发新功能前，必须从最新的 `develop` 切出。
  * *命名规范*：`feature/姓名拼音缩写-功能短描述`
  * *示例*：`feature/zs-dm-panel` (张三开发的 DM 控制台)
* **`bugfix/*` (修复分支)**：用于修复组员 D（QA）提报的 Bug。
  * *命名规范*：`bugfix/姓名拼音缩写-bug编号或简述`
  * *示例*：`bugfix/ls-balance-negative` (李四修复余额为负数的漏洞)

---

## 二、 Commit 提交规范 (Angular 规范)

为了方便排查线上 Bug 和自动生成发布日志，每次提交必须包含**类型前缀**。

**格式**：`<type>(<scope>): <subject>`

**常用 Type 列表**：
* `feat`: 🚀 新增功能 (Feature)
* `fix`: 🐛 修复 Bug
* `docs`: 📝 文档修改 (如更新 API 协议、README)
* `style`: 🎨 UI样式/CSS修改 (不影响逻辑的页面调整)
* `refactor`: ♻️ 代码重构 (非新增功能也非改 Bug)
* `test`: ✅ 增加或修改测试用例
* `chore`: 🔧 构建过程、配置或 npm 依赖变动

**正确示例**：
* `feat(role-bind): 新增玩家扫码绑定角色逻辑`
* `fix(cloud-func): 修复余额不足时并发扣款导致的负数穿透`
* `style(asset-card): 调整大洋余额的复古排版字号`

---

## 三、 每日开发工作流 (Standard Workflow)

请全员严格默念并执行以下 5 步口诀，杜绝“代码被覆盖”的惨案：

1. **拉基准**：每天开工前，切到 `develop`，拉取最新代码。
   `git checkout develop` -> `git pull origin develop`
2. **切分支**：基于最新的 `develop`，切出你今天的功能分支。
   `git checkout -b feature/xxx`
3. **频提交**：在本地开发，保持小颗粒度提交，写完一个逻辑块就 commit 一次。
   `git add .` -> `git commit -m "feat(xxx): xxx"`
4. **防冲突**：功能开发完毕准备推送前，**必须**先拉取一次云端的 `develop`，在本地解决掉潜在冲突！
   `git pull origin develop` -> 手动解决红字冲突 -> `git commit`
5. **提 MR**：推送到云端，并在代码托管平台发起 Merge Request。
   `git push origin feature/xxx` -> 网页端发起 MR 给总负责人 Review。

---

## 四、 微信小程序 & 云开发专项防坑指南 (重点！)

### 1. 严格执行 `.gitignore` 规范
为了保持仓库整洁，避免互相覆盖开发者工具配置，以下目录和文件**严禁**提交到 Git 仓库：

```text
# 依赖包 (Node.js 必备)
node_modules/
package-lock.json

# 小程序 npm 构建生成的依赖目录 (每个组员拉下代码后，自己在开发者工具点"构建npm"！)
miniprogram_npm/

# 微信开发者工具生成的本地私有配置 (绝对不能传，否则会覆盖别人的 AppID 和本地路径！)
project.private.config.json
.idea/
.vscode/
.DS_Store

# 微信云开发本地调试缓存
cloudfunctions/**/node_modules/
.cloud/