/**
 * 要初始化的信息：当前学期，当前周次，班级
 * 
 * 1第一次加载
 * 2切换周次
 * 3切换学期
 * 4切换班级
 * 优先加载本地缓存课程数据，下拉刷新缓存
 * {
 *  '班名':{
 *      '2019-2020-1':[],
 *      '2019-2020-2':[]
 *  },
 * '班名2':{
 *      '2019-2020-1':[],
 *      '2019-2020-2':[]
 *  },
 * }
 */
const app = getApp()
const db = wx.cloud.database()
async function getMyCourse(myClass, term, flush) {
  if (!app.globalData.allCourseData) {
    app.globalData.allCourseData = {}
  }
  let coursesList = [];                              //当前所选学期课程数据
  let courseKey = myClass
  const res = wx.getStorageInfoSync()

  if (flush) {
    //刷新数据
    let dataObj
    dataObj = await getCourse(myClass, term);
    coursesList = dataObj.coursesList
    app.globalData.allCourseData[courseKey] = coursesList;
    return {
      coursesList,
    }
  } else {
    //内存中没有数据时
    if (!app.globalData.allCourseData.hasOwnProperty(courseKey)) {
      //从缓存获取
      let dataObj
      dataObj = await getCourseStorage(courseKey);

      if (dataObj.coursesList.length == 0) {
        //缓存没有数据时
        dataObj = await getCourse(myClass, term);
      }
      coursesList = dataObj.coursesList
      app.globalData.allCourseData[courseKey] = coursesList;
      return {
        coursesList,
      }
    } else {
      return {
        coursesList:app.globalData.allCourseData[courseKey],
      }
    }
  }
}
/**
 * 从缓存读取课表
 */
async function getCourseStorage(courseKey) {
  let coursesList = [];
  await wx.getStorage({
    key: courseKey
  }).then(res => {  
    coursesList = res.data;
  }).catch(err => {
  })
  return {
    coursesList,
  }
}
/**
 * 从数据库获取课表,并写入缓存
 */
