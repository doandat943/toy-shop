import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Spinner, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminShippingPanel = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [creatingShipping, setCreatingShipping] = useState(false);
  
  const navigate = useNavigate();
  
  // Fetch pending orders that need shipping
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/orders?status=pending,processing');
        
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        setError('Lỗi khi tải danh sách đơn hàng');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Fetch available shipping services when an order is selected
  useEffect(() => {
    const fetchServices = async () => {
      if (!selectedOrder) return;
      
      // Parse shipping address
      const shippingAddress = typeof selectedOrder.shippingAddress === 'string'
        ? JSON.parse(selectedOrder.shippingAddress)
        : selectedOrder.shippingAddress;
      
      if (!shippingAddress || !shippingAddress.districtId) {
        toast.error('Đơn hàng này không có thông tin địa chỉ hợp lệ');
        return;
      }
      
      try {
        setLoading(true);
        
        const { data } = await axios.post('/api/shipping/services', {
          fromDistrictId: 1454, // Example shop district ID (should be configured)
          toDistrictId: shippingAddress.districtId
        });
        
        if (data.success && data.data) {
          setServices(data.data);
          
          // Select standard service by default
          const standardService = data.data.find(s => s.service_type_id === 2);
          if (standardService) {
            setSelectedService(standardService.service_id);
          } else if (data.data.length > 0) {
            setSelectedService(data.data[0].service_id);
          }
        }
      } catch (err) {
        toast.error('Lỗi khi tải dịch vụ vận chuyển');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [selectedOrder]);
  
  // Handle order selection
  const handleOrderSelect = (order) => {
    setSelectedOrder(order);
  };
  
  // Handle service selection
  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
  };
  
  // Create shipping order
  const handleCreateShipping = async () => {
    if (!selectedOrder || !selectedService) {
      toast.error('Vui lòng chọn đơn hàng và dịch vụ vận chuyển');
      return;
    }
    
    try {
      setCreatingShipping(true);
      
      const { data } = await axios.post('/api/shipping/orders', {
        orderId: selectedOrder.id,
        serviceId: selectedService,
        requiredNote: 'KHONGCHOXEMHANG' // Default, can be made configurable
      });
      
      if (data.success) {
        toast.success('Đã tạo đơn vận chuyển thành công');
        
        // Update local orders list
        setOrders(orders.filter(o => o.id !== selectedOrder.id));
        setSelectedOrder(null);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi tạo đơn vận chuyển');
      console.error(err);
    } finally {
      setCreatingShipping(false);
    }
  };
  
  // Handle view order details
  const handleViewOrder = (orderId) => {
    navigate(`/admin/orders/${orderId}`);
  };
  
  // Loading state
  if (loading && orders.length === 0) {
    return (
      <Container className="py-3">
        <div className="text-center">
          <Spinner animation="border" />
          <p>Đang tải dữ liệu...</p>
        </div>
      </Container>
    );
  }
  
  return (
    <Container fluid className="py-3">
      <h1 className="mb-4">Quản lý Vận chuyển (GHN)</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={7}>
          <Card className="mb-4">
            <Card.Header as="h5">Đơn hàng chờ vận chuyển</Card.Header>
            <Card.Body>
              {orders.length === 0 ? (
                <Alert variant="info">Không có đơn hàng nào chờ vận chuyển</Alert>
              ) : (
                <Table responsive striped hover>
                  <thead>
                    <tr>
                      <th>Mã đơn hàng</th>
                      <th>Khách hàng</th>
                      <th>Ngày đặt</th>
                      <th>Tổng tiền</th>
                      <th>Trạng thái</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr 
                        key={order.id} 
                        className={selectedOrder?.id === order.id ? 'table-primary' : ''}
                        onClick={() => handleOrderSelect(order)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td>{order.orderNumber}</td>
                        <td>{order.customerName}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>{parseInt(order.totalAmount).toLocaleString('vi-VN')}₫</td>
                        <td>
                          <span className={`badge bg-${order.status === 'pending' ? 'warning' : 'info'}`}>
                            {order.status === 'pending' ? 'Chờ xử lý' : 'Đang xử lý'}
                          </span>
                        </td>
                        <td>
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewOrder(order.id);
                            }}
                          >
                            Chi tiết
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={5}>
          <Card>
            <Card.Header as="h5">Tạo đơn vận chuyển</Card.Header>
            <Card.Body>
              {!selectedOrder ? (
                <Alert variant="info">Vui lòng chọn một đơn hàng từ danh sách</Alert>
              ) : (
                <>
                  <div className="mb-4">
                    <h5>Thông tin đơn hàng</h5>
                    <p><strong>Mã đơn hàng:</strong> {selectedOrder.orderNumber}</p>
                    <p><strong>Khách hàng:</strong> {selectedOrder.customerName}</p>
                    <p><strong>Tổng tiền:</strong> {parseInt(selectedOrder.totalAmount).toLocaleString('vi-VN')}₫</p>
                    
                    {selectedOrder.orderItems && (
                      <>
                        <p><strong>Số lượng sản phẩm:</strong> {selectedOrder.orderItems.length}</p>
                        <p><strong>Phương thức thanh toán:</strong> {
                          selectedOrder.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng' : 
                          selectedOrder.paymentMethod === 'bank_transfer' ? 'Chuyển khoản ngân hàng' :
                          selectedOrder.paymentMethod
                        }</p>
                      </>
                    )}
                  </div>
                  
                  <div className="mb-4">
                    <h5>Chọn dịch vụ vận chuyển</h5>
                    {services.length === 0 ? (
                      <Alert variant="warning">Không có dịch vụ vận chuyển khả dụng cho khu vực này</Alert>
                    ) : (
                      <Form.Group>
                        <Form.Control
                          as="select"
                          value={selectedService}
                          onChange={handleServiceChange}
                        >
                          {services.map(service => (
                            <option key={service.service_id} value={service.service_id}>
                              {service.short_name || `Dịch vụ ${service.service_id}`}
                            </option>
                          ))}
                        </Form.Control>
                      </Form.Group>
                    )}
                  </div>
                  
                  <Button
                    variant="success"
                    onClick={handleCreateShipping}
                    disabled={creatingShipping || !selectedService}
                    className="w-100"
                  >
                    {creatingShipping ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                        />
                        {' '}Đang tạo đơn...
                      </>
                    ) : (
                      'Tạo đơn vận chuyển'
                    )}
                  </Button>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminShippingPanel; 