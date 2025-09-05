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
- 👨‍💼 **Admin Tools** – Manage users, properties, bookings, and reviews  
- 📲 **Cross-Platform** – Built once, runs on **Android & iOS**

---

# 🧰 Step 2 — Tech Stack

This section lists the core technologies used to build **Rentify Mobile**, with short explanations why each was chosen and how it fits the app.

## Core
- **React Native (with Expo)** — Cross-platform UI framework that lets us build a single codebase for **Android and iOS**. Expo's managed workflow speeds up development and testing.
- **Expo Application Services (EAS)** — Used for production builds and submitting binaries (EAS Build, EAS Submit). Easy to configure signing and CI integration.
- **TypeScript** — Strong typing for safer code, better DX, and easier refactors.

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
- **Email Notifications (backend)** — Emails such as booking confirmations and password resets are sent by the backend (Resend or other mail provider).

## CI / CD & DevOps
- **GitHub Actions** — Automate tests, linting, and EAS builds.
- **EAS + GitHub Actions** — For creating production builds and distributing to testers (Expo / EAS workflow).

## Notes / Where code lives
- API clients: `src/api/*` (axios wrappers, auth token handling)  
- Realtime socket util: `src/utils/socket.ts`  
- State: `src/store/slices/*` (Redux Toolkit)  
- Screens: `src/screen/*` (tenant, landlord, admin, auth, booking, chat)

---

**Why this stack?**  
It balances developer speed (Expo + TypeScript), maintainability (Redux Toolkit, modular `src` layout), and mobile-specific needs (push notifications, image hosting, realtime via Socket.IO). This stack makes Rentify Mobile fast to iterate on while staying production ready.

