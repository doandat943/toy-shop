import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Form, Button, Card, ListGroup, Alert, Image, Spinner } from 'react-bootstrap';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { clearCart } from '../slices/cartSlice';
import { FaMoneyBill, FaPaypal } from 'react-icons/fa';
import axios from 'axios';

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

// PayPal Payment Method Component
const PayPalPayment = ({ orderInfo, onPaymentSuccess, onPaymentError, orderPlaced }) => {
  const [paypalLoading, setPaypalLoading] = useState(true);
  const [paypalError, setPaypalError] = useState(null);

  // Options cho PayPalScriptProvider. Client ID lấy từ .env
  const initialOptions = {
    clientId: process.env.REACT_APP_PAYPAL_CLIENT_ID,
    currency: "USD", // Cần khớp với đơn vị tiền tệ gửi lên backend
    intent: "capture",
  };

  if (!orderPlaced || !orderInfo) {
    return null;
  }

  return (
    <div className="p-3">
       {/* Loading Spinner cho PayPal SDK (tùy chọn) */}
       {paypalLoading && <div className="text-center"><Spinner animation="border" size="sm" /> Đang tải PayPal...</div>}
       {paypalError && <Alert variant="danger">{paypalError}</Alert>}

       {/* PayPalScriptProvider bao quanh PayPalButtons */}
       <PayPalScriptProvider options={initialOptions} onError={(err) => {
         console.error("Failed to load PayPal SDK script", err);
         setPaypalError("Không thể tải PayPal. Vui lòng thử lại sau.");
         setPaypalLoading(false);
       }} onLoad={() => setPaypalLoading(false)}>

        <PayPalButtons
          style={{ layout: "vertical" }}
          // Hàm tạo đơn hàng trên server của mình
          createOrder={async (data, actions) => {
            try {
              // Gọi API backend để tạo đơn hàng PayPal
              const res = await axios.post('/api/payment/paypal/order', {
                orderId: orderInfo.id, // Sử dụng orderInfo.id (order ID từ backend)
              });

              if (res.data.success && res.data.orderID) {
                 setPaypalError(null);
                 return res.data.orderID; // Trả về PayPal Order ID từ backend
              } else {
                 throw new Error(res.data.message || 'Failed to create PayPal order');
              }
            } catch (error) {
              console.error("Error creating PayPal order:", error.response?.data || error.message);
              setPaypalError(error.response?.data?.message || 'Lỗi tạo đơn hàng PayPal. Vui lòng thử lại.');
              throw error; // Rethrow để PayPal Buttons biết có lỗi
            }
          }}
          // Hàm xử lý khi thanh toán thành công trên cửa sổ PayPal
          onApprove={async (data, actions) => {
            try {
              // Capture payment trên server của mình
              const res = await axios.post('/api/payment/paypal/capture', {
                orderID: data.orderID, // PayPal Order ID
                ourOrderId: orderInfo.id, // Order ID của mình
              });

              if (res.data.success) {
                onPaymentSuccess(res.data.captureData); // Truyền dữ liệu capture về component cha
              } else {
                 throw new Error(res.data.message || 'Failed to capture PayPal payment');
              }
            } catch (error) {
              console.error("Error capturing PayPal payment:", error.response?.data || error.message);
              setPaypalError(error.response?.data?.message || 'Lỗi xử lý thanh toán PayPal sau khi chấp thuận.');
              onPaymentError(error.response?.data?.message || 'Lỗi xử lý thanh toán PayPal sau khi chấp thuận.');
              throw error; // Rethrow để PayPal Buttons biết có lỗi
            }
          }}
          // Hàm xử lý khi có lỗi trong quá trình tương tác với PayPal (trước khi Approve)
          onError={(err) => {
            console.error("PayPal onError:", err);
            setPaypalError("Đã xảy ra lỗi trong quá trình thanh toán PayPal.");
            onPaymentError(err.message || "Đã xảy ra lỗi trong quá trình thanh toán PayPal.");
          }}
          // Hàm xử lý khi người dùng hủy thanh toán trên cửa sổ PayPal
          onCancel={(data) => {
             console.log('PayPal payment cancelled', data);
             setPaypalError('Bạn đã hủy thanh toán PayPal.');
             onPaymentError('Thanh toán PayPal đã bị hủy.');
          }}
        />
      </PayPalScriptProvider>
    </div>
  );
};

const CheckoutPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems, shippingAddress } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.auth);

  console.log('PayPal Client ID from env:', process.env.REACT_APP_PAYPAL_CLIENT_ID);

  // State để lưu thông tin địa chỉ giao hàng nhập trực tiếp trên trang Checkout
  const [localShippingAddress, setLocalShippingAddress] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: '',
    name: '', // Thêm trường tên người nhận
    phone: '' // Thêm trường số điện thoại
  });

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState([
    { id: 'cod', name: 'Thanh toán khi nhận hàng (COD)', enabled: true },
    { id: 'paypal', name: 'PayPal', enabled: process.env.REACT_APP_PAYPAL_CLIENT_ID ? true : false }
  ]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderInfo, setOrderInfo] = useState(null);
  const [issueVATInvoice, setIssueVATInvoice] = useState(false);
  const [vatInfo, setVatInfo] = useState({
    companyName: '',
    taxCode: '',
    address: '',
    email: ''
  });
  console.log('cartItems state:', cartItems);

  const [pageAlert, setPageAlert] = useState(null);
  const [pageAlertVariant, setPageAlertVariant] = useState('danger'); // default variant

  // Calculate prices
  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = 30000; // Cố định tiền ship 30k theo yêu cầu
  const totalPrice = itemsPrice + shippingPrice - discount;

  // TẠM THỜI VÔ HIỆU HÓA HOOK useEffect CHUYỂN HƯỚNG ĐỂ DEBUG
  // TRONG ỨNG DỤNG THỰC TẾ CẦN CÓ LOGIC KIỂM TRA GIỎ HÀNG VÀ ĐĂNG NHẬP
  /*
  useEffect(() => {
    console.log('CheckoutPage useEffect running');
    console.log('cartItems:', cartItems);
    console.log('userInfo:', userInfo);
    // Không còn kiểm tra shippingAddress ở đây nữa
    if (!cartItems || cartItems.length === 0) {
        console.log('Redirecting to /cart');
        navigate('/cart');
        return;
    }
    if (!userInfo) {
      console.log('Redirecting to /login');
      navigate('/login?redirect=checkout');
      return;
    }

  }, [userInfo, shippingAddress, navigate, cartItems]);
  */

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
    // Bỏ kiểm tra địa chỉ ở đây theo yêu cầu
    if (cartItems.length === 0) {
        setPageAlert("Giỏ hàng trống. Vui lòng thêm sản phẩm.");
        setPageAlertVariant('warning');
        return;
    }

    try {
      const { data } = await axios.post('/api/orders', {
        orderItems: cartItems.map(item => ({
          product: item.id,
          name: item.name,
          qty: item.qty,
          image: item.image,
          price: item.price,
        })),
        // shippingAddress sẽ được thêm sau, hoặc gửi rỗng/null nếu API cho phép
        shippingAddress: {}, // Gửi object rỗng tạm thời, cần API backend hỗ trợ
        paymentMethod: paymentMethod,
        itemsPrice: itemsPrice,
        shippingPrice: shippingPrice,
        discount: discount,
        totalPrice: totalPrice,
        vatInvoice: issueVATInvoice,
        vatInvoiceInfo: issueVATInvoice ? vatInfo : null,
      });

      setOrderInfo(data.data);
      setOrderPlaced(true);

      dispatch(clearCart());
      navigate(`/order/${data.data.id}`);

    } catch (error) {
      console.error('Error placing order:', error.response?.data || error.message);
      console.error('Error placing order - response data:', error.response?.data);
      console.error('Error placing order - message:', error.message);
      console.error('Full error object:', error);
      setPageAlert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt đơn hàng.');
      setPageAlertVariant('danger');
      
    }
  };

  const handlePaymentSuccess = (paymentDetails) => {
     console.log('Payment successful!', paymentDetails);
     dispatch(clearCart());
     navigate(`/order/${orderInfo.id}?payment=success`);
  };

  const handlePaymentError = (errorMessage) => {
    console.error('Payment failed or cancelled:', errorMessage);
    setPageAlert(`Thanh toán thất bại: ${errorMessage}`);
    setPageAlertVariant('danger');
  };

  const renderPaymentMethodOptions = () => {
    const methodsToRender = availablePaymentMethods.filter(method => 
        method.id === 'cod' || (method.id === 'paypal' && method.enabled)
    );

    return (
       <Form.Group>
          <Form.Label as="h6">Chọn phương thức thanh toán</Form.Label>
          {methodsToRender.map((method) => (
            <Form.Check
              key={method.id}
              type="radio"
              id={`paymentMethod${method.id}`}
              label={
                <>
                  {method.id === 'cod' && <FaMoneyBill className="me-2" />}
                  {method.id === 'paypal' && <FaPaypal className="me-2" />}
                  {method.name}
                </>
              }
              value={method.id}
              checked={paymentMethod === method.id}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="mb-2"
            />
          ))}
        </Form.Group>
    );
  };

  // TẠM THỜI BỎ QUA KIỂM TRA ĐIỀU KIỆN RENDER ĐỂ TEST CHUYỂN TRANG
  // TRONG ỨNG DỤNG THỰC TẾ CẦN CÓ CÁC KIỂM TRA NÀY

  return (
    <Container className="my-4">
      <Row>
        <Col md={8}>
          {/* Hiển thị thông báo lỗi hoặc cảnh báo */}
          {pageAlert && (
            <Alert variant={pageAlertVariant} onClose={() => setPageAlert(null)} dismissible>
              {pageAlert}
            </Alert>
          )}

          <h2>Thanh toán</h2>

          {/* Phần phương thức thanh toán */}
          <Card className="mb-4">
            <Card.Header as="h5">Phương thức thanh toán</Card.Header>
            <Card.Body>
              {renderPaymentMethodOptions()}

              {paymentMethod === 'cod' && <CODPayment />}
              {paymentMethod === 'paypal' && orderPlaced && orderInfo && (
                  <PayPalPayment
                      orderInfo={orderInfo}
                      onPaymentSuccess={handlePaymentSuccess}
                      onPaymentError={handlePaymentError}
                      orderPlaced={orderPlaced}
                  />
              )}
               {paymentMethod === 'paypal' && !orderPlaced && (
                <Alert variant="info">Vui lòng nhấn nút "Đặt đơn hàng" bên phải để chuẩn bị thanh toán với PayPal.</Alert>
               )}
            </Card.Body>
          </Card>

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
                      disabled={isValidatingCode || !promoCode.trim()}
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
                {(!orderPlaced || paymentMethod === 'cod') && (
                   <Button
                     type="button"
                     className="btn w-100"
                     disabled={cartItems.length === 0 || (issueVATInvoice && (!vatInfo.companyName || !vatInfo.taxCode))}
                     onClick={placeOrderHandler}
                   >
                     Đặt đơn hàng
                   </Button>
                 )}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default CheckoutPage; 