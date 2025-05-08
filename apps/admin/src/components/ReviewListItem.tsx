import { Review } from "@/types/review";
import { List, Panel, Placeholder, Tag } from "rsuite";
import "../styles/ReviewListItem.css";

export interface ReviewListItemProps {
  review: Review;
  index: number;
  isLastItem: boolean;
  imageLoaded: { [key: number]: boolean };
  setImageLoaded: React.Dispatch<React.SetStateAction<{ [key: number]: boolean }>>;
  lastElementRef: React.RefObject<HTMLDivElement | null>;
  listItemsRef: React.RefObject<{ [key: number]: HTMLDivElement | null }>;
  onSelectReview: (id: number) => void;
}

const ReviewListItem = ({
  review,
  isLastItem,
  imageLoaded,
  setImageLoaded,
  lastElementRef,
  listItemsRef,
  onSelectReview
}: ReviewListItemProps) => {
  // 处理标签显示逻辑，最多显示3个，多余用...表示
  const displayTags = review.description?.length > 0 
    ? review.description.slice(0, 3) 
    : [];
  
  const hasMoreTags = review.description?.length > 3;
  
  return (
    <List.Item
      className="review-list-item"
      onClick={() => onSelectReview(review.id)}
    >
      <div
        ref={(el) => {
          if (isLastItem && el) {
            lastElementRef.current = el;
          }
          listItemsRef.current[review.id] = el;
        }}
      >
        <Panel className="review-item-panel">
          <div className="review-item-title">
          {!imageLoaded[review.id] ? (
                <Placeholder.Paragraph rows={1} active />
              ) : (
                <h4 title={review.title}>{review.title}{review.id}</h4>
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
              {!imageLoaded[review.id] && (
                <Placeholder.Graph active style={{ height: 120, width: 120, borderRadius: '8px' }} />
              )}
              <img
                src={review.coverImage}
                alt={review.title}
                className="review-item-image"
                style={{
                  display: imageLoaded[review.id] ? 'block' : 'none'
                }}
                onLoad={() => setImageLoaded(prev => ({ ...prev, [review.id]: true }))}
              />
            </div>
          </div>
        </Panel>
      </div>
    </List.Item>
  );
};

export default ReviewListItem;