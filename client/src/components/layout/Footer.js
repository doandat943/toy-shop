import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPhone, FaEnvelope, FaMapMarkerAlt, FaFacebook, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-dark text-light py-4">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>BabyBon</h5>
            <p className="small">Đồ chơi giáo dục chất lượng cao dành cho trẻ em, giúp phát triển kỹ năng và trí tuệ.</p>
            <div className="d-flex gap-3 social-icons">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="text-light">
                <FaFacebook size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-light">
                <FaInstagram size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="text-light">
                <FaYoutube size={20} />
              </a>
            </div>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Thông tin</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/about" className="text-light text-decoration-none">Về chúng tôi</Link>
              </li>
              <li className="mb-2">
                <Link to="/shipping-policy" className="text-light text-decoration-none">Chính sách vận chuyển</Link>
              </li>
              <li className="mb-2">
                <Link to="/privacy-policy" className="text-light text-decoration-none">Chính sách bảo mật</Link>
              </li>
              <li className="mb-2">
                <Link to="/terms" className="text-light text-decoration-none">Điều khoản sử dụng</Link>
              </li>
              <li className="mb-2">
                <Link to="/blog" className="text-light text-decoration-none">Chuyện về BabyBon</Link>
              </li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Liên hệ</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FaMapMarkerAlt className="me-2" />
                123 Nguyễn Văn Linh, Quận 7, TP. HCM
              </li>
              <li className="mb-2">
                <FaPhone className="me-2" />
                <a href="tel:+84987654321" className="text-light text-decoration-none">
                  087 654 321
                </a>
              </li>
              <li className="mb-2">
                <FaEnvelope className="me-2" />
                <a href="mailto:contact@babybon.vn" className="text-light text-decoration-none">
                  contact@babybon.vn
                </a>
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="my-3" />
        <Row>
          <Col className="text-center">
            <p className="small mb-0">
              &copy; {new Date().getFullYear()} BabyBon. Tất cả quyền được bảo lưu.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 