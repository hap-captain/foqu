// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})
const db = cloud.database()
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  let courses=[]
  let coursesDeleteTE=[]
  let PEState = 0
    let d = await db.collection('courses').where({
      'class': event.myClass,
    })
    .get()
    courses=d.data
   // console.log("indexOf(大学体育)=",courses[13].name.indexOf("大学体育"))
    for(let i=0;i<courses.length;i++)
    {
     // console.log("courses.name=",courses[i].name)
      if(courses[i].name.indexOf("大学体育") == -1){
        coursesDeleteTE.push(courses[i]);
      }
      else if (PEState == 0) {
        console.log("休息休息",courses[i].name)
        courses[i].name="大学体育";
        courses[i].teacher="体育老师";
        courses[i].place="按照体育老师安排";
        PEState = 1
        coursesDeleteTE.push(courses[i]);
     } else {}
    }
  return {
    data: coursesDeleteTE,
  }
}