import { View, Text } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';
import { useDidHide } from '@tarojs/taro';
import './editTravel.scss';
import AddPicture from '../../components/addPicture';
import Taro from '@tarojs/taro'
import { modifyPassage } from '../../utils/travelApi'
import {
  Flex,
  Input,
  Checkbox,
  Button,
  Modal
} from 'antd';
import {
  FileTextOutlined,
  SettingOutlined,
  SyncOutlined,
  UploadOutlined,
  LeftOutlined
} from '@ant-design/icons';
import { submitTravel } from '../../utils/travelApi';
import { getAccessToken } from '../../utils/request';

const TextArea = Input.TextArea;
const draft = Taro.getStorageSync('editTravel');

export default function myTravels() {

  useEffect(() => {
    console.log('addTravel页面加载完成')

    // 设置两秒后关闭提示
    const checkLoginStatus = async () => {
      const accessToken = await getAccessToken();
      if (!accessToken) {
        // 显示组件加载完成提示，并设置两秒后消失
        Taro.showToast({
          title: '请先登录！',
          icon: 'loading',
          duration: 2000
        });
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/login/index' });
        }, 2000)
      } else {
        // 如果获取到访问令牌，可以进一步验证令牌的有效性
        // 这里可以根据需要添加更多的验证逻辑
        console.log('用户已登录');

        // 读取草稿
        if (draft) {
          Taro.showModal({
            title: '提示',
            content: '检测到草稿内容，是否恢复？',
            success: function (res) {
              if (res.confirm) {
                setTitle(draft.title || '');
                setContent(draft.content || '');
                setImages(draft.images || []);
                setVideoFile(draft.videoFile || null);
                setAgreement(draft.agreement || false);
                setTags(draft.tags || []);
              } else {
                Taro.removeStorageSync('editTravel'); // 用户取消就删除草稿
              }
            }
          });
        }
      }
    };

    console.log('读取到的草稿内容:', draft);
  }, []);

  useDidHide(() => {
    const nextPageUrl = Taro.getStorageSync('next_page_url') || '';
    const isLoginPage = nextPageUrl.includes('/pages/login/index');

    const hasUnsavedContent =
      title.trim() !== '' ||
      content.trim() !== '' ||
      images.length !== 0 ||
      videoFile !== null ||
      tags.length !== 0;

    const draft = Taro.getStorageSync('editTravel');

    setTimeout(() => {
      if (hasUnsavedContent && !draft && !isLoginPage) {
        Taro.showToast({
          title: '未存草稿，内容清空',
          icon: 'none',
          duration: 2000,
        });
      }
    })

    // ✅ 清除草稿
    if (!isLoginPage) {
      Taro.removeStorageSync('editTravel');
    }

    // ✅ 清空本地状态
    // setTitle('');
    // setContent('');
    // setImages([]);
    // setVideoFile(null);
    // setAgreement(false);
    // setFiles([]);
    // setFile(null);
    // setTags([]);

    Taro.removeStorageSync('next_page_url');
  });

  const safeNavigate = async (url) => {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      Taro.showToast({
        title: '请先登录！',
        icon: 'loading',
        duration: 2000
      });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 2000);
      return;
    }

    // 已登录，直接跳
    Taro.navigateTo({ url });
  };

  const [files, setFiles] = useState([])
  const [file, setFile] = useState(null)
  const [images, setImages] = useState([draft.images || []]);
  const [videoFile, setVideoFile] = useState(draft.videoFile || null);
  const [title, setTitle] = useState(draft.title || '');
  const [content, setContent] = useState(draft.content || '');
  const [tags, setTags] = useState(draft.PassageToTag || []);
  const [agreement, setAgreement] = useState(false);
  const [loadings, setLoadings] = useState([]);
  const [savedAsDraft, setSavedAsDraft] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // 控制Modal显示
  const [selectedTagOptions, setSelectedTagOptions] = useState([]); // 当前选中的标签
  const [customTagInput, setCustomTagInput] = useState('');
  const inputRef = useRef(null);

  const allTagOptions = ['风景', '美食', '亲子', '情侣', '古镇', '露营', '轻徒步', '民宿体验'];


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
      const success = await modifyPassage({
        title, content, images, videoFile, agreement, tags
      });

      const duration = Date.now() - startTime;
      const remaining = MIN_LOADING_TIME - duration;

      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }

      if (success) {
        Taro.removeStorageSync('editTravel');

        Taro.showToast({
          title: '修改成功',
          icon: 'success',
          duration: 2000
        });

        // 清空逻辑
        setTitle('');
        setContent('');
        setImages([]);
        setVideoFile(null);
        setAgreement(false);
        setTags([]);
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

  const handleAddTags = (newTags) => {
    const uniqueTags = Array.from(new Set([...tags, ...newTags]));

    setTags(uniqueTags);
  };


  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleJumpBack = () => {
    Taro.navigateBack();
  }

  return (
    <View className='addTravel-container'>
      <View className='backButton'>
        <LeftOutlined 
          className='backIcon'
          onClick={() => handleJumpBack()}
        />
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
              setTitle(e.target.content)
              // console.log(title)
            }}
            placeholder="填写标题更容易上精选"
            variant="borderless"
          />
          <TextArea
            value={content}
            onChange={e => {
              setContent(e.target.content)
              // console.log(content)
            }}
            showCount
            maxLength={1000}
            placeholder="请详细游记描述，不超过1000字"
            style={{ width: '100%', height: 200, resize: 'none' }}
            variant="borderless"
          />
        </Flex>
      </View>
      {tags.length > 0 && (
        <View className="tagDisplay">
          {tags.map(tag => (
            <View key={tag} className="tagItem">
              <Text className="tagText">#{tag}</Text>
              <Text className="removeTag" onClick={() => handleRemoveTag(tag)}>❌</Text>
            </View>
          ))}
        </View>
      )}

      <View className="bottom-container">
        {/* 标签区域 */}
        <View className="tags">
          <View className="tagButton" onPress={() => console.log('目标文字模板')}>
            <FileTextOutlined className='tagIcon' />
            <Text className="tag">文字模板 </Text>
          </View>
          <View className="tagButton" onClick={() => {
            setSelectedTagOptions(tags);
            setIsModalOpen(true)
          }
          }>
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
          <Checkbox
            checked={agreement} // ✅ 绑定 state，成为受控组件
            onChange={(e) => setAgreement(e.target.checked)} // 注意这里要用 e.target.checked
          >
            <Text className="checkboxText">阅读并同意《携程社区发布规则》</Text>
          </Checkbox>

        </View>
      </View>
      <View className='publish-container'>
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

      <Modal
        title="选择话题标签"
        open={isModalOpen}
        onOk={() => {
          const trimmedInput = customTagInput.trim();
          let newTags = [...selectedTagOptions];
          if (trimmedInput) {
            newTags.push(trimmedInput);
          }
          handleAddTags(newTags);
          setIsModalOpen(false);
          setCustomTagInput('');
          setSelectedTagOptions([]); // 清空选择
        }}
        onCancel={() => {
          setIsModalOpen(false);
          setCustomTagInput('');
          setSelectedTagOptions([]); // 取消时也清空选择
        }}
      >
        <View style={{ marginBottom: 12 }}>
          <Text style={{ fontWeight: 'bold' }}>选择预设标签：</Text>
          <Flex wrap="wrap" gap="small" style={{ marginTop: 8 }}>
            {allTagOptions.map(tag => (
              <Button
                key={tag}
                type={selectedTagOptions.includes(tag) ? 'primary' : 'default'}
                onClick={() => {
                  const alreadySelected = selectedTagOptions.includes(tag);
                  if (alreadySelected) {
                    setSelectedTagOptions(prev => prev.filter(t => t !== tag));
                  } else {
                    setSelectedTagOptions(prev => [...prev, tag]);
                  }
                }}
                size="small"
              >
                #{tag}
              </Button>
            ))}
          </Flex>
        </View>

        <View>
          <Text style={{ fontWeight: 'bold' }}>自定义标签：</Text>
          <Input
            placeholder="请输入自定义标签"
            value={customTagInput}
            onChange={e => setCustomTagInput(e.target.content)}
            ref={inputRef}
            style={{ marginTop: 8 }}
            maxLength={10}
          />
          <Text type="secondary" style={{ fontSize: 12 }}>（最多10个字符）</Text>
        </View>
      </Modal>

    </View>
  )
}
