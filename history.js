// miniprogram/pages/mine/history/history.js

const app = getApp()
const db = wx.cloud.database()
var listLenHistory=0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    winWidth: 0,
    winHeight: 0,
    dynamic:[],
    scrollLeft: 0,
    index:null,
    status: true,//true为正常显示，false为显示删除按钮
    StatusBar: app.globalData.StatusBar,
    CustomBar: app.globalData.CustomBar,
    Custom: app.globalData.Custom,
  },

  onLoad: function (options) {
    this.getDynamic(11,0);
    var that = this;
    // 获取当前设备的宽高
    wx.getSystemInfo({
      success: function (res) {
 
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight * 5
        });
      }
    });
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
       dynamic:[]
     })
     this.getDynamic(11,0);
     wx.stopPullDownRefresh({})
     wx.showToast({
       title: '刷新成功',
       icon: 'none',
       duration: 800
     })
   },
   onReachBottom: function () {
    var page = this.data.dynamic.length;
    if (listLenHistory != page) {
      this.getDynamic(11,page)
    }
    else {
      wx.showToast({
        title: '没有更多了哦',
        icon: 'none'
      })
    }
   },
   onShareAppMessage: function () {
 
   },
  touchS(e) {
    // 获得起始坐标
    this.startX = e.touches[0].clientX;
    this.startY = e.touches[0].clientY;
  }, 
  touchM(e) {
    // 获得当前坐标
    this.currentX = e.touches[0].clientX;
    this.currentY = e.touches[0].clientY;
    const x = this.startX - this.currentX; //横向移动距离
    const y = Math.abs(this.startY - this.currentY); //纵向移动距离，若向左移动有点倾斜也可以接受
    if (x > 35 && y < 110) {
    //向左滑是显示删除
      this.setData({
        status: false
      })
    } else if (x < -35 && y < 110) {
    //向右滑
      this.setData({
        status: true
      })
    }
  },
   // ListTouch触摸开始
   ListTouchStart(e) {
    this.setData({
      ListTouchStart: e.touches[0].pageX
    })
  },

  // ListTouch计算方向
  ListTouchMove(e) {
    this.setData({
      ListTouchDirection: e.touches[0].pageX - this.data.ListTouchStart > 0 ? 'right' : 'left'
    })
  },

  // ListTouch计算滚动
  ListTouchEnd(e) {
    if (this.data.ListTouchDirection =='left'){
      this.setData({
        modalName: e.currentTarget.dataset.target
      })
    } else {
      this.setData({
        modalName: null
      })
    }
    this.setData({
      ListTouchDirection: null
    })
  },
  inDetail:function(e)
    {
      console.log("e===>",this.data.dynamic[e.currentTarget.dataset.index])
      var openid=this.data.dynamic[e.currentTarget.dataset.index]._openid;
      var connent=JSON.stringify(this.data.dynamic[e.currentTarget.dataset.index]);
      console.log("connent",connent)
        console.log('获取到的id',e.currentTarget.dataset.id)
        wx.navigateTo({
          url: '/pages/detailPage/detailPage?id='+e.currentTarget.dataset.id+"&connent="+connent +'&openid=' + openid,
        })
    },
     //获取动态信息
  getDynamic(num = 11, page = 0){
   wx.cloud.callFunction({
    name: 'getIndexData',
    data: {
      num: num,
      plate: 3,
      page: page
    }
   }).then(res=>{
    var oldData = this.data.dynamic;
    var newData = oldData.concat(res.result.data);
    listLenHistory = oldData.length;
    this.setData({
      dynamic: newData
    })
   })
  },
  //长按删除
  deledynamic(e)
  {
    console.log('点击删除了')
    var that=this;
    wx.showModal({
      cancelColor: 'cancelColor',
      title:'删除',
      content: '确定要删除这条动态吗？',
      cancelText: '再看看',
      confirmText: '再见',
    }).then(res=>{

      if(res.confirm)
      {
        db.collection("dynamic").doc(e.currentTarget.dataset.id)
        .remove()
        .then(res=>{
         that.setData({
           dynamic:[]
         })
          this.getDynamic()
        })
      }
      else
      {

      }
     
    })
  },
  //删除按钮
  selectBtn(e){
    var that=this;
    wx.showModal({
      cancelColor: 'cancelColor',
      title:'删除',
      content: '确定要删除这条动态吗？',
      cancelText: '再看看',
      confirmText: '再见',
    }).then(res=>{

      if(res.confirm)
      {
        db.collection("dynamic").doc(e.currentTarget.dataset.id)
        .remove()
        .then(res=>{
         that.setData({
           dynamic:[]
         })
          this.getDynamic()
        })
      }
      else
      {

      }
     
    })
  },
  
})