import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Card, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyOrders } from '../slices/orderSlice';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { myOrders, loading, error } = useSelector((state) => state.order);
  const { user } = useSelector((state) => state.user);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    // Kiểm tra user đăng nhập
    if (!user || !user.token) {
      navigate('/login', { state: { from: '/orders' } });
      return;
    }
    
    // Log user info để debug
    console.log('Current user:', user);
    
    dispatch(getMyOrders());
  }, [dispatch, navigate, user]);

  useEffect(() => {
    if (myOrders) {
      let filtered = [...myOrders];
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter(order => order.status === statusFilter);
      }
      
      // Apply search filter
      if (searchTerm.trim() !== '') {
        const search = searchTerm.toLowerCase();
        filtered = filtered.filter(order => 
          order.id.toString().includes(search) ||
          (order.paymentMethod && order.paymentMethod.toLowerCase().includes(search)) ||
          order.orderItems && order.orderItems.some(item => item.name.toLowerCase().includes(search))
        );
      }
      
      setFilteredOrders(filtered);
    }
  }, [myOrders, searchTerm, statusFilter]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const handleRetry = () => {
    dispatch(getMyOrders());
  };

  if (!user || !user.token) {
    return (
      <Alert variant="warning">
        <h4>Bạn chưa đăng nhập</h4>
        <p>Vui lòng đăng nhập để xem đơn hàng của bạn.</p>
        <Button 
          variant="primary" 
          onClick={() => navigate('/login', { state: { from: '/orders' } })}
        >
          Đăng nhập
        </Button>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger" className="my-3">
        <h4>Lỗi khi tải đơn hàng</h4>
        <p>{error}</p>
        <hr />
        <div className="d-flex justify-content-between">
          <Button variant="outline-primary" onClick={handleRetry}>
            Thử lại
          </Button>
          <Button variant="outline-secondary" onClick={() => navigate('/login', { state: { from: '/orders' } })}>
            Đăng nhập lại
          </Button>
        </div>
      </Alert>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="mb-4">Lịch sử đơn hàng</h1>

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={5}>
              <InputGroup>
                <Form.Control
                  placeholder="Tìm kiếm đơn hàng..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    X
                  </Button>
                )}
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="pending">Chờ xử lý</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đang giao hàng</option>
                <option value="delivered">Đã giao hàng</option>
                <option value="cancelled">Đã hủy</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <span className="text-muted">
                {filteredOrders.length} đơn hàng
              </span>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {!myOrders || filteredOrders.length === 0 ? (
        <Alert variant="info">
          {statusFilter !== 'all' || searchTerm ? 
            'Không tìm thấy đơn hàng nào phù hợp với bộ lọc.' : 
            'Bạn chưa có đơn hàng nào.'}
        </Alert>
      ) : (
        <Table responsive hover className="align-middle">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Thanh toán</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{formatDate(order.createdAt || new Date())}</td>
                <td>{(order.total || order.totalPrice || 0).toLocaleString('vi-VN')}đ</td>
                <td>
                  {order.isPaid ? (
                    <Badge bg="success">Đã thanh toán</Badge>
                  ) : (
                    <Badge bg="warning" text="dark">Chưa thanh toán</Badge>
                  )}
                </td>
                <td>
                  <Badge bg={getStatusBadgeVariant(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                </td>
                <td>
                  <Button
                    as={Link}
                    to={`/order/${order.id}`}
                    variant="outline-primary"
                    size="sm"
                  >
                    Chi tiết
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default OrdersPage; 