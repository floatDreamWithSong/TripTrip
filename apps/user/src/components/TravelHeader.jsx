import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './TravelHeader.scss';

const TravelHeader = ({ authorName, authorAvatar }) => {
  // 返回上一页
  const handleBackToHome = () => {
    Taro.navigateBack({
      delta: 1,
    });
  };

  // 点击关注
  const handleFollow = () => {
    Taro.showToast({
      title: '关注成功',
      icon: 'success',
    });
  };

  // 更多菜单
  const handleMoreOptions = () => {
    Taro.showActionSheet({
      itemList: ['举报', '不感兴趣', '收藏', '复制链接'],
      success: function (res) {
        if (res.tapIndex === 0) {
          Taro.showToast({
            title: '举报成功',
            icon: 'none'
          });
        } else if (res.tapIndex === 2) {
          Taro.showToast({
            title: '收藏成功',
            icon: 'success'
          });
        } else if (res.tapIndex === 3) {
          Taro.setClipboardData({
            data: window.location.href,
            success: function () {
              Taro.showToast({
                title: '链接已复制',
                icon: 'success'
              });
            }
          });
        }
      }
    });
  };

  return (
    <View className="travel-header">
      <View className="header-left" onClick={handleBackToHome}>
        <img
          width="25"
          height="25"
          src="https://img.icons8.com/ios-glyphs/30/back.png"
          alt="back"
        />
        <Image className="author-avatar" src={authorAvatar} />
        <Text className="author-name">{authorName}</Text>
      </View>
      <View className="header-right">
        <View className="follow-btn" onClick={handleFollow}>
          <Text>+ 关注</Text>
        </View>
        <img
          width="30"
          height="30"
          src="https://img.icons8.com/external-royyan-wijaya-detailed-outline-royyan-wijaya/24/external-ellipsis-interface-royyan-wijaya-detailed-outline-royyan-wijaya.png"
          alt="more-options"
          onClick={handleMoreOptions}
        />
      </View>
    </View>
  );
};

export default TravelHeader;
