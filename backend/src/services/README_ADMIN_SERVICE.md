# Admin Service - Refactoring Documentation

## Tổng quan

Admin module đã được refactor theo kiến trúc chuẩn của project:

```
routes -> controller -> service -> model
```

## Cấu trúc mới

### 1. adminService.js (Business Logic Layer)

**Location:** `backend/src/services/adminService.js`

**Responsibilities:**
- Xử lý toàn bộ business logic
- Tương tác trực tiếp với Sequelize models
- Validate dữ liệu
- Throw errors với message rõ ràng

**Functions:**

#### getDashboardStats()
```javascript
// Lấy thống kê dashboard
// Returns: { overview, accounts, atRisk }
```

#### getAtRiskStudents(currentSemester)
```javascript
// Tính toán số sinh viên nguy cơ theo học kỳ
// Returns: { safe, warning, danger }
```

#### getAllUsers(filters, pagination)
```javascript
// Lấy danh sách users với filter và pagination
// Params:
//   - filters: { role, search }
//   - pagination: { page, limit }
// Returns: { users, pagination }
```

#### createUser(userData)
```javascript
// Tạo user mới
// Params: { email, password, role, first_name, last_name }
// Validates: email uniqueness
// Returns: user object (without password)
// Throws: Error if email exists
```

#### updateUser(userId, updateData)
```javascript
// Cập nhật user
// Params: { role, first_name, last_name }
// Returns: updated user object
// Throws: Error if user not found
```

#### deleteUser(userId)
```javascript
// Xóa user
// Validates: không có dữ liệu liên kết
// Returns: success message
// Throws: Error if user not found or has related data
```

### 2. adminController.js (Request/Response Layer)

**Location:** `backend/src/controllers/adminController.js`

**Responsibilities:**
- Xử lý HTTP request/response
- Parse request parameters
- Call service functions
- Handle errors và return appropriate HTTP status codes
- Format response theo chuẩn API

**Error Handling Pattern:**
```javascript
try {
  const result = await adminService.someFunction(params);
  res.json({ success: true, data: result });
} catch (error) {
  if (error.message === 'Specific Error') {
    return res.status(400).json({
      success: false,
      error: 'ERROR_CODE',
      message: error.message
    });
  }
  res.status(500).json({
    success: false,
    error: 'SERVER_ERROR',
    message: 'Generic error message'
  });
}
```

## So sánh Before/After

### Before (Old Architecture)
```javascript
// adminController.js
const getDashboard = async (req, res) => {
  try {
    // ❌ Business logic trực tiếp trong controller
    const totalStudents = await Student.count();
    const totalLecturers = await Lecturer.count();
    // ... nhiều queries

    // ❌ Complex logic trong controller
    const predictions = await PredictionHistory.findAll({...});
    const latestPredictions = {};
    predictions.forEach(pred => {...});

    res.json({ success: true, data: {...} });
  } catch (error) {
    res.status(500).json({...});
  }
};
```

### After (New Architecture)
```javascript
// adminController.js
const getDashboard = async (req, res) => {
  try {
    // ✅ Chỉ gọi service
    const stats = await adminService.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({...});
  }
};

// adminService.js
const getDashboardStats = async () => {
  // ✅ Business logic ở service layer
  const totalStudents = await Student.count();
  const totalLecturers = await Lecturer.count();
  const atRiskStats = await getAtRiskStudents(currentSemester);

  return { overview, accounts, atRisk };
};
```

## Lợi ích của Refactoring

### 1. Separation of Concerns
- Controller: HTTP layer
- Service: Business logic
- Model: Data layer

### 2. Reusability
- Service functions có thể được sử dụng ở nhiều nơi
- Dễ dàng test riêng từng layer

### 3. Maintainability
- Code dễ đọc, dễ hiểu
- Dễ dàng thêm features mới
- Dễ dàng fix bugs

### 4. Testability
- Unit test service functions độc lập
- Mock service trong controller tests
- Integration tests rõ ràng hơn

### 5. Consistency
- Theo chuẩn của project (authService, studentService, etc.)
- Coding style thống nhất

## API Endpoints (Không thay đổi)

### GET /api/v1/admin/dashboard
- Lấy thống kê dashboard
- Response format: giữ nguyên

### GET /api/v1/admin/users
- Lấy danh sách users
- Query params: role, search, page, limit
- Response format: giữ nguyên

### POST /api/v1/admin/users
- Tạo user mới
- Body: { email, password, role, first_name, last_name }
- Response format: giữ nguyên

### PUT /api/v1/admin/users/:id
- Cập nhật user
- Body: { role, first_name, last_name }
- Response format: giữ nguyên

### DELETE /api/v1/admin/users/:id
- Xóa user
- Response format: giữ nguyên

## Testing

Backend đã được test và hoạt động tốt:
- ✅ Dashboard API: Status 200/304
- ✅ Users API: Status 200/304
- ✅ Frontend không bị ảnh hưởng
- ✅ Response format giữ nguyên

## Best Practices Applied

1. **Error Handling**: Throw errors với message rõ ràng
2. **Password Security**: Sử dụng bcrypt với salt
3. **Data Validation**: Check email uniqueness, related data
4. **Clean Code**: Functions nhỏ, single responsibility
5. **Documentation**: JSDoc comments cho mỗi function
6. **Consistent Naming**: Theo convention của project

## Future Improvements

1. Add input validation middleware
2. Add unit tests cho service layer
3. Add integration tests
4. Add logging service
5. Add caching layer cho dashboard stats
6. Add rate limiting cho user creation

## Migration Notes

- ✅ Không có breaking changes
- ✅ Frontend không cần thay đổi
- ✅ Database schema không thay đổi
- ✅ API routes không thay đổi
- ✅ Response format không thay đổi

## Conclusion

Refactoring thành công với:
- Clean architecture
- Better code organization
- Improved maintainability
- Production-ready code
- Zero downtime migration
