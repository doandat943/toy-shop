import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Alert, Button, Card, Spinner } from 'react-bootstrap';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import axios from 'axios';

const PaymentResultPage = () => {
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.user);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId');
    const resultCode = queryParams.get('resultCode');
    const momoOrderId = queryParams.get('momoOrderId');

    if (!orderId) {
      setError('Không tìm thấy thông tin đơn hàng');
      setLoading(false);
      return;
    }

    // Giả định xử lý thanh toán thành công trong môi trường phát triển
    const processPayment = async () => {
      try {
        let paymentSuccess = resultCode === '0' || resultCode === 0;

        if (paymentSuccess) {
          // Nếu là môi trường dev, cập nhật trạng thái đơn hàng
          if (process.env.NODE_ENV === 'development') {
            // Giả lập gọi API cập nhật đơn hàng đã thanh toán
            setResult({
              status: 'success',
              message: 'Thanh toán thành công!',
              orderId: orderId,
            });
          }
        } else {
          setResult({
            status: 'failure',
            message: 'Thanh toán thất bại hoặc bị hủy.',
            orderId: orderId,
          });
        }
      } catch (err) {
        console.error('Error processing payment result:', err);
        setError(err.response?.data?.message || 'Có lỗi xảy ra khi xử lý thanh toán');
      } finally {
        setLoading(false);
      }
    };

    processPayment();
  }, [location.search, user]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Đang xử lý kết quả thanh toán...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate('/')}>
          Quay lại trang chủ
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="payment-result-card">
        <Card.Body className="text-center p-5">
          {result?.status === 'success' ? (
            <>
              <FaCheckCircle size={80} className="text-success mb-4" />
              <h2>Thanh toán thành công</h2>
              <p className="mb-4">Cảm ơn bạn đã đặt hàng. Đơn hàng của bạn đã được thanh toán thành công.</p>
            </>
          ) : (
            <>
              <FaTimesCircle size={80} className="text-danger mb-4" />
              <h2>Thanh toán thất bại</h2>
              <p className="mb-4">{result?.message || 'Có lỗi xảy ra trong quá trình thanh toán.'}</p>
            </>
          )}
          
          <div className="d-flex justify-content-center mt-4">
            <Button 
              variant="outline-primary" 
              className="me-3" 
              onClick={() => navigate('/')}
            >
              Tiếp tục mua sắm
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate(`/order/${result?.orderId}`)}
            >
              Xem chi tiết đơn hàng
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentResultPage; 