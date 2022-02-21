// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init(
  {env: cloud.DYNAMIC_CURRENT_ENV}
)
const db=cloud.database();
const _ = db.command
// 云函数入口函数
exports.main = async (event, context) => {
  var num=event.num;
  var plate=event.plate;
  var page=event.page;
  var openid=event.userInfo.openId;
  if(plate==1)
  {
    return await db.collection("dynamic")
    .where({
    })
    .orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
  if(plate==2)
  {
    return await db.collection("dynamic")
    .where({
      "dynamic.time":_.gt(event.time)
    })
    .orderBy("dynamic.praise", "desc").skip(page).limit(num).get()
  }
  if(plate==3)
  {
    return await db.collection("dynamic").where({_openid:openid}).orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
  if(plate==4)
  {
    return await db.collection("dynamic").where({_openid:event.persionOpenid}).orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
  if(plate==5)
  {
    return await db.collection("dynamic")
    .orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
  //新生指南
  if(plate==6)
  {
    return await db.collection("essay")
    .orderBy("_updateTime", "desc")
    .skip(page)
    .limit(num)
    .get()
  }
  //社团
  if(plate==7)
  {
    return await db.collection("essay")
    .orderBy("_updateTime", "desc")
    .where({type:"1"})
    .skip(page)
    .limit(num)
    .get()
  }
   //社团
   if(plate==9)
   {
     return await db.collection("essay")
     .orderBy("_updateTime", "desc")
     .where({type:"3"})
     .skip(page)
     .limit(num)
     .get()
   }
  if(plate==10)
  {
    return await db.collection("hometown")
     .orderBy("_updateTime", "desc")
     .skip(page)
     .limit(num)
     .get()
  }
  
}