import React, { useState } from 'react';
import { Button, Alert, Spinner } from 'react-bootstrap';
import { FaQrcode } from 'react-icons/fa';
import axios from 'axios';

const MoMoPayment = ({ orderInfo, onPaymentSuccess, onPaymentError, showRetryButton = false }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [verificationInterval, setVerificationInterval] = useState(null);

  // Initiate MoMo payment
  const initiatePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data } = await axios.post('/api/payment/create-momo-payment', {
        orderId: orderInfo.orderId,
        amount: orderInfo.total,
        orderInfo: `Thanh toán đơn hàng #${orderInfo.orderId}`
      });

      if (!data.success || !data.data || !data.data.payUrl) {
        throw new Error('Không nhận được URL thanh toán từ MoMo');
      }

      setPaymentData(data.data);
      
      // Open MoMo payment URL in a new window
      window.open(data.data.payUrl, '_self');
      
      // Start checking payment status
      startPaymentVerification(orderInfo.orderId);
    } catch (error) {
      console.error('Error creating MoMo payment:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán MoMo');
      onPaymentError(error.response?.data?.message || 'Có lỗi xảy ra khi tạo thanh toán MoMo');
    } finally {
      setLoading(false);
    }
  };

  // Start checking payment status periodically
  const startPaymentVerification = (orderId) => {
    // Clear any existing interval
    if (verificationInterval) {
      clearInterval(verificationInterval);
    }
    
    // Check payment status immediately
    verifyPayment(orderId);
    
    // Then check every 10 seconds
    const intervalId = setInterval(() => {
      verifyPayment(orderId);
    }, 10000); // 10 seconds
    
    setVerificationInterval(intervalId);
  };

  // Verify payment status
  const verifyPayment = async (orderId) => {
    try {
      const { data } = await axios.get(`/api/payment/verify-momo/${orderId}`);
      
      // If payment is successful
      if (data.data.isPaid) {
        // Clear the interval
        if (verificationInterval) {
          clearInterval(verificationInterval);
          setVerificationInterval(null);
        }
        
        onPaymentSuccess(data.data);
      }
    } catch (error) {
      console.error('Error verifying MoMo payment:', error);
    }
  };

  // Cleanup interval on component unmount
  React.useEffect(() => {
    return () => {
      if (verificationInterval) {
        clearInterval(verificationInterval);
      }
    };
  }, [verificationInterval]);

  return (
    <div className="momo-payment-container p-3">
      <h5>Thanh toán qua ví MoMo</h5>
      
      {error && (
        <Alert variant="danger" className="mt-3">
          {error}
        </Alert>
      )}
      
      {paymentData ? (
        <div className="mt-3">
          <Alert variant="info">
            <p>Cửa sổ thanh toán MoMo đã được mở. Vui lòng hoàn tất thanh toán.</p>
            <p>Nếu cửa sổ không mở, vui lòng nhấp vào nút bên dưới:</p>
            <div className="d-grid gap-2 mt-3">
              <Button 
                variant="info"
                onClick={() => window.open(paymentData.payUrl, '_self')}
              >
                Mở cửa sổ thanh toán MoMo
              </Button>
            </div>
          </Alert>
          <div className="mt-3 text-center">
            <Spinner animation="border" variant="primary" className="me-2" />
            <span>Đang chờ xác nhận thanh toán...</span>
          </div>
        </div>
      ) : (
        <div className="mt-3">
          {showRetryButton ? (
            <div>
              <p>Bạn có thể thực hiện lại thanh toán MoMo cho đơn hàng này:</p>
              <div className="d-grid gap-2 mt-3">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={initiatePayment}
                  disabled={loading}
                  className="momo-payment-button"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaQrcode className="me-2" />
                      Thực hiện lại thanh toán với MoMo
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <p>Bạn sẽ được chuyển đến trang thanh toán MoMo để hoàn tất giao dịch.</p>
              <div className="d-grid gap-2 mt-3">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={initiatePayment}
                  disabled={loading}
                  className="momo-payment-button"
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        role="status"
                        aria-hidden="true"
                        className="me-2"
                      />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <FaQrcode className="me-2" />
                      Thanh toán với MoMo
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      <style jsx>{`
        .momo-payment-button {
          background-color: #ae2070;
          border-color: #ae2070;
        }
        .momo-payment-button:hover:not(:disabled) {
          background-color: #8d1b5c;
          border-color: #8d1b5c;
        }
      `}</style>
    </div>
  );
};

export default MoMoPayment; 