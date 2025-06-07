import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Form, InputGroup, Badge, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaEye, FaTimes, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Meta from '../../components/Meta';
import Paginate from '../../components/Paginate';
import { getOrders, updateOrderStatus } from '../../slices/orderSlice';
import { formatPrice } from '../../utils/formatPrice';
import ConfirmModal from '../../components/ConfirmModal';

const OrdersListPage = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Get orders state from Redux
  const { 
    orders = [], // Provide default empty array
    loading, 
    error, 
    pages,
    updateSuccess,
  } = useSelector(state => state.order);

  // Load orders on initial render and when filters change
  useEffect(() => {
    loadOrders();
  }, [dispatch, page, limit, statusFilter, dateRange, updateSuccess]);

  const loadOrders = () => {
    const params = {
      page,
      limit,
      keyword: searchTerm || undefined,
      status: statusFilter || undefined,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined
    };
    dispatch(getOrders(params));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    loadOrders();
  };

  const handleStatusChange = (orderId, status) => {
    if (!orders || !orders.length) return;
    setSelectedOrder(orders.find(order => order.id === orderId));
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (selectedOrder && newStatus) {
      dispatch(updateOrderStatus({ orderId: selectedOrder.id, status: newStatus }));
      setShowStatusModal(false);
    }
  };

  const toggleOrderDetails = (orderId) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
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
      <Meta title="Quản lý đơn hàng - BabyBon Admin" />
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Đơn hàng</h1>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={6}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Tìm theo mã đơn, tên khách hàng, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-primary" type="submit">
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={3}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              setTimeout(loadOrders, 0);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </Form.Select>
        </Col>
        <Col md={3}>
          <InputGroup>
            <Form.Control
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
            <Form.Control
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : !orders || orders.length === 0 ? (
        <Message variant="info">Không tìm thấy đơn hàng nào</Message>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Mã đơn hàng</th>
                <th>Ngày đặt</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(orders) && orders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr>
                    <td>
                      <Button 
                        variant="link" 
                        className="p-0 text-decoration-none"
                        onClick={() => toggleOrderDetails(order.id)}
                      >
                        {order.orderNumber}
                        {expandedOrderId === order.id ? <FaChevronUp className="ms-2" /> : <FaChevronDown className="ms-2" />}
                      </Button>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>
                      {order.customerName || (order.user && order.user.name) || 'Khách vãng lai'}
                      <br />
                      <small>{order.customerPhone || (order.user && order.user.phone)}</small>
                    </td>
                    <td className="text-end">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td>
                      <Badge bg={order.paymentStatus === 'paid' ? 'success' : 'warning'}>
                        {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                      </Badge>
                      <div className="small mt-1">{order.paymentMethod === 'cod' ? 'Tiền mặt' : 
                              order.paymentMethod === 'bank_transfer' ? 'Chuyển khoản' :
                              order.paymentMethod === 'credit_card' ? 'Thẻ tín dụng' : 
                              'QR Code'}</div>
                    </td>
                    <td>
                      <Badge bg={getStatusBadgeVariant(order.status)}>
                        {order.status === 'pending' ? 'Chờ xử lý' :
                          order.status === 'processing' ? 'Đang xử lý' :
                          order.status === 'shipping' ? 'Đang giao hàng' :
                          order.status === 'delivered' ? 'Đã giao hàng' :
                          'Đã hủy'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex">
                        <LinkContainer to={`/admin/order/${order.id}`}>
                          <Button variant="info" size="sm" className="me-2">
                            <FaEye />
                          </Button>
                        </LinkContainer>
                        <Form.Select 
                          size="sm"
                          value=""
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          disabled={order.status === 'delivered' || order.status === 'cancelled'}
                          style={{ width: '130px' }}
                        >
                          <option value="">Cập nhật</option>
                          <option value="processing" disabled={order.status === 'processing'}>Đang xử lý</option>
                          <option value="shipping" disabled={order.status === 'shipping'}>Đang giao hàng</option>
                          <option value="delivered" disabled={order.status === 'delivered'}>Đã giao hàng</option>
                          <option value="cancelled" disabled={order.status === 'cancelled'}>Hủy đơn</option>
                        </Form.Select>
                      </div>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr>
                      <td colSpan="7" className="p-0">
                        <Card className="border-0">
                          <Card.Body>
                            <Row>
                              <Col md={6}>
                                <h5>Thông tin đơn hàng</h5>
                                <p><strong>Địa chỉ:</strong> {order.shippingAddress}, {order.ward}, {order.district}, {order.city}</p>
                                <p><strong>Ghi chú:</strong> {order.notes || 'Không có'}</p>
                                {order.trackingNumber && (
                                  <p><strong>Mã vận đơn:</strong> {order.trackingNumber} ({order.shippingProvider})</p>
                                )}
                              </Col>
                              <Col md={6}>
                                <h5>Sản phẩm</h5>
                                <Table size="sm">
                                  <thead>
                                    <tr>
                                      <th>Sản phẩm</th>
                                      <th className="text-center">SL</th>
                                      <th className="text-end">Giá</th>
                                      <th className="text-end">Tổng</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {order.orderItems && order.orderItems.map((item) => (
                                      <tr key={item.id}>
                                        <td>
                                          {item.product?.name || 'Sản phẩm không tồn tại'}
                                          {item.personalization && (
                                            <small className="d-block text-muted">
                                              {JSON.stringify(item.personalization)}
                                            </small>
                                          )}
                                        </td>
                                        <td className="text-center">{item.quantity}</td>
                                        <td className="text-end">{formatPrice(item.price)}</td>
                                        <td className="text-end">{formatPrice(item.price * item.quantity)}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                  <tfoot>
                                    <tr>
                                      <td colSpan="3" className="text-end">Tạm tính</td>
                                      <td className="text-end">{formatPrice(order.subTotal)}</td>
                                    </tr>
                                    <tr>
                                      <td colSpan="3" className="text-end">Phí vận chuyển</td>
                                      <td className="text-end">{formatPrice(order.shippingCost)}</td>
                                    </tr>
                                    {order.discount > 0 && (
                                      <tr>
                                        <td colSpan="3" className="text-end">Giảm giá</td>
                                        <td className="text-end">-{formatPrice(order.discount)}</td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td colSpan="3" className="text-end fw-bold">Tổng cộng</td>
                                      <td className="text-end fw-bold">{formatPrice(order.totalAmount)}</td>
                                    </tr>
                                  </tfoot>
                                </Table>
                              </Col>
                            </Row>
                          </Card.Body>
                        </Card>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </Table>

          <Paginate
            pages={pages}
            page={page}
            onChange={(pageNumber) => {
              setPage(pageNumber);
            }}
          />
        </>
      )}

      {/* Status Update Confirmation Modal */}
      <ConfirmModal
        show={showStatusModal}
        onHide={() => setShowStatusModal(false)}
        onConfirm={confirmStatusChange}
        title="Xác nhận cập nhật trạng thái"
        message={`Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng ${selectedOrder?.orderNumber} thành "${
          newStatus === 'processing' ? 'Đang xử lý' :
          newStatus === 'shipping' ? 'Đang giao hàng' :
          newStatus === 'delivered' ? 'Đã giao hàng' :
          newStatus === 'cancelled' ? 'Đã hủy' : newStatus
        }"?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        confirmVariant={newStatus === 'cancelled' ? 'danger' : 'primary'}
      />
    </>
  );
};

export default OrdersListPage; 