import React, { useEffect, useState } from 'react';
import { Container, Alert, Card, Button, Spinner } from 'react-bootstrap';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';

const OrderStatusPage = () => {
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const [paymentVerifying, setPaymentVerifying] = useState(false);

  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { userInfo } = useSelector(state => state.auth);

  // Extract query params from URL (for MoMo redirect)
  const queryParams = new URLSearchParams(location.search);
  const resultCode = queryParams.get('resultCode');
  const message = queryParams.get('message');
  const transId = queryParams.get('transId');

  useEffect(() => {
    if (!userInfo) {
      navigate('/login?redirect=/order/status/' + orderId);
      return;
    }

    const getOrderDetails = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/orders/${orderId}`);
        setOrder(data.order);

        // If order payment method is MoMo and we have resultCode, check payment status
        if (data.order.paymentMethod === 'momo' && resultCode) {
          await verifyMoMoPayment();
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Error loading order details');
      } finally {
        setLoading(false);
      }
    };

    getOrderDetails();
  }, [orderId, navigate, userInfo, resultCode]);

  const verifyMoMoPayment = async () => {
    try {
      setPaymentVerifying(true);
      const { data } = await axios.get(`/api/payment/verify-momo/${orderId}`);
      
      // If payment successful, update order directly without reload
      if (data.data.isPaid) {
        setOrder(prev => ({
          ...prev,
          isPaid: true,
          paidAt: data.data.paidAt,
          paymentResult: {
            id: data.data.transactionId,
            status: 'success',
            update_time: data.data.paidAt,
            payment_method: 'momo'
          }
        }));
      }
    } catch (error) {
      console.error('Error verifying MoMo payment:', error);
    } finally {
      setPaymentVerifying(false);
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Đang tải...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <div className="text-center mt-4">
          <Link to="/orders" className="btn btn-outline-primary">
            Xem tất cả đơn hàng
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <div className="text-center">
            {order && order.isPaid ? (
              <>
                <FaCheckCircle size={50} className="text-success mb-3" />
                <h2 className="mb-3">Thanh toán thành công!</h2>
                <p className="mb-4">Đơn hàng #{order.id} của bạn đã được thanh toán và đang được xử lý.</p>
              </>
            ) : resultCode === '0' ? (
              <>
                <FaSpinner size={50} className="text-warning mb-3" />
                <h2 className="mb-3">Đang xác nhận thanh toán...</h2>
                <p className="mb-4">Hệ thống đang xác nhận giao dịch của bạn. Vui lòng đợi trong giây lát.</p>
                {paymentVerifying && (
                  <div className="d-flex justify-content-center mb-3">
                    <Spinner animation="border" role="status" size="sm" className="me-2" />
                    <span>Đang kiểm tra trạng thái thanh toán...</span>
                  </div>
                )}
                <Button variant="primary" onClick={verifyMoMoPayment} disabled={paymentVerifying}>
                  {paymentVerifying ? 'Đang kiểm tra...' : 'Kiểm tra lại trạng thái thanh toán'}
                </Button>
              </>
            ) : (
              <>
                <FaTimesCircle size={50} className="text-danger mb-3" />
                <h2 className="mb-3">Thanh toán không thành công</h2>
                <p className="mb-4">
                  {message || 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.'}
                </p>
              </>
            )}
          </div>
          
          <div className="d-flex justify-content-center mt-4">
            <Link to={`/order/${orderId}`} className="btn btn-primary me-3">
              Xem chi tiết đơn hàng
            </Link>
            <Link to="/orders" className="btn btn-outline-secondary">
              Xem tất cả đơn hàng
            </Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default OrderStatusPage; 