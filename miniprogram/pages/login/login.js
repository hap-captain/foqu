// pages/login/login.js

const app = getApp()
const db = wx.cloud.database()
const _ = db.command
Page({

  data: {
    userInfo:{}
  },
  onLoad: function (options) {

  },
  backToIndex(){
    wx.reLaunch({
      url: '/pages/index/index'
    })
   
  },
  //获取用户微信信息
  getUserProfile(e) {
    wx.getUserProfile({
      desc: '用于完善用户资料', 
      success: (res) => {
        wx.showLoading({
          title: '注册中...',
          mask:true
        })
        var userinfo={}
        userinfo.name=res.userInfo.nickName
        userinfo.avatarPic=res.userInfo.avatarUrl
        userinfo.sex=''
        this.data.userInfo=userinfo
        this.pushUserInfoData(userinfo);
      }
    })
  },

   //上传数据并把数据写入缓存
   pushUserInfoData(userinfo)
   {
     var that=this
     db.collection('usersInfformation').add({
       data:{
         userinfo: {
           ifStudent:'未认证',
           avatarPic:userinfo.avatarPic,
           name:userinfo.name,
           sex:userinfo.sex,
           grade:'',
           department:'',
           class:'',
           place:'',
           fans:[],
           myFollow:[]
         },
         signature:'',
         imgList:[],
         loginTime:new Date(),
       },
       
     })
     .then(res => {
     //个人信息写入缓存
     wx.setStorageSync('userInformation',this.data.userInfo)
     app.ifLogin=true
     //创建消息数据
     that.addMessage()
     })
   },
  addMessage()
  {
    db.collection('message').add({
      data:{
        praise:[],
        comment:[],
        system:[]
      }
    }).then(res=>{
      db.collection('system').doc('cbddf0af60a9ca630abe69a81b90ddb0').get()
      .then(res=>{
        var systemMassage=res.data
        console.log("systemMassage",systemMassage)
        db.collection('message').where({
          _openid : wx.getStorageSync('openid')
        })
        .update({
          data:{
            system:
            _.unshift([systemMassage])
          }
        })
      })
      wx.hideLoading({})
      wx.showToast({
        title: '注册成功！',
        duration: 2000
      });
      setTimeout(() => {
        wx.navigateBack({
          delta: 0,
        })
      }, 2000);
    })
  },
 
  onReady: function () {

  },

  onShow: function () {

  },

  onHide: function () {

  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  }
})