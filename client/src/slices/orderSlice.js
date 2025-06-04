import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { clearCart } from './cartSlice';
import { logout as userLogout } from './userSlice';

// Create order
export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (order, { getState, dispatch, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: user ? `Bearer ${user.token}` : undefined,
        },
      };

      const { data } = await axios.post('/api/orders', order, config);

      // Clear cart after successful order
      dispatch(clearCart());

      return data.order;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get order details
export const getOrderDetails = createAsyncThunk(
  'order/getOrderDetails',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      const config = {
        headers: {
          Authorization: user ? `Bearer ${user.token}` : undefined,
        },
      };

      const { data } = await axios.get(`/api/orders/${id}`, config);
      return data.order;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Pay order
export const payOrder = createAsyncThunk(
  'order/payOrder',
  async ({ orderId, paymentResult }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/orders/${orderId}/pay`,
        paymentResult,
        config
      );

      return data.order;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get logged in user orders
export const getMyOrders = createAsyncThunk(
  'order/getMyOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      const { myOrders } = getState().order;
      
      // Nếu đã có orders và có nhiều hơn 0 mục, không gọi API
      if (myOrders && Array.isArray(myOrders) && myOrders.length > 0) {
        console.log('Already have orders data, reusing:', myOrders.length);
        return myOrders;
      }

      if (!user || !user.token) {
        return rejectWithValue('Không có token xác thực. Vui lòng đăng nhập lại.');
      }

      // In token ra console để debug
      console.log('Token being used for orders:', user.token.substring(0, 15) + '...');
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
          'x-auth-token': user.token
        },
      };

      // Sử dụng URL tuyệt đối thay vì URL tương đối
      const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
      console.log('Received orders data:', data);
      
      // Đảm bảo trả về mảng rỗng nếu không có orders
      return data.data || [];
    } catch (error) {
      console.error('Error in getMyOrders:', error.response || error);
      
      // Kiểm tra lỗi 401 và trả về thông báo cụ thể
      if (error.response && error.response.status === 401) {
        return rejectWithValue('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
      }
      
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get all orders (admin)
export const getOrders = createAsyncThunk(
  'order/getOrders',
  async (params = {}, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        params
      };

      const { data } = await axios.get('/api/orders', config);
      return data.orders || [];
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update order to delivered (admin)
export const deliverOrder = createAsyncThunk(
  'order/deliverOrder',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(`/api/orders/${orderId}/deliver`, {}, config);
      return data.order;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update order status (admin)
export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        `/api/orders/${orderId}/status`,
        { status },
        config
      );

      return data.order;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get logged in user orders
export const fetchUserOrders = createAsyncThunk(
  'order/fetchUserOrders',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get('http://localhost:5000/api/orders/myorders', config);
      return data.orders;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get order by ID (admin)
export const getOrderById = createAsyncThunk(
  'order/getOrderById',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      if (!user || !user.token) {
        return rejectWithValue('Không có token xác thực. Vui lòng đăng nhập lại.');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'x-auth-token': user.token
        },
      };

      const { data } = await axios.get(`http://localhost:5000/api/orders/${orderId}`, config);
      
      if (!data || !data.success) {
        return rejectWithValue('Không thể lấy thông tin đơn hàng');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error in getOrderById:', error.response || error);
      
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update order tracking info (admin)
export const updateTrackingInfo = createAsyncThunk(
  'order/updateTrackingInfo',
  async ({ id, trackingNumber, shippingProvider }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      if (!user || !user.token) {
        return rejectWithValue('Không có token xác thực. Vui lòng đăng nhập lại.');
      }

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'x-auth-token': user.token
        },
      };

      const { data } = await axios.put(
        `http://localhost:5000/api/orders/${id}/tracking`, 
        { trackingNumber, shippingProvider }, 
        config
      );
      
      if (!data || !data.success) {
        return rejectWithValue('Không thể cập nhật thông tin vận chuyển');
      }
      
      return data.data;
    } catch (error) {
      console.error('Error in updateTrackingInfo:', error.response || error);
      
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const initialState = {
  orders: [],
  orderDetails: null,
  myOrders: [],
  userOrders: [],
  loading: false,
  error: null,
  success: false,
  createSuccess: false,
  paySuccess: false,
  deliverSuccess: false,
  updateSuccess: false,
};

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    resetOrderState: (state) => {
      state.success = false;
      state.error = null;
      state.createSuccess = false;
      state.paySuccess = false;
      state.deliverSuccess = false;
      state.updateSuccess = false;
    },
    clearOrderDetails: (state) => {
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create order
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createSuccess = true;
        state.orderDetails = action.payload;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get order details
      .addCase(getOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(getOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Pay order
      .addCase(payOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(payOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.paySuccess = true;
        state.orderDetails = action.payload;
      })
      .addCase(payOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get logged in user orders
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch user orders
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.userOrders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all orders (admin)
      .addCase(getOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(getOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update order to delivered (admin)
      .addCase(deliverOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deliverOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deliverSuccess = true;
        state.orderDetails = action.payload;
      })
      .addCase(deliverOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update order status (admin)
      .addCase(updateOrderStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updateSuccess = true;
        state.orderDetails = action.payload;
        state.orders = state.orders.map((order) =>
          order.id === action.payload.id ? action.payload : order
        );
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get order by ID (admin)
      .addCase(getOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.orderDetails = action.payload;
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update tracking info
      .addCase(updateTrackingInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateTrackingInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.orderDetails = action.payload;
        
        // Cập nhật đơn hàng trong danh sách nếu có
        if (action.payload && action.payload.id) {
          state.orders = state.orders.map(order => 
            order.id === action.payload.id ? action.payload : order
          );
        }
      })
      .addCase(updateTrackingInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })

      // Clear orders when logging out
      .addCase(userLogout.fulfilled, (state) => {
        state.myOrders = [];
        state.orders = [];
        state.userOrders = [];
        state.orderDetails = null;
      });
  },
});

export const { resetOrderState, clearOrderDetails } = orderSlice.actions;

export default orderSlice.reducer; 