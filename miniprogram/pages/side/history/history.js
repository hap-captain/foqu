// miniprogram/pages/personPage/personPage.js
const db = wx.cloud.database();
const app = getApp()
var listLenFind = 0;
Page({
  data: {
    userinfo: {},
    persionOpenid:wx.getStorageSync('openid'),
    historyDymaic:[],
    CustomBar: app.globalData.CustomBar,
    selectDele:false
  },

 
  onLoad: function (options) {
    this.getUserInfo();
    this.getHistoryDymaic();
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
      historyDymaic:[]
    })
    this.getHistoryDymaic(6,0);
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'none',
      duration: 800
    })
  },

  onReachBottom: function () {
    var page = this.data.historyDymaic.length;
    if (listLenFind != page) {
      this.getHistoryDymaic(6, page)
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
  getUserInfo(){
    db.collection("usersInfformation").where({
      _openid:this.data.persionOpenid
    }).get()
    .then(res=>{
      this.setData({
        userinfo:res.data[0]
      })
    })
  },
  getHistoryDymaic(num =6, page = 0){
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'getIndexData',
      data: {
        num: num,
        plate: 4,
        page: page,
        persionOpenid:this.data.persionOpenid
      }
    })
    .then(async res=>{
      var oldData = this.data.historyDymaic;
      var newData = oldData.concat(res.result.data);
      var that=this;
      var dataWithNUm=await that.commentNum(newData)
      listLenFind = oldData.length;
      this.setData({
        historyDymaic: dataWithNUm
      })
     wx.hideLoading({
       success: (res) => {},
     })
    })
  },
  //计算评论总数
 async commentNum(newComment){
  for(var i=0;i<newComment.length;i++)
  {
    if(newComment[i].dynamic.comment.length==0)
      {
        newComment[i].commentNum=0
      }
      else{
        var huifuListNum=0;
        for(var j=0;j<newComment[i].dynamic.comment.length;j++)
        {
          huifuListNum+=newComment[i].dynamic.comment[j].huifuList.length
        }
        newComment[i].commentNum=newComment[i].dynamic.comment.length+huifuListNum;
      }
  }
  return newComment
  },
  //进入详情页
  inDetail: function (e) {
    var connent=JSON.stringify(this.data.historyDymaic[e.currentTarget.dataset.index]);
    wx.navigateTo({
      url: '../../detailPage/detailPage?id=' + e.currentTarget.dataset.id + '&openid=' + this.data.persionOpenid+"&connent="+connent,
    })
  },
  deleteBtn()
  {
    if(this.data.selectDele)
    {
      this.setData({
        selectDele:false
      })
    }
    else
    {
      this.setData({
        selectDele:true
      })
    }
  },
  selectBtn(e){
    var that=this;
    wx.showModal({
      title:'删除',
      content: '确定要删除这条动态吗？',
    }).then(res=>{

      if(res.confirm)
      {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000
        })
        db.collection("dynamic").doc(e.currentTarget.dataset.id)
        .remove()
        .then(res=>{
         that.setData({
          historyDymaic:[],
          selectDele:false
         })
         this.getHistoryDymaic();
        })
      }
      else
      {
        this.setData({
          selectDele:false
        })
      }
     
    })
  },
  deleteHistory(e)
  {
    var that=this;
    wx.showModal({
      title:'删除',
      content: '确定要删除这条动态吗？',
    }).then(res=>{

      if(res.confirm)
      {
        wx.showToast({
          title: '删除成功',
          icon: 'success',
          duration: 2000
        })
        db.collection("dynamic").doc(e.currentTarget.dataset.id)
        .remove()
        .then(res=>{
         that.setData({
          historyDymaic:[],
         })
         this.getHistoryDymaic();
        })
      }
      else
      {
        
      }
     
    })
  }
})