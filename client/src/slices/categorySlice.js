import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { getCategories } from '../mocks/mockService';

// Fetch all categories
export const fetchCategories = createAsyncThunk(
  'category/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getCategories();
      return data.categories;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch category by ID
export const fetchCategoryById = createAsyncThunk(
  'category/fetchCategoryById',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/categories/${id}`);
      return data.category;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create category (admin)
export const createCategory = createAsyncThunk(
  'category/createCategory',
  async (categoryData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.post('/api/categories', categoryData, config);
      return data.category;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update category (admin)
export const updateCategory = createAsyncThunk(
  'category/updateCategory',
  async ({ id, categoryData }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.put(`/api/categories/${id}`, categoryData, config);
      return data.category;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete category (admin)
export const deleteCategory = createAsyncThunk(
  'category/deleteCategory',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      await axios.delete(`/api/categories/${id}`, config);
      return id;
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
  categories: [],
  category: null,
  loading: false,
  error: null,
  success: false,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
};

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    resetCategoryState: (state) => {
      state.error = null;
      state.success = false;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    clearCategoryDetail: (state) => {
      state.category = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch categories
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch category by ID
      .addCase(fetchCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.category = action.payload;
      })
      .addCase(fetchCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create category (admin)
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        state.categories = [...state.categories, action.payload];
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update category (admin)
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        state.category = action.payload;
        state.categories = state.categories.map((category) =>
          category.id === action.payload.id ? action.payload : category
        );
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete category (admin)
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = true;
        state.categories = state.categories.filter(
          (category) => category.id !== action.payload
        );
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetCategoryState, clearCategoryDetail } = categorySlice.actions;

export default categorySlice.reducer; 