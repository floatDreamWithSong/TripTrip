import React, { useState, useEffect } from 'react';
import Taro, { useRouter } from '@tarojs/taro';
import { View, Text, Image, Swiper, SwiperItem, Video } from '@tarojs/components';
import TravelTag from '@/components/TravelTag';
import TravelFooter from '@/components/TravelFooter';
import TravelHeader from '@/components/TravelHeader';
import MiniPlayer from '@/components/MiniPlayer';
import { shareToMoments,shareToFriends } from '@/utils/share'
import './travelDetail.scss';

const TravelDetail = () => {
  const router = useRouter();
  const [travelDetail, setTravelDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [videoContext, setVideoContext] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [IsWifi, setIsWifi] = useState(false);
  const likeCount = 239;
  const commentCount = 6;
  const collectCount = 100;
  const [videoCurrentTime, setVideoCurrentTime] = useState(0);

  // 获取游记详情数据
  useEffect(() => {
    const fetchTravelDetail = async () => {
      try {
        const { id } = router.params;
        if (!id) {
          Taro.showToast({
            title: '缺少游记ID参数',
            icon: 'none'
          });
          return;
        }

        const response = await Taro.request({
          url: `http://172.30.216.50:3000/passage?id=${id}`,
          method: 'GET',
        });

        if (response.data.data) {
          setTravelDetail(response.data.data);
        } else {
          Taro.showToast({
            title: '获取游记详情失败',
            icon: 'none'
          });
        }
      } catch (error) {
        console.error('获取游记详情失败:', error);
        Taro.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTravelDetail();
  }, [router.params]);

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
    if (travelDetail?.videoUrl) {
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
  }, [travelDetail]);

  // 点击图片全屏查看
  const handleImagePreview = (current) => {
    if (!travelDetail?.images || travelDetail.images.length === 0) return;

    const imageUrls = travelDetail.images.map(img => img.url);
    Taro.previewImage({
      current,
      urls: imageUrls,
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
  const handleShareToFriends = async () => {
    const result = await shareToFriends({
      title: travelDetail?.title || '精彩游记',
      imageUrl: travelDetail?.coverImageUrl,
      path: `/pages/detail/index?id=${travelDetail?.id}`
    })

    console.log('分享到微信好友结果:', result)

    handleCloseShareModal()
  }


  // 分享到朋友圈
  const handleShareToMoments = async () => {
    const result = await shareToMoments({
      title: travelDetail?.title || '精彩游记',
      imageUrl: travelDetail?.coverImageUrl,
      path: `/pages/detail/index?id=${travelDetail?.id}`
    })

    console.log('分享结果:', result)

    handleCloseShareModal()
  }


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
    const query = Taro.createSelectorQuery();
    query.select('#travel-video')
      .boundingClientRect()
      .exec();
  };

  // 视频控制
  const handleVideoControl = (e) => {
    e.stopPropagation();
  };

  // 视频播放
  const handleVideoPlay = (e) => {
    e.stopPropagation();
    try {
      Taro.eventCenter.trigger('travel-video:play');
    } catch (error) {
      console.error('触发播放事件失败:', error);
    }
  };

  // 视频暂停
  const handleVideoPause = (e) => {
    e.stopPropagation();
    try {
      Taro.eventCenter.trigger('travel-video:pause');
    } catch (error) {
      console.error('触发暂停事件失败:', error);
    }
  };

  // 视频播放进度更新
  const handleTimeUpdate = (e) => {
    if (e && e.detail && typeof e.detail.currentTime === 'number') {
      setVideoCurrentTime(e.detail.currentTime);
      // 将当前播放时间保存到全局状态，供小窗口组件使用
      try {
        Taro.setStorageSync('video_current_time', e.detail.currentTime);
      } catch (error) {
        console.error('保存视频播放时间失败:', error);
      }
    }
  };

  if (loading) {
    return (
      <View className="loading-container">
        <Text>加载中...</Text>
      </View>
    );
  }

  if (!travelDetail) {
    return (
      <View className="error-container">
        <Text>加载失败，请重试</Text>
      </View>
    );
  }

  // 准备标签数据
  const tagList = travelDetail.PassageToTag ?
    travelDetail.PassageToTag.map(item => item.tag.name) :
    [];

  return (
    <View className="travel-detail-container">
      {/* 顶部导航栏 */}
      <TravelHeader
        authorName={travelDetail.author.username}
        authorAvatar={travelDetail.author.avatar}
      />

      {/* 轮播图部分 */}
      <Swiper
        className="swiper-container"
        indicatorColor="#999"
        indicatorActiveColor="#1890ff"
        circular
        indicatorDots
        autoplay={!travelDetail.videoUrl}
      >
        {travelDetail.videoUrl && (
          <SwiperItem>
            <View className="video-wrapper" onClick={handleVideoClick}>
              <Video
                id="travel-video"
                className="swiper-video"
                src={travelDetail.videoUrl}
                controls={true}
                autoplay={IsWifi}
                loop={true}
                muted={false}
                showFullscreenBtn={true}
                showPlayBtn={true}
                objectFit="cover"
                style={{ width: '100%', height: '100%' }}
                poster={travelDetail.coverImageUrl}
                onError={handleVideoError}
                onClick={handleVideoControl}
                onPlay={handleVideoPlay}
                onPause={handleVideoPause}
                onTimeUpdate={handleTimeUpdate}
                showBottomProgress={true}
                showProgress={true}
                playBtnPosition="bottom"
                enableProgressGesture={false}
                onLoadedMetaData={handleVideoLoaded}
              />
            </View>
          </SwiperItem>
        )}
        {travelDetail.images && travelDetail.images.map((image, index) => (
          <SwiperItem key={index} onClick={() => handleImagePreview(image.url)}>
            <Image className="swiper-image" src={image.url} mode="aspectFill" />
          </SwiperItem>
        ))}
      </Swiper>
{/* 标签部分 */}
<View className='tags-container'>{tagList.map((tag, index) => (
    <TravelTag key={index} label={tag} />
  ))}</View>
      {/* 内容区域 */}
      <View className="content-container">
        <Text className="content-title">{travelDetail.title}</Text>
        <Text className="content-text">{travelDetail.content}</Text>
      </View>

      {/* 底部操作栏 */}
      <TravelFooter
        onShare={handleShare}
        initialLikeCount={travelDetail._count?.passageLikes || likeCount}
        initialCollectCount={travelDetail._count?.favorites || collectCount}
        initialCommentCount={travelDetail._count?.comments || commentCount}
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
              <View className="share-option" onClick={handleShareToFriends}>
                <Image className="option-icon" src={require('@/assets/wx.webp')} />
                <Text>微信</Text>
              </View>
              <View className="share-option" onClick={handleShareToMoments} >
                <Image className="option-icon" src={require('@/assets/pyq.webp')} />
                <Text>朋友圈</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 小窗口播放器 - 简化后的实现，由组件内部管理所有逻辑 */}
      {travelDetail.videoUrl && videoContext && (
        <MiniPlayer
          videoUrl={travelDetail.videoUrl}
          videoId="travel-video"
          videoContext={videoContext}
          currentTime={videoCurrentTime}
        />
      )}
    </View>
  );
};

export default TravelDetail;
