const app = getApp()
const db = wx.cloud.database()
let todayCourseList=[]
let today = new Date();


async function getCourseStorage(courseKey) {
   let coursesList = [];
  await wx.getStorage({
    key: courseKey
  }).then(res => {
    coursesList = res.data;
  }).catch(err => {
  })
  return {
    coursesList
  }
}
/**
 * 从数据库获取课表,并写入缓存
 */

async function getCourse(myClass,currentWeek) {
  
  let courseKey = myClass
  let coursesList = []
  await wx.cloud.callFunction({
    name: 'getCourse',
     data: {
      myClass,
      currentWeek
     }
  }).then(res => {
   coursesList = setCourseColor(res.result.data);  
    wx.setStorage({
      key: courseKey,
      data: coursesList,
      success: res => {
      },
      fail: err => {
      },
    })
  }
  ).catch(res => {
    })
  return {
    coursesList,

  }
}


function setCourseColor(coursesList) {
  /**
   * 识别同名课，设定同颜色；
   */
  let courseColor = {};
  let colorNum = 0;
  for (let i = 0; i < coursesList.length; i++) {
    let course = coursesList[i];
    if (!courseColor.hasOwnProperty(course.name)) {
      courseColor[course.name] = colorNum;
      colorNum++;
    }
    coursesList[i].color = courseColor[course.name];
  }
  return coursesList;
}

function checkWeek(weeks, beginWeek, endWeek) {
  for (let i = 0; i < weeks.length; i++) {
    if (weeks[i] >= beginWeek && weeks[i] <= endWeek) {
      return true;
    }
  }
  return false;
}

//获取当前学期的周数
async function getCurrentWeek(){
  let date = today;
  let currentWeek=-1
  //在数据库获取学期开始时间
  await db.collection('system')
  .doc('dateStartId123')
  .get().then(res => {
    // res.data 包含该记录的数据
    let dateStart = new Date(res.data.dateStart); 
    currentWeek = Math.floor((date - dateStart) / (1000 * 60 * 60 * 24) / 7 + 1);
  })
  return currentWeek;  
}

//获取当前学期
async function getCurrentTerm(){
  let term;
  await db.collection('system')
  .doc('dateStartId123')
  .get().then(res => {
     term = res.data.term
  })
  return term;  
}

async function getTodayCourse(myClass){
  let currentWeek
  let todayCourseList =[]
  let status=true            //用于提示查无班级
 //获取当前周
  if(!app.globalData.currentWeek){ 
    //如果没有week则获取
    currentWeek=await getCurrentWeek();  
    app.globalData.currentWeek=currentWeek;
  }
  else{
    currentWeek = app.globalData.currentWeek
  }
  if(todayCourseList.length==0||todayCourseList[0].class!=myClass){
    let day=today.getDay();
    if(day==0){
      day=7;           //修改为星期日
    }
  let coursesList = [];   //当前所选学期课程数据
  let dataObj = await getCourseStorage(myClass);  
  let currentTerm = await getCurrentTerm();
  if (dataObj.coursesList.length == 0 ||currentTerm != dataObj.coursesList[0].term) {      //缓存没有数据时  
    dataObj = await getCourse(myClass,currentWeek);
  }

  //获取到课表，进行处理
  let RcoursesList = dataObj.coursesList
  let todayCourse=[];
    if(RcoursesList.length==0){
      status=false;
    }
    for(let n=0;n<RcoursesList.length;n++){
      if(RcoursesList[n].day==day&&checkWeek(RcoursesList[n].weeksNum,currentWeek,currentWeek)){       //3=day 测试用
        todayCourseList.push(RcoursesList[n]);
      }
    }
   //todayCourseList.sort(function(a, b){return a.beginTime - b.beginTime});
  }
  return {
    todayCourseList:todayCourseList,
    status:status,
    currentWeek:currentWeek
  }
}

//正常执行 获取班级信息 18工业工程1 return => myClass
async function getUserClass(){
  if(!app.globalData.myClass){
    await wx.cloud.callFunction({
      name: 'getUserInfo'
    }).then(res => {
      let info = res.result.info
      if (info && info.length > 0) {
        app.globalData.myClass=info[0].myClass
      }
    }).catch(res => {
    })
  }
  return app.globalData.myClass;
}
let todayWeek=today.getDay();
if(todayWeek==0){
  todayWeek=7;
}

