// pages/asset/index.js
const app = getApp();
const { callFunction } = require('../../utils/util.js');

const useMock = true; // 与选角页保持一致

Page({
  data: {
    gameSessionId: null,
    roleId: null,
    roleName: '',
    codeName: '',
    avatarUrl: '/images/default-avatar.png',
    balance: 0,
    displayBalance: '0',
    logs: [],
    page: 1,
    pageSize: 20,
    total: 0,
    hasMore: true,
    showStamp: false,
    watcher: null,
    rollTimer: null
  },

  onLoad() {
    const gameSessionId = app.globalData.gameSessionId;
    const roleId = app.globalData.myRoleId;
    if (!gameSessionId || !roleId) {
      wx.showToast({ title: '信息缺失', icon: 'error' });
      return;
    }
    this.setData({ gameSessionId, roleId });
    this.fetchPlayerInfo();
    this.loadLedger(true);
    this.watchBalance();
  },

  onUnload() {
    if (this.data.watcher) {
      this.data.watcher.close();
    }
    if (this.data.rollTimer) {
      clearInterval(this.data.rollTimer);
    }
  },

  fetchPlayerInfo() {
    if (useMock) {
      setTimeout(() => {
        const mockData = {
          roleId: this.data.roleId,
          roleName: '叶舒瑾',
          codeName: '满洲格格',
          balance: 80000,
          isDM: false
        };
        this.setData({
          roleName: mockData.roleName,
          codeName: mockData.codeName,
          balance: mockData.balance,
          displayBalance: mockData.balance.toString()
        });
      }, 300);
    } else {
      callFunction('get_player_info', {
        gameSessionId: this.data.gameSessionId
      }).then(data => {
        this.setData({
          roleName: data.roleName || '',
          codeName: data.codeName || '',
          balance: data.balance || 0,
          displayBalance: (data.balance || 0).toString()
        });
        if (data.avatarUrl) {
          this.setData({ avatarUrl: data.avatarUrl });
        }
      });
    }
  },

  watchBalance() {
    if (useMock) return;
    const db = wx.cloud.database();
    const watcher = db.collection('players')
      .where({
        _openid: '{openid}',
        gameSessionId: this.data.gameSessionId
      })
      .watch({
        onChange: snapshot => {
          if (snapshot.docChanges.length > 0) {
            const change = snapshot.docChanges[0];
            if (change.dataType === 'update' && change.doc.balance !== undefined) {
              const newBalance = change.doc.balance;
              this.onBalanceChange(newBalance);
            }
          }
        },
        onError: err => {
          console.error('watch error', err);
          setTimeout(() => this.watchBalance(), 5000);
        }
      });
    this.setData({ watcher });
  },

  onBalanceChange(newBalance) {
    const oldBalance = this.data.balance;
    if (newBalance === oldBalance) return;

    this.setData({ balance: newBalance });
    this.rollNumber(oldBalance, newBalance);

    if (newBalance > oldBalance) {
      this.setData({ showStamp: true });
      wx.vibrateShort({ type: 'light' });
      setTimeout(() => {
        this.setData({ showStamp: false });
      }, 500);
    }

    this.loadLedger(true);
  },

  rollNumber(from, to) {
    if (this.data.rollTimer) clearInterval(this.data.rollTimer);
    const steps = 20;
    const diff = to - from;
    let current = from;
    const stepValue = diff / steps;
    let count = 0;
    const timer = setInterval(() => {
      count++;
      if (count >= steps) {
        clearInterval(timer);
        this.setData({ displayBalance: to.toString(), rollTimer: null });
        return;
      }
      current += stepValue;
      this.setData({ displayBalance: Math.round(current).toString() });
    }, 20);
    this.setData({ rollTimer: timer });
  },

  // ========== 测试按钮方法 ==========
  testAddMoney() {
    const newBalance = this.data.balance + 5000;
    this.onBalanceChange(newBalance);
  },

  loadLedger(reset = false) {
    if (reset) {
      this.setData({ page: 1, logs: [], hasMore: true });
    }
    if (!this.data.hasMore) return;

    if (useMock) {
      setTimeout(() => {
        const mockLogs = [
          {
            logId: 'tx_001',
            tradeType: 'ADD',
            amount: 5000,
            balanceAfter: 85000,
            source: '情报交易分成',
            timestamp: Date.now() - 3600000
          },
          {
            logId: 'tx_002',
            tradeType: 'SUB',
            amount: 2000,
            balanceAfter: 83000,
            source: '购买线索',
            timestamp: Date.now() - 7200000
          },
          {
            logId: 'tx_003',
            tradeType: 'TRANSFER',
            amount: 3000,
            balanceAfter: 86000,
            source: '郭桑转账',
            timestamp: Date.now() - 10800000
          }
        ];
        const total = 3;
        const hasMore = false;
        this.setData({
          logs: reset ? mockLogs : this.data.logs.concat(mockLogs),
          total,
          hasMore
        });
      }, 300);
    } else {
      callFunction('get_ledger_logs', {
        gameSessionId: this.data.gameSessionId,
        page: this.data.page,
        pageSize: this.data.pageSize
      }).then(data => {
        const logs = data.logs || [];
        const total = data.total || 0;
        const hasMore = logs.length === this.data.pageSize && this.data.logs.length + logs.length < total;
        this.setData({
          logs: reset ? logs : this.data.logs.concat(logs),
          page: this.data.page + 1,
          total,
          hasMore
        });
      });
    }
  },

  loadMore() {
    this.loadLedger();
  },

  formatType(type) {
    const map = { 'ADD': '入账', 'SUB': '出账', 'TRANSFER': '转账' };
    return map[type] || type;
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const h = date.getHours().toString().padStart(2, '0');
    const m = date.getMinutes().toString().padStart(2, '0');
    const s = date.getSeconds().toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  }
});