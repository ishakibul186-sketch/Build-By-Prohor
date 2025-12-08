import React, { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import { motion } from 'framer-motion';

interface ImageCropModalProps {
  imgSrc: string;
  onSave: (croppedImageBase64: string) => void;
  onClose: () => void;
}

// Helper to center the crop
function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({ imgSrc, onSave, onClose }) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const aspect = 1;

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }

  const handleSaveCrop = () => {
    if (!completedCrop || !imgRef.current || !previewCanvasRef.current) {
      console.error('Crop, image, or canvas not available.');
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;
    
    // Ensure crop dimensions are valid
    if (crop.width === 0 || crop.height === 0) {
        console.error('Invalid crop dimensions.');
        return;
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    const pixelRatio = window.devicePixelRatio || 1;
    
    canvas.width = Math.floor(crop.width * scaleX);
    canvas.height = Math.floor(crop.height * scaleY);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('No 2d context');
    }

    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY,
    );
    
    const base64Image = canvas.toDataURL('image/jpeg');
    onSave(base64Image);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-dark-text mb-4">Crop Your Image</h2>
        <div className="flex justify-center bg-gray-100 p-4 rounded-md">
            <ReactCrop
                crop={crop}
                onChange={(_, percentCrop) => setCrop(percentCrop)}
                onComplete={(c) => setCompletedCrop(c)}
                aspect={aspect}
                circularCrop
            >
                <img ref={imgRef} src={imgSrc} onLoad={onImageLoad} alt="Crop preview" style={{ maxHeight: '60vh' }} />
            </ReactCrop>
        </div>
        {/* Hidden canvas for processing */}
        <canvas ref={previewCanvasRef} style={{ display: 'none' }} />

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-md text-dark-text hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSaveCrop} className="px-4 py-2 rounded-md text-white bg-primary hover:bg-primary-dark transition-colors">
            Save
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImageCropModal;
