import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Get wishlist items from local storage
const wishlistItemsFromStorage = localStorage.getItem('wishlistItems')
  ? JSON.parse(localStorage.getItem('wishlistItems'))
  : [];

// Add to wishlist
export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId, { getState }) => {
    const { wishlist } = getState();
    
    // Check if item already exists in wishlist
    const existItem = wishlist.wishlistItems.find((x) => x === productId);
    
    let updatedWishlistItems;
    
    if (existItem) {
      // Item already in wishlist, no need to add
      updatedWishlistItems = [...wishlist.wishlistItems];
    } else {
      // Add to wishlist
      updatedWishlistItems = [...wishlist.wishlistItems, productId];
    }
    
    localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlistItems));
    
    return updatedWishlistItems;
  }
);

// Remove from wishlist
export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId, { getState }) => {
    const { wishlist } = getState();
    
    const updatedWishlistItems = wishlist.wishlistItems.filter(
      (x) => x !== productId
    );
    
    localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlistItems));
    
    return updatedWishlistItems;
  }
);

// Clear wishlist
export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async () => {
    localStorage.removeItem('wishlistItems');
    return [];
  }
);

const initialState = {
  wishlistItems: wishlistItemsFromStorage,
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    resetWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.wishlistItems = action.payload;
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from wishlist
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.wishlistItems = action.payload;
      })
      
      // Clear wishlist
      .addCase(clearWishlist.fulfilled, (state) => {
        state.wishlistItems = [];
      });
  },
});

export const { resetWishlistError } = wishlistSlice.actions;

export default wishlistSlice.reducer; 