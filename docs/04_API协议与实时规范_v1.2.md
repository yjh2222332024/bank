# API 协议日志与实时同步规范 (MVP v1.2)

**维护人**：组员 C（后端逻辑开发）

**协作者**：组员 A、B（前端 Mock 联调参考）

**状态**：已定稿（Ready for Dev）



***

## 一、 全局通信约定

### 1. 标准响应体 (Response Format)

所有云函数接口必须严格返回以下 JSON 结构，绝不允许直接抛出原生 Error 对象给前端：



```
{

  "code": 0,          // 状态码 (0: 成功)

  "msg": "success",   // 提示信息 (前端可直接用于 Toast 展示)

  "data": {}          // 业务数据载荷 (如果无数据可返回 null)

}
```

### 2. 全局状态码字典 (Error Codes)



| 状态码 | 说明                                 |
| --- | ---------------------------------- |
| 0   | 成功                                 |
| 400 | 参数错误 (如金额为负数、未传 requestId 等)       |
| 401 | 权限不足 (如非 DM 调用了 DM 专属接口)           |
| 403 | 业务阻断 (如 余额不足、角色已被他人抢占)             |
| 404 | 资源不存在 (如场次不存在或已结案)                 |
| 409 | 幂等冲突 (该 requestId 的请求已处理，前端静默忽略即可) |
| 500 | 服务器 / 事务内部异常                       |

### 3. 实时数据同步规范 (替代轮询) [核心架构要求]

致前端组员 B：

严禁使用 `setInterval` 定时调用云函数刷新余额！必须使用微信云开发的 **实时数据推送机制** (`db.collection.watch`)。

流程：前端在调用 `bind_role` 或 `get_player_info` 成功后，开启对 `players` 集合中当前玩家 Doc 的 Watch 监听。

触发条件：监听到 `balance` 字段变化时，前端立即执行 "数字滚动组件" 及 "Lottie 收据盖章动效"，实现 0 延迟沉浸式体验。



***

## 二、 场次管理接口 (DM 专属)

### 1. 创建新游戏场次 (create_game_session)



* **功能**：DM 开城，生成一个新的对局环境，隔离历史数据。

* **入参 (Request)**：无（后端直接取调用者的 OPENID 作为 DM）

* **出参 (Response data)**：



```
{

  "gameSessionId": "session_1716384000",

  "qrCodeParam": "scene=session_1716384000" // 建议前端将其生成为小程序码供玩家扫

}
```

### 2. 结束游戏场次 (end_game_session)



* **功能**：复盘结束，冻结该场次所有资金操作。

* **入参 (Request)**：



```
{

  "gameSessionId": "session_1716384000"

}
```



* **出参 (Response data)**：null



***

## 三、 玩家入场与选角接口

### 1. 获取场次与选角状态 (get_session_status)



* **功能**：玩家扫码进入后调用，检查场次是否有效，并获取当前可用的角色列表（用于选角界面渲染）。

* **入参 (Request)**：



```
{

  "gameSessionId": "session_1716384000"

}
```



* **出参 (Response data)**：



```
{

  "sessionStatus": "ACTIVE",       // 若为 FINISHED，前端直接展示"剧本已结案"

  "myRole": null,                  // 如果该玩家已选过角色，返回 roleId（跳过选角页）；若未选，返回 null

  "availableRoles": [              // 供玩家选择的角色列表

    {

      "roleId": "ye_shujin",

      "roleName": "叶舒瑾",

      "codeName": "满洲贵族",

      "avatarUrl": "cloud://..."   // 角色海报缩略图

    }

    // ...其他未被别人抢占的角色

  ]

}
```

### 2. 玩家确认选角 (bind_role)



* **功能**：玩家点击卡片确认身份，系统为其发放初始大洋（注：后端需开启事务防并发抢角）。

* **入参 (Request)**：



```
{

  "gameSessionId": "session_1716384000",

  "roleId": "ye_shujin"

}
```



* **出参 (Response data)**：



```
{

  "roleId": "ye_shujin",

  "balance": 80000     // 初始资金

}
```

### 3. 获取个人资产看板 (get_player_info)



* **功能**：游戏中断线重连，或拉取自己最新的资产详情。

* **入参 (Request)**：



```
{

  "gameSessionId": "session_1716384000"

}
```



* **出参 (Response data)**：



```
{

  "roleId": "ye_shujin",

  "roleName": "叶舒瑾",

  "codeName": "满洲贵族",

  "balance": 85000,

  "isDM": false

}
```



***

## 四、 核心交易接口 (需严格防并发)

### 1. DM 资金调度指令 (execute_transaction) [DM 专属]



* **功能**：DM 手动拨盘加减钱或一键分发。

* **入参 (Request)**：



```
{

  "gameSessionId": "session_1716384000",

  "targetOpenIds": ["openid_A", "openid_B"],  // 支持单选或全选一键分发

  "amount": -2000,                            // 负数代表扣钱

  "reason": "购买《剩山图》线索",

  "requestId": "9b1deb4d-3b7d-4bad..."        // [必填] UUID，用于防弱网连点重试

}
```



* **出参 (Response data)**：



```
{

  "successCount": 2, // 成功处理的玩家人数

  "failCount": 0     // 失败人数（如部分玩家余额不足导致扣款失败的情况）

}
```

### 2. 玩家互转资金 (transfer_money)



* **功能**：玩家之间私下交易情报或转账。

* **入参 (Request)**：



```
{

  "gameSessionId": "session_1716384000",

  "targetRoleId": "ge_zhiye",         // 收款方角色 ID

  "amount": 1000,                     // 必须为正数，后端需做强制校验

  "reason": "购买军火/情报",

  "requestId": "uuid-xxx-xxx"         // [必填] 防弱网连点重试

}
```



* **出参 (Response data)**：null

### 3. 拉取资金流水账单 (get_ledger_logs)



* **功能**：获取当前玩家在该场次内的流水。

* **入参 (Request)**：



```
{

  "gameSessionId": "session_1716384000",

  "page": 1,

  "pageSize": 20

}
```



* **出参 (Response data)**：



```
{

  "total": 45,

  "logs": [

    {

      "logId": "tx_8839201",

      "tradeType": "ADD",          // ADD (增加) / SUBTRACT (扣除) / TRANSFER (转账)

      "amount": 5000,              // 变动绝对值

      "balanceAfter": 85000,       // 交易后的当前结余

      "source": "情报交易分成",

      "timestamp": 1716384000000

    }

  ]

}
```

> （注：文档部分内容可能由 AI 生成）