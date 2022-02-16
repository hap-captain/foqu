// miniprogram/pages/mine/message/message.js

const db = wx.cloud.database()
const app = getApp()
var ret = {};//新增，保存从动态详情页返回后的对应动态的点赞状态和数量
var listLenFind = 0; //新增，记录关注动态列表的长度
Page({
  data: {
    index: 0,
    TabCur: 0,
    tabNav: [{title:'评论',DotNum:0},{title:'点赞',DotNum:0},{title:'系统',DotNum:0},{title:'私信',DotNum:0}],
    dynamicMessage:[],
    CustomBar: app.globalData.CustomBar,
    commentDotNum:0,
    praiseDotNum:0,
    systemDotNum:0,
    flag:false, //判断用户是否登陆
    PrivateDotNum:0,    //私信新增
    openid:"",           
  },
  onLoad: function (options) {
    var that=this;
    that.CheckIfLogin()
    this.setData({
      openid:wx.getStorageSync('openid')
    })
  },
  onReady: function () {
    this.watchPrivateMessage()  //私信监控
  },
  onShow: function () {
    var that=this;
    this.tabBar()
    this.CheckIfLogin()
    if(app.ifLogin)
    {
      that.getMessage()
    }
    else
    {
      that.loginWindow()
    }
  },
  onHide: function () {
  },
  onUnload: function () {
  },
  onPullDownRefresh: function () {//有改动
    this.onShow()
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'none',
      duration: 800
    })
  },
  //页面上拉触底事件的处理函数
  onReachBottom: function () {
    
  },
 //检查是否已经登陆
 CheckIfLogin() {
  if(wx.getStorageSync('userInformation')!= undefined){
    app.ifLogin=true
  }
  else{
    this.loginWindow()
  }
},
//登陆弹窗
loginWindow()
{
  wx.showModal({
    title:'提示',
    content:'登陆后查看消息，是否登陆？',
    success (res) {
     if (res.confirm) {
      wx.navigateTo({
        url: '../login/login',
      })
     } else if (res.cancel) {
      app.ifLogin = false
     }
    }
   })
},
  tabSelect(e) {
    // this.loadHotData();
    this.setData({
      TabCur: e.currentTarget.dataset.id,
    })
  },
  //获取所有消息
  getMessage(){
    var that=this;
    db.collection('message').where({
      _openid:wx.getStorageSync('openid') 
    })
    .get()
    .then(async res=>{
      this.setData({
        dynamicMessage:res.data[0],
      }) 
        await that.countCommentDots(res.data[0])
      
    })

    that.getPrivateMessage()   //获取私信
  },
   //获取私信
   getPrivateMessage(){

    var that=this;
    let openid = wx.getStorageSync('openid');
    db.collection("privateMessageList").where({                    
      groupId:{							          	//columnName表示欲模糊查询数据所在列的名
        $regex:'.*' + openid + '.*',		//queryContent表示欲查询的内容，‘.*’等同于SQL中的‘%’
        $options: 'i'							//$options:'1' 代表这个like的条件不区分大小写,详见开发文档
      }
    })
    .get()
    .then(async res=>{
      this.setData({
        privateMessage:res.data.sort((x, y) => y.sendTimeTS - x.sendTimeTS)
      })
    })
  },
  
