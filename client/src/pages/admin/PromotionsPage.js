import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Form, Modal, Alert, Spinner, Row, Col, Card, Badge } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { getPromoCodes, createPromoCode, resetPromotionState } from '../../slices/promotionSlice';

const PromotionsPage = () => {
  const dispatch = useDispatch();
  const { promoCodes, adminLoading, adminError, createSuccess } = useSelector((state) => state.promotion);
  
  const [showModal, setShowModal] = useState(false);
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState('percentage');
  const [discountValue, setDiscountValue] = useState(0);
  const [minOrderValue, setMinOrderValue] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(getPromoCodes());
  }, [dispatch]);

  useEffect(() => {
    if (createSuccess) {
      setShowModal(false);
      resetForm();
      dispatch(resetPromotionState());
    }
  }, [createSuccess, dispatch]);

  const resetForm = () => {
    setCode('');
    setDiscountType('percentage');
    setDiscountValue(0);
    setMinOrderValue(0);
    setMaxDiscount('');
    setStartDate('');
    setEndDate('');
    setMaxUses('');
    setDescription('');
    setIsActive(true);
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (!code) {
      setError('Mã giảm giá không được để trống');
      return;
    }
    
    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
      setError('Phần trăm giảm giá phải từ 1-100%');
      return;
    }
    
    if (discountType === 'fixed' && discountValue <= 0) {
      setError('Giá trị giảm phải lớn hơn 0');
      return;
    }
    
    const promoData = {
      code: code.toUpperCase(),
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      startDate: startDate || new Date(),
      endDate: endDate || null,
      maxUses: maxUses ? Number(maxUses) : null,
      description,
      isActive
    };
    
    dispatch(createPromoCode(promoData));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không giới hạn';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const formatDiscount = (type, value) => {
    if (type === 'percentage') {
      return `${value}%`;
    } else if (type === 'fixed') {
      return `${value.toLocaleString('vi-VN')}đ`;
    } else {
      return value;
    }
  };

  if (adminLoading && !promoCodes.length) {
    return (
      <div className="d-flex justify-content-center my-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <Container className="py-5">
      <Row className="mb-4 align-items-center">
        <Col>
          <h1 className="mb-0">Quản lý mã khuyến mãi</h1>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => setShowModal(true)}>
            Tạo mã khuyến mãi mới
          </Button>
        </Col>
      </Row>

      {adminError && (
        <Alert variant="danger" className="mb-4">
          {adminError}
        </Alert>
      )}

      <Card>
        <Table responsive hover className="mb-0">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Giảm giá</th>
              <th>Đơn tối thiểu</th>
              <th>Thời hạn</th>
              <th>Đã sử dụng</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {promoCodes.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-4">Chưa có mã khuyến mãi nào</td>
              </tr>
            ) : (
              promoCodes.map((promo) => (
                <tr key={promo.id}>
                  <td>
                    <strong>{promo.code}</strong>
                    {promo.description && (
                      <div className="small text-muted">{promo.description}</div>
                    )}
                  </td>
                  <td>{formatDiscount(promo.discountType, promo.discountValue)}</td>
                  <td>
                    {promo.minOrderValue > 0 
                      ? `${promo.minOrderValue.toLocaleString('vi-VN')}đ` 
                      : 'Không giới hạn'}
                  </td>
                  <td>
                    <div>Từ: {formatDate(promo.startDate)}</div>
                    <div>Đến: {formatDate(promo.endDate)}</div>
                  </td>
                  <td>
                    {promo.maxUses 
                      ? `${promo.usedCount}/${promo.maxUses}` 
                      : promo.usedCount}
                  </td>
                  <td>
                    {promo.isActive ? (
                      <Badge bg="success">Đang hoạt động</Badge>
                    ) : (
                      <Badge bg="danger">Đã vô hiệu</Badge>
                    )}
                  </td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-2"
                    >
                      Sửa
                    </Button>
                    <Button 
                      variant={promo.isActive ? 'outline-danger' : 'outline-success'} 
                      size="sm"
                    >
                      {promo.isActive ? 'Vô hiệu' : 'Kích hoạt'}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* Create Promo Code Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Tạo mã khuyến mãi mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mã khuyến mãi <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Nhập mã (VD: SUMMER2023)"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    required
                  />
                  <Form.Text className="text-muted">
                    Mã sẽ được tự động chuyển thành chữ in hoa
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Loại giảm giá <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                    required
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VND)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị giảm <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step={discountType === 'percentage' ? '1' : '1000'}
                    placeholder={discountType === 'percentage' ? 'Nhập % giảm giá' : 'Nhập số tiền giảm'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    {discountType === 'percentage' 
                      ? 'Giảm giá theo % (1-100%)' 
                      : 'Giảm giá trực tiếp (VND)'}
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giá trị đơn hàng tối thiểu</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="0 = Không giới hạn"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Giảm tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    step="10000"
                    placeholder="Để trống = Không giới hạn"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    disabled={discountType !== 'percentage'}
                  />
                  <Form.Text className="text-muted">
                    Chỉ áp dụng cho giảm giá theo %
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Số lần sử dụng tối đa</Form.Label>
                  <Form.Control
                    type="number"
                    min="1"
                    placeholder="Để trống = Không giới hạn"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày bắt đầu</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Để trống = Ngay bây giờ
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Ngày kết thúc</Form.Label>
                  <Form.Control
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <Form.Text className="text-muted">
                    Để trống = Không hết hạn
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Mô tả</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Mô tả ngắn về mã khuyến mãi"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Check
                type="switch"
                id="active-switch"
                label="Kích hoạt ngay"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSubmit}
            disabled={adminLoading}
          >
            {adminLoading ? 'Đang xử lý...' : 'Tạo mã khuyến mãi'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default PromotionsPage; 