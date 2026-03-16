// pages/index/index.js
const app = getApp();
const { callFunction } = require('../../utils/util.js');

// 模拟数据开关：true=使用本地模拟数据，false=调用真实云函数
const useMock = true; // 后端未完成时请设为 true，联调时改为 false

Page({
  data: {
    roles: [],                // 角色列表（用于渲染）
    loading: true,
    gameSessionId: null,
    preselectedRoleId: null,
    sessionStatus: 'ACTIVE'    // 场次状态
  },

  onLoad() {
    const gameSessionId = app.globalData.gameSessionId;
    const preselectedRoleId = app.globalData.preselectedRoleId;
    if (!gameSessionId) {
      wx.showToast({ title: '无效场次', icon: 'error' });
      return;
    }
    this.setData({ gameSessionId, preselectedRoleId });
    this.fetchSessionStatus();
  },

  // 获取场次状态和可用角色
  fetchSessionStatus() {
    if (useMock) {
      // ========== 模拟数据（完全按API协议格式） ==========
      setTimeout(() => {
        const mockData = {
          sessionStatus: 'ACTIVE',
          myRole: null,  // 假设未选角色
          availableRoles: [
            {
              roleId: "chen_jingren",
              roleName: "陈景仁",
              codeName: "商会会长",
              avatarUrl: "/images/placeholder.png", // 本地临时图片
              description: "江丰纺织厂董事长，抗日募捐大会牵头人。"
            },
            {
              roleId: "chen_jue",
              roleName: "陈觉",
              codeName: "法学学生",
              avatarUrl: "/images/placeholder.png",
              description: "陈景仁独子，暗恋张涵，拥有股份继承权。"
            },
            {
              roleId: "ge_zhiye",
              roleName: "戈智也",
              codeName: "四国记者",
              avatarUrl: "/images/placeholder.png",
              description: "留洋记者，《剩山图》失窃案真凶。"
            },
            {
              roleId: "guo_sang",
              roleName: "郭桑",
              codeName: "鉴赏家",
              avatarUrl: "/images/placeholder.png",
              description: "地下党员，急需筹集电台资金，持有赝品。"
            },
            {
              roleId: "shi_feng",
              roleName: "史锋",
              codeName: "文物代表",
              avatarUrl: "/images/placeholder.png",
              description: "日本特工石川悠真，目标夺取《剩山图》。"
            },
            {
              roleId: "ye_shujin",
              roleName: "叶舒瑾",
              codeName: "满洲格格",
              avatarUrl: "/images/placeholder.png",
              description: "亡妻闺蜜，寻回传世画作，调查死因。"
            },
            {
              roleId: "zhang_han",
              roleName: "张涵",
              codeName: "当红歌星",
              avatarUrl: "/images/placeholder.png",
              description: "日本特工佐藤穗奈美，陈景仁情人。"
            }
          ]
        };
        this.setData({ 
          roles: mockData.availableRoles, 
          sessionStatus: mockData.sessionStatus,
          loading: false 
        });

        // 处理预选角色自动绑定
        if (this.data.preselectedRoleId) {
          const targetRole = mockData.availableRoles.find(r => r.roleId === this.data.preselectedRoleId);
          if (targetRole) {
            this.bindRole(targetRole);
          } else {
            wx.showToast({ title: '该角色已被抢占，请重新选择', icon: 'none' });
          }
        }
      }, 500); // 模拟网络延迟
    } else {
      // ========== 真实接口调用 ==========
      callFunction('get_session_status', {
        gameSessionId: this.data.gameSessionId
      }).then(data => {
        if (data.sessionStatus !== 'ACTIVE') {
          wx.showToast({ title: '剧本已结案', icon: 'none' });
          return;
        }
        const availableRoles = data.availableRoles || [];
        this.setData({ roles: availableRoles, sessionStatus: data.sessionStatus, loading: false });

        if (this.data.preselectedRoleId) {
          const targetRole = availableRoles.find(r => r.roleId === this.data.preselectedRoleId);
          if (targetRole) {
            this.bindRole(targetRole);
          } else {
            wx.showToast({ title: '该角色已被抢占，请重新选择', icon: 'none' });
          }
        }
      }).catch(() => {
        this.setData({ loading: false });
      });
    }
  },

  // 点击角色卡片
  onSelectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.bindRole(role);
  },

  bindRole(role) {
    wx.showLoading({ title: '绑定中...' });
    if (useMock) {
      // ========== 模拟绑定成功 ==========
      setTimeout(() => {
        wx.hideLoading();
        app.globalData.myRoleId = role.roleId;
        wx.redirectTo({ url: '/pages/asset/index' });
      }, 500);
    } else {
      // ========== 真实接口调用 ==========
      callFunction('bind_role', {
        gameSessionId: this.data.gameSessionId,
        roleId: role.roleId
      }).then(data => {
        wx.hideLoading();
        app.globalData.myRoleId = role.roleId;
        wx.redirectTo({ url: '/pages/asset/index' });
      }).catch(() => {
        wx.hideLoading();
        // 绑定失败（如角色已被占），刷新列表
        this.fetchSessionStatus();
      });
    }
  }
});