//私信监听
 watchPrivateMessage()
 {
   var that = this
   let openid = this.data.openid
   db.collection("privateMessageList").where({
     groupId:{							          	//columnName表示欲模糊查询数据所在列的名
       $regex:'.*' + openid + '.*',		//queryContent表示欲查询的内容，‘.*’等同于SQL中的‘%’
       $options: 'i'							      //$options:'1' 代表这个like的条件不区分大小写,详见开发文档
     }
   }).watch({
       onChange:function (snapshot) {
         //监控数据发生变化时触发
         if(snapshot.type === 'init')
         {
           
         }
         else{
           that.setData({
             privateMessage:snapshot.docs.sort((x, y) => y.sendTimeTS - x.sendTimeTS)
           })
         }
       },
       onError:function(err){
         console.error("the watch ERROR",err)
       }
   })
 },

  //计算未读消息数量
 async countCommentDots(message){
  var commentDotNum=0
  var praiseDotNum=0
  var systemDotNum=0
  var i=0
  for(i=0;i<message.comment.length;i++)
  {
     if(message.comment[i].dot)
     {
      commentDotNum=commentDotNum+1
     }
  }
  for(i=0;i<message.praise.length;i++)
  {
     if(message.praise[i].dot)
     {
      praiseDotNum=praiseDotNum+1
     }
  }
  for(i=0;i<message.system.length;i++)
  {
     if(message.system[i].dot)
     {
      systemDotNum=systemDotNum+1
     }
  }
  this.setData({
    tabNav:[{title:'评论',DotNum:commentDotNum},{title:'点赞',DotNum:praiseDotNum},{title:'系统',DotNum:systemDotNum},{title:'私信',privateDotNum:0}],
   })
   var allDots = commentDotNum + praiseDotNum + systemDotNum;
   wx.setStorageSync('dotsNum', allDots.toString())
   if(wx.getStorageSync('dotsNum'))
   {
     if(wx.getStorageSync('dotsNum')!='0')
     {
      wx.setTabBarBadge({
        index: 2,
        text: wx.getStorageSync('dotsNum')
      })   
     }
     else
     {
       wx.removeTabBarBadge({
         index: 2,
       })
     }
   }
  },
  //清除所有消息
  deleAll(e)
  {
    var that=this;
    if(this.data.TabCur==0)
    {
      wx.showModal({
        title:'提示',
        content:'确定要清空评论消息列表？',
        success (res) {
         if (res.confirm) {
           db.collection("message").where({
             _openid:wx.getStorageSync('openid') 
           })
           .update({
               data:{
                 comment:[]
               }
             }).then(res=>{
               wx.showToast({
                 title: '已清空！',
               })
               that.getMessage();
             })
         } else if (res.cancel) {
         }
        }
       })
    }
    if(this.data.TabCur==1)
    {
      wx.showModal({
        title:'提示',
        content:'确定要清空点赞消息列表？',
        success (res) {
         if (res.confirm) {
           db.collection("message").where({
             _openid:wx.getStorageSync('openid') 
           })
           .update({
               data:{
                 praise:[]
               }
             }).then(res=>{
               wx.showToast({
                 title: '已清空！',
               })
               that.getMessage();
             })
         } else if (res.cancel) {
         }
        }
       })
    }
    if(this.data.TabCur==2)
    {
      wx.showModal({
        title:'提示',
        content:'确定要清空系统消息列表？',
        success (res) {
         if (res.confirm) {
           db.collection("message").where({
             _openid:wx.getStorageSync('openid') 
           })
           .update({
               data:{
                 system:[]
               }
             }).then(res=>{
               wx.showToast({
                 title: '已清空！',
               })
               that.getMessage();
             })
         } else if (res.cancel) {
         }
        }
       })
    }
     

  },
  //删除消息
   delMessage(e){
    var that=this;
    var index=e.currentTarget.dataset.index;
    if(e.currentTarget.dataset.type=="praise")
    {
      wx.showModal({
        title:'提示',
        content:'确定要删除此消息？',
        success (res) {
         if (res.confirm) {
           db.collection("message").where({
             _openid:wx.getStorageSync('openid') 
           }).get()
           .then(res=>{
             var message=res.data[0].praise;
             message.splice(index,1)
             db.collection("message").doc(res.data[0]._id).update({
               data:{
                 praise:message
               }
             }).then(res=>{
               wx.showToast({
                 title: '删除成功！',
               })
               that.getMessage();
             })
         
           })
         } else if (res.cancel) {
         }
        }
       })
    }
    if(e.currentTarget.dataset.type=="comment")
    {
      wx.showModal({
        title:'提示',
        content:'确定要删除此消息？',
        success (res) {
         if (res.confirm) {
           db.collection("message").where({
             _openid:wx.getStorageSync('openid') 
           }).get()
           .then(res=>{
             var message=res.data[0].comment;
             message.splice(index,1)
             db.collection("message").doc(res.data[0]._id).update({
               data:{
                 comment:message
               }
             }).then(res=>{
               wx.showToast({
                 title: '删除成功！',
               })
               that.getMessage();
             })
         
           })
         } else if (res.cancel) {
         }
        }
       })
    }
    },
  //进入详情页
  inMessagePage(e){
    var index=e.currentTarget.dataset.index
    this.changeSystemDot(index)
    var message=JSON.stringify(this.data.dynamicMessage.system[index]);
    wx.navigateTo({
      url: '../message/messagePage/messagePage?message='+message,
    })
  },
  //改变提示阅读的红点状态(点赞)
  changePraiseDot(index){
  db.collection('message')
  .where({
    _openid:wx.getStorageSync('openid'),
  })
  .update({
    data:{
      praise:{
        [index]:{
          dot:false
        }
      }
    }
  })
  .then(res=>{
  })
  },
  //改变提示阅读的红点状态(评论)
  changeMessageDot(index){
    db.collection('message')
  .where({
    _openid:wx.getStorageSync('openid'),
  })
  .update({
    data:{
      comment:{
        [index]:{
          dot:false
        }
      }
    }
  })
  .then(res=>{
  })
    },
  //改变提示阅读的红点状态(系统消息)
  changeSystemDot(index){
    db.collection('message')
  .where({
    _openid:wx.getStorageSync('openid'),
  })
  .update({
    data:{
      system:{
        [index]:{
          dot:false
        }
      }
    }
  })
  .then(res=>{
  })
    },
  //进入私信页面
  inPrivateMessagePage(e){
    var index = e.currentTarget.dataset.index
    var privateMessage = JSON.stringify(this.data.privateMessage[index]);   //this.data.dynamicMessage.system[index]
    wx.navigateTo({
      url: '../message/privateMessage/privateMessage?privateMessage='+privateMessage,
    })
  },

  //进入个人主页
  inPersonPage(e){
    wx.navigateTo({
      url: '../personPage/personPage?openid=' + e.currentTarget.dataset.openid,
    })
  },
  //进入动态详情页
  async navigation(e){
    var content={};
    
    if(this.data.TabCur==0)
    {
    this.changeMessageDot(e.currentTarget.dataset.index)
    var contentId=this.data.dynamicMessage.comment[e.currentTarget.dataset.index].contentId
    try {
      await db.collection('dynamic').doc(contentId)
      .get()
      .then( res=>{
        content= res.data
      })
      var connent=JSON.stringify(content);
      wx.navigateTo({
        url: '../detailPage/detailPage?id=' + contentId +"&connent="+connent,
      })
    }
    catch (error)
    {
     wx.showToast({
       title: '该动态已不存在',
       icon:'none',
       duration: 2000
     })
    }

    }
    if(this.data.TabCur==1)
    {
    this.changePraiseDot(e.currentTarget.dataset.index)
    var contentId=this.data.dynamicMessage.praise[e.currentTarget.dataset.index].dynamicId

     try {
      await db.collection('dynamic').doc(contentId)
      .get()
      .then( res=>{
        content= res.data
      })
      var connent=JSON.stringify(content);
      wx.navigateTo({
        url: '../detailPage/detailPage?id=' + contentId +"&connent="+connent,
      })
    }
    catch (error)
    {
     wx.showToast({
       title: '该动态已不存在',
       icon:'none',
       duration: 2000
     })
    }

    }
   
  },
  //删除系统消息
  delSystemMessage(e){
    var that=this;
    var index=e.currentTarget.dataset.index;
      wx.showModal({
        title:'提示',
        content:'确定要删除此消息？',
        success (res) {
         if (res.confirm) {
           db.collection("message").where({
             _openid:wx.getStorageSync('openid') 
           }).get()
           .then(res=>{
             var message=res.data[0].system;
             message.splice(index,1)
             db.collection("message").doc(res.data[0]._id).update({
               data:{
                 system:message
               }
             }).then(res=>{
               wx.showToast({
                 title: '删除成功！',
               })
               that.getMessage();
             })
         
           })
         } else if (res.cancel) {
         }
        }
       })
  },
  //自定义tabbar
  tabBar(){
    if(typeof this.getTabBar === 'function' && this.getTabBar()){
      this.getTabBar().setData({
        selected:3
      })
    }
  }
})