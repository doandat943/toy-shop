import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert, Image, Accordion, Tab, Nav } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { clearCart } from '../slices/cartSlice';
import { FaCreditCard, FaMoneyBill, FaUniversity, FaQrcode } from 'react-icons/fa';
import axios from 'axios';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Payment Form Component using Stripe
const PaymentForm = ({ orderInfo, onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      // Create payment intent on server
      const { data } = await axios.post('/api/payment/create-payment-intent', {
        orderId: orderInfo.orderId,
        total: orderInfo.total,
        paymentMethod: 'stripe'
      });

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: orderInfo.shippingAddress.fullName,
            email: orderInfo.email
          }
        }
      });

      if (result.error) {
        setPaymentError(result.error.message);
        onPaymentError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess(result.paymentIntent);
      }
    } catch (error) {
      setPaymentError(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      onPaymentError(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Thông tin thẻ</Form.Label>
        <div className="border rounded p-3">
          <CardElement options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                  color: '#aab7c4',
                },
              },
              invalid: {
                color: '#9e2146',
              },
            },
          }} />
        </div>
      </Form.Group>
      
      {paymentError && <Alert variant="danger">{paymentError}</Alert>}
      
      <Button 
        variant="primary" 
        type="submit" 
        className="w-100" 
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Đang xử lý...' : 'Thanh toán'}
      </Button>
    </Form>
  );
};

// Bank Transfer Payment Method Component
const BankTransferPayment = ({ bankInfo }) => {
  return (
    <div className="p-3">
      <h5>Thông tin chuyển khoản</h5>
      <ListGroup variant="flush" className="border rounded mb-3">
        <ListGroup.Item>
          <strong>Ngân hàng:</strong> {bankInfo.bankName}
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Số tài khoản:</strong> {bankInfo.accountNumber}
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Chủ tài khoản:</strong> {bankInfo.accountName}
        </ListGroup.Item>
        <ListGroup.Item>
          <strong>Chi nhánh:</strong> {bankInfo.branch}
        </ListGroup.Item>
      </ListGroup>
      <Alert variant="info">
        <p className="mb-0">
          <strong>Hướng dẫn:</strong> Vui lòng chuyển khoản với nội dung: <strong>BABYBON [Mã đơn hàng]</strong>
        </p>
        <p className="mb-0 mt-2">
          Đơn hàng của bạn sẽ được xử lý sau khi chúng tôi nhận được thanh toán.
        </p>
      </Alert>
    </div>
  );
};

// QR Code Payment Method Component
const QRCodePayment = ({ method }) => {
  return (
    <div className="p-3 text-center">
      <h5>{method.name}</h5>
      <div className="my-4">
        {method.qrCode && (
          <Image src={method.qrCode} alt={`${method.name} QR Code`} style={{ maxWidth: '250px' }} className="border p-2" />
        )}
      </div>
      <Alert variant="info" className="text-start">
        <strong>Hướng dẫn:</strong>
        <p className="mb-0 mt-2">{method.instructions}</p>
      </Alert>
    </div>
  );
};

