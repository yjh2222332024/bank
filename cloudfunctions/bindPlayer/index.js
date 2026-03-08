/**
 * 扫码即绑云函数 - bindPlayer
 * 符合规范：docs/04_API协议与实时规范_v1.2.md
 * 实现人：rjr
 * 时间：2026-03-08
 */

const cloud = require('wx-server-sdk')
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()

/**
 * 绑定主函数
 * @param {string} role - 角色ID (如 'banker')
 * @param {string} scene - 扫码场景值（可选）
 */
exports.main = async (event, context) => {
  const { role, scene = '' } = event
  const wxContext = cloud.getWXContext()
  const callerOpenId = wxContext.OPENID

  // ========== 1. 参数校验 ==========
  if (!role) {
    return {
      success: false,
      message: '参数错误：缺少角色ID',
      code: 'MISSING_ROLE'
    }
  }

  // ========== 2. 开启事务 ==========
  const transaction = await db.startTransaction()

  try {
    // ========== 3. 查询角色是否存在 ==========
    const playerRes = await transaction.collection('players').doc(role).get()
    const player = playerRes.data

    if (!player) {
      throw new Error('角色不存在')
    }

    // ========== 4. 检查角色是否已被绑定 ==========
    if (player._openid) {
      // 如果已被当前用户绑定，返回成功（幂等性）
      if (player._openid === callerOpenId) {
        await transaction.commit()
        return {
          success: true,
          message: '已绑定过该角色',
          data: {
            role: player.role,
            name: player.name,
            identity: player.identity,
            balance: player.balance,
            assets: player.assets,
            skills: player.skills
          }
        }
      }
      
      // 如果被其他人绑定，返回错误
      throw new Error('该角色已被其他玩家绑定')
    }

    // ========== 5. 检查该用户是否已绑定其他角色 ==========
    const existingBind = await transaction.collection('players')
      .where({
        _openid: callerOpenId
      })
      .get()

    if (existingBind.data.length > 0) {
      throw new Error('每个用户只能绑定一个角色')
    }

    // ========== 6. 执行绑定 ==========
    await transaction.collection('players').doc(role).update({
      _openid: callerOpenId,
      bindTime: db.serverDate(),
      updatedAt: db.serverDate()
    })

    // ========== 7. 提交事务 ==========
    await transaction.commit()

    // ========== 8. 返回绑定成功信息 ==========
    return {
      success: true,
      message: '绑定成功',
      data: {
        role: player.role,
        name: player.name,
        identity: player.identity,
        balance: player.balance,
        assets: player.assets,
        skills: player.skills
      }
    }

  } catch (err) {
    // ========== 9. 发生错误，回滚事务 ==========
    await transaction.rollback()
    
    console.error('[绑定失败]', err)
    return {
      success: false,
      message: err.message || '绑定失败',
      code: 'BIND_FAILED'
    }
  }
}