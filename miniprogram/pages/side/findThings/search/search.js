const db=wx.cloud.database()
const _= db.command
Page({

  /**
   * 页面的初始数据
   */
  data: {
    findList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.searchData(options.inputValue)
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
  onShareAppMessage: function (e) {
    var id = e.target.dataset.id
    return {
      title: '救救孩子，我找不到它了^^',
      path: 'pages/side/findThings/findThings?id=' +id,
      imageUrl:e.target.dataset.src
    }
  },

  searchData(inputValue)
  { 
    const _ = db.command
   db.collection('findThings').where(_.or([
    {
      exit:true,
      detailInfo: db.RegExp({
        regexp: inputValue,
        //大小写不区分
        options: 'i',
       })
    },
    {
      exit:true,
      thingName: db.RegExp({
        regexp: inputValue,
        //大小写不区分
        options: 'i',
       })
    }
  ]))
  .get().then(res => {
    this.setData({
      findList:res.data
    })
  })
  },

  inDetail(e)
  {
    var id = e.currentTarget.dataset.id
    var item = JSON.stringify(e.currentTarget.dataset.item)
    var openid = e.currentTarget.dataset.openid
    wx.navigateTo({
      url: '../inDetail/inDetail?item='+item+'&id='+id+'&openid=' +openid,
    })
  },
    //预览图片
 previewImage: function (e) {
  var current = e.target.dataset.src;
  wx.previewImage({
    current: current, // 当前显示图片的http链接
    urls:  current// 需要预览的图片http链接列表
  })
},

})