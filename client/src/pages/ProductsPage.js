import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { Row, Col, Container, Button, Form } from 'react-bootstrap';
import { fetchProducts } from '../slices/productSlice';
import { fetchCategories } from '../slices/categorySlice';
import { addToWishlist, removeFromWishlist } from '../slices/wishlistSlice';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import { formatPrice } from '../utils/formatPrice';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  // Get URL parameters
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const categoryParam = searchParams.get('category') || '';
  const pageNumber = Number(searchParams.get('page')) || 1;
  const sortBy = searchParams.get('sortBy') || 'createdAt';
  const sortOrder = searchParams.get('sortOrder') || 'DESC';
  const minPrice = Number(searchParams.get('minPrice')) || '';
  const maxPrice = Number(searchParams.get('maxPrice')) || '';
  const minAge = Number(searchParams.get('minAge')) || '';
  const maxAge = Number(searchParams.get('maxAge')) || '';

  // Local state for filters
  const [localCategory, setLocalCategory] = useState(categoryParam);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice);
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice);
  const [localMinAge, setLocalMinAge] = useState(minAge);
  const [localMaxAge, setLocalMaxAge] = useState(maxAge);

  // Get state from Redux
  const { products, loading, error, pages, page, total } = useSelector(
    (state) => state.product
  );
  const { categories, loading: categoryLoading } = useSelector(
    (state) => state.category
  );
  const { wishlistItems } = useSelector((state) => state.wishlist);

  // Fetch products based on filters
  useEffect(() => {
    dispatch(
      fetchProducts({
        keyword,
        page: pageNumber,
        category: categoryParam,
        sortBy,
        sortOrder,
        minPrice,
        maxPrice,
        minAge,
        maxAge,
      })
    );
  }, [
    dispatch,
    keyword,
    pageNumber,
    categoryParam,
    sortBy,
    sortOrder,
    minPrice,
    maxPrice,
    minAge,
    maxAge,
  ]);

  // Fetch categories
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Apply filters
  const applyFilters = () => {
    let url = '/products?';
    if (keyword) url += `keyword=${keyword}&`;
    if (localCategory) url += `category=${localCategory}&`;
    if (localSortBy) url += `sortBy=${localSortBy}&sortOrder=${localSortOrder}&`;
    if (localMinPrice) url += `minPrice=${localMinPrice}&`;
    if (localMaxPrice) url += `maxPrice=${localMaxPrice}&`;
    if (localMinAge) url += `minAge=${localMinAge}&`;
    if (localMaxAge) url += `maxAge=${localMaxAge}&`;
    url += `page=1`;
    
    navigate(url);
  };

  // Reset filters
  const resetFilters = () => {
    setLocalCategory('');
    setLocalSortBy('createdAt');
    setLocalSortOrder('DESC');
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalMinAge('');
    setLocalMaxAge('');
    
    navigate('/products');
  };

  // Toggle wishlist
  const toggleWishlist = (productId) => {
    const isInWishlist = wishlistItems.includes(productId);
    
    if (isInWishlist) {
      dispatch(removeFromWishlist(productId));
    } else {
      dispatch(addToWishlist(productId));
    }
  };

  return (
    <div className="products-page py-4">
      <Container>
        <h1 className="page-title">Sản phẩm</h1>
        {keyword && (
          <div className="mb-4">
            <h3 className="search-results-title">Kết quả tìm kiếm cho: "{keyword}"</h3>
          </div>
        )}
        
        <Row className="mt-4">
          <Col md={4} lg={3}>
            <div className="filter-section p-3 border rounded shadow-sm">
              <h4 className="filter-title mb-3">Bộ lọc</h4>
              
              <Form.Group className="mb-3">
                <Form.Label>Danh mục</Form.Label>
                <Form.Control
                  as="select"
                  value={localCategory}
                  onChange={(e) => setLocalCategory(e.target.value)}
                >
                  <option value="">Tất cả danh mục</option>
                  {!categoryLoading &&
                    categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </Form.Control>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Giá</Form.Label>
                <Row>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder="Từ"
                      value={localMinPrice}
                      onChange={(e) => setLocalMinPrice(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder="Đến"
                      value={localMaxPrice}
                      onChange={(e) => setLocalMaxPrice(e.target.value)}
                    />
                  </Col>
                </Row>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Độ tuổi (tháng)</Form.Label>
                <Row>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder="Từ"
                      value={localMinAge}
                      onChange={(e) => setLocalMinAge(e.target.value)}
                    />
                  </Col>
                  <Col>
                    <Form.Control
                      type="number"
                      placeholder="Đến"
                      value={localMaxAge}
                      onChange={(e) => setLocalMaxAge(e.target.value)}
                    />
                  </Col>
                </Row>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Sắp xếp theo</Form.Label>
                <Form.Control
                  as="select"
                  value={localSortBy}
                  onChange={(e) => setLocalSortBy(e.target.value)}
                >
                  <option value="createdAt">Mới nhất</option>
                  <option value="price">Giá</option>
                  <option value="name">Tên</option>
                  <option value="rating">Đánh giá</option>
                </Form.Control>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Thứ tự</Form.Label>
                <Form.Control
                  as="select"
                  value={localSortOrder}
                  onChange={(e) => setLocalSortOrder(e.target.value)}
                >
                  <option value="ASC">Tăng dần</option>
                  <option value="DESC">Giảm dần</option>
                </Form.Control>
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button variant="primary" onClick={applyFilters}>
                  Áp dụng
                </Button>
                <Button variant="outline-secondary" onClick={resetFilters}>
                  Xóa bộ lọc
                </Button>
              </div>
            </div>
          </Col>
          
          <Col md={8} lg={9}>
            {loading ? (
              <Loader />
            ) : error ? (
              <Message variant="danger">{error}</Message>
            ) : (
              <>
                <Row className="mb-3 align-items-center">
                  <Col>
                    <p className="mb-0">Hiển thị {products.length} / {total} sản phẩm</p>
                  </Col>
                </Row>
                
                {products.length === 0 ? (
                  <Message>Không tìm thấy sản phẩm nào</Message>
                ) : (
                  <>
                    <Row>
                      {products.map((product) => (
                        <Col key={product.id} sm={6} md={4} lg={4} className="mb-4">
                          <ProductCard
                            product={product}
                            isFavorite={wishlistItems.includes(product.id)}
                            onToggleFavorite={toggleWishlist}
                          />
                        </Col>
                      ))}
                    </Row>
                    
                    <Paginate
                      pages={pages}
                      page={page}
                      keyword={keyword ? keyword : ''}
                      category={categoryParam}
                      sortBy={sortBy}
                      sortOrder={sortOrder}
                      minPrice={minPrice}
                      maxPrice={maxPrice}
                      minAge={minAge}
                      maxAge={maxAge}
                    />
                  </>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
      <style jsx global>{`
        .products-page .page-title,
        .products-page .search-results-title {
          color: #333;
          font-weight: 600;
          margin-bottom: 1.5rem !important;
        }
        .products-page .page-title {
          border-bottom: 2px solid #FF6B6B;
          display: inline-block;
          padding-bottom: 0.25rem;
        }
        .filter-section {
          background-color: #fdfdff;
        }
        .filter-section .filter-title {
            font-weight: 600;
            color: #333;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #eee;
        }
        .filter-section .form-label {
            font-weight: 500;
            font-size: 0.95rem;
            color: #555;
        }
        .filter-section .form-control,
        .filter-section .form-select {
            font-size: 0.9rem;
        }
        .filter-section .btn-primary {
            background-color: #FF6B6B;
            border-color: #FF6B6B;
            font-weight: 500;
        }
        .filter-section .btn-primary:hover {
            background-color: #e05252;
            border-color: #e05252;
        }
        .filter-section .btn-outline-secondary {
            font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default ProductsPage; 