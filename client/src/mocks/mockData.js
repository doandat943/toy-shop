export const categories = [
  {
    id: 1,
    name: 'Bảng bận rộn',
    description: 'Các loại bảng bận rộn phát triển kỹ năng vận động tinh',
    image: 'https://i.imgur.com/MPKC4Gt.jpg',
    slug: 'busy-board',
    featured: true
  },
  {
    id: 2,
    name: 'Đồ chơi Montessori',
    description: 'Đồ chơi theo phương pháp Montessori',
    image: 'https://i.imgur.com/qOahThR.jpg',
    slug: 'montessori',
    featured: true
  },
  {
    id: 3,
    name: 'Đồ chơi cá nhân hóa',
    description: 'Đồ chơi có thể in tên hoặc thông điệp cá nhân',
    image: 'https://i.imgur.com/pHn4qoT.jpg',
    slug: 'personalized',
    featured: true
  },
  {
    id: 4,
    name: 'Xếp hình',
    description: 'Đồ chơi xếp hình và ghép hình',
    image: 'https://i.imgur.com/d0jUGmJ.jpg',
    slug: 'puzzles',
    featured: false
  }
];

export const products = [
  {
    id: 1,
    name: 'Bảng bận rộn đa chức năng',
    description: 'Bảng bận rộn đa chức năng với các kỹ năng khác nhau, giúp phát triển vận động tinh, nhận thức màu sắc và hình dạng.',
    price: 650000,
    salePrice: 550000,
    onSale: true,
    stock: 15,
    thumbnail: 'https://i.imgur.com/Kx0raIJ.jpg',
    images: [
      'https://i.imgur.com/Kx0raIJ.jpg',
      'https://i.imgur.com/8PMA18r.jpg',
      'https://i.imgur.com/NMm4PFH.jpg'
    ],
    categoryId: 1,
    minAge: 18,
    maxAge: 48,
    dimensions: '40cm x 30cm x 5cm',
    material: 'Gỗ MDF, kim loại, vải, nhựa an toàn',
    rating: 4.8,
    numReviews: 12,
    featured: true,
    isPersonalizable: false,
    reviews: [
      {
        id: 101,
        name: 'Nguyễn Thị Hương',
        rating: 5,
        comment: 'Bảng bận rộn này giúp con tôi rất tập trung và phát triển các kỹ năng vận động tinh tuyệt vời!',
        createdAt: '2023-09-15T07:30:00.000Z'
      },
      {
        id: 102,
        name: 'Trần Văn Nam',
        rating: 4,
        comment: 'Sản phẩm chất lượng tốt, nhưng có một vài chi tiết nhỏ chưa thực sự hoàn thiện.',
        createdAt: '2023-08-25T10:15:00.000Z'
      }
    ]
  },
  {
    id: 2,
    name: 'Bộ xếp hình khối Montessori',
    description: 'Bộ xếp hình khối Montessori giúp bé phát triển trí não và khả năng phối hợp tay mắt.',
    price: 350000,
    salePrice: null,
    onSale: false,
    stock: 20,
    thumbnail: 'https://i.imgur.com/qOahThR.jpg',
    images: [
      'https://i.imgur.com/qOahThR.jpg',
      'https://i.imgur.com/VrE1ijn.jpg'
    ],
    categoryId: 2,
    minAge: 12,
    maxAge: 36,
    dimensions: '25cm x 25cm x 10cm',
    material: 'Gỗ tự nhiên, sơn an toàn',
    rating: 4.5,
    numReviews: 8,
    featured: true,
    isPersonalizable: false,
    reviews: [
      {
        id: 103,
        name: 'Phạm Minh Tuấn',
        rating: 5,
        comment: 'Đồ chơi tuyệt vời, giúp con tôi phát triển khả năng tư duy không gian.',
        createdAt: '2023-10-05T14:20:00.000Z'
      }
    ]
  },
  {
    id: 3,
    name: 'Tên cá nhân bằng gỗ trang trí',
    description: 'Tên cá nhân được làm từ gỗ tự nhiên, có thể dùng để trang trí phòng hoặc làm quà tặng sinh nhật.',
    price: 250000,
    salePrice: 200000,
    onSale: true,
    stock: 30,
    thumbnail: 'https://i.imgur.com/pHn4qoT.jpg',
    images: [
      'https://i.imgur.com/pHn4qoT.jpg',
      'https://i.imgur.com/GsvGu7g.jpg'
    ],
    categoryId: 3,
    minAge: 0,
    maxAge: null,
    dimensions: 'Tùy chỉnh theo tên',
    material: 'Gỗ thông, sơn không độc hại',
    rating: 4.9,
    numReviews: 15,
    featured: true,
    isPersonalizable: true,
    reviews: [
      {
        id: 104,
        name: 'Lê Thị Mai',
        rating: 5,
        comment: 'Tuyệt vời! Sản phẩm được làm rất tỉ mỉ và đẹp mắt. Sẽ mua thêm cho bạn bè.',
        createdAt: '2023-09-20T09:45:00.000Z'
      }
    ]
  },
  {
    id: 4,
    name: 'Bộ học đếm và nhận biết số',
    description: 'Bộ đồ chơi giúp bé học đếm và nhận biết số, phù hợp cho bé từ 2 tuổi trở lên.',
    price: 280000,
    salePrice: null,
    onSale: false,
    stock: 25,
    thumbnail: 'https://i.imgur.com/d0jUGmJ.jpg',
    images: [
      'https://i.imgur.com/d0jUGmJ.jpg',
      'https://i.imgur.com/Mg6Czpn.jpg'
    ],
    categoryId: 2,
    minAge: 24,
    maxAge: 60,
    dimensions: '30cm x 20cm x 5cm',
    material: 'Gỗ tự nhiên, sơn an toàn',
    rating: 4.7,
    numReviews: 10,
    featured: true,
    isPersonalizable: false,
    reviews: []
  },
  {
    id: 5,
    name: 'Bảng học chữ cái tiếng Việt',
    description: 'Bảng học chữ cái tiếng Việt, giúp bé nhận biết và học đọc các chữ cái.',
    price: 320000,
    salePrice: 290000,
    onSale: true,
    stock: 18,
    thumbnail: 'https://i.imgur.com/MPKC4Gt.jpg',
    images: [
      'https://i.imgur.com/MPKC4Gt.jpg',
      'https://i.imgur.com/B4FDHhN.jpg'
    ],
    categoryId: 2,
    minAge: 36,
    maxAge: 72,
    dimensions: '40cm x 30cm x 2cm',
    material: 'Gỗ MDF, nam châm, sơn an toàn',
    rating: 4.6,
    numReviews: 9,
    featured: false,
    isPersonalizable: false,
    reviews: []
  },
  {
    id: 6,
    name: 'Đồng hồ học giờ Montessori',
    description: 'Đồng hồ Montessori giúp bé học cách xem giờ một cách trực quan.',
    price: 180000,
    salePrice: null,
    onSale: false,
    stock: 22,
    thumbnail: 'https://i.imgur.com/Mg6Czpn.jpg',
    images: [
      'https://i.imgur.com/Mg6Czpn.jpg',
      'https://i.imgur.com/WgzcSUj.jpg'
    ],
    categoryId: 2,
    minAge: 48,
    maxAge: 96,
    dimensions: '25cm x 25cm x 3cm',
    material: 'Gỗ MDF, kim loại',
    rating: 4.4,
    numReviews: 7,
    featured: false,
    isPersonalizable: false,
    reviews: []
  },
  {
    id: 7,
    name: 'Khối hình học cơ bản',
    description: 'Bộ khối hình học giúp bé nhận biết các hình dạng cơ bản và phân loại màu sắc.',
    price: 220000,
    salePrice: null,
    onSale: false,
    stock: 35,
    thumbnail: 'https://i.imgur.com/WgzcSUj.jpg',
    images: [
      'https://i.imgur.com/WgzcSUj.jpg',
      'https://i.imgur.com/GsvGu7g.jpg'
    ],
    categoryId: 2,
    minAge: 18,
    maxAge: 48,
    dimensions: '20cm x 15cm x 10cm',
    material: 'Gỗ tự nhiên, sơn an toàn',
    rating: 4.3,
    numReviews: 6,
    featured: false,
    isPersonalizable: false,
    reviews: []
  },
  {
    id: 8,
    name: 'Bộ ghép hình động vật',
    description: 'Bộ ghép hình động vật với các mảnh ghép lớn, dễ dàng cho bé tập ghép.',
    price: 150000,
    salePrice: 130000,
    onSale: true,
    stock: 28,
    thumbnail: 'https://i.imgur.com/B4FDHhN.jpg',
    images: [
      'https://i.imgur.com/B4FDHhN.jpg',
      'https://i.imgur.com/Kx0raIJ.jpg'
    ],
    categoryId: 4,
    minAge: 24,
    maxAge: 60,
    dimensions: '30cm x 20cm x 2cm',
    material: 'Gỗ MDF, sơn an toàn',
    rating: 4.5,
    numReviews: 8,
    featured: false,
    isPersonalizable: false,
    reviews: []
  }
]; 