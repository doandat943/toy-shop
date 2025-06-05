import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Form, Button, Card, Accordion, Tab, Nav } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus, FaMoneyBillAlt, FaCreditCard, FaPaypal, FaTruck } from 'react-icons/fa';
import { addToCart, removeFromCart, updateCartItemQty, applyPromoCode, resetPromoCode, saveShippingAddress, savePaymentMethod } from '../slices/cartSlice';
import Message from '../components/Message';
import ImageWithFallback from '../components/ImageWithFallback';
import { formatPrice } from '../utils/formatPrice';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { cartItems, loading, error, promoCode, promoCodeError, promoCodeLoading, itemsPrice, shippingPrice, taxPrice, discountAmount, totalPrice, shippingAddress } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.user);
  
  const [promoInput, setPromoInputVal] = useState('');
  
  // Shipping form state
  const [fullName, setFullName] = useState(shippingAddress?.fullName || user?.name || '');
  const [address, setAddress] = useState(shippingAddress?.address || '');
  const [city, setCity] = useState(shippingAddress?.city || '');
  const [postalCode, setPostalCode] = useState(shippingAddress?.postalCode || '');
  const [phone, setPhone] = useState(shippingAddress?.phone || user?.phone || '');
  const [note, setNote] = useState(shippingAddress?.note || '');
  
  // Payment method state
  const [paymentMethod, setPaymentMethod] = useState('cod');
  
  // Accordion state for checkout sections
  const [activeAccordion, setActiveAccordion] = useState('cart');
  
  // Validation states
  const [validated, setValidated] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);

  useEffect(() => {
    if (id) {
      dispatch(addToCart({ id, qty: 1 }));
      navigate('/cart', { replace: true });
    }
  }, [dispatch, id, navigate]);

  const removeFromCartHandler = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const handleCartQtyChange = (item, newQtyValue) => {
    const numericDesiredQty = Number(newQtyValue);
    
    if (isNaN(numericDesiredQty)) return;

    const stock = item.stock || 1; 
    const newQty = Math.max(1, Math.min(numericDesiredQty, stock));

    if (newQty !== item.qty) {
        dispatch(updateCartItemQty({ id: item.id, qty: newQty }));
    }
  };
  
  const handleQtyInputBlur = (item, event) => {
    const stock = item.stock || 1;
    let val = Number(event.target.value);

    if (event.target.value === '' || isNaN(val) || val < 1) {
        val = 1;
    } else if (val > stock) {
        val = stock;
    }
    if (val !== item.qty) {
         dispatch(updateCartItemQty({ id: item.id, qty: val }));
    }
  };

  const applyPromoHandler = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      dispatch(applyPromoCode(promoInput));
    }
  };

  const removePromoHandler = () => {
    dispatch(resetPromoCode());
    setPromoInputVal('');
  };

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    dispatch(saveShippingAddress({
      fullName,
      address,
      city,
      postalCode,
      phone,
      note
    }));
    
    setActiveAccordion('payment');
  };
  
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    dispatch(savePaymentMethod(paymentMethod));
    setActiveAccordion('review');
  };
  
  const placeOrderHandler = () => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    
    // Place order API call would go here
    try {
      // Sample order placement code
      // Would need to be replaced with actual API call
      console.log('Order placed with:', {
        orderItems: cartItems,
        shippingAddress: {
          fullName,
          address,
          city,
          postalCode,
          phone,
          note
        },
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        discountAmount,
        totalPrice
      });
      
      // On successful order placement
      // navigate(`/order/${order.id}`);
      
    } catch (error) {
      setCheckoutError(error.message || 'There was an error placing your order.');
    }
  };
  
  const proceedToShipping = () => {
    if (!user) {
      navigate('/login?redirect=/cart');
    } else {
      setActiveAccordion('shipping');
    }
  };

  return (
    <div className="cart-page py-4">
      <h1 className="mb-4 page-title">Giỏ hàng & Thanh toán</h1>
      
      {checkoutError && (
        <Message variant="danger" dismissible onClose={() => setCheckoutError(null)}>
          {checkoutError}
        </Message>
      )}
      
      <Accordion activeKey={activeAccordion} onSelect={(k) => k && setActiveAccordion(k)}>
        {/* CART ITEMS SECTION */}
        <Accordion.Item eventKey="cart" className="mb-4">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <span className="accordion-number me-3">1</span>
              <span className="fw-bold">Giỏ hàng của bạn</span>
              {cartItems.length > 0 && <span className="ms-2 text-muted">({cartItems.reduce((acc, item) => acc + item.qty, 0)} sản phẩm)</span>}
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col lg={8}>
                {cartItems.length === 0 ? (
                  <Message variant="info">
                    Giỏ hàng của bạn đang trống. <Link to="/products">Mua sắm ngay!</Link>
                  </Message>
                ) : (
                  <ListGroup variant="flush" className="cart-items-list">
                    {cartItems.map((item) => (
                      <ListGroup.Item key={item.id} className="cart-item py-3">
                        <Row className="align-items-center">
                          <Col xs={3} sm={2} className="text-center">
                            <ImageWithFallback 
                              src={item.image} 
                              alt={item.name} 
                              fluid 
                              rounded 
                              className="cart-item-image"
                              fallbackSrc="https://placehold.co/80x80/e5e5e5/a0a0a0?text=No+Image"
                            />
                          </Col>
                          <Col xs={9} sm={3}>
                            <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                            {item.personalization && (
                              <div className="personalization-info mt-1">
                                {Object.entries(item.personalization).map(([key, value]) => (
                                  <small key={key} className="d-block text-muted">
                                    {key}: {value}
                                  </small>
                                ))}
                              </div>
                            )}
                          </Col>
                          <Col xs={5} sm={2} className="text-md-start text-end mt-2 mt-sm-0 cart-item-price">{formatPrice(item.price)}</Col>
                          <Col xs={7} sm={3} md={3} className="mt-2 mt-sm-0">
                            <div className="input-group quantity-input-group mx-auto mx-sm-0" style={{ maxWidth: '130px' }}>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                className="quantity-btn shadow-none" 
                                onClick={() => handleCartQtyChange(item, item.qty - 1)}
                                disabled={item.qty <= 1}
                              >
                                <FaMinus />
                              </Button>
                              <Form.Control
                                type="number"
                                value={item.qty}
                                onChange={(e) => handleCartQtyChange(item, e.target.value)}
                                onBlur={(e) => handleQtyInputBlur(item, e)}
                                min="1"
                                max={item.stock || 1}
                                className="text-center quantity-input shadow-none"
                                style={{ MozAppearance: 'textfield' }}
                              />
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                className="quantity-btn shadow-none"
                                onClick={() => handleCartQtyChange(item, item.qty + 1)}
                                disabled={item.qty >= (item.stock || 1)}
                              >
                                <FaPlus />
                              </Button>
                            </div>
                          </Col>
                          <Col xs={9} sm={1} md={1} className="text-md-end text-start mt-2 mt-sm-0 cart-item-subtotal"> 
                          </Col>
                          <Col xs={3} sm={1} md={1} className="text-end">
                            <Button
                              type="button"
                              variant="outline-danger" 
                              size="sm"
                              onClick={() => removeFromCartHandler(item.id)}
                              className="remove-item-btn"
                              title="Xóa sản phẩm"
                            >
                              <FaTrash />
                            </Button>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Col>
              <Col lg={4} className="mt-4 mt-lg-0">
                <Card className="summary-card shadow-sm">
                  <ListGroup variant="flush">
                    <ListGroup.Item className="summary-header">
                      <h2>Tổng cộng ({cartItems.reduce((acc, item) => acc + item.qty, 0)}) sản phẩm</h2>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Tạm tính:</Col>
                        <Col className="text-end">{formatPrice(itemsPrice)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Phí vận chuyển:</Col>
                        <Col className="text-end">{formatPrice(shippingPrice)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Thuế (VAT 10%):</Col>
                        <Col className="text-end">{formatPrice(taxPrice)}</Col>
                      </Row>
                    </ListGroup.Item>
                    
                    {discountAmount > 0 && (
                      <ListGroup.Item className="discount-row">
                        <Row>
                          <Col>Giảm giá ({promoCode?.code}):</Col>
                          <Col className="text-end text-danger">-{formatPrice(discountAmount)}</Col>
                        </Row>
                      </ListGroup.Item>
                    )}
                    
                    <ListGroup.Item className="total-row">
                      <Row>
                        <Col className="fw-bold fs-5">Tổng thanh toán:</Col>
                        <Col className="text-end fw-bold fs-5">{formatPrice(totalPrice)}</Col>
                      </Row>
                    </ListGroup.Item>
                    
                    <ListGroup.Item className="promo-code-section">
                      <Form onSubmit={applyPromoHandler}>
                        <Form.Group className="mb-2">
                          <Form.Label className="fw-medium">Mã giảm giá</Form.Label>
                          <div className="d-flex">
                            <Form.Control
                              type="text"
                              placeholder="Nhập mã"
                              value={promoInput}
                              onChange={(e) => setPromoInputVal(e.target.value)}
                              disabled={!!promoCode || promoCodeLoading}
                              className="promo-input me-2"
                            />
                            {!promoCode ? (
                              <Button
                                type="submit"
                                variant="outline-primary"
                                disabled={promoCodeLoading || !promoInput.trim()}
                                className="apply-promo-btn"
                              >
                                {promoCodeLoading ? 'Đang Xử lý...' : 'Áp dụng'}
                              </Button>
                            ) : (
                              <Button
                                type="button"
                                variant="outline-danger"
                                onClick={removePromoHandler}
                                className="remove-promo-btn"
                              >
                                Xóa mã
                              </Button>
                            )}
                          </div>
                          {promoCodeError && <small className="text-danger d-block mt-1">{promoCodeError}</small>}
                          {promoCode && (
                            <div className="mt-2 text-success applied-promo-info">
                              <small>
                                Đã áp dụng "{promoCode.code}" 
                                ({promoCode.discountType === 'percentage' 
                                  ? `Giảm ${promoCode.discountValue}%` 
                                  : promoCode.discountType === 'fixed_amount' 
                                    ? `Giảm ${formatPrice(promoCode.discountValue)}` 
                                    : 'Miễn phí vận chuyển'})
                              </small>
                            </div>
                          )}
                        </Form.Group>
                      </Form>
                    </ListGroup.Item>
                    
                    <ListGroup.Item className="checkout-btn-container">
                      <Button
                        type="button"
                        className="btn-primary w-100 proceed-checkout-btn"
                        disabled={cartItems.length === 0}
                        onClick={proceedToShipping}
                      >
                        Tiến hành đặt hàng
                      </Button>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* SHIPPING SECTION */}
        <Accordion.Item eventKey="shipping" className="mb-4">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <span className="accordion-number me-3">2</span>
              <span className="fw-bold">Thông tin giao hàng</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Row className="justify-content-center">
              <Col md={10} lg={8}>
                <Form noValidate validated={validated} onSubmit={handleShippingSubmit}>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="fullName">
                        <Form.Label>Họ tên người nhận <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập họ tên người nhận"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                        />
                        <Form.Control.Feedback type="invalid">Vui lòng nhập họ tên người nhận.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="phone">
                        <Form.Label>Số điện thoại <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="Nhập số điện thoại"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                        />
                        <Form.Control.Feedback type="invalid">Vui lòng nhập số điện thoại.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-3" controlId="address">
                    <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Nhập địa chỉ"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                    <Form.Control.Feedback type="invalid">Vui lòng nhập địa chỉ.</Form.Control.Feedback>
                  </Form.Group>

                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3" controlId="city">
                        <Form.Label>Thành phố / Tỉnh <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập thành phố/tỉnh"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          required
                        />
                        <Form.Control.Feedback type="invalid">Vui lòng nhập thành phố/tỉnh.</Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3" controlId="postalCode">
                        <Form.Label>Mã bưu điện</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Nhập mã bưu điện (nếu có)"
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4" controlId="note">
                    <Form.Label>Ghi chú</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Ghi chú về đơn hàng, ví dụ: thời gian hay chỉ dẫn địa điểm giao hàng chi tiết hơn."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                    />
                  </Form.Group>

                  <div className="d-flex justify-content-between">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setActiveAccordion('cart')}
                      className="px-4"
                    >
                      Quay lại
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                      className="px-4"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* PAYMENT METHOD SECTION */}
        <Accordion.Item eventKey="payment" className="mb-4">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <span className="accordion-number me-3">3</span>
              <span className="fw-bold">Phương thức thanh toán</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Row className="justify-content-center">
              <Col md={10} lg={8}>
                <Form onSubmit={handlePaymentSubmit}>
                  <div className="payment-methods-container mb-4">
                    <Form.Group>
                      <div className="payment-method-options">
                        <div className="payment-option mb-3">
                          <Form.Check
                            type="radio"
                            id="cod"
                            name="paymentMethod"
                            label={
                              <div className="d-flex align-items-center">
                                <FaMoneyBillAlt className="me-2 text-success" />
                                <span>Thanh toán khi nhận hàng (COD)</span>
                              </div>
                            }
                            value="cod"
                            checked={paymentMethod === 'cod'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="payment-radio"
                          />
                          {paymentMethod === 'cod' && (
                            <div className="payment-method-description mt-2 ms-4 ps-2">
                              <small className="text-muted">
                                Bạn sẽ thanh toán bằng tiền mặt khi nhận được hàng.
                              </small>
                            </div>
                          )}
                        </div>

                        <div className="payment-option mb-3">
                          <Form.Check
                            type="radio"
                            id="bank_transfer"
                            name="paymentMethod"
                            label={
                              <div className="d-flex align-items-center">
                                <FaCreditCard className="me-2 text-primary" />
                                <span>Chuyển khoản ngân hàng</span>
                              </div>
                            }
                            value="bank_transfer"
                            checked={paymentMethod === 'bank_transfer'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="payment-radio"
                          />
                          {paymentMethod === 'bank_transfer' && (
                            <div className="payment-method-description mt-2 ms-4 ps-2">
                              <small className="text-muted">
                                Thông tin tài khoản ngân hàng sẽ được hiển thị sau khi đặt hàng thành công.
                              </small>
                            </div>
                          )}
                        </div>

                        <div className="payment-option">
                          <Form.Check
                            type="radio"
                            id="paypal"
                            name="paymentMethod"
                            label={
                              <div className="d-flex align-items-center">
                                <FaPaypal className="me-2 text-info" />
                                <span>PayPal / Thẻ tín dụng</span>
                              </div>
                            }
                            value="paypal"
                            checked={paymentMethod === 'paypal'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="payment-radio"
                          />
                          {paymentMethod === 'paypal' && (
                            <div className="payment-method-description mt-2 ms-4 ps-2">
                              <small className="text-muted">
                                Bạn sẽ được chuyển đến trang PayPal để hoàn tất thanh toán an toàn.
                              </small>
                            </div>
                          )}
                        </div>
                      </div>
                    </Form.Group>
                  </div>

                  <div className="d-flex justify-content-between">
                    <Button
                      variant="outline-secondary"
                      onClick={() => setActiveAccordion('shipping')}
                      className="px-4"
                    >
                      Quay lại
                    </Button>
                    <Button 
                      type="submit" 
                      variant="primary"
                      className="px-4"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </Form>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>

        {/* ORDER REVIEW SECTION */}
        <Accordion.Item eventKey="review">
          <Accordion.Header>
            <div className="d-flex align-items-center">
              <span className="accordion-number me-3">4</span>
              <span className="fw-bold">Xác nhận đặt hàng</span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Row>
              <Col md={8}>
                <Card className="mb-4 shadow-sm">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">Thông tin đơn hàng</h5>
                  </Card.Header>
                  <Card.Body>
                    <ListGroup variant="flush" className="order-items-list">
                      {cartItems.map((item) => (
                        <ListGroup.Item key={item.id} className="px-0 py-3 border-bottom">
                          <Row className="align-items-center">
                            {/* Image Column */}
                            <Col xs={3} sm={2} className="text-center mb-2 mb-sm-0">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                fluid
                                rounded
                                style={{ maxHeight: '80px', objectFit: 'contain', margin: '0 auto' }}
                                fallbackSrc="https://placehold.co/80x80/e5e5e5/a0a0a0?text=No+Image"
                              />
                            </Col>

                            {/* Product Details Column */}
                            <Col xs={9} sm={7}>
                              <Link to={`/product/${item.id}`} className="fw-bold text-decoration-none text-dark d-block mb-1" style={{ fontSize: '0.95rem' }}>
                                {item.name}
                              </Link>
                              {item.personalization && (
                                <div className="personalization-info mb-1">
                                  {Object.entries(item.personalization).map(([key, value]) => (
                                    <small key={key} className="d-block text-muted" style={{ fontSize: '0.8rem' }}>
                                      {key}: {value}
                                    </small>
                                  ))}
                                </div>
                              )}
                              <small className="text-muted d-block">Giá: {formatPrice(item.price)}</small>
                              <small className="text-muted">Số lượng: {item.qty}</small>
                            </Col>

                            {/* Subtotal Column */}
                            <Col xs={12} sm={3} className="text-sm-end mt-2 mt-sm-0">
                              <span className="fw-bold" style={{fontSize: '0.95rem'}}>{formatPrice(item.price * item.qty)}</span>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </Card.Body>
                </Card>
                
                <Row>
                  <Col md={6}>
                    <Card className="mb-4 mb-md-0 shadow-sm h-100">
                      <Card.Header className="bg-light d-flex align-items-center">
                        <FaTruck className="me-2" />
                        <h5 className="mb-0">Thông tin giao hàng</h5>
                      </Card.Header>
                      <Card.Body>
                        <p className="mb-1"><strong>{fullName}</strong></p>
                        <p className="mb-1">{phone}</p>
                        <p className="mb-1">{address}</p>
                        <p className="mb-1">{city}{postalCode ? `, ${postalCode}` : ''}</p>
                        {note && (
                          <div className="mt-3">
                            <strong>Ghi chú:</strong>
                            <p className="mb-0 text-muted">{note}</p>
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6} className="mt-4 mt-md-0">
                    <Card className="shadow-sm h-100">
                      <Card.Header className="bg-light d-flex align-items-center">
                        {paymentMethod === 'cod' && <FaMoneyBillAlt className="me-2" />}
                        {paymentMethod === 'bank_transfer' && <FaCreditCard className="me-2" />}
                        {paymentMethod === 'paypal' && <FaPaypal className="me-2" />}
                        <h5 className="mb-0">Phương thức thanh toán</h5>
                      </Card.Header>
                      <Card.Body>
                        {paymentMethod === 'cod' && <p className="mb-0">Thanh toán khi nhận hàng (COD)</p>}
                        {paymentMethod === 'bank_transfer' && <p className="mb-0">Chuyển khoản ngân hàng</p>}
                        {paymentMethod === 'paypal' && <p className="mb-0">PayPal / Thẻ tín dụng</p>}
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Col>

              <Col md={4}>
                <Card className="order-summary-card shadow-sm">
                  <Card.Header className="bg-light">
                    <h5 className="mb-0">Tổng đơn hàng</h5>
                  </Card.Header>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <Row>
                        <Col>Tạm tính:</Col>
                        <Col className="text-end">{formatPrice(itemsPrice)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Phí vận chuyển:</Col>
                        <Col className="text-end">{formatPrice(shippingPrice)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <Row>
                        <Col>Thuế (VAT 10%):</Col>
                        <Col className="text-end">{formatPrice(taxPrice)}</Col>
                      </Row>
                    </ListGroup.Item>
                    {discountAmount > 0 && (
                      <ListGroup.Item className="discount-row">
                        <Row>
                          <Col>Giảm giá{promoCode?.code ? ` (${promoCode.code})` : ''}:</Col>
                          <Col className="text-end text-danger">-{formatPrice(discountAmount)}</Col>
                        </Row>
                      </ListGroup.Item>
                    )}
                    <ListGroup.Item className="total-row">
                      <Row>
                        <Col className="fw-bold fs-5">Tổng thanh toán:</Col>
                        <Col className="text-end fw-bold fs-5">{formatPrice(totalPrice)}</Col>
                      </Row>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <div className="d-grid gap-2">
                        <Button
                          type="button"
                          variant="outline-secondary"
                          className="mb-2"
                          onClick={() => setActiveAccordion('payment')}
                        >
                          Quay lại
                        </Button>
                        <Button
                          type="button"
                          variant="primary"
                          size="lg"
                          onClick={placeOrderHandler}
                          disabled={cartItems.length === 0}
                          className="place-order-btn"
                        >
                          Đặt hàng
                        </Button>
                      </div>
                    </ListGroup.Item>
                  </ListGroup>
                </Card>
              </Col>
            </Row>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <style jsx global>{`
        .cart-page .page-title {
          color: #333;
          font-weight: 600;
          border-bottom: 2px solid #FF6B6B;
          display: inline-block;
          padding-bottom: 0.25rem;
        }
        .accordion-number {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          background-color: #FF6B6B;
          color: white;
          border-radius: 50%;
          font-weight: 600;
          font-size: 14px;
        }
        .summary-card, .order-summary-card {
          border: 0;
          box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
          border-radius: 0.5rem;
        }
        .summary-header, .summary-header h2 {
          background: #f8f9fa;
          border-radius: 0.5rem 0.5rem 0 0;
          font-size: 1.15rem;
          font-weight: 600;
        }
        .cart-items-list, .order-items-list {
          border-radius: 0.5rem;
        }
        .cart-item-image {
          max-height: 80px;
          object-fit: cover;
        }
        .cart-item-name {
          font-weight: 500;
          color: #333;
          text-decoration: none;
        }
        .cart-item-name:hover {
          color: #FF6B6B;
        }
        .cart-item-price {
          font-weight: 500;
          color: #333;
        }
        .total-row {
          background-color: #fafafa;
        }
        .discount-row {
          background-color: #fff9f9;
        }
        .quantity-input-group {
          border-radius: 0.25rem;
        }
        .quantity-btn {
          border-color: #dee2e6;
        }
        .quantity-input {
          border-left: 0;
          border-right: 0;
          text-align: center;
        }
        .quantity-input:focus {
          box-shadow: none;
          border-color: #dee2e6;
        }
        .quantity-input::-webkit-outer-spin-button,
        .quantity-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .remove-item-btn {
          padding: 0.35rem 0.5rem;
          border-color: #dee2e6;
        }
        .order-item-name {
          font-size: 0.9rem;
          font-weight: 500;
        }
        .accordion-button:not(.collapsed) {
          background-color: #f8f9fa;
          color: #333;
          box-shadow: none;
        }
        .accordion-button:focus {
          box-shadow: none;
          border-color: #dee2e6;
        }
        .payment-option {
          padding: 0.75rem;
          border: 1px solid #dee2e6;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .payment-option:hover {
          border-color: #ced4da;
        }
        .payment-radio {
          font-weight: 500;
        }
        .place-order-btn {
          font-weight: 600;
          padding: 0.75rem;
          background-color: #FF6B6B;
          border-color: #FF6B6B;
        }
        .place-order-btn:hover {
          background-color: #e05252;
          border-color: #e05252;
        }
      `}</style>
    </div>
  );
};

export default CartPage; 