import { useState, useRef, useCallback, useEffect } from 'react';
import { List, Panel, Modal, Button, Stack, Message, useToaster, Loader, Placeholder, Carousel } from 'rsuite';
import { PageEnd } from '@rsuite/icons'
import gsap from 'gsap';
import { deletePassage, getPendingList, PendingPassage, putReviewStatus } from '@/request/review';
import { useQuery } from 'react-query';
import ReactPlayer from 'react-player';
import { PASSAGE_STATUS, USER_TYPE } from '@triptrip/utils';
import { useUserStore } from '@/store/user';

interface Review {
  id: number;
  title: string;
  author: string;
  image: string;
  images: string[];
  video?: string;
  content: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ReviewList = () => {
  const [page, setPage] = useState(1);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [open, setOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const listItemsRef = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const prevReviewsRef = useRef<Review[]>([]);
  const toaster = useToaster();
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const userData = useUserStore(state => state.userInfo);
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['pendingList', page],
    queryFn: () => getPendingList({ page, limit: 10 }),
    keepPreviousData: true,
  });

  // 数据转换和状态更新
  useEffect(() => {
    if (data?.data) {
      const newReviews = data.data.map((passage: PendingPassage) => ({
        id: passage.pid,
        title: passage.title,
        author: passage.author.username,
        image: passage.PassageImage[0]?.url || '',
        images: passage.PassageImage.map(img => img.url),
        video: passage.videoUrl,
        content: passage.content,
        description: passage.PassageToTag.map(pt => pt.tag.name).join(', '),
        status: 'pending',
      }));

      if (page === 1) {
        setReviews(newReviews as Review[]);
      } else {
        setReviews(prev => [...prev, ...newReviews] as Review[]);
      }

      setHasMore(newReviews.length === 10);
    }
  }, [data, page]);

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
    if (!selectedReview) return;

    const currentIndex = reviews.findIndex(r => r.id === selectedReview.id);
    if (currentIndex === -1) return;

    const element = listItemsRef.current[selectedReview.id];
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
      await deletePassage(selectedReview.id)
    } else {
      await putReviewStatus({
        pid: selectedReview.id,
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
        setReviews(prev => prev.filter(review => review.id !== selectedReview.id));
        resolve(null);
      });
    });

    // 5. 等待一帧以确保状态更新完成
    await new Promise(resolve => requestAnimationFrame(resolve));

    // 6. 重置位置
    gsap.set(followingElements, { clearProps: "y" });

    toaster.push(
      <Message type="success">
        {isDelete ? '已删除' : (isApproved ? '已批准' : '已拒绝')} {selectedReview.title}
      </Message>
    );
  };

  return (
    <div>
      <List hover>
        {reviews.map((review, index) => (
          <List.Item
            key={review.id}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedReview(review);
              setOpen(true);
            }}
          >
            <div
              ref={(el) => {
                if (index === reviews.length - 1) {
                  lastElementRef.current = el;
                }
                listItemsRef.current[review.id] = el;
              }}
            >
              <Panel style={{ padding: '0px' }} >
                <Stack spacing={20}>
                  <div style={{ position: 'relative', width: 200, height: 200 }}>
                    {!imageLoaded[review.id] && (
                      <Placeholder.Graph active style={{ height: 200, width: 200, borderRadius: '8px' }} />
                    )}
                    <img
                      src={review.image}
                      alt={review.title}
                      style={{
                        height: 200,
                        width: 200,
                        borderRadius: '8px',
                        objectFit: 'cover',
                        display: imageLoaded[review.id] ? 'block' : 'none'
                      }}
                      onLoad={() => setImageLoaded(prev => ({ ...prev, [review.id]: true }))}
                    />
                  </div>
                  <Stack direction="column" spacing={10} style={{ flex: 1 }}>
                    {!imageLoaded[review.id] ? (
                      <>
                        <Placeholder.Paragraph rows={3} active />
                      </>
                    ) : (
                      <>
                        <h4>{review.title}</h4>
                        <p>作者：{review.author}</p>
                        <p>标签：{review.description}</p>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Panel>
            </div>
          </List.Item>
        ))}
      </List>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Loader content="加载中..." />
        </div>
      )}

      {isError && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          {error instanceof Error ? error.message : '加载失败'}
          <Button appearance="link" onClick={resetData}>
            重试
          </Button>
        </div>
      )}

      {!hasMore && reviews.length > 0 && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Button endIcon={<PageEnd />} onClick={resetData}> 下一批</Button>
        </div>
      )}

      <Modal size="lg" open={open} onClose={() => setOpen(false)}>
        <Modal.Header>
          <Modal.Title>{selectedReview?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack direction="column" spacing={20}>
            <div style={{ position: 'relative', width: '100%', maxHeight: 500 }}>
              <Carousel
                autoplay={false}
                activeIndex={activeIndex}
                onSelect={index => setActiveIndex(index)}
                style={{ borderRadius: '8px', overflow: 'hidden' }}
              >
                {selectedReview?.video && (
                  <div style={{ width: '100%', height: 500, background: '#000' }}>
                    <ReactPlayer
                      url={selectedReview.video}
                      width="100%"
                      height="100%"
                      controls
                      playing={activeIndex === 0}
                    />
                  </div>
                )}
                {selectedReview?.images.map((image, index) => (
                  <div key={index} style={{ height: 500 }}>
                    {!imageLoaded[selectedReview.id] && (
                      <Placeholder.Graph active style={{ width: '100%', height: 500 }} />
                    )}
                    <img
                      src={image}
                      alt={`${selectedReview.title} - ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        background: '#f5f5f5',
                        display: imageLoaded[selectedReview.id] ? 'block' : 'none'
                      }}
                      onLoad={() => selectedReview && setImageLoaded(prev => ({ ...prev, [selectedReview.id]: true }))}
                    />
                  </div>
                ))}
              </Carousel>
            </div>
            {selectedReview && !imageLoaded[selectedReview.id] ? (
              <Placeholder.Paragraph rows={4} active style={{ width: '100%' }} />
            ) : (
              <Stack direction="column" spacing={16}>
                <div>
                  <h6 style={{ marginBottom: '8px' }}>作者</h6>
                  <p>{selectedReview?.author}</p>
                </div>
                <div>
                  <h6 style={{ marginBottom: '8px' }}>标签</h6>
                  <p>{selectedReview?.description}</p>
                </div>
                <div>
                  <h6 style={{ marginBottom: '8px' }}>内容</h6>
                  <p style={{ whiteSpace: 'pre-wrap' }}>{selectedReview?.content}</p>
                </div>
              </Stack>
            )}
          </Stack>
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
    </div>
  );
};

export default ReviewList;