Page({
  data: {
    oneTextId:'',
    CustomBar: app.globalData.CustomBar,
    todayWeek:todayWeek,
    showHeader:true,
    showTip:false,
    showApp:false,
    tipStr:'今天没课，去看看完整课表吧',
    currentWeek:'',
    myClass: '无班级数据',
    courseData: [],
    /*默认加载的indexlist数据*/
    indexlist: [],
    days: ['星期一', '星期二', '星期三', '星期四', '星期五', '星期六', '星期日'],
    time: [
      ['08:00', '08:40'],
      ['08:45', '09:25'],
      ['09:40', '10:20'],
      ['10:25', '11:05'],
      ['11:10', '11:50'],
      ['13:30', '14:10'],
      ['14:15', '14:55'],
      ['15:10', '15:50'],
      ['15:55', '16:35'],
      ['16:40', '17:20'],
      ['18:30', '19:10'],
      ['19:15', '19:55'],
      ['20:05', '20:45'],
      ['20:50', '21:30'],
    ],
    tip:false
  },
  toMyInfo(e){
    wx.navigateTo({
      url: '/pages/my-info/my-info'
    })
  },
  
 flushCoures() {
  wx.showLoading({
    title: '刷新中',
  })
  this.loadCourse(true);
  wx.hideLoading()
},
loadCourse: function (flush){
  let that = this   
 let tipStr = "今天没课，去看看完整课表吧"
  getUserClass().then(res=>{
    that.setData({
      myClass: res
    })
    getTodayCourse(res).then(res=>{
      if(!res.status){
        tipStr='暂无您的班级课程数据'
      }
      let currentWeek='第'+app.globalData.currentWeek+'周'

      if(res.currentWeek>19||res.currentWeek<1){
        tipStr='放假中...'
        currentWeek=''
      }  
      that.setData({
        showTip:true,
        courseData:res.todayCourseList,
        tipStr,
        currentWeek
      })
    })
  })
},

  onLoad: function (query) {
    this.countAllDots()
    if(wx.getStorageSync('tip'))
    {
      this.setData({
        tip:wx.getStorageSync('tip')
      })
    }
    else
    {
      wx.setStorageSync('tip',false)
    }
    let tipStr='今天没课，去看看完整课表吧'
    let that=this
    getUserClass().then(res=>{
      that.setData({
        myClass: res
      })
      getTodayCourse(res).then(res=>{
        if(!res.status){
          tipStr='暂无您的班级课程数据'
        }
        let currentWeek='第'+res.currentWeek+'周'
        if(res.currentWeek>19||res.currentWeek<1){
          tipStr='放假中...'
          currentWeek=''
        }
        that.setData({
          showTip:true,
          courseData:res.todayCourseList,
          tipStr,
          currentWeek
        })
        
      })
    
 
    })

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
    title: '快来看看《今日课表》吧',
    path: '/pages/courseIndex/courseIndex'
  }
},
onPullDownRefresh:function(){
  var that=this;
  that.onLoad();
  wx.stopPullDownRefresh({})
  wx.showToast({
    title: '已刷新',
    icon:'none'
  })
},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.tabBar()
    if (app.globalData.flushC) {
      this.flushCoures()
      app.globalData.flushC = false
    }
  },
 
  back(){
    wx.navigateBack({
      delta: 0,
    })
  },
  tabBar() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },
  changTip()
  {
    this.setData({
      tip:true
    })
    wx.setStorageSync('tip',true)
  },
  //进入空教室查询
  inClassroom()
  {
    var that=this;
    that.setData({
      animation0: 'animation-scale-down'
    })
    setTimeout(function() {
      that.setData({
        animation0: ''
      })
      wx.navigateTo({
        url: '../side/classroom/classroom',
      })
    }, 600)
  },
  //进入闲置物品
  inSecondHand()
  {
   var that=this;
   that.setData({
     animation1: 'animation-scale-down'
   })
   setTimeout(function() {
     that.setData({
       animation1: ''
     })
  wx.openEmbeddedMiniProgram({
    appId: 'wx4d86dadb0d92172f',
    success(res) {},
    fail: function (err) {}
  })
   }, 600)
  },
   //进入失物招领
   inFindThing()
   {
     var that=this;
     that.setData({
       animation2: 'animation-scale-down'
     })
     setTimeout(function() {
       that.setData({
         animation2: ''
       })
       wx.navigateTo({
        url: '../side/findThings/findThings',
      })
     }, 600)
   },
   //进入新生易知
   inNewStudent()
   {
    var that=this;
    that.setData({
      animation3: 'animation-scale-down'
    })
    setTimeout(function() {
      that.setData({
        animation3: ''
      })
      wx.navigateTo({
        url: '../side/newStudent/newStudent',
      })
    }, 600)
   },
   //进入校历作息
   inSchoolTime()
   {
    var that=this;
    that.setData({
      animation4: 'animation-scale-down'
    })
    setTimeout(function() {
      that.setData({
        animation4: ''
      })
      wx.navigateTo({
        url: '../side/plan/plan',
      })
    }, 600)
   },
   //进入更多
   inMore()
   {
    var that=this;
    that.setData({
      animation5: 'animation-scale-down'
    })
    setTimeout(function() {
      that.setData({
        animation5: ''
      })
      wx.navigateTo({
        url: '../mine/suggest/suggest',
      })
    }, 600)
   },
   // 计算所有未读消息个数
  countAllDots() {
    let that = this
    //获取未读消息个数
    db.collection('message')
      .where({
        _openid: wx.getStorageSync('openid')
      })
      .get()
      .then(res => {
        try{
          var commentDotNum = 0
          var praiseDotNum = 0
          var systemDotNum = 0
          var i = 0
          for (i = 0; i < res.data[0].comment.length; i++) {
            if (res.data[0].comment[i].dot) {
              commentDotNum = commentDotNum + 1
            }
          }
          for (i = 0; i < res.data[0].praise.length; i++) {
            if (res.data[0].praise[i].dot) {
              praiseDotNum = praiseDotNum + 1
            }
          }
          for (i = 0; i < res.data[0].system.length; i++) {
            if (res.data[0].system[i].dot) {
              systemDotNum = systemDotNum + 1
            }
          }
          var allDots = commentDotNum + praiseDotNum + systemDotNum;
          wx.setStorageSync('dotsNum',allDots.toString())
          if(allDots.toString()!='0')
          {
            wx.setTabBarBadge({
              index: 2,
              text: allDots.toString()
            })
          }
        }
        catch
        {
          
        }
      })
  },
})
