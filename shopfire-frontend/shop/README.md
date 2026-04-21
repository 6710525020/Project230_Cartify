# 🔥 ShopFire — Frontend

เว็บไซต์ E-commerce ระบบ Multi-role สร้างด้วย React + Vite + Tailwind CSS  
โทนสีแดง-ส้ม-ทอง ดีไซน์เรียบหรู พร้อมเชื่อมต่อ Backend ได้ทันที

---

## 📁 โครงสร้างโปรเจกต์

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

---

## 🚀 วิธีรันเว็บไซต์

### 1. ติดตั้ง Node.js
ต้องมี Node.js เวอร์ชัน 18 ขึ้นไป: https://nodejs.org

### 2. ติดตั้ง Dependencies
```bash
cd shop
npm install
```

### 3. ตั้งค่า Environment Variable
```bash
cp .env.example .env
```
จากนั้นแก้ไขไฟล์ `.env`:
```
VITE_API_URL=http://localhost:8000/api
```
> เปลี่ยน `http://localhost:8000` ให้ตรงกับ URL ของ Backend คุณ

### 4. รันในโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ที่ → http://localhost:3000

### 5. Build สำหรับ Production
```bash
npm run build
npm run preview   # ทดสอบ production build
```

---

## 🔌 วิธีเชื่อมต่อกับ Backend

### ไฟล์หลัก: `src/services/api.js`

ไฟล์นี้เป็นตัวกลางทั้งหมด ใช้ axios ส่ง HTTP request ไปยัง Backend

```js
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'
```

### Token Authentication
Frontend เก็บ JWT Token ใน `localStorage` ชื่อ `token`  
ทุก Request จะแนบ Header `Authorization: Bearer <token>` โดยอัตโนมัติ

---

## 📋 API Endpoints ที่ Frontend เรียกใช้

Backend ต้องรองรับ endpoints ตามนี้:

### 🔐 Auth
| Method | Endpoint          | Body / Params               | Response                       |
|--------|-------------------|-----------------------------|--------------------------------|
| POST   | `/api/auth/register` | `{ name, email, password }` | `{ token, user: { _id, name, email, role } }` |
| POST   | `/api/auth/login`    | `{ email, password }`       | `{ token, user }`             |
| POST   | `/api/auth/logout`   | -                           | `{}`                           |
| GET    | `/api/auth/me`       | -                           | `{ _id, name, email, role }`  |

**User roles ที่รองรับ:** `customer`, `staff`, `admin`, `manager`

---

### 🛍️ Products
| Method | Endpoint              | Body / Params                                | Response                        |
|--------|-----------------------|----------------------------------------------|---------------------------------|
| GET    | `/api/products`       | `?q=&category=&sort=&page=&limit=`           | `{ products: [...], total }`   |
| GET    | `/api/products/:id`   | -                                            | `{ _id, name, price, ... }`    |
| GET    | `/api/products/categories` | -                                       | `["อิเล็กทรอนิกส์", ...]`     |
| POST   | `/api/products`       | `{ name, description, price, stock, category, image }` | Product object |
| PUT    | `/api/products/:id`   | (เหมือน POST)                               | Product object                  |
| DELETE | `/api/products/:id`   | -                                            | `{}`                            |

**Product Object:**
```json
{
  "_id": "...",
  "name": "ชื่อสินค้า",
  "description": "รายละเอียด",
  "price": 1200,
  "stock": 50,
  "category": "อิเล็กทรอนิกส์",
  "image": "https://...",
  "rating": 4.5,
  "reviewCount": 128,
  "originalPrice": 1500
}
```

---

### 🛒 Cart
| Method | Endpoint              | Body                              | Response              |
|--------|-----------------------|-----------------------------------|-----------------------|
| GET    | `/api/cart`           | -                                 | `{ items: [...] }`   |
| POST   | `/api/cart/items`     | `{ productId, quantity }`         | Cart object          |
| PUT    | `/api/cart/items/:id` | `{ quantity }`                    | Cart object          |
| DELETE | `/api/cart/items/:id` | -                                 | `{}`                  |
| DELETE | `/api/cart`           | -                                 | `{}`                  |

**Cart Item Object:**
```json
{
  "_id": "itemId",
  "productId": "...",
  "name": "ชื่อสินค้า",
  "price": 1200,
  "quantity": 2,
  "image": "https://..."
}
```

