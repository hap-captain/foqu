const db = wx.cloud.database()
const _ = db.command
const app = getApp()
Page({

  data: {
    followList:[],
    CustomBar: app.globalData.CustomBar,
    havePic:false,
  },

  inPersonPage: function (e) {
    wx.navigateTo({
      url: '/pages/personPage/personPage?openid=' + e.currentTarget.dataset.openid
    })
  },
  cancelFollow(e){
    let that = this
    wx.showModal({
      title: '提示',
      content: '确定取消关注吗？',
      success: function (res) {
        if (res.confirm) {//这里是点击了确定以后
          db.collection('usersInfformation').where({
            _openid: wx.getStorageSync('openid')
          }).update({
            data: {
              'userinfo.myFollow': _.pull({
                openid:e.currentTarget.dataset.openid
              })
            }
          }).then(res=>{
            wx.showToast({
              title: '已取消关注',
            })
            that.getFollowList()
            let f = wx.getStorageSync('myFollow')
            let index = f.indexOf(e.currentTarget.dataset.openid)
            if(index > -1){
            f.splice(index,1)
            }
            wx.setStorageSync('myFollow', f)
          })
          //也要在被关注者个人信息中删除关注者的openid
          db.collection('usersInfformation').where({
            _openid: e.currentTarget.dataset.openid
          }).update({
            data: {
              'userinfo.fans': _.pull(_.in([wx.getStorageSync('openid')]))
            }
          }).then(res=>[
          ])
          //也要在被关注者的动态中删除关注者的openid
          db.collection('dynamic').where({
            _openid:e.currentTarget.dataset.openid,
            'dynamic.fansOpenid': wx.getStorageSync('openid')
          }).update({
            data: {
              'dynamic.fansOpenid': _.pull( wx.getStorageSync('openid'))
            }
          }).then(res=>{
          })
        } else {//这里是点击了取消以后
        }
      }
    })
  },
  //获取关注列表
  getFollowList(){
    wx.showLoading({
      title: '',
    })
    db.collection('usersInfformation').where({
      _openid: wx.getStorageSync('openid')
    }).get().then(res=>{

      try
      {
        this.setData({
          followList:res.data[0].userinfo.myFollow
        })
  
        if(this.data.followList.length==0)
        {
          this.setData({
            havePic:true
          })
        }
      }
      catch
      {

      }
     
      wx.hideLoading({})
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getFollowList()
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
    this.getFollowList()
    wx.showToast({
      title: '已刷新',
      icon: 'success',
      duration: 1000//持续的时间
    })
    wx.stopPullDownRefresh({
      success: (res) => {},
    })
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

  }
})