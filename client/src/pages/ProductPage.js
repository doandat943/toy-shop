import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Image, ListGroup, Card, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { 
  fetchProductDetails, 
  fetchRelatedProducts, 
  createProductReview 
} from '../slices/productSlice';
import { addToCart } from '../slices/cartSlice';
import { addToWishlist, removeFromWishlist } from '../slices/wishlistSlice';
import { fetchProducts } from '../slices/productSlice';
import Rating from '../components/Rating';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import ProductCard from '../components/ProductCard';
import ImageWithFallback from '../components/ImageWithFallback';
import { formatPrice } from '../utils/formatPrice';
import { FaHeart, FaRegHeart, FaShoppingCart, FaArrowLeft, FaPlus, FaMinus } from 'react-icons/fa';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [qty, setQty] = useState(1);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [personalization, setPersonalization] = useState('');
  const [activeTab, setActiveTab] = useState('description');

  const { user } = useSelector((state) => state.user);
  const { loading, error, product, relatedProducts, reviewSuccess, reviewError, products } = useSelector(
    (state) => state.product
  );
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const isInWishlist = wishlistItems.includes(id);

  useEffect(() => {
    dispatch(fetchProductDetails(id));
    dispatch(fetchRelatedProducts(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (reviewSuccess) {
      setRating(0);
      setComment('');
    }
  }, [reviewSuccess]);

  useEffect(() => {
    // Fetch related products when product category is available
    if (product && product.categoryId) {
      dispatch(fetchProducts({ category: product.categoryId, page: 1 }));
    }
  }, [dispatch, product]);

  const addToCartHandler = () => {
    dispatch(addToCart({ id, qty, personalization: personalization || undefined }));
    navigate('/cart');
  };

  const toggleWishlistHandler = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist(id));
    } else {
      dispatch(addToWishlist(id));
    }
  };

  const submitReviewHandler = (e) => {
    e.preventDefault();
    dispatch(
      createProductReview({
        productId: id,
        review: {
          rating,
          comment,
        },
      })
    );
  };

  const handlePersonalizationChange = (option, value) => {
    setPersonalization((prev) => ({
      ...prev,
      [option]: value,
    }));
  };

  const handleQtyChange = (value) => {
    const newQty = Math.max(1, Math.min(Number(value), product.stock || 1));
    setQty(newQty);
  };

  // Filter out current product from related products
  const relatedProductsFiltered = products.filter(p => p.id !== id).slice(0, 4);

  return (
    <>
      <Link className="btn btn-light my-3" to="/products">
        <FaArrowLeft className="me-1" /> Quay lại
      </Link>
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : product ? (
        <>
          <Meta title={product.name} description={product.description} />
          <Row>
            <Col md={5}>
              <div className="product-image-wrapper">
                <ImageWithFallback 
                  src={product.thumbnail} 
                  alt={product.name} 
                  className="main-product-image" 
                  fallbackSrc="https://placehold.co/800x600/e5e5e5/a0a0a0?text=No+Image"
                />
                {product.onSale && (
                  <div className="sale-badge-large">SALE</div>
                )}
              </div>
              {product.images && Array.isArray(product.images) && product.images.length > 0 && (
                <Row className="mt-3">
                  {product.images.slice(0, 4).map((image, index) => (
                    <Col key={index} xs={3} className="product-thumb-col">
                      <ImageWithFallback 
                        src={image} 
                        alt={`${product.name} ${index + 1}`} 
                        className="product-thumb" 
                        fallbackSrc="https://placehold.co/150x150/e5e5e5/a0a0a0?text=No+Image"
                      />
                    </Col>
                  ))}
                </Row>
              )}
            </Col>
            
            <Col md={4}>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <h2>{product.name}</h2>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <Rating
                    value={product.rating}
                    text={`${product.numReviews} đánh giá`}
                  />
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <Row>
                    <Col>Giá:</Col>
                    <Col>
                      <strong>
                        {product.onSale && product.salePrice ? (
                          <>
                            <span className="product-price">{formatPrice(product.salePrice)}</span>
                            <span className="product-price-old ms-2">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="product-price">{formatPrice(product.price)}</span>
                        )}
                      </strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <Row>
                    <Col>Trạng thái:</Col>
                    <Col>
                      {product.stock > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </Col>
                  </Row>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <Row>
                    <Col>Danh mục:</Col>
                    <Col>{product.category?.name}</Col>
                  </Row>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <Row>
                    <Col>Độ tuổi:</Col>
                    <Col>
                      {product.minAge} {product.maxAge ? `- ${product.maxAge}` : '+'} tháng
                    </Col>
                  </Row>
                </ListGroup.Item>
                
                {product.stock > 0 && (
                  <ListGroup.Item>
                    <Row className="align-items-center">
                      <Col md={4} xs={5}>Số lượng</Col>
                      <Col md={8} xs={7}>
                        <div className="input-group quantity-input-group" style={{ maxWidth: '150px' }}>
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="quantity-btn shadow-none" 
                            onClick={() => handleQtyChange(qty - 1)}
                            disabled={qty <= 1}
                          >
                            <FaMinus />
                          </Button>
                          <Form.Control
                            type="number"
                            value={qty}
                            onChange={(e) => handleQtyChange(e.target.value)}
                            onBlur={(e) => { // Ensure qty is valid on blur
                                if (e.target.value === '' || isNaN(Number(e.target.value))) {
                                    setQty(1); // Reset to 1 if input is invalid or empty
                                } else {
                                    handleQtyChange(e.target.value);
                                }
                            }}
                            min="1"
                            max={product.stock || 1} // Set max based on stock
                            className="text-center quantity-input shadow-none"
                            style={{ MozAppearance: 'textfield' }} // Hide spinners for Firefox
                          />
                          <Button 
                            variant="outline-secondary" 
                            size="sm"
                            className="quantity-btn shadow-none"
                            onClick={() => handleQtyChange(qty + 1)}
                            disabled={qty >= (product.stock || 1)}
                          >
                            <FaPlus />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                )}
                
                {product.isPersonalizable && (
                  <ListGroup.Item>
                    <h5>Cá nhân hóa sản phẩm</h5>
                    <Form.Group className="mb-3" key="personalization">
                      <Form.Label>Nhập tên hoặc thông điệp</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Nhập tên hoặc thông điệp"
                        value={personalization}
                        onChange={(e) => setPersonalization(e.target.value)}
                      />
                    </Form.Group>
                  </ListGroup.Item>
                )}
                
                {/* Combined Add to Cart and Wishlist Buttons */}
                <ListGroup.Item className="mt-3 product-actions">
                  <div className="d-flex gap-2">
                    <Button
                      onClick={addToCartHandler}
                      className="flex-grow-1 action-btn add-to-cart-btn"
                      type="button"
                      disabled={product.stock === 0}
                    >
                      <FaShoppingCart className="me-2" /> Thêm vào giỏ
                    </Button>
                    <Button
                      onClick={toggleWishlistHandler}
                      className="flex-grow-1 action-btn wishlist-btn"
                      variant={isInWishlist ? "danger" : "outline-danger"}
                      type="button"
                    >
                      {isInWishlist ? (
                        <FaHeart className="me-2" /> 
                      ) : (
                        <FaRegHeart className="me-2" /> 
                      )}
                      <span className="d-none d-sm-inline">Yêu thích</span> {/* Hide text on very small screens if needed */}
                    </Button>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            
            <Col md={3}>
              <Card>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <h4>Thông tin vận chuyển</h4>
                    <p className="mb-2">
                      <i className="fas fa-truck me-2"></i>
                      Giao hàng toàn quốc
                    </p>
                    <p className="mb-2">
                      <i className="fas fa-clock me-2"></i>
                      Thời gian giao hàng: 2-5 ngày
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-hand-holding-usd me-2"></i>
                      Miễn phí vận chuyển đơn hàng từ 500.000đ
                    </p>
                  </ListGroup.Item>
                  
                  <ListGroup.Item>
                    <h4>Chính sách đổi trả</h4>
                    <p className="mb-2">
                      <i className="fas fa-undo me-2"></i>
                      Đổi trả trong vòng 7 ngày
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-shield-alt me-2"></i>
                      Bảo hành 30 ngày cho lỗi sản xuất
                    </p>
                  </ListGroup.Item>
                  
                  <ListGroup.Item>
                    <h4>Hỗ trợ khách hàng</h4>
                    <p className="mb-2">
                      <i className="fas fa-phone me-2"></i>
                      Hotline: 0989 123 456
                    </p>
                    <p className="mb-0">
                      <i className="fas fa-envelope me-2"></i>
                      Email: hello@babybon.vn
                    </p>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
          
          <Row className="mt-5">
            <Col>
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-3"
              >
                <Tab eventKey="description" title="Mô tả sản phẩm">
                  <div className="product-description">
                    <h3>Mô tả</h3>
                    <div dangerouslySetInnerHTML={{ __html: product.richDescription || product.description }} />
                  </div>
                </Tab>
                
                <Tab eventKey="features" title="Đặc điểm sản phẩm">
                  <div className="product-features">
                    <h3>Đặc điểm sản phẩm</h3>
                    <ListGroup variant="flush">
                      <ListGroup.Item>
                        <Row>
                          <Col md={3}>Kích thước:</Col>
                          <Col md={9}>{product.dimensions || 'Đang cập nhật'}</Col>
                        </Row>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <Row>
                          <Col md={3}>Chất liệu:</Col>
                          <Col md={9}>{product.materials || 'Đang cập nhật'}</Col>
                        </Row>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <Row>
                          <Col md={3}>Độ tuổi:</Col>
                          <Col md={9}>
                            {product.minAge} {product.maxAge ? `- ${product.maxAge}` : '+'} tháng
                          </Col>
                        </Row>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <Row>
                          <Col md={3}>Trọng lượng:</Col>
                          <Col md={9}>{product.weight ? `${product.weight}g` : 'Đang cập nhật'}</Col>
                        </Row>
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <Row>
                          <Col md={3}>SKU:</Col>
                          <Col md={9}>{product.sku || 'Đang cập nhật'}</Col>
                        </Row>
                      </ListGroup.Item>
                    </ListGroup>
                  </div>
                </Tab>
                
                <Tab eventKey="education" title="Giá trị giáo dục">
                  <div className="product-education">
                    <h3>Giá trị giáo dục</h3>
                    <div dangerouslySetInnerHTML={{ __html: product.educationalValue || 'Đang cập nhật thông tin' }} />
                  </div>
                </Tab>
                
                <Tab eventKey="safety" title="Thông tin an toàn">
                  <div className="product-safety">
                    <h3>Thông tin an toàn</h3>
                    <div dangerouslySetInnerHTML={{ __html: product.safetyInfo || 'Đang cập nhật thông tin' }} />
                  </div>
                </Tab>
                
                <Tab eventKey="reviews" title={`Đánh giá (${product.numReviews})`}>
                  <div className="product-reviews">
                    <h3>Đánh giá từ khách hàng</h3>
                    
                    {product.reviews && product.reviews.length === 0 ? (
                      <Message>Chưa có đánh giá nào</Message>
                    ) : (
                      <ListGroup variant="flush">
                        {product.reviews &&
                          product.reviews.map((review) => (
                            <ListGroup.Item key={review.id}>
                              <strong>{review.user?.name || 'Khách hàng'}</strong>
                              <Rating value={review.rating} />
                              <p className="review-date">
                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                              </p>
                              <p>{review.comment}</p>
                            </ListGroup.Item>
                          ))}
                      </ListGroup>
                    )}
                    
                    <h4 className="mt-4">Viết đánh giá</h4>
                    {user ? (
                      <Form onSubmit={submitReviewHandler}>
                        <Form.Group controlId="rating" className="mb-3">
                          <Form.Label>Đánh giá</Form.Label>
                          <Form.Control
                            as="select"
                            value={rating}
                            onChange={(e) => setRating(Number(e.target.value))}
                          >
                            <option value="">Chọn...</option>
                            <option value="1">1 - Rất tệ</option>
                            <option value="2">2 - Tệ</option>
                            <option value="3">3 - Bình thường</option>
                            <option value="4">4 - Tốt</option>
                            <option value="5">5 - Rất tốt</option>
                          </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="comment" className="mb-3">
                          <Form.Label>Nhận xét</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={3}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                          ></Form.Control>
                        </Form.Group>
                        <Button
                          type="submit"
                          variant="primary"
                          disabled={!rating}
                        >
                          Gửi đánh giá
                        </Button>
                      </Form>
                    ) : (
                      <Message>
                        Vui lòng <Link to="/login">đăng nhập</Link> để viết đánh giá
                      </Message>
                    )}
                  </div>
                </Tab>
              </Tabs>
            </Col>
          </Row>
          
          {relatedProductsFiltered.length > 0 && (
            <div className="related-products mt-5">
              <h2>Sản phẩm liên quan</h2>
              <Row>
                {relatedProductsFiltered.map((relatedProduct) => (
                  <Col key={relatedProduct.id} sm={6} md={4} lg={3}>
                    <ProductCard
                      product={relatedProduct}
                      isFavorite={wishlistItems.includes(relatedProduct.id)}
                      onToggleFavorite={() => 
                        wishlistItems.includes(relatedProduct.id)
                          ? dispatch(removeFromWishlist(relatedProduct.id))
                          : dispatch(addToWishlist(relatedProduct.id))
                      }
                    />
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </>
      ) : null}
      <style jsx global>{`
        /* Existing styles */
        .product-image-wrapper {
          position: relative;
          overflow: hidden;
          border-radius: 15px; /* Consistent rounded corners */
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .main-product-image {
          width: 100%;
          height: auto;
          aspect-ratio: 1 / 1; /* Maintain square aspect ratio */
          object-fit: cover;
          border-radius: 15px;
        }
        .product-thumb-col {
          padding: 0 5px; /* Spacing between thumbs */
        }
        .product-thumb {
          width: 100%;
          height: auto;
          aspect-ratio: 1 / 1;
          object-fit: cover;
          cursor: pointer;
          border-radius: 10px; /* Rounded thumbs */
          border: 2px solid transparent;
          transition: border-color 0.2s ease;
        }
        .product-thumb:hover, .product-thumb.active {
          border-color: #FF6B6B; /* Theme color for active/hover thumb */
        }
        .sale-badge-large {
          position: absolute;
          top: 20px;
          left: 20px;
          background-color: #FF6B6B; /* Theme color */
          color: white;
          padding: 8px 15px;
          border-radius: 20px; /* Pill shape */
          font-size: 0.9rem;
          font-weight: bold;
          text-transform: uppercase;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        .product-price {
          font-size: 1.8rem;
          font-weight: bold;
          color: #FF6B6B;
        }
        .product-price-old {
          font-size: 1.2rem;
          text-decoration: line-through;
          color: #999;
        }
        .review-form-card {
          background-color: #f8f9fa; /* Light background for review form */
          border-radius: 15px;
          padding: 2rem;
        }
        .product-tabs .nav-link {
          font-size: 1.1rem;
          font-weight: 500;
          color: #6c757d; /* Bootstrap muted color */
          border-bottom: 3px solid transparent;
          transition: all 0.3s ease;
        }
        .product-tabs .nav-link.active {
          color: #FF6B6B; /* Theme color for active tab */
          border-bottom-color: #FF6B6B;
        }
        .related-products-section h3 {
          margin-bottom: 2rem;
          font-weight: bold;
          text-align: center;
        }

        /* Enhanced Quantity Input Styles */
        .quantity-input-group {
          display: inline-flex; /* Use inline-flex for better wrapping if needed */
          align-items: stretch; /* Stretch items to fill height */
          border: 1px solid #dee2e6; /* Light border for the whole group */
          border-radius: 20px; /* Rounded corners for the group */
          background-color: #fff; /* White background for the group */
          overflow: hidden; /* To ensure rounded corners clip children */
          max-width: 130px; /* Control overall width */
        }

        .quantity-input-group .form-control.quantity-input {
          border: none !important; /* Remove all borders from input */
          text-align: center;
          height: auto; /* Allow height to be determined by content and group */
          line-height: 1.5; 
          padding: 0.375rem 0.25rem; /* Adjust padding */
          flex-grow: 1; /* Allow input to take available space */
          min-width: 40px; /* Minimum width for the number */
          background-color: transparent; /* Transparent background */
          color: #495057; /* Standard text color */
          box-shadow: none !important;
          appearance: textfield; /* Standard property */
          -moz-appearance: textfield; /* Firefox */
        }
        .quantity-input-group .form-control.quantity-input::-webkit-outer-spin-button,
        .quantity-input-group .form-control.quantity-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        
        .quantity-input-group .quantity-btn {
          width: 38px; 
          height: auto; /* Allow height to be determined by content and group */
          border: none !important; /* Remove all borders from buttons */
          color: #6c757d; /* Subtler icon color */
          background-color: transparent; /* Transparent background */
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 0.375rem 0; 
          transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
          cursor: pointer;
          box-shadow: none !important;
        }
        .quantity-input-group .quantity-btn:first-of-type {
          /* Optional: subtle separator for left button */
          /* border-right: 1px solid #e9ecef; */
        }
        .quantity-input-group .quantity-btn:last-of-type {
          /* Optional: subtle separator for right button */
          /* border-left: 1px solid #e9ecef; */
        }
        .quantity-input-group .quantity-btn:hover {
          background-color: #f8f9fa; /* Light hover background */
          color: #FF6B6B; /* Theme color for icon on hover */
        }
        .quantity-input-group .quantity-btn:disabled {
          background-color: transparent; /* Keep transparent when disabled */
          color: #adb5bd; /* Muted color for disabled icon */
          cursor: not-allowed;
        }
        .quantity-input-group .quantity-btn:focus {
          outline: none;
          box-shadow: none; /* Remove focus ring if desired, or style it */
        }

        /* Product Action Buttons Styling */
        .product-actions {
          border-top: 1px solid #eee; /* Optional: add a light separator line above buttons */
          padding-top: 1rem; /* Consistent padding */
        }
        .action-btn {
          padding: 0.65rem 0.75rem; /* Adjust padding for better feel */
          font-size: 0.95rem; /* Slightly adjust font size */
          font-weight: 500;
          border-radius: 8px; /* Consistent rounded corners */
          transition: all 0.2s ease-in-out;
        }
        .add-to-cart-btn {
          /* Using default primary button style from App.css or Bootstrap if not overridden */
        }
        .wishlist-btn {
          /* Styles are handled by variant (danger/outline-danger) */
        }
        .wishlist-btn .fa-heart, .wishlist-btn .fa-reg-heart {
          /* vertical-align: middle; */ /* May not be needed with flex on button */
        }
      `}</style>
    </>
  );
};

export default ProductPage; 