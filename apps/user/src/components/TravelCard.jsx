import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import './TravelCard.scss';

export default function TravelCard({ travel, onClick }) {
  // 防止travel为undefined的情况
  if (!travel) {
    console.error('Travel card received undefined travel object');
    return null;
  }

  // 使用coverImageUrl作为图片URL，这是新的数据结构中的字段
  const imageUrl = travel.coverImageUrl || 'https://wonderland-1328561145.cos.ap-shanghai.myqcloud.com/default.png';

  // 确保author对象存在
  const author = travel.author || { username: '未知用户', avatar: 'https://wonderland-1328561145.cos.ap-shanghai.myqcloud.com/default.png' };

  return (
    <View
      className="travel-card"
      style={{ height: `${travel.imageHeight}rpx` }}
      onClick={() => onClick && onClick(travel.id)}
    >
      <Image
        src={imageUrl}
        className="travel-image"
        mode="aspectFill"
        style={{ height: `${travel.imageHeight}px` }}
      />
      <View className="card-content">
        <Text className="travel-title">{travel.title || '无标题'}</Text>
        <View className="user-info">
          <Image
            src={author.avatar || 'https://wonderland-1328561145.cos.ap-shanghai.myqcloud.com/default.png'}
            className="avatar"
            mode="aspectFill"
          />
          <Text className="username">{author.username || '未知用户'}</Text>
        </View>
      </View>
    </View>
  );
}
