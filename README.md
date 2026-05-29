# Hospital Data Management System

A comprehensive Hospital Management System (HMS) built with **React (Vite)** for the frontend and **Node.js (Express)** with **Oracle Database** for the backend.

##  Features

- **Ward Management:** Real-time monitoring and management of hospital wards.
- **Doctor & Staff Tracking:** Comprehensive database of medical professionals.
- **Patient Admissions:** Streamlined process for admitting and tracking patients.
- **Automatic Discharge Monitor:** Background service to handle expired admissions automatically.
- **RBAC (Role-Based Access Control):** (Infrastructure present for role management).
- **Responsive UI:** Modern dashboard built with React and Lucide icons.

##  Tech Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router 7
- **Styling:** CSS (Modular) / Tailwind (configured)
- **Icons:** Lucide-React
- **API Client:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** Oracle Database (via `oracledb` driver)
- **Middleware:** CORS, JSON parser

##  Prerequisites

- **Node.js:** v18.x or higher
- **Oracle Database:** Access to an Oracle instance (e.g., Oracle XE, 19c, or 21c).
- **Oracle Instant Client:** Required for the `oracledb` driver.

##  Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/kartikramanuj/Hospital-Data-Management-system.git
cd Hospital-Data-Management-system
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd hospital-backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Database:
   - Update `config/db.js` with your Oracle Database credentials (User, Password, Connect String).
   - Ensure your Oracle instance is running.
4. Run the server:
   ```bash
   node app.js
   ```
   *The backend will run on `http://localhost:5001`.*

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../hospital-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The frontend will be available at `http://localhost:5173`.*

##  Database Schema
The project includes a `schema.sql` file in the `hospital-backend` directory to help you set up the necessary tables and triggers in your Oracle Database.

##  Project Structure

```text
Hospital-Data-Management-system/
├── hospital-backend/       # Express server & API logic
│   ├── config/             # DB connection config
│   ├── controllers/        # Business logic
│   ├── models/             # Data structures
│   └── routes/             # API endpoints
├── hospital-frontend/      # React + Vite application
│   ├── src/                # Components & Hooks
│   └── public/             # Static assets
└── README.md
```

##  Contributing
Feel free to fork this project, report issues, or submit pull requests to improve the system!

##  License
This project is licensed under the ISC License.
