//app.js
App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'testfosu-8gldhnb2685dc72f',
        traceUser: true
      })
    }
    this.refresh = false,
      this.hadLogin = false,
      this.loveinfo = "",
      this.ssinfo = {
        lovenb: "",
        plnb: "",
        looknb: ""
      },
      this.globalData = {
        myClass: "",            
        currentWeek: "",
        allCourseData: {},
        flushC: "",
        dotNum: '0' //记录消息红点数目
      }
    this.ifLogin = false //标记是否登陆

    const db = wx.cloud.database()
    //获取用户openid并检查是否已经登陆
    if (wx.getStorageSync('openid')) {
      db.collection('usersInfformation')
        .where({
          _openid: wx.getStorageSync('openid')
        })
        .get()
        .then(res => {
          if (res.data.length == 0) {//如果用户不存在则缓存中不因存在userInformation，用于删除用户
            wx.removeStorage({
              key: 'userInformation',
            }).then(res => { })
          }
          else {
            wx.setStorageSync('userInformation',res.data[0].userinfo)
            this.ifLogin = true
          }
        })
    }
    else {
      var that = this;
      wx.cloud.callFunction({
        name: 'login',
        data: {},
      }).then(res => {
        wx.setStorageSync('openid', res.result.openid)//将获取到的openid存入缓存
        this.ifLogin = false
      })

    }

    wx.getSystemInfo({
      success: e => {
        this.globalData.StatusBar = e.statusBarHeight;
        let custom = wx.getMenuButtonBoundingClientRect();
        this.globalData.Custom = custom;
        this.globalData.CustomBar = custom.bottom + custom.top - e.statusBarHeight;
        // 获取屏幕高度
        this.screenHeight = e.screenHeight
        // 获取状态栏高度
        this.statusBarHeight = e.statusBarHeight
        // 通过操作系统 确定自定义导航栏高度 
        if (e.system.substring(0, 3) == "iOS") {
          this.navBarHeight = 42
        } else {
          this.navBarHeight = 44
        }
      }
    })
  }
})
