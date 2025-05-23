import { View, Text, Image } from '@tarojs/components';
import { useLoad, useDidShow } from '@tarojs/taro';
import { useState, useCallback, useEffect } from 'react';
import './myTravels.scss';
import MyCard from '../../components/MyCard';
import { getUserInfo } from '../../utils/user'
import { fetchMyPassages } from '../../utils/travelApi'

const travelStates = ['已通过', '未通过', '待审核'];
const rejectReasons = ['图片不符合社区规范', '内容包含敏感信息', '内容不符合规范', '违反相关法律法规']

// 添加随机高度
const getRandomHeight = () => 150 + Math.floor(Math.random() * 200);

const mockTravels = Array.from({ length: 20 }, (_, i) => {
  const state = travelStates[Math.floor(Math.random() * 3)];
  const rejectReason = state === '未通过' ? rejectReasons[Math.floor(Math.random() * 4)] : ''
  return {
    pid: i,
    title: `游记标题 ${i + 1} ${'这是一个很长的标题'.repeat(Math.ceil(Math.random() * 2))}`,
    coverImageUrl: `https://picsum.photos/seed/${i}/400/300`,
    author: {
      username: `用户${i + 1}`,
      avatar: `https://i.pravatar.cc/100?img=${i + 1}`
    },
    state,
    imageHeight: getRandomHeight(),
    rejectReason: state === '未通过' ? rejectReason : '' // 示例理由
  };
});

export default function myTravels() {
  const [fans, setFans] = useState(0);
  const [follows, setFollows] = useState(0);
  const [loves, setLoves] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('全部');
  const [columns, setColumns] = useState([[], []]);
  const [passages, setPassages] = useState([])
  const [userInfo, setUserInfo] = useState({
    uid: 0,
    email: '',
    username: '',
    gender: 0,
    avatar: '',
    userType: 0,
    registerTime: '',
    _count: {
      passages: 0,
      followers: 0,
      following: 0,
    },
  });

  let result = [];

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

  const handleGetUserInfo = async () => {
    try {
      const result = await getUserInfo();
      setUserInfo(result);
      Taro.showToast({
        title: '获取用户信息成功',
        icon: 'success',
      });
      console.log('用户信息:', result);
    } catch (error) {
      Taro.showToast({
        title: '获取用户信息失败，请登录后重试',
        icon: 'none',
      });
    }
  };

  const loadPassages = async () => {
    try {
      const result = await fetchMyPassages();
      const withHeight = result.map(item => ({
        ...item,
        imageHeight: getRandomHeight(),
        rejectReason: '',
      }));
      setPassages(withHeight);
      handleFilterClick('全部', withHeight);
    } catch (error) {
      console.error('加载游记失败:', error);
    }
  };

  useEffect(() => {
    handleGetUserInfo();
    loadPassages();
  }, []);

  useDidShow(() => {
    console.log("111", userInfo.data)
  });

  const handleFilterClick = (filter, baseList = result) => {
    setSelectedFilter(filter);

    if (filter === '全部') {
      setColumns(distributeItems(baseList));
    } else {
      const filteredItems = baseList.filter((item) => item.state === filter);
      setColumns(distributeItems(filteredItems));
    }
  };

  const handleDelete = (pid) => {
    setPassages(passages.filter(travel => travel.pid !== pid)); // 移除被删除的旅行记录

    // 重新分配瀑布流布局
    setTimeout(() => {
      setColumns(distributeItems(passages.filter(travel => travel.pid !== pid)));
    }, 300); // 等待CSS过渡效果完成
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
          <View className="userName">{userInfo.username || "邱吉尔"}</View>
        </View>
        <View className='userBlock'>
          <View className='userBlockTitle'>
            <View className="userBlockAvatar">
              <Image src={userInfo.avatar} />
            </View>
            <View className='userBlockInfo'>
              <View className="userBlockName">{userInfo.email || "19535838578@163.com"}</View>
              <View className='userBlockIP'>性别：{userInfo.gender === 0 ? '男' : '女'}</View>
            </View>
            <View className="userBlockLevel">Lv.1</View>
          </View>
          <View className='userBlockContent'>
            <View className='userSelfIntroduction'>你还没有填写自我介绍哦</View>
            <View className='userInfoCount'>
              <View className='userInfoItem'>
                <View className='userInfoItemTitle'>粉丝</View>
                <View className='userInfoItemNum'>{userInfo._count.followers || 0}</View>
              </View>
              <View className='userInfoItem'>
                <View className='userInfoItemTitle'>关注</View>
                <View className='userInfoItemNum'>{userInfo._count.following}</View>
              </View>
              <View className='userInfoItem'>
                <View className='userInfoItemTitle'>发布</View>
                <View className='userInfoItemNum'>{userInfo._count.passages}</View>
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
              <MyCard
                key={item.pidDD}
                travel={item}
                onDelete={() => handleDelete(item.pid)}
                className="myCard"
              />
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
