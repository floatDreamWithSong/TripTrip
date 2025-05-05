// components/TravelCard.jsx
import React from 'react';
import { View, Image, Text } from '@tarojs/components';
import './MyCard.scss';

const stateClassMap = {
  '已通过': 'approved',
  '未通过': 'rejected',
  '待审核': 'pending'
};

const TravelCard = ({ travel }) => {
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
      {/* <View className='travel-state {stateClassMap[travel.state]}'>{travel.state}</View> */}
      <View
        className={'travel-state ' + stateClassMap[travel.state]}
        onClick={(event) => {
          event.stopPropagation(); // 阻止冒泡
          console.log(`跳转到${travel.state}页面`)
          // 添加跳转功能，跳转到修改页面（类似于添加页面）
        }}
      >
        {travel.state}
      </View>
    </View>
  );
};

export default TravelCard;
