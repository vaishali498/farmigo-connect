🌾 Farmigo Connect — Farmers Marketplace

A digital platform connecting farmers directly to buyers — eliminating middlemen, ensuring fair prices, and bringing fresh produce to everyone.

🚀 Live URLs
ServiceURL🌐 Frontendhttps://farmigo-connect.vercel.app
⚙️ Backend APIhttps://farmigo-backend-5w4i.onrender.com
🗄️ DatabaseMongoDB Atlas (Cloud)

📌 About The Project
Farmigo Connect is a full-stack web application built as a college major project. It digitally transforms the agricultural supply chain by:

Allowing farmers (sellers) to list their produce directly online
Allowing buyers to browse, search, and purchase fresh farm products
Providing real-time communication between farmers and buyers
Giving farmers a dashboard to track their sales and analytics

✨ Features
FeatureDescription📱 Responsive DesignWorks on mobile, tablet, and desktop🌤️ Weather WidgetReal-time weather for farmers (no API key needed)🔍 Search & FilterSearch products by name, filter by category and price📦 Order TrackingPlace orders and track status in real-time📊 Farmer DashboardSales analytics with charts and stats💬 Real-time ChatLive chat between buyer and seller via Socket.io🔐 AuthenticationSeparate login/register for Farmers and Buyers🚪 LogoutSecure session-based logout

🛠️ Tech Stack:
# Frontend
# HTML5
# CSS3 (Responsive with Media Queries)
# JavaScript (Vanilla)
# Socket.io Client
# Chart.js (Dashboard charts)

Backend

# Node.js
# Express.js
# Socket.io (Real-time chat)
# Multer (Image uploads)
# Express-Session (Authentication)
# dotenv

Database

# MongoDB (Local development)
# MongoDB Atlas (Production/Cloud)

Deployment

# Frontend → Vercel
# Backend → Render
# Database → MongoDB Atlas


📁 Project Structure
farmigo-connect/
└── farmigo-enhanced/
      ├── backend/                  ← Main backend folder
      │     ├── public/             ← All frontend files (HTML, CSS, JS)
      │     │     ├── Home.html     ← Landing/Home page
      │     │     ├── Home.css      ← Home page styles
      │     │     ├── Home.js       ← Home page JS (weather, hamburger)
      │     │     ├── login.html    ← Login & Register page
      │     │     ├── login.css     ← Login page styles
      │     │     ├── first.js      ← Login/Register logic
      │     │     ├── finalbuyer.html   ← Buyer dashboard
      │     │     ├── finalbuyer.css    ← Buyer styles
      │     │     ├── finalbuyer.js     ← Buyer logic (search, orders, chat)
      │     │     ├── finalseller.html  ← Seller dashboard
      │     │     ├── finalseller.css   ← Seller styles
      │     │     └── finalseller.js    ← Seller logic (dashboard, orders, chat)
      │     │
      │     ├── models/             ← MongoDB Database Models
      │     │     ├── Seller.js     ← Farmer/Seller schema
      │     │     ├── Buyer.js      ← Buyer schema
      │     │     ├── Product.js    ← Product schema
      │     │     ├── Order.js      ← Order schema (NEW)
      │     │     └── ChatMessage.js← Chat schema (NEW)
      │     │
      │     ├── routes/             ← API Routes
      │     │     ├── authRoutes.js ← Login, Register, Logout
      │     │     ├── farmerRoutes.js← Product listing APIs
      │     │     ├── orderRoutes.js← Order place, track, update (NEW)
      │     │     └── chatRoutes.js ← Chat room API (NEW)
      │     │
      │     ├── middlewares/
      │     │     └── upload.js     ← Multer image upload config
      │     │
      │     ├── uploads/            ← Product images stored here
      │     ├── server.js           ← Main server file (Entry point)
      │     ├── package.json        ← Dependencies
      │     └── .env                ← Environment variables (SECRET - not on GitHub)
      │
      ├── .gitignore                ← Git ignore rules
      ├── DEPLOY_GUIDE.md           ← Deployment instructions
      └── README.md                 ← This file

⚙️ API Endpoints
Auth Routes /api/auth
MethodEndpointDescriptionPOST/registerRegister new user (seller/buyer)POST/loginLogin userPOST/logoutLogout userGET/buyer/check-sessionCheck buyer sessionGET/seller/check-sessionCheck seller session
Product Routes /api/farmer
MethodEndpointDescriptionGET/productsGet all productsPOST/productsAdd new product (seller)
Order Routes /api/orders
MethodEndpointDescriptionPOST/placePlace new orderGET/my-ordersGet buyer's ordersGET/seller-ordersGet seller's received ordersPUT/update-status/:idUpdate order status (seller)GET/dashboard-statsGet seller dashboard stats

🏃 Run Locally
Prerequisites

Node.js v18+
MongoDB (local) or MongoDB Atlas account
Git

Steps
bash# 1. Clone the repo
git clone https://github.com/vaishali498/farmigo-connect.git

# 2. Go to backend folder
cd farmigo-connect/farmigo-enhanced/backend

# 3. Install dependencies
npm install

# 4. Create .env file
# Create a file named .env and add:
MONGO_URI=mongodb://127.0.0.1:27017/farmersMarketplace
PORT=5000
SESSION_SECRET=farmigo_secret_2024
JWT_SECRET=farmigo_jwt_2024

# 5. Start server
node server.js

# 6. Open browser
# http://localhost:5000

🌐 How To Use
As a Farmer (Seller)

Go to https://farmigo-connect.vercel.app
Click Login / Register
Select Seller → Register
Login → Seller Dashboard opens
Click "+ List Product" → Add your produce
View Orders received from buyers
Update order status (Packed, Shipped, Delivered)
View Dashboard for sales analytics

As a Buyer

Go to https://farmigo-connect.vercel.app
Click Login / Register
Select Buyer → Register
Login → Browse all products
Use Search & Filter to find products
Click "Buy Now" → Place order
Track order in "My Orders" tab
Click "Chat" to talk to the seller

