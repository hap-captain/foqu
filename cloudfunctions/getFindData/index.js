// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init(
  {env: cloud.DYNAMIC_CURRENT_ENV}
)
const db=cloud.database();
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  var num=event.num;
  var plate=event.plate;
  var page=event.page;
  var tabNum=event.tabNum
  if(plate==0)
  {
    return await db.collection("findThings")
    .where({
      type:"寻找物品",
      exit:true
    })
    .orderBy("time", "desc").skip(page).limit(num).get()
  }
  if(plate==1)
  {
    return await db.collection("findThings")
    .where({
      type:"寻找失主",
      exit:true
    })
    .orderBy("time", "desc").skip(page).limit(num).get()
  }
  if(plate==2)
  {
    return await db.collection("findThings")
    .where({
      _openid:wxContext.OPENID,
      exit:true
    })
    .orderBy("time", "desc").skip(page).limit(num).get()
  }
  if(tabNum == 0)
  {
    return await db.collection("findThings")
    .where({
      type:"寻找物品",
      sort:plate,
      exit:true
    })
    .orderBy("time", "desc").skip(page).limit(num).get()
  }
  if(tabNum == 1)
  {
    return await db.collection("findThings")
    .where({
      type:"寻找失主",
      sort:plate,
      exit:true
    })
    .orderBy("time", "desc").skip(page).limit(num).get()
  }

  return {
    event,
    openid: wxContext.OPENID,
    appid: wxContext.APPID,
    unionid: wxContext.UNIONID,
  }
}