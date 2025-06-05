import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Fetch ACTIVE carousel items from API (for public display)
export const fetchActiveCarouselItems = createAsyncThunk(
  'carousel/fetchActiveCarouselItems',
  async (_, { rejectWithValue }) => {
    try {
      // Corrected endpoint to use /api/carousel/active relative to the proxy
      const response = await axios.get('/api/carousel/active');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch active carousel items');
    }
  }
);

// Fetch ALL carousel items from API (for admin)
export const fetchCarouselItems = createAsyncThunk(
  'carousel/fetchCarouselItems',
  async (_, { rejectWithValue }) => {
    try {
      // Corrected endpoint to use /api/carousel relative to the proxy
      const response = await axios.get('/api/carousel'); 
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch carousel items');
    }
  }
);

// Add new carousel item
export const addCarouselItem = createAsyncThunk(
  'carousel/addCarouselItem',
  async (itemData, { rejectWithValue }) => {
    try {
      // Corrected endpoint to use /api/carousel relative to the proxy
      const response = await axios.post('/api/carousel', itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add carousel item');
    }
  }
);

// Update existing carousel item
export const updateCarouselItem = createAsyncThunk(
  'carousel/updateCarouselItem',
  async ({ id, ...itemData }, { rejectWithValue }) => {
    try {
      // Corrected endpoint to use /api/carousel/:id relative to the proxy
      const response = await axios.put(`/api/carousel/${id}`, itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update carousel item');
    }
  }
);

// Delete carousel item
export const deleteCarouselItem = createAsyncThunk(
  'carousel/deleteCarouselItem',
  async (id, { rejectWithValue }) => {
    try {
      // Corrected endpoint to use /api/carousel/:id relative to the proxy
      await axios.delete(`/api/carousel/${id}`);
      return { id }; // Ensure payload matches expected structure for reducer
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete carousel item');
    }
  }
);

const initialState = {
  items: [], // Holds items for either public display or admin management depending on fetch
  loading: false,
  error: null
};

const carouselSlice = createSlice({
  name: 'carousel',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Cases for fetchActiveCarouselItems
      .addCase(fetchActiveCarouselItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveCarouselItems.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.carouselItems || [];
      })
      .addCase(fetchActiveCarouselItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cases for fetchCarouselItems (admin)
      .addCase(fetchCarouselItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCarouselItems.fulfilled, (state, action) => {
        state.loading = false;
        // Assuming admin might want to see all items, so this might populate differently or be handled by a different state slice if needed.
        // For now, it also uses state.items. The component using this data will decide how to filter/display.
        state.items = action.payload.carouselItems || []; 
      })
      .addCase(fetchCarouselItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cases for addCarouselItem
      .addCase(addCarouselItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCarouselItem.fulfilled, (state, action) => {
        state.loading = false;
        // Ensure items array exists before pushing
        if (!Array.isArray(state.items)) {
          state.items = [];
        }
        // Add the new item to the list (could be admin list or active list depending on context)
        // For simplicity, adding to current items. Admin page will refetch after add.
        state.items.push(action.payload.carouselItem);
      })
      .addCase(addCarouselItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cases for updateCarouselItem
      .addCase(updateCarouselItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCarouselItem.fulfilled, (state, action) => {
        state.loading = false;
        const updatedItem = action.payload.carouselItem;
        const index = state.items.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          state.items[index] = updatedItem;
        }
      })
      .addCase(updateCarouselItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cases for deleteCarouselItem
      .addCase(deleteCarouselItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCarouselItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload.id);
      })
      .addCase(deleteCarouselItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default carouselSlice.reducer; 