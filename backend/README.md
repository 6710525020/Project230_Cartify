## Cartify Backend - Project CN230
## โครงสร้างไฟล์

```
backend/
├── src/
│   ├── app.js                  # Entry point, ตั้งค่า Express และ middleware
│   ├── db/
│   │   └── database.js         # เชื่อมต่อ PostgreSQL และสร้าง schema
│   ├── controllers/            # Business logic แยกตาม resource
│   │   ├── adminController.js
│   │   ├── analyticsController.js
│   │   ├── cartController.js
│   │   ├── customerController.js
│   │   ├── employeeController.js
│   │   ├── managerController.js
│   │   ├── orderController.js
│   │   ├── paymentController.js
│   │   ├── productController.js
│   │   └── reportController.js
│   ├── routes/                 # กำหนด API endpoints
│   │   ├── adminRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── cartRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── managerRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── productRoutes.js
│   │   └── reportRoutes.js
│   └── middleware/
│       ├── auth.js             # JWT authentication และ role-based access
│       └── errorHandler.js     # Global error handler
├── .env                        # Environment variables (ไม่ commit)
├── package.json
└── README.md
```

## Database Schema

| ตาราง | คำอธิบาย |
|-------|----------|
| `Admin` | ผู้ดูแลระบบ จัดการออเดอร์และสินค้า |
| `Manager` | ผู้จัดการ ดูรายงานและวิเคราะห์ข้อมูล |
| `Employee` | พนักงาน ดูแลการชำระเงิน |
| `Customer` | ลูกค้า สมัครสมาชิกและสั่งซื้อสินค้า |
| `Product` | สินค้า มีชื่อ ราคา stock และรูปภาพ |
| `Order` | คำสั่งซื้อ เชื่อมกับ Customer และ Admin |
| `OrderItem` | รายการสินค้าในแต่ละออเดอร์ |
| `Payment` | การชำระเงิน รองรับหลายช่องทาง |
| `Cart` | ตะกร้าสินค้าของลูกค้า |
| `CartItem` | สินค้าในตะกร้า |
| `Report` | รายงานที่ผูกกับออเดอร์ |
| `Manager_Report` | ความสัมพันธ์ Manager กับ Report |

**Roles ที่มีในระบบ:**
- `customer` — สั่งซื้อสินค้า จัดการตะกร้า และดูออเดอร์ของตัวเอง
- `admin` — จัดการสินค้า ออเดอร์ และดูรายงาน
- `manager` — ดูรายงานและวิเคราะห์ข้อมูล

## Payment Methods
รองรับช่องทางการชำระเงิน:
- `cash` — เก็บเงินปลายทาง (COD)
- `credit_card` — บัตรเครดิต
- `promptpay` — พร้อมเพย์ (ต้องแนบสลิป)