import { useState, useRef, useCallback, useEffect } from 'react';
import { List, Panel, Modal, Button, Stack, Message, useToaster, Loader, Placeholder } from 'rsuite';
import { PageEnd } from '@rsuite/icons'
import gsap from 'gsap';
import { getPendingList } from '@/request/auth';

interface Review {
  id: number;
  title: string;
  author: string;
  image: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
}

const ReviewList = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [open, setOpen] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useRef<HTMLDivElement | null>(null);
  const listItemsRef = useRef<{[key: number]: HTMLDivElement | null}>({});
  const prevReviewsRef = useRef<Review[]>([]);
  const toaster = useToaster();
  const [imageLoaded, setImageLoaded] = useState<{[key: number]: boolean}>({});

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
  const resetData = useCallback(async () => {
    setLoading(true);
    setError(null);
    setHasMore(true);
    setReviews([]);
    setImageLoaded({});
    
    try {
      // 模拟API请求
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newReviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
        id: Math.random()*1000000,
        title: `作品标题 ${i}`,
        author: `作者 ${i}`,
        image: `https://picsum.photos/200/200?random=${Math.random()}`,
        description: `这是作品 ${i} 的详细内容描述。这里可以包含更多关于作品的信息，例如创作背景、创作理念等。`,
        status: 'pending',
      }));

      setReviews(newReviews);
      setHasMore(true);
    } catch (err) {
      setError('加载数据失败，请稍后重试');
      toaster.push(<Message type="error">加载失败</Message>);
    } finally {
      setLoading(false);
    }
  }, [toaster]);

  // 模拟获取数据
  const fetchReviews = useCallback(async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setError(null);

    try {
      // 模拟API请求
      getPendingList(1,10)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const newReviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
        id: Math.random()*1000000,
        title: `作品标题 ${reviews.length + i}`,
        author: `作者 ${reviews.length + i}`,
        image: `https://picsum.photos/200/200?random=${reviews.length + i}`,
        description: `这是作品 ${reviews.length + i} 的详细内容描述。这里可以包含更多关于作品的信息，例如创作背景、创作理念等。`,
        status: 'pending',
      }));

      setReviews((prev) => [...prev, ...newReviews]);
      setHasMore(reviews.length < 20); // 模拟数据上限
    } catch (err) {
      setError('加载数据失败，请稍后重试');
      toaster.push(<Message type="error">加载失败</Message>);
    } finally {
      setLoading(false);
    }
  }, [reviews.length, loading, hasMore, toaster]);

  // 初始加载
  useEffect(() => {
    fetchReviews();
  }, []);

  // 设置 Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchReviews();
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
  }, [fetchReviews, hasMore, loading]);

  // 更新观察的元素
  useEffect(() => {
    if (lastElementRef.current && observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current.observe(lastElementRef.current);
    }
  }, [reviews]);

  // 处理审核操作
  const handleReview = async (approved: boolean) => {
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
        {approved ? '已批准' : '已拒绝'} {selectedReview.title}
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
              <Panel style={{padding:'0px'}} >
                <Stack spacing={20}>
                  <div style={{ position: 'relative', width: 200, height: 200 }}>
                    {!imageLoaded[review.id] && (
                      <Placeholder.Graph active style={{ height: 200, width: 200, borderRadius:'8px' }} />
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
                        <p>状态：{review.status}</p>
                      </>
                    )}
                  </Stack>
                </Stack>
              </Panel>
            </div>
          </List.Item>
        ))}
      </List>

      {loading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Loader content="加载中..." />
        </div>
      )}

      {error && (
        <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
          {error}
          <Button appearance="link" onClick={fetchReviews}>
            重试
          </Button>
        </div>
      )}

      {!hasMore && reviews.length > 0 && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
    <Button endIcon={<PageEnd />} onClick={resetData}> 下一批</Button>
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)}>
        <Modal.Header>
          <Modal.Title>{selectedReview?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack direction="column" spacing={20}>
            <div style={{ position: 'relative', width: '100%', maxHeight: 400 }}>
              {selectedReview && !imageLoaded[selectedReview.id] && (
                <Placeholder.Graph active style={{ width: '100%', height: 400 }} />
              )}
              <img
                src={selectedReview?.image}
                alt={selectedReview?.title}
                style={{
                  width: '100%',
                  maxHeight: 400,
                  objectFit: 'cover',
                  display: selectedReview && imageLoaded[selectedReview.id] ? 'block' : 'none'
                }}
                onLoad={() => selectedReview && setImageLoaded(prev => ({ ...prev, [selectedReview.id]: true }))}
              />
            </div>
            {selectedReview && !imageLoaded[selectedReview.id] ? (
              <Placeholder.Paragraph rows={4} active style={{width:'100px', height:'20px'}} />
            ) : (
              <>
                <div>
                  <h6>作者</h6>
                  <p>{selectedReview?.author}</p>
                </div>
                <div>
                  <h6>描述</h6>
                  <p>{selectedReview?.description}</p>
                </div>
              </>
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
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ReviewList;