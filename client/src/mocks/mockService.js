import { products, categories } from './mockData';

// Utility to simulate API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API calls

// Get all products with pagination and filtering
export const getProducts = async (params = {}) => {
  await delay(500);
  const {
    page = 1,
    keyword = '',
    category = '',
    sortBy = 'createdAt',
    sortOrder = 'DESC',
    minPrice = '',
    maxPrice = '',
    minAge = '',
    maxAge = '',
    featured = false
  } = params;

  let filteredProducts = [...products];

  // Filter by keyword
  if (keyword) {
    const keywordLower = keyword.toLowerCase();
    filteredProducts = filteredProducts.filter(
      p => p.name.toLowerCase().includes(keywordLower) || 
           p.description.toLowerCase().includes(keywordLower)
    );
  }

  // Filter by category
  if (category) {
    filteredProducts = filteredProducts.filter(
      p => p.categoryId == category || 
          categories.find(c => c.id == category)?.slug === category
    );
  }

  // Filter by price range
  if (minPrice) {
    filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
  }
  if (maxPrice) {
    filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
  }

  // Filter by age range
  if (minAge) {
    filteredProducts = filteredProducts.filter(p => p.minAge >= Number(minAge));
  }
  if (maxAge) {
    filteredProducts = filteredProducts.filter(p => p.maxAge <= Number(maxAge) || p.maxAge === null);
  }

  // Filter featured products
  if (featured) {
    filteredProducts = filteredProducts.filter(p => p.featured);
  }

  // Sort products
  if (sortBy) {
    filteredProducts.sort((a, b) => {
      if (sortOrder === 'ASC') {
        return a[sortBy] > b[sortBy] ? 1 : -1;
      } else {
        return a[sortBy] < b[sortBy] ? 1 : -1;
      }
    });
  }

  // Pagination
  const limit = 8;
  const pages = Math.ceil(filteredProducts.length / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return {
    products: paginatedProducts,
    page: Number(page),
    pages,
    total: filteredProducts.length
  };
};

// Get product by ID
export const getProductById = async (id) => {
  await delay(300);
  const product = products.find(p => p.id == id);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  return { product };
};

// Get all categories
export const getCategories = async () => {
  await delay(300);
  return { categories };
};

// Create a review for a product
export const createReview = async (productId, review) => {
  await delay(500);
  const product = products.find(p => p.id == productId);
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Add the review to product
  const newReview = {
    id: Math.floor(Math.random() * 10000) + 500,
    ...review,
    createdAt: new Date().toISOString()
  };
  
  product.reviews.push(newReview);
  
  // Update product rating
  const totalRating = product.reviews.reduce((sum, r) => sum + Number(r.rating), 0);
  product.rating = totalRating / product.reviews.length;
  product.numReviews = product.reviews.length;
  
  return { success: true };
};

// Mock user data
const users = [
  {
    id: 1,
    name: 'Khách Hàng',
    email: 'customer@example.com',
    password: 'password',
    role: 'user',
    token: 'mock-token-user'
  },
  {
    id: 2,
    name: 'Admin',
    email: 'admin@example.com',
    password: 'password',
    role: 'admin',
    token: 'mock-token-admin'
  }
];

// Login 
export const login = async (email, password) => {
  await delay(500);
  const user = users.find(u => u.email === email);
  
  if (!user || user.password !== password) {
    throw new Error('Email hoặc mật khẩu không đúng');
  }
  
  // Don't return password
  const { password: _, ...userWithoutPassword } = user;
  
  return { user: userWithoutPassword };
};

// Register
export const register = async (userData) => {
  await delay(500);
  const { name, email, password } = userData;
  
  if (users.find(u => u.email === email)) {
    throw new Error('Email đã được sử dụng');
  }
  
  const newUser = {
    id: users.length + 1,
    name,
    email,
    password,
    role: 'user',
    token: `mock-token-${Date.now()}`
  };
  
  users.push(newUser);
  
  // Don't return password
  const { password: _, ...userWithoutPassword } = newUser;
  
  return { user: userWithoutPassword };
}; 