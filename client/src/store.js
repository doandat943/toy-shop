import { configureStore } from '@reduxjs/toolkit';
import { combineReducers } from 'redux';

// Import reducers
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import userReducer from './slices/userSlice';
import categoryReducer from './slices/categorySlice';
import wishlistReducer from './slices/wishlistSlice';
import blogReducer from './slices/blogSlice';
import orderReducer from './slices/orderSlice';
import paymentReducer from './slices/paymentSlice';
import promotionReducer from './slices/promotionSlice';
import dashboardReducer from './slices/dashboardSlice';
import carouselReducer from './slices/carouselSlice';
import shippingReducer from './slices/shippingSlice';
import promoReducer from './slices/promoSlice';

// Combine reducers
const rootReducer = combineReducers({
  product: productReducer,
  cart: cartReducer,
  user: userReducer,
  category: categoryReducer,
  wishlist: wishlistReducer,
  blog: blogReducer,
  order: orderReducer,
  payment: paymentReducer,
  promotion: promotionReducer,
  dashboard: dashboardReducer,
  auth: userReducer, // Map auth to userReducer for compatibility with our component names
  carousel: carouselReducer,
  shipping: shippingReducer,
  promo: promoReducer
});

// Create store
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
});

export default store; 