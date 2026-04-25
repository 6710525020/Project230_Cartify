-- 1. Admin
INSERT INTO Admin (aname, password) VALUES
('admin2@gmail.com', '$2a$10$exampleHashedPassword2222222222222222222222222');

-- 2. Manager
INSERT INTO Manager (mname, email, password) VALUES
('Manager2', 'manager2@gmail.com', '$2a$10$exampleHashedPassword4444444444444444444444444');

-- 3. Customer
-- หมายเหตุ : ข้อมมูลส่วนของลูกค้าได้ถูกแอดลงไปแล้วเพื่อไม่ให้เกิดปัญหาซ้ำซ้อนจะขอเขียนเป็น comment ไว้ค่ะ
-- INSERT INTO Customer (cname, email, password, address, phone_number) VALUES
-- ('สมชาย ใจดี',    'somchai@example.com',   '$2a$10$exampleHashedPassword5555555555555555555555555', '123 ถ.พหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900',  '0811111111'),
-- ('สมหญิง รักไทย', 'somying@example.com',   '$2a$10$exampleHashedPassword6666666666666666666666666', '456 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110',  '0822222222'),
-- ('อนุชา แสงทอง',  'anucha@example.com',    '$2a$10$exampleHashedPassword7777777777777777777777777', '789 ถ.นิมมานเหมินทร์ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200', '0833333333'),
-- ('วิภา ดีงาม',    'wipa@example.com',      '$2a$10$exampleHashedPassword8888888888888888888888888', '321 ถ.ราชดำเนิน ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000',     '0844444444'),
-- ('ธนพล มั่งมี',   'thanaphon@example.com', '$2a$10$exampleHashedPassword9999999999999999999999999', '654 ถ.ท่าแพ ต.ช้างคลาน อ.เมือง จ.เชียงใหม่ 50300',      '0855555555');

-- 4. Product
-- หมายเหตุ: product_id 2–10 ถูก INSERT ไว้แล้วใน init_database.sql
--
--   product_id | pname
--   -----------+--------------------------------------------
--            2 | รองเท้าลำลองผู้ใหญ่ CLASSIC CLOG   (1,290 ฿)
--            3 | รองเท้าลำลองผู้ใหญ่ CRUSH CLOG     (1,490 ฿)
--            4 | เสื้อเชิ้ตผ้าลินิน                  (  790 ฿)
--            5 | ชุดเดรสสายรัดแบบมีการจับย่น          (  990 ฿)
--            6 | กางเกงขาสั้นปักลาย JERME WHITE      (  890 ฿)
--            7 | หมวกแก๊ป LOVE IVORY                 (  590 ฿)
--            8 | กระเป๋า JOLI M SHOULDER BAG         (2,490 ฿)
--            9 | กำไลข้อมือ NADIA                    (1,290 ฿)
--           10 | กระเป๋าถือ Rosis Infinite Tote      (3,290 ฿)


-- 5. Order
INSERT INTO "Order" (customer_id, admin_id, order_date, status, total_price, delivery_address, payment_method) VALUES
-- Order 1:
((SELECT customer_id FROM Customer WHERE email = 'somchai@example.com'),
 (SELECT admin_id FROM Admin WHERE aname = 'admin@gmail.com'),
 '2026-04-01', 'delivered', 2770.00,
 '123 ถ.พหลโยธิน แขวงลาดยาว เขตจตุจักร กรุงเทพฯ 10900', 'debit'),

-- Order 2:
((SELECT customer_id FROM Customer WHERE email = 'somying@example.com'),
 (SELECT admin_id FROM Admin WHERE aname = 'admin@gmail.com'),
 '2026-04-05', 'delivered', 5270.00,
 '456 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110', 'debit'),

-- Order 3:
((SELECT customer_id FROM Customer WHERE email = 'anucha@example.com'),
 (SELECT admin_id FROM Admin WHERE aname = 'admin2@gmail.com'),
 '2026-04-10', 'shipping_in_progress', 1780.00,
 '789 ถ.นิมมานเหมินทร์ ต.สุเทพ อ.เมือง จ.เชียงใหม่ 50200', 'cod'),

