import React, { useState, useEffect } from 'react';
import { usePageScroll } from '@tarojs/taro';
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
 * @param {boolean} isPlaying - 视频是否正在播放
 * @param {Object} videoContext - 视频控制上下文
 * @param {Function} onClose - 关闭小窗并滚动回原视频位置的回调
 * @param {Object} videoElementInfo - 视频元素信息，包含{id, top, height}
 * @param {boolean} manualClosed - 用户是否手动关闭了小窗口
 * @param {Function} onManualClose - 手动关闭小窗口的回调
 */
const MiniPlayer = ({
  videoUrl,
  isPlaying,
  videoContext,
  onClose,
  videoElementInfo,
  manualClosed,
  onManualClose
}) => {
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);

  // 监听页面滚动
  usePageScroll(res => {
    setScrollTop(res.scrollTop);
  });

  // 根据滚动位置和播放状态决定是否显示小窗口
  useEffect(() => {
    // 如果用户手动关闭了小窗口或视频没有在播放，不显示小窗口
    if (manualClosed || !isPlaying) {
      setShowMiniPlayer(false);
      return;
    }

    // 如果没有视频元素信息，不显示小窗口
    if (!videoElementInfo || !videoElementInfo.height) {
      setShowMiniPlayer(false);
      return;
    }

    // 当滚动超过视频50%时显示小窗口
    const shouldShowMini = scrollTop > (videoElementInfo.top + videoElementInfo.height / 2);

    // 更新小窗口显示状态
    setShowMiniPlayer(shouldShowMini);

    // 如果需要显示小窗口，确保视频继续播放
    if (shouldShowMini && videoContext) {
      videoContext.play();
    }
  }, [scrollTop, isPlaying, videoContext, videoElementInfo, manualClosed]);

  // 关闭小窗口并滚动回视频位置
  const handleClose = (e) => {
    // 阻止事件冒泡
    if (e) e.stopPropagation();

    setShowMiniPlayer(false);

    // 回调父组件处理关闭并滚动
    if (onClose) {
      onClose();
    }
  };

  // 只关闭小窗口，不滚动页面
  const handleManualClose = (e) => {
    // 阻止事件冒泡
    if (e) e.stopPropagation();

    setShowMiniPlayer(false);

    // 通知父组件用户手动关闭了小窗口
    if (onManualClose) {
      onManualClose();
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
