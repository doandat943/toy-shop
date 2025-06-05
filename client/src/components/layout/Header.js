import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHeart, FaCogs, FaRocket, FaGift, FaBlog, FaTasks } from 'react-icons/fa';
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
        className="py-2 position-sticky main-header"
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.85)' : 'rgba(255, 255, 255, 0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
          transition: 'all 0.3s ease',
          top: 0,
          zIndex: 1020,
        }}
      >
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center me-4">
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
          
          <div className="d-none d-lg-block flex-grow-1 me-auto" style={{ maxWidth: '400px' }}>
            <SearchBox />
          </div>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="d-lg-none my-2">
              <SearchBox />
            </div>
            
            <Nav className="ms-auto align-items-center">
              <LinkContainer to="/products">
                <Nav.Link className="mx-2 nav-link-custom">Sản Phẩm</Nav.Link>
              </LinkContainer>

              <NavDropdown 
                title={<><FaGift className="me-1" /> Đặc biệt</>} 
                id="special-nav-dropdown"
                className="mx-2 nav-link-custom-dropdown"
              >
                <LinkContainer to="/gift-finder">
                  <NavDropdown.Item>Tìm quà sinh nhật</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/promotions">
                  <NavDropdown.Item>Khuyến mãi theo mùa</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>

              <LinkContainer to="/blog">
                <Nav.Link className="mx-2 nav-link-custom">
                  <FaBlog className="me-1" /> Chuyện về BabyBon
                </Nav.Link>
              </LinkContainer>

              <Nav.Link as={Link} to="/wishlist" className="mx-2 nav-icon-link position-relative">
                <FaHeart size={20} />
                {wishlistItems.length > 0 && (
                  <Badge pill bg="danger" className="icon-badge">
                    {wishlistItems.length}
                  </Badge>
                )}
                 <span className="d-lg-none ms-2">Yêu Thích</span>
              </Nav.Link>

              <Nav.Link as={Link} to="/cart" className="mx-2 nav-icon-link position-relative">
                <FaShoppingCart size={20} />
                {cartItems.length > 0 && (
                  <Badge pill bg="danger" className="icon-badge">
                    {cartItems.reduce((a, c) => a + c.qty, 0)}
                  </Badge>
                )}
                <span className="d-lg-none ms-2">Giỏ Hàng</span>
              </Nav.Link>

              {user ? (
                <NavDropdown 
                  title={<><FaUser size={20} className="me-1 d-none d-lg-inline-block" /> {user.name}</>} 
                  id="username"
                  className="mx-2 nav-link-custom-dropdown"
                  align="end"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Tài khoản</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/orders">
                    <NavDropdown.Item>Đơn hàng của tôi</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link className="mx-2 nav-link-custom">
                    <FaUser className="me-1" /> Đăng nhập
                  </Nav.Link>
                </LinkContainer>
              )}

              {user && user.role === 'admin' && (
                <NavDropdown 
                  title={<><FaTasks size={20} className="me-1 d-none d-lg-inline-block" /> Quản lý</>} 
                  id="adminmenu"
                  className="mx-2 nav-link-custom-dropdown"
                  align="end"
                >
                  <NavDropdown.Item as={Link} to="/admin/dashboard">
                    <FaCogs className="me-2" /> Bảng điều khiển
                  </NavDropdown.Item>
                  <LinkContainer to="/admin/products">
                    <NavDropdown.Item>Sản phẩm</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/orders">
                    <NavDropdown.Item>Đơn hàng</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to="/admin/carousel">
                    <NavDropdown.Item>Carousel</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <style jsx global>{`
        .main-header .nav-link-custom,
        .main-header .nav-link-custom-dropdown > a.nav-link {
          position: relative;
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
        }
        
        .main-header .nav-link-custom::after,
        .main-header .nav-link-custom-dropdown > a.nav-link::after {
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
        
        .main-header .nav-link-custom:hover::after,
        .main-header .nav-link-custom-dropdown > a.nav-link:hover::after,
        .main-header .nav-link-custom.active::after,
        .main-header .nav-link-custom-dropdown > a.nav-link.active::after {
          width: 70%;
        }

        .main-header .nav-icon-link {
            color: #333;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
        }
        .main-header .nav-icon-link:hover {
            color: #FF6B6B;
        }
        .main-header .icon-badge {
            position: absolute;
            top: 0px;
            right: -5px;
            font-size: 0.6em;
            padding: 0.25em 0.45em;
        }

        .main-header .dropdown-menu {
          border: none !important;
          background: rgba(255, 255, 255, 0.9) !important;
          backdrop-filter: blur(12px) !important;
          -webkit-backdrop-filter: blur(12px) !important;
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.15) !important;
          border-radius: 10px !important;
          margin-top: 8px !important;
        }

        .main-header .dropdown-item {
          transition: all 0.2s ease !important;
          font-weight: 500;
          padding: 0.5rem 1rem;
        }

        .main-header .dropdown-item:hover {
          background: rgba(255, 107, 107, 0.1) !important;
          color: #FF6B6B !important;
        }
        .main-header .navbar-toggler {
          border: none;
        }
        .main-header .navbar-toggler:focus {
          box-shadow: none;
        }

        /* SearchBox specific styles */
        .searchbox-form {
          display: flex;
          width: 100%;
        }
        .searchbox-input {
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
          border-top-left-radius: 20px !important; 
          border-bottom-left-radius: 20px !important;
          border-right: none !important; 
          padding-right: 0.5rem; /* Add some space before button */
          box-shadow: none !important; /* Remove default BS shadow */
          height: calc(1.5em + .75rem + 2px); /* Match default BS button height */
        }
        .searchbox-input:focus {
          border-color: #FF8E53; /* Theme color for focus */
          box-shadow: 0 0 0 0.2rem rgba(255, 107, 107, 0.25) !important; 
        }
        .searchbox-button {
          background: linear-gradient(135deg, #FF6B6B, #FF8E53) !important;
          border-color: #FF6B6B !important;
          color: white !important;
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          border-top-right-radius: 20px !important; 
          border-bottom-right-radius: 20px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.375rem 0.85rem; /* Adjusted padding for alignment */
        }
        .searchbox-button:hover {
          background: linear-gradient(135deg, #FF8E53, #FF6B6B) !important; /* Slightly darker/shifted gradient on hover */
          border-color: #FF8E53 !important;
        }
      `}</style>
    </header>
  );
};

export default Header; 