# 🏫 School Management System — Setup Guide

## Tech Stack
- **Runtime:** Node.js (no frameworks)
- **Database:** MySQL
- **Packages:** `mysql2`, `dotenv`, `nodemon`

---

## 📋 Prerequisites

Make sure these are installed on your machine:

| Tool | Download |
|---|---|
| Node.js (v18+) | https://nodejs.org |
| MySQL (v8+) | https://dev.mysql.com/downloads/installer |
| Postman (optional, for testing) | https://www.postman.com/downloads |

---

## 📁 Project Structure

```
Student Management System/
├── config/
│   └── db.js                  ← MySQL connection pool
├── controllers/
│   ├── studentController.js
│   ├── teacherController.js
│   ├── subjectController.js
│   └── classController.js
├── routes/
│   ├── studentRoutes.js
│   ├── teacherRoutes.js
│   ├── subjectRoutes.js
│   └── classRoutes.js
├── .env                       ← Environment variables (DB credentials)
├── package.json
└── server.js                  ← Entry point
```

---

## ⚙️ Step-by-Step Setup

### Step 1 — Clone / Download the Project

```bash
cd d:\prroject
# project folder: "Student Managment system"
```

### Step 2 — Install Dependencies

```bash
npm install
```

> This installs: `mysql2`, `dotenv`, `nodemon`

---

### Step 3 — Setup MySQL Database

Open **MySQL Workbench** or any MySQL client and run:

```sql
CREATE DATABASE IF NOT EXISTS school_management_db;
USE school_management_db;

-- Classes table
CREATE TABLE classes (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(50) NOT NULL UNIQUE
);

-- Sections table
CREATE TABLE sections (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    section_name VARCHAR(10) NOT NULL,
    class_id     INT NOT NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_section_per_class (class_id, section_name)
);

-- Students table
CREATE TABLE students (
    id             INT AUTO_INCREMENT PRIMARY KEY,
    full_name      VARCHAR(100) NOT NULL,
    email          VARCHAR(100) UNIQUE,
    phone          VARCHAR(15),
    date_of_birth  DATE,
    gender         ENUM('Male','Female','Other'),
    address        TEXT,
    guardian_name  VARCHAR(100),
    guardian_phone VARCHAR(15),
    class_id       INT NOT NULL,
    section_id     INT NOT NULL,
    roll_number    VARCHAR(20),
    admission_date DATE,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id)   REFERENCES classes(id),
    FOREIGN KEY (section_id) REFERENCES sections(id)
);

-- Teachers table
CREATE TABLE teachers (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    full_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    phone       VARCHAR(15),
    address     TEXT,
    gender      ENUM('Male','Female','Other'),
    date_joined DATE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE subjects (
    id           INT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(100) NOT NULL,
    class_id     INT NOT NULL,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_subject_per_class (subject_name, class_id)
);

-- Teacher-Subject mapping (max 2 subjects per teacher)
CREATE TABLE teacher_subjects (
    teacher_id INT NOT NULL,
    subject_id INT NOT NULL,
    PRIMARY KEY (teacher_id, subject_id),
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

-- Sample seed data
INSERT INTO classes (class_name) VALUES ('Class 1'),('Class 2'),('Class 3'),('Class 4'),('Class 5');

INSERT INTO sections (section_name, class_id) VALUES
    ('A', 1), ('B', 1),
    ('A', 2), ('B', 2),
    ('A', 3), ('B', 3),
    ('A', 4), ('B', 4),
    ('A', 5), ('B', 5);
```

---

### Step 4 — Configure [.env](file:///d:/prroject/Student%20Managment%20system/.env)

Edit the [.env](file:///d:/prroject/Student%20Managment%20system/.env) file at the project root:

```env
PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=school_management_db
DB_PORT=3306
```

> Your current [.env](file:///d:/prroject/Student%20Managment%20system/.env) already has `DB_PASSWORD=Harsh@4801`

---

### Step 5 — Run the Server

```bash
# Development (auto-restart on file save) ← recommended
npm run dev

# OR Production (plain node)
npm start
```

✅ You should see:
```
🚀  Server running on http://localhost:5000
📚  School Management System Backend
✅  MySQL database connected successfully
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Health check |
| GET | `/api/admin/students` | All students |
| GET | `/api/admin/students/:id` | Student by ID |
| GET | `/api/admin/students/class/:classId` | Students by class |
| GET | `/api/admin/students/class/:classId/section/:sectionId` | Students by class & section |
| POST | `/api/admin/students` | Add student |
| PUT | `/api/admin/students/:id` | Update student |
| DELETE | `/api/admin/students/:id` | Delete student |
| GET | `/api/admin/teachers` | All teachers |
| GET | `/api/admin/teachers/:id` | Teacher by ID |
| POST | `/api/admin/teachers` | Add teacher |
| PUT | `/api/admin/teachers/:id` | Update teacher |
| DELETE | `/api/admin/teachers/:id` | Delete teacher |
| POST | `/api/admin/teachers/assign-subject` | Assign subject to teacher |
| DELETE | `/api/admin/teachers/:teacher_id/subject/:subject_id` | Remove subject from teacher |
| GET | `/api/admin/subjects` | All subjects |
| GET | `/api/admin/subjects/:id` | Subject by ID |
| GET | `/api/admin/subjects/class/:classId` | Subjects by class |
| POST | `/api/admin/subjects` | Add subject |
| PUT | `/api/admin/subjects/:id` | Update subject |
| DELETE | `/api/admin/subjects/:id` | Delete subject |
| GET | `/api/admin/classes` | All classes |
| GET | `/api/admin/classes/sections` | All sections |
| GET | `/api/admin/classes/:classId/sections` | Sections by class |

---

## 🛠️ Useful Commands

```bash
npm install            # Install dependencies
npm run dev            # Start with nodemon (dev mode)
npm start              # Start with plain node
npm list --depth=0     # Check installed packages
npm audit              # Check for vulnerabilities
```

### If port 5000 is already in use:
```bash
netstat -ano | findstr :5000   # Find the PID
taskkill /PID <PID> /F         # Kill it

# OR kill ALL node processes at once:
taskkill /IM node.exe /F
```

---

## 🚫 Common Errors

| Error | Cause | Fix |
|---|---|---|
| `EADDRINUSE :::5000` | Port already in use | `taskkill /IM node.exe /F` |
| `ER_ACCESS_DENIED_ERROR` | Wrong DB password | Check [.env](file:///d:/prroject/Student%20Managment%20system/.env) → `DB_PASSWORD` |
| `ER_BAD_DB_ERROR` | DB doesn't exist | Run the SQL in Step 3 |
| `Cannot find module` | Missing packages | Run `npm install` |
