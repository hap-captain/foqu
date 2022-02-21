// miniprogram/pages/side/club/club.js

const db = wx.cloud.database()
const _ = db.command
const app = getApp()
var listLenEssay=0
Page({

  data: {
    list:[],
  },

  onLoad: function (options) {
  this.setData({
    list:[]
  })
  this.getTitleData(15, 0)
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
      list: []
    })
    this.getTitleData(15, 0);
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 800
    })
  },

  onReachBottom: function () {

    var page = this.data.list.length
      if (listLenEssay != page) {
        this.getTitleData(10, page)
      }
      else {
        wx.showToast({
          title: '我也是有底线的！',
          icon: 'none'
        })
      }
  },

  onShareAppMessage: function () {

  },

  //加载同乡会数据
  getTitleData(num = 15, page = 0) {
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'getIndexData',
      data: {
        num: num,
        plate: 10,
        page: page
      }
    }).then(async res => {
      var oldData = this.data.list;
      var newData = oldData.concat(res.result.data);
      var that = this;
      listLenEssay = oldData.length;
      this.setData({
        list: newData
      })
      wx.hideLoading({})
    })
  },
  inEssay(e)
  {
    var index=e.currentTarget.dataset.index
    var id=e.currentTarget.dataset.id
    var connent = JSON.stringify(this.data.list[index]);
    wx.navigateTo({
      url: 'detailPage/detailPage?id='+id+'&connent='+connent
    })
  },


})