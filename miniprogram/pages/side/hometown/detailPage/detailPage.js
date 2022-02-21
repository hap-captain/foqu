// miniprogram/pages/side/hometown/detailPage/detailPage.js
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    connent:{},
    id:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.id=options.id
    var that=this
    try {
      var connent=JSON.parse(options.connent)
      console.log('zhixa')
      that.setData({
        connent:connent,
        id:options.id
      })
   } catch (error) {
    that.getDetailData()
   }
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
  getDetailData()
  {
    db.collection("hometown").doc(this.data.id)
    .get()
    .then(res=>{
      this.setData({
        connent:res.data
      })
      console.log("res.data",res.data)
    })
  },
  
  previewImage: function (e) {
    console.log('浏览图片',e.target.dataset.src)
    var current = e.target.dataset.src;
    wx.previewImage({
      current:current, // 当前显示图片的http链接
      urls:[current] // 需要预览的图片http链接列表
    })
  },
})