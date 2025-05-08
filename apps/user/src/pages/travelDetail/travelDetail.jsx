import React, { useState } from 'react';
import Taro from '@tarojs/taro';
import { View, Text, Image, Swiper, SwiperItem, Input } from '@tarojs/components';
import { LikeOutlined,CommentOutlined, ShareAltOutlined, HeartOutlined } from '@ant-design/icons';
import TravelTag from '@/components/TravelTag'
import './travelDetail.scss';
const TravelDetail = () => {
  const [isLiked, setIsLiked] = useState(false);
  const [isCollected, setIsCollected] = useState(false);
  const [likeCount, setLikeCount] = useState(239);
  const [commentCount, setCommentCount] = useState(6);
  const [collectCount, setCollectCount] = useState(100);

  // 模拟轮播图数据
  const swiperImages = [
    'https://picsum.photos/seed/11/430/1000',
    'https://picsum.photos/seed/21/430/1000',
    'https://picsum.photos/seed/31/430/1000',
    'https://picsum.photos/seed/41/430/1000',
    'https://picsum.photos/seed/5/430/1000',
  ];

  // 模拟文章数据
  const articleData = {
    title: '五一不挤适合小住三天的四个冷门城市',
    username: '小探旅游博主',
    avatar: 'https://picsum.photos/seed/1/100/100',
    content: `## 黄姚古镇·广西昭平
    ### **特色亮点**
    1. **明清古建筑群**
       保存完好的青砖黛瓦、石板街巷，夜晚灯笼亮起时仿佛穿越回古代。
    2. **山水画卷**
       古镇被喀斯特群山环抱，带龙桥、鲤鱼街等景点随手一拍就是大片。
    3. **隐世美食**
       必尝豆腐酿、豆豉蒸排骨，推荐「古井农庄」的柴火饭。

    **住宿建议**：选择古镇内的精品民宿（如「拾方传家」），推开窗即是风景。

    ---

    ## 松阳·浙江丽水
    ### **秘境体验**
    - **云端村落**：杨家堂村被称为“江南最后的秘境”，黄昏时金色民居与炊烟构成油画般的场景。
    - **茶园骑行**：大木山茶园有专用骑行道，租辆自行车穿梭在茶海中。
    - **手作工坊**：体验非遗「松阳高腔」剪纸或古法红糖制作。

    **Tips**：5月正值采茶季，可参与制茶体验。

    ---

    ## 丙中洛·云南怒江
    ### **小众玩法**
    ✔ **怒江第一湾**：徒步至观景台俯瞰马蹄形江湾，云雾缭绕时宛如仙境。
    ✔ **茶马古道**：跟随向导重走马帮路线，探访隐世的秋那桶村。
    ✔ **多民族风情**：傈僳族、怒族村落里喝一碗酥油茶，听原生态民歌。

    **交通**：建议包车游玩，注意防滑鞋必备。

    ---

    ## 南矶山·江西南昌
    ### **自然野趣**
    - **候鸟天堂**：5月湿地可见白鹤、天鹅，摄影爱好者必去。
    - **草海奇观**：鄱阳湖枯水期形成的“草原”，适合露营看星空。
    - **渔家乐**：现捞现做的银鱼蒸蛋鲜美无比。

    **最佳时间**：清晨或傍晚游览，避开正午暴晒。

    ---

    ### **结语**
    这些冷门地商业化低，适合放慢节奏小住。记得带相机和驱蚊液！
    `,
  };

  // 返回首页
  const handleBackToHome = () => {
    Taro.navigateBack({
      delta: 1,
    });
  };

  // 点击关注
  const handleFollow = () => {
    Taro.showToast({
      title: '关注成功',
      icon: 'success',
    });
  };

  // 点击图片全屏查看
  const handleImagePreview = (current) => {
    Taro.previewImage({
      current,
      urls: swiperImages,
    });
  };

  // 点赞功能
  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  // 评论功能
  const handleComment = () => {
    Taro.showToast({
      title: '评论功能开发中',
      icon: 'none',
    });
  };

  // 分享功能
  const handleShare = () => {
    Taro.showShareMenu({
      withShareTicket: true,
    });
  };

  // 收藏功能
  const handleCollect = () => {
    if (isCollected) {
      setCollectCount(collectCount - 1);
    } else {
      setCollectCount(collectCount + 1);
    }
    setIsCollected(!isCollected);
  };

  return (
    <View className="travel-detail-container">
      {/* 顶部导航栏 */}
      <View className="header">
        <View className="header-left" onClick={handleBackToHome}>
          <img
            width="25"
            height="25"
            src="https://img.icons8.com/ios-glyphs/30/back.png"
            alt="back"
          />
          <Image className="author-avatar" src={articleData.avatar} />
          <Text className="author-name">{articleData.username}</Text>
        </View>
        <View className="header-right">
          <View className="follow-btn" onClick={handleFollow}>
            <Text>+ 关注</Text>
          </View>
          <img
            width="30"
            height="30"
            src="https://img.icons8.com/external-royyan-wijaya-detailed-outline-royyan-wijaya/24/external-ellipsis-interface-royyan-wijaya-detailed-outline-royyan-wijaya.png"
            alt="external-ellipsis-interface-royyan-wijaya-detailed-outline-royyan-wijaya"
          />
        </View>
      </View>

      {/* 轮播图部分 */}
      <Swiper
        className="swiper-container"
        indicatorColor="#999"
        indicatorActiveColor="#1890ff"
        circular
        indicatorDots
        autoplay
      >
        {swiperImages.map((image, index) => (
          <SwiperItem key={index} onClick={() => handleImagePreview(image)}>
            <Image className="swiper-image" src={image} mode="aspectFill" />
          </SwiperItem>
        ))}
      </Swiper>
{/* 标签部分 */}
<View className='tags-container'><TravelTag></TravelTag></View>
      {/* 内容区域 */}
      <View className="content-container">
        <Text className="content-title">{articleData.title}</Text>
        <Text className="content-text">{articleData.content}</Text>
      </View>

      {/* 底部操作栏 */}

      <View className="footer">
        <View className="comment-input">
          <Input
            className="input"
            placeholder="来条神评"
            placeholderStyle="color:rgba(244, 248, 251,0.85);"
          />
        </View>
        <View className={`action-btn ${isLiked ? 'active' : ''}`} onClick={handleLike}>
        <LikeOutlined />
          <Text className="count">{likeCount}</Text>
        </View>
        <View className="action-btn" onClick={handleComment}>
          <CommentOutlined />
          <Text className="count">{commentCount}</Text>
        </View>
        <View className="action-btn" onClick={handleShare}>
          <ShareAltOutlined />
          <Text className="count">分享</Text>
        </View>
        <View className={`action-btn ${isCollected ? 'active' : ''}`} onClick={handleCollect}>
          <HeartOutlined />
          <Text className="count">{collectCount}</Text>
        </View>
      </View>
    </View>
  );
};

export default TravelDetail;
