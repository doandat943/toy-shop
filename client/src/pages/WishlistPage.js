import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, Container, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { removeFromWishlist, clearWishlist } from '../slices/wishlistSlice';
import { fetchProducts } from '../slices/productSlice';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { products, loading, error } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  // Lọc ra các sản phẩm có trong wishlist
  const wishlistProducts = products.filter(
    (product) => wishlistItems.includes(product.id)
  );

  const handleRemove = (id) => {
    dispatch(removeFromWishlist(id));
  };

  const handleClear = () => {
    dispatch(clearWishlist());
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Sản phẩm yêu thích</h2>
      {wishlistItems.length === 0 ? (
        <Alert variant="info">
          Danh sách yêu thích của bạn đang trống. <Link to="/products">Khám phá sản phẩm</Link>
        </Alert>
      ) : (
        <>
          <div className="d-flex justify-content-end mb-3">
            <Button variant="outline-danger" onClick={handleClear} size="sm">
              Xóa tất cả
            </Button>
          </div>
          <Row>
            {wishlistProducts.length === 0 && (
              <Col>
                <Alert variant="warning">Không tìm thấy sản phẩm nào trong wishlist.</Alert>
              </Col>
            )}
            {wishlistProducts.map((product) => (
              <Col key={product.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <div style={{ position: 'relative' }}>
                  <ProductCard
                    product={product}
                    isFavorite={true}
                    onToggleFavorite={handleRemove}
                  />
                  <Button
                    variant="danger"
                    size="sm"
                    style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}
                    onClick={() => handleRemove(product.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </Col>
            ))}
          </Row>
        </>
      )}
    </Container>
  );
};

export default WishlistPage; 