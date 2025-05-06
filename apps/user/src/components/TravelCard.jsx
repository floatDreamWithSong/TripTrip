// components/TravelCard.jsx
import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import './TravelCard.scss';

export default function TravelCard({ travel, onClick }) {

  return (
    <View
      className="travel-card"
      style={{ height: `${travel.imageHeight}rpx` }}
      onClick={() => onClick && onClick(travel.id)}
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
            src={travel.avatar}
            className="avatar"
            mode="aspectFill"
          />
          <Text className="username">{travel.username}</Text>
        </View>
      </View>
    </View>
  );
}
