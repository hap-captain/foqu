// miniprogram/pages/mine/suggest/suggest.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    xiaoU:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20210606162224.jpg?sign=14a337f71680bf87560fcab4a38cc34d&t=1622967844',
    gonzonhao:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20210606201214.jpg?sign=4016299be6b73348b8e56b1fdf2dd532&t=1622981569',
    shipinhao:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/%E5%BE%AE%E4%BF%A1%E5%9B%BE%E7%89%87_20210606162912.jpg?sign=57e6cfabdc4d595277dcc718ff060f4d&t=1622968164'

  },

  /**
   * 生命周期函数--监听页面加载
   */

  previewImage: function (e) {
    console.log('浏览图片',e.target.dataset.src)
    var current = e.target.dataset.src;
    wx.previewImage({
      current:current, // 当前显示图片的http链接
      urls:[current] // 需要预览的图片http链接列表
    })
  },
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