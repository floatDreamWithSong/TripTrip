import { View, Text, Image } from '@tarojs/components';
import { useState } from 'react';
import './addTravel.scss';
import AddPicture from '../../components/addPicture';
import { Flex, Input } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';

const TextArea = Input.TextArea;

export default function myTravels() {

  const [files, setFiles] = useState([])
  const [file, setFile] = useState(null)
  const [images, setImages] = useState([]);
  const [title, setTitle] = useState('');
  const [value, setValue] = useState('');
  const [agreement, setAgreement] = useState(false);

  const redPackage = (Math.random() * 10).toFixed(1);

  const onChange = (files) => {
    setFiles(files);
  };

  const handleImagesChange = (newFileList) => {
    console.log('接收到的图片列表:', newFileList);
    setImages(newFileList);
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
            <Text className="tag">目标文字模板 </Text>
          </View>
          <View className="tagButton" onPress={() => console.log('话题')}>
            <Text className="tag"># 话题 </Text>
          </View>
        </View>

        {/* 内容区域 */}
        {/* <View className="content">
          <View className="contentSection">
            <View className="contentHeader">
              <Text className="icon">📍</Text>
              <Text className="contentTitle">添加地点或线路</Text>
            </View>
            <Text className="contentSubtext">越详细越容易被推荐 😊</Text>
          </View>

          <View className="contentSection">
            <View className="contentHeader">
              <Text className="icon">Kyle</Text>
              <Text className="contentTitle">高级选项</Text>
            </View>
            <Text className="contentSubtext"></Text>
          </View>
        </View> */}

        {/* 底部复选框 */}
        {/* <View className="checkboxSection">
          <CheckBox
            value={agreement}
            onValueChange={setChecked => setAgreement(setChecked)}
          />
          <Text className="checkboxText">阅读并同意《携程社区发布规则》</Text>
        </View> */}
      </View>
    </View>
  )
}
