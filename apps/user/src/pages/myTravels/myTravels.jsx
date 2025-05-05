import { View, Text, Image } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import { useState, useCallback, useEffect } from 'react';
import './myTravels.scss';
import MyCard from '../../components/MyCard';

const travelStates = ['已通过', '未通过', '待审核'];

// 添加随机高度
const getRandomHeight = () => 150 + Math.floor(Math.random() * 200);

const mockTravels = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  title: `游记标题 ${i + 1} ${'这是一个很长的标题'.repeat(Math.ceil(Math.random() * 2))}`,
  images: [`https://picsum.photos/seed/${i}/400/300`],
  user: {
    nickname: `用户${i + 1}`,
    avatar: `https://i.pravatar.cc/100?img=${i + 1}`
  },
  state: travelStates[Math.floor(Math.random() * 3)],
  // 为每张图片预先分配随机高度
  imageHeight: getRandomHeight()
}));

export default function myTravels() {
  const [fans, setFans] = useState(0);
  const [follows, setFollows] = useState(0);
  const [loves, setLoves] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('全部');
  const [columns, setColumns] = useState([[], []]);

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
    setColumns(distributeItems(mockTravels));
  }, [distributeItems]);

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    console.log(`筛选条件已更新为: ${filter}`);
    // 待添加逻辑：筛选后的请求
    if (filter === '全部') {
      setColumns(distributeItems(mockTravels));
    } else {
      const filteredItems = mockTravels.filter((item) => item.state === filter);
      setColumns(distributeItems(filteredItems));
    }
  };

  useLoad(() => {
    console.log('Page - myTravels loaded.');
  });

  const jumpToAdd = () => {
    console.log("跳转到添加游记页面")
    Taro.switchTab({
      url: '/pages/addTravel/addTravel'
    })
  }

  return (
    <View className="myTravels">
      <View className="titleBlock">
        <View className="userTitle">
          <View className="userAvatar"></View>
          <View className="userName">M54****2747</View>
        </View>
        <View className='userBlock'>
          <View className='userBlockTitle'>
            <View className="userBlockAvatar"></View>
            <View className='userBlockInfo'>
              <View className="userBlockName">M54****2747</View>
              <View className='userBlockIP'>IP属地: 上海</View>
            </View>
            <View className="userBlockLevel">Lv.1</View>
          </View>
          <View className='userBlockContent'>
            <View className='userSelfIntroduction'>你还没有填写自我介绍哦</View>
            <View className='userInfoCount'>
              <View className='userInfoItem'>
                <View className='userInfoItemTitle'>粉丝</View>
                <View className='userInfoItemNum'>{fans}</View>
              </View>
              <View className='userInfoItem'>
                <View className='userInfoItemTitle'>关注</View>
                <View className='userInfoItemNum'>{follows}</View>
              </View>
              <View className='userInfoItem'>
                <View className='userInfoItemTitle'>获赞</View>
                <View className='userInfoItemNum'>{loves}</View>
              </View>
            </View>
            <View className='userBadgeBlock'>创作实习生</View>
          </View>
        </View>
      </View>
      <View className='buttonBox'>
        <View className='buttonItem'>
          <View className='giftIcon'></View>
          <View className='buttonTitle'>有奖任务</View>
        </View>
        <View className='buttonItem'>
          <View className='writeIcon'></View>
          <View className='buttonTitle'>创作中心</View>
        </View>
      </View>
      <View className='travelList'>
        <View className='travelListTitle'>
          <View
            className={`travelListClass ${selectedFilter === '全部' ? 'active' : ''}`}
            onClick={() => handleFilterClick('全部')}
          >
            全部
          </View>
          <View
            className={`travelListClass ${selectedFilter === '已通过' ? 'active' : ''}`}
            onClick={() => handleFilterClick('已通过')}
          >
            已通过
          </View>
          <View
            className={`travelListClass ${selectedFilter === '未通过' ? 'active' : ''}`}
            onClick={() => handleFilterClick('未通过')}
          >
            未通过
          </View>
          <View
            className={`travelListClass ${selectedFilter === '待审核' ? 'active' : ''}`}
            onClick={() => handleFilterClick('待审核')}
          >
            待审核
          </View>
        </View>
      </View>
      <View className="masonry">
        {columns.map((column, colIndex) => (
          <View className="column" key={`col-${colIndex}`}>
            {column.map((item) => (
              <MyCard key={item.id} travel={item} />
            ))}
          </View>
        ))}
      </View>
      <View
        className='addTravelButton'
        onClick={jumpToAdd}
      >
        <View className='addTravelIcon'></View>
      </View>
    </View>
  );
}
