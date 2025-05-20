import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaHeart, FaRegHeart, FaShoppingCart, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { addToCart } from '../slices/cartSlice';
import { formatPrice } from '../utils/formatPrice';
import Rating from './Rating';

const ProductCard = ({ product, isFavorite, onToggleFavorite }) => {
  const dispatch = useDispatch();

  const addToCartHandler = () => {
    dispatch(addToCart({ id: product.id, qty: 1 }));
  };

  return (
    <Card className="h-100 product-card">
      <div className="product-favorite">
        <Button
          variant="link"
          className={`p-0 ${isFavorite ? 'text-danger' : 'text-secondary'}`}
          onClick={() => onToggleFavorite(product.id)}
        >
          {isFavorite ? <FaHeart size={22} /> : <FaRegHeart size={22} />}
        </Button>
      </div>
      
      <Link to={`/product/${product.id}`}>
        <Card.Img
          src={product.thumbnail || '/images/placeholder.jpg'}
          variant="top"
          className="product-img"
          alt={product.name}
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
              <span className="fw-bold text-danger">
                {formatPrice(product.salePrice)}
              </span>
            </>
          ) : (
            <span className="fw-bold">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
        
        <Button
          onClick={addToCartHandler}
          className="mt-auto btn-sm"
          disabled={product.stock <= 0}
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
    </Card>
  );
};

export default ProductCard; 