import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Row, Col, ListGroup, Image, Card, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { FaFileInvoiceDollar, FaCreditCard, FaMoneyBill, FaUniversity, FaQrcode } from 'react-icons/fa';
import axios from 'axios';
import MoMoPayment from '../components/MoMoPayment';

const OrderPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  // Sử dụng cả hai redux state để tránh lỗi khi trang được nạp
  const { userInfo: authUserInfo } = useSelector((state) => state.auth);
  const { user: userUserInfo } = useSelector((state) => state.user);
  const userInfo = authUserInfo || userUserInfo;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentStatusLoading, setPaymentStatusLoading] = useState(false);
  const [paymentSuccess] = useState(searchParams.get('payment_success') === 'true');
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showRetryMomo, setShowRetryMomo] = useState(false);
  const [verificationInterval, setVerificationInterval] = useState(null);

  // Kiểm tra tham số redirect từ MoMo
  const momoResultCode = searchParams.get('resultCode');
  const momoSuccess = momoResultCode === '0';

  useEffect(() => {
    const getOrderDetails = async () => {
      try {
        setLoading(true);
        
        // Lấy token từ localStorage nếu không có userInfo
        let token = userInfo?.token;
        if (!token) {
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            token = parsedUser.token;
          }
        }
        
        if (!token) {
          setError('Không thể xác thực người dùng. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const { data } = await axios.get(`/api/orders/${id}`, config);
        setOrder(data.data);
        
        // Nếu đơn hàng thanh toán qua MoMo và có param resultCode=0, xử lý như thành công
        if (data.data.paymentMethod === 'momo' && momoSuccess && !data.data.isPaid) {
          console.log('MoMo payment successful, updating order');
          setOrder({
            ...data.data,
            isPaid: true,
            paidAt: new Date().toISOString(),
          });
        }
        
        // If order has stripe payment method and is not paid, check payment status
        if (data.data.paymentMethod === 'stripe' && !data.data.isPaid) {
          checkPaymentStatus();
        }
      } catch (error) {
        console.error('Error fetching order:', error);
        setError(
          error.response && error.response.data.message
            ? error.response.data.message
            : 'Đã xảy ra lỗi khi tải thông tin đơn hàng.'
        );
      } finally {
        setLoading(false);
      }
    };

    // Get payment methods for additional info
    const getPaymentMethods = async () => {
      try {
        const { data } = await axios.get('/api/payment/methods');
        setPaymentMethods(data.data || []);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };

    // Luôn thực hiện getOrderDetails nếu có id, không phụ thuộc vào userInfo
    if (id) {
      getOrderDetails();
      getPaymentMethods();
    }
  }, [id, momoSuccess]);

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
      case 'shipping':
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
      'shipping': 'Đã giao cho đơn vị vận chuyển',
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

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cod':
        return <FaMoneyBill className="me-2" />;
      case 'bank_transfer':
        return <FaUniversity className="me-2" />;
      case 'momo':
      case 'zalopay':
        return <FaQrcode className="me-2" />;
      case 'stripe':
      case 'credit_card':
        return <FaCreditCard className="me-2" />;
      default:
        return null;
    }
  };

  const getPaymentMethodDetails = (paymentMethod) => {
    const method = paymentMethods.find(m => m.id === paymentMethod);
    if (!method) return null;

    switch (paymentMethod) {
      case 'bank_transfer':
        return (
          <div className="mt-3 border rounded p-3 bg-light">
            <p className="mb-1"><strong>Ngân hàng:</strong> {method.bankInfo?.bankName}</p>
            <p className="mb-1"><strong>Số tài khoản:</strong> {method.bankInfo?.accountNumber}</p>
            <p className="mb-1"><strong>Chủ tài khoản:</strong> {method.bankInfo?.accountName}</p>
            <p className="mb-0"><strong>Chi nhánh:</strong> {method.bankInfo?.branch}</p>
            <hr />
            <p className="mb-0 fst-italic">
              <small>Nội dung chuyển khoản: <strong>BABYBON {order?.orderNumber}</strong></small>
            </p>
          </div>
        );
      case 'momo':
      case 'zalopay':
        return (
          <div className="mt-3 border rounded p-3 bg-light text-center">
            {method.qrCode && (
              <img src={method.qrCode} alt={`${method.name} QR Code`} className="mb-2" style={{ maxWidth: '200px' }} />
            )}
            <p className="mb-0 fst-italic">
              <small>{method.instructions}</small>
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  // Verify payment status
  const verifyPayment = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/payment/verify-momo/${orderId}`);
      
      // If payment is successful
      if (data.data.isPaid) {
        // Clear the interval
        if (verificationInterval) {
          clearInterval(verificationInterval);
          setVerificationInterval(null);
        }
        
        handleMoMoSuccess(data.data);
      }
    } catch (error) {
      console.error('Error verifying MoMo payment:', error);
    }
  };

  // Handle MoMo payment success
  const handleMoMoSuccess = (paymentResult) => {
    // Update order with payment info
    setOrder((prev) => ({
      ...prev,
      isPaid: true,
      paidAt: new Date().toISOString(),
      paymentResult: paymentResult
    }));
    setShowRetryMomo(false);
    // Reload the page to get updated order status
    window.location.reload();
  };

  // Handle MoMo payment error
  const handleMoMoError = (error) => {
    console.error('MoMo payment error:', error);
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

  if (!order) {
    return (
      <Alert variant="warning">Không tìm thấy thông tin đơn hàng.</Alert>
    );
  }

  // Parse shipping address if it's stored as a string
  const shippingAddress = typeof order.shippingAddress === 'string' 
    ? JSON.parse(order.shippingAddress) 
    : order.shippingAddress;

  // Parse VAT info if available
  const vatInfo = order.vatInvoice && order.vatInvoiceInfo 
    ? (typeof order.vatInvoiceInfo === 'string' ? JSON.parse(order.vatInvoiceInfo) : order.vatInvoiceInfo)
    : null;

  return (
    <div className="py-5">
      <h1 className="mb-4">
        Đơn hàng #{order.orderNumber || order.id}
        <Badge 
          bg={getStatusBadgeClass(order.status).replace('text-dark', '').replace('text-white', '')} 
          className="ms-2 fs-6"
        >
          {getStatusText(order.status)}
        </Badge>
      </h1>
      
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
              <p><strong>Người nhận:</strong> {shippingAddress.fullName}</p>
              <p><strong>Email:</strong> {order.customerEmail || (order.user && order.user.email)}</p>
              <p><strong>Địa chỉ:</strong> {shippingAddress.address}, {order.city || shippingAddress.city}</p>
              <p><strong>Số điện thoại:</strong> {order.customerPhone || shippingAddress.phone}</p>
              {order.notes && <p><strong>Ghi chú:</strong> {order.notes}</p>}
              {order.deliveredAt && (
                <p>
                  <strong>Đã giao lúc:</strong>{' '}
                  {new Date(order.deliveredAt).toLocaleString('vi-VN')}
                </p>
              )}
              {order.trackingNumber && (
                <p>
                  <strong>Mã vận đơn:</strong> {order.trackingNumber}
                  {order.shippingProvider && ` (${order.shippingProvider})`}
                </p>
              )}
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header as="h5">
              <div className="d-flex align-items-center">
                {getPaymentMethodIcon(order.paymentMethod)}
                Thông tin thanh toán
              </div>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>Phương thức: </strong>
                {getPaymentMethodIcon(order.paymentMethod)}
                {getPaymentMethodText(order.paymentMethod)}
              </p>
              
              {order.isPaid ? (
                <Alert variant="success" className="mb-0">
                  Đã thanh toán vào {new Date(order.paidAt).toLocaleString('vi-VN')}
                </Alert>
              ) : (
                <>
                  <Alert variant="warning" className="mb-3">
                    Chưa thanh toán
                  </Alert>
                  {order.paymentMethod === 'momo' && (
                    <div>
                      <Button 
                        variant="primary"
                        onClick={() => setShowRetryMomo(!showRetryMomo)}
                        className="w-100"
                      >
                        <FaQrcode className="me-2" />
                        {showRetryMomo ? 'Ẩn' : 'Thanh toán lại với MoMo'}
                      </Button>
                      
                      {showRetryMomo && (
                        <div className="mt-3">
                          <MoMoPayment
                            orderInfo={{
                              orderId: order.id,
                              total: order.totalAmount
                            }}
                            onPaymentSuccess={handleMoMoSuccess}
                            onPaymentError={handleMoMoError}
                            showRetryButton={true}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
              
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
            </Card.Body>
          </Card>

          {order.vatInvoice && vatInfo && (
            <Card className="mb-4">
              <Card.Header as="h5">
                <div className="d-flex align-items-center">
                  <FaFileInvoiceDollar className="me-2" />
                  Thông tin hóa đơn VAT
                </div>
              </Card.Header>
              <Card.Body>
                <p><strong>Tên công ty:</strong> {vatInfo.companyName}</p>
                <p><strong>Mã số thuế:</strong> {vatInfo.taxCode}</p>
                <p><strong>Địa chỉ:</strong> {vatInfo.address}</p>
                <p><strong>Email nhận hóa đơn:</strong> {vatInfo.email}</p>
                <p>
                  <strong>Trạng thái:</strong>{' '}
                  <Badge bg="warning" text="dark">Đang xử lý</Badge>
                </p>
              </Card.Body>
            </Card>
          )}

          <Card>
            <Card.Header as="h5">Sản phẩm đã đặt</Card.Header>
            <ListGroup variant="flush">
              {order.orderItems && order.orderItems.map((item) => (
                <ListGroup.Item key={item.id}>
                  <Row className="align-items-center">
                    <Col md={2}>
                      <Image src={item.image || item.productImage} alt={item.name || item.productName} fluid rounded />
                    </Col>
                    <Col md={6}>
                      <Link to={`/product/${item.productId}`}>
                        {item.name || item.productName}
                      </Link>
                      {item.personalization && (
                        <p className="small mt-1 mb-0">
                          <strong>Cá nhân hóa:</strong> {
                            typeof item.personalization === 'string' 
                              ? item.personalization 
                              : JSON.stringify(item.personalization)
                          }
                        </p>
                      )}
                    </Col>
                    <Col md={2}>
                      {item.quantity} x
                    </Col>
                    <Col md={2} className="text-end">
                      {parseInt(item.price).toLocaleString('vi-VN')}đ
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header as="h5">Tóm tắt đơn hàng</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <Row>
                  <Col>Tạm tính</Col>
                  <Col className="text-end">
                    {parseInt(order.subTotal || order.subtotal || 0).toLocaleString('vi-VN')}đ
                  </Col>
                </Row>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Row>
                  <Col>Phí vận chuyển</Col>
                  <Col className="text-end">
                    {parseInt(order.shippingCost || order.shippingPrice || 0).toLocaleString('vi-VN')}đ
                  </Col>
                </Row>
              </ListGroup.Item>
              
              {(order.discount > 0) && (
                <ListGroup.Item>
                  <Row>
                    <Col>Giảm giá</Col>
                    <Col className="text-end text-danger">
                      -{parseInt(order.discount).toLocaleString('vi-VN')}đ
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}
              
              <ListGroup.Item>
                <Row>
                  <Col>
                    <strong>Tổng thanh toán</strong>
                  </Col>
                  <Col className="text-end">
                    <strong>{parseInt(order.totalAmount || order.total || 0).toLocaleString('vi-VN')}đ</strong>
                  </Col>
                </Row>
              </ListGroup.Item>
              
              {(!order.isPaid && order.paymentMethod === 'cod') && (
                <ListGroup.Item>
                  <Alert variant="info" className="mb-0">
                    Vui lòng chuẩn bị số tiền chính xác khi nhận hàng.
                  </Alert>
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OrderPage; 