// COD Payment Method Component
const CODPayment = () => {
  return (
    <div className="p-3">
      <h5>Thanh toán khi nhận hàng (COD)</h5>
      <Alert variant="info">
        <p className="mb-0">
          Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng.
        </p>
        <p className="mb-0 mt-2">
          Vui lòng chuẩn bị số tiền chính xác để thuận tiện cho việc giao hàng.
        </p>
      </Alert>
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, shippingAddress } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);
  
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [issueVATInvoice, setIssueVATInvoice] = useState(false);
  const [vatInfo, setVatInfo] = useState({
    companyName: '',
    taxCode: '',
    address: '',
    email: ''
  });

  // Calculate prices
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 500000 ? 0 : 30000;
  const totalPrice = itemsPrice + shippingPrice - discount;

  useEffect(() => {
    // Redirect to login if not logged in
    if (!userInfo) {
      navigate('/login?redirect=checkout');
    }
    
    // Redirect to shipping if no shipping address
    if (!shippingAddress || !shippingAddress.address) {
      navigate('/shipping');
    }
    
    // Get available payment methods
    const getPaymentMethods = async () => {
      try {
        const { data } = await axios.get('/api/payment/methods');
        setAvailablePaymentMethods(data.data || []);
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };
    
    getPaymentMethods();
  }, [userInfo, shippingAddress, navigate]);

  const validatePromoCode = async () => {
    if (!promoCode.trim()) return;
    
    setIsValidatingCode(true);
    setPromoError('');
    setPromoSuccess('');
    
    try {
      const { data } = await axios.post('/api/promotion/validate', {
        code: promoCode,
        cartTotal: itemsPrice,
        products: cartItems.map(item => item.product),
        categories: [...new Set(cartItems.map(item => item.category))]
      });
      
      setDiscount(data.data.discountAmount);
      setPromoSuccess(`Mã giảm giá đã được áp dụng: -${data.data.discountAmount.toLocaleString('vi-VN')}đ`);
    } catch (error) {
      setPromoError(error.response?.data?.message || 'Mã giảm giá không hợp lệ');
      setDiscount(0);
    } finally {
      setIsValidatingCode(false);
    }
  };

  const handleVATInfoChange = (e) => {
    const { name, value } = e.target;
    setVatInfo({
      ...vatInfo,
      [name]: value
    });
  };

  const placeOrderHandler = async () => {
    try {
      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems.map(item => ({
          product: item.product,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price
        })),
        shippingAddress,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        discount,
        total: totalPrice,
        promoCode: promoSuccess ? promoCode : null,
        requestVAT: issueVATInvoice,
        vatInfo: issueVATInvoice ? vatInfo : null
      });
      
      setOrderPlaced(true);
      setOrderInfo({
        orderId: data.order.id,
        total: totalPrice,
        email: userInfo.email,
        shippingAddress
      });
      
      // Clear cart if not using stripe
      if (paymentMethod !== 'stripe') {
        dispatch(clearCart());
        navigate(`/order/${data.order.id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    dispatch(clearCart());
    navigate(`/order/${orderInfo.orderId}`);
  };

  const handlePaymentError = (errorMessage) => {
    console.error('Payment error:', errorMessage);
  };

  // Render payment method selection tabs
  const renderPaymentMethodTabs = () => {
    return (
      <Tab.Container id="payment-methods-tabs" defaultActiveKey={paymentMethod}>
        <Nav variant="pills" className="mb-3 flex-column flex-sm-row">
          {availablePaymentMethods.map((method) => (
            method.enabled && (
              <Nav.Item key={method.id} className="mb-2 mb-sm-0 me-sm-2">
                <Nav.Link 
                  eventKey={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className="d-flex align-items-center"
                >
                  {method.id === 'cod' && <FaMoneyBill className="me-2" />}
                  {method.id === 'bank_transfer' && <FaUniversity className="me-2" />}
                  {(method.id === 'momo' || method.id === 'zalopay') && <FaQrcode className="me-2" />}
                  {method.id === 'stripe' && <FaCreditCard className="me-2" />}
                  {method.name}
                </Nav.Link>
              </Nav.Item>
            )
          ))}
        </Nav>
        
        <Tab.Content>
          {availablePaymentMethods.map((method) => (
            method.enabled && (
              <Tab.Pane key={method.id} eventKey={method.id}>
                {method.id === 'cod' && <CODPayment />}
                {method.id === 'bank_transfer' && <BankTransferPayment bankInfo={method.bankInfo} />}
                {(method.id === 'momo' || method.id === 'zalopay') && <QRCodePayment method={method} />}
                {method.id === 'stripe' && orderPlaced && (
                  <Elements stripe={stripePromise}>
                    <PaymentForm 
                      orderInfo={orderInfo} 
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                    />
                  </Elements>
                )}
              </Tab.Pane>
            )
          ))}
        </Tab.Content>
      </Tab.Container>
    );
  };

  return (
    <Container>
      <h1 className="my-4">Thanh toán</h1>
      
      <Row>
        <Col md={8}>
          {/* Payment Step */}
          <Card className="mb-4">
            <Card.Header as="h5">Phương thức thanh toán</Card.Header>
            <Card.Body>
              {renderPaymentMethodTabs()}
            </Card.Body>
          </Card>

          {/* VAT Invoice Information */}
          <Card className="mb-4">
            <Card.Header as="h5">Thông tin hóa đơn VAT</Card.Header>
            <Card.Body>
              <Form.Check
                type="checkbox"
                id="vat-invoice"
                label="Yêu cầu xuất hóa đơn VAT"
                checked={issueVATInvoice}
                onChange={(e) => setIssueVATInvoice(e.target.checked)}
                className="mb-3"
              />
              
              {issueVATInvoice && (
                <div className="border rounded p-3">
                  <Form.Group className="mb-3">
                    <Form.Label>Tên công ty</Form.Label>
                    <Form.Control
                      type="text"
                      name="companyName"
                      value={vatInfo.companyName}
                      onChange={handleVATInfoChange}
                      required={issueVATInvoice}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Mã số thuế</Form.Label>
                    <Form.Control
                      type="text"
                      name="taxCode"
                      value={vatInfo.taxCode}
                      onChange={handleVATInfoChange}
                      required={issueVATInvoice}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Địa chỉ công ty</Form.Label>
                    <Form.Control
                      type="text"
                      name="address"
                      value={vatInfo.address}
                      onChange={handleVATInfoChange}
                      required={issueVATInvoice}
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email nhận hóa đơn</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={vatInfo.email}
                      onChange={handleVATInfoChange}
                      required={issueVATInvoice}
                    />
                  </Form.Group>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header as="h5">Tóm tắt đơn hàng</Card.Header>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <h6>Sản phẩm</h6>
                {cartItems.map((item) => (
                  <Row key={item.product} className="mb-2">
                    <Col xs={8}>
                      {item.name} <small>x{item.qty}</small>
                    </Col>
                    <Col xs={4} className="text-end">
                      {parseInt(item.price * item.qty).toLocaleString('vi-VN')}đ
                    </Col>
                  </Row>
                ))}
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Row>
                  <Col>Tạm tính</Col>
                  <Col className="text-end">{parseInt(itemsPrice).toLocaleString('vi-VN')}đ</Col>
                </Row>
              </ListGroup.Item>

              <ListGroup.Item>
                <Row>
                  <Col>Phí vận chuyển</Col>
                  <Col className="text-end">
                    {shippingPrice === 0 
                      ? 'Miễn phí' 
                      : `${parseInt(shippingPrice).toLocaleString('vi-VN')}đ`}
                  </Col>
                </Row>
              </ListGroup.Item>
              
              {discount > 0 && (
                <ListGroup.Item>
                  <Row>
                    <Col>Giảm giá</Col>
                    <Col className="text-end text-danger">
                      -{parseInt(discount).toLocaleString('vi-VN')}đ
                    </Col>
                  </Row>
                </ListGroup.Item>
              )}
              
              <ListGroup.Item>
                <Row>
                  <Col><strong>Tổng cộng</strong></Col>
                  <Col className="text-end"><strong>{parseInt(totalPrice).toLocaleString('vi-VN')}đ</strong></Col>
                </Row>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Form.Group className="mb-3">
                  <Form.Label>Mã giảm giá</Form.Label>
                  <div className="d-flex">
                    <Form.Control 
                      type="text" 
                      placeholder="Nhập mã giảm giá" 
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                    />
                    <Button 
                      variant="outline-primary" 
                      className="ms-2"
                      onClick={validatePromoCode}
                      disabled={isValidatingCode || !promoCode.trim()}
                    >
                      {isValidatingCode ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </Button>
                  </div>
                  {promoError && <div className="text-danger mt-2">{promoError}</div>}
                  {promoSuccess && <div className="text-success mt-2">{promoSuccess}</div>}
                </Form.Group>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Button 
                  type="button" 
                  variant="primary" 
                  className="w-100"
                  onClick={placeOrderHandler}
                  disabled={cartItems.length === 0 || orderPlaced || (issueVATInvoice && (!vatInfo.companyName || !vatInfo.taxCode))}
                >
                  {orderPlaced && paymentMethod === 'stripe' ? 'Tiến hành thanh toán' : 'Đặt hàng'}
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage; 