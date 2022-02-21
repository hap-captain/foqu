const db = wx.cloud.database();
const app = getApp()
var listLenFind = 0;
Page({
  data: {
    navState: 0,//导航状态
    place1:[],
    place2:[]
  },
  //监听滑块
  bindchange(e) {
    let index = e.detail.current;
    this.setData({
      navState:index
    })
  },
  //点击导航
  navSwitch: function(e) {

    let index = e.currentTarget.dataset.index;
    this.setData({
      navState:index
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    this.getPlace1Data()
    this.getPlace2Data()
  },
  onPullDownRefresh: function () {
    this.getPlace1Data()
    this.getPlace2Data()
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'none',
      duration: 800
    })
  },
  onShareAppMessage: function () {
    return {
      title: '佛科院机构介绍【佛趣】',
      path: ''
    }
  },
  getPlace1Data()
  {
      db.collection('organ').where({place:"校级"})
      .get()
      .then(res=>{
        this.setData({
          place1:res.data
        })
      })
  },
  getPlace2Data()
  {
      db.collection('organ').where({place:"院级"})
      .get()
      .then(res=>{
        this.setData({
          place2:res.data
        })
      })
  },
  inDetail(e)
  {
    var index=e.currentTarget.dataset.index
    var id=e.currentTarget.dataset.id
    if(this.data.navState==0)
    {
      if(this.data.place1[index].essay)
      {
        if(this.data.place1[index].essay.length==1)
        {
          wx.showLoading({
            title: '马上就来啦~',
          })
          var id=this.data.place1[index].essay[0]
          db.collection('essay').doc(id)
          .get()
          .then(res=>{
            wx.navigateTo({
              url: '../../index/essay/essay?url='+res.data.url,
            })
            wx.hideLoading({})
          })
        }
        else
        {
          wx.navigateTo({
            url: 'detailPage/detailPage?id='+id,
          })
        }
        
      }
      else
      {
        wx.navigateTo({
          url: 'detailPage/detailPage?id='+id,
        })
      }
    }
    if(this.data.navState==1)
    {
      if(this.data.place2[index].essay)
      {
        wx.showLoading({
          title: '马上就来啦~',
        })
        var id=this.data.place2[index].essay[0]
        db.collection('essay').doc(id)
        .get()
        .then(res=>{
          wx.navigateTo({
            url: '../../index/essay/essay?url='+res.data.url,
          })
          wx.hideLoading({})
        })
      }
      else
      {
        wx.navigateTo({
          url: 'detailPage/detailPage?id='+id,
        })
      }
    }
  }
})
