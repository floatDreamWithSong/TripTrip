import React from 'react';
import { View } from '@tarojs/components';
import { RightOutlined } from '@ant-design/icons';
import Location from '@/assets/location.webp'
import './TravelTag.scss'
const TravelTag = () => {
    return (
      <View className='whole-tag'>
        <img width="20" height="20" src={Location} alt="" style={{ borderRadius: '50%' }}/>
        黄姚古镇等(6)
        <RightOutlined />
        </View>
    )
}

export default TravelTag;
