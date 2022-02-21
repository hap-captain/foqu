// pages/side/newStudent/newStudent.js

var listLenEssay = 0;
Page({

  data: {
    essay: [],
  },

  onLoad: function (options) {
   this.getTitleData()
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
  
      var page = this.data.essay.length
      if (listLenEssay != page) {
        this.getTitleData(5, page)
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
  getTitleData(num = 5, page = 0) {
    wx.cloud.callFunction({
      name: 'getIndexData',
      data: {
        num: num,
        plate: 6,
        page: page
      }
    }).then(async res => {
      var oldData = this.data.essay;
      var newData = oldData.concat(res.result.data);
      var that = this;
      listLenEssay = oldData.length;
      this.setData({
        essay: newData
      })
    })
  },
  inEssay(e)
  {
    var url=e.currentTarget.dataset.url
    wx.navigateTo({
      url: '../../index/essay/essay?url='+url,
    })
    
  },
   //进入机构
   inOrgan()
   {
    var that=this;
    that.setData({
      animation1: 'animation-scale-down'
    })
    setTimeout(function() {
      that.setData({
        animation1: ''
      })
      wx.navigateTo({
        url: '../organ/organ',
      })
    }, 600)
   },
    //进入社团
    inClub()
    {
      var that=this;
      that.setData({
        animation2: 'animation-scale-down'
      })
      setTimeout(function() {
        that.setData({
          animation2: ''
        })
        wx.navigateTo({
          url: '../club/club',
        })
      }, 600)
    },
    //进入同乡会
    inHometown()
    {
     var that=this;
     that.setData({
       animation3: 'animation-scale-down'
     })
     setTimeout(function() {
       that.setData({
         animation3: ''
       })
       wx.navigateTo({
         url: '../hometown/hometown',
       })
     }, 600)
    },
    //进入地图
    inMap()
    {
     var that=this;
     that.setData({
       animation4: 'animation-scale-down'
     })
     setTimeout(function() {
       that.setData({
         animation4: ''
       })
       wx.navigateTo({
         url: '../map/map',
       })
     }, 600)
    },
   
})