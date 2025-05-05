// components/TravelCard.jsx
import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import './TravelCard.scss';

const TravelCard = ({ travel, onClick }) => {
    const toDetail = (id) => {
        console.log('跳转到详情页', id);
      };

  return (
    <View
      className="travel-card"
      style={{ height: `${travel.imageHeight}rpx` }}
      onClick={() => toDetail(travel.id)}
    >
      <Image
        src={travel.images[0]}
        className="travel-image"
        mode="aspectFill"
        style={{ height: `${travel.imageHeight}px` }}
      />
      <View className="card-content">
        <Text className="travel-title">{travel.title}</Text>
        <View className="user-info">
          <Image
            src={travel.user.avatar}
            className="avatar"
            mode="aspectFill"
          />
          <Text className="username">{travel.user.nickname}</Text>
        </View>
      </View>
    </View>
  );
};

export default TravelCard;
