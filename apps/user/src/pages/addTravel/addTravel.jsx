import { View, Text, Image, Checkbox as CheckBox } from '@tarojs/components';
import { useState, useEffect } from 'react';
import './addTravel.scss';
import AddPicture from '../../components/addPicture';
import Taro, { Component } from '@tarojs/taro'
import {
  Flex,
  Input,
  Radio,
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
// import { createStyles } from 'antd-style';
import { getAccessToken } from '../../utils/request';

const TextArea = Input.TextArea;

// const useStyle = createStyles(({ prefixCls, css }) => ({
//   linearGradientButton: css`
//     &.${prefixCls}-btn-primary:not([disabled]):not(.${prefixCls}-btn-dangerous) {
//       > span {
//         position: relative;
//       }

//       &::before {
//         content: '';
//         background: linear-gradient(135deg, #6253e1, #04befe);
//         position: absolute;
//         inset: -1px;
//         opacity: 1;
//         transition: all 0.3s;
//         border-radius: inherit;
//       }

//       &:hover::before {
//         opacity: 0;
//       }
//     }
//   `,
// }));

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
        }
      };

      checkLoginStatus();
    }, 2000);

  }, []);

  const submitToBackend = async () => {
    try {
      const formData = new FormData();
  
      formData.append('title', title);
      formData.append('content', value);
      formData.append('tags', '示例标签');
  
      console.log("准备提交的图片列表：", images);
  
      images.forEach((image, index) => {
        const file = image.originFileObj;
        if (file instanceof File) {
          const fileToHttp = URL.createObjectURL(file)
          formData.append('images', fileToHttp);
          // formData.append('images', file);
          console.log(`添加图片 ${index + 1}:`, file.name);
        } else {
          console.warn(`第 ${index + 1} 张图片没有 originFileObj`);
        }
      });
  
      if (videoFile instanceof File) {
        formData.append('video', videoFile);
        console.log('添加视频文件:', videoFile.name);
      }
  
      console.log('FormData内容：');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      if (formData.get('title') === '') {
        Taro.showToast({ title: '标题不能为空', icon: 'none', duration: 2000 });
        return;
      }

      if (formData.get('content') === '') {
        Taro.showToast({ title: '内容不能为空', icon: 'none', duration: 2000 });
        return;
      }

      if (formData.get('images') === '') {
        Taro.showToast({ title: '请上传图片', icon: 'none', duration: 2000 });
        return;
      }
  
      const response = await fetch('https://your.api.host/passage/user', {
        method: 'POST',
        body: formData,
      });
  
      const result = await response.json();
  
      if (response.ok) {
        Taro.showToast({ title: '发布成功', icon: 'success', duration: 2000 });
        console.log('发布成功:', result);
      } else {
        Taro.showToast({ title: '发布失败', icon: 'none', duration: 2000 });
        console.error('后端错误:', result);
      }
    } catch (err) {
      Taro.showToast({ title: '网络异常', icon: 'none', duration: 2000 });
      console.error('网络异常:', err);
    }
  };
  

  const [files, setFiles] = useState([])
  const [file, setFile] = useState(null)
  const [images, setImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [agreement, setAgreement] = useState(false);
  const [loadings, setLoadings] = useState([]);


  const redPackage = (Math.random() * 10).toFixed(1);
  // const { styles } = useStyle();

  const onChange = (files) => {
    setFiles(files);
  };

  const handleImagesChange = (newFileList) => {
    console.log('接收到的图片列表:', newFileList);
    setImages(newFileList);
  };

  const enterLoading = index => {
    setLoadings(prevLoadings => {
      const newLoadings = [...prevLoadings];
      newLoadings[index] = true;
      return newLoadings;
    });
    setTimeout(() => {
      setLoadings(prevLoadings => {
        setTimeout(() => {
          setLoadings(prevLoadings => {
            const newLoadings = [...prevLoadings];
            newLoadings[index] = false;
        
            // 👇 调用上传函数
            submitToBackend();
        
            console.log('loading finish');
            // Taro.showToast({
            //   title: '发布成功',
            //   icon: 'success',
            //   duration: 2000
            // });
        
            return newLoadings;
          });
        
          // 页面跳转逻辑
          setTimeout(() => {
            Taro.switchTab({
              url: '/pages/myTravels/myTravels'
            });
          }, 2000);
        }, 3000);
        


        const newLoadings = [...prevLoadings];
        newLoadings[index] = false;
        console.log('loading finish');
        Taro.showToast({
          title: '发布成功',
          icon: 'success',
          duration: 2000
        });
        return newLoadings;
      });

      // 在 toast 显示后切换页面
      setTimeout(() => {
        Taro.switchTab({
          url: '/pages/index/index'
        });
      }, 2000); // 4秒后切换页面，确保 toast 显示完毕（2秒）后再进行跳转
    }, 3000);

  };

  // const onUpload = () => {
  //   chooseImage({
  //     count: 1,
  //     sizeType: ["original", "compressed"],
  //     sourceType: ["album", "camera"],
  //   }).then(({ tempFiles }) => {
  //     setFile({
  //       url: tempFiles[0].path,
  //       type: tempFiles[0].type,
  //       name: tempFiles[0].originalFileObj?.name,
  //     });
  //   });
  // };

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
        <AddPicture onChange={handleImagesChange} />
      </View>
      <View className='message-container'>
        <Flex vertical gap={12}>
          <Input
            // value={title}
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
            // value={value}
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
          <Radio>
            <Text className="checkboxText">阅读并同意《携程社区发布规则》</Text>
          </Radio>

        </View>
      </View>
      <View className='publish-container'>
        <View className='draft'>
          <PaperClipOutlined />
          <View className='draftText'>
            存草稿
          </View>
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
