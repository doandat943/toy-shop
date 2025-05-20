import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Alert, Badge, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Meta from '../components/Meta';
import Loader from '../components/Loader';
import Message from '../components/Message';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const PromotionalCalendarPage = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  
  // Vietnamese holidays and occasions
  const staticPromotions = [
    {
      id: 'tet2024',
      title: 'Tết Nguyên Đán 2024',
      description: 'Khuyến mãi mừng Tết Nguyên Đán với ưu đãi lên đến 30% cho các sản phẩm đồ chơi truyền thống.',
      startDate: '2024-01-25',
      endDate: '2024-02-15',
      discount: '30%',
      type: 'holiday',
      image: '/images/promotions/tet.jpg',
      couponCode: 'TET2024',
      backgroundColor: '#e60000',
      color: '#ffffff'
    },
    {
      id: 'children-day-2023',
      title: 'Ngày Quốc tế Thiếu nhi 1/6',
      description: 'Mừng ngày Quốc tế Thiếu nhi với nhiều ưu đãi đặc biệt cho bé yêu.',
      startDate: '2023-05-25',
      endDate: '2023-06-05',
      discount: '25%',
      type: 'holiday',
      image: '/images/promotions/children-day.jpg',
      couponCode: 'CHILDREN2023',
      backgroundColor: '#ff9900',
      color: '#ffffff'
    },
    {
      id: 'mid-autumn-2023',
      title: 'Tết Trung Thu 2023',
      description: 'Đón Tết Trung Thu với bộ sưu tập đồ chơi giáo dục và đèn lồng thủ công.',
      startDate: '2023-09-15',
      endDate: '2023-09-29',
      discount: '20%',
      type: 'holiday',
      image: '/images/promotions/mid-autumn.jpg',
      couponCode: 'MIDAUTUMN2023',
      backgroundColor: '#ffcc00',
      color: '#000000'
    },
    {
      id: 'back-to-school-2023',
      title: 'Mùa Tựu Trường 2023',
      description: 'Chuẩn bị cho năm học mới với bộ sản phẩm đồ chơi phát triển kỹ năng.',
      startDate: '2023-08-01',
      endDate: '2023-09-10',
      discount: '15%',
      type: 'season',
      image: '/images/promotions/back-to-school.jpg',
      couponCode: 'SCHOOL2023',
      backgroundColor: '#3399ff',
      color: '#ffffff'
    },
    {
      id: 'christmas-2023',
      title: 'Giáng Sinh 2023',
      description: 'Khuyến mãi Giáng Sinh với bộ sưu tập quà tặng giáo dục.',
      startDate: '2023-12-01',
      endDate: '2023-12-31',
      discount: '25%',
      type: 'holiday',
      image: '/images/promotions/christmas.jpg',
      couponCode: 'XMAS2023',
      backgroundColor: '#006600',
      color: '#ffffff'
    },
    {
      id: 'womens-day-2023',
      title: 'Ngày Quốc tế Phụ nữ 8/3',
      description: 'Ưu đãi đặc biệt cho các mẹ nhân ngày 8/3.',
      startDate: '2023-03-01',
      endDate: '2023-03-10',
      discount: '15%',
      type: 'holiday',
      image: '/images/promotions/womens-day.jpg',
      couponCode: 'WOMEN2023',
      backgroundColor: '#ff66cc',
      color: '#ffffff'
    },
    {
      id: 'vietnam-teachers-day-2023',
      title: 'Ngày Nhà giáo Việt Nam 20/11',
      description: 'Tri ân thầy cô với bộ sưu tập đồ chơi giáo dục.',
      startDate: '2023-11-10',
      endDate: '2023-11-20',
      discount: '20%',
      type: 'holiday',
      image: '/images/promotions/teachers-day.jpg',
      couponCode: 'TEACHER2023',
      backgroundColor: '#6600cc',
      color: '#ffffff'
    },
    {
      id: 'national-day-2023',
      title: 'Quốc Khánh 2/9',
      description: 'Mừng ngày Quốc Khánh với nhiều ưu đãi hấp dẫn.',
      startDate: '2023-08-25',
      endDate: '2023-09-05',
      discount: '15%',
      type: 'holiday',
      image: '/images/promotions/national-day.jpg',
      couponCode: 'NATIONAL2023',
      backgroundColor: '#cc0000',
      color: '#ffffff'
    },
    {
      id: 'summer-2023',
      title: 'Mùa Hè Vui Nhộn 2023',
      description: 'Đón hè rộn ràng với bộ sưu tập đồ chơi ngoài trời và đồ chơi phát triển vận động.',
      startDate: '2023-06-01',
      endDate: '2023-07-31',
      discount: '20%',
      type: 'season',
      image: '/images/promotions/summer.jpg',
      couponCode: 'SUMMER2023',
      backgroundColor: '#66cc00',
      color: '#ffffff'
    }
  ];
  
  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        // In a real application, you would fetch from API
        // const { data } = await axios.get('/api/promotions');
        
        // For now, we'll use the static data but simulate an API call
        setTimeout(() => {
          setPromotions(staticPromotions);
          setLoading(false);
        }, 1000);
      } catch (error) {
        setError('Không thể tải thông tin khuyến mãi. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchPromotions();
  }, []);
  
  // Format date to Vietnamese format
  const formatDate = (date) => {
    dayjs.locale('vi');
    return dayjs(date).format('DD/MM/YYYY');
  };
  
  // Check if a promotion is active
  const isActivePromotion = (startDate, endDate) => {
    const today = dayjs();
    return today.isAfter(dayjs(startDate)) && today.isBefore(dayjs(endDate));
  };
  
  // Filter promotions for current month
  const getPromotionsForMonth = (month, year) => {
    return promotions.filter(promo => {
      const startDate = dayjs(promo.startDate);
      const endDate = dayjs(promo.endDate);
      const targetMonth = dayjs().month(month).year(year);
      
      // Check if the promotion occurs in the target month
      return (
        (startDate.month() === month && startDate.year() === year) ||
        (endDate.month() === month && endDate.year() === year) ||
        (startDate.isBefore(targetMonth.startOf('month')) && 
         endDate.isAfter(targetMonth.endOf('month')))
      );
    });
  };
  
  // Navigate to previous month
  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };
  
  // Navigate to next month
  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };
  
  // Get Vietnamese month name
  const getMonthName = (month) => {
    dayjs.locale('vi');
    return dayjs().month(month).format('MMMM');
  };
  
  // Get current promotions
  const currentPromotions = getPromotionsForMonth(currentMonth, currentYear);
  
  return (
    <Container className="py-5">
      <Meta title="Lịch Khuyến Mãi - BabyBon" />
      
      <div className="text-center mb-5">
        <h1 className="mb-3">Lịch Khuyến Mãi</h1>
        <p className="lead">
          Đừng bỏ lỡ các chương trình ưu đãi đặc biệt của BabyBon cho từng dịp lễ và mùa trong năm
        </p>
      </div>
      
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <div className="month-navigator d-flex justify-content-between align-items-center mb-4">
            <Button variant="outline-primary" onClick={goToPreviousMonth}>
              <i className="fas fa-chevron-left"></i> Tháng trước
            </Button>
            
            <h2 className="m-0">{getMonthName(currentMonth)} {currentYear}</h2>
            
            <Button variant="outline-primary" onClick={goToNextMonth}>
              Tháng sau <i className="fas fa-chevron-right"></i>
            </Button>
          </div>
          
          {currentPromotions.length === 0 ? (
            <Alert variant="info">
              Không có chương trình khuyến mãi nào trong tháng {getMonthName(currentMonth)} {currentYear}.
            </Alert>
          ) : (
            <Row>
              {currentPromotions.map(promo => (
                <Col md={6} className="mb-4" key={promo.id}>
                  <Card className="h-100 promotion-card">
                    <Card.Body style={{ backgroundColor: promo.backgroundColor, color: promo.color }}>
                      <Row>
                        <Col xs={4}>
                          {promo.image && (
                            <div className="promotion-image mb-3 mb-md-0">
                              <img 
                                src={promo.image} 
                                alt={promo.title} 
                                className="img-fluid rounded"
                              />
                            </div>
                          )}
                        </Col>
                        <Col xs={8}>
                          <div className="d-flex justify-content-between">
                            <h3 className="promotion-title mb-2">{promo.title}</h3>
                            <Badge bg={isActivePromotion(promo.startDate, promo.endDate) ? 'success' : 'secondary'}>
                              {isActivePromotion(promo.startDate, promo.endDate) ? 'Đang diễn ra' : 'Sắp diễn ra'}
                            </Badge>
                          </div>
                          
                          <p className="promotion-date mb-2">
                            <i className="fas fa-calendar-alt me-2"></i>
                            {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                          </p>
                          
                          {promo.discount && (
                            <p className="promotion-discount mb-2">
                              <i className="fas fa-tag me-2"></i>
                              Giảm giá: {promo.discount}
                            </p>
                          )}
                          
                          <p className="promotion-description mb-3">
                            {promo.description}
                          </p>
                          
                          {promo.couponCode && (
                            <div className="coupon-code p-2 mb-3 rounded text-center" 
                                 style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                              <strong>Mã giảm giá:</strong> {promo.couponCode}
                            </div>
                          )}
                          
                          <Link 
                            to={`/products?promotion=${promo.id}`} 
                            className="btn btn-light"
                          >
                            Xem sản phẩm
                          </Link>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
          
          <div className="mt-5">
            <h3 className="mb-4">Tất cả khuyến mãi sắp tới</h3>
            <Row>
              {promotions
                .filter(promo => dayjs(promo.endDate).isAfter(dayjs()))
                .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
                .map(promo => (
                  <Col md={4} key={promo.id} className="mb-3">
                    <Card className="upcoming-promotion">
                      <Card.Body>
                        <p className="text-muted mb-1">
                          <i className="fas fa-calendar-alt me-2"></i>
                          {formatDate(promo.startDate)} - {formatDate(promo.endDate)}
                        </p>
                        <h5>{promo.title}</h5>
                        {promo.discount && (
                          <Badge bg="danger" className="me-2">-{promo.discount}</Badge>
                        )}
                        <Badge bg={promo.type === 'holiday' ? 'primary' : 'success'}>
                          {promo.type === 'holiday' ? 'Ngày lễ' : 'Mùa'}
                        </Badge>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
            </Row>
          </div>
        </>
      )}
    </Container>
  );
};

export default PromotionalCalendarPage; 