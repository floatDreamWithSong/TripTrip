import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { LikeOutlined, CommentOutlined, ShareAltOutlined, HeartOutlined } from '@ant-design/icons';
import Taro from '@tarojs/taro';
import './TravelFooter.scss';

const TravelFooter = ({ onShare, initialLikeCount = 0, initialCollectCount = 0, initialCommentCount = 0 }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [collectCount, setCollectCount] = useState(initialCollectCount);
  const [commentCount] = useState(initialCommentCount);

  // 点赞功能
  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  // 评论功能
  const handleComment = () => {
    Taro.showToast({
      title: '评论功能开发中',
      icon: 'none',
    });
  };

  // 收藏功能
  const handleCollect = () => {
    if (isCollected) {
      setCollectCount(collectCount - 1);
    } else {
      setCollectCount(collectCount + 1);
    }
    setIsCollected(!isCollected);
  };

  return (
    <View className="travel-footer">
      <View className="comment-input">
        <Input
          className="input"
          placeholder="来条神评"
          placeholderStyle="color:rgba(244, 248, 251,0.85);"
        />
      </View>
      <View className={`action-btn ${isLiked ? 'active' : ''}`} onClick={handleLike}>
        <LikeOutlined />
        <Text className="count">{likeCount}</Text>
      </View>
      <View className="action-btn" onClick={handleComment}>
        <CommentOutlined />
        <Text className="count">{commentCount}</Text>
      </View>
      <View className="action-btn" onClick={onShare}>
        <ShareAltOutlined />
        <Text className="count">分享</Text>
      </View>
      <View className={`action-btn ${isCollected ? 'active' : ''}`} onClick={handleCollect}>
        <HeartOutlined />
        <Text className="count">{collectCount}</Text>
      </View>
    </View>
  );
};

export default TravelFooter;
