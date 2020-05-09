//index.js
const app = getApp()

Page({
  data: {
    searchClass: '',
    inputShowed: false,
    inputVal: '',
    swiperData: ['demo-text-1', 'demo-text-2', 'demo-text-3'],
    tabs: [],
    activeTab: 0,
    tabSwiperHeight: 0,

    avatarUrl: './user-unlogin.png',
    userInfo: {},
    logged: false,
    takeSession: false,
    requestResult: ''
  },
  onLoad: function() {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }
    // 获取用户信息
    app.getUserInfo().then(res => {
      this.setData({
        avatarUrl: res.avatarUrl,
        userInfo: res
      })
    })

    // 下边是 tabs 的测试数据
    const titles = ['首页', '外卖', '商超生鲜', '购物', '美食饮品', '生活服务', '休闲娱乐', '出行']
    const tabs = titles.map((item, index) => 
      {
        if(index == 0) {
          return {
            title: item,
            list: [1]
          }
        } else if(index == 2) {
          return {
            title: item,
            list: [1,2,3,4,5]
          }
        } else {
          return {
            title: item,
            list: [1,2,3,4]
          }
        }
      })
    this.setData({tabs})
    this.tabsSwiperHeight();
  },

  // 搜索相关 start
  stickyScroll: function(e) {
    if (e.detail.isFixed) {
      this.setData({
        searchClass: 'opacity'
      })
    }
  },
  search: function (value) {
    console.log('aaaaa');
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{text: '搜索结果', value: 1}, {text: '搜索结果2', value: 2}])
        }, 200)
    })
  },
  selectResult: function (e) {
      console.log('select result', e.detail)
  },
  // 搜索相关 end

  // tabs 相关 start
  onTabCLick(e) {
    const index = e.detail.index
    this.setData({activeTab: index})
  },
  onChange(e) {
    const index = e.detail.index
    this.setData({activeTab: index})
    this.tabsSwiperHeight();
  },
  tabsSwiperHeight() {
    // tab 组件内的swiper高度自适应问题
    let index = this.data.activeTab;
    let queryDom = wx.createSelectorQuery()
    queryDom.select('.tab-content-' + index).boundingClientRect().exec(rect => {
      console.log(rect[0])
      this.setData({
        tabSwiperHeight: rect[0].height
      })
    })
  },
  // tabs 相关 end

  onGetUserInfo: function(e) {
    if (!this.data.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    app.wxLogin().then(res => {
      wx.navigateTo({
        url: '../userConsole/userConsole',
      })
    }, err => {
      console.error('[云函数] [login] 调用失败', err)
      wx.navigateTo({
        url: '../deployFunctions/deployFunctions',
      })
    });
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
