import { useEffect, useState } from 'react';
import { Modal, Button, Message, useToaster, Placeholder, Input } from 'rsuite';
import { getPassageDetail } from '@/request/review';
import { Image, Passage, PassageToTag } from '@/types/passage';
import { USER_TYPE } from '@triptrip/utils';
import { useUserStore } from '@/store/user';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MediaCarousel from './MediaCarousel';
import AuthorInfo from './AuthorInfo';
import TagList from './TagList';
import ContentSection from './ContentSection';
import ImagePreview from './ImagePreview';
import '../../styles/ReviewModal.css';

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
  handleReview: (isApproved: boolean, isDelete?: boolean, rejectReason?: string) => Promise<void>;
  status: 'pending' | 'approved' | 'rejected';
}

const ReviewModal = ({ passageId, open, onClose, handleReview, status }: ReviewModalProps) => {
  const [review, setReview] = useState<Review | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const toaster = useToaster();
  const userData = useUserStore(state => state.userInfo);
  const isMobile = useMediaQuery('(max-width: 768px)');

  // 获取文章详情
  useEffect(() => {
    if (passageId && open) {
      setIsLoading(true);
      setReview(null);
      setShowRejectInput(false);  // 重置拒绝输入状态
      setRejectReason('');        // 重置拒绝原因
      fetchPassageDetail(passageId);
    }
    if (!open) {
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
          images: imageUrls.filter(url => url),
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
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  };

  // 处理图片预览
  const handleImagePreview = (imageUrl: string) => {
    setPreviewImage(imageUrl);
    setTimeout(() => {
      setPreviewVisible(true);
    }, 50);
  };

  // 关闭图片预览
  const closeImagePreview = () => {
    setPreviewVisible(false);
    setTimeout(() => {
      setPreviewImage(null);
    }, 300);
  };

  // 处理拒绝按钮点击
  const handleRejectClick = () => {
    setShowRejectInput(true);
  };

  // 处理拒绝提交
  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      toaster.push(
        <Message type="warning">请输入拒绝原因</Message>
      );
      return;
    }
    handleReview(false, false, rejectReason);
  };

  // 处理批准按钮点击
  const handleApproveClick = () => {
    handleReview(true);
  };

  // 关闭模态框时重置状态
  const handleClose = () => {
    setShowRejectInput(false);
    setRejectReason('');
    onClose();
  };

  // 判断是否显示骨架屏
  const shouldShowSkeleton = isLoading || !review;

  return (
    <>
      <Modal
        size={isMobile ? "full" : "lg"}
        open={open}
        onClose={handleClose}
        className={isMobile ? "mobile-review-modal" : ""}
      >
        <Modal.Header>
          <Modal.Title>
            {!shouldShowSkeleton ? review?.title : <Placeholder.Graph active style={{ width: '100%', height: 36 }} />}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {shouldShowSkeleton ? (
            <div className='skeleton-container'>
              <Placeholder.Graph active className='media-placeholder' style={{ width: '100%', height: 300 }} />
              <div>
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
                      <div key={i} style={{ width: 80, height: 24, marginRight: 10, marginBottom: 10, display: 'inline-block' }}>
                        <Placeholder.Graph active style={{ width: '100%', height: '100%', borderRadius: 12 }} />
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h6 className="section-header">内容</h6>
                  <Placeholder.Paragraph rows={5} active style={{ width: '100%' }} />
                </div>
              </div>
            </div>
          ) : review && (
            <div className='data-content-container'>
              <div className="media-container">
                <MediaCarousel
                  video={review.video}
                  images={review.images}
                  title={review.title}
                  id={review.id}
                  onImageClick={handleImagePreview}
                />
              </div>

              <AuthorInfo
                author={review.author}
                authorAvatar={review.authorAvatar}
              />

              <TagList tags={review.description} />

              <ContentSection
                content={review.content}
                passageId={review.id}
              />
            </div>
          )}
        </Modal.Body>
        <Modal.Footer style={{ paddingTop: '15px' }}>
          {status !== 'rejected' && !showRejectInput && (
            <Button onClick={handleRejectClick} color="red" appearance="ghost">
              拒绝
            </Button>
          )}
          {status !== 'approved' && !showRejectInput && (
            <Button onClick={handleApproveClick} color="green" appearance="primary">
              批准
            </Button>
          )}
          {showRejectInput && (
            <div style={{ width: '100%', marginBottom: '10px' }}>
              <Input
                as="textarea"
                rows={3}
                maxLength={300}
                placeholder="请输入拒绝原因..."
                value={rejectReason}
                onChange={value => setRejectReason(value)}
                style={{ marginBottom: '10px', resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button onClick={() => setShowRejectInput(false)} appearance="ghost">
                  取消
                </Button>
                <Button onClick={handleRejectSubmit} color="red" appearance="primary">
                  确认拒绝
                </Button>
              </div>
            </div>
          )}
          {userData?.userType === USER_TYPE.ADMIN && !showRejectInput && (
            <Button onClick={() => handleReview(false, true)} color="orange" appearance="primary">
              删除
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <ImagePreview
        imageUrl={previewImage}
        visible={previewVisible}
        onClose={closeImagePreview}
      />
    </>
  );
};

export default ReviewModal; 