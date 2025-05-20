import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Validate promotion code
export const validatePromoCode = createAsyncThunk(
  'promotion/validatePromoCode',
  async ({ code, cartTotal, products, categories }, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: user ? `Bearer ${user.token}` : undefined,
        },
      };

      const { data } = await axios.post(
        '/api/promotion/validate',
        { code, cartTotal, products, categories },
        config
      );

      // Store promo code in localStorage
      localStorage.setItem('promoCode', JSON.stringify(data.data));

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

// Get promotion codes (admin)
export const getPromoCodes = createAsyncThunk(
  'promotion/getPromoCodes',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get('/api/promotion/promocodes', config);
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

// Create promotion code (admin)
export const createPromoCode = createAsyncThunk(
  'promotion/createPromoCode',
  async (promoData, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post('/api/promotion/promocodes', promoData, config);
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

// Get promo code by ID (admin)
export const getPromoCodeById = createAsyncThunk(
  'promotion/getPromoCodeById',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { user } = getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/promotion/promocodes/${id}`, config);
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

// Clear promo code
export const clearPromoCode = createAsyncThunk(
  'promotion/clearPromoCode',
  async (_, { dispatch }) => {
    localStorage.removeItem('promoCode');
    return null;
  }
);

// Get promo code from localStorage
const promoCodeFromStorage = localStorage.getItem('promoCode')
  ? JSON.parse(localStorage.getItem('promoCode'))
  : null;

const initialState = {
  promoCode: promoCodeFromStorage,
  promoCodes: [],
  promoCodeDetails: null,
  loading: false,
  validateLoading: false,
  adminLoading: false,
  error: null,
  validateError: null,
  adminError: null,
  success: false,
  createSuccess: false,
  updateSuccess: false,
  deleteSuccess: false,
  discountAmount: promoCodeFromStorage ? promoCodeFromStorage.discountAmount : 0,
};

const promotionSlice = createSlice({
  name: 'promotion',
  initialState,
  reducers: {
    resetPromotionState: (state) => {
      state.error = null;
      state.validateError = null;
      state.adminError = null;
      state.success = false;
      state.createSuccess = false;
      state.updateSuccess = false;
      state.deleteSuccess = false;
    },
    resetPromoCode: (state) => {
      state.promoCode = null;
      state.discountAmount = 0;
      localStorage.removeItem('promoCode');
    },
  },
  extraReducers: (builder) => {
    builder
      // Validate promo code
      .addCase(validatePromoCode.pending, (state) => {
        state.validateLoading = true;
        state.validateError = null;
      })
      .addCase(validatePromoCode.fulfilled, (state, action) => {
        state.validateLoading = false;
        state.promoCode = action.payload;
        state.discountAmount = action.payload.discountAmount;
        state.success = true;
      })
      .addCase(validatePromoCode.rejected, (state, action) => {
        state.validateLoading = false;
        state.validateError = action.payload;
      })

      // Get all promo codes (admin)
      .addCase(getPromoCodes.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(getPromoCodes.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.promoCodes = action.payload;
      })
      .addCase(getPromoCodes.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })

      // Create promo code (admin)
      .addCase(createPromoCode.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(createPromoCode.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.promoCodes = [...state.promoCodes, action.payload];
        state.createSuccess = true;
      })
      .addCase(createPromoCode.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })

      // Get promo code by ID (admin)
      .addCase(getPromoCodeById.pending, (state) => {
        state.adminLoading = true;
        state.adminError = null;
      })
      .addCase(getPromoCodeById.fulfilled, (state, action) => {
        state.adminLoading = false;
        state.promoCodeDetails = action.payload;
      })
      .addCase(getPromoCodeById.rejected, (state, action) => {
        state.adminLoading = false;
        state.adminError = action.payload;
      })

      // Clear promo code
      .addCase(clearPromoCode.fulfilled, (state) => {
        state.promoCode = null;
        state.discountAmount = 0;
      });
  },
});

export const { resetPromotionState, resetPromoCode } = promotionSlice.actions;

export default promotionSlice.reducer; 