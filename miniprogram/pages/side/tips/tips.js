// miniprogram/pages/side/club/club.js

var listLenEssay=0
Page({

  data: {
    list:[
      {
        title:'佛趣的前世今生',
        url:'https://mp.weixin.qq.com/s/eQOIMmhUADwSW8pwVBi1oA'
      },
      {
        title:'课表',
        url:'https://mp.weixin.qq.com/s/jcL9SGTCoprKi8u-PofN4w'
      },
      {
        title:'空教室',
        url:'https://mp.weixin.qq.com/s/Z-9faVyfCl3fTCwqNUxl0g'
      },
      {
        title:'发布',
        url:'https://mp.weixin.qq.com/s/acN6BGTJ1alxjDKLxUuxWA'
      },
      {
        title:'搜索',
        url:'https://mp.weixin.qq.com/s/-Y5nMsVg7PorUQskCK8pug'
      },
      {
        title:'热榜',
        url:'https://mp.weixin.qq.com/s/IHMhYms8Cp7zMB2PFrPgHA'
      },
      {
        title:'删除动态',
        url:'https://mp.weixin.qq.com/s/2lQpZXDBtB4iCbiP8jfxkQ'
      },
    ],
  },

  onLoad: function (options) {
   

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
    this.setData({
      essay: []
    })
    this.getTitleData(5, 0);
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 800
    })
  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  },

  inEssay(e)
  {
    var url=e.currentTarget.dataset.link
    wx.navigateTo({
      url: '../../index/essay/essay?url='+url,
    })
    
  }
})