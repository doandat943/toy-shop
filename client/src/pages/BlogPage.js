import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Form, Pagination } from 'react-bootstrap';
import { FaSearch, FaFolder, FaCalendarAlt } from 'react-icons/fa';
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
  const getExcerpt = (content, maxLength = 120) => {
    if (!content) return '';
    const textContent = content.replace(/<[^>]+>/g, ''); // Strip HTML tags for excerpt
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  return (
    <Container className="py-4 blog-page-container">
      <Meta title="Blog - BabyBon" />
      <h1 className="mb-4 page-title text-center">Blog</h1>

      <Row className="mb-4 align-items-center filter-controls-row">
        <Col md={7} lg={8} className="mb-3 mb-md-0">
          <Form onSubmit={handleSearch} className="blog-search-form">
            <Form.Group className="d-flex position-relative">
              <Form.Control
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="search-input"
              />
              <Button type="submit" variant="primary" className="search-button">
                <FaSearch />
              </Button>
            </Form.Group>
          </Form>
        </Col>
        <Col md={5} lg={4}>
          <Form.Select 
            value={selectedCategory} 
            onChange={handleCategoryChange}
            className="category-select"
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
        <Message variant="info">Không tìm thấy bài viết nào phù hợp.</Message>
      ) : (
        <>
          <Row className="blog-posts-grid">
            {blogPosts?.map((post) => (
              <Col key={post.id} sm={12} md={6} lg={4} className="mb-4 d-flex">
                <Card className="h-100 blog-card shadow-sm">
                  <Link to={`/blog/${post.slug || post.id}`} className="blog-card-image-link">
                    <Card.Img 
                      variant="top" 
                      src={post.image || 'https://placehold.co/600x400/FFF3E4/FF6B6B?text=BabyBon+Blog'}
                      alt={post.title}
                      className="blog-card-image"
                    />
                  </Link>
                  <Card.Body className="d-flex flex-column p-3">
                    <div className="mb-2 blog-card-meta">
                      <small className="text-muted me-3">
                        <FaCalendarAlt className="me-1 icon-meta" /> {formatDate(post.createdAt)}
                      </small>
                      {post.category && (
                        <Link to={`/blog?category=${post.category.id}`} className="blog-category-link">
                           <FaFolder className="me-1 icon-meta" /> {post.category.name}
                        </Link>
                      )}
                    </div>
                    <Card.Title className="blog-card-title">
                      <Link to={`/blog/${post.slug || post.id}`} className="stretched-link-title">
                        {post.title}
                      </Link>
                    </Card.Title>
                    <Card.Text className="blog-card-excerpt text-muted small">
                      {getExcerpt(post.content)}
                    </Card.Text>
                    <div className="mt-auto pt-2">
                      <Link to={`/blog/${post.slug || post.id}`} className="btn btn-sm btn-outline-primary read-more-btn">
                        Đọc tiếp <span className="arrow">&rarr;</span>
                      </Link>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {pages > 1 && (
            <div className="d-flex justify-content-center mt-4 blog-pagination">
              <Pagination>
                {[...Array(pages).keys()].map((x) => (
                  <Pagination.Item
                    key={x + 1}
                    active={x + 1 === currentPage}
                    onClick={() => handlePageChange(x + 1)}
                  >
                    {x + 1}
                  </Pagination.Item>
                ))}
              </Pagination>
            </div>
          )}

          {total > 0 && (
            <div className="text-center mt-3">
              <p className="text-muted small">
                Hiển thị {blogPosts?.length} trên tổng số {total} bài viết.
              </p>
            </div>
          )}
        </>
      )}
      <style jsx global>{`
        .blog-page-container .page-title {
          color: #333;
          font-weight: 600;
          border-bottom: 2px solid #FF6B6B;
          display: inline-block;
          padding-bottom: 0.25rem;
          margin-bottom: 2rem !important;
        }
        .filter-controls-row {
            background-color: #f8f9fa;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem !important;
        }
        .blog-search-form .search-input {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
            border-right: none;
        }
        .blog-search-form .search-button {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
            background-color: #FF6B6B;
            border-color: #FF6B6B;
        }
        .blog-search-form .search-button:hover {
            background-color: #e05252;
            border-color: #e05252;
        }
        .category-select {
            cursor: pointer;
        }

        .blog-card {
          transition: all 0.3s ease-in-out;
          border: 1px solid #e9ecef;
          border-radius: 8px;
        }
        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0,0,0,0.1) !important;
        }
        .blog-card-image-link {
          display: block;
          overflow: hidden;
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
        }
        .blog-card-image {
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s ease-in-out;
        }
        .blog-card:hover .blog-card-image {
          transform: scale(1.05);
        }
        .blog-card-meta .icon-meta {
            color: #FF6B6B;
        }
        .blog-category-link {
            text-decoration: none;
            color: #FF6B6B;
            font-weight: 500;
        }
        .blog-category-link:hover {
            text-decoration: underline;
            color: #e05252;
        }
        .blog-card-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #333;
        }
        .blog-card-title .stretched-link-title {
            text-decoration: none;
            color: inherit;
        }
        .blog-card-title .stretched-link-title:hover {
            color: #FF6B6B;
        }
        .blog-card-excerpt {
          font-size: 0.9rem;
          line-height: 1.6;
        }
        .read-more-btn {
            color: #FF6B6B;
            border-color: #FF6B6B;
            font-weight: 500;
        }
        .read-more-btn:hover {
            background-color: #FF6B6B;
            color: white;
        }
        .read-more-btn .arrow {
            transition: transform 0.2s ease-out;
            display: inline-block;
        }
        .read-more-btn:hover .arrow {
            transform: translateX(3px);
        }
        .blog-pagination .page-item.active .page-link {
            background-color: #FF6B6B;
            border-color: #FF6B6B;
            color: white;
        }
        .blog-pagination .page-link {
            color: #FF6B6B;
        }
        .blog-pagination .page-link:hover {
            color: #e05252;
        }
      `}</style>
    </Container>
  );
};

export default BlogPage; 