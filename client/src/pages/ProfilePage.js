import React, { useEffect, useState, useRef } from 'react';
import { Form, Button, Row, Col, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
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
    <Row>
      <Col md={3}>
        <Card className="p-3 mb-3">
          <div className="profile-tabs">
            <div 
              className={`tab-item ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Thông tin cá nhân
            </div>
            <div 
              className={`tab-item ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              Đơn hàng
            </div>
            <div 
              className={`tab-item ${activeTab === 'password' ? 'active' : ''}`}
              onClick={() => setActiveTab('password')}
            >
              Đổi mật khẩu
            </div>
          </div>
        </Card>
      </Col>
      <Col md={9}>
        {activeTab === 'profile' && (
          <Card className="p-4">
            <h2>Thông tin cá nhân</h2>
            {error && <Message variant="danger">{error}</Message>}
            {success && <Message variant="success">Cập nhật thông tin thành công</Message>}
            {loading || profileLoading ? (
              <Loader />
            ) : (
              <Form onSubmit={submitHandler}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Họ tên</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Họ tên"
                    value={name}
                    onChange={handleInputChange(setName)}
                  />
                </Form.Group>

                <Form.Group controlId="email" className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={handleInputChange(setEmail)}
                    disabled
                  />
                </Form.Group>

                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
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
          <Card className="p-4">
            <h2>Lịch sử đơn hàng</h2>
            <OrderList />
          </Card>
        )}

        {activeTab === 'password' && (
          <Card className="p-4">
            <h2>Đổi mật khẩu</h2>
            <Form>
              <Form.Group controlId="currentPassword" className="mb-3">
                <Form.Label>Mật khẩu hiện tại</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </Form.Group>

              <Form.Group controlId="newPassword" className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  placeholder="Nhập mật khẩu mới"
                />
              </Form.Group>

              <Form.Group controlId="confirmPassword" className="mb-3">
                <Form.Label>Xác nhận mật khẩu mới</Form.Label>
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
    </Row>
  );
};

export default ProfilePage; 