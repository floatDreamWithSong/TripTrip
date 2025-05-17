import React from 'react';
import { View } from '@tarojs/components';
import './index.scss';

const TravelSkeleton = () => {
  return (
    <View className="travel-skeleton">
      {/* 顶部导航栏骨架 */}
      <View className="skeleton-header">
        <View className="skeleton-avatar pulse"></View>
        <View className="skeleton-username pulse"></View>
      </View>

      {/* 轮播图骨架 */}
      <View className="skeleton-swiper pulse"></View>

      {/* 标签骨架 */}
      <View className="skeleton-tags">
        <View className="skeleton-tag pulse"></View>
        <View className="skeleton-tag pulse"></View>
        <View className="skeleton-tag pulse"></View>
      </View>

      {/* 内容区域骨架 */}
      <View className="skeleton-content">
        <View className="skeleton-title pulse"></View>
        <View className="skeleton-text pulse"></View>
        <View className="skeleton-text pulse"></View>
        <View className="skeleton-text pulse"></View>
        <View className="skeleton-text pulse"></View>
        <View className="skeleton-text-short pulse"></View>
      </View>

      {/* 底部操作栏骨架 */}
      <View className="skeleton-footer">
        <View className="skeleton-input pulse"></View>
        <View className="skeleton-actions">
          <View className="skeleton-action pulse"></View>
          <View className="skeleton-action pulse"></View>
          <View className="skeleton-action pulse"></View>
          <View className="skeleton-action pulse"></View>
        </View>
      </View>
    </View>
  );
};

export default TravelSkeleton;
