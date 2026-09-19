# Changelog Product Updates Widget

A full-stack MERN application for publishing and displaying product changelogs.

The application provides an admin publishing studio, public changelog timeline, reactions, notifications, authentication, search, filtering, and JSON feed support.

---

## Features

### Admin

- Admin authentication
- Create changelog
- Edit changelog
- Delete changelog
- Save changelog as Draft
- Publish changelog
- Markdown editor with live preview
- Cover image support
- Categories:
  - New
  - Improved
  - Fixed
- Admin dashboard

### Public Changelog

- Reverse chronological changelog timeline
- Search changelogs
- Filter by category
- Markdown rendering
- Cover images
- Product update reactions:
  - ❤️ Heart
  - 🎉 Party
  - 🚀 Rocket
- Reaction counts

### Notifications

- Notification center
- Unread notification count
- Published changelog notifications
- Mark notification as read
- Mark all notifications as read
- Tracks the user's last viewed changelog date

### Authentication

- User signup
- Email verification simulation
- Login
- Access token
- Refresh token
- HTTP-only cookies
- Protected routes
- Admin-only routes
- Logout
- Forgot password
- Reset password

### API

- REST API
- JSON changelog feed
- Search and filtering
- Authentication endpoints
- Admin CRUD endpoints
- Reaction endpoints
- Notification endpoints

---

## Technology Stack

### Frontend

- React
- Vite
- React Router
- Axios
- React Markdown
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs
- cookie-parser
- CORS

---

## Project Structure

```text
changelog-app/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   └── NotificationBell.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── CreateChangelog.jsx
│   │   │
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
├── postman/
│   └── Changelog-API.postman_collection.json
│
└── README.md