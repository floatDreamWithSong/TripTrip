import { useState, useRef, useCallback, useEffect, Suspense } from 'react';
import { Button, Message, useToaster, Loader, ButtonGroup } from 'rsuite';
import { motion, AnimatePresence } from 'framer-motion';
import { deletePassage, getAdminList, putReviewStatus } from '@/request/review';
import { PASSAGE_STATUS } from '@triptrip/utils';
import { PendingReviewPassages } from '@/types/passage';
import ReviewModal from '@/components/ReviewModal';
import { Review } from '@/types/review';
import ReviewListItem from '@/components/ReviewListItem';
import '../../styles/ReviewList.css';

// 创建一个加载占位符组件
const LoadingPlaceholder = () => (
  <div className="review-list-loading-placeholder">
    <Loader size="md" content="加载中..." vertical />
  </div>
);

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

  // 获取数据
  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      if (loadingRef.current) return;
      
      try {
        loadingRef.current = true;
        setIsLoading(true);
        setIsError(false);
        const response = await getAdminList({ page, limit: 10, status: currentStatus });
        
        if (!isMounted) return;
        
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
        if (!isMounted) return;
        setIsError(true);
        setError(err instanceof Error ? err : new Error('加载失败'));
      } finally {
        if (isMounted) {
          setIsLoading(false);
          loadingRef.current = false;
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [page, currentStatus]);

  // 设置 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingRef.current) {
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

  // 重置数据的函数
  const resetData = useCallback(() => {
    setPage(1);
    setReviews([]);
    setImageLoaded({});
    setHasMore(true);
    loadingRef.current = false;
  }, []);

  // 处理状态切换
  const handleStatusChange = (status: number) => {
    setCurrentStatus(status);
    setPage(1);
    setReviews([]);
    setHasMore(true);
    loadingRef.current = false;
  };

  // 处理审核操作
  const handleReview = async (isApproved: boolean, isDelete: boolean = false) => {
    if (!selectedReviewId) return;

    const currentReview = reviews.find(r => r.id === selectedReviewId);
    if (!currentReview) return;

    if (isDelete) {
      await deletePassage(selectedReviewId);
    } else {
      await putReviewStatus({
        pid: selectedReviewId,
        status: isApproved ? PASSAGE_STATUS.APPROVED : PASSAGE_STATUS.REJECTED,
        reason: isApproved ? void 0 : '审核未通过'
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
        delayChildren: 0.1,
        staggerChildren: 1,
        staggerDirection: 1
      }
    }
  };

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 30,
      scale: 0.95,
      filter: "blur(4px)"
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
        mass: 1
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.8,
      filter: "blur(4px)",
      transition: {
        duration: 0.2
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

      <Suspense fallback={<LoadingPlaceholder />}>
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
      </Suspense>

      {isLoading && (
        <div className="review-list-loader">
          <Loader content="加载中..." />
        </div>
      )}

      {isError && (
        <div className="review-list-error">
          {error instanceof Error ? error.message : '加载失败'}
          <Button appearance="link" onClick={resetData}>
            重试
          </Button>
        </div>
      )}

      <ReviewModal
        passageId={selectedReviewId}
        open={open}
        onClose={() => setOpen(false)}
        handleReview={handleReview}
      />
    </>
  );
};

export default ReviewList;