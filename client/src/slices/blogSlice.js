import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch all blog posts
export const fetchBlogPosts = createAsyncThunk(
  'blog/fetchBlogPosts',
  async ({ page = 1, category = '', keyword = '' }, { rejectWithValue }) => {
    try {
      let url = `/api/blog?page=${page}`;
      
      if (category) url += `&category=${category}`;
      if (keyword) url += `&keyword=${keyword}`;
      
      const { data } = await axios.get(url);
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

// Fetch blog post details
export const fetchBlogPostDetails = createAsyncThunk(
  'blog/fetchBlogPostDetails',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/blog/${id}`);
      return data.blogPost;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Fetch blog categories
export const fetchBlogCategories = createAsyncThunk(
  'blog/fetchBlogCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/blog/categories');
      return data.categories;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Create blog post (admin)
export const createBlogPost = createAsyncThunk(
  'blog/createBlogPost',
  async (blogData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.post('/api/blog', blogData, config);
      return data.blogPost;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Update blog post (admin)
export const updateBlogPost = createAsyncThunk(
  'blog/updateBlogPost',
  async ({ id, blogData }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      const { data } = await axios.put(`/api/blog/${id}`, blogData, config);
      return data.blogPost;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Delete blog post (admin)
export const deleteBlogPost = createAsyncThunk(
  'blog/deleteBlogPost',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().user;
      
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      
      await axios.delete(`/api/blog/${id}`, config);
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
  blogPosts: [],
  blogPost: null,
  categories: [],
  page: 1,
  pages: 1,
  total: 0,
  loading: false,
  error: null,
  success: false,
  deleteSuccess: false,
  createSuccess: false,
  updateSuccess: false,
};

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    resetBlogState: (state) => {
      state.success = false;
      state.error = null;
      state.deleteSuccess = false;
      state.createSuccess = false;
      state.updateSuccess = false;
    },
    clearBlogPostDetail: (state) => {
      state.blogPost = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch blog posts
      .addCase(fetchBlogPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.blogPosts = action.payload.blogPosts;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(fetchBlogPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch blog post details
      .addCase(fetchBlogPostDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogPostDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.blogPost = action.payload;
      })
      .addCase(fetchBlogPostDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch blog categories
      .addCase(fetchBlogCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchBlogCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create blog post (admin)
      .addCase(createBlogPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBlogPost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.createSuccess = true;
        state.blogPosts = [...state.blogPosts, action.payload];
      })
      .addCase(createBlogPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update blog post (admin)
      .addCase(updateBlogPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBlogPost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.updateSuccess = true;
        state.blogPost = action.payload;
        state.blogPosts = state.blogPosts.map((post) =>
          post.id === action.payload.id ? action.payload : post
        );
      })
      .addCase(updateBlogPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete blog post (admin)
      .addCase(deleteBlogPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBlogPost.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.deleteSuccess = true;
        state.blogPosts = state.blogPosts.filter((post) => post.id !== action.payload);
      })
      .addCase(deleteBlogPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetBlogState, clearBlogPostDetail } = blogSlice.actions;

export default blogSlice.reducer; 