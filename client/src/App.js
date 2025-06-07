import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderPage from './pages/OrderPage';
import OrdersPage from './pages/OrdersPage';
import OrderStatusPage from './pages/OrderStatusPage';
import PrivateRoute from './components/PrivateRoute';
import AdminRoute from './components/AdminRoute';
import BirthdayGiftFinderPage from './pages/BirthdayGiftFinderPage';
import PromotionalCalendarPage from './pages/PromotionalCalendarPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ProfilePage from './pages/ProfilePage';
import WishlistPage from './pages/WishlistPage';

// Admin pages
import DashboardPage from './pages/admin/DashboardPage';
import OrdersListPage from './pages/admin/OrdersListPage';
import OrderDetailPage from './pages/admin/OrderDetailPage';
import ProductsListPage from './pages/admin/ProductsListPage';
import ProductFormPage from './pages/admin/ProductFormPage';
import PromotionsPage from './pages/admin/PromotionsPage';
import CustomersListPage from './pages/admin/CustomersListPage';
import CustomerFormPage from './pages/admin/CustomerFormPage';
import CarouselManagementPage from './pages/admin/CarouselManagementPage';
import AdminShippingPanel from './pages/admin/AdminShippingPanel';

// Layouts
import AdminLayout from './components/layout/AdminLayout';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Admin Routes with Admin Layout */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="orders" element={<OrdersListPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="products" element={<ProductsListPage />} />
            <Route path="product/create" element={<ProductFormPage />} />
            <Route path="product/:id/edit" element={<ProductFormPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="customers" element={<CustomersListPage />} />
            <Route path="customer/create" element={<CustomerFormPage />} />
            <Route path="customer/:id/edit" element={<CustomerFormPage />} />
            <Route path="carousel" element={<CarouselManagementPage />} />
            <Route path="shipping" element={<AdminShippingPanel />} />
          </Route>
        </Route>

        {/* Client-facing Routes with normal layout */}
        <Route
          path="*"
          element={
            <>
              <Header />
              <main className="py-3">
                <Container>
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/cart/:id" element={<CartPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    
                    {/* Protected Routes - Requires Authentication */}
                    <Route element={<PrivateRoute />}>
                      <Route path="/order/:id" element={<OrderPage />} />
                      <Route path="/order/status/:orderId" element={<OrderStatusPage />} />
                      <Route path="/orders" element={<OrdersPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/wishlist" element={<WishlistPage />} />
                    </Route>

                    {/* Special features */}
                    <Route path="/gift-finder" element={<BirthdayGiftFinderPage />} />
                    <Route path="/promotions" element={<PromotionalCalendarPage />} />

                    {/* Blog pages */}
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:id" element={<BlogDetailPage />} />
                  </Routes>
                </Container>
              </main>
              <Footer />
            </>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
