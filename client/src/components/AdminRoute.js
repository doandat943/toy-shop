import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserProfile } from '../slices/userSlice';

const AdminRoute = () => {
  const { user, profileLoading } = useSelector((state) => state.user);
  const location = useLocation();
  const dispatch = useDispatch();
  
  useEffect(() => {
    // Nếu có user token nhưng cần lấy thêm thông tin role
    if (user && user.token && (!user.role || user.role !== 'admin')) {
      dispatch(getUserProfile());
    }
  }, [user, dispatch]);
  
  // Đang loading profile
  if (profileLoading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Không có user hoặc không phải admin
  if (!user || !user.token || user.role !== 'admin') {
    console.log('Admin access denied:', { 
      hasUser: !!user, 
      hasToken: !!(user && user.token),
      role: user?.role 
    });
    
    return <Navigate to="/login" state={{ from: location.pathname, requiresAdmin: true }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute; 