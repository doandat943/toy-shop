import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, Card, Container } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../slices/productSlice';
import { fetchCategories } from '../slices/categorySlice';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import CarouselComponent from '../components/CarouselComponent';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { addToWishlist, removeFromWishlist } from '../slices/wishlistSlice';


const HomePage = () => {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(false);
  
  const { loading, error, products } = useSelector((state) => state.product);
  const { categories, loading: categoryLoading } = useSelector((state) => state.category);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  
  useEffect(() => {
    dispatch(fetchProducts({ featured: true }));
    dispatch(fetchCategories());
    
    // Animation trigger
    setTimeout(() => {
      setIsVisible(true);
    }, 300);
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
      <div className="hero-section">
        <h1 style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.8s ease' }}>BabyBon</h1>
        <p className="lead" style={{ opacity: isVisible ? 1 : 0, transition: 'opacity 0.8s ease 0.3s' }}>
          Đồ chơi giáo dục chất lượng cao cho trẻ em
        </p>
        <Link to="/products">
          <Button 
            variant="primary" 
            size="lg" 
            className={`mt-3 ${isVisible ? 'btn-glow' : ''}`}
            style={{ 
              opacity: isVisible ? 1 : 0, 
              transform: isVisible ? 'translateY(0)' : 'translateY(20px)', 
              transition: 'opacity 0.8s ease 0.6s, transform 0.8s ease 0.6s' 
            }}
          >
            Mua sắm ngay
          </Button>
        </Link>
      </div>
      
      {/* Carousel Section */}
      <Container>
        <CarouselComponent />
        
        {/* Categories Section */}
        <h2 className="section-title text-center mb-5">Danh mục sản phẩm</h2>
        
        {categoryLoading ? (
          <Loader />
        ) : (
          <Row className="justify-content-center">
            {categories && categories.length > 0 ? categories.slice(0, 4).map((category, index) => (
              <Col key={category.id} sm={6} md={3} className="mb-4">
                <div className={`fade-up delay-${index % 3 + 1}`}>
                  <CategoryCard category={category} />
                </div>
              </Col>
            )) : (
              <Message>Không có danh mục sản phẩm nào</Message>
            )}
          </Row>
        )}
        
        {/* Featured Products Section */}
        <h2 className="section-title text-center mb-5">Sản phẩm nổi bật</h2>
        
        {loading ? (
          <Loader />
        ) : error ? (
          <Message variant="danger">{error}</Message>
        ) : (
          <Row>
            {products.slice(0, 8).map((product, index) => (
              <Col key={product.id} sm={6} md={3} className="mb-4">
                <div className={`fade-up delay-${index % 3 + 1}`}>
                <ProductCard
                  product={product}
                  isFavorite={wishlistItems.includes(product.id)}
                  onToggleFavorite={toggleWishlist}
                />
                </div>
              </Col>
            ))}
          </Row>
        )}
        
        <div className="text-center mt-4 mb-5 fade-up">
          <Link to="/products">
            <Button className="custom-button-warm">Xem tất cả sản phẩm</Button>
          </Link>
        </div>
        
        {/* Features Section */}
        <div className="features-section py-5">
          <h2 className="section-title text-center mb-5">Lý do chọn BabyBon</h2>
          <Row>
            <Col md={4} className="mb-4 text-center fade-up delay-1">
              <div className="feature-icon mb-3">🧸</div>
              <h4 className="feature-title">Chất lượng cao</h4>
              <p>Sản phẩm được làm từ vật liệu an toàn, thân thiện với trẻ em và đạt tiêu chuẩn quốc tế</p>
            </Col>
            <Col md={4} className="mb-4 text-center fade-up delay-2">
              <div className="feature-icon mb-3">🧠</div>
              <h4 className="feature-title">Phát triển trí tuệ</h4>
              <p>Đồ chơi giáo dục giúp trẻ phát triển kỹ năng và tư duy sáng tạo từ sớm</p>
            </Col>
            <Col md={4} className="mb-4 text-center fade-up delay-3">
              <div className="feature-icon mb-3">💝</div>
              <h4 className="feature-title">Thiết kế đặc biệt</h4>
              <p>Sản phẩm được thiết kế đặc biệt theo nhu cầu và sở thích của trẻ em hiện đại</p>
            </Col>
          </Row>
        </div>
        
        {/* Testimonials Section */}
        <div className="testimonials-section py-5">
          <h2 className="section-title text-center mb-5">Khách hàng nói gì về BabyBon</h2>
          <Row>
            <Col md={4} className="mb-4 fade-up delay-1">
              <Card className="testimonial-card h-100">
                <Card.Body>
                  <p className="testimonial-quote">
                    "Sản phẩm rất chất lượng, con tôi rất thích và chơi mỗi ngày. Đây là món quà tốt nhất cho bé!"
                  </p>
                  <Card.Title className="testimonial-name">Chị Hương</Card.Title>
                  <Card.Subtitle className="text-muted">Mẹ bé Minh, 2 tuổi</Card.Subtitle>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4 fade-up delay-2">
              <Card className="testimonial-card h-100">
                <Card.Body>
                  <p className="testimonial-quote">
                    "BabyBon đã giúp con tôi phát triển kỹ năng vận động tinh rất nhanh. Tôi rất hài lòng!"
                  </p>
                  <Card.Title className="testimonial-name">Anh Tuấn</Card.Title>
                  <Card.Subtitle className="text-muted">Bố bé Linh, 3 tuổi</Card.Subtitle>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4 fade-up delay-3">
              <Card className="testimonial-card h-100">
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

        {/* CTA Section */}
        <div className="cta-section py-5 my-5 text-center fade-up">
          <h2 className="mb-4">Sẵn sàng khám phá những món đồ chơi tuyệt vời?</h2>
          <Link to="/products">
            <Button variant="primary" size="lg" className="btn-glow">Mua sắm ngay</Button>
          </Link>
        </div>
      </Container>
    </div>
  );
};

export default HomePage; 