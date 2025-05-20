const { Category } = require('../models');

/**
 * Seed Categories data
 */
const seedCategories = async () => {
  try {
    const categories = [
      {
        name: 'Bảng bận rộn',
        slug: 'bang-ban-ron',
        description: 'Bảng bận rộn giúp bé phát triển kỹ năng vận động tinh, tư duy logic và khả năng tập trung.',
        image: '/uploads/categories/bang-ban-ron.jpg',
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồ chơi Montessori',
        slug: 'do-choi-montessori',
        description: 'Đồ chơi theo phương pháp Montessori giúp trẻ phát triển độc lập, tự do khám phá và học hỏi.',
        image: '/uploads/categories/do-choi-montessori.jpg',
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồ chơi cá nhân hóa',
        slug: 'do-choi-ca-nhan-hoa',
        description: 'Đồ chơi được cá nhân hóa theo tên và sở thích của bé, tạo nên món quà độc đáo và ý nghĩa.',
        image: '/uploads/categories/do-choi-ca-nhan-hoa.jpg',
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồ chơi gỗ',
        slug: 'do-choi-go',
        description: 'Đồ chơi làm từ gỗ tự nhiên, an toàn cho bé và thân thiện với môi trường.',
        image: '/uploads/categories/do-choi-go.jpg',
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồ chơi giáo dục STEAM',
        slug: 'do-choi-giao-duc-steam',
        description: 'Đồ chơi phát triển kỹ năng STEAM (Khoa học, Công nghệ, Kỹ thuật, Nghệ thuật và Toán học).',
        image: '/uploads/categories/do-choi-steam.jpg',
        isActive: true,
        isFeatured: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồ chơi cho bé 0-12 tháng',
        slug: 'do-choi-cho-be-0-12-thang',
        description: 'Đồ chơi phù hợp với trẻ sơ sinh và trẻ mới biết đi, kích thích giác quan và phát triển vận động.',
        image: '/uploads/categories/do-choi-0-12-thang.jpg',
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồ chơi cho bé 1-3 tuổi',
        slug: 'do-choi-cho-be-1-3-tuoi',
        description: 'Đồ chơi phù hợp với trẻ từ 1-3 tuổi, phát triển kỹ năng vận động và ngôn ngữ.',
        image: '/uploads/categories/do-choi-1-3-tuoi.jpg',
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồ chơi cho bé 3-6 tuổi',
        slug: 'do-choi-cho-be-3-6-tuoi',
        description: 'Đồ chơi phù hợp với trẻ từ 3-6 tuổi, phát triển kỹ năng xã hội và tư duy logic.',
        image: '/uploads/categories/do-choi-3-6-tuoi.jpg',
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồ chơi ngoài trời',
        slug: 'do-choi-ngoai-troi',
        description: 'Đồ chơi dành cho các hoạt động ngoài trời, phát triển vận động thô và kỹ năng xã hội.',
        image: '/uploads/categories/do-choi-ngoai-troi.jpg',
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồ chơi sáng tạo',
        slug: 'do-choi-sang-tao',
        description: 'Đồ chơi kích thích trí tưởng tượng và khả năng sáng tạo của trẻ.',
        image: '/uploads/categories/do-choi-sang-tao.jpg',
        isActive: true,
        isFeatured: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log(`Seeding ${categories.length} categories...`);
    await Category.bulkCreate(categories);
    console.log('Categories seeded successfully.');
    
    return true;
  } catch (error) {
    console.error('Error seeding categories:', error);
    throw error;
  }
};

module.exports = seedCategories; 