---

### 📦 Orders
| Method | Endpoint                  | Body / Params                        | Response                      |
|--------|---------------------------|--------------------------------------|-------------------------------|
| POST   | `/api/orders`             | `{ items, shippingAddress }`         | Order object                 |
| GET    | `/api/orders/me`          | -                                    | `{ orders: [...] }`          |
| GET    | `/api/orders/:id`         | -                                    | Order object                 |
| GET    | `/api/orders`             | `?status=&page=&limit=`              | `{ orders: [...], total }`   |
| PUT    | `/api/orders/:id/confirm` | -                                    | Order object                 |
| PUT    | `/api/orders/:id/status`  | `{ status, trackingNumber? }`        | Order object                 |

**Order Status Values:** `pending`, `confirmed`, `processing`, `shipped`, `delivered`, `cancelled`

**Order Object:**
```json
{
  "_id": "...",
  "status": "pending",
  "total": 2400,
  "items": [{ "name": "...", "price": 1200, "quantity": 2 }],
  "shippingAddress": {
    "name": "สมชาย ใจดี",
    "phone": "0812345678",
    "address": "123 ถ.สุขุมวิท",
    "city": "กรุงเทพฯ"
  },
  "trackingNumber": "EX1234567890TH",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### 👥 Customers (Admin)
| Method | Endpoint               | Body / Params | Response                       |
|--------|------------------------|---------------|--------------------------------|
| GET    | `/api/customers`       | `?page=&limit=` | `{ customers: [...], total }` |
| GET    | `/api/customers/:id`   | -             | Customer object               |
| PUT    | `/api/customers/:id`   | `{ name, ... }` | Customer object             |
| DELETE | `/api/customers/:id`   | -             | `{}`                          |

---

### 📊 Reports (Manager)
| Method | Endpoint                  | Params         | Response                         |
|--------|---------------------------|----------------|----------------------------------|
| GET    | `/api/reports/sales`      | `?period=month` | `{ totalRevenue, totalOrders, chart: [...] }` |
| GET    | `/api/reports/products`   | `?period=`     | `{ total, topProducts, categories }` |
| GET    | `/api/reports/customers`  | `?period=`     | `{ total, newThisMonth, returning, returnRate, avgOrderValue, chart }` |

**Sales Chart Item:**
```json
{ "name": "ม.ค.", "ยอดขาย": 48000, "คำสั่งซื้อ": 32 }
```

---

## ⚙️ การตั้งค่า CORS บน Backend

Backend ต้องอนุญาต CORS จาก Frontend:

**Node.js / Express:**
```js
const cors = require('cors')
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

**Django:**
```python
CORS_ALLOWED_ORIGINS = ["http://localhost:3000"]
CORS_ALLOW_CREDENTIALS = True
```

**FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)
```

---

## 🌐 Deploy บน Production

### Frontend (Vercel / Netlify)
```bash
npm run build
# อัปโหลดโฟลเดอร์ dist/
```
ตั้งค่า Environment Variable บนแพลตฟอร์ม:
```
VITE_API_URL=https://your-backend.com/api
```

### Nginx (Self-host)
```nginx
server {
  listen 80;
  root /var/www/shop/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /api {
    proxy_pass http://localhost:8000;
    proxy_set_header Host $host;
  }
}
```

---

## 🎨 ระบบสีและ Font

| ชื่อ         | ค่า          | ใช้งาน        |
|-------------|--------------|--------------|
| Fire Red    | `#c2410c`   | Primary, CTA |
| Fire Orange | `#f97316`   | Accent       |
| Gold        | `#fbbf24`   | Highlight    |
| Background  | `#0c0a09`   | Dark bg      |
| Font Display | Playfair Display | หัวข้อ   |
| Font Body   | DM Sans      | เนื้อหา      |

---

## 🔒 Role-Based Access Control

| Role       | เข้าถึงได้               |
|------------|--------------------------|
| `customer` | /, /products, /cart, /orders |
| `staff`    | /staff (จัดการ order)    |
| `admin`    | /admin (สินค้า/ลูกค้า), /staff |
| `manager`  | /manager (รายงาน)        |

Backend ต้องส่ง field `role` ใน user object เสมอ
