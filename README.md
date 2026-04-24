# 🛒 Cartify

ระบบร้านค้าออนไลน์ที่พัฒนาด้วย React (Vite) และ Express.js + PostgreSQL รองรับการจัดการสินค้า ตะกร้าสินค้า และระบบผู้ใช้งานแบบครบวงจร

## 👥 รายชื่อสมาชิก
ชื่อ-สกุล                  รหัสนักศึกษา
- นางสาวศราสิณี ณ สงขลา    6710525020
- นางสาวปณิตา ชโนวิทย์      6710525012
- นายวรเมธ เผ่าสังข์          6710615268

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- [React](https://react.dev/) + [Vite](https://vitejs.dev/)

### Backend
- [Node.js](https://nodejs.org/) + [Express.js](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) (ผ่าน `pg`)
- [JSON Web Token (JWT)](https://jwt.io/) — ระบบ Authentication
- [bcrypt](https://www.npmjs.com/package/bcrypt) — เข้ารหัสรหัสผ่าน
- [dotenv](https://www.npmjs.com/package/dotenv) — จัดการ Environment Variables
- [cors](https://www.npmjs.com/package/cors) — จัดการ Cross-Origin Resource Sharing

## ⚙️ วิธีติดตั้ง (Installation)

### ข้อกำหนดเบื้องต้น
- Node.js >= 18
- PostgreSQL >= 14
- npm หรือ yarn

### 1. Clone โปรเจกต์

```bash
git clone https://github.com/your-username/cartify.git
cd cartify
```

### 2. ติดตั้ง Backend

```bash
cd backend
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/` และกำหนดค่าดังนี้:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=cartify
JWT_SECRET=your_jwt_secret
```

### 3. ติดตั้ง Frontend

```bash
cd ../frontend
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ `frontend/` และกำหนดค่าดังนี้:

```env
VITE_API_URL=http://localhost:5000
```

---

## 🚀 วิธีรันระบบ (Running the Application)

### รัน Backend

```bash
cd backend

# โหมด Production
npm start

# โหมด Development (auto-reload)
npm run dev
```

Backend จะรันที่ `http://localhost:5000`

### รัน Frontend

```bash
cd frontend
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

---

## 📁 โครงสร้างโปรเจกต์

```
cartify/
├── backend/
│   ├── src/
│   │   └── app.js
│   ├── package.json
│   └── .env
└── frontend/
    ├── src/
    ├── package.json
    └── .env
```
