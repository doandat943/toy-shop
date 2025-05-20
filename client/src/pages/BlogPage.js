import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Form, Pagination } from 'react-bootstrap';
import { fetchBlogPosts, fetchBlogCategories } from '../slices/blogSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const BlogPage = () => {
  const dispatch = useDispatch();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  const { 
    blogPosts, 
    categories,
    loading, 
    error,
    page,
    pages,
    total
  } = useSelector((state) => state.blog);

  useEffect(() => {
    dispatch(fetchBlogCategories());
    dispatch(fetchBlogPosts({ 
      page: currentPage,
      category: selectedCategory,
      keyword: searchKeyword 
    }));
  }, [dispatch, currentPage, selectedCategory, searchKeyword]);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setCurrentPage(1); // Reset to first page when changing category
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  // Format date to Vietnamese format
  const formatDate = (date) => {
    dayjs.locale('vi');
    return dayjs(date).format('DD/MM/YYYY');
  };

  // Generate excerpt from content
  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <Container className="py-5">
      <Meta title="Blog - BabyBon" />
      <h1 className="mb-4 text-center">Chuyện về BabyBon</h1>

      <Row className="mb-4">
        <Col md={8}>
          <Form onSubmit={handleSearch}>
            <Form.Group className="d-flex">
              <Form.Control
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
              <Button type="submit" variant="primary" className="ms-2">
                Tìm kiếm
              </Button>
            </Form.Group>
          </Form>
        </Col>
        <Col md={4}>
          <Form.Select 
            value={selectedCategory} 
            onChange={handleCategoryChange}
            className="mb-3"
          >
            <option value="">Tất cả danh mục</option>
            {categories?.map((category) => (
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
      ) : blogPosts?.length === 0 ? (
        <Message>Không tìm thấy bài viết nào.</Message>
      ) : (
        <>
          <Row>
            {blogPosts?.map((post) => (
              <Col key={post.id} sm={12} md={6} lg={4} className="mb-4">
                <Card className="h-100 blog-card">
                  <Card.Img 
                    variant="top" 
                    src={post.image || '/images/placeholder-blog.jpg'} 
                    alt={post.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                  <Card.Body className="d-flex flex-column">
                    <div className="mb-2">
                      <small className="text-muted me-3">
                        <i className="fas fa-calendar-alt me-1"></i> {formatDate(post.createdAt)}
                      </small>
                      {post.category && (
                        <small className="text-primary">
                          <i className="fas fa-folder me-1"></i> {post.category.name}
                        </small>
                      )}
                    </div>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text className="text-muted">
                      {getExcerpt(post.content)}
                    </Card.Text>
                    <div className="mt-auto">
                      <Link to={`/blog/${post.slug || post.id}`}>
                        <Button variant="outline-primary" className="w-100">
                          Đọc tiếp
                        </Button>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First 
                  onClick={() => handlePageChange(1)} 
                  disabled={currentPage === 1}
                />
                <Pagination.Prev 
                  onClick={() => handlePageChange(currentPage - 1)} 
                  disabled={currentPage === 1}
                />
                
                {[...Array(pages).keys()].map((x) => (
                  <Pagination.Item
                    key={x + 1}
                    active={x + 1 === currentPage}
                    onClick={() => handlePageChange(x + 1)}
                  >
                    {x + 1}
                  </Pagination.Item>
                ))}
                
                <Pagination.Next 
                  onClick={() => handlePageChange(currentPage + 1)} 
                  disabled={currentPage === pages}
                />
                <Pagination.Last 
                  onClick={() => handlePageChange(pages)} 
                  disabled={currentPage === pages}
                />
              </Pagination>
            </div>
          )}

          <div className="text-center mt-4">
            <p className="text-muted">
              Hiển thị {blogPosts?.length} bài viết trên tổng số {total} bài viết
            </p>
          </div>
        </>
      )}
    </Container>
  );
};

export default BlogPage; 