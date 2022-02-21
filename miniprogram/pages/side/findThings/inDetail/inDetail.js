
const db = wx.cloud.database()
const _ = db.command

Page({

  data: {
    detailData:{},
    openid:wx.getStorageSync('openid'),
    bgImage:''
  },


  onLoad: function (options) {
    var that = this
    var id = options.id
    try
    {
      var item = JSON.parse(options.item)
      that.setData({
        detailData:item,
      })
      wx.cloud.getTempFileURL({
        fileList: [{
          fileID: item.imgList[0],
          maxAge: 60 * 60, // one hour
        }]
      }).then(res => {
        that.setData({
          bgImage:res.fileList[0].tempFileURL
        }) 
      }).catch(error => {
        that.setData({
          detailData:item,
          bgImage:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/a2260996443198f8672e0237b1652d5.jpg?sign=e4d03a7233eb4426adb71ccfc3899681&t=1638102521'
        }) 
      })
    }
    catch
    {
      db.collection("findThings")
      .doc(id)
      .get()
      .then(res=>{
        that.setData({
          detailData:res.data,
        })
      })
    }
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

  },

  onReachBottom: function () {

  },

  onShareAppMessage: function () {

  },
  onClick(e) {
    var that = this;
    wx.setClipboardData({
      data: that.data.detailData.linkInfo,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
        });
      }
    });
  },
   //预览图片
 previewImage: function (e) {
  var current = e.target.dataset.src;
  wx.previewImage({
    current: current, // 当前显示图片的http链接
    urls:  current// 需要预览的图片http链接列表
  })
},

delete(e)
{
  var id = e.currentTarget.dataset.id
  wx.showModal({
    title: '提示',
    content: '确定要删除这个失物招领信息',
    success (res) {
    if (res.confirm) {
      db.collection("findThings")
      .doc(id)
      .update({
        data:{
          exit:false
        }
      })
      .then(res=>{
        wx.showToast({
          title: '删除成功',
          duration:1000
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 0,
          })
        }, 1000);
      })
    } else if (res.cancel) {
    
    }
    }
    })
  
},
finish(e)
{
  var id = e.currentTarget.dataset.id
  wx.showModal({
    title: '提示',
    content: '确定要把这个失物招领信息设为成功？',
    success (res) {
    if (res.confirm) {
      db.collection("findThings")
      .doc(id)
      .update({
        data:{
          finish:true
        }
      })
      .then(res=>{
        wx.showToast({
          title: '已设置为成功',
          duration:1000
        })
        setTimeout(() => {
          wx.navigateBack({
            delta: 0,
          })
        }, 1000);
      })
    } else if (res.cancel) {
    
    }
    }
    })
}
})