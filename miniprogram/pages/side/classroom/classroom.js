//index.js
const app = getApp()
const db = wx.cloud.database()
const _ = db.command
var arr=[]
Page({
  data: {
    myTime: '整个早上',
    myDate: '周一',
    myDate2: 1,
    buildingIndex:0,
    date: ['周一','周二','周三','周四','周五','周六','周日'],
    date2:[1,2,3,4,5,6,7],
    DateIndex: 0,
    time: ['整个早上','整个下午','整个晚上'],//'8:00-9:30','9:30-12:00','12:00-15:00','15:00-16:30','16:30-18:30','18:30-20:00','20:00-21:30'
    time2:[-1,-2,-3,1,3,6,8,8,11,13],
    time3:[-1,-2,-3,2,5,7,9,10,12,14],
    timeIndex: 0,
    count:0,
    toggleDelay: false,
    emptyClassroom:[],
    emptyClassroom2:[],
    bitBtn:false,
    multiArray: [
      ['仙溪', '江湾'],
      ['c3','c4','c5','c6'],
    ],
    myplace1:'仙溪',
    myplace2:'c3',
    multiIndex: [0, 0],
    mybeginTime:-1,
    myendTime:-1,
    myWeek:14,
  },

  onLoad:function(){
    this.getCurrentWeek();
  },
  onShareAppMessage: function () {
    return {
      title: '佛趣空教室查询系统',
      path: ''
    }
  },
  //获取当前学期的周数
  async getCurrentWeek() {
    let date = new Date();
    let currentWeek = -1
    //在数据库获取学期开始时间
    await db.collection('system')
      .doc('dateStartId123')
      .get().then(res => {
        // res.data 包含该记录的数据
        let dateStart = new Date(res.data.dateStart);
        currentWeek = Math.floor((date - dateStart) / (1000 * 60 * 60 * 24) / 7 + 1);
      })
      this.setData({
        myWeek:currentWeek
      })
  },
  MultiColumnChange(e) {
    let multiArray = this.data.multiArray
    let multiIndex = this.data.multiIndex
    multiIndex[e.detail.column] = e.detail.value;
    switch (e.detail.column) {
      case 0:
        switch (multiIndex[0]) {
          case 0:
            multiArray[1] = ['c3', 'c4', 'c5','c6'];
            break;
          case 1:
            multiArray[1] = ['会通楼'];
            break;
        }
        multiIndex[1] = 0;
        break;
    }
    this.setData({
      multiArray:multiArray,
      multiIndex:multiIndex
    });
  },
  MultiChange(e) {
    this.setData({
      multiIndex: e.detail.value,
    })
    this.setData({
     myplace1:this.data.multiArray[0][this.data.multiIndex[0]],
     myplace2:this.data.multiArray[1][this.data.multiIndex[1]]
    })
  },
  selectDate(e){
    var index=e.detail.value
    this.setData({
      myDate:this.data.date[index],
      myDate2:this.data.date2[index]
    })
  },
  selectTime(e){
    var index=e.detail.value
    this.setData({
      myTime:this.data.time[index],
      mybeginTime:this.data.time2[index],
      myendTime:this.data.time3[index]
    })
  },
  async toggleDelay() {
    wx.showLoading({
      title: '拼命查询中...',
      mask:true
    })
    let that = this;
    this.setData({
      emptyClassroom:[]
    })
    db.collection('classroom').where({
      day:this.data.myDate2,
      beginTime:this.data.mybeginTime,
      endTime:this.data.myendTime,
      area:this.data.myplace1,
      weeksNum:this.data.myWeek
    }).get()
    .then(async res=>{
     try{
      var allData = res.data;
      that.setData({
        emptyClassroom2:allData[0].place.sort()
      },()=>{
      })
      arr= await that.findPlace2(that.data.emptyClassroom2,that.data.myplace2)
      that.setData({
        emptyClassroom:arr
      },() => {
        wx.hideLoading({})
        })
     }
     catch (error)
     {
       wx.showToast({
         title: '本周不是教学周，暂无可查询数据',
         icon:'none',
         duration:4000
       })
     }
    })
    that.setData({
      toggleDelay: true,
      bitBtn:true
    })
    setTimeout(function() {
      that.setData({
        toggleDelay: false,
      })
    }, 1000)
    // wx.showToast({
    //   title: '正在施工中···^^,很快就可查询',
    //   icon:'none',
    //   duration:2000
    // })
  },

 async findPlace2(emptyClassroom2 ,myplace2){
    arr=[];
    for(var i = 0;i<emptyClassroom2.length;i++){
      if(emptyClassroom2[i].indexOf(myplace2)!=-1){
        arr.push(emptyClassroom2[i])
      }
    }
    return arr;
  },
  
})
