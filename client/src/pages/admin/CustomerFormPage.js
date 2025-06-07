import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Card, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Meta from '../../components/Meta';
import { createUser, updateUser, getUserById, resetUserState } from '../../slices/userSlice';

const CustomerFormPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [ward, setWard] = useState('');
  const [role, setRole] = useState('customer');
  const [isActive, setIsActive] = useState(true);

  // Error messages for validation
  const [formErrors, setFormErrors] = useState({});

  // Get user state from Redux
  const { users, loading, error } = useSelector((state) => state.user);

  // Find the user when editing
  const userDetails = isEdit ? users.find(u => u.id === parseInt(id)) : null;

  useEffect(() => {
    // If we're editing and we have the user details from the users array
    if (isEdit && userDetails) {
      setName(userDetails.name || '');
      setEmail(userDetails.email || '');
      setPhone(userDetails.phone || '');
      setAddress(userDetails.address || '');
      setCity(userDetails.city || '');
      setDistrict(userDetails.district || '');
      setWard(userDetails.ward || '');
      setRole(userDetails.role || 'customer');
      setIsActive(userDetails.isActive !== false);
    }

    return () => {
      // Reset user state when component unmounts
      dispatch(resetUserState());
    };
  }, [dispatch, isEdit, userDetails, id]);

  // Validate form inputs
  const validateForm = () => {
    const errors = {};

    if (!name.trim()) {
      errors.name = 'Tên khách hàng không được để trống';
    }

    if (!email.trim()) {
      errors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email không hợp lệ';
    }

    if (!isEdit && !password) {
      errors.password = 'Mật khẩu không được để trống';
    } else if (!isEdit && password !== confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = {
      name,
      email,
      phone,
      address,
      city,
      district,
      ward,
      role,
      isActive
    };

    // Only include password if provided (required for new users)
    if (password && (!isEdit || (isEdit && password !== ''))) {
      userData.password = password;
    }

    if (isEdit) {
      dispatch(updateUser({ id, userData }));
      navigate('/admin/customers');
    } else {
      dispatch(createUser(userData));
      navigate('/admin/customers');
    }
  };

  return (
    <Container className="py-3">
      <Meta title={`${isEdit ? 'Cập nhật' : 'Thêm'} khách hàng - BabyBon Admin`} />
      <Button
        variant="light"
        className="mb-3"
        onClick={() => navigate('/admin/customers')}
      >
        <FaArrowLeft className="me-2" /> Quay lại
      </Button>

      <Card>
        <Card.Header as="h5">
          {isEdit ? 'Cập nhật thông tin khách hàng' : 'Thêm khách hàng mới'}
        </Card.Header>
        <Card.Body>
          {loading && <Loader />}
          {error && <Message variant="danger">{error}</Message>}

          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên khách hàng</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tên khách hàng"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    isInvalid={!!formErrors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.name}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Nhập email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    isInvalid={!!formErrors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.email}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mật khẩu {isEdit && '(để trống nếu không thay đổi)'}</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder={isEdit ? 'Để trống nếu không thay đổi' : 'Nhập mật khẩu'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    isInvalid={!!formErrors.password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.password}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Xác nhận mật khẩu</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    isInvalid={!!formErrors.confirmPassword}
                    disabled={!password}
                  />
                  <Form.Control.Feedback type="invalid">
                    {formErrors.confirmPassword}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số điện thoại</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Vai trò</Form.Label>
                  <Form.Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="customer">Khách hàng</option>
                    <option value="admin">Quản trị viên</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Địa chỉ</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nhập địa chỉ"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Tỉnh/Thành phố</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập tỉnh/thành phố"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Quận/Huyện</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập quận/huyện"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Phường/Xã</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập phường/xã"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="isActive"
                label="Tài khoản hoạt động"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </Form.Group>

            <div className="d-grid gap-2 d-md-flex justify-content-md-end">
              <Button type="submit" variant="primary">
                <FaSave className="me-2" /> {isEdit ? 'Cập nhật' : 'Tạo mới'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CustomerFormPage; 