// miniprogram/pages/side/fans/fans.js

const db = wx.cloud.database()
const _ = db.command
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

    fans:[],
    havePic:false,
    isFollow:false,//是否已关注当前用户
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getData()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    this.setData({
      fans:[]
    })
    this.getData()
    wx.showToast({
      title: '已刷新',
      icon: 'success',
      duration: 1000//持续的时间
    })
    wx.stopPullDownRefresh({})
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  inPersonPage: function (e) {
    wx.navigateTo({
      url: '/pages/personPage/personPage?openid=' + e.currentTarget.dataset.openid
    })
  },
  getData()
  {
    wx.showLoading({
      title: '',
    })
    db.collection('usersInfformation').where({
      _openid: wx.getStorageSync('openid')
    })
    .get()
    .then(res=>{
      try
      {
        var fansList=res.data[0].userinfo.fans
        if(fansList.length==0)
        {
          this.setData({
            havePic:true
          })
        }
          for(var i=0;i<fansList.length;i++)
          {
            db.collection('usersInfformation').where({_openid:fansList[i]})
              .get()
              .then(res => {
                var oldData = this.data.fans;
                var newData = oldData.concat(res.data);
                this.setData({
                  fans: newData
                })
            })
          }
      }
      catch
      {

      }
      wx.hideLoading({
        success: (res) => {
        },
      })
    })
  },

  //添加关注
 follow(e){
  var openid=e.currentTarget.dataset.openid
  let f = wx.getStorageSync('myFollow')
  if(f =='' || f.length == 0){
    wx.setStorageSync('myFollow', [this.data.content._openid])
  }
  else{
    f = f.concat(this.data.content._openid)
    wx.setStorageSync('myFollow', f)
  }

  wx.showLoading({
    title: '',
  })
  db.collection('usersInfformation')
  .where({
    _openid:this.data.content._openid
  })
  .get()
  .then(res=>{
    var signature=res.data[0].signature
    let author = {
      openid:this.data.content._openid,
      name:this.data.content.dynamic.author.name,
      avatarPic:this.data.content.dynamic.author.avatarPic,
      signature:signature
    }

    db.collection('usersInfformation').where({
      _openid: wx.getStorageSync('openid'),
     'userinfo.myFollow': _.all([
       _.elemMatch({
         openid: this.data.content._openid
       }),
     ]),
   })
   .get().then(res=>{
     if(res.data.length==0){
       db.collection('usersInfformation').where({
           _openid:wx.getStorageSync('openid')
         })
         .update({
           data: {
             userinfo:{
               myFollow:_.unshift([author])
             }
           }
         })
         .then(res=>{
           this.setData({
             isFollow: true
           })
           wx.showToast({
             title: '已关注',
           })
         })
         wx.hideLoading({})
     }
     else{
       this.setData({
         isFollow: true
       })
       wx.showToast({
         title: '已关注过',
       })
     }
     //被关注者的个人信息要记录关注者的openid
     db.collection('usersInfformation').where({
       _openid: this.data.content._openid
     }).update({
       data: {
         userinfo:{
           fans:_.unshift(wx.getStorageSync('openid'))
         }
         }
     }).then(res=>{
     })
   }) 
  })

 },

   //取消关注
 cancelFollow(){
  let f = wx.getStorageSync('myFollow')
  let index = f.indexOf(this.data.content._openid)
  if(index > -1){
    f.splice(index,1)
  }
  wx.setStorageSync('myFollow', f)
  db.collection('usersInfformation').where({
    _openid: wx.getStorageSync('openid')
  }).update({
    data: {
      'userinfo.myFollow': _.pull({
        openid:this.data.content._openid
      })
    }
  }).then(res=>{
    wx.showToast({
      title: '已取消关注',
    })
    this.setData({
      isFollow: false
    })
  })
  //也要在被关注者个人信息中删除关注者的openid
  db.collection('usersInfformation').where({
    _openid: this.data.content._openid
  }).update({
    data: {
      'userinfo.fans': _.pull(_.in([wx.getStorageSync('openid')]))
    }
  }).then(res=>[
  ])
  //也要在被关注者的动态中删除关注者的openid
  db.collection('dynamic').where({
    _openid:this.data.content._openid,
    'dynamic.fansOpenid': wx.getStorageSync('openid')
  }).update({
    data: {
      'dynamic.fansOpenid': _.pull(wx.getStorageSync('openid'))
    }
  }).then(res=>{
  })
 },
})