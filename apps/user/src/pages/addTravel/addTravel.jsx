import { View, Text, Image } from '@tarojs/components';
import { useState, useEffect } from 'react';
import { useDidHide } from '@tarojs/taro';
import './addTravel.scss';
import AddPicture from '../../components/addPicture';
import Taro, { Component } from '@tarojs/taro'
import {
  Flex,
  Input,
  Checkbox,
  Button,
  ConfigProvider,
  Space
} from 'antd';
import {
  FileTextOutlined,
  SettingOutlined,
  PaperClipOutlined,
  AntDesignOutlined,
  PoweroffOutlined,
  SyncOutlined,
  UploadOutlined
} from '@ant-design/icons';
import { submitTravel } from '../../utils/travelApi';
import { getAccessToken } from '../../utils/request';

const TextArea = Input.TextArea;

export default function myTravels() {

  useEffect(() => {
    console.log('addTravel页面加载完成')

    // 显示组件加载完成提示，并设置两秒后消失
    Taro.showToast({
      title: '请先登录！',
      icon: 'loading',
      duration: 2000
    });

    // 设置两秒后关闭提示
    setTimeout(() => {
      const checkLoginStatus = async () => {
        const accessToken = await getAccessToken();
        if (!accessToken) {
          // 如果没有获取到访问令牌，跳转到登录页面
          // Taro.showToast({
          //   title: '未登录，请先登录',
          //   icon: 'none'
          // });
          Taro.navigateTo({ url: '/pages/login/index' });
        } else {
          // 如果获取到访问令牌，可以进一步验证令牌的有效性
          // 这里可以根据需要添加更多的验证逻辑
          console.log('用户已登录');

          // 读取草稿
          const draft = Taro.getStorageSync('travel_draft');
          if (draft) {
            Taro.showModal({
              title: '提示',
              content: '检测到草稿内容，是否恢复？',
              success: function (res) {
                if (res.confirm) {
                  setTitle(draft.title || '');
                  setValue(draft.value || '');
                  setImages(draft.images || []);
                  setVideoFile(draft.videoFile || null);
                  setAgreement(draft.agreement || false);
                } else {
                  Taro.removeStorageSync('travel_draft'); // 用户取消就删除草稿
                }
              }
            });
          }
        }
      };

      checkLoginStatus();
    }, 2000);

  }, []);


  useDidHide(() => {
    const draft = Taro.getStorageSync('travel_draft');
    if (!draft) {
      setTitle('');
      setValue('');
      setImages([]);
      setVideoFile(null);
      setAgreement(false);
      setFiles([]);
      setFile(null);
      console.log('未存草稿，清空数据');
    }
  });

  const [files, setFiles] = useState([])
  const [file, setFile] = useState(null)
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [loadings, setLoadings] = useState([]);
  const [savedAsDraft, setSavedAsDraft] = useState(false);


  const redPackage = (Math.random() * 10).toFixed(1);
  // const { styles } = useStyle();

  const onChange = (files) => {
    setFiles(files);
  };

  const handleImagesChange = (newFileList) => {
    console.log('接收到的图片列表:', newFileList);
    setImages(newFileList);
  };

  const enterLoading = async index => {
    setLoadings(prevLoadings => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });

    const MIN_LOADING_TIME = 800; // 至少显示 800ms
    const startTime = Date.now();

    try {
      const success = await submitTravel({
        title, value, images, videoFile, agreement
      });

      const duration = Date.now() - startTime;
      const remaining = MIN_LOADING_TIME - duration;

      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }

      if (success) {
        Taro.removeStorageSync('travel_draft');

        Taro.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000
        });

        // 清空逻辑
        setTitle('');
        setValue('');
        setImages([]);
        setVideoFile(null);
        setAgreement(false);
        setFiles([]);
        setFile(null);

        setTimeout(() => {
          Taro.switchTab({
            url: '/pages/myTravels/myTravels'
          });
        }, 2000);
      }
    } finally {
      setLoadings(prevLoadings => {
        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        return newLoadings;
      });
    }
  };

  return (
    <View>
      <View className='redPackage'>
        <View className='redPackage-icon'></View>
        完成本次发布，最高可获得
        <Text className='redPackage-num'>
          {redPackage}
        </Text>
        元现金红包
      </View>
      <View className="photos-container">
        <AddPicture
          value={images}
          onChange={handleImagesChange}
        />
      </View>
      <View className='message-container'>
        <Flex vertical gap={12}>
          <Input
            value={title}
            onChange={e => {
              setTitle(e.target.value)
              console.log(title)
            }}
            placeholder="填写标题更容易上精选"
            variant="borderless"
          />
          {/* <Input
            showCount
            maxLength={100}
            onChange={onChange}
            placeholder="disable resize"
            style={{ height: 120, resize: 'none' }}
          /> */}
          <TextArea
            value={value}
            onChange={e => {
              setValue(e.target.value)
              console.log(value)
            }}
            showCount
            maxLength={1000}
            placeholder="请详细游记描述，不超过1000字"
            style={{ width: '100%', height: 200, resize: 'none' }}
            variant="borderless"
          />
        </Flex>
      </View>
      <View className="bottom-container">
        {/* 标签区域 */}
        <View className="tags">
          <View className="tagButton" onPress={() => console.log('目标文字模板')}>
            <FileTextOutlined className='tagIcon' />
            <Text className="tag">文字模板 </Text>
          </View>
          <View className="tagButton" onPress={() => console.log('话题')}>
            <Text className="tag"># 话题 </Text>
          </View>
        </View>

        {/* 内容区域 */}
        <View className="content">
          <View className="contentSection">
            <View className="contentHeader">
              <Text className="icon">📍</Text>
              <Text className="contentTitle">添加地点或线路</Text>
            </View>
            <Text className="contentSubtext">越详细越容易被推荐 😊</Text>
          </View>

          <View className="contentSection">
            <View className="contentHeader">
              <Text className="icon">
                <SettingOutlined className='setIcon' />
              </Text>
              <Text className="contentTitle">高级选项</Text>
            </View>
            <Text className="contentSubtext"></Text>
          </View>
        </View>

        {/* 底部复选框 */}
        <View className="checkboxSection">
          {/* <CheckBox
            value={agreement}
            onValueChange={setChecked => setAgreement(setChecked)}
          /> */}
          <Checkbox
            checked={agreement} // ✅ 绑定 state，成为受控组件
            onChange={(e) => setAgreement(e.target.checked)} // 注意这里要用 e.target.checked
          >
            <Text className="checkboxText">阅读并同意《携程社区发布规则》</Text>
          </Checkbox>

        </View>
      </View>
      <View className='publish-container'>
        <View className='draft' onClick={() => {
          const draftData = {
            title,
            value,
            images,
            videoFile,
            agreement
          };
          Taro.setStorageSync('travel_draft', draftData);
          Taro.showToast({
            title: '已存为草稿',
            icon: 'success',
            duration: 1500
          });
          setTimeout(() => {
            Taro.navigateTo({
              url: '/pages/myTravels/myTravels'
            });
          }, 1500)
        }}>
          <PaperClipOutlined />
          <View className='draftText'>存草稿</View>
        </View>

        <View className='publish'>
          <Button
            type="primary"
            icon={<UploadOutlined />}
            loading={loadings[3] && { icon: <SyncOutlined spin /> }}
            onClick={() => enterLoading(3)}
            className='publishBtn'
          >
            发布
          </Button>
        </View>
      </View>
    </View>
  )
}
