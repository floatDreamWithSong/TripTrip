import { useState } from 'react';
import { Carousel, IconButton, Placeholder } from 'rsuite';
import ReactPlayer from 'react-player';
import ArrowLeftLine from '@rsuite/icons/ArrowLeftLine';
import ArrowRightLine from '@rsuite/icons/ArrowRightLine';

interface MediaCarouselProps {
  video?: string;
  images: string[];
  title: string;
  id: number;
  onImageClick: (imageUrl: string) => void;
}

const MediaCarousel = ({ video, images, title, id, onImageClick }: MediaCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState<{ [key: string]: boolean }>({});
  const [videoLoaded, setVideoLoaded] = useState(false);

  const handlePrev = () => {
    const totalItems = (video ? 1 : 0) + images.length;
    setActiveIndex((activeIndex - 1 + totalItems) % totalItems);
  };

  const handleNext = () => {
    const totalItems = (video ? 1 : 0) + images.length;
    setActiveIndex((activeIndex + 1) % totalItems);
  };

  if (!video && images.length === 0) {
    return <div className="cover-container">暂无图片</div>;
  }

  return (
    <div className="carousel-container">
      <Carousel
        autoplay={false}
        activeIndex={activeIndex}
        onSelect={index => setActiveIndex(index)}
        className="carousel-custom"
      >
        {video && (
          <div className="video-container">
            {!videoLoaded && (
              <div className="video-placeholder">
                <Placeholder.Graph active style={{ width: '90%', height: '80%' }} />
              </div>
            )}
            <ReactPlayer
              url={video}
              width="100%"
              height="100%"
              controls
              playing={activeIndex === 0}
              onReady={() => setVideoLoaded(true)}
              style={{ opacity: videoLoaded ? 1 : 0 }}
            />
          </div>
        )}
        {images.map((image, index) => {
          const imageIndex = video ? index + 1 : index;
          const imageKey = `${id}-${image}`;
          return (
            <div key={imageIndex} className="image-container">
              {!imageLoaded[imageKey] && (
                <div className="image-placeholder">
                  <Placeholder.Graph active style={{ width: '90%', height: '80%' }} />
                </div>
              )}
              <img
                src={image}
                alt={`${title} - ${index + 1}`}
                className="carousel-image"
                style={{
                  opacity: imageLoaded[imageKey] ? 1 : 0
                }}
                onLoad={() => setImageLoaded(prev => ({ ...prev, [imageKey]: true }))}
                onClick={() => onImageClick(image)}
              />
            </div>
          );
        })}
      </Carousel>
      
      {(video || images.length > 1) && (
        <>
          <IconButton 
            icon={<ArrowLeftLine />} 
            circle
            appearance="subtle"
            onClick={handlePrev}
            className="carousel-control carousel-control-prev"
          />
          <IconButton 
            icon={<ArrowRightLine />} 
            circle
            appearance="subtle"
            onClick={handleNext}
            className="carousel-control carousel-control-next"
          />
        </>
      )}
    </div>
  );
};

export default MediaCarousel; 