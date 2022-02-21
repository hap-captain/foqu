// miniprogram/pages/detailPage/detailPage.js

const db = wx.cloud.database()
const _ = db.command
const app = getApp()

var login = true;
 //评论下标
 var commentListIndex=null;
 var comment={};
 var commentListLen = 0;
 var ret = {
  index:'', love:'',
};
Page({

  /**
   * 页面的初始数据
   */
  data: {
    warnText:'',
    openClose:false,
    placeholder:"写下你善意的回复",
    commentList:[],
    commenter: {},
    toCommenter:{},
    authorOpenid: '',
    id: 0,
    content:{},
    inputData: '',
    searchinput: '',
    hiddenmodalput: true,
    commentNum:0,
    commentTime:'',//新
    commentLv:'0', //新，为'1'时回复一级评论，'2'时回复二级评论
    isAuthor:false,
    isFollow:false,//是否已关注当前用户
  },
  onLoad: function (options) {
    var that = this;
    that.data.id = options.id
    that.data.authorOpenid = options.openid
    this.data.indexOfDynamic=options.index
    that.data.tabCur = options.tabCur//新增
    
    if(that.data.authorOpenid==wx.getStorageSync('openid'))
    {
      this.setData({
        isAuthor:true
      })
    }
    try {
      var connent=JSON.parse(options.connent)
      that.setData({
        content:connent,
        commentNum:connent.commentNum
      })
      if(wx.getStorageSync('myFollow').indexOf(options.openid) > -1){//判断是否已关注当前用户
        this.setData({
          isFollow: true
        })
      }
   } catch (error) {
    that.getDetailData()
   }
    this.getWatch();
  },

  onShow: function () {
    this.CheckIfLogin();
  },

  onPullDownRefresh: function () {
    var that=this;
    that.getDetailData();
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'none',
      duration: 800
    })
  },

  onUnload: function () {
    this.watcher.close().then(res=>{
    })
  },
 //加载详情页信息
 getDetailData() {
  db.collection("dynamic")
  .doc(this.data.id)
  .get()
  .then((res) => {
    var yn = res.data.dynamic.praiserId.indexOf(wx.getStorageSync('openid'))
      if (yn == -1) {
        res.data.love = false
      } else {
        res.data.love = true
      }
      this.setData({
        content:res.data
      })
      if(wx.getStorageSync('myFollow').indexOf(res.data._openid) > -1){//判断是否已关注当前用户
        this.setData({
          isFollow: true
        })
      }
  })
},

 //添加关注
 follow(){
  let f = wx.getStorageSync('myFollow')
  if(f =='' || f.length == 0){
    wx.setStorageSync('myFollow', [this.data.content._openid])
  }
  else{
    f = f.concat(this.data.content._openid)
    wx.setStorageSync('myFollow', f)
  }

  wx.showLoading({
    title: '',
  })
  db.collection('usersInfformation')
  .where({
    _openid:this.data.content._openid
  })
  .get()
  .then(res=>{
    var signature=res.data[0].signature
    let author = {
      openid:this.data.content._openid,
      name:this.data.content.dynamic.author.name,
      avatarPic:this.data.content.dynamic.author.avatarPic,
      signature:signature
    }

    db.collection('usersInfformation').where({
      _openid: wx.getStorageSync('openid'),
     'userinfo.myFollow': _.all([
       _.elemMatch({
         openid: this.data.content._openid
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
         wx.hideLoading({})
     }
     else{
       this.setData({
         isFollow: true
       })
       wx.showToast({
         title: '已关注过',
       })
     }
     //被关注者的个人信息要记录关注者的openid
     db.collection('usersInfformation').where({
       _openid: this.data.content._openid
     }).update({
       data: {
         userinfo:{
           fans:_.unshift(wx.getStorageSync('openid'))
         }
         }
     }).then(res=>{
     })
   }) 
  })

 },

 //取消关注
 cancelFollow(){
  let f = wx.getStorageSync('myFollow')
  let index = f.indexOf(this.data.content._openid)
  if(index > -1){
    f.splice(index,1)
  }
  wx.setStorageSync('myFollow', f)
  db.collection('usersInfformation').where({
    _openid: wx.getStorageSync('openid')
  }).update({
    data: {
      'userinfo.myFollow': _.pull({
        openid:this.data.content._openid
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
    _openid: this.data.content._openid
  }).update({
    data: {
      'userinfo.fans': _.pull(_.in([wx.getStorageSync('openid')]))
    }
  }).then(res=>[
  ])
  //也要在被关注者的动态中删除关注者的openid
  db.collection('dynamic').where({
    _openid:this.data.content._openid,
    'dynamic.fansOpenid': wx.getStorageSync('openid')
  }).update({
    data: {
      'dynamic.fansOpenid': _.pull(wx.getStorageSync('openid'))
    }
  }).then(res=>{
  })
 },

 updateDetailPage(type,snapshot){
   if(type!='init'){
     this.setData({
       'content.dynamic.comment':snapshot.docChanges[0].doc.dynamic.comment
     })
   }
 },
 getWatch(){
   let that = this
  that.watcher = db.collection('dynamic')
  .where({
    _id:that.data.content._id
  })
  //发起监听
  .watch({
    onChange: function(snapshot) {
      that.updateDetailPage(snapshot.type,snapshot)
    },
    onError: function(err) {
    }
  })
 },
  //预览图片
  previewImage: function (e) {
    var current = e.target.dataset.src;
    wx.previewImage({
      current: current, // 当前显示图片的http链接
      urls: this.data.content.dynamic.imgList // 需要预览的图片http链接列表
    })
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
    content:'登陆后才能评论哦，是否登陆？',
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

  //点赞帖子
  dianzan(e){
    var that=this;
    var ssid=this.data.content._id //当前动态的id
    wx.cloud.callFunction({
      name:"praise",
      data:{
        plate:0,
        id:ssid,
        dzrid:wx.getStorageSync('openid') //用户openid作点赞人id，存入的是用户openid
      }
    })
    var ss_xx=this.data.content
    if(this.data.content.love){
      ss_xx.dynamic.praise--;
      wx.showToast({
        title: '取消点赞',
        icon:'none',
        duration:800
      })
      this.setData({
        "content.love":false,
        content:ss_xx
      })
    }else{
      ss_xx.dynamic.praise++;
      wx.showToast({
        title: '点赞成功',
        icon:'success',
        duration:800
      })
      this.setData({
        "content.love":true,
        content:ss_xx
      })   
       that.addMessage();
    }
     //将当前用户对当前评论的点赞状态、动态的下标写入缓存
     ret = {
       love:this.data.content.love,
       index:this.data.indexOfDynamic,
       tabCur:this.data.tabCur
     }
     wx.setStorageSync('retFromDetail',ret)
     
  },

  addMessage(){
    if(wx.getStorageSync('openid')!=this.data.content._openid)
    {
      var praiseInfo={
        praiserName:wx.getStorageSync('userInformation').userinfo.name,
        dynamicId:this.data.content._id,
        praiserOpenid:wx.getStorageSync('openid'),
        content:this.data.content.dynamic.inputData,
        time:new Date().getTime(),
        dot:true
      }
      db.collection('message').where({
        _openid:this.data.content._openid
      })
      .update({
        data:{
          praise:
          _.unshift([praiseInfo])
          
        }
      })
      .then(res=>{
      })  
    }
  },

  //文字输入框内容
  textareaAInput: function (e) {
    var inputData = e.detail.value;
      this.data.inputData= inputData;
  },
  
  //文本内容合法性检测
  async checkStr(text) {
    try {
      var res = await wx.cloud.callFunction({
        name: 'checkStr',
        data: {
          text: text,
        }
      });
      if (res.result.errCode == 0)
        return true;
    } catch (err) {
      return false;
    }
  },

  //开始审核文本
  async checkText() {
    var text = this.data.inputData
    if (text.length > 0) {
      var checkOk = await this.checkStr(text);
    } else {
      var checkOk = true
    }
    if (!checkOk) {

      wx.hideLoading({}),//审核不通过隐藏
        wx.showToast({
          title: '文本含有违法违规内容',
          icon: 'none',
          duration: 5000,
        })
      this.setData({
        inputData: '',
        searchinput: ''
      })
      return false//这个return返回，停止继续执行
    }
    else {
      return true
    }
  },

  formSubmit: function (e) {
    if (app.ifLogin) {
      if (this.data.inputData == '') {
        wx.showToast({
          title: '回复不能为空',
          icon: 'none'
        })
      }
      else {
        this.pushdynamicData();
      }
    }
    else {
      this.loginWindow()
    }

  },

  //上传数据
  async pushdynamicData() {
    var that=this;
    wx.showLoading({
      title: '发送中...',
      mask: true
    })
    var strOK = await this.checkText();
    if (strOK) {

      if(this.data.placeholder=="写下你善意的回复")
      {
        var newComment={
          avatarPic:wx.getStorageSync('userInformation').avatarPic,
          huifuList:[],
          content: this.data.inputData,
          grade: '',
          name: wx.getStorageSync('userInformation').name,
          place: wx.getStorageSync('userInformation').place,
          openid: wx.getStorageSync('openid'),
          time: new Date().getTime()
        }
        db.collection("dynamic").where({
          _id: this.data.id
        })
          .update({
            data: {
              dynamic: {
                comment: _.unshift([newComment]),
              }
            },
          })
          .then(res => {
            this.setData({
              searchinput: '',
              inputData: '',
              placeholder:"写下你善意的回复",
            })
             this.getDetailData();
            wx.hideLoading({})
          })
          that.addCommentMessage()
      }
      else
      {
        var huifu={
          commentName:wx.getStorageSync('userInformation').name,
          openid:wx.getStorageSync('openid'),
          toName:this.data.toCommenter.name,
          toOpenid:this.data.toCommenter.openid,
          text:this.data.inputData,
          time: new Date().getTime()
        }
        db.collection("dynamic").doc(this.data.id).get()
        .then(res=>{
          comment=res.data.dynamic.comment;
          if(this.data.commentLv=='1'){
            let i = this.locateComment1(res.data.dynamic.comment,this.data.commentTime) //新
            comment[i].huifuList.unshift(huifu)
          }else if(this.data.commentLv=='2'){
            let i = this.locateComment2(res.data.dynamic.comment,this.data.commentTime) //新
            comment[i].huifuList.unshift(huifu)
          }
          
        })
        .then(res=>{
          db.collection("dynamic").where({
            _id: this.data.id
          })
          .update({
            data: {
              dynamic: {
              comment:comment,
              }
            },
          }) 
          .then(res => {
            this.setData({
              searchinput: '',
              inputData: '',
              placeholder:"写下你善意的回复"
            })
            this.getDetailData();
            wx.hideLoading({})
          })
          that.addToCommenterMessage(huifu)
        })
      }
    }
  },

  //给被评论动态作者发消息
  addCommentMessage()
  {
    if(this.data.authorOpenid!=wx.getStorageSync('openid')) //自己评论自己的动态不发消息
   {
    var commentInfo={
      contentId:this.data.content._id,
      commentName:this.data.commenter.name,
      commentOpenid:wx.getStorageSync('openid'),
      time:new Date().getTime(),
      content:this.data.content.dynamic.inputData,
      comment:this.data.inputData,
      dot:true
    }
    db.collection('message').where({
      _openid:this.data.authorOpenid
    })
    .update({
      data:{
        comment:
        _.unshift([commentInfo])
        
      }
    })
    .then(res=>{
    })
  }
  },
  //给二级被回复者发消息
  addToCommenterMessage(huifu){
  if(huifu.toOpenid!=wx.getStorageSync('openid'))
  {
  var commentInfo={
    contentId:this.data.content._id,
    commentName:huifu.commentName,
    commentOpenid:huifu.openid,
    time:new Date().getTime(),
    content:this.data.content.dynamic.inputData,
    comment:this.data.inputData,
    dot:true
  }
  db.collection('message').where({
    _openid:huifu.toOpenid
  })
  .update({
    data:{
      comment:
      _.unshift([commentInfo])
      
    }
  })
  .then(res=>{
  })      
}
},
  //举报
  warning() {
   this.setData({
    hiddenmodalput:false
   })
  },
  cancelM: function (e) {
    this.setData({
      hiddenmodalput: true,
    })
  },
  async confirmM (e) {
    wx.showLoading({
        title: '上传中...',
      })
    var strOK = await this.checkWarnText();
    if(strOK)
    {
      db.collection("warnText").add({
      data:{
        warnText:this.data.warnText,
        warner:this.data.commenter,
        dynamicId:this.data.id,
        time:new Date()
      }
      }).then((res) => {
        this.setData({
          warnText:'',
          searchinput:''
        })
        wx.hideLoading({})
        wx.showToast({
          title: '已举报，等待处理！',
          duration: 1000,
          icon: 'none'
        });
      })
   
    }
    this.setData({
      hiddenmodalput: true
    })
  },
   warnText (e) {
    this.setData({
     warnText:e.detail.value
    })
  },
  //开始审核文本
  async checkWarnText() {
    var text = this.data.warnText
    if (text.length > 0) {
      var checkOk = await this.checkStr(text);
    } else {
      var checkOk = true
    }
    if (!checkOk) {
      wx.hideLoading({}),//审核不通过隐藏
        wx.showToast({
          title: '文本含有违法违规内容',
          icon: 'none',
          duration: 5000,
        })
      this.setData({
        warnText: '',
        searchinput: ''
      })
      return false//这个return返回，停止继续执行
    }
    else {
      return true
    }
  },
  //设置评论展开收起状态
  async setOpen() {
    var dataWithOpen = await this.open(this.data.content)
    this.setData({
      content: dataWithOpen
    })
  },
  //添加展开收起标记
  async open(e) {
    var l = e.dynamic.comment.length
    for (var i = 0; i < l; i++) {
        e.dynamic.comment[i].openClose = false
    }
    return e
  },
  //评论展开收起
  openCloseComment(e){
    var index=e.currentTarget.dataset.index;
    var content=this.data.content
    var commentOpen=content.dynamic.comment[index].openClose;
    if(!commentOpen)
    {
      this.data.content.dynamic.comment[index].openClose=true
      this.setData({
        content:content
      })
    }
    else
    {
      this.data.content.dynamic.comment[index].openClose=false
      this.setData({
        content:content
      })
   
    }
   
  },
  //删除评论
  delComment(e){
  var that=this;
  var index=e.currentTarget.dataset.index;
  var id=that.data.id;
  wx.showModal({
   title:'提示',
   content:'确定要删除此评论？',
   success (res) {
    if (res.confirm) {
      db.collection("dynamic").doc(id).get()
      .then(res=>{
        var dynamic=res.data;
        dynamic.dynamic.comment.splice(index,1)
        db.collection("dynamic").doc(id).update({
          data:{
            dynamic:{
              comment:dynamic.dynamic.comment
            }
          }
        }).then(res=>{
          wx.showToast({
            title: '删除成功！',
          })
          that.getDetailData();
        })
    
      })
    } else if (res.cancel) {
    }
   }
  })
 
  },
  //删除评论回复
  delhuifu(e){
    var that=this;
    //评论下标
   commentListIndex=e.currentTarget.dataset.index1
    //评论回复下标
    var index=e.currentTarget.dataset.index;
    var id=that.data.id;
    wx.showModal({
     title:'提示',
     content:'确定要删除此评论？',
     success (res) {
      if (res.confirm) {
        db.collection("dynamic").doc(id).get()
        .then(res=>{
          var comment=res.data.dynamic.comment;
          comment[commentListIndex].huifuList.splice(index,1)
          db.collection("dynamic").doc(id).update({
            data:{
              dynamic:{
                comment:comment
              }
            }
          }).then(res=>{
            wx.showToast({
              title: '删除成功！',
            })
            that.getDetailData();
          })
      
        })
      } else if (res.cancel) {
      }
     }
    })
   
    },
  //选择评论对象
  huifucomment(e){
    this.data.commentLv = e.currentTarget.dataset.commentlv
    this.data.commentTime = e.currentTarget.dataset.item.time //新，获取评论的时间戳
    var that=this;
    var toCommenter={};
    if(e.currentTarget.dataset.index1!=null)
    {
      commentListIndex=e.currentTarget.dataset.index1
    }
    else
    {
      commentListIndex=e.currentTarget.dataset.index
    }
  
    that.setData({
      placeholder:"回复 "+ e.currentTarget.dataset.name
    })
    toCommenter.name=e.currentTarget.dataset.name;
    toCommenter.openid=e.currentTarget.dataset.openid;
    that.data.toCommenter=toCommenter;
  },
 
  //定位评论（一级） //新
  locateComment1(comment,time){
    for(let i=0; i<comment.length; ++i){
      if(time==comment[i].time){
        return i
      }
    }
  },
  //定位评论（二级）//新
  locateComment2(comment,time){
    for(let i=0; i<comment.length; ++i){
      for(let j=0; j<comment[i].huifuList.length; ++j){
        if(time==comment[i].huifuList[j].time){
          return i
        }
      }
    }
  },
  //点击回复动态
  setPlaceholder(){
  var that=this;
  that.setData({
    placeholder:"写下你善意的回复"
  })
  },
  //进入楼主主页
  inPersonPage: function (e) {
    wx.navigateTo({
      url: '../personPage/personPage?openid=' + this.data.authorOpenid,
    })
  },
  //进入评论者主页
  inPersonPage1(e) {
    wx.navigateTo({
      url: '../personPage/personPage?openid=' + e.currentTarget.dataset.openid,
    })
  },

  deleDynamic()
  {
  var that=this;
    wx.showModal({
      title:'提示',
      content:'确定要删除此动态？',
    }).then(res=>{

      if(res.confirm)
      {
        wx.showLoading({
          title: '删除ing',
        })
        setTimeout(function () {
          wx.hideLoading({
            success: (res) => {
              wx.showToast({
                title: '删除成功',
                icon: 'success',
                duration: 1000
              })
            },
          })
        }, 1000)
        db.collection("dynamic").doc(this.data.id)
        .remove()
        .then(res=>{
          app.refresh=true
          wx.switchTab({
            url: '/pages/index/index'
          })
        })
      }
      else
      {
        this.setData({
          selectDele:false
        })
      }
     
    })
  }
})