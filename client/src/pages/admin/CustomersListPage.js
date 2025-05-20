import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Form, InputGroup, Badge, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaSearch, FaEye, FaEdit, FaUserPlus, FaEnvelope, FaPhone, FaCalendarAlt } from 'react-icons/fa';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Meta from '../../components/Meta';
import Paginate from '../../components/Paginate';
import { getUsers, updateUserStatus } from '../../slices/userSlice';
import ConfirmModal from '../../components/ConfirmModal';

const CustomersListPage = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newStatus, setNewStatus] = useState(true);
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Get users state from Redux
  const { 
    users, 
    loading, 
    error, 
    pages,
    updateSuccess,
  } = useSelector(state => state.user);

  // Load users on initial render and when filters change
  useEffect(() => {
    loadUsers();
  }, [dispatch, page, limit, statusFilter, updateSuccess]);

  const loadUsers = () => {
    const params = {
      page,
      limit,
      keyword: searchTerm || undefined,
      role: 'customer', // Only load customers
      status: statusFilter || undefined
    };
    dispatch(getUsers(params));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    loadUsers();
  };

  const handleStatusChange = (userId, status) => {
    setSelectedUser(users.find(user => user.id === userId));
    setNewStatus(status);
    setShowStatusModal(true);
  };

  const confirmStatusChange = () => {
    if (selectedUser) {
      dispatch(updateUserStatus({ id: selectedUser.id, isActive: newStatus }));
      setShowStatusModal(false);
    }
  };

  const toggleUserDetails = (userId) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  // Helper for formatting dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  // Filter customers only
  const customers = users?.filter(user => user.role === 'customer') || [];

  return (
    <>
      <Meta title="Quản lý khách hàng - BabyBon Admin" />
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Khách hàng</h1>
        </Col>
        <Col className="text-end">
          <LinkContainer to="/admin/customer/create">
            <Button variant="primary">
              <FaUserPlus className="me-2" /> Thêm khách hàng
            </Button>
          </LinkContainer>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={8}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Tìm kiếm theo tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-primary" type="submit">
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={4}>
          <Form.Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
              setTimeout(loadUsers, 0);
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Bị khóa</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày đăng ký</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((user) => (
                <React.Fragment key={user.id}>
                  <tr>
                    <td>{user.id}</td>
                    <td>
                      <a 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          toggleUserDetails(user.id);
                        }}
                        className="text-decoration-none"
                      >
                        {user.name}
                      </a>
                    </td>
                    <td>
                      <a href={`mailto:${user.email}`} className="text-decoration-none">
                        {user.email}
                      </a>
                    </td>
                    <td>
                      {user.phone ? (
                        <a href={`tel:${user.phone}`} className="text-decoration-none">
                          {user.phone}
                        </a>
                      ) : (
                        <span className="text-muted">N/A</span>
                      )}
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <Badge bg={user.isActive ? 'success' : 'danger'}>
                        {user.isActive ? 'Hoạt động' : 'Bị khóa'}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex">
                        <LinkContainer to={`/admin/customer/${user.id}`}>
                          <Button variant="info" size="sm" className="me-2">
                            <FaEye />
                          </Button>
                        </LinkContainer>
                        <LinkContainer to={`/admin/customer/${user.id}/edit`}>
                          <Button variant="primary" size="sm" className="me-2">
                            <FaEdit />
                          </Button>
                        </LinkContainer>
                        <Button
                          variant={user.isActive ? 'danger' : 'success'}
                          size="sm"
                          onClick={() => handleStatusChange(user.id, !user.isActive)}
                        >
                          {user.isActive ? 'Khóa' : 'Mở khóa'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                  {expandedUserId === user.id && (
                    <tr>
                      <td colSpan="7" className="p-0">
                        <Card className="border-0">
                          <Card.Body>
                            <Row>
                              <Col md={6}>
                                <h5>Thông tin chi tiết</h5>
                                <p className="mb-1">
                                  <FaCalendarAlt className="me-2 text-secondary" />
                                  <strong>Ngày đăng ký:</strong> {formatDate(user.createdAt)}
                                </p>
                                {user.lastLogin && (
                                  <p className="mb-1">
                                    <i className="fas fa-sign-in-alt me-2 text-secondary"></i>
                                    <strong>Đăng nhập gần nhất:</strong> {formatDate(user.lastLogin)}
                                  </p>
                                )}
                                <p className="mb-1">
                                  <FaEnvelope className="me-2 text-secondary" />
                                  <strong>Email:</strong> {user.email}
                                </p>
                                <p className="mb-1">
                                  <FaPhone className="me-2 text-secondary" />
                                  <strong>Số điện thoại:</strong> {user.phone || 'N/A'}
                                </p>
                                {user.address && (
                                  <p className="mb-1">
                                    <i className="fas fa-map-marker-alt me-2 text-secondary"></i>
                                    <strong>Địa chỉ:</strong> {user.address}
                                  </p>
                                )}
                              </Col>
                              <Col md={6}>
                                <h5>Thống kê</h5>
                                <p className="mb-1">
                                  <i className="fas fa-shopping-cart me-2 text-secondary"></i>
                                  <strong>Tổng đơn hàng:</strong> {user.orderCount || 0}
                                </p>
                                <p className="mb-1">
                                  <i className="fas fa-money-bill-wave me-2 text-secondary"></i>
                                  <strong>Tổng chi tiêu:</strong> {user.totalSpent ? user.totalSpent.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}
                                </p>
                                <p className="mb-1">
                                  <i className="fas fa-star me-2 text-secondary"></i>
                                  <strong>Số đánh giá:</strong> {user.reviewCount || 0}
                                </p>
                                <div className="mt-3">
                                  <LinkContainer to={`/admin/customers/${user.id}/orders`}>
                                    <Button variant="outline-primary" size="sm" className="me-2">
                                      Xem đơn hàng
                                    </Button>
                                  </LinkContainer>
                                  <Button variant="outline-secondary" size="sm">
                                    Gửi email
                                  </Button>
                                </div>
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
        title={newStatus ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
        message={`Bạn có chắc chắn muốn ${newStatus ? 'mở khóa' : 'khóa'} tài khoản của khách hàng ${selectedUser?.name}?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        confirmVariant={newStatus ? 'success' : 'danger'}
      />
    </>
  );
};

export default CustomersListPage; 