import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import axios from 'axios';

const OrderPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [paymentSuccess] = useState(searchParams.get('payment_success') === 'true');

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data.order);
        
        // If order has stripe payment method and is not paid, check payment status
        if (data.order.paymentMethod === 'stripe' && !data.order.isPaid) {
          checkPaymentStatus();
        }
      } catch (error) {
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Đã xảy ra lỗi khi tải thông tin đơn hàng.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (userInfo && id) {
      getOrderDetails();
    }
  }, [userInfo, id, paymentSuccess]);

  const checkPaymentStatus = async () => {
    if (!userInfo || !id) return;
    
    setPaymentStatusLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await axios.get(`/api/payment/status/${id}`, config);
      setPaymentStatus(data.data);
      
      // If payment has been processed, update order
      if (data.data.isPaid && !order.isPaid) {
        setOrder(prev => ({ ...prev, isPaid: true, paidAt: data.data.paidAt }));
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setPaymentStatusLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'processing':
        return 'bg-info text-white';
      case 'shipped':
        return 'bg-primary text-white';
      case 'delivered':
        return 'bg-success text-white';
      case 'cancelled':
        return 'bg-danger text-white';
      default:
        return 'bg-secondary text-white';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đã giao cho đơn vị vận chuyển',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      'cod': 'Thanh toán khi nhận hàng',
      'bank_transfer': 'Chuyển khoản ngân hàng',
      'momo': 'Ví MoMo',
      'zalopay': 'ZaloPay',
      'stripe': 'Thẻ tín dụng/ghi nợ'
    };
    return methodMap[method] || method;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/" className="btn btn-primary">
          Quay về trang chủ
        </Link>
      </div>
    );
  }

  return (
    order && (
      <div className="py-5">
        <h1 className="mb-4">Đơn hàng #{order.id}</h1>
        
        {paymentSuccess && (
          <Alert variant="success" className="mb-4">
            Thanh toán thành công! Cảm ơn bạn đã mua hàng tại BabyBon.
          </Alert>
        )}
        
        <Row>
          <Col md={8}>
            <Card className="mb-4">
              <Card.Header as="h5">Thông tin giao hàng</Card.Header>
              <Card.Body>
                <p><strong>Người nhận:</strong> {order.shippingAddress.fullName}</p>
                <p><strong>Email:</strong> {order.user.email}</p>
                <p><strong>Địa chỉ:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}</p>
                <p><strong>Số điện thoại:</strong> {order.shippingAddress.phone}</p>
                <p>
                  <strong>Trạng thái:</strong>{' '}
                  <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </p>
                {order.deliveredAt && (
                  <p>
                    <strong>Đã giao lúc:</strong>{' '}
                    {new Date(order.deliveredAt).toLocaleString('vi-VN')}
                  </p>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4">
              <Card.Header as="h5">Thanh toán</Card.Header>
              <Card.Body>
                <p>
                  <strong>Phương thức:</strong> {getPaymentMethodText(order.paymentMethod)}
                </p>
                <p>
                  <strong>Trạng thái:</strong>{' '}
                  {order.isPaid ? (
                    <span className="badge bg-success">Đã thanh toán lúc {new Date(order.paidAt).toLocaleString('vi-VN')}</span>
                  ) : (
                    <span className="badge bg-danger">Chưa thanh toán</span>
                  )}
                </p>
                
                {order.paymentMethod === 'stripe' && !order.isPaid && paymentStatus && (
                  <div className="mt-3">
                    <p><strong>Trạng thái của Stripe:</strong> {paymentStatus.stripeStatus}</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={checkPaymentStatus}
                      disabled={paymentStatusLoading}
                    >
                      {paymentStatusLoading ? (
                        <>
                          <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> Đang kiểm tra...
                        </>
                      ) : (
                        'Kiểm tra trạng thái thanh toán'
                      )}
                    </Button>
                  </div>
                )}
                
                {order.paymentMethod === 'bank_transfer' && !order.isPaid && (
                  <Alert variant="info" className="mt-3">
                    <p className="mb-1">Vui lòng chuyển khoản với nội dung: <strong>BabyBon {order.id}</strong></p>
                    <p className="mb-1"><strong>Ngân hàng:</strong> Vietcombank</p>
                    <p className="mb-1"><strong>Số tài khoản:</strong> 1234567890</p>
                    <p className="mb-1"><strong>Chủ tài khoản:</strong> CÔNG TY BABYBON</p>
                    <p className="mb-0"><strong>Chi nhánh:</strong> Hồ Chí Minh</p>
                  </Alert>
                )}
              </Card.Body>
            </Card>

            <Card>
              <Card.Header as="h5">Sản phẩm đã đặt</Card.Header>
              <ListGroup variant="flush">
                {order.orderItems.map((item, index) => (
                  <ListGroup.Item key={index}>
                    <Row>
                      <Col md={2}>
                        <Image src={item.image} alt={item.name} fluid rounded />
                      </Col>
                      <Col>
                        <Link to={`/product/${item.product}`}>{item.name}</Link>
                      </Col>
                      <Col md={4} className="text-end">
                        {item.qty} x {item.price.toLocaleString('vi-VN')}đ = {(item.qty * item.price).toLocaleString('vi-VN')}đ
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>
          
          <Col md={4}>
            <Card>
              <Card.Header as="h5">Tổng đơn hàng</Card.Header>
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <Row>
                    <Col>Tạm tính</Col>
                    <Col className="text-end">{order.itemsPrice.toLocaleString('vi-VN')}đ</Col>
                  </Row>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <Row>
                    <Col>Phí vận chuyển</Col>
                    <Col className="text-end">{order.shippingPrice.toLocaleString('vi-VN')}đ</Col>
                  </Row>
                </ListGroup.Item>
                
                {order.discount > 0 && (
                  <ListGroup.Item>
                    <Row>
                      <Col>Giảm giá</Col>
                      <Col className="text-end text-danger">-{order.discount.toLocaleString('vi-VN')}đ</Col>
                    </Row>
                    {order.promoCode && (
                      <Row className="mt-1">
                        <Col>
                          <small className="text-muted">Mã giảm giá: {order.promoCode}</small>
                        </Col>
                      </Row>
                    )}
                  </ListGroup.Item>
                )}
                
                <ListGroup.Item>
                  <Row>
                    <Col>
                      <strong>Tổng cộng</strong>
                    </Col>
                    <Col className="text-end">
                      <strong>{order.total.toLocaleString('vi-VN')}đ</strong>
                    </Col>
                  </Row>
                </ListGroup.Item>
                
                <ListGroup.Item>
                  <div className="d-grid gap-2">
                    <Button variant="primary" as={Link} to="/products">
                      Tiếp tục mua sắm
                    </Button>
                    {order.status === 'pending' && (
                      <Button variant="outline-danger">
                        Hủy đơn hàng
                      </Button>
                    )}
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card>
          </Col>
        </Row>
      </div>
    )
  );
};

export default OrderPage; 