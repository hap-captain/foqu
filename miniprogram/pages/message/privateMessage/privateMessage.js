const app = getApp()

Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: null,
    logged: false,
    takeSession: false,
    requestResult: '',
    collection: 'privateMessage',
    groupId: 'null',
    groupName: 'null',
    // functions for used in chatroom components
    onGetUserInfo: null,
    getOpenID: null,
    //NEWADD
    receiverInfo:null,
    receiverName:"null",
    receiverAvatar:"null"
  },

  onLoad: function(options) {
    var that = this
    // 获取用户信息
    if (wx.getStorageSync('userInformation') != '') {
      const userInformation =  wx.getStorageSync('userInformation')
      this.setData({
        userInfo: userInformation
      })
    }
    this.setData({
      onGetUserInfo: this.onGetUserInfo,
      getOpenID: this.getOpenID,
    })
    if(options.receiverInfo)
    {
       let receiverInfo = JSON.parse(options.receiverInfo)
       that.setData({
          receiverInfo:receiverInfo,
          receiverName:receiverInfo.userinfo.name,
          groupName:receiverInfo.userinfo.name
       })
       that.getGroupId()
    }else{
      let privateMessage = JSON.parse(options.privateMessage)
      if(privateMessage.sendOpenid == that.data.userInfo._openid) //判断收发对象来定义窗口名
      {
        var groupName = privateMessage.receiverNickName
        var receiverAvatar= privateMessage.receiverAvatar
      }
      else{
        var groupName = privateMessage.sendNickName
        var receiverAvatar= privateMessage.sendAvatar
      }
      that.setData({
        receiverAvatar,
        receiverName:groupName,
        groupName:groupName,
        groupId:privateMessage.groupId
     })
     
    }


//获取设备信息
    wx.getSystemInfo({
      success: res => {
        if (res.safeArea) {
          const { top, bottom } = res.safeArea
          this.setData({
            containerStyle: `padding-top: ${(/ios/i.test(res.system) ? 10 : 20) + top}px; padding-bottom: ${5 + res.windowHeight - bottom}px`,
          })
        }
      },
    })
  },

  getOpenID: async function() {
    if (this.openid) {
      return this.openid
    }

    const { result } = await wx.cloud.callFunction({
      name: 'login',
    })

    return result.openid
  },

  onGetUserInfo: function(e) {
    console.log("e.detail.userInfo",e.detail.userInfo)
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  getGroupId: function() {
    this.data.openid = wx.getStorageSync('openid')
     //进行groupId的生成，小的Openid接在后面
     if(this.data.groupId == 'null')
     {
       //生成groupId
        if(this.data.openid > this.data.receiverInfo._openid)
        {
        var groupId = this.data.openid + this.data.receiverInfo._openid
        }else{
           var groupId = this.data.receiverInfo._openid + this.data.openid
        }
       this.setData({
         groupId:groupId,
       })
     }
     else{
     }
 
   },
})
