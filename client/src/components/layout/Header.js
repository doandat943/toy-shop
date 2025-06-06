import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHeart, FaRocket } from 'react-icons/fa';
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
      if (window.scrollY > 60) {
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
        className="py-3 position-sticky main-header"
        style={{
          background: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.65)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: scrolled ? '0 6px 24px rgba(0, 0, 0, 0.12)' : 'none',
          transition: 'all 0.3s ease',
          top: 0,
          zIndex: 1020,
        }}
      >
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand className="d-flex align-items-center me-lg-5 me-3">
              <div 
                className="logo-icon-wrapper me-2"
              >
                <FaRocket />
              </div>
              <span 
                className="brand-name"
              >
                BabyBon
              </span>
            </Navbar.Brand>
          </LinkContainer>
          
          <div className="d-none d-lg-block flex-grow-1 me-auto" style={{ maxWidth: '450px' }}>
            <SearchBox />
          </div>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <div className="d-lg-none my-3">
              <SearchBox />
            </div>
            
            <Nav className="ms-auto align-items-center">
              <LinkContainer to="/products">
                <Nav.Link className="mx-lg-2 nav-link-custom">Sản Phẩm</Nav.Link>
              </LinkContainer>

              <NavDropdown 
                title={<div className="d-flex align-items-center nav-icon-bg nav-dropdown-title-custom"><span className="me-1">Đặc biệt</span></div>} 
                id="special-nav-dropdown"
                className="mx-lg-2 nav-link-custom-dropdown special-dropdown-toggle"
              >
                <LinkContainer to="/gift-finder">
                  <NavDropdown.Item>Tìm quà sinh nhật</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/promotions">
                  <NavDropdown.Item>Khuyến mãi theo mùa</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>

              <LinkContainer to="/blog">
                <Nav.Link className="mx-lg-2 nav-link-custom">Blog</Nav.Link>
              </LinkContainer>

              <Nav.Link as={Link} to="/wishlist" className="mx-1 nav-icon-link position-relative">
                <div className="nav-icon-bg">
                  <FaHeart size={22} />
                  {wishlistItems.length > 0 && (
                    <Badge pill bg="danger" className="icon-badge">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </div>
                 <span className="d-lg-none ms-2">Yêu Thích</span>
              </Nav.Link>

              <Nav.Link as={Link} to="/cart" className="mx-1 nav-icon-link position-relative">
                <div className="nav-icon-bg">
                  <FaShoppingCart size={22} />
                  {cartItems.length > 0 && (
                    <Badge pill bg="danger" className="icon-badge">
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </div>
                <span className="d-lg-none ms-2">Giỏ Hàng</span>
              </Nav.Link>

              {user ? (
                <NavDropdown 
                  title={<div className="d-flex align-items-center nav-icon-bg"><span className="me-2 user-name-nav d-none d-xl-inline">{user.name}</span> <FaUser size={22} /></div>} 
                  id="username"
                  className="ms-lg-2 nav-link-custom-dropdown user-dropdown"
                  align="end"
                >
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Tài khoản</NavDropdown.Item>
                  </LinkContainer>
                  
                  {user.role === 'admin' ? (
                    <LinkContainer to="/admin">
                      <NavDropdown.Item>Quản lý</NavDropdown.Item>
                    </LinkContainer>
                  ) : (
                    <LinkContainer to="/orders">
                      <NavDropdown.Item>Đơn hàng của tôi</NavDropdown.Item>
                    </LinkContainer>
                  )}
                  
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={logoutHandler}>
                    Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link className="ms-lg-2 nav-link-custom nav-login-link">
                    <FaUser className="me-1" /> Đăng nhập
                  </Nav.Link>
                </LinkContainer>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <style jsx global>{`
        .main-header .logo-icon-wrapper {
          width: 42px;
          height: 42px;
          background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.3rem;
          box-shadow: 0 3px 12px rgba(255, 107, 107, 0.55);
        }
        .main-header .brand-name {
          font-weight: 700;
          background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          font-size: 1.6rem;
        }

        .main-header .nav-link-custom,
        .main-header .nav-link-custom-dropdown > a.nav-link {
          position: relative;
          padding: 0.6rem 0.8rem;
          color: #333;
          font-weight: 500;
          border-radius: 6px;
          transition: color 0.2s ease, background-color 0.2s ease;
        }
        .main-header .nav-link-custom:hover,
        .main-header .nav-link-custom-dropdown > a.nav-link:hover {
            color: #FF6B6B;
            background-color: rgba(255, 107, 107, 0.05);
        }
        
        .main-header .nav-link-custom::after,
        .main-header .nav-link-custom-dropdown > a.nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 50%;
          width: 0;
          height: 2.5px;
          background: linear-gradient(135deg, #FF6B6B, #FF8E53);
          transition: width 0.3s ease;
          transform: translateX(-50%);
          border-radius: 2px;
        }
        
        .main-header .nav-link-custom:hover::after,
        .main-header .nav-link-custom-dropdown > a.nav-link:hover::after,
        .main-header .nav-link-custom.active::after,
        .main-header .nav-link-custom-dropdown > a.nav-link.active::after {
          width: 60%;
        }
        .main-header .nav-link-custom.nav-login-link {
            padding: 0.5rem 1rem;
            border: 1.5px solid #FF8E53;
            color: #FF8E53;
        }
        .main-header .nav-link-custom.nav-login-link:hover {
            background-color: #FF8E53;
            color: white;
        }
        .main-header .nav-link-custom.nav-login-link::after {
            display: none;
        }

        .main-header .nav-icon-link {
            color: #333;
            padding-top: 0.2rem;
            padding-bottom: 0.2rem;
            margin-left: 0.5rem !important;
            margin-right: 0.5rem !important;
        }
        .main-header .nav-icon-bg {
            width: auto;
            min-width: 42px;
            height: 42px;
            padding: 0 0.75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 21px;
            transition: background-color 0.2s ease, color 0.2s ease;
            color: #333;
            line-height: 1;
        }
        .main-header .nav-dropdown-title-custom span {
            font-weight: 500;
        }
        .main-header .nav-icon-link:hover .nav-icon-bg,
        .main-header .user-dropdown.show .nav-icon-bg,
        .main-header .nav-link-custom-dropdown.special-dropdown-toggle > .dropdown-toggle.nav-link:hover .nav-icon-bg,
        .main-header .nav-link-custom-dropdown.special-dropdown-toggle.show > .dropdown-toggle.nav-link .nav-icon-bg
        {
            background-color: rgba(255, 107, 107, 0.1);
            color: #FF6B6B;
        }
        .main-header .user-name-nav {
            font-weight: 500;
        }

        .main-header .icon-badge {
            position: absolute;
            top: 2px;
            right: 0px;
            font-size: 0.6em;
            padding: 0.3em 0.5em;
            box-shadow: 0 0 5px rgba(0,0,0,0.2);
        }

        .main-header .dropdown-menu {
          border: 1px solid #f0f0f0 !important;
          background: rgba(255, 255, 255, 0.95) !important;
          backdrop-filter: blur(15px) !important;
          -webkit-backdrop-filter: blur(15px) !important;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12) !important;
          border-radius: 12px !important;
          margin-top: 10px !important;
          padding-top: 0.25rem;
          padding-bottom: 0.25rem;
        }

        .main-header .dropdown-item {
          transition: all 0.2s ease !important;
          font-weight: 500;
          padding: 0.6rem 1.2rem;
          border-radius: 8px;
          margin: 0.2rem 0.4rem;
          width: auto;
        }

        .main-header .dropdown-item:hover {
          background: rgba(255, 107, 107, 0.1) !important;
          color: #FF6B6B !important;
          transform: translateX(3px);
        }
        .main-header .navbar-toggler {
          border: none;
          padding: 0.25rem 0.5rem;
        }
        .main-header .navbar-toggler-icon {
            width: 1.2em;
            height: 1.2em;
        }
        .main-header .navbar-toggler:focus {
          box-shadow: none;
        }

        .main-header .nav-link-custom-dropdown > a.nav-link::after {
            bottom: 0px;
        }
        .main-header .nav-link-custom-dropdown .dropdown-toggle::after {
           margin-left: 0.4em;
           vertical-align: 0.1em;
        }
        .main-header .user-dropdown .dropdown-toggle::after {
            display: none;
        }

        .main-header .nav-link-custom-dropdown.special-dropdown-toggle > .dropdown-toggle.nav-link::after {
            display: none;
        }
        .main-header .nav-link-custom-dropdown.special-dropdown-toggle > .dropdown-toggle.nav-link .nav-icon-bg + .dropdown-toggle::after {
            /* This rule might be tricky; Bootstrap applies ::after to the .dropdown-toggle. 
               The caret is part of the .dropdown-toggle. 
               If the structure is .nav-icon-bg > span, the caret is outside .nav-icon-bg.
               We need to style the dropdown-toggle's caret directly. 
            */
        }

        .searchbox-form {
          display: flex;
          width: 100%;
        }
        .searchbox-input {
          border-top-right-radius: 0 !important;
          border-bottom-right-radius: 0 !important;
          border-right: none !important;
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
        }
        .searchbox-button {
          border-top-left-radius: 0 !important;
          border-bottom-left-radius: 0 !important;
          background-color: #FF6B6B !important;
          border-color: #FF6B6B !important;
          color: white;
          padding: 0.75rem 1rem;
        }
        .searchbox-button:hover {
          background-color: #e05252 !important;
          border-color: #e05252 !important;
        }
      `}</style>
    </header>
  );
};

export default Header; 