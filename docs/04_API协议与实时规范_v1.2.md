# 《谍影钱庄》API 协议与实时规范 v1.2

## 一、 核心云函数接口 (Cloud Functions)

### 1. `bind_role` (玩家选角)
- **输入参数**: `roleId` (字符串)
- **返回值**: `{ code: 0, msg: "绑定成功", data: { roleInfo } }`
- **逻辑校验**: 检查该角色是否已被其他 OpenID 绑定。

### 2. `execute_transaction` (核心转账逻辑)
- **输入参数**: 
  - `toOpenId`: 接收方 OpenID
  - `amount`: 转账金额 (数字)
  - `note`: 交易密语 (字符串)
- **返回值**: `{ code: 0, balance: 新余额, txId: 交易ID }`
- **安全审计**: 
  - 必须由服务端获取 `auth.openid` 确认转账发起方身份。
  - 必须使用数据库事务 (Transaction) 确保扣款和增加操作原子性。
  - 余额必须大于或等于转账金额。

### 3. `get_assets` (获取资产卡片)
- **输入参数**: 无
- **返回值**: 玩家全量资产、交易流水列表、角色信息。

## 二、 实时监听规范 (Real-time Listener)

- **余额变动监听**: 
  - 前端监听 `users` 表中当前 OpenID 的 `balance` 字段。
  - 触发机制：当流水表新增记录且接收方为自己时，自动刷新 UI。

- **全局状态监听**: 
  - 监听 `Config` 表，当 `gameStatus` 变为 "进行中" 时，前端自动由选角页跳转至资产页。
