import { Review } from "@/types/review";
import { List, Panel, Placeholder, Tag } from "rsuite";
import { useState, useEffect } from "react";
import "../styles/ReviewListItem.css";

export interface ReviewListItemProps {
  review: Review;
  index: number;
  isLastItem: boolean;
  imageLoaded: { [key: number]: boolean };
  setImageLoaded: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>;
  lastElementRef: React.RefObject<HTMLDivElement | null>;
  onSelectReview: (id: number) => void;
}

const ReviewListItem = ({
  review,
  isLastItem,
  imageLoaded,
  setImageLoaded,
  lastElementRef,
  onSelectReview
}: ReviewListItemProps) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // 处理标签显示逻辑，最多显示3个，多余用...表示
  const displayTags = review.description?.length > 0 
    ? review.description.slice(0, 3) 
    : [];
  
  const hasMoreTags = review.description?.length > 3;

  // 预加载图片
  useEffect(() => {
    if (review.coverImage) {
      const img = new Image();
      img.src = review.coverImage;
      img.onload = () => {
        setIsImageLoading(false);
        setImageLoaded(prev => ({ ...prev, [review.id]: true }));
      };
      img.onerror = () => {
        setIsImageLoading(false);
        setImageError(true);
      };
    }
  }, [review.coverImage, review.id, setImageLoaded]);
  
  return (
    <List.Item
      className="review-list-item"
      onClick={() => onSelectReview(review.id)}
      style={{
        borderBottom: isLastItem ? 'none' : '1px solid var(--rs-border-secondary)',
        transition: 'background-color 0.2s ease',
        cursor: 'pointer',
        padding: '12px 0',
        margin: '0 16px'
      }}
    >
      <div
        ref={(el) => {
          if (isLastItem && el) {
            lastElementRef.current = el;
          }
        }}
      >
        <Panel 
          className="review-item-panel"
          style={{
            backgroundColor: 'transparent',
            transition: 'background-color 0.2s ease',
            borderRadius: '8px',
            padding: '12px'
          }}
        >
          <div className="review-item-title">
            {!imageLoaded[review.id] ? (
              <Placeholder.Paragraph rows={1} active />
            ) : (
              <h4 title={review.title}>{review.title}</h4>
            )}
          </div>
          <div className="review-item-content-wrapper">
            <div className="review-item-info">
              {!imageLoaded[review.id] ? (
                <Placeholder.Paragraph rows={3} active />
              ) : (
                <>
                  <div className="review-item-author">
                    <p>作者：{review.author}</p>
                  </div>
                  <div className="review-item-tags">
                    {displayTags.map((tag, index) => (
                      <Tag key={index} color="blue" className="review-tag">{tag}</Tag>
                    ))}
                    {hasMoreTags && <Tag color="blue" className="review-tag">...</Tag>}
                  </div>
                </>
              )}
            </div>
            <div className="review-item-image-container">
              {isImageLoading && (
                <Placeholder.Graph active style={{ height: 120, width: 120, borderRadius: '8px' }} />
              )}
              {!isImageLoading && !imageError && (
                <img
                  src={review.coverImage}
                  alt={review.title}
                  className="review-item-image"
                  loading="lazy"
                  decoding="async"
                  style={{
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                />
              )}
              {!isImageLoading && imageError && (
                <div className="review-item-image-error">
                  图片加载失败
                </div>
              )}
            </div>
          </div>
        </Panel>
      </div>
    </List.Item>
  );
};

export default ReviewListItem;