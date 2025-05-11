import React, { useState } from 'react';
import { View, Image, Text } from '@tarojs/components';
import './MyCard.scss';
import { Button } from 'antd';

const stateClassMap = {
  '已通过': 'approved',
  '未通过': 'rejected',
  '待审核': 'pending'
};

const TravelCard = ({ travel }) => {
  const [showReason, setShowReason] = useState(false);

  const toDetail = (id) => {
    console.log('跳转到详情页', id);
  };

  return (
    <View
      className="travel-card"
      style={{ height: `${travel.imageHeight}rpx` }}
      onClick={() => toDetail(travel.pid)}
    >
      <Image
        src={travel.coverImageUrl}
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

      <View
        className={'travel-state ' + stateClassMap[travel.state]}
        onClick={(event) => {
          event.stopPropagation(); // 阻止冒泡
          console.log(`跳转到${travel.state}页面`);
        }}
      >
        {travel.state}
      </View>

      {travel.state === '未通过' && (
        <View className="reject-section" onClick={(e) => e.stopPropagation()}>
          <View
            className="toggle-reason-btn"
            onClick={(e) => {
              e.stopPropagation();
              setShowReason(!showReason);
            }}
          >
            {showReason ? '收起原因' : '查看原因'}
          </View>

          {showReason && (
            <View className="reject-reason">
              {travel.rejectReason || '未提供具体原因'}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default TravelCard;
