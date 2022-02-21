// miniprogram/pages/side/club/detailPage/detailPage.js
const db = wx.cloud.database();
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {

    connent:{},
    id:'',
    essay:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.id=options.id
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
      essay:[]
    })
    this.getData()
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'none',
      duration: 800
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
    return {
      title: this.data.connent.name,
      path: ''
    }
  },
  getData()
  {
    var that=this
    db.collection('organ').doc(this.data.id)
    .get()
    .then(res=>{
      this.setData({
        connent:res.data
      })
      try
      {
        if(res.data.essay.length)
      {
        that.getEssay(res.data.essay)
      }
      }
      catch
      {

      }
    })
  },
  getEssay(id)
  {
    console.log('essayid==',id.length)
    for(var i=0;i<id.length;i++)
    {
      var currentId=id[i]
      db.collection('essay').doc(currentId)
      .get()
      .then(res=>{
        var oldData = this.data.essay;
        var newData = oldData.concat(res.data);
        this.setData({
          essay:newData
        })
        console.log('文章列表',this.data.essay)
      })
    }
  },
  previewImage: function (e) {
    console.log('浏览图片',e.target.dataset.src)
    var current = e.target.dataset.src;
    wx.previewImage({
      current:current, // 当前显示图片的http链接
      urls:[current] // 需要预览的图片http链接列表
    })
  },
  inEssay(e)
  {
    console.log("进入文章详情页")
    var url=e.currentTarget.dataset.url
    wx.navigateTo({
      url: '../../../index/essay/essay?url='+url,
    })
    
  }
})