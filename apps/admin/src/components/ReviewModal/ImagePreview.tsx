import { IconButton } from 'rsuite';
import CloseIcon from '@rsuite/icons/Close';

interface ImagePreviewProps {
  imageUrl: string | null;
  visible: boolean;
  onClose: () => void;
}

const ImagePreview = ({ imageUrl, visible, onClose }: ImagePreviewProps) => {
  if (!imageUrl) return null;

  return (
    <div 
      className="preview-overlay"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none'
      }}
      onClick={onClose}
    >
      <IconButton 
        icon={<CloseIcon />}
        appearance="subtle"
        circle
        size="lg"
        className="preview-close-button"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.8)'
        }}
        onClick={onClose}
      />
      <img 
        src={imageUrl} 
        alt="Preview" 
        className="preview-image"
        style={{
          transform: visible ? 'scale(1)' : 'scale(0.9)'
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default ImagePreview; 