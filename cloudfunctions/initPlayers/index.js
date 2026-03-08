// cloudfunctions/initPlayers/index.js
const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

// 7人角色数据（根据文档配置）
const players = [
  {
    role: 'banker',           // 银行家
    name: '维克多·拉塞尔',
    identity: '银行家',
    balance: 50000,           // 初始现金
    assets: {
      deposit: 200000,        // 存款
      bonds: 100000,          // 债券
      property: 300000        // 房产
    },
    skills: {
      passive: '资金拆借',
      active: '信用评估'
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    role: 'businessman',      // 商人
    name: '陈景荣',
    identity: '商人',
    balance: 30000,
    assets: {
      deposit: 50000,
      inventory: 150000,      // 货物
      receivables: 80000      // 应收账款
    },
    skills: {
      passive: '行情洞察',
      active: '紧急抛售'
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    role: 'broker',           // 股票经纪人
    name: '托马斯·杨',
    identity: '股票经纪人',
    balance: 20000,
    assets: {
      deposit: 30000,
      stocks: 250000,         // 股票
      margin: 50000           // 保证金
    },
    skills: {
      passive: '内幕消息',
      active: '做空'
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    role: 'gangster',         // 黑帮
    name: '阿尔·卡彭',
    identity: '黑帮',
    balance: 100000,
    assets: {
      cash: 200000,           // 藏匿现金
      weapons: 50000,         // 武器
      protection: 30000       // 保护费
    },
    skills: {
      passive: '恐吓',
      active: '洗钱'
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    role: 'police',           // 警察
    name: '李耀明',
    identity: '警察',
    balance: 15000,
    assets: {
      deposit: 20000,
      informants: 10000,      // 线人经费
      evidence: 0             // 证据
    },
    skills: {
      passive: '执法',
      active: '搜查'
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    role: 'journalist',       // 记者
    name: '格蕾丝·陈',
    identity: '记者',
    balance: 8000,
    assets: {
      deposit: 10000,
      secrets: 50000,         // 掌握的秘密
      contacts: 20000         // 人脉
    },
    skills: {
      passive: '情报网',
      active: '爆料'
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  },
  {
    role: 'underground',      // 地下钱庄
    name: '高桥',
    identity: '地下钱庄',
    balance: 50000,
    assets: {
      cash: 300000,           // 现金储备
      loans: 200000,          // 放贷
      foreign: 50000          // 外币
    },
    skills: {
      passive: '黑市通道',
      active: '高利贷'
    },
    createdAt: db.serverDate(),
    updatedAt: db.serverDate()
  }
]

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  
  try {
    // 1. 检查是否已经初始化过（防止重复）
    const countResult = await db.collection('players').count()
    if (countResult.total > 0) {
      return {
        success: false,
        message: '数据已存在，如需重新初始化请先清空 players 集合',
        code: 'ALREADY_EXISTS'
      }
    }
    
    // 2. 使用事务批量写入
    const transaction = await db.startTransaction()
    
    try {
      const addResults = []
      for (const player of players) {
        // 为每个角色添加唯一标识
        player._id = player.role  // 用角色名作为ID，方便查询
        player._openid = null      // 等待用户扫码绑定
        
        const res = await transaction.collection('players').add({
          data: player
        })
        addResults.push(res)
      }
      
      // 提交事务
      await transaction.commit()
      
      return {
        success: true,
        message: '7人数据初始化成功',
        data: {
          count: addResults.length,
          players: players.map(p => ({
            role: p.role,
            name: p.name,
            balance: p.balance
          }))
        }
      }
      
    } catch (err) {
      // 回滚事务
      await transaction.rollback()
      throw err
    }
    
  } catch (err) {
    console.error('初始化失败', err)
    return {
      success: false,
      message: '初始化失败',
      error: err.message,
      code: 'INIT_FAILED'
    }
  }
}