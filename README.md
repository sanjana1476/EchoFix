# EchoFix - Community Issue Resolution Platform

A web application for managing and tracking maintenance issues in gated communities.

## Features

- Separate login portals for residents and administrators
- Complaint submission with photo upload capability
- Real-time complaint tracking
- Worker assignment system for administrators
- Modern and responsive UI using Material-UI

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Technology Stack

- React.js
- Material-UI
- React Router
- Firebase (coming soon for authentication and database)

## Project Structure

```
src/
  ├── components/
  │   ├── admin/
  │   │   └── AdminDashboard.js
  │   ├── auth/
  │   │   ├── Login.js
  │   │   └── PrivateRoute.js
  │   └── resident/
  │       └── ResidentDashboard.js
  ├── App.js
  ├── index.js
  └── index.css
```
