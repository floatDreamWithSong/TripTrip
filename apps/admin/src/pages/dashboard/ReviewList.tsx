import { useState, useRef, useCallback, useEffect } from 'react';
import { Button, Message, useToaster, Loader, ButtonGroup } from 'rsuite';
import { motion, AnimatePresence } from 'framer-motion';
import { deletePassage, getAdminList, putReviewStatus } from '@/request/review';
import { PASSAGE_STATUS } from '@triptrip/utils';
import { PendingReviewPassages } from '@/types/passage';
import ReviewModal from '@/components/ReviewModal/index';
import { Review } from '@/types/review';
import ReviewListItem from '@/components/ReviewListItem';
import '../../styles/ReviewList.css';


const ReviewList = () => {
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentStatus, setCurrentStatus] = useState<number>(PASSAGE_STATUS.PENDING);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const toaster = useToaster();
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const loadingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (loadingRef.current) return;
    
    try {
      loadingRef.current = true;
      setIsLoading(true);
      setIsError(false);
      console.log('Fetching data...', { page, status: currentStatus });
      
      const response = await getAdminList({ page, limit: 10, status: currentStatus });
      console.log('Response received:', response);
      
      if (response?.data) {
        const newReviews = response.data.map((passage: PendingReviewPassages) => ({
          id: passage.pid || 0,
          title: passage.title || '',
          author: passage.author?.username || '',
          coverImage: passage.coverImageUrl || '',
          images: [],
          content: '',
          description: passage.PassageToTag?.map(pt => pt.tag.name) || [],
          status: 'pending',
        }));

        console.log('Processed reviews:', newReviews);

        if(newReviews.length === 0) {
          toaster.push(
            <Message type="info">
              已经到底了~
            </Message>
          );
          setHasMore(false);
        }
        
        if (page === 1) {
          setReviews(newReviews as Review[]);
        } else {
          setReviews(prev => {
            const existingIds = new Set(prev.map(review => review.id));
            const uniqueNewReviews = newReviews.filter((review: Review) => !existingIds.has(review.id));
            return [...prev, ...uniqueNewReviews] as Review[];
          });
        }
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setIsError(true);
      setError(err instanceof Error ? err : new Error('加载失败'));
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [page, currentStatus, toaster]);

  // 初始加载和状态变化时获取数据
  useEffect(() => {
    console.log('Effect triggered', { page, currentStatus });
    fetchData();
  }, [fetchData]);

  // 设置 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
          console.log('Intersection detected, loading more...');
          setPage(prev => prev + 1);
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 0.1,
      }
    );

    observerRef.current = observer;

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore]);

  // 更新观察的元素
  useEffect(() => {
    if (lastElementRef.current && observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current.observe(lastElementRef.current);
    }
  }, [reviews]);

  // 重置数据的函数
  const resetData = useCallback(() => {
    setPage(1);
    setReviews([]);
    setImageLoaded({});
    setHasMore(true);
    loadingRef.current = false;
  }, []);

  // 处理状态切换
  const handleStatusChange = useCallback((status: number) => {
    setCurrentStatus(status);
    setPage(1);
    setReviews([]);
    setHasMore(true);
    loadingRef.current = false;
  }, []);

  // 处理审核操作
  const handleReview = async (isApproved: boolean, isDelete: boolean = false, rejectReason?: string) => {
    if (!selectedReviewId) return;

    const currentReview = reviews.find(r => r.id === selectedReviewId);
    if (!currentReview) return;

    if (isDelete) {
      await deletePassage(selectedReviewId);
    } else {
      await putReviewStatus({
        pid: selectedReviewId,
        status: isApproved ? PASSAGE_STATUS.APPROVED : PASSAGE_STATUS.REJECTED,
        reason: isApproved ? void 0 : (rejectReason || '审核未通过')
      });
    }

    setOpen(false);
    setReviews(prev => prev.filter(review => review.id !== selectedReviewId));

    toaster.push(
      <Message type="success">
        {isDelete ? '已删除' : (isApproved ? '已批准' : '已拒绝')} {currentReview.title}
      </Message>
    );
  };

  const handleSelectReview = (id: number) => {
    setSelectedReviewId(id);
    setOpen(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.98,
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        mass: 0.8
      }
    },
    exit: { 
      opacity: 0,
      y: -20,
      scale: 0.98,
      transition: {
        duration: 0.15
      }
    }
  };

  return (
    <>
      <div className="review-list-header" style={{ 
        marginBottom: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}>
        <ButtonGroup>
          <Button 
            appearance={currentStatus === PASSAGE_STATUS.PENDING ? 'primary' : 'default'}
            onClick={() => handleStatusChange(PASSAGE_STATUS.PENDING)}
            size="md"
          >
            待审核
          </Button>
          <Button 
            appearance={currentStatus === PASSAGE_STATUS.APPROVED ? 'primary' : 'default'}
            onClick={() => handleStatusChange(PASSAGE_STATUS.APPROVED)}
            size="md"
          >
            已通过
          </Button>
          <Button 
            appearance={currentStatus === PASSAGE_STATUS.REJECTED ? 'primary' : 'default'}
            onClick={() => handleStatusChange(PASSAGE_STATUS.REJECTED)}
            size="md"
          >
            已拒绝
          </Button>
        </ButtonGroup>
      </div>

      { isLoading && reviews.length === 0 ? (
        <div className="review-list-loader" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '40px 0'
        }}>
          <Loader size="md" content="加载中..." vertical />
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{ position: 'relative' }}
        >
          <AnimatePresence mode="popLayout">
            {reviews.map((review, index) => (
              <motion.div
                key={review.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                style={{ 
                  position: 'relative',
                  zIndex: reviews.length - index
                }}
              >
                <ReviewListItem
                  review={review}
                  index={index}
                  isLastItem={index === reviews.length - 1}
                  imageLoaded={imageLoaded}
                  setImageLoaded={setImageLoaded}
                  lastElementRef={lastElementRef}
                  onSelectReview={handleSelectReview}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {isLoading && reviews.length > 0 && (
        <div className="review-list-loader" style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          padding: '20px 0'
        }}>
          <Loader size="sm" content="加载更多..." />
        </div>
      )}

      {isError && (
        <div className="review-list-error" style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          padding: '20px 0'
        }}>
          <div>{error instanceof Error ? error.message : '加载失败'}</div>
          <Button appearance="primary" onClick={resetData}>
            重试
          </Button>
        </div>
      )}

      <ReviewModal
        passageId={selectedReviewId}
        open={open}
        onClose={() => setOpen(false)}
        handleReview={handleReview}
        status={currentStatus === PASSAGE_STATUS.PENDING ? 'pending' : 
               currentStatus === PASSAGE_STATUS.APPROVED ? 'approved' : 'rejected'}
      />
    </>
  );
};

export default ReviewList;