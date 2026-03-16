const db = wx.cloud.database();

Page({
  data: {
    hasData: false,
    roleInfo: {},
    balance: 0,
    transactions: [],  // 流水列表（静态示例，后续改为动态）
    balanceAnim: false,
    stampAnim: false,
    // 与数据库中的测试数据一致（见你的截图）
    gameSessionId: 'session_test',
    openId: 'test_openid'
  },

  onLoad(options) {
    console.log('玩家页面加载，查询条件：', this.data.gameSessionId, this.data.openId);
    this.fetchPlayerInfo();
    this.watchBalance();
  },

  // 从云数据库获取玩家信息
  fetchPlayerInfo() {
    db.collection('players')
      .where({
        gameSessionId: this.data.gameSessionId,
        openId: this.data.openId
      })
      .get()
      .then(res => {
        console.log('查询结果：', res);
        if (res.data.length > 0) {
          const player = res.data[0];
          this.setData({
            hasData: true,
            roleInfo: {
              roleName: player.roleName,
              codeName: player.codeName
            },
            balance: player.balance
          });
        } else {
          console.error('未找到玩家数据');
          // 降级显示：使用你截图中的数据作为后备
          this.setData({
            hasData: true,
            roleInfo: { roleName: '叶舒瑾', codeName: '满洲格格' },
            balance: 85000
          });
        }
      })
      .catch(err => {
        console.error('查询失败', err);
        // 失败时也显示模拟数据
        this.setData({
          hasData: true,
          roleInfo: { roleName: '叶舒瑾', codeName: '满洲格格' },
          balance: 85000
        });
      });
  },

  // 实时监听余额变化（符合API协议规范）
  watchBalance() {
    console.log('开始监听余额变化...');
    const watcher = db.collection('players')
      .where({
        gameSessionId: this.data.gameSessionId,
        openId: this.data.openId
      })
      .watch({
        onChange: (snapshot) => {
          console.log('监听到变化', snapshot);
          if (snapshot.docChanges.length > 0) {
            const change = snapshot.docChanges[0];
            if (change.dataType === 'update' && change.updatedFields && change.updatedFields.balance) {
              const newBalance = change.doc.balance;
              console.log('余额变更为：', newBalance);
              this.triggerBalanceEffect(newBalance);
            }
          }
        },
        onError: (err) => {
          console.error('监听错误', err);
        }
      });
    this.watcher = watcher;
  },

  // 触发动效
  triggerBalanceEffect(newBalance) {
    this.setData({ balance: newBalance });
    // 数字跳动
    this.setData({ balanceAnim: true });
    setTimeout(() => this.setData({ balanceAnim: false }), 300);
    // 印章动效
    this.setData({ stampAnim: true });
    setTimeout(() => this.setData({ stampAnim: false }), 300);
  },

  onUnload() {
    if (this.watcher) {
      this.watcher.close();
    }
  }
});