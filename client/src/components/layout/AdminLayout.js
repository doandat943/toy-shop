import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaChartBar, FaShoppingCart, FaBoxOpen, FaTag, FaUsers, FaHome, FaSignOutAlt, FaImages, FaTruck } from 'react-icons/fa';

const AdminLayout = () => {
  const location = useLocation();
  const { user } = useSelector((state) => state.user);
  
  const isActive = (path) => {
    const currentPath = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
    const targetPath = `/admin/${path}`.endsWith('/') ? `/admin/${path}`.slice(0, -1) : `/admin/${path}`;
    return currentPath === targetPath;
  };

  return (
    <div className="admin-layout">
      {/* Admin Header */}
      <header className="admin-header bg-dark text-white py-3">
        <Container fluid>
          <Row className="align-items-center">
            <Col>
              <h2 className="m-0">
                <Link to="/admin/dashboard" className="text-white text-decoration-none">
                  BabyBon Admin
                </Link>
              </h2>
            </Col>
            <Col className="text-end">
              <span className="me-3">Xin chào, {user?.name || 'Admin'}</span>
              <Link to="/" className="btn btn-outline-light btn-sm me-2">
                <FaHome /> Về trang chủ
              </Link>
              <Link to="/logout" className="btn btn-danger btn-sm">
                <FaSignOutAlt /> Đăng xuất
              </Link>
            </Col>
          </Row>
        </Container>
      </header>

      {/* Main Admin Content */}
      <Container fluid>
        <Row>
          {/* Sidebar */}
          <Col md={3} lg={2} className="admin-sidebar bg-light p-0">
            <Nav className="flex-column sidebar-nav">
              <Nav.Link 
                as={Link} 
                to="/admin/dashboard" 
                className={`py-3 border-bottom ${isActive('dashboard')}`}
              >
                <FaChartBar className="me-2" /> Tổng quan
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/orders" 
                className={`py-3 border-bottom ${isActive('orders')}`}
              >
                <FaShoppingCart className="me-2" /> Quản lý đơn hàng
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/products" 
                className={`py-3 border-bottom ${isActive('products')}`}
              >
                <FaBoxOpen className="me-2" /> Quản lý sản phẩm
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/promotions" 
                className={`py-3 border-bottom ${isActive('promotions')}`}
              >
                <FaTag className="me-2" /> Khuyến mãi
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/carousel" 
                className={`py-3 border-bottom ${isActive('carousel')}`}
              >
                <FaImages className="me-2" /> Quản lý Carousel
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/shipping" 
                className={`py-3 border-bottom ${isActive('shipping')}`}
              >
                <FaTruck className="me-2" /> Vận chuyển (GHN)
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/admin/customers" 
                className={`py-3 border-bottom ${isActive('customers')}`}
              >
                <FaUsers className="me-2" /> Khách hàng
              </Nav.Link>
            </Nav>
          </Col>

          {/* Main Content */}
          <Col md={9} lg={10} className="admin-content p-4">
            <Outlet />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AdminLayout; 