async function getCourse(myClass, term) {
  let courseKey = myClass
  let coursesList = []
  await wx.cloud.callFunction({
    name: 'getCourse',
    data: {
      myClass,
    }
  }).then(res => {
    coursesList = setCourseColor(res.result.data);                    
    wx.setStorage({
      key: courseKey,                        //courseKey = 19网络工程-2020-2021-2
      data: coursesList,                     //本班级的所有课程
      success: res => {
      },
      fail: err => {
      },
    })

  })
    .catch(res => {
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


//获取当前为第几周
async function getCurrentWeek() {
  let date = new Date();
  let currentWeek = -1
  if (!app.globalData.currentWeek) {
    await db.collection('system')
    .doc('dateStartId123')
    .get().then(res => {
      // res.data 包含该记录的数据
      let dateStart = new Date(res.data.dateStart);
      app.globalData.currentWeek = Math.floor((date - dateStart) / (1000 * 60 * 60 * 24) / 7 + 1);
      currentWeek = app.globalData.currentWeek
    })
  } else {
    currentWeek = app.globalData.currentWeek
  }
  return currentWeek;
}

Page({

  data: {
    CustomBar: app.globalData.CustomBar,
    showCourseDialog: false,
    showSetDialog: false,
    keepWeek: false,
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    weeks: [
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,17,18,19],
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,17,18,19]],
    weeksIndex: [0, 0],
    colors: ['#EA7C79', '#F49B52', '#F9C439', '#AAD572', '#56B64C', '#53BEB7',
      '#3694FB', '#6A3BB7', '#A549B7', '#E66DB6', '#EDE1D9', '#E8EBED'],
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
    courses: [[], [], [], [], [], [], []],
    beizhu:'暂无',
    selectCourses: [],
    beginWeek: 1,
    endWeek: 19,
    myClass: '',
    moreCourse: [{}, {}, {}, {}, {}, {}, {}],//重复的课程中选出周次最早的课程
    tip:false
  },
  /**
   * 点击课程查看详情,有重复课程时显示多个
   */
  bindtapCourse: function (e) {
    let course = e.currentTarget.dataset.course
    let day = course.day
    let todayCourses = this.data.courses[day - 1]
    let selectCourses = []
    for (let i = 0; i < todayCourses.length; i++) {
      if (todayCourses[i].beginTime == course.beginTime) {
        selectCourses.unshift(todayCourses[i])
      }
    }
    this.setData({
      showCourseDialog: true,
      selectCourses
    })
  },
  /**
   * 关闭课程详情
   */
  closeCourseDialog: function (e) {
    this.setData({
      showCourseDialog: false
    })
  },

  /**
   * 打开设置
   */
  openSetting: function (e) {
    this.setData({
      showSetDialog: true
    })
  },
  /**
   * 关闭设置弹窗
   */
  closeSetting: function (e) {
    this.setData({
      showSetDialog: false
    })
  },
  /**
   * 设置周次范围
   */
  changeWeeks: function (e) {
    let weeks = this.data.weeks;
    this.setData({
      beginWeek: weeks[0][e.detail.value[0]],
      endWeek: weeks[1][e.detail.value[1]]
    })
    this.loadCourse(false);

    let beginWeek = this.data.beginWeek;
    let endWeek = this.data.endWeek;
    let weekStr = beginWeek + '-' + endWeek;
    if (beginWeek == endWeek) {
      weekStr = endWeek;
    }
    wx.setNavigationBarTitle({
      title: '第' + weekStr + '周'
    })
    let keepWeek = this.data.keepWeek;
    wx.setStorage({
      key: 'keepWeek',
      data: {
        keepWeek,
        beginWeek,
        endWeek
      }
    })
  },
  bindWeeksColumnChange: function (e) {
    let weeks = this.data.weeks;
    let weeksIndex = this.data.weeksIndex
    weeksIndex[e.detail.column] = e.detail.value;
    if (e.detail.column == 0) {
      weeks[1] = Array(19 - e.detail.value);
      for (let i = 0; i < weeks[1].length; i++) {
        weeks[1][i] = i + e.detail.value + 1;
      }
      weeksIndex[1] = 0;
    }
    this.setData({
      weeks,
      weeksIndex
    })
  },

  /**
   * 保持周次范围设置
   */
  keepWeekSet: function (e) {
    let beginWeek = this.data.beginWeek;
    let endWeek = this.data.endWeek;
    this.setData({
      keepWeek: e.detail.value
    })
    wx.setStorage({
      key: 'keepWeek',
      data: {
        keepWeek: e.detail.value,
        beginWeek,
        endWeek
      },
      success: res => {
        wx.showToast({
          title: '设置成功',
          icon: 'success',
          duration: 1000
        })
      },
      fail: err => {
        wx.showToast({
          title: '设置失败',
          icon: 'none',
          duration: 2000
        })
      },
    })
  },

  clearS: function (e) {
    let res = wx.getStorageInfoSync()
    for (let i = 0; i < res.keys.length; i++) {
      wx.removeStorageSync(res.keys[i])
    }
  },
  /**
   * 加载和筛选课程数据
   */
  loadCourse: function (flush) {
    let myClass = app.globalData.myClass
    if (myClass.length < 4) {
      //没有绑定班级时
      myClass = 'abc'
    }
    let that = this
    getMyCourse(myClass, that.data.termStr, flush).then((res) => {
      let coursesList = res.coursesList
      that.data.beizhu=res.beizhu
  
      /**
       * 根据设置的周次范围筛选课程
       */
      let coursesArray = [[], [], [], [], [], [], []];//用于渲染页面的课程数据
      let flag = [{}, {}, {}, {}, {}, {}, {}];//同时开始的课程的标记
      let moreCourse = [{}, {}, {}, {}, {}, {}, {}];//重复的课程中选出周次最早的课程
      let count=0;
      for (let i = 0; i < coursesList.length; i++) {
        let course = coursesList[i];
        let d = coursesList[i].day - 1;
        if (checkWeek(course.weeksNum, this.data.beginWeek, this.data.endWeek)) {
          count++;
          //根据day添加进二维数组渲染到页面
          if (flag[d].hasOwnProperty(course.beginTime) &&
            course.weeksNum[0] > flag[d][course.beginTime]) {
            //在前面添加，不显示
            coursesArray[d].unshift(course);
          } else {
            //在后面添加，显示
            flag[d][course.beginTime] = course.weeksNum[0];
            coursesArray[d].push(course);
          }

          if (moreCourse[d].hasOwnProperty(course.beginTime)) {
            if (course.weeksNum[0] < moreCourse[d][course.beginTime].course.weeksNum[0]) {
              moreCourse[d][course.beginTime].course = course
            }
            moreCourse[d][course.beginTime].num = 2
          } else {
            moreCourse[d][course.beginTime] = {
              course: course,
              num: 1
            }
          }
        }
      }
      that.setData({
        courses: coursesArray,
        moreCourse
      })
      if (flush) {
        wx.hideLoading();
        wx.stopPullDownRefresh();
        if (coursesList.length == 0) {
          wx.showToast({
            title: '刷新失败',
            icon: 'none',
            duration: 2000
          })
        } else {
          wx.showToast({
            title: '刷新成功',
            icon: 'success',
            duration: 500
          })
        }
      } else {
       wx.hideLoading()                            //这个在真机调试会保存
      }
      if (coursesList.length == 0) {
        wx.showToast({
          title: '本学期暂无您的班级课程信息',
          icon: 'none',
          duration: 2000
        })
      }
      if(count==0&&coursesList.length>0){
        wx.showToast({
          title: '今周没有课，可修改周次范围查看全部课',
          icon: 'none',
          duration: 3000
        })
      }
    }).catch(res => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '网络异常',
        icon: 'none',
        duration: 2000
      })
      wx.hideLoading();
    })
  },

  toCurrentWeek: function (termStr) {
    
    let date = new Date();
    let that = this
    //查询当前学期的开学时间，初始化当前是第几周
    getCurrentWeek(termStr).then(currentWeek => {
      let beginWeek = 1;
      let endWeek = 19;
      if (currentWeek <= 19 && currentWeek > 0) {
        beginWeek = currentWeek;
        endWeek = currentWeek;
      }
      that.setData({
        beginWeek,
        endWeek
      })
      let weekStr = beginWeek + '-' + endWeek;
      if (beginWeek == endWeek) {
        weekStr = endWeek;
      }
      wx.setNavigationBarTitle({
        title: '第' + weekStr + '周(' + termStr + ')'
      })
      this.loadCourse(false);
    }).catch(res => {
      wx.hideLoading();
    })
  },
  loadData: function (myClass) {
    wx.showLoading({
      title: '加载中',
    })
    setTimeout(function () {
      wx.hideLoading()
    }, 4000)
    let that = this
    let date = new Date();
    let y = date.getFullYear();
    let month = date.getMonth() + 1;
    let termList = ['2020-2021-2']                    //学期写定，不进行学期更改查询
    this.setData({
      term: 0,
      termStr: termList[0],
      termList,
      myClass
    })
    try {
      let res = wx.getStorageSync('keepWeek')
      if (res) {
        if (res.keepWeek) {
          that.setData({
            keepWeek: res.keepWeek,
            beginWeek: res.beginWeek,
            endWeek: res.endWeek
          })
          let weekStr = res.beginWeek + '-' + res.endWeek;
          if (res.beginWeek == res.endWeek) {
            weekStr = res.endWeek;
          }
          wx.setNavigationBarTitle({
            title: '第' + weekStr + '周(' + termList[0] + ')'
          })
          this.loadCourse(false);
        } else {
          this.toCurrentWeek(termList[0]);
        }
      } else {
        this.toCurrentWeek(termList[0]);
      }
    } catch (err) {
      this.toCurrentWeek(termList[0]);
    }
  },
  flushCoures() {
    wx.showLoading({
      title: '刷新中',
    })
    this.loadCourse(true);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if(wx.getStorageSync('tip1'))
    {
      this.setData({
        tip:wx.getStorageSync('tip1')
      })
    }
    else
    {
      wx.setStorageSync('tip1',false)
    }
    let that = this
    if (!app.globalData.myClass) {
      wx.cloud.callFunction({
        name: 'getUserInfo'
      }).then(res => {
        let info = res.result.info
        if (info && info.length > 0) {
          app.globalData.myClass = info[0].myClass
          that.setData({
            myClass: info[0].myClass
          })
          this.loadData(info[0].myClass)
        } else {
          wx.showModal({
            title: '提示',
            content: '您未绑定班级信息，无法查询课表数据',
            confirmText: '去绑定',
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '/pages/my-info/my-info'
                })
              } else if (res.cancel) {
              }
            }
          })
        }
      }).catch(res => {
        wx.showToast({
          title: '网络异常',
          icon: 'none',
          duration: 2000
        })
      })
    } else {
      that.setData({
        myClass: app.globalData.myClass
      })
      this.loadData(app.globalData.myClass)
    }
  },

  onReady: function () {
  },

  onShow: function () {
    if (app.globalData.flushC) {
      this.flushCoures()
      //app.globalData.flushC = false
    }
  },
  onHide: function () {
    this.setData({
      showSetDialog: false
    })
  },

  onUnload: function () {

  },

  onPullDownRefresh: function () {
    this.flushCoures()
  },

  onReachBottom: function () {
  },

  onShareAppMessage: function () {
    this.setData({
      showSetDialog: false
    })
    return {
      title: '邀你使用佛大课程表',
      path: '/pages/course/course'
    }
  },
  changTip()
  {
    this.setData({
      tip:true
    })
    wx.setStorageSync('tip1',true)
  }
})