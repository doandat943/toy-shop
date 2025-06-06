import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get promo code from local storage
const promoFromStorage = localStorage.getItem('promoCode')
  ? JSON.parse(localStorage.getItem('promoCode'))
  : null;

// Apply promo code
export const applyPromo = createAsyncThunk(
  'promo/applyPromo',
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/promotions/verify/${code}`);
      
      if (data.success && data.promotion) {
        const promoData = {
          code: data.promotion.code,
          discountType: data.promotion.discountType,
          discountValue: data.promotion.discountValue,
          discountAmount: calculateDiscountAmount(data.promotion)
        };
        
        localStorage.setItem('promoCode', JSON.stringify(promoData));
        return promoData;
      } else {
        return rejectWithValue(data.message || 'Mã khuyến mãi không hợp lệ');
      }
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Calculate discount amount based on cart total and promo code
const calculateDiscountAmount = (promotion) => {
  // In a real app, this would calculate based on current cart total
  // For now, we'll just use a placeholder
  if (promotion.discountType === 'percentage') {
    // For percentage discount, we'll need cart total from the store
    // This is simplified - in real app, you'd use getState to get cart total
    const cartTotal = 1000000; // Placeholder
    return (promotion.discountValue / 100) * cartTotal;
  } else if (promotion.discountType === 'fixed_amount') {
    return promotion.discountValue;
  } else if (promotion.discountType === 'free_shipping') {
    return 30000; // Assume standard shipping cost
  }
  return 0;
};

// Remove promo code
export const removePromo = createAsyncThunk('promo/removePromo', async () => {
  localStorage.removeItem('promoCode');
  return null;
});

const promoSlice = createSlice({
  name: 'promo',
  initialState: {
    promo: promoFromStorage,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Apply promo code
      .addCase(applyPromo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(applyPromo.fulfilled, (state, action) => {
        state.loading = false;
        state.promo = action.payload;
      })
      .addCase(applyPromo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Remove promo code
      .addCase(removePromo.fulfilled, (state) => {
        state.promo = null;
      });
  },
});

export default promoSlice.reducer;
