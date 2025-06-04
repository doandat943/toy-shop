import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { Provider } from 'react-redux';
import store from './store';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Đăng ký các component Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Cấu hình axios mặc định
// Trong môi trường development, sử dụng baseURL là http://localhost:5000
// Nếu ở môi trường production, server API sẽ ở cùng domain
axios.defaults.baseURL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:5000' 
  : '';

// Thêm interceptor để xử lý token
axios.interceptors.request.use(
  (config) => {
    try {
      const userStr = localStorage.getItem('user');
      
      if (!userStr) {
        console.log('No user in localStorage');
        return config;
      }
      
      const user = JSON.parse(userStr);
      
      if (user && user.token) {
        console.log('Adding auth token to request:', config.url);
        // Thêm cả hai loại header để đảm bảo tương thích
        config.headers.Authorization = `Bearer ${user.token}`;
        config.headers['x-auth-token'] = user.token;
      } else {
        console.warn('User exists but no token found:', user);
      }
    } catch (err) {
      console.error('Error in axios interceptor:', err);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.error('Authentication error (401):', error.response.data);
      // Có thể thêm code chuyển hướng về trang login ở đây
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
