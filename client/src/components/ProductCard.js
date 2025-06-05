import React, { useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { addToCart } from '../slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import Rating from './Rating';
import ImageWithFallback from './ImageWithFallback';

const ProductCard = ({ product, isFavorite, onToggleFavorite }) => {
  const dispatch = useDispatch();
  const [isHovered, setIsHovered] = useState(false);

  const addToCartHandler = () => {
    dispatch(addToCart({ id: product.id, qty: 1 }));
  };

  return (
    <Card 
      className="h-100 product-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="product-favorite">
        <Button
          variant="link"
          className={`p-0 ${isFavorite ? 'text-danger' : 'text-secondary'}`}
          onClick={() => onToggleFavorite(product.id)}
        >
          {isFavorite ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
        </Button>
      </div>
      
      <Link to={`/product/${product.id}`} className="product-img-container">
        <ImageWithFallback
          src={product.thumbnail}
          alt={product.name}
          className="product-img card-img-top"
          fallbackSrc="https://placehold.co/400x400/e5e5e5/a0a0a0?text=No+Image"
        />
        
        {/* Overlay with zoom effect */}
        <div 
          className="product-overlay" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 50%)',
            opacity: isHovered ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 2
          }}
        />
      </Link>
      
      {product.onSale && (
        <div className="sale-badge">Sale</div>
      )}
      
      <Card.Body className="d-flex flex-column">
        <Link to={`/product/${product.id}`} className="text-decoration-none">
          <Card.Title as="h5" className="product-title">{product.name}</Card.Title>
        </Link>
        
        <div className="mb-2">
          <Rating value={product.rating} text={`${product.numReviews} đánh giá`} />
        </div>
        
        <div className="d-flex align-items-center mb-2">
          {product.onSale ? (
            <>
              <span className="text-muted text-decoration-line-through me-2">
                {formatPrice(product.price)}
              </span>
              <span className="product-price">
                {formatPrice(product.salePrice)}
              </span>
            </>
          ) : (
            <span className="product-price">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        
        <Button
          onClick={addToCartHandler}
          className={`mt-auto ${isHovered ? 'btn-glow' : ''}`}
          variant={product.stock > 0 ? 'primary' : 'outline-secondary'}
          disabled={product.stock <= 0}
          style={{
            transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
            transition: 'all 0.3s ease',
          }}
        >
          {product.stock > 0 ? (
            <>
              <FaShoppingCart className="me-1" /> Thêm vào giỏ
            </>
          ) : (
            'Hết hàng'
          )}
        </Button>
      </Card.Body>

      {/* Add a subtle glow effect on hover */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 'var(--border-radius)',
          padding: '2px',
          background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'xor',
          maskComposite: 'exclude',
          pointerEvents: 'none',
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />
    </Card>
  );
};

export default ProductCard; 