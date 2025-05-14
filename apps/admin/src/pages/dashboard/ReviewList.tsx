import { useState, useRef, useCallback, useEffect } from 'react';
import { List, Button, Message, useToaster, Loader, ButtonGroup } from 'rsuite';
import gsap from 'gsap';
import { deletePassage, getAdminList, putReviewStatus } from '@/request/review';
import { PASSAGE_STATUS } from '@triptrip/utils';
import { PendingReviewPassages } from '@/types/passage';
import ReviewModal from '@/components/ReviewModal';
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
  const listItemsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const prevReviewsRef = useRef<Review[]>([]);
  const toaster = useToaster();
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});

  // 获取数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setIsError(false);
        const response = await getAdminList({ page, limit: 10, status: currentStatus });
        
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
        setIsError(true);
        setError(err instanceof Error ? err : new Error('加载失败'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [page, currentStatus]);

  // 检测新增的元素并执行动画
  useEffect(() => {
    const prevReviews = prevReviewsRef.current;
    const prevIds = new Set(prevReviews.map(r => r.id));

    // 找出新增的元素
    const newReviews = reviews.filter(review => !prevIds.has(review.id));

    // 只对新增的元素执行动画
    newReviews.forEach((review, index) => {
      const element = listItemsRef.current[review.id];
      if (element) {
        // 设置初始状态
        gsap.set(element, {
          opacity: 0,
          y: 50,
          scale: 0.8
        });

        // 执行动画
        gsap.to(element, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.5,
          delay: index * 0.1,
          ease: "power2.out"
        });
      }
    });

    // 更新 prevReviews
    prevReviewsRef.current = reviews;
  }, [reviews]);

  // 重置数据的函数
  const resetData = useCallback(() => {
    setPage(1);
    setReviews([]);
    setImageLoaded({});
    setHasMore(true);
  }, []);

  // 设置 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
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
  }, [hasMore, isLoading]);

  // 更新观察的元素
  useEffect(() => {
    if (lastElementRef.current && observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current.observe(lastElementRef.current);
    }
  }, [reviews]);

  // 处理审核操作
  const handleReview = async (isApproved: boolean, isDelete: boolean = false) => {
    if (!selectedReviewId) return;

    const currentReview = reviews.find(r => r.id === selectedReviewId);
    if (!currentReview) return;

    const currentIndex = reviews.findIndex(r => r.id === selectedReviewId);
    if (currentIndex === -1) return;

    const element = listItemsRef.current[selectedReviewId];
    if (!element) return;

    // 获取List.Item元素（父元素）
    const listItemElement = element.closest('.rs-list-item');
    if (!listItemElement) return;

    // 获取元素实际高度
    const elementHeight = listItemElement.getBoundingClientRect().height;
    const computedStyle = window.getComputedStyle(listItemElement);
    const marginTop = parseFloat(computedStyle.marginTop);
    const marginBottom = parseFloat(computedStyle.marginBottom);
    const totalHeight = elementHeight + marginTop + marginBottom;

    if (isDelete) {
      await deletePassage(selectedReviewId);
    } else {
      await putReviewStatus({
        pid: selectedReviewId,
        status: isApproved ? PASSAGE_STATUS.APPROVED : PASSAGE_STATUS.REJECTED,
        reason: isApproved ? void 0 : '审核未通过'
      });
    }

    // 1. 首先执行消失动画
    await gsap.to(element, {
      opacity: 0,
      scale: 0.8,
      duration: 0.3,
      ease: "power2.in"
    });

    // 2. 获取当前元素后面的所有元素
    const followingElements = reviews
      .slice(currentIndex + 1)
      .map(r => listItemsRef.current[r.id]?.closest('.rs-list-item'))
      .filter((el): el is HTMLElement => el !== null);

    setOpen(false);
    // 3. 执行上移动画
    if (followingElements.length > 0) {
      await gsap.to(followingElements, {
        y: `-=${totalHeight}`,
        duration: 0.5,
        ease: "power2.inOut",
        stagger: 0.05
      });
    }

    // 4. 在一个微任务中更新状态，确保动画完成
    // 不能直接更新，react的set是异步的，导致直接使用会造成闪烁
    await new Promise(resolve => {
      requestAnimationFrame(() => {
        setReviews(prev => prev.filter(review => review.id !== selectedReviewId));
        resolve(null);
      });
    });

    // 5. 等待一帧以确保状态更新完成
    await new Promise(resolve => requestAnimationFrame(resolve));

    // 6. 重置位置
    gsap.set(followingElements, { clearProps: "y" });

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

  // 处理状态切换
  const handleStatusChange = (status: number) => {
    setCurrentStatus(status);
    setPage(1);
    setReviews([]);
    setHasMore(true);
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

      <List hover style={{
        overflow:'hidden'
      }} >
        {reviews.map((review, index) => (
          <ReviewListItem
            key={review.id}
            review={review}
            index={index}
            isLastItem={index === reviews.length - 1}
            imageLoaded={imageLoaded}
            setImageLoaded={setImageLoaded}
            lastElementRef={lastElementRef}
            listItemsRef={listItemsRef}
            onSelectReview={handleSelectReview}
          />
        ))}
      </List>

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