import { View, Text } from '@tarojs/components';
import { useLoad } from '@tarojs/taro';
import { useState } from 'react';
import './myTravels.scss';

export default function myTravels() {
  const [fans, setFans] = useState(0);
  const [follows, setFollows] = useState(0);
  const [loves, setLoves] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState('全部');

  const handleFilterClick = (filter) => {
    setSelectedFilter(filter);
    console.log(`筛选条件已更新为: ${filter}`);
    // 待添加逻辑：筛选后的请求
  };
  useLoad(() => {
    console.log('Page - myTravels loaded.');
  });

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
      <View>aa</View>
    </View>
  );
}
