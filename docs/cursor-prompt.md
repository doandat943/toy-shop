# BabyBon E-commerce Website Development Project

## Project Overview
I need you to help me create a full-featured e-commerce website for educational toys called "BabyBon", similar to the Kalotoys website shown in the reference images. The project should include both customer-facing features and a complete admin dashboard, using Node.js for the backend and MySQL for the database.

## Technology Stack
- **Frontend**: HTML, CSS, JavaScript (React.js preferred)
- **Backend**: Node.js with Express.js
- **Database**: MySQL (with the following connection details)
  ```
  DATABASE_HOST = 'joverse.us'
  DATABASE_PORT = '3001' 
  DATABASE_NAME = 'toy-web-shop'
  DATABASE_USERNAME = 'root'
  DATABASE_PASSWORD = 'kinhvanhoa0'
  ```
- **Payment Integration**: COD, Bank transfers, Credit/Debit cards
- **Deployment**: Instructions for deploying on standard hosting

## Core Features

### Customer-Facing Features
1. **Homepage**
   - Featured products carousel
   - Categories showcase
   - Special promotions section
   - New arrivals
   - Benefits/value proposition section

2. **Product Catalog**
   - Product categories (Busy boards, Montessori toys, Personalized toys)
   - Filtering system by:
     - Age group (0-3, 3-6, etc.)
     - Price range
     - Special occasions (birthdays, achievements, holidays)
     - Child's interests
     - Budget
   - Sorting options (price, popularity, newest)
   - Product card with image, name, price, age range, and discount indicator

3. **Product Details Page**
   - Multiple product images
   - Detailed description
   - Features and benefits
   - Age recommendation
   - Educational value
   - Safety information
   - Customer reviews and ratings
   - Related products
   - "Add to cart" functionality
   - Quantity selector

4. **Shopping Cart and Checkout**
   - Cart summary
   - Promo code application
   - Shipping information form
   - Multiple payment methods:
     - COD (Cash on Delivery)
     - QR code payment
     - ATM/Internet Banking
     - Credit/Debit cards
   - Order summary
   - VAT invoice option

5. **User Account**
   - Registration/Login
   - Order history and tracking
   - Saved address management
   - Wishlist
   - Review submission
   - Points/rewards system

6. **Blog Section**
   - Articles about child development
   - Toy usage guides
   - Parenting tips
   - Educational content

7. **Special Features**
   - Birthday gift finder
   - Age-appropriate toy filter
   - Promotional calendar for special occasions
   - Safety certification information
   - Product demonstration videos
   - Smart recommendation system
   - Points/rewards program for frequent shoppers

### Admin Dashboard
1. **Overview Dashboard**
   - Sales statistics
   - Popular products
   - Low stock alerts
   - Recent orders
   - Customer analytics

2. **Product Management**
   - Add/edit/delete products
   - Manage categories
   - Set promotions and discounts
   - Inventory management
   - Product image upload

3. **Order Management**
   - Order list with status
   - Order details view
   - Update order status
   - Generate invoices
   - Process returns/refunds

4. **Customer Management**
   - Customer list
   - Customer details and purchase history
   - Reward points management
   - Communication tools

5. **Content Management**
   - Blog post creation/editing
   - Banner management
   - Homepage content editing
   - Promotional campaign setup

6. **Promotion Management**
   - Create seasonal campaigns
   - Set up birthday promotions
   - Manage discount codes
   - Special event campaigns

7. **Reports and Analytics**
   - Sales reports
   - Inventory reports
   - Customer behavior analytics
   - Marketing campaign performance

## Design Requirements
- Child-friendly, colorful interface
- Clean and intuitive navigation
- Mobile-responsive design
- Fast loading times
- Engaging product presentation
- Trust indicators (safety certifications, secure payment icons)

## Specific Implementations (Based on Reference Images)

1. **Navigation Menu**
   - Categories: "Bảng bận rộn" (Busy Boards), "In tên riêng" (Personalized Names), "Đồ chơi Montessori" (Montessori Toys), "Kalotoys Collab", "Chuyện về Kalotoys" (which should be changed to "Chuyện về BabyBon")
   - Shopping cart icon
   - User account area

2. **Product Checkout Flow**
   - Three-step process (as shown in Image 2):
     1. Cart
     2. Shipping
     3. Payment
   - Shipping form with address details
   - Payment method selection
   - Order confirmation page

3. **Order Success Page**
   - Order confirmation message
   - Order details summary
   - Continue shopping button
   - Email confirmation functionality

4. **Product Page Layout**
   - Similar to Image 3 and Image 9, with product images, description, benefits, and customer reviews
   - Product specifications
   - Educational benefits section
   - Safety information
   - Related products section

5. **About Us Page**
   - Company story
   - Mission statement
   - Team information
   - Educational philosophy
   - As seen in Image 4, including sections about the company's approach to educational toys

## Additional Requirements

1. **SEO Optimization**
   - Meta tags implementation
   - SEO-friendly URLs
   - Site map generation
   - Image alt tags

2. **Performance Optimization**
   - Image compression
   - Lazy loading
   - Code minification
   - Caching strategies

3. **Security Features**
   - Secure payment processing
   - Data encryption
   - XSS protection
   - CSRF protection
   - Input validation

4. **Marketing Tools**
   - Newsletter subscription
   - Social media integration
   - Share buttons
   - Abandoned cart emails

5. **Customer Support**
   - Live chat integration (Zalo as shown in images)
   - FAQ section
   - Contact form
   - Customer feedback system

## Code Structure and Organization
Please organize the code following best practices:
- MVC architecture
- Modular components
- Clean, well-commented code
- Proper error handling
- RESTful API design
- Efficient database queries

## Deliverables
1. Full source code for both frontend and backend
2. Database schema and initial data
3. Setup instructions
4. API documentation
5. Admin dashboard usage guide

## Timeline Expectations
Please provide a realistic timeline for completing this project, broken down by major milestones.

## Additional Notes
- The website should be in Vietnamese by default with potential for multi-language support in the future
- High priority on mobile responsiveness as many parents shop from their phones
- Ensure all product safety information is prominently displayed
- Build with scalability in mind as the product catalog will grow

Can you help me implement this complete e-commerce system based on the provided specifications and reference images?