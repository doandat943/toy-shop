import React from 'react';
import { Pagination } from 'react-bootstrap';
import PropTypes from 'prop-types';

const Paginate = ({ pages, page, onChange, size = 'md' }) => {
  if (pages <= 1) {
    return null;
  }

  // Calculate which pages to show
  const showPages = () => {
    const displayPages = [];
    const maxPagesToShow = 5; // Adjust this number to show more or fewer pages

    let startPage = Math.max(1, page - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pages, startPage + maxPagesToShow - 1);

    // Adjust if we're near the end
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    // Always show first page
    if (startPage > 1) {
      displayPages.push(
        <Pagination.Item
          key={1}
          active={page === 1}
          onClick={() => onChange(1)}
        >
          1
        </Pagination.Item>
      );

      // Add ellipsis if needed
      if (startPage > 2) {
        displayPages.push(<Pagination.Ellipsis key="ellipsis-start" disabled />);
      }
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      displayPages.push(
        <Pagination.Item
          key={i}
          active={page === i}
          onClick={() => onChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }

    // Always show last page
    if (endPage < pages) {
      // Add ellipsis if needed
      if (endPage < pages - 1) {
        displayPages.push(<Pagination.Ellipsis key="ellipsis-end" disabled />);
      }

      displayPages.push(
        <Pagination.Item
          key={pages}
          active={page === pages}
          onClick={() => onChange(pages)}
        >
          {pages}
        </Pagination.Item>
      );
    }

    return displayPages;
  };

  return (
    <Pagination size={size} className="justify-content-center my-3">
      <Pagination.First
        onClick={() => onChange(1)}
        disabled={page === 1}
      />
      <Pagination.Prev
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
      />
      
      {showPages()}
      
      <Pagination.Next
        onClick={() => onChange(page + 1)}
        disabled={page === pages}
      />
      <Pagination.Last
        onClick={() => onChange(pages)}
        disabled={page === pages}
      />
    </Pagination>
  );
};

Paginate.propTypes = {
  pages: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  size: PropTypes.string
};

export default Paginate; 