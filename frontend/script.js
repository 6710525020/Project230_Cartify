/* ==================================================
PACK API A
script.js
Cartify Frontend -> Backend Connected
API BASE = http://localhost:8000
================================================== */

const API = "http://localhost:8000/api";

/* ===============================
HELPERS
=============================== */
function saveToken(token){
localStorage.setItem("token", token);
}

function getToken(){
return localStorage.getItem("token");
}

function logout(){
localStorage.removeItem("token");
localStorage.removeItem("user");
location.href = "login.html";
}

function authHeaders(){
return {
"Content-Type":"application/json",
"Authorization":"Bearer " + getToken()
};
}

/* ===============================
REGISTER
register.html
=============================== */
async function registerUser(){

const username = document.getElementById("username").value;
const email = document.getElementById("email").value;
const password = document.getElementById("password").value;

const res = await fetch(API + "/auth/register",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
name:username,
email:email,
password:password
})
});

const data = await res.json();

if(data.token){
  alert("Register Success");
  location.href="login.html";
}else{
  alert(data.error || "Register Failed");
}
}

/* ===============================
LOGIN
login.html
=============================== */
async function loginUser(){

const email = document.getElementById("username").value;
const password = document.getElementById("password").value;

const res = await fetch(API + "/auth/login",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify({
email:email,
password:password
})
});

const data = await res.json();

if(data.token){
saveToken(data.token);
localStorage.setItem("user", JSON.stringify(data.user || {}));
alert("Login Success");
location.href="index.html";
}else{
alert(data.error || "Login Failed");
}

}

/* ===============================
LOAD PRODUCTS
index.html / shop.html
=============================== */
async function loadProducts(targetId="product-list"){

const wrap = document.getElementById(targetId);
if(!wrap) return;

const res = await fetch(API + "/products");
const products = await res.json();

wrap.innerHTML = "";

products.forEach(p=>{

wrap.innerHTML += `
<div class="card">
<img src="${p.image || 'https://via.placeholder.com/400'}">
<div class="card-body">
<h3>${p.pname}</h3>
<div class="price">฿${p.price}</div>

<button class="icon-btn"
onclick="addToCart(${p.product_id})">
🛒
</button>
</div>
</div>
`;

});

}

/* ===============================
ADD TO CART
(local cart temp)
=============================== */
function addToCart(id){

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const found = cart.find(x=>x.product_id == id);

if(found){
found.qty += 1;
}else{
cart.push({
product_id:id,
qty:1
});
}

localStorage.setItem("cart", JSON.stringify(cart));

alert("Added to Cart");

}

/* ===============================
RENDER CART
cart.html
=============================== */
async function renderCart(){

const wrap = document.getElementById("cart-items");
const totalEl = document.getElementById("total");

if(!wrap) return;

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const res = await fetch(API + "/products");
const products = await res.json();

wrap.innerHTML = "";
let total = 0;

cart.forEach(item=>{

const p = products.find(x=>x.product_id == item.product_id);
if(!p) return;

const sum = p.price * item.qty;
total += sum;

wrap.innerHTML += `
<div class="cart-item">

<img src="${p.image || 'https://via.placeholder.com/200'}">

<div class="cart-info">
<h3>${p.pname}</h3>
<div class="price">฿${p.price}</div>

<div class="cart-actions">

<button onclick="minusQty(${item.product_id})">-</button>

<span>${item.qty}</span>

<button onclick="plusQty(${item.product_id})">+</button>

<button onclick="removeCart(${item.product_id})">x</button>

</div>
</div>
</div>
`;

});

if(totalEl) totalEl.innerText = total;

}

/* ===============================
CART BUTTONS
=============================== */
function plusQty(id){

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const item = cart.find(x=>x.product_id == id);

if(item) item.qty++;

localStorage.setItem("cart", JSON.stringify(cart));
renderCart();
}

function minusQty(id){

let cart = JSON.parse(localStorage.getItem("cart")) || [];
const item = cart.find(x=>x.product_id == id);

if(item && item.qty > 1) item.qty--;

localStorage.setItem("cart", JSON.stringify(cart));
renderCart();
}

function removeCart(id){

let cart = JSON.parse(localStorage.getItem("cart")) || [];
cart = cart.filter(x=>x.product_id != id);

localStorage.setItem("cart", JSON.stringify(cart));
renderCart();
}

/* ===============================
CHECKOUT
=============================== */
async function checkout(){

const cart = JSON.parse(localStorage.getItem("cart")) || [];

if(cart.length == 0){
alert("Cart Empty");
return;
}

// Get payment information
const address = document.getElementById("address")?.value || "";
const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "debit";

if(!address.trim()){
alert("Please enter a delivery address");
return;
}

// Prepare order data
const orderData = {
items: cart,
address: address,
paymentMethod: paymentMethod
};

// Add card details if paying by debit
if(paymentMethod === "debit"){
const cardName = document.getElementById("cardName")?.value || "";
const cardNumber = document.getElementById("cardNumber")?.value || "";
const cardExpiry = document.getElementById("cardExpiry")?.value || "";
const cardCVV = document.getElementById("cardCVV")?.value || "";

if(!cardName || !cardNumber || !cardExpiry || !cardCVV){
alert("Please fill in all card details");
return;
}

orderData.cardInfo = {
cardName: cardName,
cardNumber: cardNumber.slice(-4), // Only store last 4 digits
cardExpiry: cardExpiry,
cardCVV: cardCVV
};
}

const res = await fetch(API + "/orders",{
method:"POST",
headers:authHeaders(),
body:JSON.stringify(orderData)
});

const data = await res.json();

alert(data.message || "Order Success");

localStorage.removeItem("cart");

location.href="history.html";

}

/* ===============================
ORDER HISTORY
=============================== */
async function loadHistory(){

const wrap = document.getElementById("history-body");
if(!wrap) return;

const res = await fetch(API + "/orders",{
headers:authHeaders()
});

const rows = await res.json();

wrap.innerHTML = "";

rows.forEach(r=>{

wrap.innerHTML += `
<tr>
<td>${r.order_id}</td>
<td>${r.order_date}</td>
<td>฿${r.total_price}</td>
<td>${r.status}</td>
</tr>
`;

});

}

/* ===============================
LOAD ORDERS (for history.html)
=============================== */
async function loadOrders(){

const wrap = document.getElementById("orders-list");
if(!wrap) return;

const res = await fetch(API + "/orders",{
headers:authHeaders()
});

const rows = await res.json();

wrap.innerHTML = "";

rows.forEach(r=>{

wrap.innerHTML += `
<tr>
<td>${r.order_id}</td>
<td>${r.order_date}</td>
<td>฿${r.total_price}</td>
<td>${r.status}</td>
</tr>
`;

});

}

/* ===============================
AUTO RUN
=============================== */
window.onload = ()=>{

loadProducts("product-list");
renderCart();
loadHistory();

};