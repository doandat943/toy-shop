import React, { useEffect, useState } from 'react';
import { Table, Button, Row, Col, Form, InputGroup, Badge } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import Meta from '../../components/Meta';
import Paginate from '../../components/Paginate';
import { fetchProducts, deleteProduct, resetProductState } from '../../slices/productSlice';
import { fetchCategories } from '../../slices/categorySlice';
import { formatPrice } from '../../utils/formatPrice';
import ConfirmModal from '../../components/ConfirmModal';

const ProductsListPage = () => {
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  // Get products state
  const { 
    products, 
    loading, 
    error, 
    pages,
    deleteSuccess,
  } = useSelector(state => state.product);

  // Get categories for filter
  const { categories, loading: categoriesLoading } = useSelector(state => state.category);

  // Load products
  useEffect(() => {
    dispatch(fetchCategories());
    loadProducts();
  }, [dispatch, page, limit, deleteSuccess]);

  // Reset success state when unmounting
  useEffect(() => {
    return () => {
      dispatch(resetProductState());
    };
  }, [dispatch]);

  const loadProducts = () => {
    const params = {
      page,
      limit,
      keyword: searchTerm || undefined,
      category: categoryFilter || undefined
    };
    dispatch(fetchProducts(params));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page on new search
    loadProducts();
  };

  const handleDeleteClick = (product) => {
    setProductToDelete(product);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (productToDelete) {
      dispatch(deleteProduct(productToDelete.id));
      setShowDeleteModal(false);
    }
  };

  return (
    <>
      <Meta title="Quản lý sản phẩm - BabyBon Admin" />
      <Row className="align-items-center mb-3">
        <Col>
          <h1>Sản phẩm</h1>
        </Col>
        <Col className="text-end">
          <LinkContainer to="/admin/product/create">
            <Button variant="primary">
              <FaPlus className="me-2" /> Thêm sản phẩm
            </Button>
          </LinkContainer>
        </Col>
      </Row>

      <Row className="mb-3">
        <Col md={8}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Tìm theo tên sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button variant="outline-primary" type="submit">
                <FaSearch />
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={4}>
          <Form.Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
              setTimeout(loadProducts, 0);
            }}
          >
            <option value="">Tất cả danh mục</option>
            {!categoriesLoading &&
              categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          <Table striped bordered hover responsive className="table-sm">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>Hình</th>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th>Đã bán</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>
                    <img
                      src={product.thumbnail || '/images/placeholder.jpg'}
                      alt={product.name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      className="img-thumbnail"
                    />
                  </td>
                  <td>
                    <LinkContainer to={`/admin/product/${product.id}/edit`}>
                      <a href="#" className="text-primary">
                        {product.name}
                      </a>
                    </LinkContainer>
                    {product.isFeatured && (
                      <Badge bg="info" className="ms-2">
                        Nổi bật
                      </Badge>
                    )}
                    {product.onSale && (
                      <Badge bg="danger" className="ms-1">
                        Sale
                      </Badge>
                    )}
                  </td>
                  <td>{product.category?.name || '-'}</td>
                  <td>
                    {product.onSale && product.salePrice ? (
                      <>
                        <span className="text-danger">{formatPrice(product.salePrice)}</span>
                        <br />
                        <small className="text-muted text-decoration-line-through">
                          {formatPrice(product.price)}
                        </small>
                      </>
                    ) : (
                      formatPrice(product.price)
                    )}
                  </td>
                  <td>
                    {product.stock > 0 ? (
                      product.stock <= 5 ? (
                        <span className="text-warning">{product.stock}</span>
                      ) : (
                        product.stock
                      )
                    ) : (
                      <span className="text-danger">Hết hàng</span>
                    )}
                  </td>
                  <td>{product.salesCount || 0}</td>
                  <td>
                    {product.isActive ? (
                      <FaCheck className="text-success" />
                    ) : (
                      <FaTimes className="text-danger" />
                    )}
                  </td>
                  <td>
                    <LinkContainer to={`/admin/product/${product.id}/edit`}>
                      <Button variant="light" size="sm" className="me-2">
                        <FaEdit />
                      </Button>
                    </LinkContainer>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClick(product)}
                    >
                      <FaTrash />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Paginate
            pages={pages}
            page={page}
            onChange={(pageNumber) => {
              setPage(pageNumber);
            }}
          />
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${productToDelete?.name}" không? Hành động này không thể hoàn tác.`}
      />
    </>
  );
};

export default ProductsListPage; 