import React, { useEffect, useState, useCallback } from 'react';
import { View, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.scss';
import TravelCard from '../../components/TravelCard';

// 添加随机高度
const getRandomHeight = () => 150 + Math.floor(Math.random() * 200);

const mockTravels = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  title: `游记标题 ${i + 1} ${'这是一个很长的标题'.repeat(Math.ceil(Math.random() * 2))}`,
  images: [`https://picsum.photos/seed/${i+1}/400/300`],
  username: `用户${i + 1}`,
  avatar: `https://picsum.photos/seed/${i+1}/100/100`,
  imageHeight: getRandomHeight()
}));

export default function Index() {
  const [columns, setColumns] = useState([[], []]);
  const [searchText, setSearchText] = useState('');

  // 瀑布流分列算法（使用预分配的imageHeight）
  const distributeItems = useCallback((items) => {
    const cols = [[], []];
    const colHeights = [0, 0]; // 跟踪每列的总高度

    items.forEach((item) => {
      // 计算卡片总高度 = 图片高度 + 内容区域固定高度(约120rpx)
      const cardHeight = item.imageHeight + 120;

      // 找到当前较矮的列
      const shorterCol = colHeights[0] <= colHeights[1] ? 0 : 1;
      cols[shorterCol].push(item);
      colHeights[shorterCol] += cardHeight;
    });

    return cols;
  }, []);

  useEffect(() => {
    const filtered = mockTravels.filter(travel =>
      travel.title.includes(searchText) ||
      travel.username.includes(searchText)
    );
    setColumns(distributeItems(filtered));
  }, [searchText, distributeItems]);

  const handleSearch = (e) => {
    setSearchText(e.detail.value);
  };

  const handleNavigateToTravelDetail = (id) => {
    console.log('Navigating to travel detail with id:', id);
    Taro.navigateTo({
      url: `/pages/travelDetail/travelDetail`
    });
  };

  return (
    <View className="container">
      <View className="search-bar">
        <Input
          placeholder="搜索游记或用户"
          onInput={handleSearch}
          value={searchText}
        />
      </View>

      <View className="masonry">
        {columns.map((column, colIndex) => (
          <View className="column" key={`col-${colIndex}`}>
            {column.map((item) => (
              <TravelCard key={item.id} travel={item} onClick={handleNavigateToTravelDetail} />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
