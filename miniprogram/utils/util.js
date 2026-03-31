// miniprogram/utils/util.js

/**
 * 调用云函数统一封装
 * @param {string} name 云函数名
 * @param {Object} data 参数
 * @returns {Promise<any>} 返回云函数返回的 data 字段
 */
const callFunction = (name, data) => {
  return wx.cloud.callFunction({
    name,
    data
  }).then(res => {
    if (res.result && res.result.code === 0) {
      return res.result.data;
    } else {
      const msg = (res.result && res.result.msg) || '操作失败';
      wx.showToast({ title: msg, icon: 'none' });
      throw new Error(msg);
    }
  }).catch(err => {
    console.error('[callFunction]', name, err);
    wx.showToast({ title: '网络异常，请稍后重试', icon: 'none' });
    throw err;
  });
};

module.exports = {
  callFunction
};