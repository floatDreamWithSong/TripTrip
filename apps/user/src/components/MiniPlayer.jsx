import React, { useState, useEffect, useRef } from 'react';
import Taro, { usePageScroll } from '@tarojs/taro';
import { View, Text, Video, CustomWrapper } from '@tarojs/components';
import './MiniPlayer.scss';

// 自定义样式隐藏视频控制栏
const hideControlsStyle = `
  #mini-player-video .taro-video-bar,
  #mini-player-video .taro-video-control,
  .mini-player .taro-video-bar,
  .mini-player .taro-video-control {
    display: none !important;
    visibility: hidden !important;
    opacity: 0 !important;
    height: 0 !important;
    overflow: hidden !important;
    pointer-events: none !important;
  }
`;

/**
 * 小窗口播放器组件
 * @param {string} videoUrl - 视频URL
 * @param {string} videoId - 要监听的视频元素ID
 * @param {Object} videoContext - 视频控制上下文，由父组件传入
 * @param {number} currentTime - 主视频当前播放时间
 */
const MiniPlayer = ({
  videoUrl,
  videoId = 'travel-video',
  videoContext,
  currentTime = 0
}) => {
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [manualClosed, setManualClosed] = useState(false);
  const videoPosition = useRef({ top: 0, height: 0 });

  // 初始化：获取视频位置信息
  useEffect(() => {
    if (videoUrl) {
      // 组件挂载后等待视频元素渲染完成
      setTimeout(() => {
        updateVideoPosition();
      }, 1000);
    }
  }, [videoUrl]);

  // 更新视频位置信息
  const updateVideoPosition = () => {
    const query = Taro.createSelectorQuery();
    query.select(`#${videoId}`)
      .boundingClientRect(rect => {
        if (rect) {
          videoPosition.current = {
            top: rect.top,
            height: rect.height
          };
        }
      })
      .exec();
  };

  // 监听页面滚动
  usePageScroll(res => {
    setScrollTop(res.scrollTop);
  });

  // 监听视频播放状态
  useEffect(() => {
    if (!videoUrl) return;
    // 监听视频播放
    const handleVideoPlay = () => {
      setIsPlaying(true);
      setManualClosed(false);
      updateVideoPosition();
    };

    // 监听视频暂停
    const handleVideoPause = () => {
      setIsPlaying(false);
    };

    try {
      Taro.eventCenter.on(`${videoId}:play`, handleVideoPlay);
      Taro.eventCenter.on(`${videoId}:pause`, handleVideoPause);
    } catch (e) {
      console.error('视频事件监听失败:', e);
    }

    return () => {
      // 清除事件监听
      try {
        Taro.eventCenter.off(`${videoId}:play`, handleVideoPlay);
        Taro.eventCenter.off(`${videoId}:pause`, handleVideoPause);
      } catch (e) {
        console.error('视频事件清理失败:', e);
      }
    };
  }, [videoUrl, videoId]);

  // 根据滚动位置和播放状态决定是否显示小窗口
  useEffect(() => {
    // 如果用户手动关闭了小窗口或视频没有在播放，不显示小窗口
    if (manualClosed || !isPlaying) {
      setShowMiniPlayer(false);
      return;
    }

    // 如果没有视频元素信息，不显示小窗口
    if (!videoPosition.current || !videoPosition.current.height) {
      setShowMiniPlayer(false);
      return;
    }

    // 当滚动超过视频50%时显示小窗口
    const shouldShowMini = scrollTop > (videoPosition.current.top + videoPosition.current.height / 2);

    // 更新小窗口显示状态
    setShowMiniPlayer(shouldShowMini);

    // 如果需要显示小窗口，确保视频继续播放
    if (shouldShowMini && videoContext) {
      videoContext.play();
    }
  }, [scrollTop, isPlaying, videoContext, manualClosed]);

  // 关闭小窗口并滚动回视频位置
  const handleClose = (e) => {
    // 阻止事件冒泡
    if (e) e.stopPropagation();

    setShowMiniPlayer(false);

    // 暂停小窗视频但不暂停主视频
    if (videoContext) {
      // 滚动回视频位置后主视频将继续播放
    }

    // 滚动回视频位置
    Taro.pageScrollTo({
      scrollTop: videoPosition.current.top > 0 ? videoPosition.current.top - 100 : 0,
      duration: 300
    });
  };

  // 从主视频获取当前播放时间
  const getCurrentTime = () => {
    // 优先使用传入的当前时间
    if (typeof currentTime === 'number' && currentTime > 0) {
      return currentTime;
    }

    // 否则尝试从本地存储获取
    try {
      const storedTime = Taro.getStorageSync('video_current_time');
      if (typeof storedTime === 'number' && storedTime > 0) {
        return storedTime;
      }
    } catch (e) {
      console.error('获取存储的视频时间失败:', e);
    }

    // 都失败则返回0
    return 0;
  };

  // 用户手动关闭小窗口
  const handleManualClose = (e) => {
    // 阻止事件冒泡
    if (e) e.stopPropagation();

    setShowMiniPlayer(false);
    setManualClosed(true);

    // 暂停视频
    if (videoContext) {
      videoContext.pause();
    }
  };

  // 如果不需要显示小窗口，则不渲染任何内容
  if (!showMiniPlayer) {
    return null;
  }

  return (
    <View className="mini-player">
      <View className="mini-player-bg"></View>

      {/* 注入自定义样式 */}
      <CustomWrapper>
        <style>
          {hideControlsStyle}
        </style>
      </CustomWrapper>

      <Video
        id="mini-player-video"
        className="mini-video"
        src={videoUrl}
        controls={false}
        autoplay={true}
        initialTime={getCurrentTime()} // 设置初始播放时间与主视频同步
        loop={true}
        muted={false}
        showPlayBtn={false}
        showFullscreenBtn={false}
        showCenterPlayBtn={false}
        showProgress={false}
        showControlBtn={false}
        hideController={true}
        hideStatusBar={true}
        showNoWifiTip={false}
        vslideGesture={false}
        enablePlayGesture={false}
        objectFit="cover"
        onClick={handleClose}
        style={{
          backgroundColor: '#000',
        }}
        playInBackground={true}
      />
      {/* 添加一个覆盖层来阻止视频控制栏的交互 */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          pointerEvents: 'none'
        }}
      />
      <View
        className="mini-close"
        onClick={handleManualClose}
      >
        <Text>×</Text>
      </View>
    </View>
  );
};

export default MiniPlayer;
