const { Product, Category } = require('../models');

/**
 * Seed Products data
 */
const seedProducts = async () => {
  try {
    // Fetch categories to get their IDs
    const categories = await Category.findAll();
    const categoryMap = {};
    
    categories.forEach(category => {
      categoryMap[category.slug] = category.id;
    });

    // Define products
    const products = [
      // Bảng bận rộn
      {
        name: 'Bảng bận rộn Vũ trụ',
        description: 'Bảng bận rộn chủ đề vũ trụ với các hoạt động phong phú, giúp bé phát triển kỹ năng vận động tinh.',
        richDescription: `<p>Bảng bận rộn chủ đề vũ trụ là một sản phẩm giáo dục tuyệt vời cho bé từ 12 tháng trở lên. Với nhiều hoạt động khác nhau như: bật công tắc, xoay bánh răng, trượt tên lửa, bấm nút,...</p>
        <p>Sản phẩm được làm từ gỗ tự nhiên, sơn màu an toàn, giúp bé:</p>
        <ul>
          <li>Phát triển kỹ năng vận động tinh</li>
          <li>Rèn luyện khả năng tập trung</li>
          <li>Học về không gian, các hành tinh và vũ trụ</li>
          <li>Kích thích sự tò mò và khám phá</li>
        </ul>`,
        price: 499000,
        salePrice: 399000,
        onSale: true,
        stock: 50,
        sku: 'BB-VT-001',
        minAge: 12, // tháng
        maxAge: 72, // tháng
        weight: 1200, // gram
        dimensions: '40x30x5', // cm
        materials: 'Gỗ tự nhiên, sơn an toàn',
        thumbnail: '/uploads/products/bang-ban-ron-vu-tru-thumb.jpg',
        images: JSON.stringify([
          '/uploads/products/bang-ban-ron-vu-tru-1.jpg',
          '/uploads/products/bang-ban-ron-vu-tru-2.jpg',
          '/uploads/products/bang-ban-ron-vu-tru-3.jpg'
        ]),
        isFeatured: true,
        isActive: true,
        safetyInfo: 'Sản phẩm đạt tiêu chuẩn an toàn Châu Âu EN71-3, không chứa chì và các chất độc hại.',
        educationalValue: 'Phát triển vận động tinh, tư duy logic, khả năng tập trung và hiểu biết về vũ trụ.',
        categoryId: categoryMap['bang-ban-ron'],
        tags: JSON.stringify(['busy board', 'vận động tinh', 'tư duy logic', 'vũ trụ']),
        isPersonalizable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bảng bận rộn Nông trại',
        description: 'Bảng bận rộn chủ đề nông trại sinh động với nhiều hoạt động thú vị, phù hợp cho bé từ 1-4 tuổi.',
        richDescription: `<p>Bảng bận rộn chủ đề nông trại là món đồ chơi tuyệt vời cho các bé tập khám phá thế giới xung quanh. Với thiết kế sinh động và nhiều hoạt động đa dạng, sản phẩm sẽ giúp bé phát triển toàn diện.</p>
        <p>Các hoạt động trên bảng bận rộn nông trại:</p>
        <ul>
          <li>Cài và tháo cúc áo</li>
          <li>Buộc và tháo dây giày</li>
          <li>Kéo khóa túi</li>
          <li>Xoay bánh xe</li>
          <li>Bật tắt công tắc</li>
          <li>Mở và đóng cửa</li>
        </ul>
        <p>Sản phẩm được làm thủ công tỉ mỉ với chất liệu vải nỉ cao cấp, khung gỗ chắc chắn, giúp bé vừa học vừa chơi một cách an toàn.</p>`,
        price: 450000,
        stock: 35,
        sku: 'BB-NT-002',
        minAge: 12, // tháng
        maxAge: 48, // tháng
        weight: 900, // gram
        dimensions: '35x25x3', // cm
        materials: 'Vải nỉ cao cấp, gỗ tự nhiên, kim loại an toàn',
        thumbnail: '/uploads/products/bang-ban-ron-nong-trai-thumb.jpg',
        images: JSON.stringify([
          '/uploads/products/bang-ban-ron-nong-trai-1.jpg',
          '/uploads/products/bang-ban-ron-nong-trai-2.jpg'
        ]),
        isFeatured: true,
        isActive: true,
        safetyInfo: 'Sản phẩm đạt tiêu chuẩn an toàn Châu Âu EN71, phù hợp cho trẻ từ 1 tuổi trở lên.',
        educationalValue: 'Phát triển kỹ năng sống hàng ngày, vận động tinh, khả năng tập trung và kiên nhẫn.',
        categoryId: categoryMap['bang-ban-ron'],
        tags: JSON.stringify(['busy board', 'vận động tinh', 'kỹ năng sống', 'nông trại']),
        isPersonalizable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Đồ chơi Montessori
      {
        name: 'Bộ thả hình khối Montessori',
        description: 'Bộ thả hình khối theo phương pháp Montessori, giúp bé nhận biết hình dạng và màu sắc.',
        richDescription: `<p>Bộ thả hình khối Montessori là một trong những đồ chơi cơ bản và hiệu quả theo phương pháp giáo dục Montessori. Sản phẩm giúp bé phát triển nhận thức về hình dạng, màu sắc và kỹ năng vận động tinh.</p>
        <p>Bộ sản phẩm bao gồm:</p>
        <ul>
          <li>1 đế gỗ với các lỗ có hình dạng khác nhau</li>
          <li>10 khối gỗ với các hình dạng tương ứng</li>
        </ul>
        <p>Các lợi ích giáo dục:</p>
        <ul>
          <li>Rèn luyện kỹ năng phối hợp tay-mắt</li>
          <li>Học nhận biết hình dạng và màu sắc</li>
          <li>Phát triển tư duy logic và khả năng giải quyết vấn đề</li>
          <li>Tăng cường khả năng tập trung</li>
        </ul>`,
        price: 299000,
        stock: 45,
        sku: 'MT-HK-001',
        minAge: 12, // tháng
        maxAge: 36, // tháng
        weight: 500, // gram
        dimensions: '20x20x5', // cm
        materials: 'Gỗ tự nhiên, sơn màu gốc nước an toàn',
        thumbnail: '/uploads/products/bo-tha-hinh-khoi-thumb.jpg',
        images: JSON.stringify([
          '/uploads/products/bo-tha-hinh-khoi-1.jpg',
          '/uploads/products/bo-tha-hinh-khoi-2.jpg'
        ]),
        isFeatured: true,
        isActive: true,
        safetyInfo: 'Sản phẩm đạt tiêu chuẩn an toàn Châu Âu EN71, không chứa chì và các chất độc hại.',
        educationalValue: 'Phát triển nhận thức về hình dạng, màu sắc, kỹ năng vận động tinh và tư duy logic.',
        categoryId: categoryMap['do-choi-montessori'],
        tags: JSON.stringify(['montessori', 'thả hình khối', 'nhận biết hình dạng', 'vận động tinh']),
        isPersonalizable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Bảng đếm hạt Montessori',
        description: 'Bảng đếm hạt Montessori giúp bé học đếm và làm quen với toán học cơ bản một cách trực quan.',
        richDescription: `<p>Bảng đếm hạt Montessori là công cụ giáo dục hiệu quả giúp bé làm quen với số đếm và các phép tính cơ bản một cách trực quan, dễ hiểu.</p>
        <p>Bộ sản phẩm bao gồm:</p>
        <ul>
          <li>1 bảng gỗ có khung đếm</li>
          <li>100 hạt gỗ màu sắc</li>
          <li>Thẻ số từ 0-9</li>
        </ul>
        <p>Cách sử dụng:</p>
        <p>Bé có thể đặt số lượng hạt tương ứng với con số trên thẻ, hoặc thực hiện các phép cộng, trừ đơn giản bằng cách thêm hoặc bớt hạt.</p>
        <p>Lợi ích giáo dục:</p>
        <ul>
          <li>Làm quen với khái niệm số đếm</li>
          <li>Học các phép tính cơ bản: cộng, trừ</li>
          <li>Phát triển tư duy toán học</li>
          <li>Rèn luyện kỹ năng vận động tinh</li>
        </ul>`,
        price: 350000,
        stock: 30,
        sku: 'MT-DH-002',
        minAge: 36, // tháng
        maxAge: 72, // tháng
        weight: 700, // gram
        dimensions: '30x20x3', // cm
        materials: 'Gỗ tự nhiên, hạt gỗ màu sắc (sơn an toàn)',
        thumbnail: '/uploads/products/bang-dem-hat-thumb.jpg',
        images: JSON.stringify([
          '/uploads/products/bang-dem-hat-1.jpg',
          '/uploads/products/bang-dem-hat-2.jpg'
        ]),
        isFeatured: false,
        isActive: true,
        safetyInfo: 'Sản phẩm đạt tiêu chuẩn an toàn Châu Âu EN71. Có các hạt nhỏ, phụ huynh cần giám sát khi cho trẻ chơi.',
        educationalValue: 'Phát triển tư duy toán học, kỹ năng đếm và làm quen với các phép tính cơ bản.',
        categoryId: categoryMap['do-choi-montessori'],
        tags: JSON.stringify(['montessori', 'toán học', 'đếm số', 'phép tính']),
        isPersonalizable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Đồ chơi cá nhân hóa
      {
        name: 'Sách vải nhận biết in tên riêng',
        description: 'Sách vải mềm mại với các chủ đề nhận biết, được cá nhân hóa với tên của bé.',
        richDescription: `<p>Sách vải nhận biết với tên của bé là món quà độc đáo và ý nghĩa dành cho các bé từ 6 tháng trở lên. Các trang sách mềm mại với nhiều chủ đề khác nhau giúp bé làm quen với thế giới xung quanh.</p>
        <p>Đặc điểm sản phẩm:</p>
        <ul>
          <li>Làm từ vải cotton mềm mại, an toàn cho bé</li>
          <li>Tên của bé được thêu trên bìa và xuất hiện trong nội dung sách</li>
          <li>6-8 trang với các chủ đề: động vật, màu sắc, hình dạng, v.v.</li>
          <li>Có các chi tiết tương tác: nút bấm, dây buộc, khóa kéo</li>
        </ul>
        <p>Lợi ích giáo dục:</p>
        <ul>
          <li>Kích thích giác quan của bé với các bề mặt khác nhau</li>
          <li>Phát triển vốn từ vựng và ngôn ngữ</li>
          <li>Rèn luyện kỹ năng vận động tinh</li>
          <li>Tạo cảm giác thân thuộc khi bé thấy tên mình trong sách</li>
        </ul>`,
        price: 399000,
        stock: 20,
        sku: 'CN-SV-001',
        minAge: 6, // tháng
        maxAge: 36, // tháng
        weight: 300, // gram
        dimensions: '15x15x3', // cm
        materials: 'Vải cotton mềm, chỉ thêu an toàn',
        thumbnail: '/uploads/products/sach-vai-nhan-biet-thumb.jpg',
        images: JSON.stringify([
          '/uploads/products/sach-vai-nhan-biet-1.jpg',
          '/uploads/products/sach-vai-nhan-biet-2.jpg'
        ]),
        isFeatured: true,
        isActive: true,
        safetyInfo: 'Sản phẩm thân thiện với trẻ em, không chứa các chi tiết nhỏ có thể nuốt. Vải và chỉ thêu đạt tiêu chuẩn an toàn.',
        educationalValue: 'Phát triển giác quan, vốn từ vựng, kỹ năng vận động tinh và tình cảm.',
        categoryId: categoryMap['do-choi-ca-nhan-hoa'],
        tags: JSON.stringify(['sách vải', 'cá nhân hóa', 'nhận biết', 'tên riêng']),
        isPersonalizable: true,
        personalizationOptions: JSON.stringify({
          nameRequired: true,
          colorOptions: ['Xanh dương', 'Hồng', 'Xanh lá', 'Vàng'],
          maxNameLength: 12
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Đồng hồ học giờ cá nhân hóa',
        description: 'Đồng hồ gỗ giúp bé học giờ với tên được cá nhân hóa, thiết kế đáng yêu và sặc sỡ.',
        richDescription: `<p>Đồng hồ học giờ cá nhân hóa là công cụ giáo dục tuyệt vời giúp bé học cách xem giờ một cách vui nhộn. Với thiết kế đáng yêu và tên của bé được khắc trên sản phẩm, đây còn là món quà ý nghĩa cho các dịp đặc biệt.</p>
        <p>Đặc điểm sản phẩm:</p>
        <ul>
          <li>Làm từ gỗ tự nhiên, sơn màu an toàn</li>
          <li>Kích thước vừa phải, phù hợp để đặt trên bàn hoặc treo tường</li>
          <li>Kim giờ và kim phút có thể xoay được</li>
          <li>Các số được thiết kế rõ ràng, dễ nhìn</li>
          <li>Tên của bé được khắc hoặc vẽ tùy chọn</li>
        </ul>
        <p>Lợi ích giáo dục:</p>
        <ul>
          <li>Học cách xem giờ trên đồng hồ kim</li>
          <li>Làm quen với khái niệm thời gian</li>
          <li>Phát triển kỹ năng nhận biết số</li>
          <li>Rèn luyện sự tập trung và kiên nhẫn</li>
        </ul>`,
        price: 450000,
        stock: 25,
        sku: 'CN-DH-002',
        minAge: 36, // tháng
        maxAge: 84, // tháng
        weight: 600, // gram
        dimensions: '25x25x3', // cm
        materials: 'Gỗ tự nhiên, sơn gốc nước an toàn',
        thumbnail: '/uploads/products/dong-ho-ca-nhan-hoa-thumb.jpg',
        images: JSON.stringify([
          '/uploads/products/dong-ho-ca-nhan-hoa-1.jpg',
          '/uploads/products/dong-ho-ca-nhan-hoa-2.jpg'
        ]),
        isFeatured: false,
        isActive: true,
        safetyInfo: 'Sản phẩm đạt tiêu chuẩn an toàn Châu Âu EN71. Phù hợp cho trẻ từ 3 tuổi trở lên.',
        educationalValue: 'Học cách xem giờ, phát triển khái niệm về thời gian và kỹ năng nhận biết số.',
        categoryId: categoryMap['do-choi-ca-nhan-hoa'],
        tags: JSON.stringify(['đồng hồ', 'cá nhân hóa', 'học giờ', 'tên riêng']),
        isPersonalizable: true,
        personalizationOptions: JSON.stringify({
          nameRequired: true,
          colorOptions: ['Xanh dương', 'Hồng', 'Tím', 'Vàng', 'Xanh lá'],
          maxNameLength: 12
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Đồ chơi STEAM
      {
        name: 'Bộ xếp hình điện tử đa năng',
        description: 'Bộ xếp hình điện tử đa năng phát triển kỹ năng STEAM cho bé từ 6 tuổi trở lên.',
        richDescription: `<p>Bộ xếp hình điện tử đa năng là đồ chơi giáo dục STEAM (Khoa học, Công nghệ, Kỹ thuật, Nghệ thuật và Toán học) tuyệt vời cho trẻ từ 6 tuổi trở lên. Sản phẩm giúp bé phát triển tư duy logic, khả năng giải quyết vấn đề và sáng tạo.</p>
        <p>Bộ sản phẩm bao gồm:</p>
        <ul>
          <li>120 chi tiết khác nhau: dây dẫn, mạch điện, động cơ, đèn LED, công tắc</li>
          <li>Sách hướng dẫn với 30+ dự án khác nhau</li>
          <li>Hộp đựng gọn gàng, dễ bảo quản</li>
        </ul>
        <p>Với bộ đồ chơi này, bé có thể tạo ra:</p>
        <ul>
          <li>Đèn báo động</li>
          <li>Quạt mini</li>
          <li>Xe điện đơn giản</li>
          <li>Hệ thống đèn giao thông</li>
          <li>Và nhiều dự án thú vị khác</li>
        </ul>
        <p>Lợi ích giáo dục:</p>
        <ul>
          <li>Học về mạch điện cơ bản</li>
          <li>Phát triển tư duy logic và giải quyết vấn đề</li>
          <li>Rèn luyện sự sáng tạo và tự học</li>
          <li>Khám phá nguyên lý khoa học một cách thực tế</li>
        </ul>`,
        price: 890000,
        salePrice: 790000,
        onSale: true,
        stock: 15,
        sku: 'ST-DT-001',
        minAge: 72, // tháng (6 tuổi)
        maxAge: 144, // tháng (12 tuổi)
        weight: 1500, // gram
        dimensions: '35x25x10', // cm
        materials: 'Nhựa ABS an toàn, linh kiện điện tử',
        thumbnail: '/uploads/products/bo-xep-hinh-dien-tu-thumb.jpg',
        images: JSON.stringify([
          '/uploads/products/bo-xep-hinh-dien-tu-1.jpg',
          '/uploads/products/bo-xep-hinh-dien-tu-2.jpg',
          '/uploads/products/bo-xep-hinh-dien-tu-3.jpg'
        ]),
        isFeatured: true,
        isActive: true,
        safetyInfo: 'Sản phẩm phù hợp cho trẻ từ 6 tuổi trở lên. Cần có sự giám sát của người lớn khi sử dụng. Không phù hợp cho trẻ dưới 3 tuổi do có chi tiết nhỏ.',
        educationalValue: 'Phát triển kiến thức STEAM, tư duy logic, khả năng giải quyết vấn đề và sáng tạo.',
        categoryId: categoryMap['do-choi-giao-duc-steam'],
        tags: JSON.stringify(['STEAM', 'điện tử', 'xếp hình', 'khoa học', 'công nghệ']),
        isPersonalizable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      
      // Thêm vài sản phẩm khác
      {
        name: 'Bộ xếp hình gỗ 100 chi tiết',
        description: 'Bộ xếp hình gỗ 100 chi tiết với nhiều hình dạng và màu sắc khác nhau, phát triển sáng tạo cho bé.',
        richDescription: `<p>Bộ xếp hình gỗ 100 chi tiết là món đồ chơi giáo dục tuyệt vời cho bé từ 3 tuổi trở lên. Với 100 khối gỗ đa dạng về hình dạng và màu sắc, sản phẩm kích thích sự sáng tạo và phát triển tư duy không gian của bé.</p>
        <p>Đặc điểm sản phẩm:</p>
        <ul>
          <li>100 khối gỗ với 10 hình dạng và 6 màu sắc khác nhau</li>
          <li>Kích thước vừa phải, dễ cầm nắm cho các bé nhỏ</li>
          <li>Đóng gói trong hộp gỗ có nắp đậy, dễ bảo quản</li>
          <li>Sản phẩm đạt tiêu chuẩn an toàn, không chứa chất độc hại</li>
        </ul>
        <p>Lợi ích giáo dục:</p>
        <ul>
          <li>Phát triển tư duy sáng tạo và trí tưởng tượng</li>
          <li>Rèn luyện kỹ năng vận động tinh</li>
          <li>Học về hình dạng, màu sắc và kích thước</li>
          <li>Phát triển kỹ năng giải quyết vấn đề</li>
        </ul>
        <p>Bé có thể xây dựng:</p>
        <ul>
          <li>Tòa nhà, lâu đài</li>
          <li>Cầu, đường</li>
          <li>Xe cộ</li>
          <li>Và nhiều công trình khác theo trí tưởng tượng</li>
        </ul>`,
        price: 499000,
        stock: 40,
        sku: 'GO-XH-001',
        minAge: 36, // tháng (3 tuổi)
        maxAge: 96, // tháng (8 tuổi)
        weight: 2000, // gram
        dimensions: '30x20x10', // cm
        materials: 'Gỗ thông tự nhiên, sơn màu an toàn',
        thumbnail: '/uploads/products/bo-xep-hinh-go-thumb.jpg',
        images: JSON.stringify([
          '/uploads/products/bo-xep-hinh-go-1.jpg',
          '/uploads/products/bo-xep-hinh-go-2.jpg'
        ]),
        isFeatured: false,
        isActive: true,
        safetyInfo: 'Sản phẩm đạt tiêu chuẩn an toàn Châu Âu EN71. Không phù hợp cho trẻ dưới 3 tuổi do có chi tiết nhỏ.',
        educationalValue: 'Phát triển tư duy sáng tạo, trí tưởng tượng, khả năng nhận biết hình dạng và màu sắc.',
        categoryId: categoryMap['do-choi-go'],
        tags: JSON.stringify(['xếp hình', 'gỗ', 'sáng tạo', 'hình khối']),
        isPersonalizable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Xe tập đi gỗ đa năng',
        description: 'Xe tập đi bằng gỗ kết hợp bảng bận rộn, giúp bé phát triển vận động và khả năng cân bằng.',
        richDescription: `<p>Xe tập đi gỗ đa năng là sản phẩm 2 trong 1 tuyệt vời, vừa là xe tập đi vừa là đồ chơi phát triển kỹ năng cho bé từ 12 tháng trở lên.</p>
        <p>Đặc điểm sản phẩm:</p>
        <ul>
          <li>Thiết kế chắc chắn, an toàn với bánh xe có khóa</li>
          <li>Tích hợp bảng bận rộn ở mặt trước với nhiều hoạt động thú vị</li>
          <li>Có ngăn chứa đồ chơi hoặc đồ dùng nhỏ</li>
          <li>Làm từ gỗ tự nhiên, sơn màu an toàn</li>
          <li>Dễ dàng lắp ráp và vệ sinh</li>
        </ul>
        <p>Lợi ích đối với bé:</p>
        <ul>
          <li>Hỗ trợ bé tập đi, phát triển vận động thô</li>
          <li>Rèn luyện khả năng cân bằng và phối hợp</li>
          <li>Phát triển vận động tinh nhờ các hoạt động trên bảng bận rộn</li>
          <li>Kích thích sự tò mò và khám phá</li>
        </ul>
        <p>Các hoạt động trên bảng bận rộn bao gồm: xoay bánh răng, trượt con vật, bấm nút, kéo khóa, và nhiều hoạt động thú vị khác.</p>`,
        price: 850000,
        salePrice: 750000,
        onSale: true,
        stock: 20,
        sku: 'GO-TD-002',
        minAge: 12, // tháng
        maxAge: 36, // tháng
        weight: 3500, // gram
        dimensions: '45x30x45', // cm
        materials: 'Gỗ thông tự nhiên, sơn không chì',
        thumbnail: '/uploads/products/xe-tap-di-go-thumb.jpg',
        images: JSON.stringify([
          '/uploads/products/xe-tap-di-go-1.jpg',
          '/uploads/products/xe-tap-di-go-2.jpg',
          '/uploads/products/xe-tap-di-go-3.jpg'
        ]),
        isFeatured: true,
        isActive: true,
        safetyInfo: 'Sản phẩm đạt tiêu chuẩn an toàn Châu Âu EN71. Phù hợp cho trẻ từ 12 tháng. Cần có sự giám sát của người lớn khi sử dụng.',
        educationalValue: 'Phát triển vận động thô, rèn luyện khả năng cân bằng, phát triển vận động tinh và tư duy.',
        categoryId: categoryMap['do-choi-go'],
        tags: JSON.stringify(['tập đi', 'gỗ', 'vận động', 'cân bằng', 'bảng bận rộn']),
        isPersonalizable: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    console.log(`Seeding ${products.length} products...`);
    await Product.bulkCreate(products);
    console.log('Products seeded successfully.');
    
    return true;
  } catch (error) {
    console.error('Error seeding products:', error);
    throw error;
  }
};

module.exports = seedProducts; 