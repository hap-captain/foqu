// miniprogram/pages/side/map/map.js
import util from '../../../utils/util';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picList:[
      {
        place:'江湾校区',
        src:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/a0d4c178dd703f4bd1060a4dbfe1e24.png?sign=c2006be8607cafdde045adf00b5c6b1a&t=1627721151',
        imagewidth:0,
        imageheight:0,
      },
      {
        place:'仙溪北区',
        src:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/%E4%BB%99%E6%BA%AA%E5%8C%97%E5%8C%BA.png?sign=7dec4c8fe40c34d1c8fff384c340777b&t=1627722305',
        imagewidth:0,
        imageheight:0,
      },
      {
        place:'仙溪南区',
        src:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/%E4%BB%99%E6%BA%AA%E5%8D%97%E5%8C%BA%20(1).png?sign=ec6834385dbf7b89c4e7122047a07744&t=1627722325',
        imagewidth:0,
        imageheight:0,
      },
      {
        place:'河滨校区',
        src:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/%E6%B2%B3%E6%BB%A8%E6%A0%A1%E5%8C%BA.jpg?sign=e8e1de6533e9fd8eacd7c1d696e0948c&t=1627722340',
        imagewidth:0,
        imageheight:0,
      },

    ]
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
    return {
      title: '快来看看佛大校园地图',
      query: {
        key: value
      },
      imageUrl: ''
    }
  },
  
  imageLoad: function (e) {
    wx.showLoading({
      title: '',
    })
    var imageSize = util.imageUtil(e)
    var index=e.currentTarget.dataset.index
    var picList=this.data.picList
    picList[index].imagewidth=imageSize.imageWidth;
    picList[index].imageheight=imageSize.imageHeight
    this.setData({
      picList:picList
    })
    wx.hideLoading({})
  },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current:current, // 当前显示图片的http链接
      urls:[current] // 需要预览的图片http链接列表
    })
  },
})