// utils/share.js
import Taro from '@tarojs/taro'

/**
 * 统一分享到朋友圈功能
 * @param {Object} options 分享配置
 * @param {string} options.title 分享标题
 * @param {string} [options.imageUrl] 分享图片
 * @param {string} [options.path] 小程序路径
 * @param {string} [options.query] 小程序查询参数
 */
export const shareToMoments = (options) => {
  const env = Taro.getEnv()

  switch (env) {
    // 微信小程序环境
    case Taro.ENV_TYPE.WEAPP:
      return handleWechatShare(options)
    // H5网页环境
    case Taro.ENV_TYPE.WEB:
      return handleH5Share(options)
    // React Native环境
    case Taro.ENV_TYPE.RN:
      return handleRNShare(options)
    // 其他小程序环境
    case Taro.ENV_TYPE.ALIPAY:
    case Taro.ENV_TYPE.SWAN:
    default:
      return handleDefaultShare(options, env)
  }
}

// 微信小程序
const handleWechatShare = (options) => {
  Taro.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage', 'shareTimeline']
  })

}

// H5网页处理
const handleH5Share = (options) => {
  if (navigator.share) {
    return navigator.share({
      title: options.title,
      text: options.desc || '',
      url: window.location.href
    }).catch(err => {
      console.error('分享失败:', err)
      showManualShareTip(options)
    })
  } else {
    return showManualShareTip(options)
  }
}

// React Native处理
const handleRNShare = async (options) => {
  try {
    const { ShareModule } = NativeModules
    return await ShareModule.shareToWechatMoments({
      title: options.title,
      imageUrl: options.imageUrl
    })
  } catch (err) {
    console.error('RN分享失败:', err)
    return { success: false }
  }
}

// 默认处理
const handleDefaultShare = (options, env) => {
  console.warn(`环境 ${env} 不支持直接分享到朋友圈`)
  return showManualShareTip(options)
}

// 显示手动分享提示
const showManualShareTip = (options) => {
  Taro.showModal({
    title: '分享提示',
    content: '请手动分享到朋友圈',
    showCancel: false
  })
  return { success: true, method: 'manual' }
}



// 分享给微信好友
export const shareToFriends = (options) => {
  const env = Taro.getEnv()

  switch (env) {
    case Taro.ENV_TYPE.WEAPP:
      return handleWechatFriendShare(options)
    case Taro.ENV_TYPE.WEB:
      return handleH5FriendShare(options)
    case Taro.ENV_TYPE.RN:
      return handleRNFriendShare(options)
    default:
      return handleDefaultFriendShare(options, env)
  }
}

// 微信小程序
const handleWechatFriendShare = (options) => {
  Taro.showShareMenu({
    withShareTicket: true,
    menus: ['shareAppMessage'] // 分享给好友
  })

  Taro.showToast({
    title: '请通过右上角菜单发送给朋友',
    icon: 'none',
    duration: 2000
  })

  return { success: true, method: 'weapp' }
}

// H5
const handleH5FriendShare = (options) => {
  if (navigator.share) {
    return navigator.share({
      title: options.title,
      text: options.desc || '',
      url: window.location.href
    }).catch(err => {
      console.error('H5分享失败:', err)
      showManualFriendShareTip()
    })
  } else {
    return showManualFriendShareTip()
  }
}

// React Native
const handleRNFriendShare = async (options) => {
  try {
    const { ShareModule } = NativeModules
    return await ShareModule.shareToWechatFriends({
      title: options.title,
      imageUrl: options.imageUrl,
      path: options.path
    })
  } catch (err) {
    console.error('RN好友分享失败:', err)
    return { success: false }
  }
}

//默认
const handleDefaultFriendShare = (options, env) => {
  console.warn(`环境 ${env} 不支持直接分享到微信好友`)
  return showManualFriendShareTip()
}

//手动分享
const showManualFriendShareTip = () => {
  Taro.showModal({
    title: '分享提示',
    content: '请通过平台提供的方式手动发送给微信好友',
    showCancel: false
  })
  return { success: true, method: 'manual' }
}