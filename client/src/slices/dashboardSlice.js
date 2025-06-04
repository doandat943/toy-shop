import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Async thunks
export const fetchSummaryStats = createAsyncThunk(
  'dashboard/fetchSummaryStats',
  async ({ period = 'month' }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/dashboard/summary?period=${period}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchSalesReport = createAsyncThunk(
  'dashboard/fetchSalesReport',
  async ({ period = 'month', groupBy = 'day' }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/dashboard/sales?period=${period}&groupBy=${groupBy}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchTopProducts = createAsyncThunk(
  'dashboard/fetchTopProducts',
  async ({ limit = 10, period = 'month' }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/dashboard/top-products?limit=${limit}&period=${period}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchCustomerStats = createAsyncThunk(
  'dashboard/fetchCustomerStats',
  async ({ period = 'month' }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/dashboard/customers?period=${period}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchInventoryStats = createAsyncThunk(
  'dashboard/fetchInventoryStats',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/dashboard/inventory`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchRecentOrders = createAsyncThunk(
  'dashboard/fetchRecentOrders',
  async ({ limit = 5 }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/dashboard/recent-orders?limit=${limit}`);
      return data.data;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

export const fetchRecentReviews = createAsyncThunk(
  'dashboard/fetchRecentReviews',
  async ({ limit = 5 }, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/dashboard/recent-reviews?limit=${limit}`);
      return data.data;
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
  summaryStats: null,
  salesReport: null,
  topProducts: [],
  customerStats: null,
  inventoryStats: null,
  recentOrders: [],
  recentReviews: [],
  loading: false,
  error: null
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearDashboardState: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    // Summary Stats
    builder.addCase(fetchSummaryStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSummaryStats.fulfilled, (state, action) => {
      state.loading = false;
      state.summaryStats = action.payload;
    });
    builder.addCase(fetchSummaryStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Sales Report
    builder.addCase(fetchSalesReport.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSalesReport.fulfilled, (state, action) => {
      state.loading = false;
      state.salesReport = action.payload;
    });
    builder.addCase(fetchSalesReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Top Products
    builder.addCase(fetchTopProducts.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchTopProducts.fulfilled, (state, action) => {
      state.loading = false;
      state.topProducts = action.payload;
    });
    builder.addCase(fetchTopProducts.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Customer Stats
    builder.addCase(fetchCustomerStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCustomerStats.fulfilled, (state, action) => {
      state.loading = false;
      state.customerStats = action.payload;
    });
    builder.addCase(fetchCustomerStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Inventory Stats
    builder.addCase(fetchInventoryStats.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchInventoryStats.fulfilled, (state, action) => {
      state.loading = false;
      state.inventoryStats = action.payload;
    });
    builder.addCase(fetchInventoryStats.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Recent Orders
    builder.addCase(fetchRecentOrders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecentOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.recentOrders = action.payload;
    });
    builder.addCase(fetchRecentOrders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Recent Reviews
    builder.addCase(fetchRecentReviews.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchRecentReviews.fulfilled, (state, action) => {
      state.loading = false;
      state.recentReviews = action.payload;
    });
    builder.addCase(fetchRecentReviews.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });
  }
});

export const { clearDashboardState } = dashboardSlice.actions;
export default dashboardSlice.reducer; 