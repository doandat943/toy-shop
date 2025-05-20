import React, { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, ListGroup, Image, Form, Button, Card } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { addToCart, removeFromCart, updateCartItemQty, applyPromoCode, resetPromoCode } from '../slices/cartSlice';
import Message from '../components/Message';
import { formatPrice } from '../utils/formatPrice';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();

  const { cartItems, loading, error, promoCode, promoCodeError, promoCodeLoading, itemsPrice, shippingPrice, taxPrice, discountAmount, totalPrice } = useSelector((state) => state.cart);
  const [promoInput, setPromoInput] = React.useState('');

  useEffect(() => {
    if (id) {
      dispatch(addToCart({ id, qty: 1 }));
      navigate('/cart');
    }
  }, [dispatch, id, navigate]);

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=shipping');
  };

  const updateQtyHandler = (id, qty) => {
    dispatch(updateCartItemQty({ id, qty }));
  };

  const applyPromoHandler = (e) => {
    e.preventDefault();
    if (promoInput.trim()) {
      dispatch(applyPromoCode(promoInput));
    }
  };

  const removePromoHandler = () => {
    dispatch(resetPromoCode());
    setPromoInput('');
  };

  return (
    <div className="cart-page">
      <h1>Giỏ hàng</h1>
      <Row>
        <Col md={8}>
          {cartItems.length === 0 ? (
            <Message>
              Giỏ hàng của bạn đang trống{' '}
              <Link to="/products">Mua sắm ngay</Link>
            </Message>
          ) : (
            <ListGroup variant="flush">
              {cartItems.map((item) => (
                <ListGroup.Item key={item.id}>
                  <Row className="align-items-center">
                    <Col md={2}>
                      <Image src={item.image} alt={item.name} fluid rounded />
                    </Col>
                    <Col md={3}>
                      <Link to={`/product/${item.id}`}>{item.name}</Link>
                      {item.personalization && (
                        <div className="personalization-info">
                          {Object.entries(item.personalization).map(([key, value]) => (
                            <small key={key} className="d-block">
                              {key}: {value}
                            </small>
                          ))}
                        </div>
                      )}
                    </Col>
                    <Col md={2}>{formatPrice(item.price)}</Col>
                    <Col md={2}>
                      <Form.Control
                        as="select"
                        value={item.qty}
                        onChange={(e) => updateQtyHandler(item.id, Number(e.target.value))}
                      >
                        {[...Array(Math.min(item.stock, 10)).keys()].map((x) => (
                          <option key={x + 1} value={x + 1}>
                            {x + 1}
                          </option>
                        ))}
                      </Form.Control>
                    </Col>
                    <Col md={2} className="text-end">
                      {formatPrice(item.price * item.qty)}
                    </Col>
                    <Col md={1} className="text-end">
                      <Button
                        type="button"
                        variant="light"
                        onClick={() => removeFromCartHandler(item.id)}
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
        <Col md={4}>
          <Card>
            <ListGroup variant="flush">
              <ListGroup.Item>
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
                <ListGroup.Item>
                  <Row>
                    <Col>Giảm giá:</Col>
                    <Col className="text-end text-danger">-{formatPrice(discountAmount)}</Col>
                  </Row>
                </ListGroup.Item>
              )}
              
              <ListGroup.Item>
                <Row>
                  <Col>Tổng thanh toán:</Col>
                  <Col className="text-end fw-bold">{formatPrice(totalPrice)}</Col>
                </Row>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Form onSubmit={applyPromoHandler}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mã giảm giá</Form.Label>
                    <div className="d-flex">
                      <Form.Control
                        type="text"
                        placeholder="Nhập mã giảm giá"
                        value={promoInput}
                        onChange={(e) => setPromoInput(e.target.value)}
                        disabled={promoCode || promoCodeLoading}
                      />
                      {!promoCode ? (
                        <Button
                          type="submit"
                          variant="outline-success"
                          className="ms-2"
                          disabled={promoCodeLoading || !promoInput.trim()}
                        >
                          {promoCodeLoading ? 'Đang áp dụng...' : 'Áp dụng'}
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="outline-danger"
                          className="ms-2"
                          onClick={removePromoHandler}
                        >
                          Xóa
                        </Button>
                      )}
                    </div>
                    {promoCodeError && <small className="text-danger">{promoCodeError}</small>}
                    {promoCode && (
                      <div className="mt-2 text-success">
                        <small>
                          Đã áp dụng mã giảm giá "{promoCode.code}" - {promoCode.discountType === 'percentage' 
                            ? `Giảm ${promoCode.discountValue}%` 
                            : promoCode.discountType === 'fixed_amount' 
                              ? `Giảm ${formatPrice(promoCode.discountValue)}` 
                              : 'Miễn phí vận chuyển'}
                        </small>
                      </div>
                    )}
                  </Form.Group>
                </Form>
              </ListGroup.Item>
              
              <ListGroup.Item>
                <Button
                  type="button"
                  className="btn-block w-100"
                  disabled={cartItems.length === 0}
                  onClick={checkoutHandler}
                >
                  Thanh toán
                </Button>
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default CartPage; 