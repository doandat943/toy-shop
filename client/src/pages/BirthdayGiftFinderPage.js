import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts } from '../slices/productSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import { formatPrice } from '../utils/formatPrice';

const BirthdayGiftFinderPage = () => {
  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.product);
  
  // Form state
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [priceRange, setPriceRange] = useState('');
  const [interests, setInterests] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  
  // Filtered products
  const [filteredProducts, setFilteredProducts] = useState([]);
  
  // Interest options
  const interestOptions = [
    { id: 'motor', label: 'Phát triển vận động' },
    { id: 'cognitive', label: 'Phát triển nhận thức' },
    { id: 'creative', label: 'Sáng tạo nghệ thuật' },
    { id: 'social', label: 'Kỹ năng xã hội' },
    { id: 'language', label: 'Phát triển ngôn ngữ' },
    { id: 'science', label: 'Khoa học tự nhiên' },
    { id: 'music', label: 'Âm nhạc' },
    { id: 'reading', label: 'Đọc và viết' }
  ];
  
  // Age ranges
  const ageRanges = [
    { id: '0-12', label: '0-12 tháng' },
    { id: '12-24', label: '12-24 tháng' },
    { id: '2-3', label: '2-3 tuổi' },
    { id: '4-5', label: '4-5 tuổi' },
    { id: '6-8', label: '6-8 tuổi' },
    { id: '9-12', label: '9-12 tuổi' }
  ];
  
  // Price ranges
  const priceRanges = [
    { id: '0-200000', label: 'Dưới 200.000₫' },
    { id: '200000-500000', label: '200.000₫ - 500.000₫' },
    { id: '500000-1000000', label: '500.000₫ - 1.000.000₫' },
    { id: '1000000+', label: 'Trên 1.000.000₫' }
  ];
  
  useEffect(() => {
    // Load all products on component mount
    dispatch(fetchProducts({}));
  }, [dispatch]);
  
  // Handle interest change
  const handleInterestChange = (e) => {
    const value = e.target.value;
    if (e.target.checked) {
      setInterests([...interests, value]);
    } else {
      setInterests(interests.filter(interest => interest !== value));
    }
  };
  
  // Handle search submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchPerformed(true);
    
    if (!products) return;
    
    let filtered = [...products];
    
    // Filter by age
    if (age) {
      const [minAge, maxAge] = age.split('-');
      if (maxAge) {
        // Age range in years or months
        if (minAge.includes('m')) {
          // Age in months
          const minAgeValue = parseInt(minAge.replace('m', ''));
          const maxAgeValue = parseInt(maxAge.replace('m', ''));
          filtered = filtered.filter(product => 
            (product.minAge >= minAgeValue && product.minAge <= maxAgeValue) ||
            (product.maxAge && product.maxAge >= minAgeValue && product.maxAge <= maxAgeValue)
          );
        } else {
          // Age in years (convert to months for comparison)
          const minAgeValue = parseInt(minAge) * 12;
          const maxAgeValue = parseInt(maxAge) * 12;
          filtered = filtered.filter(product => 
            (product.minAge >= minAgeValue && product.minAge <= maxAgeValue) ||
            (product.maxAge && product.maxAge >= minAgeValue && product.maxAge <= maxAgeValue)
          );
        }
      } else if (minAge.includes('+')) {
        // Age is "X+"
        const minAgeValue = parseInt(minAge.replace('+', ''));
        filtered = filtered.filter(product => product.minAge >= minAgeValue);
      }
    }
    
    // Filter by gender
    if (gender && gender !== 'all') {
      filtered = filtered.filter(product => 
        product.gender === gender || product.gender === 'unisex'
      );
    }
    
    // Filter by price range
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split('-');
      if (maxPrice) {
        filtered = filtered.filter(product => 
          product.price >= parseInt(minPrice) && product.price <= parseInt(maxPrice)
        );
      } else if (priceRange.includes('+')) {
        // Price is "X+"
        const minPriceValue = parseInt(priceRange.replace('+', ''));
        filtered = filtered.filter(product => product.price >= minPriceValue);
      }
    }
    
    // Filter by interests
    if (interests.length > 0) {
      filtered = filtered.filter(product => 
        interests.some(interest => 
          product.tags && product.tags.includes(interest)
        )
      );
    }
    
    // Sort by relevance (matching more criteria = higher score)
    filtered.forEach(product => {
      let score = 0;
      
      // Age match
      if (age) {
        const [minAge, maxAge] = age.split('-');
        if (product.minAge && product.minAge >= parseInt(minAge) && 
            (!maxAge || product.minAge <= parseInt(maxAge))) {
          score += 3;
        }
      }
      
      // Gender match
      if (gender && (product.gender === gender || product.gender === 'unisex')) {
        score += 2;
      }
      
      // Interests match
      if (interests.length > 0 && product.tags) {
        const matchedInterests = interests.filter(interest => 
          product.tags.includes(interest)
        );
        score += matchedInterests.length * 2;
      }
      
      // Birthday relevance
      if (product.tags && (
        product.tags.includes('birthday') ||
        product.tags.includes('gift') ||
        product.tags.includes('special occasion')
      )) {
        score += 5;
      }
      
      product.relevanceScore = score;
    });
    
    // Sort by relevance score (descending)
    filtered.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    setFilteredProducts(filtered);
  };
  
  return (
    <Container className="py-5">
      <Meta title="Tìm quà sinh nhật - BabyBon" />
      
      <Row className="justify-content-center mb-5">
        <Col md={10} lg={8}>
          <div className="text-center mb-4">
            <h1 className="mb-3">Tìm quà sinh nhật</h1>
            <p className="lead">
              Hãy cho chúng tôi biết về bé để BabyBon gợi ý những món quà sinh nhật phù hợp nhất!
            </p>
          </div>
          
          <Card className="shadow-sm">
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Độ tuổi của bé</Form.Label>
                      <Form.Select 
                        value={age} 
                        onChange={(e) => setAge(e.target.value)}
                        required
                      >
                        <option value="">Chọn độ tuổi</option>
                        {ageRanges.map(range => (
                          <option key={range.id} value={range.id}>
                            {range.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Giới tính</Form.Label>
                      <Form.Select
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                      >
                        <option value="all">Tất cả</option>
                        <option value="male">Bé trai</option>
                        <option value="female">Bé gái</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-3">
                  <Form.Label>Ngân sách</Form.Label>
                  <Form.Select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                  >
                    <option value="">Tất cả mức giá</option>
                    {priceRanges.map(range => (
                      <option key={range.id} value={range.id}>
                        {range.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Sở thích của bé</Form.Label>
                  <Row>
                    {interestOptions.map(option => (
                      <Col md={6} key={option.id}>
                        <Form.Check 
                          type="checkbox"
                          id={`interest-${option.id}`}
                          label={option.label}
                          value={option.id}
                          checked={interests.includes(option.id)}
                          onChange={handleInterestChange}
                          className="mb-2"
                        />
                      </Col>
                    ))}
                  </Row>
                </Form.Group>
                
                <div className="d-grid">
                  <Button variant="primary" type="submit" size="lg">
                    Tìm quà sinh nhật
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : searchPerformed ? (
        <>
          <h2 className="mb-4">Gợi ý quà sinh nhật</h2>
          
          {filteredProducts.length === 0 ? (
            <Alert variant="info">
              <Alert.Heading>Không tìm thấy sản phẩm phù hợp</Alert.Heading>
              <p>
                Thật tiếc, chúng tôi không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn.
                Hãy thử điều chỉnh lại các tiêu chí hoặc{' '}
                <Link to="/products">xem tất cả sản phẩm</Link> của chúng tôi.
              </p>
            </Alert>
          ) : (
            <Row>
              {filteredProducts.slice(0, 12).map(product => (
                <Col key={product.id} sm={6} md={4} lg={3} className="mb-4">
                  <Card className="h-100 product-card">
                    <Link to={`/product/${product.id}`}>
                      <Card.Img 
                        variant="top" 
                        src={product.image || '/images/placeholder.jpg'} 
                        alt={product.name}
                      />
                    </Link>
                    <Card.Body className="d-flex flex-column">
                      <Card.Title as="div">
                        <Link to={`/product/${product.id}`} className="product-title">
                          {product.name}
                        </Link>
                      </Card.Title>
                      
                      <Card.Text as="div" className="mb-2">
                        <small className="text-muted">
                          {product.minAge} - {product.maxAge || '+'} tháng
                        </small>
                      </Card.Text>
                      
                      {product.tags && (
                        <div className="mb-2">
                          {product.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="badge bg-light text-dark me-1">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <Card.Text as="h5" className="mt-auto mb-0">
                        {formatPrice(product.price)}
                      </Card.Text>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          
          {filteredProducts.length > 0 && (
            <div className="text-center mt-4">
              <p>
                Tìm thấy {filteredProducts.length} sản phẩm phù hợp với tiêu chí của bạn.
              </p>
              <Link to="/products" className="btn btn-outline-primary">
                Xem tất cả sản phẩm
              </Link>
            </div>
          )}
        </>
      ) : null}
    </Container>
  );
};

export default BirthdayGiftFinderPage; 