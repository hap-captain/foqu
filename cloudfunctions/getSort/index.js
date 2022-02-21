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
  const wxContext = cloud.getWXContext()

  if(plate=='日常')
  {
    console.log('执行了日常')
    return await db.collection("dynamic")
    .where({
     'dynamic.showPlace':'日常'
    })
    .orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
  if(plate=='捞人')
  {
    return await db.collection("dynamic")
    .where({
      'dynamic.showPlace':'捞人'
    })
    .orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
  if(plate=='树洞')
  {
    return await db.collection("dynamic")
    .where({
      'dynamic.showPlace':'树洞'
    })
    .orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
  if(plate=='需求')
  {
    return await db.collection("dynamic")
    .where({
      'dynamic.showPlace':'需求'
    })
    .orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
  if(plate=='问答')
  {
    return await db.collection("dynamic")
    .where({
      'dynamic.showPlace':'问答'
    })
    .orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
  if(plate=='表白')
  {
    return await db.collection("dynamic")
    .where({
      'dynamic.showPlace':'表白'
    })
    .orderBy("dynamic.time", "desc").skip(page).limit(num).get()
  }
}