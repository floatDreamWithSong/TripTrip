import React, { useEffect, useState, useCallback, useRef } from 'react';
import { View, Input } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';
import { SearchOutlined, MenuOutlined, RightOutlined, LeftOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import TravelCard from '@/components/TravelCard';
import chatRobot from '@/assets/chatRobot.webp';
import TripTripLogo from '@/assets/TripTrip.webp';
import './index.scss';

// 模拟图片随机高度
const getRandomHeight = () => 150 + Math.floor(Math.floor(Math.random() * 5) * 40);

// 页数和每页数据量
const PAGE_SIZE = 5;

export default function Index() {
  const [columns, setColumns] = useState([[], []]);
  const [searchText, setSearchText] = useState('');
  const [allTravels, setAllTravels] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [whetherSearchVisible, setWhetherSearchVisible] = useState(false);
  const [inputFocus, setInputFocus] = useState(false);
  const [activeTag, setActiveTag] = useState('推荐');
  const tagsNavRef = useRef(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(true);

  // 定义标签列表
  const tags = ['推荐', '上海', '北京', '三亚', '广州', '重庆','苏州','杭州','测试'];

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

  // 基于当前标签和搜索文本过滤旅行卡片
  const filterTravels = useCallback((travels, tag, searchText) => {
    // 先按搜索文本过滤
    const filtered = travels.filter(travel =>
      !searchText || travel.title.includes(searchText) ||
      (travel.author && travel.author.username && travel.author.username.includes(searchText))
    );

    // 如果当前标签是"推荐"，返回所有满足搜索条件的卡片
    if (tag === '推荐') {
      return filtered;
    }

    // 否则，返回tags中包含当前标签的卡片
    return filtered.filter(travel => {
      const travelTags = travel.tags || [];
      return travelTags.includes(tag);
    });
  }, []);

  // 加载分页数据
  const loadTravels = useCallback(async (nextPage) => {
    if (loading) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      const response = await Taro.request({
        url: `https://daydreamer.net.cn/passage/list?page=${nextPage}&limit=${PAGE_SIZE}`,
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
      setAllTravels(prev => [...prev, ...formattedTravels]);      // 更新数据
      setPage(nextPage);
      const filtered = filterTravels(formattedTravels, activeTag, searchText); // 只对当前页的数据进行过滤和布局
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
  }, [loading, searchText, distributeItems, activeTag, filterTravels]);

  // 初始加载
  useEffect(() => {
    loadTravels(1);
  }, []);

  // 搜索或标签变化时重新布局
  useEffect(() => {
    const filtered = filterTravels(allTravels, activeTag, searchText);
    setColumns(distributeItems(filtered));
  }, [searchText, allTravels, activeTag, distributeItems, filterTravels]);

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
  useEffect(() => {
    if (whetherSearchVisible) {
      setInputFocus(true);

    }else{
      setInputFocus(false);
    }
  }, [whetherSearchVisible]);

  // 显示搜索栏
  const showSearch = () => {
    setWhetherSearchVisible(true);
  };

  // 隐藏搜索栏
  const hideSearch = () => {
    setWhetherSearchVisible(false);
    setSearchText('');
  };

  // 点击logo刷新页面
  const refreshPage = () => {
    setAllTravels([]);    // 重置状态
    setColumns([[], []]);
    setPage(1);
    setSearchText('');
    loadTravels(1);    // 重新加载第一页数据
  };

  // 处理标签点击事件
  const handleTagClick = (tag) => {
    if (activeTag !== tag) {
      setActiveTag(tag);
      if (allTravels.length === 0) {
        loadTravels(1);
      }
    }
  };  // 处理菜单点击
  const handleMenuClick = (e) => {
    e.stopPropagation();
    setMenuVisible(!menuVisible);
  };

  // 检查标签导航栏的滚动状态
  const checkTagsScrollPosition = () => {
    const tagsNav = tagsNavRef.current;
    if (!tagsNav) return;

    // 检查是否可以向左滚动
    setShowLeftScroll(tagsNav.scrollLeft > 0);

    // 检查是否可以向右滚动
    const maxScrollLeft = tagsNav.scrollWidth - tagsNav.clientWidth;
    setShowRightScroll(tagsNav.scrollLeft < maxScrollLeft - 10); // 添加一个小偏移量作为阈值
  };

  // 标签导航栏滚动事件处理
  const handleTagsScroll = () => {
    checkTagsScrollPosition();
  };

  // 滚动标签导航栏
  const scrollTags = (direction) => {
    const tagsNav = tagsNavRef.current;
    if (!tagsNav) return;

    const scrollAmount = tagsNav.clientWidth / 2;
    const newScrollLeft = direction === 'left'
      ? tagsNav.scrollLeft - scrollAmount
      : tagsNav.scrollLeft + scrollAmount;

    tagsNav.scrollTo({
      left: newScrollLeft,
      behavior: 'smooth'
    });
  };

  // 初始化检查滚动状态
  useEffect(() => {
    checkTagsScrollPosition();
    // 添加滚动事件监听
    const tagsNav = tagsNavRef.current;
    if (tagsNav) {
      tagsNav.addEventListener('scroll', handleTagsScroll);
      return () => {
        tagsNav.removeEventListener('scroll', handleTagsScroll);
      };
    }
  }, []);

  const handleContainerClick = (e) => {
    // 如果点击的是菜单按钮或菜单内容，不处理
    if (e.target.closest('.menu-container') || e.target.closest('.menu-wrapper')) {
      return;
    }
    setMenuVisible(false);
  };

  return (
    <View className="container" onClick={handleContainerClick}>
      <View className="top-bar">
        {!whetherSearchVisible && (
          <>
            <View className="logo" onClick={refreshPage}>
              <img src={TripTripLogo} alt="logo" />
            </View>

            <View className="right-bar">
              <Button
                shape="circle"
                icon={<SearchOutlined />}
                style={{ width: '40px', height: '40px', fontSize: '20px' }}
                onClick={showSearch}
              />
              <View className="menu-wrapper">              <Button
              shape="circle"
              type="text"
                icon={<MenuOutlined/>}
                  onClick={handleMenuClick}
                  style={{
                    width: '40px',
                    height: '40px',
                    fontSize: '24px',
                    cursor: 'pointer',
                    backgroundColor: menuVisible ? '#f0f0f0' : 'transparent'
                  }}
                />
                {/* 菜单弹出层 */}
                {menuVisible && (
                  <View className="menu-container" onClick={(e) => e.stopPropagation()}>
                    <View className="menu-header">设置</View>

                    <View className="menu-item">
                      <View className="menu-item-title">深色模式</View>
                      <View className="menu-item-content">
                        <View className="dark-mode-icons">
                          <View className={`mode-icon ${!darkMode ? 'active' : ''}`} onClick={() => setDarkMode(false)}>
                            ☀️
                          </View>
                          <View className="mode-icon auto" onClick={() => setDarkMode(false)}>
                            ⚙️
                          </View>
                          <View className={`mode-icon ${darkMode ? 'active' : ''}`} onClick={() => setDarkMode(true)}>
                            🌙
                          </View>
                        </View>
                      </View>
                    </View>

                    <View className="menu-item">
                      <View className="menu-item-title">访问方式</View>
                    </View>

                    <View className="menu-item">
                      <View className="menu-item-title">键盘快捷键</View>
                    </View>

                    <View className="menu-item">
                      <View className="menu-item-title">添加携程到桌面</View>
                    </View>

                    <View className="menu-item">
                      <View className="menu-item-title">打开小窗模式</View>
                    </View>

                    <View className="menu-divider"></View>

                    <View className="menu-item with-arrow">
                      <View className="menu-item-title">创作中心</View>
                      <RightOutlined />
                    </View>

                    <View className="menu-item with-arrow">
                      <View className="menu-item-title">业务合作</View>
                      <RightOutlined />
                    </View>

                    <View className="menu-item">
                      <View className="menu-item-title">帮助与客服</View>
                    </View>

                    <View className="menu-item with-arrow">
                      <View className="menu-item-title">隐私、协议</View>
                      <RightOutlined />
                    </View>

                    <View className="menu-item with-arrow">
                      <View className="menu-item-title">关于携程</View>
                      <RightOutlined />
                    </View>
                  </View>
                )}
              </View>
            </View>
          </>
        )}
        {whetherSearchVisible && (
          <View className="search-bar-container">
            <View className="search-bar">
              <img width="30" height="30" src={chatRobot} alt="ai-chatting" style={{ marginRight: '10px' }} />
              <Input
                id="searchInput"
                placeholder="搜索游记或用户"
                onInput={handleSearch}
                value={searchText}
                focus={inputFocus}
                alwaysEmbed={true}
                adjustPosition={true}
                confirmType="search"
              />
              <Button
                type="primary"
                shape="default"
                icon={<SearchOutlined />}
                style={{ width: '50px', height: '30px', fontSize: '16px' }}
              />
            </View>
            <p onClick={hideSearch}>取消</p>
          </View>
        )}
      </View>

      {/* 添加标签导航栏 */}
      <View className="tags-nav-wrapper">
        {showLeftScroll && (
          <View className="tag-scroll-indicator left" onClick={() => scrollTags('left')}>
            <LeftOutlined />
          </View>
        )}

        <View
          className="tags-nav"
          ref={tagsNavRef}
        >
          {tags.map(tag => (
            <View
              key={tag}
              className={`tag-item ${activeTag === tag ? 'active' : ''} ${tag}`}
              onClick={() => handleTagClick(tag)}
            >
              {tag}
            </View>
          ))}
        </View>

        {showRightScroll && (
          <View className="tag-scroll-indicator right" onClick={() => scrollTags('right')}>
            <RightOutlined />
          </View>
        )}
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
