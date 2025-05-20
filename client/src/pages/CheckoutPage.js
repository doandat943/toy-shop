import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
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
  const [clientSecret, setClientSecret] = useState(null);

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
        promoCode: promoSuccess ? promoCode : null
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
        // TODO: dispatch clear cart action
        navigate(`/order/${data.order.id}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    }
  };

  const handlePaymentSuccess = (paymentIntent) => {
    // TODO: dispatch clear cart action
    navigate(`/order/${orderInfo.orderId}?payment_success=true`);
  };

  const handlePaymentError = (errorMessage) => {
    console.error('Payment error:', errorMessage);
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Thanh toán</h1>
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header as="h5">Địa chỉ giao hàng</Card.Header>
            <Card.Body>
              <p><strong>Họ tên:</strong> {shippingAddress.fullName}</p>
              <p><strong>Địa chỉ:</strong> {shippingAddress.address}, {shippingAddress.city}</p>
              <p><strong>Số điện thoại:</strong> {shippingAddress.phone}</p>
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => navigate('/shipping')}
              >
                Chỉnh sửa
              </Button>
            </Card.Body>
          </Card>

          <Card className="mb-4">
            <Card.Header as="h5">Phương thức thanh toán</Card.Header>
            <Card.Body>
              <Form>
                {availablePaymentMethods.map((method) => (
                  method.enabled && (
                    <Form.Check
                      key={method.id}
                      type="radio"
                      id={`payment-${method.id}`}
                      label={method.name}
                      name="paymentMethod"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mb-3"
                    />
                  )
                ))}
                
                {paymentMethod === 'bank_transfer' && (
                  <Alert variant="info">
                    <p className="mb-1"><strong>Ngân hàng:</strong> {availablePaymentMethods.find(m => m.id === 'bank_transfer')?.bankInfo?.bankName}</p>
                    <p className="mb-1"><strong>Số tài khoản:</strong> {availablePaymentMethods.find(m => m.id === 'bank_transfer')?.bankInfo?.accountNumber}</p>
                    <p className="mb-1"><strong>Chủ tài khoản:</strong> {availablePaymentMethods.find(m => m.id === 'bank_transfer')?.bankInfo?.accountName}</p>
                    <p className="mb-0"><strong>Chi nhánh:</strong> {availablePaymentMethods.find(m => m.id === 'bank_transfer')?.bankInfo?.branch}</p>
                  </Alert>
                )}
                
                {(paymentMethod === 'momo' || paymentMethod === 'zalopay') && (
                  <Alert variant="info">
                    <div className="text-center mb-3">
                      <img 
                        src={availablePaymentMethods.find(m => m.id === paymentMethod)?.qrCode} 
                        alt={`QR code ${paymentMethod}`} 
                        style={{ maxWidth: '200px' }} 
                        className="mb-3"
                      />
                      <p className="mb-0">
                        <strong>Quét mã QR để thanh toán</strong>
                      </p>
                    </div>
                    <p className="mb-1">
                      <strong>Số tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPrice)}
                    </p>
                    <p className="mb-1">
                      <strong>Nội dung chuyển khoản:</strong> BabyBon {orderInfo?.id || '[Mã đơn hàng]'}
                    </p>
                    <p className="mb-0">
                      {availablePaymentMethods.find(m => m.id === paymentMethod)?.instructions}
                    </p>
                  </Alert>
                )}
              </Form>
            </Card.Body>
          </Card>
          
          {orderPlaced && paymentMethod === 'stripe' && (
            <Card className="mb-4">
              <Card.Header as="h5">Thông tin thanh toán</Card.Header>
              <Card.Body>
                <Elements stripe={stripePromise}>
                  <PaymentForm 
                    orderInfo={orderInfo}
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </Elements>
              </Card.Body>
            </Card>
          )}
        </Col>
        
        <Col md={4}>
          <Card>
            <Card.Header as="h5">Đơn hàng</Card.Header>
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item.product}>
                  <Row>
                    <Col md={8}>
                      <div className="d-flex align-items-center">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          style={{ width: '50px', marginRight: '10px' }}
                        />
                        <span className="small">{item.name} (x{item.qty})</span>
                      </div>
                    </Col>
                    <Col md={4} className="text-end">
                      {(item.price * item.qty).toLocaleString('vi-VN')}đ
                    </Col>
                  </Row>
                </ListGroup.Item>
              ))}
              
              <ListGroup.Item>
                <Row>
                  <Col md={8}>Tạm tính</Col>
                  <Col md={4} className="text-end">{itemsPrice.toLocaleString('vi-VN')}đ</Col>
                </Row>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Row>
                  <Col md={8}>Phí vận chuyển</Col>
                  <Col md={4} className="text-end">{shippingPrice.toLocaleString('vi-VN')}đ</Col>
                </Row>
              </ListGroup.Item>
              
              {discount > 0 && (
                <ListGroup.Item>
                  <Row>
                    <Col md={8}>Giảm giá</Col>
                    <Col md={4} className="text-end text-danger">-{discount.toLocaleString('vi-VN')}đ</Col>
                  </Row>
                </ListGroup.Item>
              )}
              
              <ListGroup.Item>
                <Row>
                  <Col md={8}><strong>Tổng cộng</strong></Col>
                  <Col md={4} className="text-end"><strong>{totalPrice.toLocaleString('vi-VN')}đ</strong></Col>
                </Row>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Form className="d-flex">
                  <Form.Control
                    type="text"
                    placeholder="Mã giảm giá"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                  />
                  <Button 
                    variant="outline-primary" 
                    onClick={validatePromoCode}
                    disabled={isValidatingCode}
                    className="ms-2"
                  >
                    Áp dụng
                  </Button>
                </Form>
                {promoError && <div className="text-danger mt-2 small">{promoError}</div>}
                {promoSuccess && <div className="text-success mt-2 small">{promoSuccess}</div>}
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Button
                  type="button"
                  variant="primary"
                  className="w-100"
                  disabled={cartItems.length === 0 || (orderPlaced && paymentMethod === 'stripe')}
                  onClick={!orderPlaced ? placeOrderHandler : null}
                >
                  {orderPlaced && paymentMethod === 'stripe' 
                    ? 'Đã tạo đơn hàng' 
                    : 'Đặt hàng'}
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