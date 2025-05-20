import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Card, Button, Image } from 'react-bootstrap';
import { fetchBlogPostDetails, fetchBlogPosts } from '../slices/blogSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Meta from '../components/Meta';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

const BlogDetailPage = () => {
  const { id: blogId } = useParams();
  const dispatch = useDispatch();
  
  const { blogPost, loading, error } = useSelector((state) => state.blog);
  const [relatedPosts, setRelatedPosts] = useState([]);

  useEffect(() => {
    dispatch(fetchBlogPostDetails(blogId));
  }, [dispatch, blogId]);
  
  // Fetch related posts when blog post is loaded
  useEffect(() => {
    if (blogPost?.categoryId) {
      dispatch(fetchBlogPosts({ category: blogPost.categoryId }))
        .unwrap()
        .then(result => {
          // Filter out current post and limit to 3 related posts
          const filtered = result.data.filter(post => post.id !== blogPost.id).slice(0, 3);
          setRelatedPosts(filtered);
        })
        .catch(err => console.error('Failed to fetch related posts:', err));
    }
  }, [dispatch, blogPost]);

  // Format date to Vietnamese format
  const formatDate = (date) => {
    dayjs.locale('vi');
    return dayjs(date).format('DD MMMM, YYYY');
  };

  // Generate excerpt from content
  const getExcerpt = (content, maxLength = 150) => {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Handle social media sharing
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blogPost?.title;
    
    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
        break;
      case 'pinterest':
        if (blogPost?.image) {
          window.open(`https://pinterest.com/pin/create/button/?url=${url}&media=${blogPost.image}&description=${title}`, '_blank');
        }
        break;
      default:
        break;
    }
  };

  return (
    <Container className="py-5">
      {loading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : !blogPost ? (
        <Message>Không tìm thấy bài viết.</Message>
      ) : (
        <>
          <Meta 
            title={`${blogPost.title} - BabyBon`} 
            description={getExcerpt(blogPost.content, 160)}
            image={blogPost.image}
          />
          
          <Row>
            <Col lg={8} className="mb-5">
              {/* Main Blog Content */}
              <div className="blog-header mb-4">
                <h1 className="mb-3">{blogPost.title}</h1>
                <div className="blog-meta mb-3">
                  <span className="me-3">
                    <i className="fas fa-calendar-alt me-1"></i> {formatDate(blogPost.createdAt)}
                  </span>
                  {blogPost.category && (
                    <span className="me-3">
                      <i className="fas fa-folder me-1"></i> 
                      <Link to={`/blog?category=${blogPost.categoryId}`}>
                        {blogPost.category.name}
                      </Link>
                    </span>
                  )}
                  {blogPost.author && (
                    <span>
                      <i className="fas fa-user me-1"></i> {blogPost.author.name}
                    </span>
                  )}
                </div>
              </div>
              
              {blogPost.image && (
                <div className="blog-featured-image mb-4">
                  <Image 
                    src={blogPost.image} 
                    alt={blogPost.title} 
                    fluid 
                    className="rounded"
                  />
                </div>
              )}
              
              <div className="blog-content mb-5">
                <div dangerouslySetInnerHTML={{ __html: blogPost.content }} />
              </div>
              
              {/* Social Sharing */}
              <div className="blog-sharing mb-5">
                <h5 className="mb-3">Chia sẻ bài viết này:</h5>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" onClick={() => handleShare('facebook')}>
                    <i className="fab fa-facebook-f"></i>
                  </Button>
                  <Button variant="outline-info" onClick={() => handleShare('twitter')}>
                    <i className="fab fa-twitter"></i>
                  </Button>
                  <Button variant="outline-primary" onClick={() => handleShare('linkedin')}>
                    <i className="fab fa-linkedin-in"></i>
                  </Button>
                  {blogPost.image && (
                    <Button variant="outline-danger" onClick={() => handleShare('pinterest')}>
                      <i className="fab fa-pinterest-p"></i>
                    </Button>
                  )}
                </div>
              </div>
            </Col>
            
            <Col lg={4}>
              {/* Sidebar */}
              <Card className="mb-4">
                <Card.Header as="h5">Bài viết liên quan</Card.Header>
                <Card.Body>
                  {relatedPosts.length > 0 ? (
                    <ul className="list-unstyled">
                      {relatedPosts.map((post) => (
                        <li key={post.id} className="mb-3 pb-3 border-bottom">
                          <Row>
                            <Col xs={4}>
                              <Image 
                                src={post.image || '/images/placeholder-blog.jpg'} 
                                alt={post.title}
                                fluid
                                rounded
                              />
                            </Col>
                            <Col xs={8}>
                              <h6>
                                <Link to={`/blog/${post.slug || post.id}`}>
                                  {post.title}
                                </Link>
                              </h6>
                              <small className="text-muted">
                                {formatDate(post.createdAt)}
                              </small>
                            </Col>
                          </Row>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-muted">Không có bài viết liên quan.</p>
                  )}
                </Card.Body>
              </Card>
              
              <Card>
                <Card.Header as="h5">Danh mục</Card.Header>
                <Card.Body>
                  <ul className="list-unstyled">
                    {blogPost.category && (
                      <li className="mb-2">
                        <Link to={`/blog?category=${blogPost.categoryId}`}>
                          {blogPost.category.name}
                        </Link>
                      </li>
                    )}
                    <li className="mb-2">
                      <Link to="/blog">Tất cả bài viết</Link>
                    </li>
                  </ul>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </Container>
  );
};

export default BlogDetailPage; 