-- Order 4:
((SELECT customer_id FROM Customer WHERE email = 'wipa@example.com'),
 NULL,
 '2026-04-15', 'payment_completed', 3290.00,
 '321 ถ.ราชดำเนิน ต.ในเมือง อ.เมือง จ.ขอนแก่น 40000', 'debit'),

-- Order 5:
((SELECT customer_id FROM Customer WHERE email = 'thanaphon@example.com'),
 NULL,
 '2026-04-20', 'pending', 1480.00,
 '654 ถ.ท่าแพ ต.ช้างคลาน อ.เมือง จ.เชียงใหม่ 50300', 'cod'),

-- Order 6:
((SELECT customer_id FROM Customer WHERE email = 'somying@example.com'),
 (SELECT admin_id FROM Admin WHERE aname = 'admin@gmail.com'),
 '2026-04-22', 'payment_completed', 2490.00,
 '456 ถ.สุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพฯ 10110', 'debit');

-- 6. OrderItem
-- Order 1:
INSERT INTO OrderItem (order_id, product_id, count)
SELECT o.order_id, p.product_id, 1
FROM "Order" o, Product p
WHERE o.order_date = '2026-04-01'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somchai@example.com')
  AND p.product_id IN (2, 7, 6);

-- Order 2:
INSERT INTO OrderItem (order_id, product_id, count)
SELECT o.order_id, p.product_id, 1
FROM "Order" o, Product p
WHERE o.order_date = '2026-04-05'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somying@example.com')
  AND p.product_id IN (3, 8, 9);

-- Order 3:
INSERT INTO OrderItem (order_id, product_id, count)
SELECT o.order_id, p.product_id, 1
FROM "Order" o, Product p
WHERE o.order_date = '2026-04-10'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'anucha@example.com')
  AND p.product_id IN (4, 5);

-- Order 4:
INSERT INTO OrderItem (order_id, product_id, count)
SELECT o.order_id, 10, 1
FROM "Order" o
WHERE o.order_date = '2026-04-15'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'wipa@example.com');

-- Order 5:
INSERT INTO OrderItem (order_id, product_id, count)
SELECT o.order_id, p.product_id, 1
FROM "Order" o, Product p
WHERE o.order_date = '2026-04-20'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'thanaphon@example.com')
  AND p.product_id IN (6, 7);

-- Order 6:
INSERT INTO OrderItem (order_id, product_id, count)
SELECT o.order_id, 8, 1
FROM "Order" o
WHERE o.order_date = '2026-04-22'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somying@example.com');

-- 7. Payment
INSERT INTO Payment (order_id, admin_id, amount, payment_method, slip_attachment, payment_date)
SELECT o.order_id,
       (SELECT admin_id FROM Admin WHERE aname = 'admin@gmail.com'),
       2770.00, 'promptpay', 'slip_order1.jpg', '2026-04-01'
FROM "Order" o
WHERE o.order_date = '2026-04-01'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somchai@example.com');

INSERT INTO Payment (order_id, admin_id, amount, payment_method, slip_attachment, payment_date)
SELECT o.order_id,
       (SELECT admin_id FROM Admin WHERE aname = 'admin@gmail.com'),
       5270.00, 'bank_transfer', 'slip_order2.jpg', '2026-04-05'
FROM "Order" o
WHERE o.order_date = '2026-04-05'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somying@example.com');

INSERT INTO Payment (order_id, admin_id, amount, payment_method, slip_attachment, payment_date)
SELECT o.order_id,
       (SELECT admin_id FROM Admin WHERE aname = 'admin2@gmail.com'),
       1780.00, 'cash', NULL, '2026-04-10'
FROM "Order" o
WHERE o.order_date = '2026-04-10'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'anucha@example.com');

INSERT INTO Payment (order_id, admin_id, amount, payment_method, slip_attachment, payment_date)
SELECT o.order_id,
       (SELECT admin_id FROM Admin WHERE aname = 'admin@gmail.com'),
       3290.00, 'credit_card', 'slip_order4.jpg', '2026-04-15'
FROM "Order" o
WHERE o.order_date = '2026-04-15'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'wipa@example.com');

