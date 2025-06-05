import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHeart, FaCogs, FaRocket, FaGift, FaBlog } from 'react-icons/fa';
import { logout } from '../../slices/userSlice';
import SearchBox from '../SearchBox';
import { Link } from 'react-router-dom';

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header>
      <Navbar 
        expand="lg" 
        collapseOnSelect 
        className="py-2 position-sticky"
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'all 0.3s ease',
          top: 0,
          zIndex: 1000,
        }}
      >
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center">
              <div 
                style={{
                  width: '40px',
                  height: '40px',
                  background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  boxShadow: '0 2px 10px rgba(255, 107, 107, 0.5)',
                  marginRight: '10px'
                }}
              >
                <FaRocket />
              </div>
              <span 
                style={{
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  fontSize: '1.5rem'
                }}
              >
                BabyBon
              </span>
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <SearchBox />
            <Nav className="ms-auto">
              <LinkContainer to="/products">
                <Nav.Link className="mx-2 position-relative nav-link-hover">Sản Phẩm</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/wishlist">
                <Nav.Link className="mx-2 position-relative nav-link-hover">
                  <FaHeart className="me-1" /> Yêu Thích
                  {wishlistItems.length > 0 && (
                    <Badge 
                      pill 
                      bg="danger" 
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        transform: 'translate(50%, -30%)'
                      }}
                    >
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/cart">
                <Nav.Link className="mx-2 position-relative nav-link-hover">
                  <FaShoppingCart className="me-1" /> Giỏ Hàng
                  {cartItems.length > 0 && (
                    <Badge 
                      pill 
                      bg="danger" 
                      style={{
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        transform: 'translate(50%, -30%)'
                      }}
                    >
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>

              {user ? (
                <NavDropdown 
                  title={<><FaUser className="me-1" /> {user.name}</>} 
                  id="username"
                  className="mx-2"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Tài khoản</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/orders">
                    <NavDropdown.Item>Đơn hàng</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link className="mx-2 nav-link-hover">
                    <FaUser className="me-1" /> Đăng nhập
                  </Nav.Link>
                </LinkContainer>
              )}

              {user && user.role === 'admin' && (
                <NavDropdown 
                  title={<><FaCogs className="me-1" /> Admin</>} 
                  id="adminmenu"
                  className="mx-2"
                >
                  <NavDropdown.Item as={Link} to="/admin/dashboard">
                    <FaCogs className="me-2" /> Quản trị hệ thống
                  </NavDropdown.Item>
                  <LinkContainer to="/admin/products">
                    <NavDropdown.Item>Sản phẩm</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orders">
                    <NavDropdown.Item>Đơn hàng</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/users">
                    <NavDropdown.Item>Người dùng</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/categories">
                    <NavDropdown.Item>Danh mục</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/blogs">
                    <NavDropdown.Item>Blog</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/promocodes">
                    <NavDropdown.Item>Mã giảm giá</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}

              <NavDropdown 
                title={<><FaGift className="me-1" /> Đặc biệt</>} 
                id="special-nav-dropdown"
                className="mx-2"
              >
                <LinkContainer to="/gift-finder">
                  <NavDropdown.Item>Tìm quà sinh nhật</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/promotions">
                  <NavDropdown.Item>Khuyến mãi theo mùa</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>

              <LinkContainer to="/blog">
                <Nav.Link className="mx-2 nav-link-hover">
                  <FaBlog className="me-1" /> Chuyện về BabyBon
                </Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <style jsx>{`
        .nav-link-hover {
          position: relative;
        }
        
        .nav-link-hover::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          transition: all 0.3s ease;
          transform: translateX(-50%);
        }
        
        .nav-link-hover:hover::after {
          width: 80%;
        }

        .dropdown-menu {
          border: none !important;
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          margin-top: 10px !important;
        }

        .dropdown-item {
          transition: all 0.2s ease !important;
        }

        .dropdown-item:hover {
          background: rgba(255, 107, 107, 0.1) !important;
          color: #FF6B6B !important;
        }
      `}</style>
    </header>
  );
};

export default Header; 