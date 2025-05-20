import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Alert, Spinner, Card, Badge, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getMyOrders } from '../slices/orderSlice';

const OrdersPage = () => {
  const dispatch = useDispatch();
  const { myOrders, loading, error } = useSelector((state) => state.order);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    dispatch(getMyOrders());
  }, [dispatch]);

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
          order.orderItems.some(item => item.name.toLowerCase().includes(search))
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
        {error}
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

      {filteredOrders.length === 0 ? (
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
                <td>{formatDate(order.createdAt)}</td>
                <td>{order.total.toLocaleString('vi-VN')}đ</td>
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