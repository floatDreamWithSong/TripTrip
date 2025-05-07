import React, { useEffect, useState, useCallback } from 'react';
import { View, Input } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import TravelCard from '../../components/TravelCard';
import chatRobot from '@/assets/chatRobot.webp';
import './index.scss';


// 模拟图片随机高度
const getRandomHeight = () => 150 + Math.floor(Math.floor(Math.random()*5) * 40);

// 共 50 条游记数据
const TOTAL_TRAVELS = 50;
const PAGE_SIZE = 10;

const mockTravels = Array.from({ length: TOTAL_TRAVELS }, (_, i) => ({
  id: i,
  title: `游记标题 ${i + 1} ${'这是一个很长的标题'.repeat(Math.ceil(Math.random() * 2))}`,
  images: [`https://picsum.photos/seed/${i + 1}/400/300`],
  username: `用户${i + 1}`,
  avatar: `https://picsum.photos/seed/${i + 1}/100/100`,
  imageHeight: getRandomHeight(),
}));

export default function Index() {
  const [columns, setColumns] = useState([[], []]);
  const [searchText, setSearchText] = useState('');
  const [allTravels, setAllTravels] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // 瀑布流算法
  const distributeItems = useCallback((items) => {
    const cols = [[], []];
    const colHeights = [0, 0];
    items.forEach((item) => {
      const cardHeight = item.imageHeight + 120;
      const shorterCol = colHeights[0] <= colHeights[1] ? 0 : 1;
      cols[shorterCol].push(item);
      colHeights[shorterCol] += cardHeight;
    });
    return cols;
  }, []);

  // 初始加载
  useEffect(() => {
    loadTravels(1);
  }, []);

  // 加载分页数据
  const loadTravels = useCallback(async (nextPage) => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // 模拟异步加载

    const newTravels = mockTravels.slice(
      (nextPage - 1) * PAGE_SIZE,
      nextPage * PAGE_SIZE
    );

    const updatedTravels = [...allTravels, ...newTravels];
    setAllTravels(updatedTravels);

    const filtered = updatedTravels.filter(travel =>
      travel.title.includes(searchText) ||
      travel.username.includes(searchText)
    );
    setColumns(distributeItems(filtered));

    setPage(nextPage);
    setLoading(false);
  }, [allTravels, searchText, distributeItems]);

  // 搜索时重新布局
  useEffect(() => {
    const filtered = allTravels.filter(travel =>
      travel.title.includes(searchText) ||
      travel.username.includes(searchText)
    );
    setColumns(distributeItems(filtered));
  }, [searchText, allTravels, distributeItems]);

  const handleSearch = (e) => {
    setSearchText(e.detail.value);
  };

  const handleNavigateToTravelDetail = (id) => {
    console.log('Navigating to travel detail with id:', id);
    Taro.navigateTo({
      url: `/pages/travelDetail/travelDetail?id=${id}`
    });
  };

  // 滚动到底部加载下一页
  useReachBottom(() => {
    if (!loading && page * PAGE_SIZE < mockTravels.length) {
      loadTravels(page + 1);
    }
  });

  return (
    <View className="container">
      <View className="search-bar">
      <img width="30" height="30" src={chatRobot} alt="ai-chatting" style={{marginRight:'10px'}}/>
        <Input
          placeholder="搜索游记或用户"
          onInput={handleSearch}
          value={searchText}
        />
       <Button type="primary"  shape="default" icon={<SearchOutlined />}style={{
        width: '50px',
    height: '30px',
    fontSize: '16px',
  }} />
      </View>

      <View className="masonry">
        {columns.map((column, colIndex) => (
          <View className="column" key={`col-${colIndex}`}>
            {column.map((item) => (
              <TravelCard
                key={item.id}
                travel={item}
                onClick={() => handleNavigateToTravelDetail(item.id)}
              />
            ))}
          </View>
        ))}
      </View>
      {!loading && page * PAGE_SIZE >= mockTravels.length && (
        <View className="loading-text">没有更多游记了~</View>
      )}
    </View>
  );
}
