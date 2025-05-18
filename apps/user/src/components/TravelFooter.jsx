import React, { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { LikeOutlined, CommentOutlined, ShareAltOutlined, HeartOutlined } from '@ant-design/icons';
import Taro from '@tarojs/taro';
import './TravelFooter.scss';

const TravelFooter = ({ onShare, initialLikeCount, initialCollectCount , initialCommentCount , passageId, initialIsLiked , initialIsCollected  }) => {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isCollected, setIsCollected] = useState(initialIsCollected);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [collectCount, setCollectCount] = useState(initialCollectCount);
  const [commentCount] = useState(initialCommentCount);

  // 点赞功能
  const handleLike = () => {
    if (!passageId) {
      Taro.showToast({
        title: '游记ID不存在',
        icon: 'none'
      });
      return;
    }

    if (isLiked) {
      // 调用取消点赞接口
      Taro.request({
        url: 'https://daydreamer.net.cn/like/passage',
        method: 'DELETE',
        data: {
          passageId: passageId
        },
        header: {
          'Authorization': Taro.getStorageSync('accessToken') || '',
          'X-Refresh-Token': Taro.getStorageSync('refreshToken') || '',
        }
      }).then(res => {
        if (res.statusCode === 200 && res.data.code === 0) {
          console.log('取消点赞成功', res.data);
          setLikeCount(likeCount - 1);
          setIsLiked(false);
        } else {
          console.error('取消点赞失败', res.data);
          Taro.showToast({
            title: '取消点赞失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('取消点赞请求错误', err);
        Taro.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      });
    } else {
      // 调用点赞接口
      Taro.request({
        url: 'https://daydreamer.net.cn/like/passage',
        method: 'POST',
        data: {
          passageId: passageId
        },
        header: {
          'Authorization': Taro.getStorageSync('accessToken') || '',
          'X-Refresh-Token': Taro.getStorageSync('refreshToken') || '',
        }
      }).then(res => {
        if (res.statusCode === 200 && res.data.code === 0) {
          console.log('点赞成功', res.data);
          setLikeCount(likeCount + 1);
          setIsLiked(true);
        } else {
          console.error('点赞失败', res.data);
          Taro.showToast({
            title: '点赞失败',
            icon: 'none'
          });
        }
      }).catch(err => {
        console.error('点赞请求错误', err);
        Taro.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      });
    }
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
