import React, { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from '../slices/userSlice';

const PrivateRoute = () => {
  const { user, profileLoading, profileError } = useSelector((state) => state.user);
  const location = useLocation();
  const dispatch = useDispatch();
  const profileChecked = useRef(false);
  
  useEffect(() => {
    // Chỉ kiểm tra profile một lần khi component mount
    // hoặc khi user token thay đổi (đăng nhập mới)
    if (user && user.token && !profileChecked.current && !profileLoading) {
      console.log('Fetching user profile for authentication check');
      profileChecked.current = true;
      dispatch(getUserProfile());
    }
  }, [dispatch, user, profileLoading]);
  
  // Kiểm tra user và token
  if (!user || !user.token) {
    console.log('PrivateRoute: No user or token, redirecting to login');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default PrivateRoute; 