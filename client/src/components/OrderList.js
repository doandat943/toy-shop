import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Table, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { getMyOrders } from '../slices/orderSlice';
import Loader from './Loader';
import Message from './Message';
import dayjs from 'dayjs';

const OrderList = () => {
  const dispatch = useDispatch();
  const { myOrders = [], loading, error } = useSelector((state) => state.order);
  const ordersFetched = useRef(false);

  useEffect(() => {
    // Chỉ lấy dữ liệu orders một lần
    if ((!myOrders || myOrders.length === 0) && !ordersFetched.current && !loading) {
      console.log('Fetching orders for OrderList component');
      ordersFetched.current = true;
      dispatch(getMyOrders());
    }
  }, [dispatch, myOrders, loading]);

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'processing': return 'info';
      case 'shipped': return 'primary';
      case 'delivered': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center my-3">
        <Spinner animation="border" size="sm" />
        <span className="ms-2">Đang tải đơn hàng...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="danger">
        Lỗi: {error}
      </Alert>
    );
  }

  if (!myOrders || myOrders.length === 0) {
    return (
      <Alert variant="info">
        Bạn chưa có đơn hàng nào.
      </Alert>
    );
  }

  return (
    <Table responsive hover className="mt-3">
      <thead>
        <tr>
          <th>Mã đơn</th>
          <th>Ngày đặt</th>
          <th>Tổng tiền</th>
          <th>Trạng thái</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {myOrders.map((order) => (
          <tr key={order.id}>
            <td>#{order.id}</td>
            <td>{formatDate(order.createdAt || new Date())}</td>
            <td>{(order.total || order.totalPrice || 0).toLocaleString('vi-VN')}đ</td>
            <td>
              <Badge bg={getStatusBadgeVariant(order.status)}>
                {getStatusText(order.status)}
              </Badge>
            </td>
            <td>
              <Button
                as={Link}
                to={`/order/${order.id}`}
                variant="outline-primary"
                size="sm"
              >
                Chi tiết
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default OrderList; 