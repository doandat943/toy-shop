import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Form, Button, Card, Accordion, Tab, Nav, Spinner, Alert } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus, FaMoneyBillAlt, FaCreditCard, FaPaypal, FaTruck, FaQrcode } from 'react-icons/fa';
import { addToCart, removeFromCart, updateCartItemQty, applyPromoCode, resetPromoCode, saveShippingAddress, savePaymentMethod, clearCart } from '../slices/cartSlice';
import Message from '../components/Message';
import ImageWithFallback from '../components/ImageWithFallback';
import { formatPrice } from '../utils/formatPrice';
import MoMoPayment from '../components/MoMoPayment';
import axios from 'axios';

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
  
  // GHN shipping state
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(shippingAddress?.provinceId || '');
  const [selectedDistrict, setSelectedDistrict] = useState(shippingAddress?.districtId || '');
  const [selectedWard, setSelectedWard] = useState(shippingAddress?.wardCode || '');
  const [shippingServices, setShippingServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [shippingFee, setShippingFee] = useState(0);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);
  
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
  
  // Fetch provinces on component mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingLocation(true);
        const { data } = await axios.get('/api/shipping/provinces');
        if (data.success && data.data) {
          setProvinces(data.data);
        } else {
          console.error('Failed to fetch provinces:', data);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setDistricts([]);
      setSelectedDistrict('');
      return;
    }

    const fetchDistricts = async () => {
      try {
        setLoadingLocation(true);
        const { data } = await axios.get(`/api/shipping/districts/${selectedProvince}`);
        if (data.success && data.data) {
          setDistricts(data.data);
          // Reset district and ward when province changes
          if (selectedDistrict) {
            setSelectedDistrict('');
            setSelectedWard('');
            setShippingServices([]);
            setSelectedService('');
          }
        }
      } catch (error) {
        console.error('Error fetching districts:', error);
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchDistricts();
  }, [selectedProvince]);

  // Fetch wards when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setWards([]);
      setSelectedWard('');
      return;
    }

    const fetchWards = async () => {
      try {
        setLoadingLocation(true);
        const { data } = await axios.get(`/api/shipping/wards/${selectedDistrict}`);
        if (data.success && data.data) {
          setWards(data.data);
          // Reset ward when district changes
          if (selectedWard) {
            setSelectedWard('');
            setShippingServices([]);
            setSelectedService('');
          }
        }
      } catch (error) {
        console.error('Error fetching wards:', error);
      } finally {
        setLoadingLocation(false);
      }
    };

    fetchWards();
  }, [selectedDistrict]);
  
  // Fetch shipping services when district and ward are selected
  useEffect(() => {
    if (!selectedDistrict || !selectedWard) {
      setShippingServices([]);
      setSelectedService('');
      return;
    }
    
    const fetchShippingServices = async () => {
      try {
        setLoadingServices(true);
        // Assume shop is in district 1454 (for example)
        const fromDistrictId = 1454;
        
        const { data } = await axios.post('/api/shipping/services', {
          fromDistrictId,
          toDistrictId: parseInt(selectedDistrict)
        });
        
        if (data.success && data.data && data.data.length > 0) {
          setShippingServices(data.data);
          // Select first service by default
          setSelectedService(data.data[0].service_id);
        } else {
          setShippingServices([]);
        }
      } catch (error) {
        console.error('Error fetching shipping services:', error);
      } finally {
        setLoadingServices(false);
      }
    };
    
    fetchShippingServices();
  }, [selectedDistrict, selectedWard]);
  
  // Calculate shipping fee when service is selected
  useEffect(() => {
    if (!selectedService || !selectedDistrict || !selectedWard) {
      setShippingFee(0);
      return;
    }
    
    const calculateShippingFee = async () => {
      try {
        setLoadingServices(true);
        // Assume shop is in district 1454 and ward code 21012 (for example)
        const fromDistrictId = 1454;
        const fromWardCode = '21012';
        
        const { data } = await axios.post('/api/shipping/calculate', {
          serviceId: selectedService,
          fromDistrictId,
          fromWardCode,
          toDistrictId: parseInt(selectedDistrict),
          toWardCode: selectedWard,
          weight: 500, // Default weight in grams
          length: 15,
          width: 15,
          height: 10
        });
        
        if (data.success && data.data) {
          setShippingFee(data.data.total || 0);
        } else {
          setShippingFee(0);
        }
      } catch (error) {
        console.error('Error calculating shipping fee:', error);
        setShippingFee(0);
      } finally {
        setLoadingServices(false);
      }
    };
    
    calculateShippingFee();
  }, [selectedService, selectedDistrict, selectedWard]);

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
    
    // Validate GHN required fields
    if (!selectedProvince || !selectedDistrict || !selectedWard) {
      alert('Vui lòng chọn đầy đủ Tỉnh/Thành phố, Quận/Huyện và Phường/Xã');
      return;
    }
    
    // Find names for selected locations
    const provinceName = provinces.find(p => p.ProvinceID.toString() === selectedProvince)?.ProvinceName || '';
    const districtName = districts.find(d => d.DistrictID.toString() === selectedDistrict)?.DistrictName || '';
    const wardName = wards.find(w => w.WardCode === selectedWard)?.WardName || '';
    
    dispatch(saveShippingAddress({
      fullName,
      address,
      city,
      postalCode,
      phone,
      note,
      provinceId: selectedProvince,
      provinceName,
      districtId: selectedDistrict,
      districtName,
      wardCode: selectedWard,
      wardName
    }));
    
    setActiveAccordion('payment');
  };
  
  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    // Validate shipping service selection
    if (!selectedService) {
      alert('Vui lòng chọn dịch vụ vận chuyển');
      return;
    }
    
    dispatch(savePaymentMethod(paymentMethod));
    setActiveAccordion('review');
  };
  
  const calculateTotalPrice = () => {
    // Tính tổng tiền bao gồm phí vận chuyển GHN
    return itemsPrice + taxPrice + (selectedService ? shippingFee : 0) - discountAmount;
  };
  
  const placeOrderHandler = async () => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    
    try {
      setCheckoutError(null);
      
      // Get selected shipping service name
      const serviceName = shippingServices.find(s => s.service_id === parseInt(selectedService))?.short_name || '';
      
      // Prepare order data with modified cart items
      const orderData = {
        orderItems: cartItems.map(item => ({
          ...item,
          product: item.id,
          qty: item.qty
        })),
        shippingAddress: {
          fullName,
          address,
          city,
          postalCode,
          phone,
          note,
          provinceId: selectedProvince,
          provinceName: provinces.find(p => p.ProvinceID.toString() === selectedProvince)?.ProvinceName || '',
          districtId: selectedDistrict,
          districtName: districts.find(d => d.DistrictID.toString() === selectedDistrict)?.DistrictName || '',
          wardCode: selectedWard,
          wardName: wards.find(w => w.WardCode === selectedWard)?.WardName || ''
        },
        shippingService: {
          serviceId: selectedService,
          serviceName: serviceName,
          fee: shippingFee
        },
        paymentMethod,
        itemsPrice,
        shippingPrice: shippingFee,
        taxPrice,
        discountAmount,
        totalPrice: calculateTotalPrice()
      };
      
      // Create the order
      const { data } = await axios.post('/api/orders', orderData);
      
      // If MoMo payment method is selected, redirect to MoMo payment page
      if (paymentMethod === 'momo') {
        try {
          console.log('Creating MoMo payment for order:', data.order.id);
          
          const res = await axios.post('/api/payment/create-momo-payment', {
            orderId: data.order.id,
            amount: calculateTotalPrice(),
            orderInfo: `Thanh toán đơn hàng #${data.order.id}`
          });
          
          // Clear cart after successful order placement
          dispatch(clearCart());
          
          console.log('MoMo payment response:', res.data);
          
          if (res.data && res.data.success && res.data.data && res.data.data.payUrl) {
            // Open MoMo payment URL in same window
            console.log('Redirecting to MoMo payment URL:', res.data.data.payUrl);
            window.open(res.data.data.payUrl, '_self');
          } else {
            throw new Error('Không nhận được URL thanh toán từ MoMo');
          }
        } catch (error) {
          console.error('Error creating MoMo payment:', error);
          setCheckoutError(
            error.response?.data?.message || 
            'Có lỗi xảy ra khi tạo thanh toán MoMo. Vui lòng kiểm tra lại.'
          );
          // Vẫn tiếp tục đến trang chi tiết đơn hàng trong trường hợp lỗi
          navigate(`/order/${data.order.id}`);
        }
      } else {
        // For other payment methods, clear cart and navigate to order details page
        dispatch(clearCart());
        navigate(`/order/${data.order.id}`);
      }
      
    } catch (error) {
      setCheckoutError(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng.');
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
                        <Col className="text-end">
                          {selectedService ? (
                            loadingServices ? (
                              <Spinner animation="border" size="sm" />
                            ) : (
                              formatPrice(shippingFee)
                            )
                          ) : (
                            'Sẽ tính ở bước sau'
                          )}
                        </Col>
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
                        <Col className="text-end fw-bold fs-5">
                          {selectedService ? formatPrice(calculateTotalPrice()) : formatPrice(totalPrice)}
                        </Col>
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
                    <Col md={12} className="mb-3">
                      <Form.Group controlId="province">
                        <Form.Label>Tỉnh/Thành phố <span className="text-danger">*</span></Form.Label>
                        {loadingLocation && !provinces.length ? (
                          <div className="text-center py-2">
                            <Spinner animation="border" size="sm" /> Đang tải...
                          </div>
                        ) : (
                          <Form.Control
                            as="select"
                            value={selectedProvince}
                            onChange={(e) => setSelectedProvince(e.target.value)}
                            required
                          >
                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                            {provinces.map((province) => (
                              <option key={province.ProvinceID} value={province.ProvinceID}>
                                {province.ProvinceName}
                              </option>
                            ))}
                          </Form.Control>
                        )}
                        <Form.Control.Feedback type="invalid">
                          Vui lòng chọn Tỉnh/Thành phố.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="district">
                        <Form.Label>Quận/Huyện <span className="text-danger">*</span></Form.Label>
                        {loadingLocation && selectedProvince && !districts.length ? (
                          <div className="text-center py-2">
                            <Spinner animation="border" size="sm" /> Đang tải...
                          </div>
                        ) : (
                          <Form.Control
                            as="select"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            disabled={!selectedProvince}
                            required
                          >
                            <option value="">-- Chọn Quận/Huyện --</option>
                            {districts.map((district) => (
                              <option key={district.DistrictID} value={district.DistrictID}>
                                {district.DistrictName}
                              </option>
                            ))}
                          </Form.Control>
                        )}
                        <Form.Control.Feedback type="invalid">
                          Vui lòng chọn Quận/Huyện.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="ward">
                        <Form.Label>Phường/Xã <span className="text-danger">*</span></Form.Label>
                        {loadingLocation && selectedDistrict && !wards.length ? (
                          <div className="text-center py-2">
                            <Spinner animation="border" size="sm" /> Đang tải...
                          </div>
                        ) : (
                          <Form.Control
                            as="select"
                            value={selectedWard}
                            onChange={(e) => setSelectedWard(e.target.value)}
                            disabled={!selectedDistrict}
                            required
                          >
                            <option value="">-- Chọn Phường/Xã --</option>
                            {wards.map((ward) => (
                              <option key={ward.WardCode} value={ward.WardCode}>
                                {ward.WardName}
                              </option>
                            ))}
                          </Form.Control>
                        )}
                        <Form.Control.Feedback type="invalid">
                          Vui lòng chọn Phường/Xã.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Row>
                    <Col md={8}>
                      <Form.Group className="mb-3" controlId="city">
                        <Form.Label>Thông tin bổ sung</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Thông tin bổ sung (nếu có)"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                        />
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
                  {/* Shipping Service Selection */}
                  <Card className="mb-4">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">Dịch vụ vận chuyển</h5>
                    </Card.Header>
                    <Card.Body>
                      {!selectedDistrict || !selectedWard ? (
                        <Alert variant="info">
                          Vui lòng chọn đầy đủ thông tin địa chỉ ở bước trước để xem các dịch vụ vận chuyển
                        </Alert>
                      ) : loadingServices ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" />
                          <p className="mt-2">Đang tải dịch vụ vận chuyển...</p>
                        </div>
                      ) : shippingServices.length === 0 ? (
                        <Alert variant="warning">
                          Không tìm thấy dịch vụ vận chuyển cho khu vực này
                        </Alert>
                      ) : (
                        <>
                          <Form.Group>
                            <Form.Label>Chọn dịch vụ vận chuyển:</Form.Label>
                            <div className="shipping-services-list">
                              {shippingServices.map((service) => (
                                <Form.Check
                                  type="radio"
                                  key={service.service_id}
                                  id={`service-${service.service_id}`}
                                  name="shippingService"
                                  label={
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                      <span>{service.short_name}</span>
                                      <span className="fw-bold">
                                        {loadingServices && selectedService === service.service_id ? (
                                          <Spinner animation="border" size="sm" />
                                        ) : (
                                          formatPrice(service.service_id === parseInt(selectedService) ? shippingFee : 0)
                                        )}
                                      </span>
                                    </div>
                                  }
                                  checked={selectedService === service.service_id.toString()}
                                  onChange={() => setSelectedService(service.service_id.toString())}
                                  className="mb-2 p-2 border-bottom"
                                />
                              ))}
                            </div>
                          </Form.Group>

                          {selectedService && (
                            <div className="mt-3">
                              <p className="mb-1"><strong>Phí vận chuyển:</strong> {formatPrice(shippingFee)}</p>
                              <p className="text-muted small">
                                Thời gian giao hàng dự kiến: 2-3 ngày làm việc
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </Card.Body>
                  </Card>

                  <div className="payment-methods-container mb-4">
                    <h5 className="mb-3">Phương thức thanh toán</h5>
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

                        <div className="payment-option mb-3">
                          <Form.Check
                            type="radio"
                            id="momo"
                            name="paymentMethod"
                            label={
                              <div className="d-flex align-items-center">
                                <FaQrcode className="me-2 text-danger" />
                                <span>Thanh toán qua MoMo</span>
                              </div>
                            }
                            value="momo"
                            checked={paymentMethod === 'momo'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="payment-radio"
                          />
                          {paymentMethod === 'momo' && (
                            <div className="payment-method-description mt-2 ms-4 ps-2">
                              <small className="text-muted">
                                Thanh toán bằng ví điện tử MoMo thông qua QR Code hoặc ứng dụng.
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
            {checkoutError && (
              <Alert variant="danger" className="mb-4">{checkoutError}</Alert>
            )}
            <Row>
              <Col md={8}>
                <div className="mb-4">
                  <h5 className="mb-3 border-bottom pb-2">Thông tin đơn hàng</h5>
                  <ListGroup variant="flush" className="product-list mb-4">
                    {cartItems.map(item => (
                      <ListGroup.Item key={item.id} className="px-0 py-3 border-bottom">
                        <Row className="align-items-center">
                          <Col xs={3} md={2}>
                            <div className="product-image-container">
                              <ImageWithFallback 
                                src={item.image} 
                                fallbackSrc="/images/placeholder.png" 
                                alt={item.name}
                                className="img-fluid rounded"
                              />
                            </div>
                          </Col>
                          <Col xs={9} md={7}>
                            <div className="product-info">
                              <Link to={`/product/${item.id}`} className="product-name">{item.name}</Link>
                              <div className="text-muted small">Giá: {formatPrice(item.price)}</div>
                              <div className="text-muted small">Số lượng: {item.qty}</div>
                            </div>
                          </Col>
                          <Col xs={12} md={3} className="text-end mt-2 mt-md-0">
                            <div className="fw-medium">{formatPrice(item.price * item.qty)}</div>
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>

                  <Row className="gx-5">
                    <Col md={6}>
                      <div className="info-card p-0 mb-4">
                        <h6 className="mb-3 border-bottom pb-2">
                          <FaTruck className="me-2 text-muted" /> Thông tin giao hàng
                        </h6>
                        <div className="py-1">
                          <p className="mb-1"><strong>{fullName}</strong></p>
                          <p className="mb-1">{phone}</p>
                          <p className="mb-1">{address}</p>
                          <p className="mb-1">
                            {wards.find(w => w.WardCode === selectedWard)?.WardName}, {districts.find(d => d.DistrictID.toString() === selectedDistrict)?.DistrictName}, {provinces.find(p => p.ProvinceID.toString() === selectedProvince)?.ProvinceName}
                          </p>
                          {note && <p className="mb-0 text-muted small fst-italic">Ghi chú: {note}</p>}
                        </div>
                      </div>
                    </Col>
                    
                    <Col md={6}>
                      <div className="info-card p-0">
                        <h6 className="mb-3 border-bottom pb-2">
                          <FaMoneyBillAlt className="me-2 text-muted" /> Phương thức thanh toán
                        </h6>
                        <div className="py-1">
                          {paymentMethod === 'cod' && (
                            <div className="d-flex align-items-center">
                              <FaMoneyBillAlt className="me-2 text-success" />
                              <span>Thanh toán khi nhận hàng (COD)</span>
                            </div>
                          )}
                          {paymentMethod === 'momo' && (
                            <div className="d-flex align-items-center">
                              <FaQrcode className="me-2 text-danger" />
                              <span>Thanh toán qua MoMo</span>
                            </div>
                          )}
                          {paymentMethod === 'paypal' && (
                            <div className="d-flex align-items-center">
                              <FaPaypal className="me-2 text-primary" />
                              <span>Thanh toán qua PayPal</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Col>
              
              <Col md={4}>
                <div className="order-summary">
                  <h5 className="mb-3">Tổng đơn hàng</h5>
                  <div className="order-summary-content p-3 border rounded bg-light">
                    <div className="py-2 d-flex justify-content-between">
                      <span>Tạm tính:</span>
                      <span>{formatPrice(itemsPrice)}</span>
                    </div>
                    <div className="py-2 d-flex justify-content-between">
                      <span>Phí vận chuyển:</span>
                      <span>
                        {selectedService ? (
                          loadingServices ? (
                            <Spinner animation="border" size="sm" />
                          ) : (
                            formatPrice(shippingFee)
                          )
                        ) : (
                          '0 ₫'
                        )}
                      </span>
                    </div>
                    <div className="py-2 d-flex justify-content-between">
                      <span>Thuế (VAT 10%):</span>
                      <span>{formatPrice(taxPrice)}</span>
                    </div>
                    
                    {discountAmount > 0 && (
                      <div className="py-2 d-flex justify-content-between text-danger">
                        <span>Giảm giá:</span>
                        <span>-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    
                    <hr className="my-2" />
                    
                    <div className="py-2 d-flex justify-content-between fw-bold">
                      <span className="fs-5">Tổng thanh toán:</span>
                      <span className="fs-5 text-primary">
                        {selectedService ? formatPrice(calculateTotalPrice()) : formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="d-grid gap-2 mt-4">
                    <Button type="button" className="btn-primary order-btn" size="lg" onClick={placeOrderHandler}>
                      ĐẶT HÀNG
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline-secondary"
                      onClick={() => setActiveAccordion('payment')}
                    >
                      QUAY LẠI
                    </Button>
                  </div>
                </div>
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
        .summary-card, .order-summary-card, .order-total-card {
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
        .cart-items-list, .order-items-list, .product-list {
          border-radius: 0.5rem;
        }
        .cart-item-image, .product-image-container img {
          max-height: 80px;
          object-fit: cover;
        }
        .cart-item-name, .product-name {
          font-weight: 500;
          color: #333;
          text-decoration: none;
        }
        .cart-item-name:hover, .product-name:hover {
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
        }
        /* Disable input number arrows for quantity field */
        .quantity-input::-webkit-outer-spin-button,
        .quantity-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .payment-radio {
          cursor: pointer;
        }
        .payment-method-options {
          border: 1px solid #dee2e6;
          border-radius: 0.5rem;
          padding: 1rem;
          background-color: #fafafa;
        }
        .payment-option {
          padding: 0.5rem 0;
        }
        .proceed-checkout-btn {
          background-color: #FF6B6B;
          border-color: #FF6B6B;
          padding: 0.75rem 1rem;
        }
        .proceed-checkout-btn:hover {
          background-color: #ff5252;
          border-color: #ff5252;
        }
        .info-card {
          background: #fff;
          border-radius: 0.5rem;
        }
        .product-list .list-group-item:last-child {
          border-bottom: none !important;
        }
        .order-total-card {
          background: #f8f9fa;
          border-radius: 0.5rem;
        }
        .order-summary h5 {
          font-weight: 600;
        }
        .order-summary-content {
          background: #f8f9fa;
        }
        .order-btn {
          background-color: #FF6B6B;
          border-color: #FF6B6B;
          font-weight: 600;
        }
        .order-btn:hover {
          background-color: #ff5252;
          border-color: #ff5252;
        }
        .product-info .product-name {
          display: block;
          margin-bottom: 5px;
        }
      `}</style>
    </div>
  );
};

export default CartPage; 