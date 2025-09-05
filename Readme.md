# 📱 Rentify Mobile

Rentify Mobile is the **cross-platform mobile application** for the Rentify platform, built with **React Native, Expo, and TypeScript**.  
It runs seamlessly on **both Android and iOS**, providing a smooth and modern rental experience.

The mobile app integrates directly with the [Rentify Backend](https://github.com/kubsamelkamu/rentify_server) and complements the [Rentify Frontend](https://github.com/kubsamelkamu/Rentify), ensuring a unified ecosystem across web and mobile.

---

## ✨ Features

- 🏡 **Property Listings** – Browse and search rental properties with filters  
- 📅 **Bookings** – Book and manage your rentals in real time  
- 💬 **Chat** – In-app messaging between tenants and landlords  
- 💳 **Payments** – Secure booking and payment tracking  
- 👤 **Profile Management** – Update personal details, roles, and preferences & settings.
- 📧 **Email Notifications** – Receive real time booking confirmations, rejections, and updates 
- 🔔 **Push Notifications** – Get real-time alerts for bookings, payments, and chats 
- 📲 **Cross-Platform** – Built once, runs on **Android & iOS**

# 🧰 2 — Tech Stack

This section lists the core technologies used to build **Rentify Mobile**, with short explanations why each was chosen and how it fits the app.

## Core
- **React Native (with Expo)** — Cross-platform UI framework that lets us build a single codebase for **Android and iOS**. Expo's managed workflow speeds up development and testing.
- **Expo Application Services (EAS)** — Used for production builds and submitting binaries (EAS Build, EAS Submit). Easy to configure signing and CI integration.
- **TypeScript** — Strong typing for safer code,  and easier refactors.

## State, Networking & Real-time
- **Redux Toolkit** — Predictable global state management using slices (used for auth, bookings, properties,chat, payment).
- **Axios** — HTTP client for REST calls to the Rentify backend (token-based auth, interceptors in `src/api`).
- **Socket.IO client** — Real-time updates for chat, booking status, and payment notifications.

## Navigation & UI
- **React Navigation** — Handles stacks, bottom tabs and modal flows (tenant, landlord, admin role flows).
- **Component folder pattern** — Reusable components  in `src/component` for consistent UI.

## Media, Notifications & Emails
- **Cloudinary** — Image storage/optimization for property photos (used by frontend/backend; mobile uploads integrate with same service).
- **Push Notifications** — Expo Notifications (with FCM for Android / APNs for iOS) to deliver real-time alerts for bookings, payments, and chats.
- **Email Notifications (backend)** — Emails such as booking confirmations and password resets are sent by the backend.

## CI / CD & DevOps
- **GitHub Actions** — Automate tests, linting, and EAS builds.
- **EAS + GitHub Actions** — For creating production builds and distributing to testers (Expo / EAS workflow).

## Notes / Where code lives
- API clients: `src/api/*` (axios wrappers, auth token handling)  
- Realtime socket util: `src/utils/socket.ts`  
- State: `src/store/slices/*` (Redux Toolkit)  
- Screens: `src/screen/*` (tenant, landlord, admin, auth, booking, chat)

---


# 📂3 — Project Structure

The Rentify Mobile app follows a **modular and scalable folder structure**, keeping concerns separated and easy to maintain.
```
├── app.json # Expo app configuration
├── App.tsx # Root component
├── index.ts # Entry point
├── package.json # Dependencies and scripts
├── tsconfig.json # TypeScript configuration
├── eas.json # Expo Application Services config
├── assets/ # App icons, splash screens, and static assets
├── src/ # Main source code
│ ├── api/ # Axios API clients (auth, booking, payment, etc.)
│ ├── component/ # Reusable UI components (FilterPanel, cards, etc.)
│ ├── navigation/ # Navigation setup (stacks, tabs, role-based flows)
│ ├── screen/ # Screens grouped by feature
│ │ ├── auth/ # Login, Register, Forgot Password
│ │ ├── booking/ # Tenant & Landlord booking screens
│ │ ├── chat/ # Real-time chat screens
│ │ ├── landlord/ # Landlord-specific dashboards and tools
│ │ ├── tenant/ # Tenant property browsing, profile, and bookings
│ │ ├── admin/ # Admin management (users, properties, reviews)
│ │ └── setting/ # App settings and account preferences
│ ├── store/ # Redux Toolkit setup
│ │ ├── slices/ # Feature-based slices (auth, bookings, properties, etc.)
│ │ ├── rootReducer.ts # Root reducer
│ │ ├── store.ts # Redux store config
│ │ └── hooks.ts # Typed hooks for dispatch/selectors
│ ├── style/ # Global and shared styles
│ │ ├── shared/ # Theme, colors, typography
│ │ └── global.js # Global styles
│ └── utils/ # Helpers & utilities (socket, formatters, etc.)
│
├── .github/workflows/ # CI/CD workflows (EAS build, release pipeline)
├── .vscode/ # VSCode settings
└── .expo/ # Local Expo configuration 
```

# ⚙️ 4 — Setup & Installation

Follow these steps to get **Rentify Mobile** running on your local machine or device.

---

## 1. Clone the repository

```bash
git clone https://github.com/kubsamelkamu/Rentify-Mobile.git
cd Rentify-Mobile
```

## 2. Install dependencies

Using Yarn (recommended) or npm:

```bash
    yarn install

    npm instal
```
## 3. Configure Environment Variables

Create a .env file in the project root and set the following variables:

```bash
    API_URL=http://localhost:5000 #Rentify backend (see https://github.com/kubsamelkamu/rentify_server)
    SOCKET_URL=http://localhost:5000 # Socket.IO server for real-time 
```
## 4. Start the app

Run the Expo development server:
```bash
   npx expo start
   yarn Start
```

# 🚀5 — Usage / Features in Action

Rentify Mobile is designed for **two main user roles**: Tenant, Landlord.
Each role has specific features tailored to their needs.


## 🏠 Tenant

- Browse and filter properties by city, type, or price.  
- View detailed property information with images, amenities, and landlord details.  
- Book properties and track booking status in real time.  
- Make payments and view payment history.  
- Chat directly with landlords regarding property details or booking inquiries.  
- Manage their profile and personal preferences.  
- Receive **email and push notifications** for booking updates.

---

## 👨‍💼 Landlord

- Add, update, or remove property listings.  
- Approve or reject booking requests.  
- Track payment statuses and rental history.  
- Chat with tenants regarding bookings or property inquiries.  
- Manage landlord profile and preferences.  
- Receive notifications about new bookings or messages.


## 🔔 Notifications & Communication

- **Email Notifications**: Booking confirmations, rejections, payment and account updates.  
- **Push Notifications**: Real-time alerts for bookings, payments, and chat messages.

---

# 📱 6 — Install via QR Code

To make it easier for users to install **Rentify Mobile** on their devices, a **QR code** is provided that links directly to the app build. Users can scan the QR code with their mobile device to install the app instantly.

## Steps for Users

1. **Scan the QR code** below using your phone camera or a QR scanner app.  
2. **click download Rentify** The app  Installation  will start instantly 
3. **Start using Rentify Mobile** Then start using Rentify.

---

### QR Code

![Rentify Mobile QR Code](./assets/rentify-qr.png)
---

