// miniprogram/pages/mine/mine.js
const app = getApp()
const db = wx.cloud.database()
var arrList = [];
Page({
  data: {
    signature:'',
    avatarpic:'',
    name:'',
    ifLogin:app.ifLogin,
    index: null,
    hiddenmodalput: true,
    showModal: true,
    StatusBar: app.globalData.StatusBar,
    list:[
      {
        title:'动态空间',
        icon:'discoverfill'
      },
      {
        title:'我的关注',
        icon:'likefill'
      },
      {
        title:'关注我的',
        icon:'favorfill'
      },
      {
        title:'设置',
        icon:'settingsfill'
      },
      {
        title:'佛趣指南',
        icon:'activityfill'
      },
      {
        title:'认证',
        icon:'newsfill'
      },

    ],
    items: [
      {value: 'green', color: 'green', checked: false
    ,url:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/%E7%BB%BF%E8%89%B2%E6%98%A5%E5%A4%A9.jpeg?sign=9b24c71fed95fc2cf2fd7a255631cdc3&t=1627785835'},
      {value: 'blue', color: 'blue', checked: true
      ,url:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/326b9a70-7630-438b-89e4-f38e8cfafa2e.jpeg?sign=0cd0bf3…&t=1621865681'},
      {value: 'yellow',color: 'yellow', checked: false
    ,url:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/%E7%A7%8B%E5%A4%A9.jpeg?sign=37b7ca2b404ad6674802d0729d5c77f8&t=1627785951'},
      {value: 'white', color: 'cyan', checked: false,
    url:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/%E5%86%AC%E5%A4%A9.jpeg?sign=2df3b1af8874bcb92f2570c45a3aeaa9&t=1627785967'},
    ],
    picUrl:'',
    iconColor:''
  },
 
  onLoad: function (options) {
    if(wx.getStorageSync('theme')&&wx.getStorageSync('picUrl'))
    {
      this.setData({
        items:wx.getStorageSync('theme'),
        picUrl:wx.getStorageSync('picUrl'),
        iconColor:wx.getStorageSync('iconColor')
      })
    }
    else
    {
      this.setData({
        items:this.data.items,
        picUrl:'https://666f-fosusquare-9gwq61i6a0c9d216-1305659720.tcb.qcloud.la/system/326b9a70-7630-438b-89e4-f38e8cfafa2e.jpeg?sign=0cd0bf3…&t=1621865681',
        iconColor:'blue'

      })
    }

    if(wx.getStorageSync('signature'))
    {
      this.setData({
        signature:wx.getStorageSync('signature')
      })
    }
    else
    {
      wx.setStorageSync('signature', '个性签名')
    }
  },
  onShareAppMessage: function () {
  },
  //检查是否已经登陆
  CheckIfLogin() {
    if(wx.getStorageSync('userInformation')!= undefined){
      app.ifLogin=true
      this.setData({
        avatarpic:wx.getStorageSync('userInformation').avatarPic,
        signature:wx.getStorageSync('signature'),
        name:wx.getStorageSync('userInformation').name,
        ifLogin:app.ifLogin
      })
    }
    else{
      
    }
  },
  
  onPullDownRefresh: function () {
    this.CheckIfLogin();
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '已刷新',
      icon: 'none',
      duration: 800
    })

  },
 //用户点击右上角分享朋友圈
 onShareTimeline: function () {

},
  onShow: function () {
    this.CheckIfLogin()
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
    var text = this.data.signature
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
      filePath = [];
      arrList = [];
      this.setData({
        signature: '',
        searchinput: ''
      })
      return false//这个return返回，停止继续执行
    }
    else {
      return true
    }
  },
  login(){
    wx.navigateTo({
      url: '../login/login',
    })
  },
  //修改签名
  setSignature: function () {
    this.setData({
      hiddenmodalput: false
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
    var strOK = await this.checkText();
    if(strOK)
    {
      //上传修改数据
      db.collection('usersInfformation').where({
        _openid:wx.getStorageSync('openid')
      }).update({
        data: {
          signature:this.data.signature
        }
      }).then((res) => {
       
        wx.setStorageSync('signature',this.data.signature)
        wx.hideLoading({})
        wx.showToast({
          title: '已修改！',
          duration: 500
        })
    
    });
    }
    this.setData({
      hiddenmodalput: true
    })
  },
   iName (e) {
    this.setData({
     signature: e.detail.value
    })
  },
  radioChange(e) {
    const items = this.data.items
    for (let i = 0, len = items.length; i < len; ++i) {
      items[i].checked = items[i].value === e.detail.value
      if(items[i].checked)
      {
        this.setData({
          picUrl:this.data.items[i].url,
          iconColor:this.data.items[i].color
        })
      }
    }
    this.setData({
      items,
    })
    wx.setStorageSync('theme', this.data.items)
    wx.setStorageSync('picUrl', this.data.picUrl)
    wx.setStorageSync('iconColor', this.data.iconColor)
  },
  inSetting()
  {
    wx.navigateTo({
      url: '../side/setting/setting',
    })
  },
  inPage(e)
  {
    var index=e.currentTarget.dataset.index
    if(index==0)
    {
      wx.navigateTo({
        url: '../side/history/history',
      })
    }
    if(index==1)
    {
      wx.navigateTo({
        url: '../side/myFollow/myFollow',
      })
    }
    if(index==2)
    {
     wx.navigateTo({
       url: '../side/fans/fans',
     })
    }
    if(index==3)
    {
      wx.navigateTo({
        url: '../side/setting/setting',
      })
    }
    if(index==4)
    {
      wx.navigateTo({
        url: '../side/tips/tips',
      })
    }
    if(index==5)
    {
      wx.navigateTo({
        url: '../side/identification/identification',
      })
    }
  }
});
