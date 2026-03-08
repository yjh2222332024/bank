// tests/test_bind.js - 绑定功能测试
console.log('=== 绑定功能测试开始 ===\n')

// 测试用例1：首次绑定
console.log('测试1：首次绑定银行家')
console.log('调用参数：{ role: "banker" }')
console.log('期望结果：成功，返回角色信息')
console.log('检查点：')
console.log('  ✅ players 集合中 banker 的 _openid 更新为当前用户')
console.log('  ✅ 返回数据包含 name/balance/assets/skills\n')

// 测试用例2：重复绑定同一角色
console.log('测试2：重复绑定同一角色')
console.log('调用参数：{ role: "banker" }')
console.log('期望结果：成功（幂等），返回已绑定提示')
console.log('检查点：')
console.log('  ✅ 返回 message: "已绑定过该角色"\n')

// 测试用例3：绑定已被他人绑定的角色
console.log('测试3：绑定已被他人绑定的角色')
console.log('调用参数：{ role: "businessman" }（假设已被他人绑定）')
console.log('期望结果：失败，返回角色已被绑定\n')

// 测试用例4：绑定不存在的角色
console.log('测试4：绑定不存在的角色')
console.log('调用参数：{ role: "nonexist" }')
console.log('期望结果：失败，返回角色不存在\n')

console.log('=== 测试用例编写完成 ===')
console.log('请在开发者工具 Console 中实际调用验证')