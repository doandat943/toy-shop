import React from 'react';
import { Carousel } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { fetchActiveCarouselItems } from '../slices/carouselSlice';
import { useEffect } from 'react';
import Loader from './Loader';
import Message from './Message';

const CarouselComponent = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((state) => state.carousel);

  useEffect(() => {
    dispatch(fetchActiveCarouselItems());
  }, [dispatch]);

  if (loading) return <Loader />;
  if (error) return <Message variant="danger">{error}</Message>;
  if (!items || items.length === 0) return null;

  return (
    <Carousel className="mb-5 homepage-carousel" pause="hover" fade>
      {items.map((item) => (
        <Carousel.Item key={item.id} interval={item.interval || 5000}>
          <a href={item.link && item.link !== '#' ? item.link : undefined} 
             target={item.target || '_self'} 
             rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
             style={{ display: 'block' }}
          >
            <img
              className="d-block w-100 carousel-image"
              src={item.image}
              alt={item.caption || 'Carousel Image'}
            />
            {item.caption && (
              <Carousel.Caption>
                <h3>{item.caption}</h3>
              </Carousel.Caption>
            )}
          </a>
        </Carousel.Item>
      ))}
    </Carousel>
  );
};

export default CarouselComponent; 