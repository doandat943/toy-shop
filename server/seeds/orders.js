const { Order, OrderItem, User, Product } = require('../models');

/**
 * Seed Orders data
 */
const seedOrders = async () => {
  try {
    // Fetch users to get their IDs
    const users = await User.findAll({
      where: {
        role: 'customer'
      }
    });
    
    if (users.length === 0) {
      throw new Error('No customer users found to assign orders to');
    }
    
    // Fetch products to use in order items
    const products = await Product.findAll({
      limit: 10
    });
    
    if (products.length === 0) {
      throw new Error('No products found to create order items');
    }
    
    console.log(`Creating orders for ${users.length} users with ${products.length} products...`);
    
    // Create dates
    const now = new Date();
    
    // Helper function to subtract days from a date
    const subtractDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() - days);
      return result;
    };
    
    // Helper function to create shipping address
    const createShippingAddress = (user) => {
      return JSON.stringify({
        fullName: user.name,
        address: user.address || '123 Đường ABC',
        city: user.city || 'Hồ Chí Minh',
        postalCode: '700000',
        phone: user.phone || '0912345678',
        note: ''
      });
    };
    
    // Create a few orders for each user
    let orderCount = 0;
    
    for (const user of users) {
      // Number of orders per user (1-3)
      const numOrders = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < numOrders; i++) {
        // Create a random date within last 30 days
        const orderDate = subtractDays(now, Math.floor(Math.random() * 30));
        
        // Randomly select payment method
        const paymentMethods = ['cod', 'bank_transfer', 'momo'];
        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        
        // Random delivery status based on date
        const daysSinceOrder = Math.floor((now - orderDate) / (1000 * 60 * 60 * 24));
        let status = 'pending';
        let shippedAt = null;
        let deliveredAt = null;
        
        if (daysSinceOrder > 3) {
          status = 'processing';
        }
        if (daysSinceOrder > 5) {
          status = 'shipping';
          shippedAt = new Date(orderDate.getTime() + (3 * 24 * 60 * 60 * 1000)); // 3 days after order
        }
        if (daysSinceOrder > 7) {
          status = 'delivered';
          deliveredAt = new Date(orderDate.getTime() + (5 * 24 * 60 * 60 * 1000)); // 5 days after order
        }
        
        // Random order items (1-4 items)
        const numItems = Math.floor(Math.random() * 4) + 1;
        const selectedProducts = [];
        
        // Ensure unique products in an order
        while (selectedProducts.length < numItems) {
          const randomIndex = Math.floor(Math.random() * products.length);
          const randomProduct = products[randomIndex];
          
          if (!selectedProducts.some(p => p.id === randomProduct.id)) {
            selectedProducts.push(randomProduct);
          }
        }
        
        // Calculate order totals
        let subTotal = 0;
        const shippingCost = 30000; // Fixed shipping cost
        const tax = 0; // No tax for demo
        let discount = 0;
        
        // Apply a random discount (0-10%)
        if (Math.random() > 0.7) {
          const discountPercent = Math.floor(Math.random() * 10) + 1;
          discount = Math.round(subTotal * (discountPercent / 100));
        }
        
        const orderItems = selectedProducts.map(product => {
          const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
          const productPrice = product.salePrice || product.price;
          const itemTotal = productPrice * quantity;
          subTotal += itemTotal;
          
          return {
            productId: product.id,
            name: product.name,
            price: productPrice,
            quantity: quantity,
            totalPrice: itemTotal,
            image: product.thumbnail
          };
        });
        
        // Calculate totalAmount correctly
        const totalAmount = subTotal + shippingCost - discount + tax;
        
        // Create order record
        const order = await Order.create({
          userId: user.id,
          status,
          subTotal,
          shippingCost,
          discount, 
          tax,
          totalAmount, // Set totalAmount correctly
          shippingAddress: createShippingAddress(user),
          city: user.city || 'Hồ Chí Minh',
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: user.phone,
          paymentMethod,
          paymentStatus: status === 'delivered' ? 'paid' : 'pending',
          shippedAt,
          deliveredAt,
          notes: '',
          createdAt: orderDate,
          updatedAt: orderDate
        });
        
        // Create order items
        await Promise.all(
          orderItems.map(async (item) => {
            await OrderItem.create({
              orderId: order.id,
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              totalPrice: item.totalPrice,
              image: item.image,
              createdAt: orderDate,
              updatedAt: orderDate
            });
          })
        );
        
        orderCount++;
      }
    }
    
    console.log(`Successfully created ${orderCount} orders`);
    return true;
  } catch (error) {
    console.error('Error seeding orders:', error);
    throw error;
  }
};

module.exports = seedOrders; 