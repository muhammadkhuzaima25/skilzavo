<p align="center">
  <img alt="Skilzavo — Freelance Service Marketplace" src="./client/public/Skilzavo_logo.svg" " width="120" style="border-radius: 20px;">
</p>

<h1 align="center">Skil<span style="color:#0A7C72">zavo</span></h1>

<p align="center">
  <strong>Connect. Collaborate. Create. — The Freelance Service Marketplace for Skilled Professionals</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-0A7C72?style=flat&logo=react&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Node.js-20-339933?style=flat&logo=nodedotjs&labelColor=0f172a">
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat&logo=mongodb&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Express.js-4-000000?style=flat&logo=express&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Socket.io-Real--Time-010101?style=flat&logo=socketdotio&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Vite-5-646CFF?style=flat&logo=vite&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?style=flat&logo=tailwindcss&labelColor=0f172a">
  <img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Google-OAuth-4285F4?style=flat&logo=google&labelColor=0f172a">
  <img src="https://img.shields.io/badge/Chart.js-4-FF6384?style=flat&logo=chartdotjs&labelColor=0f172a">
</p>

<br>

---

<!-- SEO TAGS -->
<!--
skilzavo, freelance marketplace, freelance service platform, freelance services,
mern stack project, full stack web app, react freelance marketplace,
hire freelancers, freelance platform, service marketplace,
find freelancers, freelance jobs, freelance gigs,
real-time chat application, socket.io chat, project management app,
gantt chart project timeline, freelance management system,
mern stack portfolio project, react nodejs mongodb express,
freelancing in pakistan, freelance platform for pakistan,
service provider platform, freelance dashboard,
google oauth login, jwt authentication mern,
cloudinary image upload, multer file upload,
online freelancing platform, freelancer client portal,
skill marketplace, talent marketplace, gig platform
-->

---

## 📌 Overview

**Skilzavo** is a production-grade full-stack MERN web application that connects skilled professionals (Providers) with clients (Customers) who need their services. Think Fiverr meets Upwork — with real-time chat, project timeline tracking, and role-based dashboards.

Providers can list their services, manage requests, set project phases with Gantt-style timelines, and communicate directly with clients. Customers can browse services, submit requests, track project progress, and leave reviews.

> Built for the modern gig economy — where every connection leads to collaboration.

---

## ❗ Problem Statement

Freelance marketplaces often suffer from three core issues:

- **Communication gaps** — clients and providers lack real-time messaging tied to projects
- **No project visibility** — clients can't see progress once a project starts
- **Cluttered management** — no unified dashboard for tracking services, requests, orders, and reviews

Skilzavo solves all three with real-time Socket.io chat embedded in project timelines, Gantt-chart phase tracking, and dedicated role-based dashboards tailored for customers, providers, and admins.


## ✨ Key Features

