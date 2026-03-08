/**
 * 原子转账云函数 - transfer
 * 符合规范：docs/04_API协议与实时规范_v1.2.md
 * 安全红线：使用 db.command.inc 原子操作
 * 实现人：rjr
 * 时间：2026-03-08
 */

const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

/**
 * 转账主函数
 * @param {string} fromRole - 转出方角色ID (如 'banker')
 * @param {string} toRole - 转入方角色ID (如 'businessman')  
 * @param {number} amount - 转账金额（正整数）
 * @param {string} reason - 转账原因（可选）
 */
exports.main = async (event, context) => {
  const { fromRole, toRole, amount, reason = '' } = event
  const wxContext = cloud.getWXContext()
  const callerOpenId = wxContext.OPENID

  // ========== 1. 参数校验 ==========
  if (!fromRole || !toRole || !amount) {
    return {
      success: false,
      message: '参数错误：缺少必要参数',
      code: 'MISSING_PARAMS'
    }
  }

  if (typeof amount !== 'number' || amount <= 0) {
    return {
      success: false,
      message: '参数错误：金额必须为正数',
      code: 'INVALID_AMOUNT'
    }
  }

  if (fromRole === toRole) {
    return {
      success: false,
      message: '不能给自己转账',
      code: 'SELF_TRANSFER'
    }
  }

  // ========== 2. 开启事务 ==========
  const transaction = await db.startTransaction()

  try {
    // ========== 3. 获取转出方信息 ==========
    const fromRes = await transaction.collection('players').doc(fromRole).get()
    const fromPlayer = fromRes.data
    
    if (!fromPlayer) {
      throw new Error('转出方角色不存在')
    }

    // 权限校验：只能操作自己绑定的账户
    if (fromPlayer._openid !== callerOpenId) {
      throw new Error('无权操作此账户')
    }

    // ========== 4. 获取转入方信息 ==========
    const toRes = await transaction.collection('players').doc(toRole).get()
    const toPlayer = toRes.data
    
    if (!toPlayer) {
      throw new Error('转入方角色不存在')
    }

    // ========== 5. 余额检查 ==========
    if (fromPlayer.balance < amount) {
      throw new Error('余额不足')
    }

    // ========== 6. 执行原子更新 ==========
    // 扣减转出方余额
    await transaction.collection('players').doc(fromRole).update({
      balance: db.command.inc(-amount),
      updatedAt: db.serverDate()
    })

    // 增加转入方余额
    await transaction.collection('players').doc(toRole).update({
      balance: db.command.inc(amount),
      updatedAt: db.serverDate()
    })

    // ========== 7. 记录交易流水 ==========
    const transactionRecord = {
      fromRole,
      toRole,
      fromName: fromPlayer.name,
      toName: toPlayer.name,
      amount,
      reason,
      operatorOpenId: callerOpenId,
      status: 'success',
      createTime: db.serverDate()
    }
    
    const txRes = await transaction.collection('transactions').add({
      data: transactionRecord
    })

    // ========== 8. 提交事务 ==========
    await transaction.commit()

    // ========== 9. 返回成功结果 ==========
    return {
      success: true,
      message: '转账成功',
      data: {
        fromRole,
        toRole,
        amount,
        fromNewBalance: fromPlayer.balance - amount,
        toNewBalance: toPlayer.balance + amount,
        transactionId: txRes._id
      }
    }

  } catch (err) {
    // ========== 10. 发生错误，回滚事务 ==========
    await transaction.rollback()
    
    console.error('[转账失败]', err)
    return {
      success: false,
      message: err.message || '转账失败',
      code: 'TRANSFER_FAILED'
    }
  }
}