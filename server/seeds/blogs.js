const { Blog, User } = require('../models');

/**
 * Seed Blog posts data
 */
const seedBlogs = async () => {
  try {
    // Find admin users to assign as authors
    const adminUsers = await User.findAll({
      where: {
        role: 'admin'
      }
    });
    
    // Use first admin as fallback if no admins found
    const defaultAuthorId = adminUsers.length > 0 ? adminUsers[0].id : 1;
    
    // Map admin users for easier reference
    const authorMap = {};
    adminUsers.forEach(admin => {
      if (admin.email === 'admin@babybon.com') {
        authorMap.admin = admin.id;
      } else if (admin.email === 'marketing@babybon.com') {
        authorMap.marketing = admin.id;
      }
    });
    
    const now = new Date();
    
    // Helper function to subtract days from a date
    const subtractDays = (date, days) => {
      const result = new Date(date);
      result.setDate(result.getDate() - days);
      return result;
    };
    
    // Define blog posts
    const blogs = [
      {
        title: 'Tầm quan trọng của đồ chơi giáo dục trong phát triển trẻ thơ',
        slug: 'tam-quan-trong-cua-do-choi-giao-duc',
        excerpt: 'Khám phá vai trò của đồ chơi giáo dục trong việc phát triển toàn diện kỹ năng nhận thức, vận động và cảm xúc ở trẻ em.',
        content: `<p>Đồ chơi không chỉ là vật phẩm giải trí mà còn là công cụ học tập quý giá đối với trẻ nhỏ. Những món đồ chơi được thiết kế với mục đích giáo dục có thể mang lại nhiều lợi ích phát triển quan trọng.</p>

<h2>Phát triển kỹ năng nhận thức</h2>
<p>Đồ chơi giáo dục như bảng bận rộn, bộ xếp hình, và đồ chơi phân loại giúp trẻ:</p>
<ul>
  <li>Nhận biết màu sắc, hình dạng và kích thước</li>
  <li>Hiểu về nguyên nhân và kết quả</li>
  <li>Phát triển khả năng giải quyết vấn đề</li>
  <li>Rèn luyện trí nhớ và khả năng tập trung</li>
</ul>

<h2>Phát triển vận động tinh và thô</h2>
<p>Khi trẻ tương tác với đồ chơi như xếp khối, luồn hạt, hay đồ chơi lắp ghép, chúng đang phát triển:</p>
<ul>
  <li>Khả năng phối hợp tay-mắt</li>
  <li>Sự khéo léo của các ngón tay</li>
  <li>Kỹ năng cầm nắm chính xác</li>
</ul>
<p>Đồ chơi vận động như xe tập đi, bóng, hay đồ chơi đẩy-kéo giúp phát triển cơ bắp và khả năng cân bằng.</p>

<h2>Phát triển ngôn ngữ và giao tiếp</h2>
<p>Đồ chơi như sách vải, thẻ hình, hay đồ chơi tạo âm thanh khuyến khích trẻ:</p>
<ul>
  <li>Học từ vựng mới</li>
  <li>Nhận biết âm thanh</li>
  <li>Phát triển kỹ năng nghe và nói</li>
</ul>

<h2>Phát triển kỹ năng xã hội và cảm xúc</h2>
<p>Khi chơi cùng người khác hoặc với đồ chơi giả lập, trẻ học được:</p>
<ul>
  <li>Cách chia sẻ và luân phiên</li>
  <li>Sự đồng cảm và hiểu biết cảm xúc</li>
  <li>Kỹ năng giao tiếp và hợp tác</li>
</ul>

<h2>Lựa chọn đồ chơi phù hợp</h2>
<p>Khi chọn đồ chơi giáo dục cho con, phụ huynh nên lưu ý:</p>
<ul>
  <li>Chọn đồ chơi phù hợp với độ tuổi và giai đoạn phát triển</li>
  <li>Ưu tiên đồ chơi đa năng, có thể sử dụng theo nhiều cách</li>
  <li>Cân nhắc chất lượng và độ an toàn</li>
  <li>Luân phiên đồ chơi để duy trì sự hứng thú của trẻ</li>
</ul>

<p>Tại BabyBon, chúng tôi cung cấp đa dạng đồ chơi giáo dục chất lượng cao, được thiết kế để hỗ trợ từng giai đoạn phát triển của trẻ. Hãy khám phá bộ sưu tập đồ chơi của chúng tôi để tìm những món quà ý nghĩa, góp phần vào hành trình phát triển toàn diện của con yêu.</p>`,
        featuredImage: '/uploads/blogs/do-choi-giao-duc.jpg',
        status: 'published',
        viewCount: 156,
        authorId: authorMap.marketing || defaultAuthorId,
        isFeatured: true,
        tags: JSON.stringify(['đồ chơi giáo dục', 'phát triển trẻ em', 'kỹ năng nhận thức', 'vận động tinh']),
        createdAt: subtractDays(now, 30),
        updatedAt: subtractDays(now, 30),
        publishedAt: subtractDays(now, 30)
      },
      {
        title: 'Phương pháp Montessori và cách áp dụng tại nhà',
        slug: 'phuong-phap-montessori-va-cach-ap-dung-tai-nha',
        excerpt: 'Tìm hiểu về phương pháp giáo dục Montessori và những cách đơn giản để ứng dụng triết lý này trong môi trường gia đình.',
        content: `<p>Phương pháp Montessori, được phát triển bởi bác sĩ Maria Montessori, là một trong những phương pháp giáo dục tiên tiến nhất thế giới. Dựa trên nguyên tắc tôn trọng sự phát triển tự nhiên của trẻ và tạo điều kiện cho trẻ tự học, phương pháp này ngày càng được nhiều phụ huynh Việt Nam quan tâm.</p>

<h2>Những nguyên tắc cơ bản của phương pháp Montessori</h2>
<ul>
  <li><strong>Tôn trọng trẻ:</strong> Coi trẻ là những cá nhân độc lập, có khả năng tự học và phát triển.</li>
  <li><strong>Tâm trí hấp thu:</strong> Trẻ em có khả năng hấp thu thông tin và kinh nghiệm từ môi trường xung quanh một cách tự nhiên.</li>
  <li><strong>Các giai đoạn nhạy cảm:</strong> Có những giai đoạn trẻ đặc biệt nhạy cảm với việc học các kỹ năng cụ thể.</li>
  <li><strong>Môi trường chuẩn bị:</strong> Tạo ra môi trường thân thiện, phù hợp với kích thước và nhu cầu của trẻ.</li>
  <li><strong>Tự do trong giới hạn:</strong> Cho phép trẻ tự do khám phá và học hỏi trong một khuôn khổ quy tắc rõ ràng.</li>
</ul>

<h2>Cách áp dụng phương pháp Montessori tại nhà</h2>

<h3>1. Tạo môi trường phù hợp</h3>
<p>Thiết kế không gian sống thân thiện với trẻ:</p>
<ul>
  <li>Kệ sách thấp để trẻ dễ dàng lấy và cất sách</li>
  <li>Bàn ghế kích thước phù hợp với trẻ</li>
  <li>Đồ dùng cá nhân đặt ở vị trí trẻ có thể tự lấy</li>
  <li>Góc làm việc yên tĩnh cho các hoạt động tập trung</li>
</ul>

<h3>2. Cung cấp đồ chơi và học cụ Montessori</h3>
<p>Ưu tiên đồ chơi và học cụ có đặc điểm:</p>
<ul>
  <li>Làm từ vật liệu tự nhiên như gỗ, vải, kim loại</li>
  <li>Đơn giản, không quá nhiều chi tiết phức tạp</li>
  <li>Có mục đích giáo dục rõ ràng</li>
  <li>Phù hợp với giai đoạn phát triển của trẻ</li>
</ul>
<p>Một số đồ chơi Montessori phổ biến: bộ thả hình khối, bảng đếm hạt, bộ trụ không núm, khay lắp ghép...</p>

<h3>3. Thực hành các hoạt động đời sống hàng ngày</h3>
<p>Khuyến khích trẻ tham gia vào các công việc nhà đơn giản:</p>
<ul>
  <li>Tự phục vụ bản thân: mặc quần áo, đánh răng, rửa tay</li>
  <li>Dọn dẹp: cất đồ chơi, lau bàn, xếp quần áo</li>
  <li>Chuẩn bị thức ăn: rửa rau, trộn salad, phết bơ lên bánh mì</li>
  <li>Chăm sóc môi trường: tưới cây, cho thú cưng ăn</li>
</ul>

<h3>4. Tôn trọng nhịp độ học tập của trẻ</h3>
<ul>
  <li>Cho phép trẻ tự chọn hoạt động mình muốn tham gia</li>
  <li>Không gián đoạn khi trẻ đang tập trung</li>
  <li>Tạo cơ hội cho trẻ lặp lại hoạt động nhiều lần</li>
  <li>Không ép buộc trẻ phải hoàn thành một nhiệm vụ trong thời gian cụ thể</li>
</ul>

<h2>Lợi ích khi áp dụng phương pháp Montessori</h2>
<ul>
  <li>Phát triển tính độc lập và tự tin</li>
  <li>Nâng cao khả năng tập trung và giải quyết vấn đề</li>
  <li>Hình thành thói quen tự giác và yêu thích học tập</li>
  <li>Phát triển kỹ năng xã hội và khả năng giao tiếp</li>
</ul>

<p>Tại BabyBon, chúng tôi cung cấp đa dạng đồ chơi Montessori chất lượng cao, được thiết kế để hỗ trợ việc học tập tại nhà theo phương pháp này. Khám phá ngay bộ sưu tập Montessori của chúng tôi để bắt đầu hành trình học tập thú vị cùng con!</p>`,
        featuredImage: '/uploads/blogs/montessori-tai-nha.jpg',
        status: 'published',
        viewCount: 243,
        authorId: authorMap.admin || defaultAuthorId,
        isFeatured: true,
        tags: JSON.stringify(['montessori', 'giáo dục tại nhà', 'phương pháp giáo dục', 'phát triển trẻ em']),
        createdAt: subtractDays(now, 25),
        updatedAt: subtractDays(now, 25),
        publishedAt: subtractDays(now, 25)
      },
      {
        title: '5 dấu hiệu nhận biết đồ chơi chất lượng và an toàn cho trẻ',
        slug: '5-dau-hieu-nhan-biet-do-choi-chat-luong-va-an-toan-cho-tre',
        excerpt: 'Hướng dẫn cha mẹ cách chọn đồ chơi an toàn, bền và có giá trị giáo dục cho con.',
        content: `<p>Đồ chơi đóng vai trò quan trọng trong sự phát triển của trẻ, nhưng không phải món đồ chơi nào cũng được sản xuất với tiêu chuẩn an toàn và chất lượng cao. Dưới đây là 5 dấu hiệu giúp phụ huynh nhận biết đồ chơi chất lượng và an toàn cho con.</p>

<h2>1. Chứng nhận an toàn</h2>
<p>Đồ chơi chất lượng thường có các chứng nhận an toàn quốc tế hoặc trong nước:</p>
<ul>
  <li><strong>Tiêu chuẩn EN71:</strong> Tiêu chuẩn an toàn đồ chơi của Châu Âu</li>
  <li><strong>Chứng nhận ASTM F963:</strong> Tiêu chuẩn an toàn đồ chơi của Mỹ</li>
  <li><strong>Dấu CE:</strong> Xác nhận sản phẩm đáp ứng các yêu cầu an toàn của EU</li>
  <li><strong>Chứng nhận ISO:</strong> Đảm bảo quy trình sản xuất đạt chuẩn quốc tế</li>
</ul>
<p>Khi mua đồ chơi, hãy kiểm tra bao bì hoặc sản phẩm để tìm các ký hiệu chứng nhận này.</p>

<h2>2. Vật liệu chất lượng cao</h2>
<p>Vật liệu là yếu tố quyết định đến độ an toàn và bền bỉ của đồ chơi:</p>
<ul>
  <li><strong>Gỗ tự nhiên:</strong> Nên chọn gỗ đã được xử lý, không có góc cạnh sắc nhọn, được đánh nhẵn và sơn phủ an toàn</li>
  <li><strong>Nhựa an toàn:</strong> Ưu tiên các loại nhựa không chứa BPA, PVC, Phthalates. Nhựa ABS, PP, PE thường an toàn hơn</li>
  <li><strong>Vải:</strong> Chọn vải organic hoặc vải được chứng nhận an toàn, không chứa chất độc hại</li>
  <li><strong>Sơn và màu:</strong> Đảm bảo sơn không chứa chì và các kim loại nặng</li>
</ul>

<h2>3. Thiết kế phù hợp với độ tuổi</h2>
<p>Đồ chơi chất lượng thường có thông tin rõ ràng về độ tuổi phù hợp:</p>
<ul>
  <li>Đồ chơi cho trẻ dưới 3 tuổi không nên có các chi tiết nhỏ có thể gây nguy cơ hóc nghẹn</li>
  <li>Kích thước và trọng lượng phù hợp với khả năng cầm nắm của trẻ</li>
  <li>Độ khó của đồ chơi tương xứng với kỹ năng hiện tại của trẻ, vừa đủ thách thức để khuyến khích sự phát triển</li>
</ul>

<h2>4. Độ bền và khả năng sửa chữa</h2>
<p>Đồ chơi chất lượng thường có đặc điểm:</p>
<ul>
  <li>Các mối nối chắc chắn, không dễ bong tróc</li>
  <li>Khả năng chịu lực tốt khi bị rơi hoặc va đập</li>
  <li>Màu sắc bền, không phai màu khi tiếp xúc với nước hoặc ánh sáng</li>
  <li>Có thể tháo rời để sửa chữa hoặc thay thế phụ tùng khi cần</li>
</ul>

<h2>5. Giá trị giáo dục</h2>
<p>Đồ chơi chất lượng không chỉ an toàn mà còn mang lại giá trị giáo dục:</p>
<ul>
  <li>Khuyến khích sự sáng tạo và tưởng tượng</li>
  <li>Phát triển các kỹ năng cụ thể: vận động tinh, tư duy logic, khả năng giải quyết vấn đề...</li>
  <li>Có thể chơi theo nhiều cách khác nhau, không chỉ một chức năng duy nhất</li>
  <li>Phát triển theo cùng với trẻ, sử dụng được trong thời gian dài</li>
</ul>

<h2>Lưu ý thêm khi chọn đồ chơi</h2>
<ul>
  <li>Ưu tiên đồ chơi từ các thương hiệu uy tín, có nguồn gốc rõ ràng</li>
  <li>Đọc kỹ thông tin sản phẩm và hướng dẫn sử dụng</li>
  <li>Kiểm tra đánh giá của khách hàng khác</li>
  <li>Mua từ các cửa hàng chuyên biệt hoặc đại lý chính hãng</li>
</ul>

<p>Tại BabyBon, tất cả sản phẩm đều được kiểm tra nghiêm ngặt và đạt các tiêu chuẩn an toàn quốc tế. Chúng tôi cam kết cung cấp đồ chơi chất lượng cao, an toàn tuyệt đối và có giá trị giáo dục cho trẻ em Việt Nam.</p>`,
        featuredImage: '/uploads/blogs/do-choi-an-toan.jpg',
        status: 'published',
        viewCount: 189,
        authorId: authorMap.admin || defaultAuthorId,
        isFeatured: false,
        tags: JSON.stringify(['đồ chơi an toàn', 'chọn đồ chơi', 'tiêu chuẩn chất lượng', 'đồ chơi giáo dục']),
        createdAt: subtractDays(now, 18),
        updatedAt: subtractDays(now, 18),
        publishedAt: subtractDays(now, 18)
      },
      {
        title: 'Cách khuyến khích sự sáng tạo của trẻ qua đồ chơi',
        slug: 'cach-khuyen-khich-su-sang-tao-cua-tre-qua-do-choi',
        excerpt: 'Phát triển óc sáng tạo và trí tưởng tượng phong phú cho trẻ thông qua việc lựa chọn đồ chơi phù hợp.',
        content: `<p>Sự sáng tạo là một trong những kỹ năng quan trọng nhất mà trẻ cần phát triển để thành công trong tương lai. Đồ chơi đóng vai trò thiết yếu trong quá trình kích thích trí tưởng tượng và khả năng sáng tạo của trẻ nhỏ.</p>

<h2>Tại sao sự sáng tạo quan trọng?</h2>
<p>Sự sáng tạo giúp trẻ:</p>
<ul>
  <li>Phát triển khả năng giải quyết vấn đề</li>
  <li>Rèn luyện tư duy linh hoạt</li>
  <li>Xây dựng sự tự tin</li>
  <li>Tạo nền tảng cho sự đổi mới trong tương lai</li>
  <li>Phát triển kỹ năng xã hội thông qua trò chơi sáng tạo</li>
</ul>

<h2>Lựa chọn đồ chơi kích thích sáng tạo</h2>

<h3>1. Đồ chơi mở</h3>
<p>Đồ chơi mở là những đồ chơi không có cách chơi định sẵn, cho phép trẻ tự do sáng tạo:</p>
<ul>
  <li>Khối gỗ với nhiều hình dạng, kích thước</li>
  <li>Đất nặn, bột nhào an toàn</li>
  <li>Bộ xếp hình không có hướng dẫn cụ thể</li>
  <li>Vật liệu tự nhiên: đá cuội, vỏ sò, hạt giống...</li>
</ul>

<h3>2. Đồ chơi nghệ thuật</h3>
<p>Các hoạt động nghệ thuật là cách tuyệt vời để phát triển sự sáng tạo:</p>
<ul>
  <li>Bút màu, giấy vẽ</li>
  <li>Bộ dụng cụ in hình</li>
  <li>Bộ dụng cụ làm thủ công</li>
  <li>Nhạc cụ đơn giản</li>
</ul>

<h3>3. Đồ chơi đóng vai</h3>
<p>Đồ chơi giúp trẻ đóng vai các nhân vật hoặc tình huống khác nhau:</p>
<ul>
  <li>Bộ đồ chơi nhà bếp mini</li>
  <li>Trang phục hóa trang</li>
  <li>Búp bê và phụ kiện</li>
  <li>Bộ đồ chơi bác sĩ, cửa hàng...</li>
</ul>

<h2>Cách khuyến khích sự sáng tạo thông qua đồ chơi</h2>

<h3>1. Tạo không gian và thời gian</h3>
<ul>
  <li>Dành một khu vực trong nhà cho hoạt động sáng tạo</li>
  <li>Cho phép có "sự lộn xộn sáng tạo"</li>
  <li>Đảm bảo thời gian chơi tự do, không hướng dẫn</li>
</ul>

<h3>2. Tạo nguồn cảm hứng</h3>
<ul>
  <li>Đọc sách, kể chuyện để kích thích trí tưởng tượng</li>
  <li>Đưa trẻ đi dã ngoại, tham quan bảo tàng</li>
  <li>Giới thiệu với trẻ về nghệ thuật, âm nhạc, khoa học</li>
</ul>

<h3>3. Hỏi câu hỏi mở</h3>
<p>Thay vì hướng dẫn cụ thể, hãy đặt câu hỏi như:</p>
<ul>
  <li>"Con có thể làm gì với những vật liệu này?"</li>
  <li>"Điều gì sẽ xảy ra nếu...?"</li>
  <li>"Con nghĩ chúng ta có thể tạo ra gì từ những thứ này?"</li>
</ul>

<h3>4. Tôn trọng quá trình sáng tạo</h3>
<ul>
  <li>Đừng sửa chữa hoặc chỉ trích tác phẩm của trẻ</li>
  <li>Tập trung vào quá trình, không phải kết quả</li>
  <li>Khen ngợi sự nỗ lực và ý tưởng độc đáo</li>
</ul>

<h2>Một số gợi ý đồ chơi sáng tạo theo độ tuổi</h2>

<h3>1-2 tuổi:</h3>
<ul>
  <li>Khối gỗ lớn, dễ cầm nắm</li>
  <li>Sách vải có kết cấu đa dạng</li>
  <li>Đồ chơi xếp chồng và lồng vào nhau</li>
  <li>Bút sáp lớn và giấy vẽ</li>
</ul>

<h3>3-5 tuổi:</h3>
<ul>
  <li>Bộ đất nặn an toàn</li>
  <li>Bộ đồ chơi dụng cụ xây dựng</li>
  <li>Trang phục hóa trang</li>
  <li>Bộ dụng cụ nghệ thuật đơn giản</li>
</ul>

<h3>6-8 tuổi:</h3>
<ul>
  <li>Bộ xếp hình sáng tạo</li>
  <li>Bộ dụng cụ khoa học đơn giản</li>
  <li>Đồ chơi lập trình cơ bản</li>
  <li>Nhạc cụ đơn giản</li>
</ul>

<p>Tại BabyBon, chúng tôi tự hào cung cấp nhiều dòng đồ chơi kích thích sáng tạo, từ đồ chơi gỗ tự nhiên đến các bộ dụng cụ nghệ thuật an toàn cho trẻ. Hãy khám phá bộ sưu tập đồ chơi sáng tạo của chúng tôi để giúp con phát triển tiềm năng vô hạn của mình.</p>`,
        featuredImage: '/uploads/blogs/do-choi-sang-tao.jpg',
        status: 'published',
        viewCount: 165,
        authorId: authorMap.marketing || defaultAuthorId,
        isFeatured: false,
        tags: JSON.stringify(['sáng tạo', 'trí tưởng tượng', 'đồ chơi nghệ thuật', 'phát triển trẻ em']),
        createdAt: subtractDays(now, 14),
        updatedAt: subtractDays(now, 14),
        publishedAt: subtractDays(now, 14)
      },
      {
        title: 'Đồ chơi gỗ - Lựa chọn an toàn và bền vững cho bé',
        slug: 'do-choi-go-lua-chon-an-toan-va-ben-vung-cho-be',
        excerpt: 'Tìm hiểu về lợi ích của đồ chơi gỗ và cách chọn sản phẩm chất lượng cao cho con.',
        content: `<p>Đồ chơi gỗ ngày càng được nhiều bậc phụ huynh lựa chọn cho con mình nhờ tính an toàn, bền bỉ và thân thiện với môi trường. Bài viết này sẽ giúp bạn hiểu rõ hơn về lợi ích của đồ chơi gỗ và cách chọn những sản phẩm chất lượng cao.</p>

<h2>Lợi ích của đồ chơi gỗ</h2>

<h3>1. An toàn cho sức khỏe</h3>
<ul>
  <li>Làm từ vật liệu tự nhiên, không chứa hóa chất độc hại như nhiều đồ chơi nhựa</li>
  <li>Bền bỉ, không dễ vỡ thành mảnh nhỏ gây nguy hiểm</li>
  <li>Các cạnh thường được bo tròn, an toàn cho trẻ nhỏ</li>
  <li>Không chứa BPA, phthalates và các chất độc hại khác</li>
</ul>

<h3>2. Bền bỉ và giá trị lâu dài</h3>
<ul>
  <li>Chịu được va đập, không dễ bị hỏng như đồ chơi nhựa</li>
  <li>Có thể truyền từ thế hệ này sang thế hệ khác</li>
  <li>Giữ được giá trị thẩm mỹ theo thời gian</li>
  <li>Tiết kiệm chi phí về lâu dài do không phải thay thế thường xuyên</li>
</ul>

<h3>3. Phát triển giác quan tự nhiên</h3>
<ul>
  <li>Kết cấu tự nhiên kích thích xúc giác của trẻ</li>
  <li>Âm thanh mềm mại, dễ chịu khi chơi</li>
  <li>Mùi hương tự nhiên dễ chịu</li>
  <li>Màu sắc tự nhiên, không quá chói, tốt cho thị giác</li>
</ul>

<h3>4. Thân thiện với môi trường</h3>
<ul>
  <li>Làm từ vật liệu tái tạo được khi sử dụng gỗ từ nguồn bền vững</li>
  <li>Có thể phân hủy sinh học khi không còn sử dụng</li>
  <li>Quá trình sản xuất thường ít gây ô nhiễm hơn đồ chơi nhựa</li>
  <li>Dạy trẻ giá trị về bảo vệ môi trường từ nhỏ</li>
</ul>

<h2>Cách chọn đồ chơi gỗ chất lượng</h2>

<h3>1. Kiểm tra nguồn gốc và chứng nhận</h3>
<ul>
  <li>Tìm kiếm sản phẩm từ gỗ được chứng nhận FSC (Forest Stewardship Council)</li>
  <li>Ưu tiên thương hiệu có uy tín, rõ ràng về nguồn gốc sản xuất</li>
  <li>Kiểm tra các chứng nhận an toàn như EN71, ASTM F963</li>
</ul>

<h3>2. Đánh giá chất lượng gỗ và hoàn thiện</h3>
<ul>
  <li>Gỗ chắc chắn, không có nút hoặc vết nứt</li>
  <li>Bề mặt nhẵn mịn, không có góc cạnh sắc</li>
  <li>Sơn không bong tróc khi cào xước nhẹ</li>
  <li>Mối nối chắc chắn, không lung lay</li>
</ul>

<h3>3. Xem xét sơn phủ và màu sắc</h3>
<ul>
  <li>Ưu tiên sản phẩm sử dụng sơn gốc nước, không chì</li>
  <li>Kiểm tra có mùi hóa chất mạnh hay không</li>
  <li>Nếu có thể, chọn đồ chơi hoàn thiện bằng sáp ong hoặc dầu tự nhiên</li>
</ul>

<h3>4. Đánh giá độ phù hợp với độ tuổi</h3>
<ul>
  <li>Cho trẻ dưới 1 tuổi: đồ chơi đơn giản, kích thước lớn, không có chi tiết nhỏ</li>
  <li>Trẻ 1-3 tuổi: đồ chơi xếp chồng, kéo đẩy, hình khối đơn giản</li>
  <li>Trẻ 3-6 tuổi: đồ chơi ghép hình phức tạp hơn, đồ chơi xây dựng</li>
  <li>Trẻ trên 6 tuổi: trò chơi chiến thuật bằng gỗ, xếp hình nâng cao</li>
</ul>

<h2>Các loại đồ chơi gỗ phổ biến và lợi ích</h2>

<h3>1. Xe kéo và đồ chơi vận động</h3>
<p>Giúp phát triển kỹ năng vận động thô, khả năng cân bằng và phối hợp.</p>

<h3>2. Bộ xếp hình và khối gỗ</h3>
<p>Phát triển tư duy không gian, khả năng giải quyết vấn đề và sáng tạo.</p>

<h3>3. Đồ chơi âm nhạc gỗ</h3>
<p>Kích thích thính giác, cảm nhận nhịp điệu và phát triển năng khiếu âm nhạc.</p>

<h3>4. Bảng bận rộn và đồ chơi khám phá</h3>
<p>Rèn luyện kỹ năng vận động tinh, phối hợp tay-mắt và tư duy logic.</p>

<p>Tại BabyBon, chúng tôi tự hào cung cấp đa dạng đồ chơi gỗ chất lượng cao, được làm từ gỗ tự nhiên với sơn an toàn, đạt chuẩn quốc tế. Tất cả sản phẩm đều được kiểm tra nghiêm ngặt trước khi đến tay khách hàng, đảm bảo an toàn tuyệt đối cho bé yêu của bạn.</p>`,
        featuredImage: '/uploads/blogs/do-choi-go.jpg',
        status: 'published',
        viewCount: 127,
        authorId: authorMap.admin || defaultAuthorId,
        isFeatured: false,
        tags: JSON.stringify(['đồ chơi gỗ', 'an toàn', 'bền vững', 'thân thiện môi trường']),
        createdAt: subtractDays(now, 10),
        updatedAt: subtractDays(now, 10),
        publishedAt: subtractDays(now, 10)
      },
      {
        title: 'Các giai đoạn phát triển và đồ chơi phù hợp cho trẻ từ 0-6 tuổi',
        slug: 'cac-giai-doan-phat-trien-va-do-choi-phu-hop-cho-tre-0-6-tuoi',
        excerpt: 'Hướng dẫn chi tiết về các giai đoạn phát triển của trẻ và những loại đồ chơi tối ưu cho từng độ tuổi.',
        content: `<p>Mỗi giai đoạn phát triển của trẻ đều có những đặc điểm riêng và nhu cầu học tập khác nhau. Việc hiểu rõ các mốc phát triển và lựa chọn đồ chơi phù hợp sẽ giúp kích thích tối đa tiềm năng của con bạn.</p>

<h2>Giai đoạn 0-6 tháng: Khám phá giác quan</h2>

<h3>Đặc điểm phát triển:</h3>
<ul>
  <li>Trẻ bắt đầu nhận thức về thế giới xung quanh thông qua các giác quan</li>
  <li>Phát triển khả năng nhìn, nghe và cầm nắm đơn giản</li>
  <li>Bắt đầu nhận ra khuôn mặt và phản ứng với âm thanh</li>
  <li>Tập lật, đỡ đầu và với tay lấy đồ vật</li>
</ul>

<h3>Đồ chơi phù hợp:</h3>
<ul>
  <li><strong>Xúc xắc màu sắc tương phản:</strong> Kích thích thị giác và thính giác</li>
  <li><strong>Gương an toàn cho bé:</strong> Giúp trẻ nhận diện khuôn mặt</li>
  <li><strong>Thảm chơi nhiều màu sắc và kết cấu:</strong> Phát triển xúc giác và thị giác</li>
  <li><strong>Đồ chơi treo nôi:</strong> Khuyến khích trẻ với tay và phối hợp mắt-tay</li>
  <li><strong>Sách vải mềm:</strong> Giới thiệu hình ảnh và màu sắc đơn giản</li>
</ul>

<h2>Giai đoạn 6-12 tháng: Khám phá vận động</h2>

<h3>Đặc điểm phát triển:</h3>
<ul>
  <li>Trẻ bắt đầu ngồi, bò và có thể đứng với sự hỗ trợ</li>
  <li>Phát triển kỹ năng cầm nắm chính xác hơn</li>
  <li>Hiểu được nguyên lý nhân-quả đơn giản</li>
  <li>Bắt đầu bập bẹ và tạo ra âm thanh có ý nghĩa</li>
  <li>Khám phá đồ vật bằng cách đập, lắc, bỏ và ném</li>
</ul>

<h3>Đồ chơi phù hợp:</h3>
<ul>
  <li><strong>Cốc xếp chồng:</strong> Phát triển kỹ năng vận động tinh và hiểu về kích thước</li>
  <li><strong>Đồ chơi nhấn nút có âm thanh/ánh sáng:</strong> Dạy trẻ về nguyên lý nhân-quả</li>
  <li><strong>Xe đẩy tập đi:</strong> Hỗ trợ trẻ tập đứng và đi</li>
  <li><strong>Đồ chơi thả hình khối đơn giản:</strong> Phát triển phối hợp tay-mắt</li>
  <li><strong>Thú nhồi bông và búp bê mềm:</strong> Phát triển tình cảm và khả năng ôm, nắm</li>
</ul>

<h2>Giai đoạn 12-24 tháng: Khám phá ngôn ngữ và vận động</h2>

<h3>Đặc điểm phát triển:</h3>
<ul>
  <li>Trẻ bắt đầu đi vững và chạy</li>
  <li>Phát triển vốn từ vựng nhanh chóng</li>
  <li>Bắt đầu chơi giả vờ đơn giản</li>
  <li>Khả năng giải quyết vấn đề cơ bản</li>
  <li>Thể hiện tính độc lập và tự làm</li>
</ul>

<h3>Đồ chơi phù hợp:</h3>
<ul>
  <li><strong>Bảng bận rộn đơn giản:</strong> Phát triển kỹ năng vận động tinh</li>
  <li><strong>Đồ chơi kéo đẩy:</strong> Hỗ trợ phát triển vận động thô</li>
  <li><strong>Sách tranh có cấu trúc đơn giản:</strong> Phát triển ngôn ngữ</li>
  <li><strong>Đồ chơi xếp hình lớn:</strong> Phát triển tư duy không gian</li>
  <li><strong>Đồ chơi nhà bếp mini:</strong> Khuyến khích chơi giả vờ</li>
</ul>

<h2>Giai đoạn 2-3 tuổi: Phát triển ngôn ngữ và tưởng tượng</h2>

<h3>Đặc điểm phát triển:</h3>
<ul>
  <li>Trẻ nói thành câu và giao tiếp hiệu quả hơn</li>
  <li>Phát triển khả năng tưởng tượng phong phú</li>
  <li>Hiểu và tuân theo hướng dẫn đơn giản</li>
  <li>Bắt đầu học cách kiểm soát cảm xúc</li>
  <li>Tham gia vào các hoạt động xã hội đơn giản</li>
</ul>

<h3>Đồ chơi phù hợp:</h3>
<ul>
  <li><strong>Đất nặn an toàn:</strong> Phát triển sáng tạo và vận động tinh</li>
  <li><strong>Ghép hình đơn giản (2-4 mảnh):</strong> Phát triển tư duy logic</li>
  <li><strong>Bộ đồ chơi giả vờ:</strong> Bộ bác sĩ, nhà bếp, công cụ</li>
  <li><strong>Sách truyện có cốt truyện đơn giản:</strong> Phát triển ngôn ngữ và tập trung</li>
  <li><strong>Xe đạp ba bánh:</strong> Phát triển vận động thô và cân bằng</li>
</ul>

<h2>Giai đoạn 3-4 tuổi: Xã hội hóa và sáng tạo</h2>

<h3>Đặc điểm phát triển:</h3>
<ul>
  <li>Trẻ bắt đầu chơi hợp tác với bạn bè</li>
  <li>Phát triển kỹ năng vận động tinh tốt hơn</li>
  <li>Thể hiện tính sáng tạo trong nghệ thuật và chơi giả vờ</li>
  <li>Hiểu các khái niệm như màu sắc, số đếm, và kích thước</li>
  <li>Đặt nhiều câu hỏi "tại sao" và "như thế nào"</li>
</ul>

<h3>Đồ chơi phù hợp:</h3>
<ul>
  <li><strong>Dụng cụ nghệ thuật:</strong> Bút màu, giấy, kéo an toàn, hồ dán</li>
  <li><strong>Bộ xếp hình 10-20 mảnh:</strong> Phát triển sự kiên nhẫn và tư duy</li>
  <li><strong>Trò chơi đơn giản có luật lệ:</strong> Dạy trẻ về luân phiên và tuân thủ quy tắc</li>
  <li><strong>Bộ xếp hình khối:</strong> Phát triển tư duy không gian và sáng tạo</li>
  <li><strong>Đồ chơi âm nhạc:</strong> Trống, kèn, xylophone nhỏ</li>
</ul>

<h2>Giai đoạn 4-6 tuổi: Chuẩn bị đến trường</h2>

<h3>Đặc điểm phát triển:</h3>
<ul>
  <li>Trẻ phát triển kỹ năng tiền đọc và tiền toán</li>
  <li>Có khả năng tập trung lâu hơn</li>
  <li>Phát triển kỹ năng xã hội phức tạp hơn</li>
  <li>Hiểu về quy tắc và hậu quả</li>
  <li>Phát triển khả năng tự điều chỉnh</li>
</ul>

<h3>Đồ chơi phù hợp:</h3>
<ul>
  <li><strong>Trò chơi học chữ và số:</strong> Chuẩn bị kỹ năng học tập</li>
  <li><strong>Dụng cụ khoa học đơn giản:</strong> Kính lúp, nam châm, đồng hồ cát</li>
  <li><strong>Đồ chơi xây dựng phức tạp hơn:</strong> LEGO, các bộ xây dựng</li>
  <li><strong>Trò chơi bàn đơn giản:</strong> Cờ caro, cờ tỷ phú trẻ em</li>
  <li><strong>Dụng cụ thể thao phù hợp với trẻ:</strong> Bóng, vợt nhỏ, bộ bowling mini</li>
</ul>

<h2>Lời khuyên khi chọn đồ chơi theo độ tuổi</h2>

<ul>
  <li><strong>Chọn đồ chơi "mở":</strong> Đồ chơi có thể chơi theo nhiều cách khác nhau, kích thích sáng tạo</li>
  <li><strong>Tôn trọng sở thích:</strong> Quan sát và tôn trọng sở thích tự nhiên của trẻ</li>
  <li><strong>Cân đối loại đồ chơi:</strong> Đảm bảo trẻ được tiếp cận với nhiều loại đồ chơi phát triển các kỹ năng khác nhau</li>
  <li><strong>Không quá nhiều:</strong> Hạn chế số lượng đồ chơi để tránh làm trẻ quá tải</li>
  <li><strong>An toàn là ưu tiên hàng đầu:</strong> Luôn kiểm tra độ an toàn phù hợp với độ tuổi</li>
</ul>

<p>Tại BabyBon, chúng tôi cung cấp đa dạng đồ chơi phù hợp với từng giai đoạn phát triển của trẻ, được thiết kế để kích thích tối đa tiềm năng của con bạn. Mỗi sản phẩm đều được chọn lọc cẩn thận, đảm bảo an toàn và có giá trị giáo dục cao.</p>`,
        featuredImage: '/uploads/blogs/giai-doan-phat-trien.jpg',
        status: 'published',
        viewCount: 175,
        authorId: authorMap.marketing || defaultAuthorId,
        isFeatured: true,
        tags: JSON.stringify(['phát triển trẻ em', 'đồ chơi theo độ tuổi', 'giai đoạn phát triển', 'giáo dục sớm']),
        createdAt: subtractDays(now, 7),
        updatedAt: subtractDays(now, 7),
        publishedAt: subtractDays(now, 7)
      }
    ];

    console.log(`Seeding ${blogs.length} blog posts...`);
    await Blog.bulkCreate(blogs);
    console.log('Blog posts seeded successfully.');
    
    return true;
  } catch (error) {
    console.error('Error seeding blog posts:', error);
    throw error;
  }
};

module.exports = seedBlogs; 