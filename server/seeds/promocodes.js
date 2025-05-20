const { PromoCode, Category } = require('../models');

/**
 * Seed Promotion Codes data
 */
const seedPromoCodes = async () => {
  try {
    // Fetch categories to get their IDs
    const categories = await Category.findAll();
    const categoryMap = {};
    
    categories.forEach(category => {
      categoryMap[category.slug] = category.id;
    });

    const now = new Date();
    
    // Helper function to add days to a date
    const addDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    const promoCodes = [
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minimumAmount: 200000,
        maximumDiscount: 100000,
        startDate: now,
        endDate: addDays(now, 90),
        usageLimit: 1000,
        usageCount: 0,
        isActive: true,
        description: 'Giảm 10% cho đơn hàng đầu tiên (tối đa 100.000đ)',
        applicableProducts: JSON.stringify([]), // Áp dụng cho tất cả sản phẩm
        applicableCategories: JSON.stringify([]), // Áp dụng cho tất cả danh mục
        perCustomerUsageLimit: 1, // Mỗi người dùng chỉ được sử dụng 1 lần
        createdAt: now,
        updatedAt: now
      },
      {
        code: 'SUMMER30',
        discountType: 'percentage',
        discountValue: 30,
        minimumAmount: 500000,
        maximumDiscount: 300000,
        startDate: addDays(now, -15),
        endDate: addDays(now, 15),
        usageLimit: 500,
        usageCount: 0,
        isActive: true,
        description: 'Giảm 30% cho đơn hàng từ 500.000đ (tối đa 300.000đ)',
        applicableProducts: JSON.stringify([]), // Áp dụng cho tất cả sản phẩm
        applicableCategories: JSON.stringify([]), // Áp dụng cho tất cả danh mục
        perCustomerUsageLimit: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        code: 'BUSYBOARD20',
        discountType: 'percentage',
        discountValue: 20,
        minimumAmount: 300000,
        maximumDiscount: 150000,
        startDate: now,
        endDate: addDays(now, 30),
        usageLimit: 200,
        usageCount: 0,
        isActive: true,
        description: 'Giảm 20% cho các sản phẩm bảng bận rộn',
        applicableProducts: JSON.stringify([]), // Áp dụng cho tất cả sản phẩm trong danh mục
        applicableCategories: JSON.stringify([categoryMap['bang-ban-ron']]), // Chỉ áp dụng cho danh mục "Bảng bận rộn"
        perCustomerUsageLimit: 2,
        createdAt: now,
        updatedAt: now
      },
      {
        code: 'FREESHIP',
        discountType: 'fixed_amount',
        discountValue: 30000,
        minimumAmount: 300000,
        maximumDiscount: 30000,
        startDate: now,
        endDate: addDays(now, 60),
        usageLimit: 1000,
        usageCount: 0,
        isActive: true,
        description: 'Miễn phí vận chuyển cho đơn hàng từ 300.000đ',
        applicableProducts: JSON.stringify([]), // Áp dụng cho tất cả sản phẩm
        applicableCategories: JSON.stringify([]), // Áp dụng cho tất cả danh mục
        perCustomerUsageLimit: 0, // Không giới hạn số lần sử dụng
        createdAt: now,
        updatedAt: now
      },
      {
        code: 'MONTESSORI15',
        discountType: 'percentage',
        discountValue: 15,
        minimumAmount: 200000,
        maximumDiscount: 100000,
        startDate: now,
        endDate: addDays(now, 45),
        usageLimit: 100,
        usageCount: 0,
        isActive: true,
        description: 'Giảm 15% cho các sản phẩm Montessori',
        applicableProducts: JSON.stringify([]), // Áp dụng cho tất cả sản phẩm trong danh mục
        applicableCategories: JSON.stringify([categoryMap['do-choi-montessori']]), // Chỉ áp dụng cho danh mục "Đồ chơi Montessori"
        perCustomerUsageLimit: 1,
        createdAt: now,
        updatedAt: now
      },
      {
        code: 'BIRTHDAY50',
        discountType: 'percentage',
        discountValue: 50,
        minimumAmount: 1000000,
        maximumDiscount: 500000,
        startDate: now,
        endDate: addDays(now, 365),
        usageLimit: 500,
        usageCount: 0,
        isActive: true,
        description: 'Giảm 50% cho đơn hàng từ 1.000.000đ trong ngày sinh nhật',
        applicableProducts: JSON.stringify([]), // Áp dụng cho tất cả sản phẩm
        applicableCategories: JSON.stringify([]), // Áp dụng cho tất cả danh mục
        perCustomerUsageLimit: 1,
        requiresBirthday: true,
        createdAt: now,
        updatedAt: now
      },
      {
        code: 'BUNDLE25',
        discountType: 'percentage',
        discountValue: 25,
        minimumAmount: 800000,
        maximumDiscount: 400000,
        startDate: now,
        endDate: addDays(now, 30),
        usageLimit: 300,
        usageCount: 0,
        isActive: true,
        description: 'Giảm 25% khi mua 2 sản phẩm trở lên',
        applicableProducts: JSON.stringify([]), // Áp dụng cho tất cả sản phẩm
        applicableCategories: JSON.stringify([]), // Áp dụng cho tất cả danh mục
        perCustomerUsageLimit: 0,
        minItems: 2, // Yêu cầu tối thiểu 2 sản phẩm trong giỏ hàng
        createdAt: now,
        updatedAt: now
      }
    ];

    console.log(`Seeding ${promoCodes.length} promotion codes...`);
    await PromoCode.bulkCreate(promoCodes);
    console.log('Promotion codes seeded successfully.');
    
    return true;
  } catch (error) {
    console.error('Error seeding promotion codes:', error);
    throw error;
  }
};

module.exports = seedPromoCodes; 