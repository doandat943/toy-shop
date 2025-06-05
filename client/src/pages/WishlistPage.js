import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Button, Card, Container } from 'react-bootstrap';
import { FaTrash, FaShoppingCart, FaHeartBroken } from 'react-icons/fa';
import Message from '../components/Message';
import Loader from '../components/Loader';
import { fetchProducts } from '../slices/productSlice'; // To get product details
import { removeFromWishlist } from '../slices/wishlistSlice';
import { addToCart } from '../slices/cartSlice';
import ImageWithFallback from '../components/ImageWithFallback';
import { formatPrice } from '../utils/formatPrice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlistItems: wishlistedProductIds } = useSelector((state) => state.wishlist);
  const { products, loading: productsLoading, error: productsError } = useSelector((state) => state.product);

  useEffect(() => {
    const hasWishlistItems = wishlistedProductIds.length > 0;
    if (!hasWishlistItems) {
      return; // No need to fetch if wishlist is empty
    }

    // Check if all wishlisted items' details are present in the current products state
    const allWishlistedItemsDetailsFound = wishlistedProductIds.every(wishlistId =>
      products.some(p => String(p.id) === String(wishlistId))
    );

    if (!allWishlistedItemsDetailsFound && !productsLoading) {
      // If some details are missing and we are not currently loading products,
      // dispatch fetchProducts. This is a general fetch (e.g., page 1)
      // and may not get the specific items if they are not on that page.
      // This is a best-effort approach with the current API capabilities.
      dispatch(fetchProducts({}));
    }
  }, [dispatch, products, wishlistedProductIds, productsLoading]);

  // Memoize the string version of wishlistedProductIds for stable filtering
  const stringWishlistedProductIds = useMemo(() => wishlistedProductIds.map(String), [wishlistedProductIds]);

  const wishlistedProducts = products.filter(product =>
    stringWishlistedProductIds.includes(String(product.id))
  );

  // Show loader if products are loading AND we haven't found any wishlisted products yet to display.
  // This prevents a flash of the loader if some items are already displayable while others are loading.
  if (productsLoading && wishlistedProducts.length === 0 && wishlistedProductIds.length > 0) {
    return <Loader />;
  }
  if (productsError) return <Message variant="danger">{productsError}</Message>;

  const removeFromWishlistHandler = (id) => {
    dispatch(removeFromWishlist(id));
  };

  const addToCartHandler = (productId) => {
    dispatch(addToCart({ id: productId, qty: 1 })); 
    // Optional: navigate to cart or show a success message
  };

  return (
    <Container className="wishlist-page py-4">
      <h1 className="mb-4 page-title">Danh sách yêu thích</h1>
      {wishlistedProducts.length === 0 ? (
        <Message variant="info">
          Danh sách yêu thích của bạn đang trống. <Link to="/products">Khám phá sản phẩm!</Link>
        </Message>
      ) : (
        <ListGroup variant="flush" className="wishlist-items-list">
          {wishlistedProducts.map((item) => (
            <ListGroup.Item key={item.id} className="wishlist-item py-3 px-0">
              <Row className="align-items-center">
                <Col xs={3} sm={2} className="text-center">
                  <ImageWithFallback 
                    src={item.thumbnail} 
                    alt={item.name} 
                    fluid 
                    rounded 
                    className="wishlist-item-image"
                    fallbackSrc="https://placehold.co/80x80/e5e5e5/a0a0a0?text=No+Image"
                  />
                </Col>
                <Col xs={9} sm={4} md={5}>
                  <Link to={`/product/${item.id}`} className="wishlist-item-name">
                    {item.name}
                  </Link>
                  <div className="wishlist-item-price mt-1">{formatPrice(item.price)}</div>
                </Col>
                <Col xs={12} sm={6} md={5} className="text-sm-end mt-2 mt-sm-0 wishlist-actions">
                  <Button 
                    variant="primary" 
                    size="sm" 
                    className="me-2 add-to-cart-wishlist-btn"
                    onClick={() => addToCartHandler(item.id)}
                    disabled={item.stock === 0}
                  >
                    <FaShoppingCart className="me-1 d-none d-md-inline" /> Thêm vào giỏ
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="remove-from-wishlist-btn"
                    onClick={() => removeFromWishlistHandler(item.id)}
                  >
                    <FaTrash className="me-1 d-none d-md-inline" /> Xóa
                  </Button>
                </Col>
              </Row>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      <style jsx global>{`
        .wishlist-page .page-title {
          color: #333;
          font-weight: 600;
          border-bottom: 2px solid #FF6B6B;
          display: inline-block;
          padding-bottom: 0.25rem;
          margin-bottom: 1.5rem !important;
        }
        .wishlist-items-list .list-group-item.wishlist-item {
          border-bottom: 1px solid #eee; 
        }
        .wishlist-items-list .list-group-item.wishlist-item:last-child {
          border-bottom: none;
        }
        .wishlist-item-image {
          max-height: 80px; 
          object-fit: cover;
          border-radius: 8px; /* Slightly rounded images */
        }
        .wishlist-item-name {
          font-weight: 600;
          color: #333;
          text-decoration: none;
          font-size: 1rem;
        }
        .wishlist-item-name:hover {
          color: #FF6B6B;
        }
        .wishlist-item-price {
          font-weight: 500;
          color: #FF6B6B;
          font-size: 0.95rem;
        }
        .wishlist-actions .btn {
           font-size: 0.85rem;
           padding: 0.3rem 0.6rem;
        }
        .add-to-cart-wishlist-btn {
            /* Primary button styles from App.css or Bootstrap will apply */
        }
        .remove-from-wishlist-btn:hover {
            background-color: #dc3545 !important;
            color: white !important;
        }
        @media (max-width: 575.98px) { /* xs screens */
            .wishlist-actions {
                margin-top: 0.75rem;
                display: flex;
                justify-content: space-between; /* Spread buttons on small screens */
            }
            .wishlist-actions .btn {
                flex-grow: 1; /* Make buttons take equal width */
            }
            .wishlist-actions .btn + .btn {
                margin-left: 0.5rem; /* Add space between buttons */
            }
             .wishlist-item-name {
                font-size: 0.9rem;
            }
        }
      `}</style>
    </Container>
  );
};

export default WishlistPage; 