import React from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ImageWithFallback from './ImageWithFallback';

const CategoryCard = ({ category }) => {
  return (
    <Card className="h-100 category-card text-center">
      <div className="category-img-container">
        <ImageWithFallback
          src={category.image}
          alt={category.name}
          className="category-img card-img-top"
          fallbackSrc="https://placehold.co/400x300/FFF3E4/E76F51?text=Category"
        />
      </div>
      <Card.Body>
        <Card.Title>{category.name}</Card.Title>
        <Link to={`/products?category=${category.id}`}>
          <Button className="custom-button-warm" size="sm">
            Xem sản phẩm
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
};

export default CategoryCard; 