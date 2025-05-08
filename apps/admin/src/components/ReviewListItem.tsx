import { Review } from "@/types/review";
import { List, Panel, Stack, Placeholder } from "rsuite";
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
          <Stack spacing={20}>
            <div className="review-item-image-container">
              {!imageLoaded[review.id] && (
                <Placeholder.Graph active style={{ height: 200, width: 200, borderRadius: '8px' }} />
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
            <Stack direction="column" spacing={10} className="review-item-content">
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
  );
};

export default ReviewListItem;