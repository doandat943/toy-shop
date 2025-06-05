import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';
import { addToCart, removeFromCart, updateCartItemQty, applyPromoCode, resetPromoCode } from '../slices/cartSlice';
import Message from '../components/Message';
import ImageWithFallback from '../components/ImageWithFallback';
import { formatPrice } from '../utils/formatPrice';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { cartItems, loading, error, promoCode, promoCodeError, promoCodeLoading, itemsPrice, shippingPrice, taxPrice, discountAmount, totalPrice } = useSelector((state) => state.cart);
  const [promoInput, setPromoInputVal] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(addToCart({ id, qty: 1 }));
      navigate('/cart', { replace: true });
    }
  }, [dispatch, id, navigate]);

  const removeFromCartHandler = (itemId) => {
    dispatch(removeFromCart(itemId));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
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

  return (
    <div className="cart-page py-4">
      <h1 className="mb-4 page-title">Giỏ hàng</h1>
      <Row>
        <Col md={8}>
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
        <Col md={4} className="mt-4 mt-md-0">
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
              
              <ListGroup.Item className="checkout-button-container">
                <Button
                  type="button"
                  className="btn-block w-100 btn-lg checkout-btn"
                  disabled={cartItems.length === 0}
                  onClick={checkoutHandler}
                >
                  TIẾN HÀNH THANH TOÁN
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
      <style jsx global>{`
        .cart-page .page-title {
          color: #333;
          font-weight: 600;
          border-bottom: 2px solid #FF6B6B;
          display: inline-block;
          padding-bottom: 0.25rem;
          margin-bottom: 1.5rem !important;
        }
        .cart-items-list .list-group-item.cart-item {
          border-bottom: 1px solid #eee;
        }
        .cart-items-list .list-group-item.cart-item:last-child {
          border-bottom: none;
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
        .personalization-info small {
          font-size: 0.8rem;
        }
        .cart-item-price, .cart-item-subtotal {
          font-weight: 500;
        }
        .remove-item-btn {
          padding: 0.25rem 0.5rem;
          font-size: 0.9rem;
        }
        .remove-item-btn:hover {
          background-color: #dc3545 !important;
          color: white !important;
        }

        .quantity-input-group {
          display: inline-flex; 
          align-items: stretch; 
          border: 1px solid #dee2e6; 
          border-radius: 20px; 
          background-color: #fff; 
          overflow: hidden; 
          max-width: 120px;
        }
        .quantity-input-group .form-control.quantity-input {
          border: none !important; 
          text-align: center;
          height: auto; 
          line-height: 1.5; 
          padding: 0.3rem 0.25rem;
          flex-grow: 1; 
          min-width: 30px;
          font-size: 0.9rem;
          background-color: transparent; 
          color: #495057; 
          box-shadow: none !important;
          appearance: textfield; 
          -moz-appearance: textfield; 
        }
        .quantity-input-group .form-control.quantity-input::-webkit-outer-spin-button,
        .quantity-input-group .form-control.quantity-input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .quantity-input-group .quantity-btn {
          width: 35px; 
          height: auto; 
          border: none !important; 
          color: #6c757d; 
          background-color: transparent; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          padding: 0.3rem 0;
          font-size: 0.8rem;
          transition: background-color 0.15s ease-in-out, color 0.15s ease-in-out;
          cursor: pointer;
          box-shadow: none !important;
        }
        .quantity-input-group .quantity-btn:hover {
          background-color: #f8f9fa; 
          color: #FF6B6B; 
        }
        .quantity-input-group .quantity-btn:disabled {
          background-color: transparent; 
          color: #adb5bd; 
          cursor: not-allowed;
        }
        .quantity-input-group .quantity-btn:focus {
          outline: none;
          box-shadow: none; 
        }

        .summary-card {
          border-radius: 0.5rem;
        }
        .summary-card .list-group-item {
          padding: 0.85rem 1.25rem;
        }
        .summary-header h2 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
        }
        .discount-row .text-danger {
          font-weight: 500;
        }
        .total-row .fw-bold {
          color: #FF6B6B;
        }
        .promo-code-section .form-label {
          font-size: 0.95rem;
        }
        .promo-input {
           font-size: 0.9rem;
        }
        .apply-promo-btn, .remove-promo-btn {
          font-size: 0.9rem;
          padding: 0.375rem 0.65rem;
        }
        .applied-promo-info small {
          font-size: 0.85rem;
        }
        .checkout-button-container {
          padding: 1rem 1.25rem !important;
        }
        .checkout-btn {
           background: linear-gradient(135deg, #FF6B6B, #FF8E53);
           border: none;
           font-weight: 600;
        }
        .checkout-btn:hover {
           background: linear-gradient(135deg, #FF8E53, #FF6B6B);
        }
      `}</style>
    </div>
  );
};

export default CartPage; 