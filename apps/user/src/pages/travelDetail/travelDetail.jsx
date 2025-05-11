import React, { useState, useEffect, useRef } from 'react';
import Taro, { usePageScroll } from '@tarojs/taro';
import { View, Text, Image, Swiper, SwiperItem, Video } from '@tarojs/components';
import TravelTag from '@/components/TravelTag';
import TravelFooter from '@/components/TravelFooter';
import TravelHeader from '@/components/TravelHeader';
import MiniPlayer from '@/components/MiniPlayer';
import './travelDetail.scss';

const TravelDetail = () => {
  const [videoContext, setVideoContext] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [IsWifi, setIsWifi] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userClosedMiniPlayer, setUserClosedMiniPlayer] = useState(false);
  const videoPosition = useRef({ top: 0, height: 0 });
  const likeCount = 239;
  const commentCount = 6;
  const collectCount = 100;
  //模拟tag
  const tags = ['黄姚古镇等(6)', '松阳骑行(4)', '怒江'];
  // 模拟轮播图数据
  const swiperImages = [
    'https://picsum.photos/seed/11/430/1000',
    'https://picsum.photos/seed/21/430/1000',
    'https://picsum.photos/seed/31/430/1000',
    'https://picsum.photos/seed/41/430/1000',
    'https://picsum.photos/seed/5/430/1000',
  ];
  const videoUrl = 'https://media.w3.org/2010/05/sintel/trailer.mp4';
  const coverImageUrl= "https://wonderland-1328561145.cos.ap-shanghai.myqcloud.com/1746612338265-9950-man.jpg"

  // 模拟文章数据
  const articleData = {
    title: '五一不挤适合小住三天的四个冷门城市',
    username: '小探旅游博主',
    avatar: 'https://picsum.photos/seed/1/100/100',
    content: `## 黄姚古镇·广西昭平
    ### **特色亮点**
    1. **明清古建筑群**
       保存完好的青砖黛瓦、石板街巷，夜晚灯笼亮起时仿佛穿越回古代。
    2. **山水画卷**
       古镇被喀斯特群山环抱，带龙桥、鲤鱼街等景点随手一拍就是大片。
    3. **隐世美食**
       必尝豆腐酿、豆豉蒸排骨，推荐「古井农庄」的柴火饭。

    **住宿建议**：选择古镇内的精品民宿（如「拾方传家」），推开窗即是风景。

    ---

    ## 松阳·浙江丽水
    ### **秘境体验**
    - **云端村落**：杨家堂村被称为"江南最后的秘境"，黄昏时金色民居与炊烟构成油画般的场景。
    - **茶园骑行**：大木山茶园有专用骑行道，租辆自行车穿梭在茶海中。
    - **手作工坊**：体验非遗「松阳高腔」剪纸或古法红糖制作。

    **Tips**：5月正值采茶季，可参与制茶体验。

    ---

    ## 丙中洛·云南怒江
    ### **小众玩法**
    ✔ **怒江第一湾**：徒步至观景台俯瞰马蹄形江湾，云雾缭绕时宛如仙境。
    ✔ **茶马古道**：跟随向导重走马帮路线，探访隐世的秋那桶村。
    ✔ **多民族风情**：傈僳族、怒族村落里喝一碗酥油茶，听原生态民歌。

    **交通**：建议包车游玩，注意防滑鞋必备。

    ---

    ## 南矶山·江西南昌
    ### **自然野趣**
    - **候鸟天堂**：5月湿地可见白鹤、天鹅，摄影爱好者必去。
    - **草海奇观**：鄱阳湖枯水期形成的"草原"，适合露营看星空。
    - **渔家乐**：现捞现做的银鱼蒸蛋鲜美无比。

    **最佳时间**：清晨或傍晚游览，避开正午暴晒。

    ---

    ### **结语**
    这些冷门地商业化低，适合放慢节奏小住。记得带相机和驱蚊液！
    `,
  };

  // 监听页面滚动，但不在这里处理小窗口逻辑
  usePageScroll(() => {
    // 保留此钩子以便将来可能需要响应滚动事件
  });

  // 判断网络情况
  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const res = await Taro.getNetworkType();
        const isAllowedNetwork = (
          res.networkType === 'wifi'
        );
        setIsWifi(isAllowedNetwork);
        console.log('网络状态', res.networkType);
      } catch (error) {
        console.error('获取网络状态失败:', error);
      }
    };

    checkNetworkStatus();

    // 监听网络状态变化
    Taro.onNetworkStatusChange(res => {
      const isAllowedNetwork = (
        res.networkType === 'wifi'
      );
      setIsWifi(isAllowedNetwork);
      console.log('网络状态变化', res.networkType, isAllowedNetwork);
    });

    // 创建视频上下文
    if (videoUrl) {
      try {
        const context = Taro.createVideoContext('travel-video');
        setVideoContext(context);
      } catch (error) {
        console.error('视频上下文创建失败:', error);
      }
    }

    return () => {
      // 页面卸载时移除网络状态监听
      Taro.offNetworkStatusChange();
    };
  }, []);

  // 点击图片全屏查看
  const handleImagePreview = (current) => {
    Taro.previewImage({
      current,
      urls: swiperImages,
    });
  };

  // 处理分享功能
  const handleShare = () => {
    setShowShareModal(true);
  };

  // 关闭分享模态框
  const handleCloseShareModal = () => {
    setShowShareModal(false);
  };

  // 分享到微信
  const handleShareToWechat = () => {
    // 使用小程序原生分享
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });

    // 关闭分享模态框
    handleCloseShareModal();
  };

  // 分享到朋友圈
  const handleShareToMoments = () => {
    // 使用小程序原生分享到朋友圈
    Taro.showShareMenu({
      withShareTicket: true,
      menus: ['shareTimeline']
    });

    // 设置分享参数
    Taro.onShareTimeline(() => {
      return {
        title: articleData.title,
        query: `id=${articleData.id}`,
        imageUrl: swiperImages[0]
      };
    });

    // 关闭分享模态框
    handleCloseShareModal();
  };

  // 视频播放错误处理
  const handleVideoError = (e) => {
    console.error('视频播放错误:', e);
    Taro.showToast({
      title: '视频加载失败',
      icon: 'none'
    });
  };

  // 视频点击事件处理
  const handleVideoClick = () => {
    // 如果视频还未加载完成，不执行全屏操作
    if (!isVideoLoaded) return;

    if (videoContext) {
      try {
        videoContext.requestFullScreen({ direction: 0 });
      } catch (error) {
        // 如果全屏请求失败，使用原生方法
        Taro.showToast({
          title: '全屏播放失败，请直接点击视频控制栏的全屏按钮',
          icon: 'none',
          duration: 2000
        });
      }
    }
  };

  // 视频加载完成
  const handleVideoLoaded = () => {
    setIsVideoLoaded(true);
  };

  // 视频控制事件处理
  const handleVideoControl = (e) => {
    // 停止冒泡但不阻止默认行为，这样可以保证视频控制功能正常工作
    e.stopPropagation();
  };

  // 视频播放事件
  const handleVideoPlay = (e) => {
    // 只停止冒泡，不阻止默认播放行为
    e.stopPropagation();
    setIsPlaying(true);

    // 重置用户手动关闭标志，允许小窗口重新显示
    setUserClosedMiniPlayer(false);

    // 获取视频位置信息
    if (videoPosition.current.top === 0) {
      const query = Taro.createSelectorQuery();
      query.select('#travel-video')
        .boundingClientRect(rect => {
          if (rect) {
            videoPosition.current = {
              top: rect.top,
              height: rect.height,
              id: 'travel-video'
            };
          }
        })
        .exec();
    }
  };

  // 视频暂停事件
  const handleVideoPause = (e) => {
    // 只停止冒泡，不阻止默认暂停行为
    e.stopPropagation();
    setIsPlaying(false);
  };

  // 关闭小窗口并滚动回视频位置
  const handleCloseMiniPlayer = () => {
    if (videoContext) {
      videoContext.pause();
    }

    // 滚动回视频位置
    Taro.pageScrollTo({
      scrollTop: videoPosition.current.top > 0 ? videoPosition.current.top - 100 : 0,
      duration: 300
    });
  };

  // 用户手动关闭小窗口
  const handleManualCloseMiniPlayer = () => {
    setUserClosedMiniPlayer(true);
  };

  return (
    <View className="travel-detail-container">
      {/* 顶部导航栏 */}
      <TravelHeader authorName={articleData.username} authorAvatar={articleData.avatar} />

      {/* 轮播图部分 */}
      <Swiper
        className="swiper-container"
        indicatorColor="#999"
        indicatorActiveColor="#1890ff"
        circular
        indicatorDots
        autoplay={!videoUrl}
      >
        {videoUrl && (
          <SwiperItem>
            <View className="video-wrapper" onClick={handleVideoClick}>
              <Video
                id="travel-video"
                className="swiper-video"
                src={videoUrl}
                controls={true}
                autoplay={IsWifi}
                loop={true}
                muted={false}
                showFullscreenBtn={true}
                showPlayBtn={true}
                objectFit="cover"
                style={{ width: '100%', height: '100%' }}
                poster={coverImageUrl}
                onError={handleVideoError}
                onClick={handleVideoControl}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                showBottomProgress={true}
                showProgress={true}
                playBtnPosition="bottom"
                enableProgressGesture={false}
                onLoadedMetaData={handleVideoLoaded}
              />
            </View>
          </SwiperItem>
        )}
        {swiperImages.map((image, index) => (
          <SwiperItem key={index} onClick={() => handleImagePreview(image)}>
            <Image className="swiper-image" src={image} mode="aspectFill" />
          </SwiperItem>
        ))}
      </Swiper>
{/* 标签部分 */}
<View className='tags-container'>{tags.map((tag, index) => (
    <TravelTag key={index} label={tag} />
  ))}</View>
      {/* 内容区域 */}
      <View className="content-container">
        <Text className="content-title">{articleData.title}</Text>
        <Text className="content-text">{articleData.content}</Text>
      </View>

      {/* 底部操作栏 */}
      <TravelFooter
        onShare={handleShare}
        initialLikeCount={likeCount}
        initialCollectCount={collectCount}
        initialCommentCount={commentCount}
      />

      {/* 分享模态框 */}
      {showShareModal && (
        <View className="share-modal-overlay" onClick={handleCloseShareModal}>
          <View className="share-modal-content" onClick={(e) => e.stopPropagation()}>
            <View className="share-modal-header">
              <Text>分享到</Text>
              <View className="close-btn" onClick={handleCloseShareModal}>×</View>
            </View>
            <View className="share-options">
              <View className="share-option" onClick={handleShareToWechat}>
                <Image className="option-icon" src={require('@/assets/wx.webp')} />
                <Text>微信</Text>
              </View>
              <View className="share-option" onClick={handleShareToMoments}>
                <Image className="option-icon" src={require('@/assets/pyq.webp')} />
                <Text>朋友圈</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 小窗口播放器 - 现在由组件内部决定是否显示 */}
      <MiniPlayer
        videoUrl={videoUrl}
        isPlaying={isPlaying}
        videoContext={videoContext}
        onClose={handleCloseMiniPlayer}
        videoElementInfo={videoPosition.current}
        manualClosed={userClosedMiniPlayer}
        onManualClose={handleManualCloseMiniPlayer}
      />
    </View>
  );
};

export default TravelDetail;
