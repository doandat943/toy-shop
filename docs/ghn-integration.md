# Tích hợp Giao Hàng Nhanh (GHN) API

Tài liệu này mô tả cách tích hợp và sử dụng dịch vụ vận chuyển Giao Hàng Nhanh (GHN) trong hệ thống BabyBon.

## Cấu hình

Thông tin cấu hình GHN được lưu trong file `server/services/ghnService.js`:

```javascript
// GHN Configuration
const config = {
  token: '275c6280-424e-11f0-9b81-222185cb68c8', // Token GHN
  shopId: 196792,                                // Shop ID GHN
  baseURL: process.env.NODE_ENV === 'production' ? GHN_API.PROD : GHN_API.PROD,
};
```

### Để thay đổi cấu hình:

1. Truy cập tài khoản GHN tại [khachhang.ghn.vn](https://khachhang.ghn.vn) (môi trường production) hoặc [5sao.ghn.dev](https://5sao.ghn.dev) (môi trường staging)
2. Vào tab "Chủ cửa hàng" và copy token
3. Lấy Shop ID từ tài khoản GHN
4. Cập nhật token và shopId trong file `server/services/ghnService.js`

## API Endpoints

### 1. Lấy danh sách dịch vụ vận chuyển

```
POST /api/shipping/services
```

Body:
```json
{
  "fromDistrictId": 1454,  // ID quận/huyện của shop
  "toDistrictId": 1442     // ID quận/huyện của người nhận
}
```

### 2. Tính phí vận chuyển

```
POST /api/shipping/calculate
```

Body:
```json
{
  "serviceId": 53320,       // ID dịch vụ từ API services
  "serviceTypeId": 2,       // Loại dịch vụ (2 = Chuẩn)
  "fromDistrictId": 1454,   // ID quận/huyện của shop
  "fromWardCode": "21012",  // Mã phường/xã của shop
  "toDistrictId": 1442,     // ID quận/huyện của người nhận
  "toWardCode": "21203",    // Mã phường/xã của người nhận
  "weight": 500,            // Khối lượng (gram)
  "length": 15,             // Chiều dài (cm)
  "width": 15,              // Chiều rộng (cm)
  "height": 10,             // Chiều cao (cm)
  "insuranceValue": 200000  // Giá trị bảo hiểm (VND)
}
```

### 3. Tạo đơn vận chuyển (Admin only)

```
POST /api/shipping/orders
```

Body:
```json
{
  "orderId": 123,          // ID đơn hàng trong hệ thống
  "serviceId": 53320,      // ID dịch vụ vận chuyển 
  "serviceTypeId": 2,      // Loại dịch vụ (2 = Chuẩn)
  "requiredNote": "KHONGCHOXEMHANG" // Yêu cầu giao hàng
}
```

### 4. Lấy thông tin đơn vận chuyển

```
GET /api/shipping/orders/:trackingNumber
```

## Components

### 1. GHNShippingCalculator

Component tính phí vận chuyển, có thể sử dụng trong trang giỏ hàng hoặc thanh toán.

```jsx
import GHNShippingCalculator from '../components/shipping/GHNShippingCalculator';

// Trong component của bạn
<GHNShippingCalculator
  selectedDistrict={districtId}
  selectedWard={wardCode}
  onSelectService={(service) => {
    // service.serviceId: ID dịch vụ
    // service.fee: Phí vận chuyển
    // service.serviceName: Tên dịch vụ
  }}
/>
```

### 2. AdminShippingPanel

Component quản lý vận chuyển cho admin, cho phép tạo đơn vận chuyển với GHN.

```jsx
import AdminShippingPanel from './pages/admin/AdminShippingPanel';

// Trong routes của admin
<Route path="/admin/shipping" element={<AdminShippingPanel />} />
```

## Quy trình sử dụng

1. **Trang thanh toán**: Khách hàng chọn địa chỉ giao hàng, hệ thống sử dụng GHNShippingCalculator để tính và hiển thị phí vận chuyển
2. **Quản lý đơn hàng (Admin)**: Sau khi đơn hàng được thanh toán, admin vào trang AdminShippingPanel để tạo đơn vận chuyển GHN
3. **Theo dõi đơn hàng**: Khách hàng có thể theo dõi trạng thái vận chuyển từ GHN thông qua mã tracking được cung cấp

## Lưu ý

1. Cần lưu thông tin chi tiết địa chỉ (quận/huyện, phường/xã) cùng với mã GHN tương ứng để sử dụng cho API
2. Đảm bảo kích thước và cân nặng sản phẩm được cập nhật chính xác trong hệ thống
3. Mã token và shop ID là thông tin nhạy cảm, không nên hard-code trong frontend

## Tài liệu tham khảo

- Tài liệu API GHN: Xem trong thư mục `ghn-api-docs`
- [Trang chủ GHN](https://ghn.vn)
- [Tài khoản khách hàng GHN](https://khachhang.ghn.vn) 