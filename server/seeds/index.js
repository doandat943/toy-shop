const dotenv = require('dotenv');
const path = require('path');
const seedUsers = require('./users');
const seedCategories = require('./categories');
const seedProducts = require('./products');
const seedPromos = require('./promocodes');
const seedBlogs = require('./blogs');
// const seedOrders = require('./orders');
// const seedReviews = require('./reviews');

// Load environment variables with specific path
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Import all models and sequelize instance
const sequelize = require('../config/db');
const models = require('../models');

// Function to seed all data
const seedAll = async () => {
  try {
    console.log('Starting database seeding...');
    
    // Check connection and sync models
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Force sync to create tables
    console.log('Syncing database models...');
    await sequelize.sync({ force: true });
    console.log('Database models synchronized.');
    
    // Run seeds in sequence with proper dependencies
    // First, seed independent data (users, categories)
    console.log('\n=== Seeding Users ===');
    await seedUsers();
    
    console.log('\n=== Seeding Categories ===');
    await seedCategories();
    
    // Then, seed dependent data
    console.log('\n=== Seeding Products ===');
    await seedProducts();
    
    console.log('\n=== Seeding Promotion Codes ===');
    await seedPromos();
    
    console.log('\n=== Seeding Blog Content ===');
    await seedBlogs();
    
    // console.log('\n=== Seeding Orders ===');
    // await seedOrders();
    
    // console.log('\n=== Seeding Reviews ===');
    // await seedReviews();
    
    console.log('\nDatabase seeding completed successfully!');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Close database connection
    await sequelize.close();
    console.log('Database connection closed.');
  }
};

// Execute if run directly (node seeds/index.js)
if (require.main === module) {
  seedAll();
}

module.exports = seedAll; 