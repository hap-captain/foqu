// miniprogram/pages/personPage/personPage.js
const app = getApp()
const db = wx.cloud.database();
const _ = db.command
var listLenFind = 0;
Page({

  
  data: {
    myOpenid:wx.getStorageSync('openid'),
    CustomBar: app.globalData.CustomBar,
    userinfo: {},
    persionOpenid:"",
    historyDymaic:[],
    isFollow:false
  },

 
  onLoad: function (options) {
    this.setData({
      persionOpenid:options.openid
    })
    if(wx.getStorageSync('myFollow').indexOf(options.openid) > -1){//新增，判断是否已关注当前用户

      this.setData({
        isFollow: true
      })
    }
    this.getUserInfo();
    this.getHistoryDymaic();
  },

  //判断是否已关注当前用户
  async checkFollow(){
    
  },
  //添加关注
  follow(){
    let f = wx.getStorageSync('myFollow')
    if(f =='' || f.length==0){
      wx.setStorageSync('myFollow', [this.data.persionOpenid])
    }
    else{
      f = f.concat(this.data.persionOpenid)
      wx.setStorageSync('myFollow', f)
    }
    let author = {
      openid:this.data.persionOpenid,
      name:this.data.userinfo.userinfo.name,
      avatarPic:this.data.userinfo.userinfo.avatarPic,
      signature:this.data.userinfo.signature,
    }
     db.collection('usersInfformation').where({
       _openid: wx.getStorageSync('openid'),
      'userinfo.myFollow': _.all([
        _.elemMatch({
          openid: this.data.persionOpenid
        }),
      ]),
    })
    .get().then(res=>{
      if(res.data.length==0){
        db.collection('usersInfformation').where({
            _openid:wx.getStorageSync('openid')
          })
          .update({
            data: {
              userinfo:{
                myFollow:_.unshift([author])
              }
            }
          })
          .then(res=>{
            this.setData({
              isFollow: true
            })
            wx.showToast({
              title: '已关注',
            })
          })
          //被关注者的个人信息要记录关注者的openid
        db.collection('usersInfformation').where({
          _openid: this.data.persionOpenid
        }).update({
          data: {
            userinfo:{
              fans:_.unshift(wx.getStorageSync('openid'))
            }
            }
        }).then(res=>{
        })
      }
      else{
        this.setData({
          isFollow: true
        })
        wx.showToast({
          title: '已关注过',
        })
      }
    })
   },
  
   //取消关注
 cancelFollow(){
  let f = wx.getStorageSync('myFollow')
  let index = f.indexOf(this.data.persionOpenid)
  if(index > -1){
    f.splice(index,1)
  }
  wx.setStorageSync('myFollow', f)
  db.collection('usersInfformation').where({
    _openid: wx.getStorageSync('openid')
  }).update({
    data: {
      'userinfo.myFollow': _.pull({
        openid:this.data.persionOpenid
      })
    }
  }).then(res=>{
    wx.showToast({
      title: '已取消关注',
    })
    this.setData({
      isFollow: false
    })
  })
  //也要在被关注者个人信息中删除关注者的openid
  db.collection('usersInfformation').where({
    _openid: this.data.persionOpenid
  }).update({
    data: {
      'userinfo.fans': _.pull(_.in([wx.getStorageSync('openid')]))
    }
  }).then(res=>[
  ])
  //也要在被关注者的动态中删除关注者的openid
  db.collection('dynamic').where({
    _openid:this.data.persionOpenid,
    'dynamic.fansOpenid': wx.getStorageSync('openid')
  }).update({
    data: {
      'dynamic.fansOpenid': _.pull( wx.getStorageSync('openid'))
    }
  }).then(res=>{
  })
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
      url: '../detailPage/detailPage?id=' + e.currentTarget.dataset.id + '&openid=' + this.data.persionOpenid+"&connent="+connent,
    })
  },
  //发送私信 跳转页面
  sentPrivateMessage(){
      var receiverInfo=JSON.stringify(this.data.userinfo);
    wx.navigateTo({
      url: '../message/privateMessage/privateMessage?receiverInfo='+receiverInfo,
    })

  },

  
})