// miniprogram/pages/setting/setting.js

var fileid='';
const app = getApp()
const db = wx.cloud.database()
Page({

  data: {
    avatorimg:'',
    showModal: true,
    index: null,
    userinfo: {},
    hiddenmodalput: true,
    hiddenmodalput1:true,
    pickersex: ['男', '女'],
    indexSex: 0,
    pickerplace: ['仙溪校区', '江湾校区', '河滨校区'],
    indexPlace: 0,
    signature:wx.getStorageSync('signature'),
  },
  
   onLoad: function (options) {
    this.CheckIfLogin()
  },
  onShow:function(){
    this.CheckIfLogin()
  },
  onPullDownRefresh: function () {
    this.CheckIfLogin()
    wx.stopPullDownRefresh({})
    wx.showToast({
      title: '刷新成功',
      icon: 'none',
      duration: 800
    })
  },
 //检查是否已经登陆
 CheckIfLogin() {
  if(wx.getStorageSync('userInformation')!= undefined){
    app.ifLogin=true
    this.setData({
      userinfo:wx.getStorageSync('userInformation')
    })
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
    content:'登陆后才能修改个人信息哦，是否登陆？',
    success (res) {
     if (res.confirm) {
      wx.navigateTo({
        url: '../../login/login',
      })
     } else if (res.cancel) {
      app.ifLogin = false
     }
    }
   })
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
  //图片内容合法性检测
  async checkImg(media) {
    try {
      var res = await wx.cloud.callFunction({
        name: 'checkImg',
        data: { media }
      });
      return res.result.errCode
    } catch (err) {
      return 1;
    }
  },
   //开始审核文本
   async checkText() {
    wx.showLoading({
      title: '上传中...',
    })
    var text = this.data.userinfo.name
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
        "userinfo.name": '',
        searchinput: ''
      })
      return false//这个return返回，停止继续执行
    }
    else {
      return true
    }
  },
  //开始审核图片
  async checkimages() {
    var img = this.data.avatorimg//图片临时路径赋值给变量img
    //开始图片审核
    if (img.length != 0) {
     
      var media = ''
      for (var i = 0; i < img.length; i++) {
        media = img[i]
        let checkOk = await this.checkImg(media)//开始审核图片
        if (checkOk == 87014 || checkOk == -604102) {
          wx.hideLoading({}),//审核不通过隐藏
            wx.showToast({
              title: '图片检测出现问题',
              icon: 'none',
              duration: 2000,
            })
          this.setData({
            avatorimg: ''
          })
          return false
        } else if (checkOk != 0) {
         
            connectIsOK = false;
          wx.showToast({
            title: '图片检测出现问题',
            icon: 'none',
            duration: 2000,
          })
          this.setData({
            avatorimg:''
          })
          return false
        }
        else {
          return true
        }
      }
      
    }
    else {
      return true
    }
   
  },
  //修改名称
  setName: function () {
    if(app.ifLogin)
    {
      this.setData({
        hiddenmodalput: false
      })
    }
    else
    {
      this.loginWindow()
    }
  },
  cancelM: function (e) {
    this.setData({
      hiddenmodalput: true,
    })
  },
  async confirmM (e) {
    var strOK = await this.checkText();
    
    if(strOK)
    {
        db.collection("usersInfformation")
        .where({
          _openid: wx.getStorageSync('openid')
        })
        .update({
          data: {
            userinfo: {
              name: this.data.userinfo.name
            }
          }
        })
        .then((res) => {
            db.collection('dynamic').where({
            _openid: wx.getStorageSync('openid')
          }).update({
            data:{
              dynamic:{
                author:{
                  name: this.data.userinfo.name
                }
              }}
          }).then(res=>{
            wx.hideLoading({})
            wx.setStorageSync('userInformation'.name,this.data.userinfo.name)
            this.CheckIfLogin()
          })
          
        })  
    }
    this.setData({
      hiddenmodalput: true
    })
  },
  iName: function (e) {
    this.setData({
      "userinfo.name": e.detail.value
    })
  },
  
  PickerChangeSex(e) {
    this.setData({
      "userinfo.sex": this.data.pickersex[e.detail.value]
    })
    this.data.userinfo.sex=this.data.pickersex[e.detail.value]
    if(app.ifLogin)
    {
      db.collection("usersInfformation").where({
        _openid: wx.getStorageSync('openid')
      }).update({
        data: {
          userinfo: {
            sex: this.data.userinfo.sex
          }
        }
      }).then((res) => {
        db.collection('dynamic').where({
        _openid: wx.getStorageSync('openid')
      }).update({
        data:{
          dynamic:{
            author:{
              sex: this.data.userinfo.sex
            }
          }
        }
      }).then(res=>{
        wx.setStorageSync('userInformation'.sex,this.data.userinfo.sex)
      })
      })
    }
    else
    {
      this.loginWindow()
    }
   
  },
  PickerChange(e) {
    this.setData({
      index: e.detail.value
    })
  },
  
  PickerChangePlace(e) {
    this.setData({
      "userinfo.place": this.data.pickerplace[e.detail.value]
    })
    if(app.ifLogin)
    { db.collection("usersInfformation").where({
      _openid: wx.getStorageSync('openid')
    }).update({
      data: {
        userinfo: {
          place: this.data.userinfo.place
        }
      }
    }).then((res) => {
      db.collection('dynamic').where({
      _openid: wx.getStorageSync('openid')
      }).update({
        data:{
         dynamic:{
            author:{ place: this.data.userinfo.place}
        }
      }}
      ).then(res=>{
        wx.setStorageSync('userInformation'.place,this.data.userinfo.place)
      })
    })
    }
    else{
      this.loginWindow()
    }
   
  },

  cancel: function () {
    this.setData({
      showModal: true,
      "userinfo.avatarPic": this.data.userinfo.avatarPic
    })
  },
  confirm: function () {
    this.setData({
      showModal: true
    })
  },

  changeAvatarPic() {
    if(app.ifLogin)
    {
      wx.chooseImage({
        count: 1, // 默认9     
        sizeType: ['original', 'compressed'],
        sourceType: ['album', 'camera'],
        success: res => {
          this.setData({
            showModal: false,
          })
          this.cloudFile(res.tempFilePaths[0])
        }
      })
    }
    else
    {
      this.loginWindow()
    }
    
  },

  cloudFile(path) {
    wx.cloud.uploadFile({
      cloudPath: "userAvatorPic/" + Date.now() + ".jpg",
      filePath: path
    }).then(res => {
      fileid=res.fileID;
      this.data.avatorimg=res.fileID;
      this.upAvatarPic();
     
    })
  },

 async upAvatarPic(){
  var imgOK = await this.checkimages();
  if(imgOK)
  {
    wx.showLoading({
      title: '上传中...',
    })
    db.collection("usersInfformation").where({
      _openid: wx.getStorageSync('openid')
    }).update({
      data: {
        userinfo: {
          avatarPic:this.data.avatorimg
        }
      }
    }).then((res) => {
      this.setData({
        "userinfo.avatarPic":this.data.avatorimg
      })
      db.collection('dynamic').where({
        _openid: wx.getStorageSync('openid')
      }).update({
        data:{
          dynamic:{
            author:{avatarPic:this.data.avatorimg}
          }
        }
      }).then(res=>{
        wx.setStorageSync('userInformation'.avatarPic,this.data.avatorimg)
      })
    })
  }
  },
  //修改签名
  setSignature: function () {
    this.setData({
      hiddenmodalput1: false
    })
  },
  signatureM1: function (e) {
    this.setData({
      hiddenmodalput1: true,
    })
  },
  async signatureConfirmM1 (e) {
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
        wx.hideLoading({
          success: (res) => {},
        })
    });
    }
    this.setData({
      hiddenmodalput1: true
    })
  },
   iSignature (e) {
    this.setData({
     signature: e.detail.value
    })
  },
  inAboutUs(){
    wx.navigateTo({
      url: '../setting/aboutUs/aboutUs',
    })
  },
  inSuggest(){
    wx.navigateTo({
      url: '../setting/suggest/suggest',
    })
  }
})