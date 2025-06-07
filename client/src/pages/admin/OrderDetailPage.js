import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Button,
  Card,
  ListGroup,
  Form,
  Badge,
  Table,
  InputGroup
} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import {
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaTruck,
  FaPrint,
  FaEnvelope
} from 'react-icons/fa';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Meta from '../../components/Meta';
import ConfirmModal from '../../components/ConfirmModal';
import { getOrderById, updateOrderStatus, updateTrackingInfo } from '../../slices/orderSlice';
import { formatPrice } from '../../utils/formatPrice';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [trackingInfo, setTrackingInfo] = useState({
    trackingNumber: '',
    shippingProvider: ''
  });
  const [showTrackingModal, setShowTrackingModal] = useState(false);

  const { orderDetails: order, loading, error, updateSuccess } = useSelector(
    (state) => state.order
  );
  
  console.log('OrderDetailPage render - Redux state:', useSelector(state => state.order));
  console.log('OrderDetailPage render - Extracted order:', order);

  // Get full Redux state for debugging
  const fullState = useSelector((state) => state);
  
  useEffect(() => {
    console.log('OrderDetailPage useEffect - Current order:', order);
    console.log('OrderDetailPage useEffect - Order ID param:', id);
    console.log('OrderDetailPage useEffect - Redux state:', fullState);

    // Nếu không có order, hoặc order.id khác với param, hoặc vừa cập nhật thành công
    // --> dispatch action để lấy thông tin order
    if (!order || (order && order.id !== parseInt(id)) || updateSuccess) {
      console.log('Dispatching getOrderById action with ID:', id);
      dispatch(getOrderById(id))
        .then(result => {
          console.log('getOrderById result:', result);
        })
        .catch(error => {
          console.error('getOrderById error:', error);
        });
    } else if (order) { // Chỉ xử lý tiếp nếu order tồn tại
      console.log('Order already loaded:', order);
      // Initialize tracking info from order if available
      if (order.trackingNumber) {
        setTrackingInfo({
          trackingNumber: order.trackingNumber || '',
          shippingProvider: order.shippingProvider || ''
        });
      }
    }
  }, [dispatch, id, order, updateSuccess, fullState]);

  const handleStatusChange = (status) => {
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (newStatus) {
      dispatch(updateOrderStatus({ orderId: id, status: newStatus }));
      setShowStatusModal(false);
    }
  };

  const handleTrackingSubmit = () => {
    dispatch(updateTrackingInfo({ 
      id: id, 
      trackingNumber: trackingInfo.trackingNumber,
      shippingProvider: trackingInfo.shippingProvider
    }));
    setShowTrackingModal(false);
  };

  // Helper function to determine status badge color
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'info';
      case 'shipping':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Helper for formatting dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  return (
    <>
      <Meta title="Chi tiết đơn hàng - BabyBon Admin" />
      
      <Button
        variant="light"
        onClick={() => navigate('/admin/orders')}
        className="mb-3"
      >
        <FaArrowLeft className="me-2" /> Quay lại
      </Button>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : order ? (
        <>
          <h1>
            Đơn hàng #{order.orderNumber}
            <Badge
              bg={getStatusBadgeVariant(order.status)}
              className="ms-3"
            >
              {order.status === 'pending' ? 'Chờ xử lý' :
                order.status === 'processing' ? 'Đang xử lý' :
                order.status === 'shipping' ? 'Đang giao hàng' :
                order.status === 'delivered' ? 'Đã giao hàng' :
                'Đã hủy'}
            </Badge>
          </h1>
          
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header className="bg-white">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">Thông tin đơn hàng</h5>
                    <div>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => window.print()}
                      >
                        <FaPrint className="me-1" /> In đơn
                      </Button>
                      <Button 
                        variant="outline-info" 
                        size="sm"
                      >
                        <FaEnvelope className="me-1" /> Gửi email
                      </Button>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6>Thông tin khách hàng</h6>
                      <p className="mb-1">
                        <strong>Tên:</strong> {order.customerName || (order.user && order.user.name) || 'N/A'}
                      </p>
                      <p className="mb-1">
                        <strong>Email:</strong> {order.customerEmail || (order.user && order.user.email) || 'N/A'}
                      </p>
                      <p className="mb-1">
                        <strong>Số điện thoại:</strong> {order.customerPhone || (order.user && order.user.phone) || 'N/A'}
                      </p>
                      <p className="mb-1">
                        <strong>Ngày đặt hàng:</strong> {formatDate(order.createdAt)}
                      </p>
                    </Col>
                    <Col md={6}>
                      <h6>Thông tin giao hàng</h6>
                      {(() => {
                        let shippingAddressObj;
                        try {
                          shippingAddressObj = typeof order.shippingAddress === 'string' 
                            ? JSON.parse(order.shippingAddress) 
                            : order.shippingAddress;
                        } catch (e) {
                          console.error('Error parsing shipping address:', e);
                          shippingAddressObj = {};
                        }
                        return (
                          <>
                            <p className="mb-1">
                              <strong>Địa chỉ:</strong> {shippingAddressObj?.address || 'N/A'}
                            </p>
                            <p className="mb-1">
                              <strong>Phường/Xã:</strong> {shippingAddressObj?.wardName || order.ward || 'N/A'}
                            </p>
                            <p className="mb-1">
                              <strong>Quận/Huyện:</strong> {shippingAddressObj?.districtName || order.district || 'N/A'}
                            </p>
                            <p className="mb-1">
                              <strong>Tỉnh/Thành phố:</strong> {shippingAddressObj?.provinceName || order.city || 'N/A'}
                            </p>
                          </>
                        );
                      })()}
                    </Col>
                  </Row>
                  
                  <hr />
                  
                  <Row>
                    <Col md={6}>
                      <h6>Thông tin thanh toán</h6>
                      <p className="mb-1">
                        <strong>Phương thức:</strong> {
                          order.paymentMethod === 'cod' ? 'Tiền mặt khi nhận hàng' :
                          order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                          order.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' :
                          'Quét mã QR'
                        }
                      </p>
                      <p className="mb-1">
                        <strong>Trạng thái:</strong>{' '}
                        <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                          {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 
                           order.paymentStatus === 'failed' ? 'Thanh toán thất bại' : 
                           'Chưa thanh toán'}
                        </Badge>
                      </p>
                      {order.paymentStatus === 'paid' && (
                        <p className="mb-1">
                          <strong>Ngày thanh toán:</strong> {formatDate(order.paidAt)}
                        </p>
                      )}
                    </Col>
                    <Col md={6}>
                      <h6>Thông tin vận chuyển</h6>
                      {order.trackingNumber ? (
                        <>
                          <p className="mb-1">
                            <strong>Mã vận đơn:</strong> {order.trackingNumber}
                          </p>
                          <p className="mb-1">
                            <strong>Đơn vị vận chuyển:</strong> {order.shippingProvider}
                          </p>
                          {order.shippedAt && (
                            <p className="mb-1">
                              <strong>Ngày gửi hàng:</strong> {formatDate(order.shippedAt)}
                            </p>
                          )}
                          {order.deliveredAt && (
                            <p className="mb-1">
                              <strong>Ngày giao hàng:</strong> {formatDate(order.deliveredAt)}
                            </p>
                          )}
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="mt-2"
                            onClick={() => setShowTrackingModal(true)}
                          >
                            <FaTruck className="me-1" /> Cập nhật thông tin vận chuyển
                          </Button>
                        </>
                      ) : (
                        <>
                          <p className="text-muted">Chưa có thông tin vận chuyển</p>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => setShowTrackingModal(true)}
                          >
                            <FaTruck className="me-1" /> Thêm thông tin vận chuyển
                          </Button>
                        </>
                      )}
                    </Col>
                  </Row>
                  
                  {order.notes && (
                    <>
                      <hr />
                      <h6>Ghi chú</h6>
                      <p>{order.notes}</p>
                    </>
                  )}
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Sản phẩm</h5>
                </Card.Header>
                <Card.Body>
                  <Table responsive>
                    <thead>
                      <tr>
                        <th style={{ width: '60px' }}>Hình</th>
                        <th>Sản phẩm</th>
                        <th className="text-center">SL</th>
                        <th className="text-end">Đơn giá</th>
                        <th className="text-end">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.orderItems?.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <img
                              src={item.product?.thumbnail || '/images/placeholder.jpg'}
                              alt={item.product?.name}
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                              className="border"
                            />
                          </td>
                          <td>
                            <div>
                              {item.product?.name || 'Sản phẩm không tồn tại'}
                              {item.personalization && (
                                <div className="text-muted small mt-1">
                                  Tùy chỉnh: {JSON.stringify(item.personalization)}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="text-center">{item.quantity}</td>
                          <td className="text-end">{formatPrice(item.price)}</td>
                          <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Tổng quan đơn hàng</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <Row>
                      <Col>Tạm tính</Col>
                      <Col className="text-end">{formatPrice(order.subTotal)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Phí vận chuyển</Col>
                      <Col className="text-end">{formatPrice(order.shippingCost)}</Col>
                    </Row>
                  </ListGroup.Item>
                  {order.discount > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Giảm giá</Col>
                        <Col className="text-end text-danger">
                          -{formatPrice(order.discount)}
                        </Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                  {order.tax > 0 && (
                    <ListGroup.Item>
                      <Row>
                        <Col>Thuế</Col>
                        <Col className="text-end">{formatPrice(order.tax)}</Col>
                      </Row>
                    </ListGroup.Item>
                  )}
                  <ListGroup.Item>
                    <Row>
                      <Col>
                        <strong>Tổng cộng</strong>
                      </Col>
                      <Col className="text-end">
                        <strong>{formatPrice(order.totalAmount)}</strong>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
              
              <Card>
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Cập nhật trạng thái</h5>
                </Card.Header>
                <Card.Body>
                  <div className="mb-3">
                    <p className="mb-1">Trạng thái hiện tại:</p>
                    <h5>
                      <Badge bg={getStatusBadgeVariant(order.status)}>
                        {order.status === 'pending' ? 'Chờ xử lý' :
                          order.status === 'processing' ? 'Đang xử lý' :
                          order.status === 'shipping' ? 'Đang giao hàng' :
                          order.status === 'delivered' ? 'Đã giao hàng' :
                          'Đã hủy'}
                      </Badge>
                    </h5>
                  </div>
                  
                  {order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <div className="d-grid gap-2">
                      {order.status === 'pending' && (
                        <Button
                          variant="primary"
                          onClick={() => handleStatusChange('processing')}
                        >
                          Xác nhận đơn hàng
                        </Button>
                      )}
                      
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <Button
                          variant="info"
                          onClick={() => handleStatusChange('shipping')}
                        >
                          <FaTruck className="me-2" /> Chuyển sang đang giao hàng
                        </Button>
                      )}
                      
                      {(order.status === 'pending' || order.status === 'processing' || order.status === 'shipping') && (
                        <Button
                          variant="success"
                          onClick={() => handleStatusChange('delivered')}
                        >
                          <FaCheck className="me-2" /> Xác nhận đã giao hàng
                        </Button>
                      )}
                      
                      <Button
                        variant="danger"
                        onClick={() => handleStatusChange('cancelled')}
                      >
                        <FaTimes className="me-2" /> Hủy đơn hàng
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      ) : (
        <Message variant="info">Không tìm thấy thông tin đơn hàng</Message>
      )}
      
      {/* Status Update Confirmation Modal */}
      <ConfirmModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        onConfirm={confirmStatusChange}
        title="Xác nhận cập nhật trạng thái"
        message={`Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng ${order?.orderNumber} thành "${
          newStatus === 'processing' ? 'Đang xử lý' :
          newStatus === 'shipping' ? 'Đang giao hàng' :
          newStatus === 'delivered' ? 'Đã giao hàng' :
          newStatus === 'cancelled' ? 'Đã hủy' : newStatus
        }"?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        confirmVariant={newStatus === 'cancelled' ? 'danger' : 'primary'}
      />
      
      {/* Tracking Information Modal */}
      <ConfirmModal
        show={showTrackingModal}
        onHide={() => setShowTrackingModal(false)}
        onConfirm={handleTrackingSubmit}
        title="Thông tin vận chuyển"
        confirmText="Lưu thông tin"
        cancelText="Hủy"
        customBody={
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Mã vận đơn</Form.Label>
              <Form.Control
                type="text"
                value={trackingInfo.trackingNumber}
                onChange={(e) => setTrackingInfo({...trackingInfo, trackingNumber: e.target.value})}
                placeholder="Nhập mã vận đơn"
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Đơn vị vận chuyển</Form.Label>
              <Form.Select
                value={trackingInfo.shippingProvider}
                onChange={(e) => setTrackingInfo({...trackingInfo, shippingProvider: e.target.value})}
              >
                <option value="">Chọn đơn vị vận chuyển</option>
                <option value="Giao Hàng Nhanh">Giao Hàng Nhanh</option>
                <option value="Giao Hàng Tiết Kiệm">Giao Hàng Tiết Kiệm</option>
                <option value="Vietnam Post">Vietnam Post</option>
                <option value="J&T Express">J&T Express</option>
                <option value="Grab Express">Grab Express</option>
                <option value="Viettel Post">Viettel Post</option>
                <option value="Khác">Khác</option>
              </Form.Select>
            </Form.Group>
          </Form>
        }
      />
    </>
  );
};

export default OrderDetailPage; 