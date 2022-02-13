//index.js
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
var listLenFind = 0;//记录"发现"页面列表长度
var listLenHot = 0;//记录"热榜"页面列表长度
var listLenFollow = 0; //新增，记录关注动态列表的长度
var ret = {};
var incNum = 0;
var login = true;

Page({
  data: {
    avatarPic: '',
    name: '',
    userOpenid: '',
    userinfo: {},
    love: false,
    userId: '',
    index: 0,
    connent: [],
    hot: [],
    current: '0',
    winWidth: 0,
    winHeight: 0,
    praiseNow: "praise",
    PageCur: 'square',
    TabCur: 0,
    cardCur: 0,
    swiperList: [],
    weekBefore: '',
    CustomBar: app.globalData.CustomBar,
    cardNum:false,
    launchImg: '',//火箭状态
    putImg:'../images/putTag.png',//发布按钮
    putTag:true,
    followDynamic:[],//关注的动态
    scrollTop:130,
    navbarInitTop: 0, //导航栏初始化距顶部的距离
    isFixedTop: false, //是否固定顶部
    navState: 0,//导航状态
    ColorList: [{
      title: '日常',
      name: 'line-red',
    },
    {
      title: '捞人',
      name: 'line-orange',
    },
    {
      title: '树洞',
      name: 'line-yellow',
    },
    {
      title: '需求',
      name: 'line-olive',
    },
    {
      title: '问答',
      name: 'line-green',
    },
    {
      title: '表白',
      name: 'line-blue',
    }
  ],
  sortTag:''
  },
  onLoad(options) {
    this.loadData(10, 0);
    this.setData({
      WinHeight: wx.getSystemInfoSync().windowHeight,
      WinWidth: wx.getSystemInfoSync().windowWidth
    })
  
    var that = this;
    wx.showLoading({
      title: '加载中...',
    })
    this.getSwiperList();
    var now = new Date().getTime()//现在的时间
    var weekBefore = (now - 3600 * 110000 * 24) //写出一周前的时间戳
    this.data.weekBefore = weekBefore

  },
  onShow: function () {
    //从缓存获取红点数量
    if(wx.getStorageSync('dotsNum')&&wx.getStorageSync('dotsNum')!='0')
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
    
    if (this.data.TabCur == 0) {
      this.refreshLove()
    } 
     if (this.data.TabCur == 1) {
      this.refreshLoveHot()
    }


    var that=this
    if (this.data.navbarInitTop == 0) {
   
      //获取节点距离顶部的距离
      wx.createSelectorQuery().select('#navbar').boundingClientRect(function(rect) {
       if (rect && rect.top > 0) {
        var navbarInitTop = parseInt(rect.top);
        that.setData({
         navbarInitTop: navbarInitTop
        });
       }
      }).exec();
    
     }
  },
  onShareAppMessage: function () {
    return {
      title: '快来瞧一瞧佛趣广场吧！',
      path: '/pages/index/index'
    }
  },
  onReady: function () {
    this.setData({
      hot: []
    })
    this.loadHotData(10, 0)
  },
  onPullDownRefresh: function () {
    this.initColor()
    var that = this;
    if (this.data.TabCur == 0) {
      this.setData({
        connent: [],
        sortTag:''
      })
      this.loadData(5, 0);
    }
    if (this.data.TabCur == 1) {
      this.setData({
        hot: []
      })
      this.loadHotData(5, 0);
    }
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'success',
      duration: 800
    })
  },
  onReachBottom: function () {
    var that=this
    if (this.data.TabCur == 0) {
      var page = this.data.connent.length;
      if (listLenFind != page) {
        if(this.data.sortTag=='')
        {
          this.loadData(10, page) //没有选择标签筛选则加载最新动态
        }
        else
        {
          this.getSortData(10,page,that.data.sortTag)
        }
      }
      else {
        wx.showToast({
          title: '我也是有底线的！',
          icon: 'none'
        })
      }
    }
    if (this.data.TabCur == 1) {
      var page = this.data.hot.length
      if (listLenHot != page) {
        this.loadHotData(10, page)
      }
      else {
        wx.showToast({
          title: '我也是有底线的！',
          icon: 'none'
        })
      }
    }
   
    
   
  },
  //用户点击右上角分享朋友圈
  onShareTimeline: function () {
    return {
      title: '快来瞧瞧佛趣广场',
      query: {
        key: value
      },
      imageUrl: ''
    }
  },
  refreshLoveHot() {//这里更新热榜页面的点赞状态和数量
    if (wx.getStorageSync('retFromDetail')) {
      ret = wx.getStorageSync('retFromDetail')
    } else {
      return
    }
    if (ret.love == true) {
      this.setData({
        ['hot[' + ret.index + '].love']: true,
        ['hot[' + ret.index + '].dynamic.praise']: ++this.data.hot[ret.index].dynamic.praise
      })
    }
    if (ret.love == false) {
      this.setData({
        ['hot[' + ret.index + '].love']: false,
        ['hot[' + ret.index + '].dynamic.praise']: --this.data.hot[ret.index].dynamic.praise
      })
    }
    wx.removeStorage({
      key: 'retFromDetail',
    }).then(res => {})
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
        //['connent['+ret.index+'].commentNum']:++this.data.connent[ret.index].commentNum,
        ['connent[' + ret.index + '].dynamic.praise']: --this.data.connent[ret.index].dynamic.praise
      })
    }
    wx.removeStorage({
      key: 'retFromDetail',
    }).then(res => {  })
  },
  refreshCom() {//这里更新评论数量
    if (wx.getStorageSync('incNum')) {
      incNum = wx.getStorageSync('incNum')
    } else {
      return
    }
  },
  //获取用户微信信息
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善用户资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          "userData.userinfo.name": res.userInfo.nickName,
          "userData.userinfo.avatarPic": res.userInfo.avatarUrl,
          avatarPic: res.userInfo.avatarUrl,
          "userData.userinfo.sex": (res.userInfo.gender ? '男' : '女'),
        })
      }
    })
  },
  //获取轮播图数据
  getSwiperList() {
    db.collection('swiper')
    .get()
    .then((res) => {
      this.setData({
        swiperList: res.data
      })
      wx.hideLoading({
        success: (res) => {
        },
      })
    })
  },
  //浏览轮播图
  viewPic(e) {
    wx.previewImage({
      current: e.currentTarget.dataset.url, // 当前显示图片的http链接
      urls: this.data.swiperList// 需要预览的图片http链接列表
    })
  },
  //读取数据库中动态的数据
  loadData(num = 10, page = 0) {
    wx.cloud.callFunction({
      name: 'getIndexData',
      data: {
        num: num,
        plate: 1,
        page: page
      }
    }).then(async res => {
      var oldData = this.data.connent;
      var newData = oldData.concat(res.result.data);
      var that = this;
      var dataWithNUm = await that.commentNum(newData)
      listLenFind = oldData.length;
      this.setData({
        connent: dataWithNUm
      })

      this.getPraise();
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
  loadHotData(num = 10, page = 0) {
    wx.cloud.callFunction({
      name: 'getIndexData',
      data: {
        num: num,
        plate: 2,
        page: page,
        time: this.data.weekBefore
      }
    }).then(async res => {
      var oldData = this.data.hot;
      var newData = oldData.concat(res.result.data);
      var that = this;
      var dataWithNUm = await that.commentNum(newData)
      listLenHot = oldData.length;
      this.setData({
        hot: dataWithNUm
      })
      this.getHotPraise();
    })
  },
  //加载发现点赞数据
  async getPraise() {
    var dataWithPraise = await this.love(this.data.connent)
    this.setData({
      connent: dataWithPraise
    })
  },
  //加载热榜点赞数据
  async getHotPraise() {
    var dataWithPraise = await this.love(this.data.hot)
    this.setData({
      hot: dataWithPraise
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
    if(this.data.TabCur == 0){
      if (this.data.connent[index].love) {
      that.addMessage(index);
    }
    }
    if(this.data.TabCur == 1){
      if (this.data.hot[index].love) {
        that.addMessage(index);
      }
    }
  },
  addMessage(index) {
    if (wx.getStorageSync('openid') != this.data.connent[index]._openid) //给自己点赞不需要发动态
    {
      if (this.data.TabCur == 0) {
        var praiseInfo = {
          praiserName: wx.getStorageSync('userInformation').userinfo.name,
          praiserOpenid: wx.getStorageSync('openid'),
          dynamicId: this.data.connent[index]._id,
          content: this.data.connent[index].dynamic.inputData,
          time: new Date().getTime(),
          dot: true
        }
        db.collection('message').where({
          _openid: this.data.connent[index]._openid
        })
          .update({
            data: {
              praise:
                _.unshift([praiseInfo])

            }
          })
          .then(res => {
          })
      }
      if (this.data.TabCur == 1) {
        var praiseInfo = {
          praiserName: wx.getStorageSync('userInformation').userinfo.name,
          praiserOpenid: wx.getStorageSync('openid'),
          content: this.data.hot[index].dynamic.inputData,
          time: new Date().getTime(),
          dot: true
        }
        db.collection('message').where({
          _openid: this.data.hot[index]._openid
        })
          .update({
            data: {
              praise:
                _.unshift([praiseInfo])

            }
          })
          .then(res => {
          })
      }
    }
  },
  //点赞状态改变
  showPraise(index) {
    if (this.data.TabCur == 0) {
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
    }

    if (this.data.TabCur == 1) {
      var hot = this.data.hot
      if (this.data.hot[index].love) {
        hot[index].love = false
        hot[index].dynamic.praise--;
        wx.showToast({
          title: '取消点赞',
          icon:'none',
          duration:800
        })
      } else {
        hot[index].love = true
        hot[index].dynamic.praise++;
        wx.showToast({
          title: '点赞成功',
          icon:'success',
          duration:800
        })
      }
      this.setData({
        hot: hot,
      })
    }
  },
  //轮播图点的状态
  DotStyle(e) {
    this.setData({
      DotStyle: e.detail.value
    })
  },
  //监听滑块
  bindchange(e) {
    let index = e.detail.current;
    this.setData({
      navState:index
    })
  },
  //轮播图切换
  cardSwiper(e) {
    this.setData({
      cardCur: e.detail.current
    })
  },
  tabSelect(e) {

    this.setData({
      TabCur: e.currentTarget.dataset.id,
      sortTag:''
    })
  },
  //进入详情页
  inDetail: function (e) {
    if (this.data.TabCur == 0) {
      var connent = JSON.stringify(this.data.connent[e.currentTarget.dataset.index]);
      wx.navigateTo({
        url: '../detailPage/detailPage?id=' + e.currentTarget.dataset.id + '&openid=' + e.currentTarget.dataset.openid + "&connent=" + connent + "&index=" + e.currentTarget.dataset.index,
      })
    }
    if (this.data.TabCur == 1) {
      var hot = JSON.stringify(this.data.hot[e.currentTarget.dataset.index]);
      wx.navigateTo({
        url: '../detailPage/detailPage?id=' + e.currentTarget.dataset.id + '&openid=' + e.currentTarget.dataset.openid + "&connent=" + hot + "&index=" + e.currentTarget.dataset.index,
      })
    }
  },
  inPersonPage: function (e) {
    wx.navigateTo({
      url: '../personPage/personPage?openid=' + e.currentTarget.dataset.openid,
    })
  },
  showSidebar(e) {
    this.setData({
      modalName: e.currentTarget.dataset.target
    })
  },
  hideModal(e) {
    this.setData({
      modalName: null
    })
  },
  //搜索
  search() {
    wx.navigateTo({
      url: '/pages/search/search',
    })
  },
   // 获取滚动条当前位置
   onPageScroll: function (e) {
     var that = this;
    if (e.scrollTop >= 800 && !this.data.cardNum) {
      that.setData({
        launchImg:'../images/launch.png',
        cardNum: true
      }); 
    
    } else if(e.scrollTop < 800 && this.data.cardNum){
      that.setData({
        cardNum: false,
      });
      setTimeout(function(){
        that.setData({
          launchImg:''
        })}
      , 0)
    }

     if (e.scrollTop > this.data.scrollTop  && this.data.putTag) {
      setTimeout(function(){
        that.setData({
          putImg:"",
          putTag:false
        })}
      , 0)
     }
      else if(e.scrollTop < this.data.scrollTop && !this.data.putTag)
    {
      that.setData({
        putTag: true,
      });
      setTimeout(function(){
        that.setData({
          putImg:'../images/putTag.png'
        })}
      , 500)

     }

     //给scrollTop重新赋值
     setTimeout(function () {
       that.setData({
         scrollTop: e.scrollTop
       })
     }, 0)

     var scrollTop = parseInt(e.scrollTop); //滚动条距离顶部高度
    //判断'滚动条'滚动的距离 和 '元素在初始时'距顶部的距离进行判断
    var isSatisfy = scrollTop >= that.data.navbarInitTop ? true : false;
    //为了防止不停的setData, 这儿做了一个等式判断。 只有处于吸顶的临界值才会不相等
    if (that.data.isFixedTop === isSatisfy) {
     return false;
    }
   
    that.setData({
     isFixedTop: isSatisfy
    });
  },

  //回到顶部
  toTop(e){  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },
  inPut()
  {
    wx.navigateTo({
      url: '../put/put',
    })
  },
  initColor()
  {
    this.setData({
      ColorList:[
        {
          title: '日常',
          name: 'line-red',
        },
      {
        title: '捞人',
        name: 'line-orange',
      },
      {
        title: '树洞',
        name: 'line-yellow',
      },
      {
        title: '需求',
        name: 'line-olive',
      },
      {
        title: '问答',
        name: 'line-green',
      },
      {
        title: '表白',
        name: 'line-blue',
      }]
    })
  },
  sort(e)
  {
    this.initColor()
    var index=e.currentTarget.dataset.index
    this.data.sortTag=e.currentTarget.dataset.title
    var colorList=this.data.ColorList
    var str = colorList[index].name;
    colorList[index].name="bg-"+str.substring(5)
    this.setData({
      ColorList:colorList,
      TabCur:0
    })
    this.data.connent=[]
   this.getSortData(10,0,this.data.sortTag)
    
  },
  getSortData(num=10,page=0,title)
  {
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'getSort',
      data: {
        num: num,
        plate: title,
        page: page
      }
    }).then(async res => {
      var oldData = this.data.connent;
      var newData = oldData.concat(res.result.data);
      var that = this;
      var dataWithNUm = await that.commentNum(newData)
      listLenFind = oldData.length;
      this.setData({
        connent: dataWithNUm
      })
      this.getPraise();
      wx.hideLoading({
        success: (res) => {},
      })
    })
  }
});