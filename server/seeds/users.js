const bcrypt = require('bcryptjs');
const { User } = require('../models');

/**
 * Seed Users data
 */
const seedUsers = async () => {
  try {
    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const userPassword = await bcrypt.hash('password123', salt);
    
    const users = [
      // Admin users
      {
        name: 'Admin User',
        email: 'admin@babybon.com',
        password: adminPassword,
        phone: '0901234567',
        role: 'admin',
        isActive: true,
        address: '123 Admin Street, District 1',
        city: 'Ho Chi Minh City',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Marketing Manager',
        email: 'marketing@babybon.com',
        password: adminPassword,
        phone: '0901234568',
        role: 'admin',
        isActive: true,
        address: '456 Marketing Street, District 2',
        city: 'Ho Chi Minh City',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Regular customers
      {
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        password: userPassword,
        phone: '0901234001',
        role: 'customer',
        isActive: true,
        address: '123 Nguyễn Huệ, Quận 1',
        city: 'Hồ Chí Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        password: userPassword,
        phone: '0901234002',
        role: 'customer',
        isActive: true,
        address: '456 Lê Lợi, Quận 1',
        city: 'Hồ Chí Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Phạm Văn C',
        email: 'phamvanc@example.com',
        password: userPassword,
        phone: '0901234003',
        role: 'customer',
        isActive: true,
        address: '789 Điện Biên Phủ, Quận 3',
        city: 'Hồ Chí Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Lê Thị D',
        email: 'lethid@example.com',
        password: userPassword,
        phone: '0901234004',
        role: 'customer',
        isActive: true,
        address: '321 Hai Bà Trưng, Quận 1',
        city: 'Hồ Chí Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Huỳnh Thị E',
        email: 'huynhthie@example.com',
        password: userPassword,
        phone: '0901234005',
        role: 'customer',
        isActive: true,
        address: '654 Võ Văn Tần, Quận 3',
        city: 'Hồ Chí Minh',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Trương Văn F',
        email: 'truongvanf@example.com',
        password: userPassword,
        phone: '0901234006',
        role: 'customer',
        isActive: true,
        address: '123 Hàng Bông, Quận Hoàn Kiếm',
        city: 'Hà Nội',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đỗ Thị G',
        email: 'dothig@example.com',
        password: userPassword,
        phone: '0901234007',
        role: 'customer',
        isActive: true,
        address: '456 Bà Triệu, Quận Hai Bà Trưng',
        city: 'Hà Nội',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Mẹ Bin',
        email: 'mebin@example.com',
        password: userPassword,
        phone: '0901234008',
        role: 'customer',
        isActive: true,
        address: '789 Trần Duy Hưng, Quận Cầu Giấy',
        city: 'Hà Nội',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Ba Min',
        email: 'bamin@example.com',
        password: userPassword,
        phone: '0901234009',
        role: 'customer',
        isActive: true,
        address: '321 Nguyễn Chí Thanh, Quận Đống Đa',
        city: 'Hà Nội',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log(`Seeding ${users.length} users...`);
    await User.bulkCreate(users);
    console.log('Users seeded successfully.');
    
    return true;
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

module.exports = seedUsers; 