import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Get shipping address from local storage
const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : null;

// Save shipping address
export const saveShippingAddress = createAsyncThunk(
  'shipping/saveShippingAddress',
  async (shippingAddress, { rejectWithValue }) => {
    try {
      localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
      return shippingAddress;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Reset shipping address
export const resetShippingAddress = createAsyncThunk(
  'shipping/resetShippingAddress',
  async () => {
    localStorage.removeItem('shippingAddress');
    return null;
  }
);

const shippingSlice = createSlice({
  name: 'shipping',
  initialState: {
    shippingAddress: shippingAddressFromStorage,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Save shipping address
      .addCase(saveShippingAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingAddress = action.payload;
      })
      .addCase(saveShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reset shipping address
      .addCase(resetShippingAddress.fulfilled, (state) => {
        state.shippingAddress = null;
      });
  },
});

export default shippingSlice.reducer;
