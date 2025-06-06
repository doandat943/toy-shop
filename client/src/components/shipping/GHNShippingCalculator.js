import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Spinner, Card } from 'react-bootstrap';
import axios from 'axios';

const GHNShippingCalculator = ({ onSelectService, selectedDistrict, selectedWard }) => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [fee, setFee] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // This would be configured in a real app
  const shopDistrictId = 1454; // Example: District 1, Ho Chi Minh City
  const shopWardCode = '21012'; // Example ward code
  
  // Fetch available shipping services
  useEffect(() => {
    const fetchServices = async () => {
      if (!selectedDistrict) return;
      
      try {
        setLoading(true);
        setError('');
        
        const { data } = await axios.post('/api/shipping/services', {
          fromDistrictId: shopDistrictId,
          toDistrictId: selectedDistrict
        });
        
        if (data.success && data.data && data.data.length > 0) {
          setServices(data.data);
          // Auto-select the standard shipping option if available
          const standardService = data.data.find(s => s.service_type_id === 2);
          if (standardService) {
            setSelectedService(standardService.service_id);
          } else if (data.data[0]) {
            setSelectedService(data.data[0].service_id);
          }
        } else {
          setError('Không có dịch vụ vận chuyển khả dụng cho khu vực này');
        }
      } catch (err) {
        setError('Lỗi khi lấy thông tin dịch vụ vận chuyển');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchServices();
  }, [selectedDistrict]);
  
  // Calculate shipping fee when service is selected
  useEffect(() => {
    const calculateFee = async () => {
      if (!selectedService || !selectedDistrict || !selectedWard) return;
      
      try {
        setLoading(true);
        
        const { data } = await axios.post('/api/shipping/calculate', {
          serviceId: selectedService,
          fromDistrictId: shopDistrictId,
          fromWardCode: shopWardCode,
          toDistrictId: selectedDistrict,
          toWardCode: selectedWard,
          weight: 500, // Default weight in grams (can be calculated based on cart)
          length: 15,  // Default dimensions
          width: 15,
          height: 10,
          insuranceValue: 0
        });
        
        if (data.success && data.data) {
          setFee(data.data);
          
          // Pass selected service info to parent
          if (onSelectService) {
            onSelectService({
              serviceId: selectedService,
              fee: data.data.total || 0,
              serviceName: services.find(s => s.service_id === parseInt(selectedService))?.short_name || 'Tiêu chuẩn'
            });
          }
        }
      } catch (err) {
        setError('Lỗi khi tính phí vận chuyển');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    calculateFee();
  }, [selectedService, selectedDistrict, selectedWard, onSelectService, services]);
  
  // Handle service selection
  const handleServiceChange = (e) => {
    setSelectedService(e.target.value);
  };
  
  // Loading state
  if (loading && !fee) {
    return (
      <div className="text-center my-3">
        <Spinner animation="border" />
        <p>Đang tính phí vận chuyển...</p>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }
  
  // No district/ward selected
  if (!selectedDistrict || !selectedWard) {
    return <Alert variant="info">Vui lòng chọn Quận/Huyện và Phường/Xã để tính phí vận chuyển</Alert>;
  }

  return (
    <Card className="mb-3">
      <Card.Body>
        <Card.Title>Phương thức vận chuyển</Card.Title>
        
        {services.length > 0 ? (
          <Form>
            <Form.Group>
              <Form.Label>Chọn dịch vụ vận chuyển</Form.Label>
              <Form.Control 
                as="select" 
                value={selectedService} 
                onChange={handleServiceChange}
              >
                {services.map(service => (
                  <option key={service.service_id} value={service.service_id}>
                    {service.short_name} 
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            
            {fee && (
              <div className="mt-3">
                <h5>Chi phí vận chuyển:</h5>
                <p className="lead">{parseInt(fee.total || 0).toLocaleString('vi-VN')}₫</p>
                
                {fee.expected_delivery_time && (
                  <p>
                    <small>
                      Thời gian giao hàng dự kiến: {new Date(fee.expected_delivery_time).toLocaleDateString('vi-VN')}
                    </small>
                  </p>
                )}
              </div>
            )}
          </Form>
        ) : (
          <Alert variant="warning">
            Không có dịch vụ vận chuyển khả dụng cho khu vực này
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default GHNShippingCalculator; 