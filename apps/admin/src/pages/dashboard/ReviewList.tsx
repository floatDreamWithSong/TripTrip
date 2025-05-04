import { useState, useRef, useCallback } from 'react';
import { List, Panel, Modal, Button, Stack, Message, useToaster } from 'rsuite';

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
  const [hasMore, setHasMore] = useState(true);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toaster = useToaster();

  // 模拟获取数据
  const fetchReviews = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    // 模拟API请求
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const newReviews: Review[] = Array.from({ length: 10 }, (_, i) => ({
      id: reviews.length + i,
      title: `作品标题 ${reviews.length + i}`,
      author: `作者 ${reviews.length + i}`,
      image: `https://picsum.photos/200/200?random=${reviews.length + i}`,
      description: `这是作品 ${reviews.length + i} 的详细内容描述。这里可以包含更多关于作品的信息，例如创作背景、创作理念等。`,
      status: 'pending',
    }));

    setReviews((prev) => [...prev, ...newReviews]);
    setHasMore(reviews.length < 50); // 模拟数据上限
    setLoading(false);
  }, [reviews.length, loading, hasMore]);

  // 处理滚动加载
  const handleScroll = useCallback(() => {
    if (!containerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      fetchReviews();
    }
  }, [fetchReviews]);

  // 处理审核操作
  const handleReview = (approved: boolean) => {
    if (!selectedReview) return;
    const status = approved ? 'approved' : 'rejected';
    setReviews((prev) =>
      prev.map((review) =>
        review.id === selectedReview.id ? { ...review, status } : review
      )
    );
    setOpen(false);
    toaster.push(
      <Message type="success">
        {approved ? '已批准' : '已拒绝'} {selectedReview.title}
      </Message>
    );
  };

  return (
    <div
      ref={containerRef}
      style={{ height: '100%', overflow: 'auto', padding: '20px' }}
      onScroll={handleScroll}
    >
      <List hover>
        {reviews.map((review) => (
          <List.Item
            key={review.id}
            style={{ cursor: 'pointer' }}
            onClick={() => {
              setSelectedReview(review);
              setOpen(true);
            }}
          >
            <Panel bordered>
              <Stack spacing={20}>
                <img
                  src={review.image}
                  alt={review.title}
                  style={{ width: 200, height: 200, objectFit: 'cover' }}
                />
                <Stack direction="column" spacing={10} style={{ flex: 1 }}>
                  <h4>{review.title}</h4>
                  <p>作者：{review.author}</p>
                  <p>状态：{review.status}</p>
                </Stack>
              </Stack>
            </Panel>
          </List.Item>
        ))}
        {loading && <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>}
      </List>

      <Modal open={open} onClose={() => setOpen(false)}>
        <Modal.Header>
          <Modal.Title>{selectedReview?.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Stack direction="column" spacing={20}>
            <img
              src={selectedReview?.image}
              alt={selectedReview?.title}
              style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
            />
            <div>
              <h6>作者</h6>
              <p>{selectedReview?.author}</p>
            </div>
            <div>
              <h6>描述</h6>
              <p>{selectedReview?.description}</p>
            </div>
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