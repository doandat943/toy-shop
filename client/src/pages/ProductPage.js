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
import { formatPrice } from '../utils/formatPrice';
import { FaHeart, FaRegHeart, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';

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
                <Image src={product.thumbnail} alt={product.name} fluid className="main-product-image" />
                {product.onSale && (
                  <div className="sale-badge-large">SALE</div>
                )}
              </div>
              {product.images && Array.isArray(product.images) && product.images.length > 0 && (
                <Row className="mt-3">
                  {product.images.slice(0, 4).map((image, index) => (
                    <Col key={index} xs={3} className="product-thumb-col">
                      <Image src={image} alt={`${product.name} ${index + 1}`} fluid className="product-thumb" />
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
                    <Row>
                      <Col>Số lượng</Col>
                      <Col>
                        <Form.Control
                          as="select"
                          value={qty}
                          onChange={(e) => setQty(Number(e.target.value))}
                        >
                          {[...Array(Math.min(product.stock, 10)).keys()].map(
                            (x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            )
                          )}
                        </Form.Control>
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
                
                <ListGroup.Item>
                  <Button
                    onClick={addToCartHandler}
                    className="btn-block"
                    type="button"
                    disabled={product.stock === 0}
                  >
                    <FaShoppingCart className="me-2" /> Thêm vào giỏ
                  </Button>
                </ListGroup.Item>

                <ListGroup.Item>
                  <Button
                    onClick={toggleWishlistHandler}
                    className="btn-block"
                    variant={isInWishlist ? "danger" : "outline-danger"}
                    type="button"
                  >
                    {isInWishlist ? (
                      <>
                        <FaHeart className="me-2" /> Đã thêm vào yêu thích
                      </>
                    ) : (
                      <>
                        <FaRegHeart className="me-2" /> Thêm vào yêu thích
                      </>
                    )}
                  </Button>
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
    </>
  );
};

export default ProductPage; 