import { useEffect, useState } from 'react';
import { Modal, Button, Stack, Message, useToaster, Placeholder, Carousel, Tag, IconButton, Avatar } from 'rsuite';
import ReactPlayer from 'react-player';
import { getPassageDetail } from '@/request/review';
import { Image, Passage, PassageToTag } from '@/types/passage';
import { USER_TYPE } from '@triptrip/utils';
import { useUserStore } from '@/store/user';
import MarkdownIt from 'markdown-it';
import ArrowLeftLine from '@rsuite/icons/ArrowLeftLine';
import ArrowRightLine from '@rsuite/icons/ArrowRightLine';
import CloseIcon from '@rsuite/icons/Close';
import '../styles/ReviewModal.css';
import { useMediaQuery } from '@/hooks/useMediaQuery';

// 初始化markdown解析器
const md = new MarkdownIt();

interface Review {
  id: number;
  title: string;
  author: string;
  authorAvatar: string;
  coverImage: string;
  images: string[];
  video?: string;
  content: string;
  description: string[];
  status: 'pending' | 'approved' | 'rejected';
}

interface ReviewModalProps {
  passageId: number | null;
  open: boolean;
  onClose: () => void;
  handleReview: (isApproved: boolean, isDelete?: boolean) => Promise<void>;
}