INSERT INTO Payment (order_id, admin_id, amount, payment_method, slip_attachment, payment_date)
SELECT o.order_id,
       (SELECT admin_id FROM Admin WHERE aname = 'admin@gmail.com'),
       2490.00, 'promptpay', 'slip_order6.jpg', '2026-04-22'
FROM "Order" o
WHERE o.order_date = '2026-04-22'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somying@example.com');

-- 8. Cart & CartItem
INSERT INTO Cart (customer_id, created_at) VALUES
((SELECT customer_id FROM Customer WHERE email = 'wipa@example.com'),      NOW()),
((SELECT customer_id FROM Customer WHERE email = 'thanaphon@example.com'), NOW());

-- Cart 1 
INSERT INTO CartItem (cart_id, product_id, quantity)
SELECT c.cart_id, 10, 1
FROM Cart c WHERE c.customer_id = (SELECT customer_id FROM Customer WHERE email = 'wipa@example.com');

INSERT INTO CartItem (cart_id, product_id, quantity)
SELECT c.cart_id, 9, 1
FROM Cart c WHERE c.customer_id = (SELECT customer_id FROM Customer WHERE email = 'wipa@example.com');

-- Cart 2
INSERT INTO CartItem (cart_id, product_id, quantity)
SELECT c.cart_id, 5, 1
FROM Cart c WHERE c.customer_id = (SELECT customer_id FROM Customer WHERE email = 'thanaphon@example.com');

INSERT INTO CartItem (cart_id, product_id, quantity)
SELECT c.cart_id, 8, 1
FROM Cart c WHERE c.customer_id = (SELECT customer_id FROM Customer WHERE email = 'thanaphon@example.com');

-- 9. Report
INSERT INTO Report (order_id, report_date, report_type)
SELECT o.order_id, '2026-04-02', 'delivery_report'
FROM "Order" o WHERE o.order_date = '2026-04-01'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somchai@example.com');

INSERT INTO Report (order_id, report_date, report_type)
SELECT o.order_id, '2026-04-06', 'delivery_report'
FROM "Order" o WHERE o.order_date = '2026-04-05'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somying@example.com');

INSERT INTO Report (order_id, report_date, report_type)
SELECT o.order_id, '2026-04-03', 'payment_report'
FROM "Order" o WHERE o.order_date = '2026-04-01'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somchai@example.com');

INSERT INTO Report (order_id, report_date, report_type)
SELECT o.order_id, '2026-04-06', 'payment_report'
FROM "Order" o WHERE o.order_date = '2026-04-05'
  AND o.customer_id = (SELECT customer_id FROM Customer WHERE email = 'somying@example.com');

-- 10. Manager_Report
INSERT INTO Manager_Report (manager_id, report_id) VALUES
(1, (SELECT report_id FROM Report WHERE report_type = 'delivery_report' AND report_date = '2026-04-02')),
(1, (SELECT report_id FROM Report WHERE report_type = 'delivery_report' AND report_date = '2026-04-06')),
(2, (SELECT report_id FROM Report WHERE report_type = 'payment_report'  AND report_date = '2026-04-03')),
(2, (SELECT report_id FROM Report WHERE report_type = 'payment_report'  AND report_date = '2026-04-06'));

-- ตรวจสอบข้อมูล
SELECT 'Admin'          AS "Table", COUNT(*) AS "Rows" FROM Admin
UNION ALL SELECT 'Manager',          COUNT(*) FROM Manager
UNION ALL SELECT 'Customer',         COUNT(*) FROM Customer
UNION ALL SELECT 'Product',          COUNT(*) FROM Product
UNION ALL SELECT '"Order"',          COUNT(*) FROM "Order"
UNION ALL SELECT 'OrderItem',        COUNT(*) FROM OrderItem
UNION ALL SELECT 'Payment',          COUNT(*) FROM Payment
UNION ALL SELECT 'Cart',             COUNT(*) FROM Cart
UNION ALL SELECT 'CartItem',         COUNT(*) FROM CartItem
UNION ALL SELECT 'Report',           COUNT(*) FROM Report
UNION ALL SELECT 'Manager_Report',   COUNT(*) FROM Manager_Report;