import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Row, Col, Form, Modal, Alert } from 'react-bootstrap';
import { FaPlus, FaTrash, FaEdit } from 'react-icons/fa';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { fetchCarouselItems, addCarouselItem, updateCarouselItem, deleteCarouselItem } from '../../slices/carouselSlice';

const CarouselManagementPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.carousel);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [order, setOrder] = useState(0);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    dispatch(fetchCarouselItems());
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};
    if (!imageUrl.trim()) errors.imageUrl = 'Image URL is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(addCarouselItem({ image: imageUrl, caption, order }));
    setImageUrl('');
    setCaption('');
    setOrder(0);
    setShowAddModal(false);
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setImageUrl(item.image);
    setCaption(item.caption || '');
    setOrder(item.order || 0);
    setShowEditModal(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(updateCarouselItem({ id: selectedItem.id, image: imageUrl, caption, order }));
    setShowEditModal(false);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    dispatch(deleteCarouselItem(selectedItem.id));
    setShowDeleteModal(false);
  };

  return (
    <>
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Quản lý Carousel</h1>
        </Col>
        <Col className="text-end">
          <Button variant="primary" onClick={() => setShowAddModal(true)}>
            <FaPlus className="me-2" /> Thêm ảnh Carousel
          </Button>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Table striped bordered hover responsive className="table-sm mt-3">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ảnh</th>
              <th>Chú thích</th>
              <th>Thứ tự</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {items && items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>
                    <img src={item.image} alt="Carousel" style={{ width: '100px', height: 'auto' }} />
                  </td>
                  <td>{item.caption || 'N/A'}</td>
                  <td>{item.order}</td>
                  <td>
                    <Button
                      variant="light"
                      className="btn-sm me-2"
                      onClick={() => handleEditClick(item)}
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      className="btn-sm"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center">
                  Không có mục carousel nào
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      )}

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Thêm ảnh Carousel mới</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleAddSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>URL ảnh</Form.Label>
              <Form.Control
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                isInvalid={!!formErrors.imageUrl}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.imageUrl}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Chú thích (tuỳ chọn)</Form.Label>
              <Form.Control
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Thứ tự hiển thị</Form.Label>
              <Form.Control
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Thêm mới
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Chỉnh sửa ảnh Carousel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleEditSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>URL ảnh</Form.Label>
              <Form.Control
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                isInvalid={!!formErrors.imageUrl}
              />
              <Form.Control.Feedback type="invalid">
                {formErrors.imageUrl}
              </Form.Control.Feedback>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Chú thích (tuỳ chọn)</Form.Label>
              <Form.Control
                type="text"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Thứ tự hiển thị</Form.Label>
              <Form.Control
                type="number"
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
              />
            </Form.Group>
            <Button variant="primary" type="submit" className="mt-3">
              Lưu thay đổi
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Alert variant="danger">
            Bạn có chắc chắn muốn xóa ảnh carousel này? Hành động này không thể hoàn tác.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Hủy
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Xóa
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CarouselManagementPage; 