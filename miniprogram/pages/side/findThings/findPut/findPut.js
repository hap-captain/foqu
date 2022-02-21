// miniprogram/pages/put/put.js
var arrList = [];
const app = getApp()
const db = wx.cloud.database()
var filePath = [];
var login=true;
Page({
  data: {
    index: null,
    picker: ['寻找物品', '寻找失主'],
    type:'',
    blackList:[],
    CustomBar: app.globalData.CustomBar,
    ifInBlackList:0,
    flag:false, //用于判断当前页面是否已保存到用户信息
    searchinput: '',
    index: null,
    img_arr: [],
    imgList: [],
    showPlace:'',
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
  ],
  
  },

  onLoad: function (options) {
    this.getBlackList();
  },
  onShow:function (){
    console.log("是否登陆",app.ifLogin)
    this.CheckIfLogin()
  },
  
  //用户点击右上角分享朋友圈
  onShareTimeline: function () {
    return {
      title: '',
      query: {
        key: value
      },
      imageUrl: ''
    }
  },
  onShareAppMessage: function () {
    return {
      title: '快来这里找回你心爱的它吧！',
      path: 'pages/side/findThings/findPut/findPut'
    }
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
      content:'登陆后才能发布动态，是否登陆？',
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
  //获取黑名单
  getBlackList()
  {
    db.collection('blackList').where({
      _id:'79550af260b24a961b8462aa0ffb6cd4'
    }).get()
      .then(res=>{
        this.data.blackList = res.data[0].blacker
        this.data.ifInBlackList=this.data.blackList.indexOf(wx.getStorageSync('openid'))
      })
  },
  PickerChange(e) {
    this.setData({
      index: e.detail.value,
      type:this.data.picker[e.detail.value]
    })
  },
  // //文本内容合法性检测
  // async checkStr(text) {
  //   try {
  //     var res = await wx.cloud.callFunction({
  //       name: 'checkStr',
  //       data: {
  //         text: text,
  //       }
  //     });
  //     if (res.result.errCode == 0)
  //       return true;
  //   } catch (err) {
  //     return false;
  //   }
  // },
  // //图片内容合法性检测
  // async checkImg(media) {
  //   try {
  //     var res = await wx.cloud.callFunction({
  //       name: 'checkImg',
  //       data: { media }
  //     });
  //     return res.result.errCode
  //   } catch (err) {
  //     return 1;
  //   }
  // },
  //开始审核文本
  // async checkText() {
  //   var text = this.data.dynamic.inputData
  //   if (text.length > 0) {
  //     var checkOk = await this.checkStr(text);
  //   } else {
  //     var checkOk = true
  //   }
  //   if (!checkOk) {

  //     wx.hideLoading({}),//审核不通过隐藏
  //       wx.showToast({
  //         title: '文本含有违法违规内容',
  //         icon: 'none',
  //         duration: 5000,
  //       })
  //     filePath = [];
  //     arrList = [];
  //     this.setData({
  //       "dynamic.imgList": [],
  //       "dynamic.inputData": '',
  //       inputData: '',
  //       searchinput: ''
  //     })
  //     return false//这个return返回，停止继续执行
  //   }
  //   else {
  //     return true
  //   }
  // },
  // //开始审核图片
  // async checkimages() {
  //   var img = this.data.dynamic.imgList//图片临时路径赋值给变量img
  //   //开始图片审核
  //   if (img.length != 0) {
  //     //审核图片
  //     wx.showLoading({
  //       title: '图片处理...',
  //       mask: true
  //     })
  //     var media = ''
  //     for (var i = 0; i < img.length; i++) {
  //       media = img[i]
  //       let checkOk = await this.checkImg(media)//开始审核图片
  //       if (checkOk == 87014 || checkOk == -604102) {
  //         wx.hideLoading({}),//审核不通过隐藏
  //           wx.showToast({
  //             title: '图片检测出现问题',
  //             icon: 'none',
  //             duration: 2000,
  //           })
  //         this.setData({
  //           "dynamic.imgList": []
  //         })
  //         return false
  //       } else if (checkOk != 0) {
  //         wx.hideLoading({}),//审核不通过隐藏
  //           connectIsOK = false;
  //         wx.showToast({
  //           title: '图片检测出现问题',
  //           icon: 'none',
  //           duration: 2000,
  //         })
  //         this.setData({
  //           "dynamic.imgList": []
  //         })
  //         return false
  //       }
  //       else {
  //         return true
  //       }
  //     }
  //     wx.hideLoading({})
  //   }
  //   else {
  //     return true
  //   }
  // },
  //上传数据
  // async pushdynamicData() {
  //   wx.showLoading({
  //     title: '发布中...',
  //     mask:true
  //   })
  //   var strOK = await this.checkText();
  //   var imgOK = await this.checkimages();
  //   var that=this;

  //   if (strOK && imgOK) {
  //     if(that.data.ifInBlackList != -1) //在黑名单用户发布的动态
  //     {
  //       wx.hideLoading({})
  //       wx.showToast({
  //         title: '你的动态需要审核才能发布，请等待',
  //         duration: 6000,
  //         mask:true,
  //         icon:'none'
  //       })
  //       db.collection('blackDynamic').add({
  //         data: {
  //           dynamic: {
  //             author: this.data.dynamic.author,
  //             inputData: this.data.dynamic.inputData,
  //             imgList: this.data.dynamic.imgList,
  //             praise: this.data.dynamic.praise,
  //             praiserId: this.data.dynamic.praiserId,
  //             comment: this.data.dynamic.comment,
  //             showPlace:this.data.showPlace,
  //             time: new Date().getTime()
  //           }
  //         },
  //       })
  //         .then(res => {
  //               filePath = [];
  //               arrList = [];
  //               this.setData({
  //                 "dynamic.imgList": [],
  //                 "dynamic.inputData": '',
  //                 searchinput: ''
  //               })
  //               app.refresh=true
  //         })
  //     }
  //     else { 
  //         db.collection('dynamic').add({
  //           data: {
  //             dynamic: {
  //               author: this.data.dynamic.author,
  //               inputData: this.data.dynamic.inputData,
  //               imgList: this.data.dynamic.imgList,
  //               praise: this.data.dynamic.praise,
  //               praiserId: this.data.dynamic.praiserId,
  //               comment: this.data.dynamic.comment,
  //               time: new Date().getTime(),
  //               showPlace:this.data.showPlace,
  //               fansOpenid:this.data.fansOpenid//测试用，测试完要删
  //             }
  //           },
  //         })
  //           .then(res => {
  //             filePath = [];
  //             arrList = [];
  //             this.setData({
  //               "dynamic.imgList": [],
  //               "dynamic.inputData": '',
  //               searchinput: ''
  //             })
  //             app.refresh=true
  //             wx.showToast({
  //               title: '发布成功',
  //               duration:800,
  //               icon:'success'
  //             })
  //             wx.switchTab({
  //               url: '/pages/index/index'
  //             })
  //             wx.hideLoading({
  //               success: (res) => {},
  //             })
  //           })

  //     }
  //   }
  // },
  //上传按钮
  formSubmit: function (e) {
    if(app.ifLogin)
    {
      if(this.data.showPlace=='')
      {
        wx.showToast({
          title: '您还没选择标签哦~',
          icon:"none",
          duration:2000
        })
      }
      else
      {
        this.pushdynamicData();
      }
    }
    else
    {
      this.loginWindow()
    }
  },
  ChooseImage() {
    wx.chooseImage({
      count: 9, //默认9
      sizeType: ['compressed'], //可以指定是原图还是压缩图，默认二者都有
      sourceType: ['camera', 'album'], //从相册选择

      success: (res) => {
        filePath = res.tempFilePaths
        filePath.forEach((item, idx) => {
          var fileName = Date.now() + "_" + idx;
          this.cloudFile(fileName, item)
        })

      }
    });
  },
  cloudFile(fileName, path) {
    wx.showLoading({
      title: '图片上传中',
    })
    wx.cloud.uploadFile({
      cloudPath: "dynamicPic/" + fileName + ".jpg",
      filePath: path
    }).then(res => {

      arrList.push(res.fileID);
      this.setData({
        imgList: arrList,
      })
      wx.hideLoading({
        success: (res) => { },
      })
    })
  },
  ViewImage(e) {
    wx.previewImage({
      urls: this.data.imgList,
      current: e.currentTarget.dataset.url
    });
  },
  DelImg(e) {
    wx.showModal({
      title: '召唤师',
      content: '确定要删除这张图片吗？',
      cancelText: '再看看',
      confirmText: '再见',
      success: res => {
        if (res.confirm) {
          this.data.dynamic.imgList.splice(e.currentTarget.dataset.index, 1);
          this.setData({
            "dynamic.imgList": this.data.imgList
          })
        }
      }
    })
  },

  sort(e)
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
    
    var index=e.currentTarget.dataset.index
    var title=e.currentTarget.dataset.title
    var colorList=this.data.ColorList
    var str = colorList[index].name;
    colorList[index].name="bg-"+str.substring(5)
    this.setData({
      ColorList:colorList
    })
    this.data.showPlace=title
  },
  formSubmit(e) {
    var that = this
    var thingName = e.detail.value.thingName
    var detailInfo = e.detail.value.detailInfo
    var linkInfo = e.detail.value.linkInfo
    if (thingName == '' || detailInfo == '' || linkInfo == '' ||this.data.type == '')
    {
      wx.showToast({
        title: '请完善类型选择、物品名称、描述、联系方式',
        icon:'none',
        duration:2000
      })
    }
    else
    {
      that.pushData(thingName, detailInfo, linkInfo)
    }
  },

  pushData(thingName, detailInfo, linkInfo)
  {
    wx.showLoading({
      title: '发布中...',
      mask:true
    })
    db.collection('findThings')
    .add({
      data:{
        type:this.data.type,
        thingName:thingName,
        detailInfo:detailInfo,
        linkInfo:linkInfo,
        imgList: this.data.imgList,
        time: new Date().getTime(),
        sort:this.data.showPlace,
        exit:true,
        finish:false,
      }
    })
    .then(res=>{
      wx.hideLoading({
        success: (res) => {
          wx.showToast({
            title: '发布成功！',
            duration:1000
          })
          setTimeout(() => {
            wx.reLaunch({
              url: '../../findThings/findThings',
            })
          }, 1000);
        },
      })
    })

  }
})