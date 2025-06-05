import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, Card, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../slices/productSlice';
import { fetchCategories } from '../slices/categorySlice';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { addToWishlist, removeFromWishlist } from '../slices/wishlistSlice';

const HomePage = () => {
  const dispatch = useDispatch();
  
  const { loading, error, products } = useSelector((state) => state.product);
  const { categories, loading: categoryLoading } = useSelector((state) => state.category);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  
  useEffect(() => {
    dispatch(fetchProducts({ featured: true }));
    dispatch(fetchCategories());
  }, [dispatch]);
  
  // Toggle wishlist
  const toggleWishlist = (productId) => {
    const isInWishlist = wishlistItems.includes(productId);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(productId));
    } else {
      dispatch(addToWishlist(productId));
    }
  };
  
  return (
    <div className="homepage">
      {/* Hero Section */}
      <div className="hero-section text-center mb-5 py-5 bg-light">
        <h1>BabyBon</h1>
        <p className="lead">
          Đồ chơi giáo dục chất lượng cao cho trẻ em
        </p>
        <Link to="/products">
          <Button variant="primary" size="lg" className="mt-3">
            Mua sắm ngay
          </Button>
        </Link>
      </div>
      
      {/* Featured Products Section */}
      <Container>
        <h2 className="text-center mb-4">Sản phẩm nổi bật</h2>
        
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Row>
            {products.slice(0, 8).map((product) => (
              <Col key={product.id} sm={6} md={3} className="mb-4">
                <ProductCard
                  product={product}
                  isFavorite={wishlistItems.includes(product.id)}
                  onToggleFavorite={toggleWishlist}
                />
              </Col>
            ))}
          </Row>
        )}
        
        <div className="text-center mt-4 mb-5">
          <Link to="/products">
            <Button variant="outline-primary">Xem tất cả sản phẩm</Button>
          </Link>
        </div>
        
        {/* Categories Section */}
        <h2 className="text-center mb-4">Danh mục sản phẩm</h2>
        
        {categoryLoading ? (
          <Loader />
        ) : (
          <Row className="justify-content-center">
            {categories && categories.length > 0 ? categories.slice(0, 4).map((category) => (
              <Col key={category.id} sm={6} md={3} className="mb-4">
                <CategoryCard category={category} />
              </Col>
            )) : (
              <Message>Không có danh mục sản phẩm nào</Message>
            )}
          </Row>
        )}
        
        {/* Features Section */}
        <div className="features-section py-5">
          <h2 className="text-center mb-4">Lý do chọn BabyBon</h2>
          <Row>
            <Col md={4} className="mb-4 text-center">
              <div className="feature-icon mb-3">🧸</div>
              <h4>Chất lượng cao</h4>
              <p>Sản phẩm được làm từ vật liệu an toàn, thân thiện với trẻ em</p>
            </Col>
            <Col md={4} className="mb-4 text-center">
              <div className="feature-icon mb-3">🧠</div>
              <h4>Phát triển trí tuệ</h4>
              <p>Đồ chơi giáo dục giúp trẻ phát triển kỹ năng và tư duy sáng tạo</p>
            </Col>
            <Col md={4} className="mb-4 text-center">
              <div className="feature-icon mb-3">💝</div>
              <h4>Thiết kế đặc biệt</h4>
              <p>Sản phẩm được thiết kế đặc biệt theo nhu cầu và sở thích của trẻ</p>
            </Col>
          </Row>
        </div>
        
        {/* Testimonials Section */}
        <div className="testimonials-section py-5">
          <h2 className="text-center mb-4">Khách hàng nói gì về BabyBon</h2>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 testimonial-card">
                <Card.Body>
                  <p className="testimonial-quote">
                    "Sản phẩm rất chất lượng, con tôi rất thích và chơi mỗi ngày. Đây là món quà tốt nhất cho bé!"
                  </p>
                  <Card.Title className="testimonial-name">Chị Hương</Card.Title>
                  <Card.Subtitle className="text-muted">Mẹ bé Minh, 2 tuổi</Card.Subtitle>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 testimonial-card">
                <Card.Body>
                  <p className="testimonial-quote">
                    "BabyBon đã giúp con tôi phát triển kỹ năng vận động tinh rất nhanh. Tôi rất hài lòng!"
                  </p>
                  <Card.Title className="testimonial-name">Anh Tuấn</Card.Title>
                  <Card.Subtitle className="text-muted">Bố bé Linh, 3 tuổi</Card.Subtitle>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 testimonial-card">
                <Card.Body>
                  <p className="testimonial-quote">
                    "Dịch vụ khách hàng tuyệt vời, giao hàng nhanh. Sản phẩm đúng như mô tả và rất bền."
                  </p>
                  <Card.Title className="testimonial-name">Chị Ngọc</Card.Title>
                  <Card.Subtitle className="text-muted">Mẹ bé An, 18 tháng</Card.Subtitle>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </div>
  );
};

export default HomePage; 