import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Navbar, Nav, Container, NavDropdown, Badge } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHeart, FaCogs } from 'react-icons/fa';
import { logout } from '../../slices/userSlice';
import SearchBox from '../SearchBox';
import { Link } from 'react-router-dom';

const Header = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const { cartItems } = useSelector((state) => state.cart);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <header>
      <Navbar bg="primary" variant="dark" expand="lg" collapseOnSelect className="py-2">
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <img
                src="/logo.png"
                width="30"
                height="30"
                className="d-inline-block align-top me-2"
                alt="BabyBon Logo"
              />
              BabyBon
            </Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <SearchBox />
            <Nav className="ms-auto">
              <LinkContainer to="/products">
                <Nav.Link>Sản Phẩm</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/wishlist">
                <Nav.Link>
                  <FaHeart /> Yêu Thích
                  {wishlistItems.length > 0 && (
                    <Badge pill bg="danger" className="ms-1">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
              <LinkContainer to="/cart">
                <Nav.Link>
                  <FaShoppingCart /> Giỏ Hàng
                  {cartItems.length > 0 && (
                    <Badge pill bg="danger" className="ms-1">
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>

              {user ? (
                <NavDropdown title={<><FaUser /> {user.name}</>} id="username">
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
                  <Nav.Link>
                    <FaUser /> Đăng nhập
                  </Nav.Link>
                </LinkContainer>
              )}

              {user && user.role === 'admin' && (
                <NavDropdown title="Admin" id="adminmenu">
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

              <NavDropdown title="Đặc biệt" id="special-nav-dropdown">
                <LinkContainer to="/gift-finder">
                  <NavDropdown.Item>Tìm quà sinh nhật</NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/promotions">
                  <NavDropdown.Item>Khuyến mãi theo mùa</NavDropdown.Item>
                </LinkContainer>
              </NavDropdown>

              <LinkContainer to="/blog">
                <Nav.Link>Chuyện về BabyBon</Nav.Link>
              </LinkContainer>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header; 