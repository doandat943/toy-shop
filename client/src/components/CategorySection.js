import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

const CategorySection = ({ categories }) => {
  return (
    <Row className="justify-content-center">
      {categories.map((category) => (
        <Col key={category.id} sm={6} md={3} className="mb-4">
          <Card className="h-100 category-card text-center">
            <ImageWithFallback
              src={category.image}
              alt={category.name}
              className="category-img card-img-top"
              fallbackSrc="https://placehold.co/400x300/e5e5e5/a0a0a0?text=Category"
            />
            <Card.Body>
              <Card.Title>{category.name}</Card.Title>
              <Link to={`/products?category=${category.id}`}>
                <Button variant="outline-primary" size="sm">
                  Xem sản phẩm
                </Button>
              </Link>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default CategorySection; 