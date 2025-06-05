import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch products
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params = {}, { rejectWithValue }) => {
    try {
      const { page = 1, keyword = '', category = '', sortBy = 'createdAt', sortOrder = 'DESC', minPrice = '', maxPrice = '', minAge = '', maxAge = '', featured = false } = params;
      const query = new URLSearchParams({ page, keyword, category, sortBy, sortOrder, minPrice, maxPrice, minAge, maxAge, featured }).toString();
      const { data } = await axios.get(`/api/products?${query}`);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Fetch product details
export const fetchProductDetails = createAsyncThunk(
  'products/fetchProductDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create product review
export const createProductReview = createAsyncThunk(
  'products/createProductReview',
  async ({ productId, review }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };
      await axios.post(`/api/products/${productId}/reviews`, review, config);
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Fetch top rated products
export const fetchTopProducts = createAsyncThunk(
  'product/fetchTopProducts',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/products/top');
      return data.products;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Fetch related products
export const fetchRelatedProducts = createAsyncThunk(
  'product/fetchRelatedProducts',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}/related`);
      return data.products;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create product (admin)
export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.post('/api/products', productData, config);
      
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update product (admin)
export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ id, productData }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.put(`/api/products/${id}`, productData, config);
      
      return data.product;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete product (admin)
export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      await axios.delete(`/api/products/${id}`, config);
      
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
  products: [],
  product: null,
  topProducts: [],
  relatedProducts: [],
  page: 1,
  pages: 1,
  total: 0,
  loading: false,
  error: null,
  success: false,
  deleteSuccess: false,
  createSuccess: false,
  updateSuccess: false,
  reviewSuccess: false,
  reviewError: null,
};

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    resetProductState: (state) => {
      state.error = null;
      state.success = false;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
      state.reviewSuccess = false;
      state.reviewError = null;
    },
    resetProductDetail: (state) => {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch product details
      .addCase(fetchProductDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure product.images is always an array
        if (action.payload && action.payload.images && !Array.isArray(action.payload.images)) {
          try {
            action.payload.images = JSON.parse(action.payload.images);
            if (!Array.isArray(action.payload.images)) {
              action.payload.images = [];
            }
          } catch (error) {
            action.payload.images = [];
          }
        } else if (action.payload && !action.payload.images) {
          action.payload.images = [];
        }
        state.product = action.payload;
      })
      .addCase(fetchProductDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create product review
      .addCase(createProductReview.pending, (state) => {
        state.loading = true;
        state.reviewError = null;
        state.reviewSuccess = false;
      })
      .addCase(createProductReview.fulfilled, (state) => {
        state.loading = false;
        state.reviewSuccess = true;
      })
      .addCase(createProductReview.rejected, (state, action) => {
        state.loading = false;
        state.reviewError = action.payload;
      })
      
      // Fetch top products
      .addCase(fetchTopProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch related products
      .addCase(fetchRelatedProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRelatedProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.relatedProducts = action.payload;
      })
      .addCase(fetchRelatedProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create product (admin)
      .addCase(createProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.createSuccess = false;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.createSuccess = true;
        state.products = [...state.products, action.payload];
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update product (admin)
      .addCase(updateProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.updateSuccess = true;
        state.product = action.payload;
        state.products = state.products.map((product) =>
          product.id === action.payload.id ? action.payload : product
        );
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete product (admin)
      .addCase(deleteProduct.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.deleteSuccess = false;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.deleteSuccess = true;
        state.products = state.products.filter(
          (product) => product.id !== action.payload
        );
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetProductState, resetProductDetail } = productSlice.actions;

export default productSlice.reducer; 