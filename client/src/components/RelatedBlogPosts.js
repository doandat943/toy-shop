import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const RelatedBlogPosts = ({ productId, categoryId, productName, limit = 3 }) => {
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedBlogPosts = async () => {
      try {
        setLoading(true);
        // Try to fetch blog posts related to the product or its category
        const { data } = await axios.get(`/api/blog/related?productId=${productId}&categoryId=${categoryId}&limit=${limit}`);
        setBlogPosts(data.data || []);
      } catch (error) {
        console.error('Error fetching related blog posts:', error);
        setBlogPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (productId || categoryId) {
      fetchRelatedBlogPosts();
    }
  }, [productId, categoryId, limit]);

  // Format date to Vietnamese format
  const formatDate = (date) => {
    dayjs.locale('vi');
    return dayjs(date).format('DD/MM/YYYY');
  };

  // Generate excerpt from content
  const getExcerpt = (content, maxLength = 100) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  if (loading || blogPosts.length === 0) {
    return null; // Don't show anything if no related posts
  }

  return (
    <div className="related-blog-posts my-5">
      <h3 className="mb-4">Bài viết liên quan đến {productName}</h3>
      <Row>
        {blogPosts.map(post => (
          <Col key={post.id} md={4} className="mb-4">
            <Card className="h-100">
              <Card.Img 
                variant="top" 
                src={post.image || '/images/placeholder-blog.jpg'} 
                alt={post.title}
                style={{ height: '160px', objectFit: 'cover' }}
              />
              <Card.Body className="d-flex flex-column">
                <Card.Title as="h5">{post.title}</Card.Title>
                <small className="text-muted mb-2">
                  <i className="fas fa-calendar-alt me-1"></i> {formatDate(post.createdAt)}
                </small>
                <Card.Text className="text-muted">
                  {getExcerpt(post.content)}
                </Card.Text>
                <div className="mt-auto pt-2">
                  <Link to={`/blog/${post.slug || post.id}`} className="btn btn-outline-primary btn-sm w-100">
                    Đọc tiếp
                  </Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RelatedBlogPosts; 