import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get user from local storage
const userFromStorage = localStorage.getItem('user') && localStorage.getItem('user') !== 'undefined'
  ? JSON.parse(localStorage.getItem('user'))
  : null;

// Login
export const login = createAsyncThunk(
  'user/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      
      console.log('Sending login request...');
      const { data } = await axios.post('/api/auth/login', { email, password }, config);
      console.log('Login response:', data);
      
      // Đảm bảo response chứa token và user
      if (!data.token) {
        return rejectWithValue('Token không hợp lệ từ API');
      }
      
      // Tạo object user với cấu trúc phù hợp
      const userData = { 
        ...data.data.user,
        token: data.token 
      };
      
      console.log('User data to save:', userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      console.error('Login error:', error.response || error);
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Register
export const register = createAsyncThunk(
  'user/register',
  async ({ name, email, password, phone }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };
      const { data } = await axios.post('/api/auth/register', { name, email, password, phone }, config);
      const userData = { ...data.data.user, token: data.token };
      localStorage.setItem('user', JSON.stringify(userData));
      return userData;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Logout
export const logout = createAsyncThunk('user/logout', async () => {
  localStorage.removeItem('user');
  return null;
});

// Get user profile
export const getUserProfile = createAsyncThunk(
  'user/profile',
  async (arg, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      if (!user || !user.token) {
        console.error('No user token available for getUserProfile:', user);
        return rejectWithValue('Không có token xác thực. Vui lòng đăng nhập lại.');
      }
      
      console.log('Getting profile with token:', user.token);

      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'x-auth-token': user.token
        },
      };

      // Sử dụng URL tuyệt đối
      const { data } = await axios.get('http://localhost:5000/api/auth/me', config);

      console.log('getUserProfile response:', data);

      if (data && data.data && data.data.user) {
        // Đảm bảo có thông tin role
        if (!data.data.user.role && user.role) {
          console.log('Role not in response, using existing role:', user.role);
          data.data.user.role = user.role; 
        }
        
        // Kết hợp thông tin user từ server với token hiện có
        const profileData = {
          ...data.data.user,
          token: user.token,
          // Đảm bảo có role, mặc định là 'customer'
          role: data.data.user.role || user.role || 'customer'
        };
        
        console.log('Processed profile data with role:', profileData.role);
        return profileData;
      } else {
        console.error('Invalid response format:', data);
        return rejectWithValue('Định dạng phản hồi không hợp lệ');
      }
    } catch (error) {
      console.error('getUserProfile error:', error.response || error);
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

// Update user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateProfile',
  async (userData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      if (!user || !user.token) {
        console.error('No user token available:', user);
        return rejectWithValue('Không có token xác thực. Vui lòng đăng nhập lại.');
      }
      
      console.log('Updating profile with token:', user.token);
      console.log('Profile data being sent:', userData);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
          'x-auth-token': user.token
        },
      };

      // Sử dụng URL tuyệt đối
      const { data } = await axios.put('http://localhost:5000/api/users/profile', userData, config);

      console.log('Profile update response:', data);

      if (data && data.data) {
        // Lưu vào localStorage với token
        const updatedUserData = { ...data.data, token: user.token };
        localStorage.setItem('user', JSON.stringify(updatedUserData));
        return updatedUserData;
      } else {
        return rejectWithValue('Định dạng phản hồi không hợp lệ');
      }
    } catch (error) {
      console.error('Profile update error:', error.response || error);
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get all users (admin)
export const getUsers = createAsyncThunk(
  'user/getUsers',
  async (params = {}, { getState, rejectWithValue }) => {
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
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          keyword: params.keyword || '',
          role: params.role || '',
          status: params.status || ''
        }
      };

      const { data } = await axios.get('http://localhost:5000/api/users', config);
      
      return {
        users: data.data || [],
        page: data.page || 1,
        pages: data.pages || 1,
        total: data.count || 0
      };
    } catch (error) {
      console.error('Error in getUsers:', error.response || error);
      
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Get user by ID (admin)
export const getUserById = createAsyncThunk(
  'user/getUserById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      if (!user || !user.token) {
        return rejectWithValue('Không có token xác thực. Vui lòng đăng nhập lại.');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'x-auth-token': user.token
        }
      };

      const { data } = await axios.get(
        `http://localhost:5000/api/users/${id}`,
        config
      );
      
      return data.data;
    } catch (error) {
      console.error('Error in getUserById:', error.response || error);
      
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update user status (admin)
export const updateUserStatus = createAsyncThunk(
  'user/updateUserStatus',
  async ({ id, isActive }, { getState, rejectWithValue }) => {
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
        }
      };

      const { data } = await axios.put(
        `http://localhost:5000/api/users/${id}/status`,
        { isActive },
        config
      );

      return data.data;
    } catch (error) {
      console.error('Error in updateUserStatus:', error.response || error);
      
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create user (admin)
export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { getState, rejectWithValue }) => {
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
        }
      };

      const { data } = await axios.post(
        'http://localhost:5000/api/users',
        userData,
        config
      );

      return data.data;
    } catch (error) {
      console.error('Error in createUser:', error.response || error);
      
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update user (admin)
export const updateUser = createAsyncThunk(
  'user/updateUser',
  async ({ id, userData }, { getState, rejectWithValue }) => {
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
        }
      };

      const { data } = await axios.put(
        `http://localhost:5000/api/users/${id}`,
        userData,
        config
      );

      return data.data;
    } catch (error) {
      console.error('Error in updateUser:', error.response || error);
      
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete user (admin)
export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      if (!user || !user.token) {
        return rejectWithValue('Không có token xác thực. Vui lòng đăng nhập lại.');
      }

      const config = {
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'x-auth-token': user.token
        }
      };

      await axios.delete(`http://localhost:5000/api/users/${id}`, config);

      return id;
    } catch (error) {
      console.error('Error in deleteUser:', error.response || error);
      
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Change password
export const changePassword = createAsyncThunk(
  'user/changePassword',
  async ({ currentPassword, newPassword }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.put(
        '/api/users/password',
        { currentPassword, newPassword },
        config
      );

      return data.message;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'user/resetPassword',
  async ({ token, password }, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        `/api/users/reset-password/${token}`,
        { password },
        config
      );

      return data.message;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  'user/forgotPassword',
  async (email, { rejectWithValue }) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const { data } = await axios.post(
        '/api/users/forgot-password',
        { email },
        config
      );

      return data.message;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

const initialState = {
  user: userFromStorage,
  users: [],
  loading: false,
  error: null,
  success: false,
  profileLoading: false,
  profileError: null,
  message: null,
  updateSuccess: false,
  page: 1,
  pages: 1,
  total: 0
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    resetUserState: (state) => {
      state.error = null;
      state.success = false;
      state.profileError = null;
      state.message = null;
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      })

      // Get user profile
      .addCase(getUserProfile.pending, (state) => {
        state.profileLoading = true;
        state.profileError = null;
      })
      .addCase(getUserProfile.fulfilled, (state, action) => {
        state.profileLoading = false;
        state.user = {
          ...state.user,
          ...action.payload,
          token: state.user.token
        };
      })
      .addCase(getUserProfile.rejected, (state, action) => {
        state.profileLoading = false;
        state.profileError = action.payload;
      })

      // Update user profile
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.user = action.payload;
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get all users (admin)
      .addCase(getUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(getUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get user by ID (admin)
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.users = [...state.users, action.payload];
      })
      .addCase(getUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user status (admin)
      .addCase(updateUserStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        
        // Cập nhật user trong danh sách
        if (action.payload && action.payload.id) {
          state.users = state.users.map(user => 
            user.id === action.payload.id ? action.payload : user
          );
        }
      })
      .addCase(updateUserStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.updateSuccess = false;
      })

      // Create user (admin)
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = [...state.users, action.payload];
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Update user (admin)
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        );
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete user (admin)
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Change password
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Forgot password
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.message = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetUserState } = userSlice.actions;

export default userSlice.reducer; 