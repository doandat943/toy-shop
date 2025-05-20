import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get available payment methods
export const getPaymentMethods = createAsyncThunk(
  'payment/getPaymentMethods',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get('/api/payment/methods');
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

// Create payment intent for Stripe
export const createPaymentIntent = createAsyncThunk(
  'payment/createPaymentIntent',
  async ({ orderId, total, paymentMethod }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post(
        '/api/payment/create-payment-intent',
        { orderId, total, paymentMethod },
        config
      );

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

// Get payment status
export const getPaymentStatus = createAsyncThunk(
  'payment/getPaymentStatus',
  async (orderId, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/payment/status/${orderId}`, config);
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
  paymentMethods: [],
  clientSecret: null,
  paymentStatus: null,
  loading: false,
  error: null,
  success: false,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    resetPaymentState: (state) => {
      state.error = null;
      state.success = false;
    },
    clearPaymentIntent: (state) => {
      state.clientSecret = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get payment methods
      .addCase(getPaymentMethods.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentMethods.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethods = action.payload;
      })
      .addCase(getPaymentMethods.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create payment intent
      .addCase(createPaymentIntent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaymentIntent.fulfilled, (state, action) => {
        state.loading = false;
        state.clientSecret = action.payload.clientSecret;
        state.success = true;
      })
      .addCase(createPaymentIntent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get payment status
      .addCase(getPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentStatus = action.payload;
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetPaymentState, clearPaymentIntent } = paymentSlice.actions;

export default paymentSlice.reducer; 