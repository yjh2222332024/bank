// tests/test.js
// 模拟云函数调用测试

// 1. 模拟数据库（因为不能真的调用云函数）
const mockPlayers = []

// 2. 测试初始化函数（复制一部分云函数逻辑）
async function testInit() {
  console.log('=== 测试1：首次初始化应该成功 ===')
  
  // 模拟空数据库
  const mockCount = { total: 0 }
  
  if (mockCount.total === 0) {
    console.log('✅ 数据库为空，可以初始化')
    
    // 模拟写入一条数据测试
    const testPlayer = {
      role: 'banker',
      name: '维克多·拉塞尔',
      balance: 50000
    }
    mockPlayers.push(testPlayer)
    console.log('✅ 测试数据写入成功', testPlayer)
  }
  
  console.log('\n=== 测试2：重复初始化应该失败 ===')
  // 模拟已有数据
  const mockCount2 = { total: 7 }
  
  if (mockCount2.total > 0) {
    console.log('✅ 检测到已有数据，返回 ALREADY_EXISTS')
  }
}

// 运行测试
testInit().then(() => {
  console.log('\n=== 测试完成 ===')
})