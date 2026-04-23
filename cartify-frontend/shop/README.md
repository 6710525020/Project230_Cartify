## Cartify Frontend - Project CN230
## โครงสร้างโปรเจกต์

```
shop/
├── src/
│   ├── services/
│   │   └── api.js              ← ตัวกลางเชื่อมต่อ Backend ทั้งหมด
│   ├── context/
│   │   ├── AuthContext.jsx     ← จัดการ Auth / Token / User
│   │   └── CartContext.jsx     ← จัดการตะกร้าสินค้า
│   ├── components/
│   │   ├── UI.jsx              ← Component ร่วม (Button, Input, Modal, Table ฯลฯ)
│   │   ├── Navbar.jsx
│   │   ├── ProductCard.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/
│   │   ├── HomePage.jsx        ← หน้าแรก
│   │   ├── ProductsPage.jsx    ← รายการสินค้า + ค้นหา
│   │   ├── ProductDetailPage.jsx
│   │   ├── AuthPage.jsx        ← Login + Register
│   │   ├── CartPage.jsx        ← ตะกร้า + Checkout
│   │   ├── OrdersPage.jsx      ← ประวัติคำสั่งซื้อ (ลูกค้า)
│   │   ├── StaffPage.jsx       ← จัดการคำสั่งซื้อ (พนักงาน)
│   │   ├── AdminPage.jsx       ← จัดการสินค้า/ลูกค้า (Admin)
│   │   └── ManagerPage.jsx     ← รายงานและวิเคราะห์ (ผู้จัดการ)
│   ├── App.jsx                 ← Routing ทั้งหมด
│   └── main.jsx
├── .env.example
├── vite.config.js
└── package.json
```