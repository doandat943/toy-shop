import React, { useState } from 'react';
import { Image } from 'react-bootstrap';

const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackSrc = 'https://placehold.co/400x400/e5e5e5/a0a0a0?text=No+Image', 
  style = {},
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const onError = () => {
    if (!hasError) {
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  // Apply object-fit: cover by default to ensure images fill their container
  const imgStyle = {
    objectFit: 'cover',
    width: '100%',
    height: '100%',
    ...style
  };

  return (
    <Image
      src={imgSrc}
      alt={alt}
      onError={onError}
      style={imgStyle}
      {...props}
    />
  );
};

export default ImageWithFallback; 