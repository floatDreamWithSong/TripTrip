import React, { useEffect, useState, useCallback } from 'react';
import { View, Input } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import TravelCard from '@/components/TravelCard';
import chatRobot from '@/assets/chatRobot.webp';
import './index.scss';

// 模拟图片随机高度
const getRandomHeight = () => 150 + Math.floor(Math.floor(Math.random() * 5) * 40);

// 页数和每页数据量
const PAGE_SIZE = 15;

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

// 加载分页数据
const loadTravels = useCallback(async (nextPage) => {
  if (loading) return;

  setLoading(true);
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const response = await Taro.request({
      url: `http://127.0.0.1:4523/m1/6328758-6024136-default/passage/list?page=${nextPage}&limit=${PAGE_SIZE}`,
      method: 'GET',
    });

    let travels = [];
    if (response.data?.data?.list) {
      travels = response.data.data.list;
    } else if (Array.isArray(response.data?.data)) {
      travels = response.data.data;
    } else if (Array.isArray(response.data)) {
      travels = response.data;
    }

    if (!travels || travels.length === 0) {
      return;
    }

    const formattedTravels = travels.map(travel => ({
      id: travel.pid || travel.id,
      title: travel.title || "无标题",
      imageHeight: getRandomHeight(),
      coverImageUrl: travel.coverImageUrl,
      author: travel.author || { username: "未知作者" },
      publishTime: travel.publishTime,
      views: travel.views || 0,
      likes: travel._count?.passageLikes || 0,
      favorites: travel._count?.favorites || 0,
      comments: travel._count?.comments || 0,
      tags: travel.PassageToTag?.map(tag => tag.tag.name) || []
    }));

    // 更新数据
    setAllTravels(prev => [...prev, ...formattedTravels]);
    setPage(nextPage);

    // 只对当前页的数据进行过滤和布局
    const filtered = formattedTravels.filter(travel =>
      travel.title.includes(searchText) ||
      travel.author.username.includes(searchText)
    );

    // 更新瀑布流布局，只添加新数据
    setColumns(prev => {
      const newColumns = distributeItems(filtered);
      return [
        [...prev[0], ...newColumns[0]],
        [...prev[1], ...newColumns[1]]
      ];
    });

  } catch (error) {
    console.error('Error loading travels:', error);
    Taro.showToast({
      title: '加载失败，请重试',
      icon: 'none',
      duration: 2000
    });
  } finally {
    setLoading(false);
  }
}, [loading, searchText, distributeItems]);

  // 初始加载
  useEffect(() => {
    loadTravels(1);
  }, []);

  // 搜索时重新布局
  useEffect(() => {
    const filtered = allTravels.filter(travel =>
      travel.title.includes(searchText) ||
      travel.author.username.includes(searchText)
    );
    setColumns(distributeItems(filtered));
  }, [searchText, allTravels, distributeItems]);

  // 滚动到底部加载更多
  useReachBottom(() => {
    if (!loading) {
      loadTravels(page + 1);
    }
  });

  const handleSearch = (e) => {
    setSearchText(e.detail.value);
  };

  const handleNavigateToTravelDetail = (id) => {
    Taro.navigateTo({
      url: `/pages/travelDetail/travelDetail?id=${id}`
    });
  };

  return (
    <View className="container">
      <View className="search-bar">
        <img width="30" height="30" src={chatRobot} alt="ai-chatting" style={{ marginRight: '10px' }} />
        <Input
          placeholder="搜索游记或用户"
          onInput={handleSearch}
          value={searchText}
        />
        <Button
          type="primary"
          shape="default"
          icon={<SearchOutlined />}
          style={{ width: '50px', height: '30px', fontSize: '16px' }}
        />
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

      {loading && <View className="loading-text">加载中...</View>}

      {!loading && allTravels.length === 0 && (
        <View className="empty-text">暂无游记数据</View>
      )}
    </View>
  );
}