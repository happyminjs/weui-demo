//app.js
App({
  globalData: {},
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        // env 参数说明：
        //   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
        //   此处请填入环境 ID, 环境 ID 可打开云控制台查看
        //   如不填则使用默认环境（第一个创建的环境）
        env: 'weui-demo-x5c8z',
        traceUser: true,
      })
    }
  },

  /**
   * wxLogin 获取用户的 openid，unionid，小程序的 appid
   * 返回 Promise，调用方式 app.wxLogin().then(successFn, failFn)
   * successFn 可以取 app.globalData 中数据
   * @param {Boolean} newest 是否要实时获取最新的
   */
  wxLogin: function(newest = false) {
    if (!newest && this.globalData.openid) {
      return new Promise.resolve()
    }
    return new Promise((resolve, reject) => {
      // 调用云函数 login
      wx.cloud.callFunction({
        name: 'login',
        data: {},
        success: res => {
          console.log('[云函数] [login] success ', res.result)
          this.globalData.appid = res.result.appid
          this.globalData.env = res.result.env
          this.globalData.openid = res.result.openid
          this.globalData.unionid = res.result.unionid
          resolve(res.result)
        },
        fail: err => {
          console.error('[云函数] [login] 调用失败', err)
          reject(err)
        }
      })
    })
  },

  /**
   * getUserInfo 获取用户头像avatarUrl、昵称nickName、性别gender、省市县等 信息，一般进入页面就先调用此方法，进行有权限时的设置
   * 返回 Promise
   * 调用方式：
   * wxml中要用button按钮来触发调用 
   *  <button open-type="getUserInfo" bindgetuserinfo="onGetUserInfo" style="background-image: url({{avatarUrl}})"></button>
   * @param {Boolean} newest 是否要实时获取最新的
   */
  getUserInfo: function(newest = false) {
    // 确认是否已授权，如果已授权，则直接获取
    if (!newest && this.globalData.userInfo) {
      return new Promise.resolve(this.globalData.userInfo);
    }
    return new Promise((resolve, reject) => {
      this.getSetting('scope.userInfo', false).then(res => {
        if (res == true) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: (res) => {
              this.globalData.userInfo = res.userInfo
              resolve(res.userInfo)
            },
            fail: (err) => {
              reject(err)
            }
          })
        } else {
          // 未授权情况下，只能按钮点击获取权限，可在页面的js 的 onGetUserInfo 方法中进行用户信息的设置
          // onGetUserInfo: (res) => {console.log(res.detail.userInfo)}
          reject();
        }
      }, err => {
        console.log('this.getSetting err: ', err);
        reject(err);
      })
    })
  },

  /**
   * 确认是否有某项权限
   * @param {String} settingName 权限的名称 如 scope.userInfo
   * @param {Boolean} openSet 若没有 settingName 权限，是否自动获取此权限(不包括已拒绝权限)
   * @return {Promise} 格式
   */
  getSetting: function(settingName = '', openSet = false) {
    if (!settingName) {
      return new Promise.reject('no settingName')
    }
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting[settingName]) {
            resolve(true)
          } else {
            if (openSet) {
              wx.authorize({
                scope: settingName,
                success: (res) => {
                  resolve(true)
                },
                fail: (err) => {
                  console.log('wx.authorize err', err)
                  resolve(false)
                }
              })
            } else {
              resolve(false)
            }
          }
        },
        fail: (err) => {
          console.log('wx.getSetting failed, err msg is: ', err);
          reject(err);
        }
      })
    })
  },

  /**
   * 选择图片，并对图片进行处理
   */
  chooseImg: function() {},

  /**
   * 上传图片
   */
  upLoadImg: function() {

  }
})
