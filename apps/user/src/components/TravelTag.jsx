import React from 'react';
import { View, Text, Image } from '@tarojs/components';
import { RightOutlined } from '@ant-design/icons';
import Location from '@/assets/location.webp';
import './TravelTag.scss';

const TravelTag = ({ label }) => {
  return (
    <View className='whole-tag'>
      <Image
        src={Location}
        style={{ width: '20px', height: '20px', borderRadius: '50%' }}
      />
      <Text className="tag-text">{label}</Text>
      <RightOutlined />
    </View>
  );
};

export default TravelTag;
