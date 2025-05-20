import React, { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SearchBox = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?keyword=${keyword}`);
      setKeyword('');
    } else {
      navigate('/products');
    }
  };

  return (
    <Form onSubmit={submitHandler} className="d-flex mx-auto">
      <Form.Control
        type="text"
        name="q"
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Tìm kiếm sản phẩm..."
        value={keyword}
        className="mr-sm-2 ml-sm-5 rounded-0 rounded-start"
      />
      <Button type="submit" variant="outline-light" className="p-2 rounded-0 rounded-end">
        <FaSearch />
      </Button>
    </Form>
  );
};

export default SearchBox; 