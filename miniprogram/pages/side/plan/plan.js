// pages/plan/plan.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
   schoolPlan:'cloud://fosusquare-9gwq61i6a0c9d216.666f-fosusquare-9gwq61i6a0c9d216-1305659720/system/校历.jpg',
   time:'cloud://fosusquare-9gwq61i6a0c9d216.666f-fosusquare-9gwq61i6a0c9d216-1305659720/system/微信图片_20210606142743.png'
  },

  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current:current, // 当前显示图片的http链接
      urls:[current] // 需要预览的图片http链接列表
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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

  }
})