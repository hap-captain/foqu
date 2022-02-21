const db = wx.cloud.database()
const _ = db.command
const app = getApp()
var ret = {};
var incNum = 0;
var login = true;
 //评论下标
 var commentListIndex=null;
Page({


  data: {
    text: '',
    connent: [],
    userOpenid: '',
    userinfo: {},
    love: false,
    kong: false,
    userId: '',
    index: 0,
    current: '0',
    winWidth: 0,
    winHeight: 0,
    CustomBar: app.globalData.CustomBar,
    
  },


  onLoad: function (options) {
  },

  //获取用户_id
  getUserId() {
    this.data.userOpenid = wx.getStorageSync('openid')
    db.collection("usersInfformation").where({
      _openid: wx.getStorageSync('openid')
    }).get().then((res) => {
      if (res.data.length == 0) {
        login = false;
      }
      else {
        this.data.userinfo = res.data[0].userinfo,
          this.data.userId = res.data[0]._id
      }
    })

  },
  //输入监听
  inputText(e) {
    this.setData({
      text: e.detail.value
    })
  },
  //搜索按钮
   search() {
    wx.showLoading({
      title: '拼命寻找ing',
    })
    var that = this;
    //获取键盘监听，进行搜索
    db.collection('dynamic').where({
      dynamic: {
        inputData: db.RegExp({
          regexp: that.data.text,
          options: 'i'
        })
      }
    }).get().then( async res => {

      if (res.data == '') {
        wx.hideLoading({
          success: (res) => {
            wx.showToast({
              title: '暂无相关帖子\r\n换个词试试吧',
              duration: 2000,
              icon:'none',
              mask: true,
            })
          }
        })
      }
      else {
        wx.hideLoading({
          success: (res) => {
            wx.showLoading({
              title: '找到啦！',
              duration: 500
            })
          },
        })
        var dataWithNUm=await that.commentNum(res.data)
        var dataWithPraise= await that.love(dataWithNUm)
        this.setData({
          connent: dataWithPraise
        })
      }
    }).catch(err => {
    })
    this.refreshLove()
  },

  inPersonPage: function (e) {
    wx.navigateTo({
      url: '../personPage/personPage?openid=' + e.currentTarget.dataset.openid,
    })
  },

  //进入详情页
  inDetail: function (e) {
    var connent = JSON.stringify(this.data.connent[e.currentTarget.dataset.index]);
    wx.navigateTo({
      url: '../detailPage/detailPage?id=' + e.currentTarget.dataset.id + '&openid=' + e.currentTarget.dataset.openid + "&connent=" + connent + "&index=" + e.currentTarget.dataset.index,
    })

  },
  //计算评论总数
  async commentNum(newComment) {
    for (var i = 0; i < newComment.length; i++) {
      if (newComment[i].dynamic.comment.length == 0) {
        newComment[i].commentNum = 0
      }
      else {
        var huifuListNum = 0;
        for (var j = 0; j < newComment[i].dynamic.comment.length; j++) {
          huifuListNum += newComment[i].dynamic.comment[j].huifuList.length
        }
        newComment[i].commentNum = newComment[i].dynamic.comment.length + huifuListNum;
      }
    }
    return newComment
  },
  //加载发现点赞数据
  async getPraise() {
    var dataWithPraise = await this.love(this.data.connent)
    this.setData({
      connent: dataWithPraise
    })
  },
 
  //添加点赞标记
  async love(e) {
    var l = e.length
    for (var i = 0; i < l; i++) {
      //var yn = e[i].dynamic.praiserId.indexOf(this.data.userId)
      //这个页面修改的地方（1）：
      var yn = e[i].dynamic.praiserId.indexOf(wx.getStorageSync('openid'))
      if (yn == -1) {
        e[i].love = false
      } else {
        e[i].love = true
      }
    }
    return e
  },


  //点赞更新数据库
  dianzan(e) {
    //var _id = this.data.userId
    var id = e.currentTarget.dataset.id
    var index = e.currentTarget.dataset.index
    var that = this;
    this.showPraise(index);
    wx.cloud.callFunction({
      name: "praise",
      data: {
        plate: 0,
        id: id,
        dzrid: wx.getStorageSync('openid')
      }
    })
    that.addMessage(index);
  },

  addMessage(){
    if(wx.getStorageSync('openid')!=this.data.content._openid)
    {
      var praiseInfo={
        praiserName:wx.getStorageSync('userInformation').userinfo.name,
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
  //点赞状态改变
  showPraise(index) {
    var connent = this.data.connent
    if (this.data.connent[index].love) {
      connent[index].love = false
      connent[index].dynamic.praise--;
      wx.showToast({
        title: '取消点赞',
        icon:'none',
        duration:800
      })
    } else {
      connent[index].love = true
      connent[index].dynamic.praise++;
      wx.showToast({
        title: '点赞成功',
        icon:'success',
        duration:800
      })
    }
    this.setData({
      connent: connent,
    })

  },


  onShow: function () {
    this.refreshLove()
  },
  refreshLove() {//这里更新页面的点赞状态和数量
    if (wx.getStorageSync('retFromDetail')) {
      ret = wx.getStorageSync('retFromDetail')
    } else {
      return
    }
    if (ret.love == true) {
      this.setData({
        ['connent[' + ret.index + '].love']: true,
        ['connent[' + ret.index + '].dynamic.praise']: ++this.data.connent[ret.index].dynamic.praise
      })
    }
    if (ret.love == false) {
      this.setData({
        ['connent[' + ret.index + '].love']: false,
        ['connent[' + ret.index + '].dynamic.praise']: --this.data.connent[ret.index].dynamic.praise
      })
    }
  },
  refreshCom() {//这里更新评论数量
    if (wx.getStorageSync('incNum')) {
      incNum = wx.getStorageSync('incNum')
    } else {
      return
    }
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 800
    })
  },
  onReachBottom: function () {
  },

})