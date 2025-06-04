import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { login, resetUserState } from '../slices/userSlice';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, loading, error } = useSelector((state) => state.user);
  
  // Lấy thông tin chuyển hướng sau khi đăng nhập
  const from = location.state?.from || '/';
  const requiresAdmin = location.state?.requiresAdmin || false;

  useEffect(() => {
    // Clear error khi component mount hoặc unmount
    return () => {
      dispatch(resetUserState());
    };
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      // Nếu yêu cầu quyền admin và user là admin
      if (requiresAdmin && user.role === 'admin') {
        navigate('/admin/dashboard');
      }
      // Nếu không yêu cầu quyền admin hoặc không phải là admin
      else if (!requiresAdmin) {
        navigate(from);
      }
    }
  }, [user, navigate, from, requiresAdmin]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login({ email, password }));
  };

  return (
    <FormContainer>
      <h1 className="mb-4 text-center">Đăng nhập</h1>
      
      {requiresAdmin && (
        <Alert variant="info">
          Trang bạn đang truy cập yêu cầu quyền quản trị viên.
        </Alert>
      )}
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Form onSubmit={submitHandler}>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Địa chỉ email</Form.Label>
          <Form.Control
            type="email"
            placeholder="Nhập email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Mật khẩu</Form.Label>
          <Form.Control
            type="password"
            placeholder="Nhập mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          className="w-100"
          disabled={loading}
        >
          {loading ? <Loader small /> : 'Đăng nhập'}
        </Button>
      </Form>

      <Row className="py-3">
        <Col>
          Chưa có tài khoản?{' '}
          <Link to="/register">Đăng ký</Link>
        </Col>
      </Row>
    </FormContainer>
  );
};

export default LoginPage; 