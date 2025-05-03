import { View, Text } from '@tarojs/components';
import { useLoad, redirectTo } from '@tarojs/taro';
import './index.scss';

export default function Index() {
  useLoad(() => {
    if (process.env.NODE_ENV !== 'development') 
      redirectTo({ url: '/pages/login/index' });
    
    console.log('Page loaded.');
  });

  return (
    <View className="index">
      <Text>Hello world!</Text>
    </View>
  );
}
