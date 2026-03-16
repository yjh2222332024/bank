// app.js
App({
  globalData: {
    gameSessionId: null,
    preselectedRoleId: null,
    myRoleId: null
  },
  onLaunch(options) {
    // 初始化云开发
    wx.cloud.init({
      env: 'cloud1-1gm0e7r1a736a340',
      traceUser: true
    });

    // 处理扫码参数
    if (options.query && options.query.scene) {
      const scene = decodeURIComponent(options.query.scene);
      const parts = scene.split(',');
      const sidPart = parts.find(p => p.startsWith('sid:'));
      const ridPart = parts.find(p => p.startsWith('rid:'));
      if (sidPart) this.globalData.gameSessionId = sidPart.replace('sid:', '');
      if (ridPart) this.globalData.preselectedRoleId = ridPart.replace('rid:', '');
    }

    // 【开发调试用】如果没有获取到，设置一个测试值
    if (!this.globalData.gameSessionId) {
      this.globalData.gameSessionId = 'test_session_001';
      this.globalData.preselectedRoleId = 'ye_shujin'; // 可选，测试自动绑定叶舒瑾
    }

    console.log('当前gameSessionId:', this.globalData.gameSessionId);
  }
});