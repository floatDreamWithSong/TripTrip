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
        src={travel.PassageImage[0].url}
        className="travel-image"
        mode="aspectFill"
        style={{ height: `${travel.imageHeight}px` }}
      />
      <View className="card-content">
        <Text className="travel-title">{travel.title}</Text>
        <View className="user-info">
          <Image
            src={travel.author.avatar}
            className="avatar"
            mode="aspectFill"
          />
          <Text className="username">{travel.author.username}</Text>
        </View>
      </View>
    </View>
  );
}