const ReviewModal = ({ passageId, open, onClose, handleReview }: ReviewModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true); // 默认设置为加载中
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const toaster = useToaster();
  const userData = useUserStore(state => state.userInfo);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 获取文章详情
  useEffect(() => {
    if (passageId && open) {
      setIsLoading(true); // 每次打开模态框时，立即将加载状态设为true
      setReview(null); // 清空之前的数据
      setImageLoaded({}); // 重置图片加载状态
      setVideoLoaded(false); // 重置视频加载状态
      fetchPassageDetail(passageId);
    }
    // 关闭模态框时重置状态
    if (!open) {
      setActiveIndex(0);
      setPreviewImage(null);
      setPreviewVisible(false);
    }
  }, [passageId, open]);

  const fetchPassageDetail = async (id: number) => {
    try {
      const response = await getPassageDetail(id);
      if (response?.data) {
        const passage: Passage = response.data;
        const imageUrls = passage.images?.map((img: Image) => img.url || '') || [];
        
        setReview({
          id: passage.pid,
          title: passage.title,
          author: passage.author?.username || '',
          authorAvatar: passage.author?.avatar || '',
          coverImage: passage.coverImageUrl || '',
          images: imageUrls.filter(url => url), // 过滤掉空URL
          video: passage.videoUrl,
          content: passage.content,
          description: passage.PassageToTag?.map((pt: PassageToTag) => pt.tag.name) || [],
          status: 'pending',
        });
      }
    } catch (error) {
      console.error('获取文章详情失败', error);
      toaster.push(
        <Message type="error">获取文章详情失败</Message>
      );
    } finally {
      // 延迟结束加载状态，确保骨架屏有足够时间显示
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  // 处理轮播图上一张
  const handlePrev = () => {
    if (!review) return;
    const totalItems = (review.video ? 1 : 0) + review.images.length;
    setActiveIndex((activeIndex - 1 + totalItems) % totalItems);
  };

  // 处理轮播图下一张
  const handleNext = () => {
    if (!review) return;
    const totalItems = (review.video ? 1 : 0) + review.images.length;
    setActiveIndex((activeIndex + 1) % totalItems);
  };

  // 处理图片预览
  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    // 先设置图片URL，然后再显示预览窗口以实现渐变效果
    setTimeout(() => {
      setPreviewVisible(true);
    }, 50);
  };

  // 关闭图片预览
  const closeImagePreview = () => {
    setPreviewVisible(false);
    // 等待渐变动画完成后再清空图片URL
    setTimeout(() => {
      setPreviewImage(null);
    }, 300);
  };

  // 判断是否显示骨架屏
  const shouldShowSkeleton = isLoading || !review;

  return (
    <>
      <Modal 
        size={isMobile ? "full" : "lg"} 
        open={open} 
        onClose={onClose}
        className={isMobile ? "mobile-review-modal" : ""}
      >
        <Modal.Header>
          <Modal.Title>{!shouldShowSkeleton ? review?.title : <Placeholder.Paragraph rows={1} active style={{ width: 200 }} />}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {shouldShowSkeleton ? (
            <Stack direction="column" spacing={20}>
              <Placeholder.Graph active style={{ width: '100%', height: 400 }} />
              <Stack direction="column" spacing={16}>
                <div>
                  <h6 className="section-header">作者</h6>
                  <div className="author-container">
                    <Placeholder.Graph active style={{ width: 36, height: 36, borderRadius: '50%', marginRight: 10 }} />
                    <Placeholder.Paragraph rows={1} active style={{ width: 150 }} />
                  </div>
                </div>
                <div>
                  <h6 className="section-header">标签</h6>
                  <div className="tags-container">
                    {[1, 2, 3].map(i => (
                      <div key={i} style={{ width: 80, height: 24, marginRight: 10, marginBottom: 10 }}>
                        <Placeholder.Graph active style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h6 className="section-header">内容</h6>
                  <Placeholder.Paragraph rows={5} active style={{ width: '100%' }} />
                </div>
              </Stack>
            </Stack>
          ) : (
            <Stack direction="column" spacing={20}>
              <div className="media-container">
                {(review?.video || (review?.images && review.images.length > 0)) ? (
                  <div className="carousel-container">
                    <Carousel
                      autoplay={false}
                      activeIndex={activeIndex}
                      onSelect={index => setActiveIndex(index)}
                      className="carousel-custom"
                    >
                      {review?.video && (
                        <div className="video-container">
                          {!videoLoaded && (
                            <div className="video-placeholder">
                              <Placeholder.Graph active style={{ width: '90%', height: '80%' }} />
                            </div>
                          )}
                          <ReactPlayer
                            url={review.video}
                            width="100%"
                            height="100%"
                            controls
                            playing={activeIndex === 0}
                            onReady={() => setVideoLoaded(true)}
                            style={{ opacity: videoLoaded ? 1 : 0 }}
                          />
                        </div>
                      )}
                      {review?.images.map((image, index) => {
                        const imageIndex = review.video ? index + 1 : index;
                        const imageKey = `${review.id}-${image}`;
                        return (
                          <div key={imageIndex} className="image-container">
                            {!imageLoaded[imageKey] && (
                              <div className="image-placeholder">
                                <Placeholder.Graph active style={{ width: '90%', height: '80%' }} />
                              </div>
                            )}
                            <img
                              src={image}
                              alt={`${review.title} - ${index + 1}`}
                              className="carousel-image"
                              style={{
                                opacity: imageLoaded[imageKey] ? 1 : 0
                              }}
                              onLoad={() => setImageLoaded(prev => ({ ...prev, [imageKey]: true }))}
                              onClick={() => handleImagePreview(image)}
                            />
                          </div>
                        );
                      })}
                    </Carousel>
                    
                    {/* 轮播图左右切换按钮 */}
                    {(review?.video || review?.images.length > 1) && (
                      <>
                        <IconButton 
                          icon={<ArrowLeftLine />} 
                          circle
                          appearance="subtle"
                          onClick={handlePrev}
                          className="carousel-control carousel-control-prev"
                        />
                        <IconButton 
                          icon={<ArrowRightLine />} 
                          circle
                          appearance="subtle"
                          onClick={handleNext}
                          className="carousel-control carousel-control-next"
                        />
                      </>
                    )}
                  </div>
                ) : (
                  <div className="cover-container">
                      暂无图片
                  </div>
                )}
              </div>
              <Stack direction="column" alignItems='flex-start' spacing={16}>
                <div>
                  <h6 className="section-header">作者</h6>
                  <div className="author-container">
                    <Avatar 
                      src={review?.authorAvatar} 
                      alt={review?.author} 
                      className="author-avatar"
                      circle 
                      size="sm"
                    />
                    <p>{review?.author}</p>
                  </div>
                </div>
                <div>
                  <h6 className="section-header">标签</h6>
                  {review?.description && review.description.length > 0 ? (
                    review.description.map(i=>
                      <Tag key={i} color="blue" className="tag">{i}</Tag>
                    )
                  ) : (
                    <p className="no-tags">暂无标签</p>
                  )}
                </div>
                <div>
                  <h6 className="section-header">内容</h6>
                  <div 
                    className="markdown-content" 
                    dangerouslySetInnerHTML={{ __html: review?.content ? md.render(review.content) : '' }}
                  />
                </div>
              </Stack>
            </Stack>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => handleReview(false)} color="red" appearance="ghost">
            拒绝
          </Button>
          <Button onClick={() => handleReview(true)} color="green" appearance="primary">
            批准
          </Button>
          {
            userData?.userType === USER_TYPE.ADMIN && (
              <Button onClick={() => handleReview(false, true)} color="orange" appearance="primary">
                删除
              </Button>
            )
          }
        </Modal.Footer>
      </Modal>

      {/* 沉浸式图片预览 */}
      {previewImage && (
        <div 
          className="preview-overlay"
          style={{
            opacity: previewVisible ? 1 : 0,
            pointerEvents: previewVisible ? 'auto' : 'none'
          }}
          onClick={closeImagePreview}
        >
          <IconButton 
            icon={<CloseIcon />}
            appearance="subtle"
            circle
            size="lg"
            className="preview-close-button"
            style={{
              transform: previewVisible ? 'scale(1)' : 'scale(0.8)'
            }}
            onClick={closeImagePreview}
          />
          <img 
            src={previewImage} 
            alt="Preview" 
            className="preview-image"
            style={{
              transform: previewVisible ? 'scale(1)' : 'scale(0.9)'
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default ReviewModal; 