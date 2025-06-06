import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Table, Badge, Button, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import Meta from '../../components/Meta';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { formatPrice } from '../../utils/formatPrice';
import { 
  fetchSummaryStats, 
  fetchSalesReport, 
  fetchTopProducts, 
  fetchCustomerStats,
  fetchInventoryStats,
  fetchRecentOrders,
  fetchRecentReviews
} from '../../slices/dashboardSlice';
import {   FaShoppingCart,   FaUser,   FaBoxOpen,   FaMoneyBillWave,   FaExclamationTriangle,  FaCaretUp,  FaCaretDown} from 'react-icons/fa';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const [period, setPeriod] = useState('month');
  const [groupBy, setGroupBy] = useState('day');
  
  // Get dashboard data from Redux store
  const { 
    summaryStats, 
    salesReport, 
    topProducts,
    customerStats,
    inventoryStats,
    recentOrders,
    recentReviews,
    loading, 
    error 
  } = useSelector(state => state.dashboard);
  
  // Load dashboard data on component mount
  useEffect(() => {
    dispatch(fetchSummaryStats({ period }));
    dispatch(fetchSalesReport({ period, groupBy }));
    dispatch(fetchTopProducts({ period, limit: 5 }));
    dispatch(fetchCustomerStats({ period }));
    dispatch(fetchInventoryStats());
    dispatch(fetchRecentOrders({ limit: 5 }));
    dispatch(fetchRecentReviews({ limit: 5 }));
  }, [dispatch, period, groupBy]);
  
  // Handle period change
  const handlePeriodChange = (newPeriod) => {
    setPeriod(newPeriod);
  };
  
  // Format sales chart data if available
  const formatSalesChartData = () => {
    if (!salesReport || !salesReport.salesData) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Doanh thu (VNĐ)',
            data: [],
            fill: false,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1
          }
        ]
      };
    }
    
    // Format data from API response
    const labels = salesReport.salesData.map(item => item.date);
    const salesData = salesReport.salesData.map(item => parseFloat(item.sales));
    
    return {
      labels,
      datasets: [
        {
          label: 'Doanh thu (VNĐ)',
          data: salesData,
          fill: false,
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    };
  };
  
  // Format payment methods chart data if available
  const formatPaymentMethodsData = () => {
    if (!salesReport || !salesReport.paymentMethods) {
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      };
    }
    
    const labels = salesReport.paymentMethods.map(method => {
      switch(method.paymentMethod) {
        case 'cod': return 'Tiền mặt';
        case 'bank_transfer': return 'Chuyển khoản';
        case 'credit_card': return 'Thẻ tín dụng';
        case 'qr_code': return 'Quét mã QR';
        default: return method.paymentMethod;
      }
    });
    
    const data = salesReport.paymentMethods.map(method => parseFloat(method.total));
    
    const backgroundColor = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0'
    ];
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor
        }
      ]
    };
  };
  
  // Format category distribution data
  const formatCategoryData = () => {
    if (!inventoryStats || !inventoryStats.categoryDistribution) {
      return {
        labels: [],
        datasets: [{ data: [], backgroundColor: [] }]
      };
    }
    
    const labels = inventoryStats.categoryDistribution.map(cat => cat.name);
    const data = inventoryStats.categoryDistribution.map(cat => cat.count);
    
    const backgroundColor = [
      '#FF6384',
      '#36A2EB',
      '#FFCE56',
      '#4BC0C0',
      '#9966FF',
      '#FF9F40'
    ];
    
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor
        }
      ]
    };
  };
  
  // Format age range distribution data
  const formatAgeRangeData = () => {
    if (!inventoryStats || !inventoryStats.ageRangeDistribution) {
      return {
        labels: [],
        datasets: [{ label: 'Số lượng sản phẩm', data: [] }]
      };
    }
    
    const labels = inventoryStats.ageRangeDistribution.map(range => range.range);
    const data = inventoryStats.ageRangeDistribution.map(range => range.count);
    
    return {
      labels,
      datasets: [
        {
          label: 'Số lượng sản phẩm',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }
      ]
    };
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const options = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  // Options for charts
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Doanh thu theo ${
          groupBy === 'day' ? 'ngày' : 
          groupBy === 'week' ? 'tuần' : 
          groupBy === 'month' ? 'tháng' : 'giờ'
        } (${
          period === 'today' ? 'Hôm nay' :
          period === 'week' ? '7 ngày qua' :
          period === 'month' ? '30 ngày qua' :
          period === 'year' ? '12 tháng qua' : period
        })`
      }
    },
    scales: {
      y: {
        ticks: {
          callback: function(value) {
            return formatPrice(value, false);
          }
        }
      }
    }
  };
  
  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  };

  return (
    <>
      <Meta title="Bảng điều khiển - BabyBon Admin" />
      <h1 className="mb-4">Bảng điều khiển</h1>
      
      <Row className="mb-4">
        <Col>
          <Card className="border-0 shadow-sm">
            <Card.Body className="d-flex justify-content-between">
              <div className="d-flex">
                <Button 
                  variant={period === 'today' ? 'primary' : 'outline-primary'} 
                  className="me-2"
                  onClick={() => handlePeriodChange('today')}
                >
                  Hôm nay
                </Button>
                <Button 
                  variant={period === 'week' ? 'primary' : 'outline-primary'} 
                  className="me-2"
                  onClick={() => handlePeriodChange('week')}
                >
                  7 ngày
                </Button>
                <Button 
                  variant={period === 'month' ? 'primary' : 'outline-primary'} 
                  className="me-2"
                  onClick={() => handlePeriodChange('month')}
                >
                  30 ngày
                </Button>
                <Button 
                  variant={period === 'year' ? 'primary' : 'outline-primary'} 
                  onClick={() => handlePeriodChange('year')}
                >
                  12 tháng
                </Button>
              </div>
              <div className="d-flex align-items-center">
                <span className="me-2">Hiển thị theo:</span>
                <Form.Select 
                  size="sm" 
                  value={groupBy}
                  onChange={(e) => setGroupBy(e.target.value)}
                  style={{ width: '100px' }}
                >
                  <option value="hour">Giờ</option>
                  <option value="day">Ngày</option>
                  <option value="week">Tuần</option>
                  <option value="month">Tháng</option>
                </Form.Select>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {loading && !summaryStats ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <>
          {/* Summary Cards */}
          <Row className="mb-4">
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Doanh thu</h6>
                      <h3 className="mb-0">{summaryStats ? formatPrice(summaryStats.totalSales) : 0}</h3>
                    </div>
                    <div className="icon-container bg-primary text-white rounded-circle p-3">
                      <FaMoneyBillWave size={24} />
                    </div>
                  </div>
                  <div className="mt-3">
                    {summaryStats && summaryStats.salesGrowth !== undefined && (
                      <span className={summaryStats.salesGrowth >= 0 ? 'text-success' : 'text-danger'}>
                        {summaryStats.salesGrowth >= 0 ? <FaCaretUp className="me-1" /> : <FaCaretDown className="me-1" />}
                        {Math.abs(summaryStats.salesGrowth).toFixed(1)}%
                      </span>
                    )}
                    <span className="text-muted ms-2">so với kỳ trước</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Đơn hàng</h6>
                      <h3 className="mb-0">{summaryStats ? summaryStats.totalOrders : 0}</h3>
                    </div>
                    <div className="icon-container bg-warning text-white rounded-circle p-3">
                      <FaShoppingCart size={24} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-muted">Giá trị trung bình:</span>{' '}
                    <span className="fw-bold">{summaryStats ? formatPrice(summaryStats.averageOrderValue) : 0}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Khách hàng mới</h6>
                      <h3 className="mb-0">{summaryStats ? summaryStats.newCustomers : 0}</h3>
                    </div>
                    <div className="icon-container bg-info text-white rounded-circle p-3">
                      <FaUser size={24} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-muted">Tổng khách hàng:</span>{' '}
                    <span className="fw-bold">{customerStats ? customerStats.totalCustomers : 0}</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={3}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-muted mb-1">Kho hàng</h6>
                      <h3 className="mb-0">{summaryStats ? summaryStats.totalProducts : 0}</h3>
                    </div>
                    <div className="icon-container bg-danger text-white rounded-circle p-3">
                      <FaBoxOpen size={24} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-warning">
                      <FaExclamationTriangle className="me-1" />
                      {summaryStats ? summaryStats.lowStockProducts : 0}
                    </span>
                    <span className="text-muted ms-2">sản phẩm sắp hết</span>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          {/* Charts */}
          <Row className="mb-4">
            <Col lg={8}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Biểu đồ doanh thu</h5>
                </Card.Header>
                <Card.Body>
                  {salesReport ? (
                    <Line data={formatSalesChartData()} options={lineChartOptions} />
                  ) : (
                    <div className="text-center py-5">
                      <Loader />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Phương thức thanh toán</h5>
                </Card.Header>
                <Card.Body>
                  {salesReport ? (
                    <Doughnut data={formatPaymentMethodsData()} options={pieChartOptions} />
                  ) : (
                    <div className="text-center py-5">
                      <Loader />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Top sản phẩm bán chạy</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th className="text-end">Đã bán</th>
                        <th className="text-end">Doanh thu</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts && topProducts.topSellingProducts ? (
                        topProducts.topSellingProducts.map((product, index) => (
                          <tr key={product.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={product.thumbnail || '/images/placeholder.jpg'}
                                  alt={product.name}
                                  width="40"
                                  height="40"
                                  className="me-2"
                                  style={{ objectFit: 'cover' }}
                                />
                                <div className="small">{product.name}</div>
                              </div>
                            </td>
                            <td className="text-end">{product.salesCount}</td>
                            <td className="text-end">{formatPrice(product.salesCount * product.price)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="3" className="text-center">
                            <Loader />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
                <Card.Footer className="bg-white text-center">
                  <LinkContainer to="/admin/products">
                    <Button variant="link" className="text-decoration-none">Xem tất cả sản phẩm</Button>
                  </LinkContainer>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col md={6} lg={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Đơn hàng gần đây</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th className="text-end">Tổng tiền</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders ? (
                        recentOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
  <LinkContainer to={`/admin/order/${order.id}`}>
    <Button variant="link" className="p-0 text-decoration-none">
      #{order.orderNumber}
    </Button>
  </LinkContainer>
</td>
                            <td>{order.customerName || 'Khách vãng lai'}</td>
                            <td className="text-end">{formatPrice(order.totalAmount)}</td>
                            <td>
                              <Badge bg={
                                order.status === 'pending' ? 'warning' :
                                order.status === 'processing' ? 'info' :
                                order.status === 'shipping' ? 'primary' :
                                order.status === 'delivered' ? 'success' :
                                'danger'
                              }>
                                {order.status === 'pending' ? 'Chờ xử lý' :
                                  order.status === 'processing' ? 'Đang xử lý' :
                                  order.status === 'shipping' ? 'Đang giao' :
                                  order.status === 'delivered' ? 'Đã giao' :
                                  'Đã hủy'}
                              </Badge>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">
                            <Loader />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
                <Card.Footer className="bg-white text-center">
                  <LinkContainer to="/admin/orders">
                    <Button variant="link" className="text-decoration-none">Xem tất cả đơn hàng</Button>
                  </LinkContainer>
                </Card.Footer>
              </Card>
            </Col>
            
            <Col lg={4}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Phân bố sản phẩm theo danh mục</h5>
                </Card.Header>
                <Card.Body>
                  {inventoryStats ? (
                    <Pie data={formatCategoryData()} options={pieChartOptions} />
                  ) : (
                    <div className="text-center py-5">
                      <Loader />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
          
          <Row className="mb-4">
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Phân bố sản phẩm theo độ tuổi</h5>
                </Card.Header>
                <Card.Body>
                  {inventoryStats ? (
                    <Bar data={formatAgeRangeData()} />
                  ) : (
                    <div className="text-center py-5">
                      <Loader />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Đánh giá gần đây</h5>
                </Card.Header>
                <Card.Body className="p-0">
                  <Table hover className="mb-0">
                    <thead>
                      <tr>
                        <th>Sản phẩm</th>
                        <th>Khách hàng</th>
                        <th>Đánh giá</th>
                        <th>Ngày</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentReviews ? (
                        recentReviews.map((review) => (
                          <tr key={review.id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <img
                                  src={review.product?.thumbnail || '/images/placeholder.jpg'}
                                  alt={review.product?.name}
                                  width="40"
                                  height="40"
                                  className="me-2"
                                  style={{ objectFit: 'cover' }}
                                />
                                <div className="small">{review.product?.name}</div>
                              </div>
                            </td>
                            <td>{review.user?.name}</td>
                            <td>
                              <div className="d-flex">
                                {[...Array(5)].map((_, i) => (
                                  <i 
                                    key={i}
                                    className={`fas fa-star ${i < review.rating ? 'text-warning' : 'text-muted'}`}
                                  ></i>
                                ))}
                              </div>
                            </td>
                            <td>{formatDate(review.createdAt)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="text-center">
                            <Loader />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Card.Body>
                <Card.Footer className="bg-white text-center">
                  <Button variant="link" className="text-decoration-none">Xem tất cả đánh giá</Button>
                </Card.Footer>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default DashboardPage; 