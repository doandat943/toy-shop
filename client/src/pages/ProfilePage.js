import React, { useEffect, useState, useRef } from 'react';
import { Form, Button, Row, Col, Card, Nav } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaUserCircle, FaListAlt, FaKey } from 'react-icons/fa';
import { getUserProfile, updateUserProfile, resetUserState } from '../slices/userSlice';
import Message from '../components/Message';
import Loader from '../components/Loader';
import OrderList from '../components/OrderList';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [formChanged, setFormChanged] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const profileFetched = useRef(false);

  const dispatch = useDispatch();
  const { user, loading, profileLoading, success, error } = useSelector((state) => state.user);

  useEffect(() => {
    // Chỉ gọi API getUserProfile một lần khi component mount
    // hoặc khi user data chưa có đầy đủ
    if (user && user.token && !profileFetched.current && !profileLoading) {
      profileFetched.current = true;
      dispatch(getUserProfile());
    } else if (user) {
      // Cập nhật form từ data có sẵn nếu đã có
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [dispatch, user, profileLoading]);

  useEffect(() => {
    if (success) {
      setTimeout(() => {
        dispatch(resetUserState());
      }, 3000);
    }
  }, [success, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(updateUserProfile({ name, email, phone }));
    setFormChanged(false);
  };

  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    setFormChanged(true);
  };

  return (
    <Row className="profile-page-container">
      <Col md={3} className="profile-nav-col">
        <Card className="profile-nav-card">
          <Nav variant="pills" className="flex-column profile-tabs-nav">
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
                className="profile-tab-link d-flex align-items-center"
              >
                <FaUserCircle className="me-2 tab-icon" /> Thông tin cá nhân
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'orders'} 
                onClick={() => setActiveTab('orders')}
                className="profile-tab-link d-flex align-items-center"
              >
                <FaListAlt className="me-2 tab-icon" /> Đơn hàng
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link 
                active={activeTab === 'password'} 
                onClick={() => setActiveTab('password')}
                className="profile-tab-link d-flex align-items-center"
              >
                <FaKey className="me-2 tab-icon" /> Đổi mật khẩu
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card>
      </Col>
      <Col md={9} className="profile-content-col">
        {activeTab === 'profile' && (
          <Card className="p-4 content-card shadow-sm">
            <h2 className="page-section-title">Thông tin cá nhân</h2>
            {error && <Message variant="danger">{error}</Message>}
            {success && <Message variant="success">Cập nhật thông tin thành công</Message>}
            {loading || profileLoading ? (
              <Loader />
            ) : (
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label className="form-label">Họ tên</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Họ tên"
                    value={name}
                    onChange={handleInputChange(setName)}
                  />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                  <Form.Label className="form-label">Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    disabled
                  />
                </Form.Group>

                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label className="form-label">Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Số điện thoại"
                    value={phone}
                    onChange={handleInputChange(setPhone)}
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={!formChanged || loading}
                >
                  Cập nhật
                </Button>
              </Form>
            )}
          </Card>
        )}

        {activeTab === 'orders' && (
          <Card className="p-4 content-card shadow-sm">
            <h2 className="page-section-title">Lịch sử đơn hàng</h2>
            <OrderList />
          </Card>
        )}

        {activeTab === 'password' && (
          <Card className="p-4 content-card shadow-sm">
            <h2 className="page-section-title">Đổi mật khẩu</h2>
            <Form>
              <Form.Group controlId="currentPassword" className="mb-3">
                <Form.Label className="form-label">Mật khẩu hiện tại</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </Form.Group>

              <Form.Group controlId="newPassword" className="mb-3">
                <Form.Label className="form-label">Mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label className="form-label">Xác nhận mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Xác nhận mật khẩu mới"
                />
              </Form.Group>

              <Button type="submit" variant="primary">
                Đổi mật khẩu
              </Button>
            </Form>
          </Card>
        )}
      </Col>
      <style jsx global>{`
        .profile-page-container {
          padding-top: 1.5rem;
          padding-bottom: 1.5rem;
        }
        .profile-nav-card {
          border: none;
          background-color: #fff;
          border-radius: 8px;
          padding: 0.75rem !important; 
          box-shadow: 0 4px 15px rgba(0,0,0,0.07);
        }
        .profile-tabs-nav .nav-item + .nav-item {
          margin-top: 0.5rem; 
        }
        .profile-tabs-nav .profile-tab-link {
          color: #555;
          font-weight: 500;
          padding: 0.85rem 1.2rem;
          border-radius: 6px;
          transition: all 0.2s ease-in-out;
          border: 1px solid transparent;
        }
        .profile-tabs-nav .profile-tab-link .tab-icon {
          color: #888;
          transition: color 0.2s ease-in-out;
          font-size: 1.1rem;
        }
        .profile-tabs-nav .profile-tab-link:hover {
          background-color: #f8f9fa; 
          color: #FF6B6B;
          border-color: #eee;
        }
        .profile-tabs-nav .profile-tab-link:hover .tab-icon {
          color: #FF6B6B;
        }
        .profile-tabs-nav .profile-tab-link.active {
          background-color: #FF6B6B;
          color: white;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(255, 107, 107, 0.4);
        }
        .profile-tabs-nav .profile-tab-link.active .tab-icon {
          color: white;
        }
        .profile-content-col .content-card {
            border: none;
            border-radius: 8px;
        }
        .profile-content-col .page-section-title {
            font-size: 1.75rem;
            font-weight: 600;
            color: #333;
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 2px solid #FF6B6B;
            display: inline-block;
        }
        .profile-content-col .form-label {
            font-weight: 500;
        }
        .profile-content-col .btn-primary {
            background-color: #FF6B6B;
            border-color: #FF6B6B;
            padding: 0.5rem 1.5rem;
            font-weight: 500;
        }
        .profile-content-col .btn-primary:hover {
            background-color: #e05252;
            border-color: #e05252;
        }
        .profile-content-col .btn-primary:disabled {
            background-color: #fecaca;
            border-color: #fecaca;
        }
      `}</style>
    </Row>
  );
};

export default ProfilePage; 