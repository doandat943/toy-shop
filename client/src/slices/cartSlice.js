import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get cart items from local storage
const cartItemsFromStorage = localStorage.getItem('cartItems')
  ? JSON.parse(localStorage.getItem('cartItems'))
  : [];

// Get shipping address from local storage
const shippingAddressFromStorage = localStorage.getItem('shippingAddress')
  ? JSON.parse(localStorage.getItem('shippingAddress'))
  : {};

// Get payment method from local storage
const paymentMethodFromStorage = localStorage.getItem('paymentMethod')
  ? JSON.parse(localStorage.getItem('paymentMethod'))
  : 'cod';

const calculatePrices = (state) => {
  // Calculate items price
  state.itemsPrice = state.cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  
  // Calculate shipping price (free shipping for orders over 500,000₫)
  state.shippingPrice = state.itemsPrice > 500000 ? 0 : 30000;
  
  // Calculate tax price (10% sales tax)
  state.taxPrice = Number((0.1 * state.itemsPrice).toFixed(0));
  
  // Apply promo code discount if available
  if (state.promoCode) {
    if (state.promoCode.discountType === 'percentage') {
      state.discountAmount = Number(
        ((state.promoCode.discountValue / 100) * state.itemsPrice).toFixed(0)
      );
    } else if (state.promoCode.discountType === 'fixed_amount') {
      state.discountAmount = state.promoCode.discountValue;
    } else if (state.promoCode.discountType === 'free_shipping') {
      state.discountAmount = state.shippingPrice;
      state.shippingPrice = 0;
    }
  }
  
  // Calculate total price
  state.totalPrice = (
    state.itemsPrice +
    state.shippingPrice +
    state.taxPrice -
    (state.discountAmount || 0)
  );
};

// Add to cart
export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ id, qty, personalization }, { getState, rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/products/${id}`);
      
      const item = {
        id: data.product.id,
        name: data.product.name,
        image: data.product.thumbnail,
        price: data.product.onSale ? data.product.salePrice : data.product.price,
        stock: data.product.stock,
        qty,
        personalization: personalization || null,
      };
      
      const { cart } = getState();
      
      // Check if item is already in the cart
      const existItem = cart.cartItems.find((x) => x.id === item.id);
      
      let updatedCartItems;
      
      if (existItem) {
        // Update quantity if item exists
        updatedCartItems = cart.cartItems.map((x) =>
          x.id === existItem.id ? item : x
        );
      } else {
        // Add new item to cart
        updatedCartItems = [...cart.cartItems, item];
      }
      
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
      
      return updatedCartItems;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Remove from cart
export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async (id, { getState }) => {
    const { cart } = getState();
    
    const updatedCartItems = cart.cartItems.filter((x) => x.id !== id);
    
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    
    return updatedCartItems;
  }
);

// Update cart item quantity
export const updateCartItemQty = createAsyncThunk(
  'cart/updateCartItemQty',
  async ({ id, qty }, { getState }) => {
    const { cart } = getState();
    
    const updatedCartItems = cart.cartItems.map((item) =>
      item.id === id ? { ...item, qty } : item
    );
    
    localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    
    return updatedCartItems;
  }
);

// Save shipping address
export const saveShippingAddress = createAsyncThunk(
  'cart/saveShippingAddress',
  async (shippingAddress, { rejectWithValue }) => {
    try {
      localStorage.setItem('shippingAddress', JSON.stringify(shippingAddress));
      return shippingAddress;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Save payment method
export const savePaymentMethod = createAsyncThunk(
  'cart/savePaymentMethod',
  async (paymentMethod, { rejectWithValue }) => {
    try {
      localStorage.setItem('paymentMethod', JSON.stringify(paymentMethod));
      return paymentMethod;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Apply promo code
export const applyPromoCode = createAsyncThunk(
  'cart/applyPromoCode',
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(`/api/promotion/verify/${code}`);
      
      localStorage.setItem('promoCode', JSON.stringify(data.promoCode));
      
      return data.promoCode;
    } catch (error) {
      return rejectWithValue(
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message
      );
    }
  }
);

// Reset promo code
export const resetPromoCode = createAsyncThunk('cart/resetPromoCode', async () => {
  localStorage.removeItem('promoCode');
  return null;
});

// Clear cart
export const clearCart = createAsyncThunk('cart/clearCart', async () => {
  localStorage.removeItem('cartItems');
  return [];
});

const initialState = {
  cartItems: cartItemsFromStorage,
  shippingAddress: shippingAddressFromStorage || {},
  paymentMethod: paymentMethodFromStorage || 'cod',
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalPrice: 0,
  discountAmount: 0,
  promoCode: null,
  promoCodeLoading: false,
  promoCodeError: null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    resetCartState: (state) => {
      state.promoCodeError = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Add to cart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cartItems = action.payload;
        calculatePrices(state);
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Remove from cart
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        calculatePrices(state);
      })
      
      // Update cart item quantity
      .addCase(updateCartItemQty.fulfilled, (state, action) => {
        state.cartItems = action.payload;
        calculatePrices(state);
      })
      
      // Save shipping address
      .addCase(saveShippingAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.shippingAddress = action.payload;
      })
      .addCase(saveShippingAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Save payment method
      .addCase(savePaymentMethod.pending, (state) => {
        state.loading = true;
      })
      .addCase(savePaymentMethod.fulfilled, (state, action) => {
        state.loading = false;
        state.paymentMethod = action.payload;
      })
      .addCase(savePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Apply promo code
      .addCase(applyPromoCode.pending, (state) => {
        state.promoCodeLoading = true;
        state.promoCodeError = null;
      })
      .addCase(applyPromoCode.fulfilled, (state, action) => {
        state.promoCodeLoading = false;
        state.promoCode = action.payload;
        calculatePrices(state);
      })
      .addCase(applyPromoCode.rejected, (state, action) => {
        state.promoCodeLoading = false;
        state.promoCodeError = action.payload;
      })
      
      // Reset promo code
      .addCase(resetPromoCode.fulfilled, (state) => {
        state.promoCode = null;
        state.discountAmount = 0;
        calculatePrices(state);
      })
      
      // Clear cart
      .addCase(clearCart.fulfilled, (state) => {
        state.cartItems = [];
        calculatePrices(state);
      });
  },
});

export const { resetCartState } = cartSlice.actions;

export default cartSlice.reducer; 