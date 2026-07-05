# Examination Management System

A RESTful Web API built with PHP and MySQL for managing university examination scheduling, student registrations, results, and notifications. The system supports three user roles: **Admin**, **Lecturer**, and **Student**.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Tables](#database-tables)
- [API Endpoints](#api-endpoints)
  - [Users](#users)
  - [Faculties](#faculties)
  - [Courses](#courses)
  - [Venues](#venues)
  - [Examinations](#examinations)
  - [Registrations](#registrations)
  - [Results](#results)
  - [Notifications](#notifications)
  - [QR Code](#qr-code)
- [Authentication](#authentication)
- [Middleware](#middleware)
- [Third-Party Integration](#third-party-integration)
- [How to Run](#how-to-run)

---

## Project Overview

This system allows:

- **Admins** to manage users, faculties, courses, venues, exam schedules, registrations, results, and notifications.
- **Lecturers** to manage exam schedules, publish results, and send notifications for their courses.
- **Students** to view their timetable, registrations, results, notifications, and download their exam slip with a QR code.

---

## Tech Stack

| Layer          | Technology                    |
| -------------- | ----------------------------- |
| Backend        | PHP (Pure, no framework)      |
| Database       | MySQL via PDO                 |
| Authentication | JWT (JSON Web Token)          |
| Frontend       | HTML, CSS, Vanilla JavaScript |
| QR Code        | QR Server API (third-party)   |
| Server         | Apache (XAMPP / LAMP)         |

---

## Project Structure

```
exam_management_system/
│
├── config/
│   └── db.php                  # PDO database connection
│
├── middleware/
│   ├── authMiddleware.php       # JWT authentication & role guard
│   └── errorHandler.php        # Global error & exception handler
│
├── services/
│   └── qrService.php           # QR code URL generator
│
├── controllers/
│   └── qrController.php        # QR code generation logic
│
├── query/
│   ├── users.php               # User CRUD endpoint
│   ├── faculties.php           # Faculty CRUD endpoint
│   ├── courses.php             # Course CRUD endpoint
│   ├── venues.php              # Venue CRUD endpoint
│   ├── examinations.php        # Examination schedule CRUD endpoint
│   ├── registration.php        # Student course registration endpoint
│   ├── results.php             # Examination results endpoint
│   ├── notifications.php       # Notifications endpoint
│   └── qr_generate.php         # Exam slip QR code endpoint
│
└── frontend/
    ├── public/                 # Student pages
    ├── admin/                  # Admin pages
    └── lecturer/               # Lecturer pages
```

---

## Database Tables

| Table                         | Description                                             |
| ----------------------------- | ------------------------------------------------------- |
| `users`                       | Stores all user accounts (admin, lecturer, student)     |
| `Faculties`                   | Stores faculty records                                  |
| `Courses`                     | Stores course records linked to faculties and lecturers |
| `Examination_Venues`          | Stores exam venue details and capacity                  |
| `Examinations`                | Stores exam schedules linked to courses and venues      |
| `Student_Course_Registration` | Stores student course registrations                     |
| `Results`                     | Stores student examination results and grades           |
| `notifications`               | Stores system notifications for users                   |

---

## API Endpoints

All endpoints require a valid JWT token in the request header:

```
Authorization: Bearer <your_token>
Content-Type: application/json
```

---

### Users

**Endpoint:** `GET|POST|PUT|DELETE /query/users.php`

| Method | Query / Body                                  | Description       |
| ------ | --------------------------------------------- | ----------------- |
| GET    | _(none)_                                      | Get all users     |
| GET    | `?user_id=1`                                  | Get user by ID    |
| GET    | `?role=student`                               | Filter by role    |
| GET    | `?faculty_id=2`                               | Filter by faculty |
| GET    | `?name=Adam`                                  | Search by name    |
| POST   | `{ name, email, password, role, faculty_id }` | Create new user   |
| PUT    | `{ user_id, name, email, role, faculty_id }`  | Update user       |
| DELETE | `{ user_id }`                                 | Delete user       |

---

### Faculties

**Endpoint:** `GET|POST|PUT|DELETE /query/faculties.php`

| Method | Query / Body                   | Description        |
| ------ | ------------------------------ | ------------------ |
| GET    | _(none)_                       | Get all faculties  |
| GET    | `?id=1`                        | Get faculty by ID  |
| GET    | `?faculty_name=Science`        | Search by name     |
| POST   | `{ faculty_name }`             | Create new faculty |
| PUT    | `{ faculty_id, faculty_name }` | Update faculty     |
| DELETE | `{ faculty_id }`               | Delete faculty     |

---

### Courses

**Endpoint:** `GET|POST|PUT|DELETE /query/courses.php`

| Method | Query / Body                                                                 | Description           |
| ------ | ---------------------------------------------------------------------------- | --------------------- |
| GET    | _(none)_                                                                     | Get all courses       |
| GET    | `?id=1`                                                                      | Get course by ID      |
| GET    | `?course_code=CS101`                                                         | Filter by course code |
| GET    | `?course_name=Math`                                                          | Search by course name |
| GET    | `?faculty_id=1`                                                              | Filter by faculty     |
| GET    | `?user_id=3`                                                                 | Filter by lecturer    |
| POST   | `{ course_code, course_name, credit_hours, faculty_id, user_id }`            | Create course         |
| PUT    | `{ course_id, course_code, course_name, credit_hours, faculty_id, user_id }` | Update course         |
| DELETE | `{ course_id }`                                                              | Delete course         |

---

### Venues

**Endpoint:** `GET|POST|PUT|DELETE /query/venues.php`

| Method | Query / Body                                   | Description          |
| ------ | ---------------------------------------------- | -------------------- |
| GET    | _(none)_                                       | Get all venues       |
| GET    | `?id=1`                                        | Get venue by ID      |
| GET    | `?Venue_Name=Hall`                             | Search by venue name |
| GET    | `?Capacity=100`                                | Filter by capacity   |
| GET    | `?Location=Block A`                            | Search by location   |
| POST   | `{ Venue_Name, Capacity, Location }`           | Create venue         |
| PUT    | `{ Venue_ID, Venue_Name, Capacity, Location }` | Update venue         |
| DELETE | `{ Venue_ID }`                                 | Delete venue         |

---

### Examinations

**Endpoint:** `GET|POST|PUT|DELETE /query/examinations.php`

| Method | Query / Body                                                           | Description                                     |
| ------ | ---------------------------------------------------------------------- | ----------------------------------------------- |
| GET    | _(none)_                                                               | Get all exams (with course code and venue name) |
| GET    | `?id=1`                                                                | Get exam by ID                                  |
| GET    | `?Course_ID=2`                                                         | Filter by course                                |
| GET    | `?Venue_ID=1`                                                          | Filter by venue                                 |
| GET    | `?Exam_Date=2025-07-10`                                                | Filter by date                                  |
| POST   | `{ Course_ID, Venue_ID, Exam_Date, Start_Time, End_Time, Created_by }` | Schedule exam                                   |
| PUT    | `{ Exam_ID, Course_ID, Venue_ID, Exam_Date, Start_Time, End_Time }`    | Update exam                                     |
| DELETE | `{ Exam_ID }`                                                          | Delete exam                                     |

---

### Registrations

**Endpoint:** `GET|POST|PUT|DELETE /query/registration.php`

| Method | Query / Body                                                 | Description                |
| ------ | ------------------------------------------------------------ | -------------------------- |
| GET    | _(none)_                                                     | Get all registrations      |
| GET    | `?id=1`                                                      | Get registration by ID     |
| GET    | `?user_id=5`                                                 | Filter by student          |
| GET    | `?course_id=3`                                               | Filter by course           |
| GET    | `?registration_date=2025-07-01`                              | Filter by date             |
| POST   | `{ user_id, course_id, registration_date }`                  | Register student to course |
| PUT    | `{ registration_id, user_id, course_id, registration_date }` | Update registration        |
| DELETE | `{ registration_id }`                                        | Delete registration        |

---

### Results

**Endpoint:** `GET|POST|PUT|DELETE /query/results.php`

| Method | Query / Body                                                           | Description            |
| ------ | ---------------------------------------------------------------------- | ---------------------- |
| GET    | _(none)_                                                               | Get all results        |
| GET    | `?id=1`                                                                | Get result by ID       |
| GET    | `?user_id=5`                                                           | Filter by student      |
| GET    | `?exam_id=2`                                                           | Filter by exam         |
| GET    | `?grade=A`                                                             | Filter by grade        |
| GET    | `?published_at=2025-07-05`                                             | Filter by publish date |
| POST   | `{ user_id, exam_id, marks_obtained, grade, published_at }`            | Publish result         |
| PUT    | `{ result_id, user_id, exam_id, marks_obtained, grade, published_at }` | Update result          |
| DELETE | `{ result_id }`                                                        | Delete result          |

---

### Notifications

**Endpoint:** `GET|POST|PUT|DELETE /query/notifications.php`

| Method | Query / Body                                            | Description                                  |
| ------ | ------------------------------------------------------- | -------------------------------------------- |
| GET    | _(none)_                                                | Get all notifications                        |
| GET    | `?id=1`                                                 | Get notification by ID                       |
| GET    | `?user_id=4`                                            | Filter by user                               |
| GET    | `?is_read=0`                                            | Filter by read status (0 = unread, 1 = read) |
| GET    | `?title=Exam`                                           | Search by title                              |
| POST   | `{ user_id, title, message, is_read }`                  | Create notification                          |
| PUT    | `{ notification_id, user_id, title, message, is_read }` | Update notification                          |
| DELETE | `{ notification_id }`                                   | Delete notification                          |

---

### QR Code

**Endpoint:** `POST /query/qr_generate.php`

Generates a QR code URL for a student's examination slip.

**Request Body:**

```json
{
	"examId": 3,
	"studentId": 7,
	"course": "CS101 - Data Structures",
	"date": "2025-07-15"
}
```

**Response:**

```json
{
	"success": true,
	"message": "QR Code generated successfully",
	"qr_code_url": "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=..."
}
```

---

## Authentication

This system uses **JWT (JSON Web Token)** authentication.

1. The user logs in via the login page.
2. The server validates credentials and returns a signed JWT token.
3. The token is stored in `localStorage` on the client side.
4. Every API request includes the token in the `Authorization` header.
5. `authMiddleware.php` validates the token on every endpoint before any data is processed.
6. If the token is missing, expired, or invalid, the API returns `401 Unauthorized`.

---

## Middleware

### `errorHandler.php`

Catches all PHP errors, warnings, and exceptions before they reach the client. Returns a clean JSON error response instead of exposing raw PHP error messages.

### `authMiddleware.php`

Validates the JWT token on every request. Extracts the user's identity and role, and blocks access if the token is invalid or the role does not have permission.

---

## Third-Party Integration

### QR Server API

- **URL:** `https://api.qrserver.com/v1/create-qr-code/`
- **Usage:** Generates a QR code image from student exam slip data (Exam ID, Student ID, Course, Date).
- **No API key required.**
- The generated QR code URL is returned to the frontend and displayed inside the student's exam slip modal.

---

## How to Run

1. **Clone or copy** the project into your Apache server's root directory (e.g., `htdocs` for XAMPP).

2. **Import the database** — create a MySQL database and import the provided SQL schema file.

3. **Configure the database connection** in `config/db.php`:

```php
$host = 'localhost';
$db   = 'exam_management_system';
$user = 'root';
$pass = '';
```

4. **Start Apache and MySQL** via XAMPP or your preferred server.

5. **Open the frontend** in your browser:

```
http://localhost/exam_management_system/frontend/public/index.php
```

6. **Login** with your admin, lecturer, or student credentials to access the system.

---

## Default Roles

| Role       | Access                                                         |
| ---------- | -------------------------------------------------------------- |
| `admin`    | Full access to all modules                                     |
| `lecturer` | Courses, exam scheduling, results, notifications               |
| `student`  | Timetable, registrations, results, notifications, exam slip QR |

---

_Examination Management System — RESTful API Project_
