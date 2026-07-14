# Little Sprouts Kindergarten School Dashboard

A premium, responsive, full-stack administrative portal built with **Next.js**, **Tailwind CSS**, and **Firebase** (Firestore + Authentication). Designed to support up to 300 students on free-tier hosting services.

## Key Features

1. **User Authentication**: Secure administrative login page.
2. **Student Management (CRUD)**: Create, read, update, and delete student enrollment profiles. Client-side search and class filters.
3. **Attendance Tracking**: Register student presence daily, toggle present/absent logs in batch, and export full reports as CSV.
4. **Daily Activity Logs**: Post daily activity notes for specific class groups (e.g. Pre-K, Toddlers) displayed in a chronological timeline.
5. **Dashboard Analytics**: Real-time KPI summaries including total enrolled, attendance status, and upcoming student birthdays in the next 7 days.
6. **Parent Notifications (Simulator)**: A dialogue box simulation to draft and send mock emails to parent email contacts.
7. **Hybrid Database/Auth Simulator**: Auto-detects configuration status. If Firebase credentials are not supplied, it falls back to a fully functional simulator storing data in client `localStorage`.

---

## Technical Stack
- **Framework**: Next.js (Pages Router)
- **Styling**: Tailwind CSS & Glassmorphism Panels
- **Icons**: Lucide React
- **Authentication**: Firebase Authentication (or LocalStorage Session Mock)
- **Database**: Firebase Firestore (or LocalStorage Collections Mock)

---

## Local Setup & Installation

### 1. Clone the project and install dependencies:
```bash
npm install
```

### 2. Start the Local Server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your browser.

### 3. Simulator Access Credentials (Default):
- **Email**: `admin@kindergarten.com`
- **Password**: `password123`

---

## Production Setup (Connecting to Firebase)
To connect this project to a live Firebase instance (free-tier):
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Enable **Email/Password Provider** in Firebase Authentication.
3. Create a **Cloud Firestore** database.
4. Obtain your Firebase Web App configuration credentials.
5. Create a `.env.local` file in the root directory and define the values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```
6. Restart the development server. The dashboard will automatically transition to Firestore collections.
