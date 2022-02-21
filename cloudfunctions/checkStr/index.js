// 云函数模板
// 部署：在 cloud-functions/login 文件夹右击选择 “上传并部署”

const cloud = require('wx-server-sdk')

// 初始化 cloud
cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

exports.main = async (event, context) => {
  // //console.log(event)
  // try{
  //   return await cloud.openapi.security.msgSecCheck({
  //     content: event.text,
  //   })
  // }
  try {
    const res = await cloud.openapi.security.msgSecCheck({
      content: event.text,
    })
    return res
  } catch (err) {
    return err
  }
}

