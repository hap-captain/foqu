// pages/side/findThings/findThings.js
const db = wx.cloud.database()
const _ = db.command
const app = getApp()
var listLenLost = 0;
var listLenFind = 0;
var listLenMine = 0;
var listLenSort = 0;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    TabCur: 0,
    ColorList: [{
      title: '数码',
      name: 'line-red',
    },
    {
      title: '证件',
      name: 'line-orange',
    },
    {
      title: '文具',
      name: 'line-yellow',
    },
    {
      title: '日用品',
      name: 'line-olive',
    },
    {
      title: '书籍',
      name: 'line-green',
    },
    {
      title: '其他',
      name: 'line-blue',
    }
  ],
  sortTag:'',
  scrollTop:130,
  navbarInitTop: 0, //导航栏初始化距顶部的距离
  isFixedTop: false, //是否固定顶部
  navState: 0,//导航状态
  launchImg: '',//火箭状态
  putImg:'../../images/putTag.png',//发布按钮
  putTag:true,
  CustomBar: app.globalData.CustomBar,
  cardNum:false,
  lostData:[],
  findData:[],
  mineData:[],
  sortData:[],
  inputValue:''
  },
  onLoad: function (options) {
    var id = options.id
    if(id != undefined)
    {
      wx.navigateTo({
        url: 'inDetail/inDetail?id='+id,
      })
    }
    else
    {

    }
    this.getLostData(10,0)
  },
  onReady: function () {
    this.setData({
      findData:[],
      mineData:[]
    })
    this.getFindData(10,0)
    this.getMineData(10,0)
  },
  onShow: function () {

  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

    if(this.data.TabCur == 0)
    {
      this.data.lostData=[]
      this.initColor()
      this.getLostData(10,0)
    }
    if(this.data.TabCur == 1)
    {
      this.data.findData = []
      this.initColor()
      this.getFindData(10,0)
    }
    if(this.data.TabCur == 2)
    {
      this.data.mineData = []
      this.initColor()
      this.getMineData(10,0)
    }
    wx.stopPullDownRefresh({
      success: (res) => {},
    })
  },
  onReachBottom: function () {
    var that=this
    if (this.data.TabCur == 0) {
      var page = this.data.lostData.length;
      if (listLenLost != page) {
        if(this.data.sortTag=='')
        {
          this.getLostData(10, page) //没有选择标签筛选则加载最新动态
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
      var page = this.data.findData.length
      if (listLenFind != page) {
        this.getFindData(10, page)
      }
      else {
        wx.showToast({
          title: '我也是有底线的！',
          icon: 'none'
        })
      }
    }
    if (this.data.TabCur == 2) {
      var page = this.data.mineData.length
      if (listLenMine != page) {
        this.getMineData(10, page)
      }
      else {
        wx.showToast({
          title: '我也是有底线的！',
          icon: 'none'
        })
      }
    }
   
  },
  onShareAppMessage: function (e) {
    var id = e.target.dataset.id
    return {
      title: '救救孩子，我找不到它了^^',
      path: 'pages/side/findThings/findThings?id=' +id,
      imageUrl:e.target.dataset.src
    }
  },
  tabSelect(e) {
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      sortTag:''
    })
  },
  inPut()
  {
    wx.navigateTo({
      url: 'findPut/findPut',
    })
  },
  initColor()
  {
    this.setData({
      ColorList:[{
        title: '数码',
        name: 'line-red',
      },
      {
        title: '证件',
        name: 'line-orange',
      },
      {
        title: '文具',
        name: 'line-yellow',
      },
      {
        title: '日用品',
        name: 'line-olive',
      },
      {
        title: '书籍',
        name: 'line-green',
      },
      {
        title: '其他',
        name: 'line-blue',
      }
    ]
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
    })
    if(this.data.TabCur == 0)
    {
      this.getSortData(10,0,this.data.sortTag,0)
    }
    if(this.data.TabCur == 1)
    {
      this.getSortData(10,0,this.data.sortTag,1)
    } 
  },
  getSortData(num=10,page=0,title,tabNum)
  {
    var that = this
    wx.showLoading({
      title: '',
    })
    wx.cloud.callFunction({
      name: 'getFindData',
      data: {
        num: num,
        plate: title,
        page: page,
        tabNum:tabNum
      }
    }).then(async res => {
      if(tabNum == 0)
      {
        var oldData = that.data.sortData;
        var newData = oldData.concat(res.result.data);
        listLenSort = oldData.length;
        that.setData({
          lostData: newData
        })
      }
      if(tabNum == 1)
      {
        var oldData = that.data.sortData;
        var newData = oldData.concat(res.result.data);
        listLenSort = oldData.length;
        that.setData({
          findData: newData
        })
      }
      wx.hideLoading({
        success: (res) => {},
      })
    })
  },
  getLostData(num = 10, page = 0)
 {
  wx.showLoading({
    title: '',
  })
  wx.cloud.callFunction({
    name: 'getFindData',
    data: {
      num: num,
      plate:0,
      page: page,
      tabNum:-1
    }
  })
  .then(res=>{
    var oldData = this.data.lostData;
    var newData = oldData.concat(res.result.data);
    listLenLost = oldData.length;
    this.setData({
      lostData:newData
    })
    wx.hideLoading({
      success: (res) => {},
    })
  })
 },

 getFindData(num = 10, page = 0)
 {
  wx.showLoading({
    title: '',
  })
  wx.cloud.callFunction({
    name: 'getFindData',
    data: {
      num: num,
      plate:1,
      page: page,
      tabNum:-1
    }
  })
  .then(res=>{
    var oldData = this.data.findData;
    var newData = oldData.concat(res.result.data);
    listLenFind = oldData.length;
    this.setData({
      findData:newData
    })
    wx.hideLoading({
      success: (res) => {},
    })
  })
 },

 getMineData(num = 10, page = 0)
 {
  wx.showLoading({
    title: '',
  })
  wx.cloud.callFunction({
    name: 'getFindData',
    data: {
      num: num,
      plate:2,
      page: page,
      tabNum:-1
    }
  })
  .then(res=>{
    var oldData = this.data.mineData;
    var newData = oldData.concat(res.result.data);
    listLenMine = oldData.length;
    this.setData({
      mineData:newData
    })
    wx.hideLoading({
      success: (res) => {},
    })
  })
 },
  // 获取滚动条当前位置
  onPageScroll: function (e) {
    var that = this;
   if (e.scrollTop >= 800 && !this.data.cardNum) {
     that.setData({
       launchImg:'../../images/launch.png',
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
         putImg:'../../images/putTag.png'
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
 //预览图片
 previewImage: function (e) {
  var current = e.target.dataset.src;
  wx.previewImage({
    current: current, // 当前显示图片的http链接
    urls:  current// 需要预览的图片http链接列表
  })
},
search()
{
  var input=this.data.inputValue
    wx.navigateTo({
      url: 'search/search?inputValue='+input,
    })
},
getInputValue(e)
{
  
  this.setData({
    inputValue:e.detail.value
  })
},
inDetail(e)
{
  var id = e.currentTarget.dataset.id
  var item = JSON.stringify(e.currentTarget.dataset.item)
  var openid = e.currentTarget.dataset.openid
  wx.navigateTo({
    url: 'inDetail/inDetail?item='+item+'&id='+id +'&openid=' +openid,
  })
}
})