| Feature | Description |
|---|---|
| 🏪 **Service Listings** | Providers create detailed service pages with images, descriptions, pricing, and add-ons |
| 🔍 **Smart Search & Filters** | Browse services by category, search keywords, and filter results instantly |
| 📋 **Service Requests** | Customers submit requests with details; providers accept or decline |
| 📊 **Role-Based Dashboards** | Dedicated Customer, Provider, and Admin dashboards with relevant metrics |
| 🗓️ **Project Timeline (Gantt)** | Providers set project phases with start/end dates visualized as a Gantt chart via Chart.js |
| ⏱️ **Live Countdown Timer** | Every project shows a real-time countdown to the deadline |
| 💬 **Real-Time Chat** | Socket.io-powered messaging with typing indicators — embedded inside each project |
| 👤 **Provider Profiles** | Public profiles with bio, portfolio, reviews, and rating |
| ⭐ **Reviews & Ratings** | Customers leave reviews with star ratings after project completion |
| 🔐 **JWT Authentication** | Secure login/register with hashed passwords and token-based auth |
| 🔑 **Google OAuth** | One-click sign-in and sign-up via Google accounts with role selection |
| 📸 **Cloudinary Uploads** | Images for services and portfolio managed via Cloudinary + Multer |
| 📱 **Responsive Design** | Fully responsive across desktop, tablet, and mobile with Tailwind CSS |
| 🎨 **Teal Theme** | Consistent teal (#0A7C72) branding across the entire UI |

---

## 🛠️ Tech Stack

**Frontend**
- React 18 + Vite 5
- React Router DOM v6
- Axios (HTTP client)
- Tailwind CSS 3
- Chart.js + react-chartjs-2
- Socket.io-client
- Lucide React (icons)
- `@react-oauth/google` (Google OAuth)

**Backend**
- Node.js + Express 4
- MongoDB Atlas + Mongoose
- JWT Authentication + bcryptjs
- Socket.io (real-time messaging)
- Cloudinary + Multer (image uploads)
- Google Auth Library
- express-rate-limit

---

## ⚙️ How to Run Locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Cloudinary account
- Google OAuth Client ID (from [console.cloud.google.com](https://console.cloud.google.com))

### 1. Clone the repo
```bash
git clone https://github.com/muhammadkhuzaima25/Skilzavo.git
cd Skilzavo
```

### 2. Backend setup
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.xxxxx.mongodb.net/skilzavo
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
GOOGLE_CLIENT_ID=your_google_client_id
```

Start backend:
```bash
npm run dev
```

### 3. Frontend setup
```bash
cd client
npm install
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_GOOGLE_CLIENT_ID=your_google_client_id
```

Start frontend:
```bash
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 📁 Project Structure

```
Skilzavo/
├── client/                          # React + Vite Frontend
│   ├── public/
│   │   ├── Skilzavo_logo.svg        # Brand logo
│   │   └── Skilzavo_favicon.svg     # Favicon
│   └── src/
│       ├── components/
│       │   ├── provider/            # Provider-specific components
│       │   │   ├── CreateServiceForm.jsx
│       │   │   ├── ManageOrders.jsx
│       │   │   ├── Messages.jsx
│       │   │   ├── Portfolio.jsx
│       │   │   ├── ProviderOverview.jsx
│       │   │   ├── ProviderSidebar.jsx
│       │   │   ├── Requests.jsx
│       │   │   └── TimelineSetupModal.jsx
│       │   ├── layout/
│       │   │   └── DashboardLayout.jsx
│       │   ├── Chat.jsx             # Reusable real-time chat
│       │   ├── Footer.jsx
│       │   ├── Navbar.jsx
│       │   ├── ReviewCard.jsx
│       │   ├── SearchBar.jsx
│       │   ├── ServiceCard.jsx
│       │   └── TimelineVisualizer.jsx
│       ├── context/
│       │   └── AuthContext.jsx       # Auth state + Google OAuth
│       ├── pages/
│       │   ├── dashboard/
│       │   │   ├── MyServices.jsx
│       │   │   ├── Overview.jsx
│       │   │   ├── Profile.jsx
│       │   │   └── TimelineView.jsx
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Services.jsx
│       │   ├── ServiceDetail.jsx
│       │   ├── ProviderDashboard.jsx
│       │   ├── ProviderProfile.jsx
│       │   ├── CustomerDashboard.jsx
│       │   └── AdminDashboard.jsx
│       ├── socket.js                # Socket.io client singleton
│       ├── utils/
│       │   └── axios.js             # Axios instance with JWT
│       ├── hooks/                   # Custom hooks
│       ├── App.jsx                  # Router setup
│       ├── main.jsx                 # Entry point
│       └── index.css                # Tailwind + theme variables
│
└── server/                          # Node + Express Backend
    ├── config/
    │   └── db.js                    # MongoDB connection
    ├── controllers/
    │   ├── authController.js        # Login, Register, Google OAuth
    │   ├── serviceController.js
    │   ├── requestController.js
    │   ├── projectController.js
    │   ├── reviewController.js
    │   └── userController.js
    ├── middleware/
    │   ├── authMiddleware.js        # JWT verification
    │   └── uploadMiddleware.js      # Multer config
    ├── models/
    │   ├── User.js
    │   ├── Service.js
    │   ├── Request.js
    │   ├── Project.js
    │   ├── Review.js
    │   └── Message.js               # Chat message schema
    ├── routes/
    │   ├── authRoutes.js
    │   ├── serviceRoutes.js
    │   ├── requestRoutes.js
    │   ├── projectRoutes.js
    │   ├── reviewRoutes.js
    │   └── messageRoutes.js
    ├── socket/
    │   └── chat.js                  # Socket.io chat handlers
    ├── server.js                    # Express + Socket.io entry
    ├── .env
    └── package.json
```

---

## 🌐 API Endpoints

### Auth — `/api/auth`
| Method | Path | Description | Access |
|---|---|---|---|
| POST | /register | Create new account | Public |
| POST | /login | Login, returns JWT | Public |
| POST | /google | Google OAuth login/signup | Public |
| GET | /me | Get current user profile | Private |
| PUT | /profile | Update user profile | Private |
| GET | /providers/:id | Get provider public profile | Public |
| GET | /users | Get all users | Admin |

### Services — `/api/services`
| Method | Path | Description | Access |
|---|---|---|---|
| GET | / | Get all services | Public |
| GET | /:id | Get single service | Public |
| POST | / | Create a new service | Provider |
| PUT | /:id | Update a service | Provider |
| DELETE | /:id | Delete a service | Provider |

### Requests — `/api/requests`
| Method | Path | Description | Access |
|---|---|---|---|
| POST | / | Submit a service request | Customer |
| GET | /customer | Get customer's requests | Customer |
| GET | /provider | Get provider's requests | Provider |
| PUT | /:id | Accept/decline request | Provider |

### Projects — `/api/projects`
| Method | Path | Description | Access |
|---|---|---|---|
| GET | /my | Get user's projects | Private |
| GET | /:id | Get project details | Private |
| PUT | /:id/status | Update project status | Provider |
| PUT | /:id/timeline | Set project timeline/phases | Provider |

### Messages — `/api/messages`
| Method | Path | Description | Access |
|---|---|---|---|
| GET | /:projectId | Get chat history for project | Private |

### Reviews — `/api/reviews`
| Method | Path | Description | Access |
|---|---|---|---|
| POST | / | Create a review | Private |
| GET | /:providerId | Get provider reviews | Public |

---

## 👤 Roles

| Role | Capabilities |
|---|---|
| 🧑‍💼 **Customer** | Browse services, submit requests, view project timeline with Gantt chart, chat with provider, leave reviews |
| 🛠️ **Provider** | Create services, manage incoming requests, set project phases, track orders, real-time client chat, portfolio management |
| ⚙️ **Admin** | View all users, services, and project statistics across the platform |

---

## 💬 Real-Time Chat Architecture

Skilzavo uses **Socket.io** for real-time bidirectional communication between customers and providers.

| Event | Direction | Description |
|---|---|---|
| `join_room` | Client → Server | Join a project's chat room |
| `send_message` | Client → Server | Send a new message |
| `receive_message` | Server → Client | Broadcast message to room |
| `typing` | Client → Server | User is typing |
| `stop_typing` | Client → Server | User stopped typing |

Messages are persisted in MongoDB and fetched via REST API (`GET /api/messages/:projectId`) on initial load.

---

## 🔮 Future Roadmap

- [ ] Payment gateway integration (Stripe / PayPal)
- [ ] Email notifications for new requests and messages
- [ ] Provider analytics dashboard with earnings reports
- [ ] Service gig packages (Basic, Standard, Premium)
- [ ] Dispute resolution system
- [ ] Mobile responsive refinements
- [ ] Real-time notifications (toast alerts)

---

## 🔍 SEO Keywords
`freelance marketplace` · `freelance service platform` · `MERN stack freelance project` · `freelance platform Pakistan` · `hire freelancers online` · `service marketplace` · `freelance gig platform` · `skill marketplace` · `talent marketplace` · `freelance management system` · `React freelance marketplace` · `Socket.io chat application` · `Gantt chart project management` · `MERN stack portfolio project` · `React Node.js MongoDB Express` · `freelancer client portal` · `online freelancing platform` · `Cloudinary image upload` · `Google OAuth MERN` · `JWT authentication React`

---

## 👤 Author

**Muhammad Khuzaima**
Graphic Designer · Logo & Brand Identity Expert · UI/UX Designer · MERN Stack Developer

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat&logo=linkedin&labelColor=0f172a)](https://www.linkedin.com/in/muhammad-khuzaima-991a08313)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-333?style=flat&logo=github&labelColor=0f172a)](https://github.com/muhammadkhuzaima25)

---

## 📄 License

**All Rights Reserved.** Copyright © 2026 Muhammad Khuzaima.
This project is for **viewing and evaluation only.**

---

<p align="center">
  <strong>⭐ If Skilzavo helped you or inspired your work — please leave a star!</strong><br>
  <sub>Built from scratch with real debugging, designing, and grinding.<br>
  A star costs nothing but means everything. 🙏</sub>
</p>

<p align="center">
  <a href="https://github.com/muhammadkhuzaima25/Skilzavo">
    <img src="https://img.shields.io/badge/⭐_Star_this_repo-Show_some_love-0A7C72?style=for-the-badge&labelColor=0f172a" alt="Star this repo">
  </a>
</p>
