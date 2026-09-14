# VulnSchool 🎓💀

> **⚠️ Legal Disclaimer:** VulnSchool is intentionally vulnerable and exists solely for educational purposes — penetration testing practice, security research, and CTF training. Do not deploy this application on systems you do not own or have explicit written permission to test. The author is not responsible for any misuse.

---

## What is VulnSchool?

VulnSchool is a deliberately vulnerable Learning Management System (LMS) built on Node.js, Express, and MongoDB. It simulates a real university student portal — complete with course registration, grade results, profile management, file uploads, and an admin panel — but with **31 intentional security vulnerabilities** baked in across the full stack.

It was built to:
- Give security students and CTF players a realistic, full-featured target to practice against
- Demonstrate how real-world vulnerabilities appear in modern Node.js/MongoDB web applications
- Pair with a built-in SOC dashboard so defenders can monitor and detect attacks in real time

---

## Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose ODM) — hosted on MongoDB Atlas
- **Auth:** JWT (jsonwebtoken), bcryptjs
- **File uploads:** Multer
- **Frontend:** Vanilla HTML/CSS/JavaScript

---

## Features

| Feature | Description |
|---|---|
| Student portal | Register, login, browse and enroll in courses |
| Results portal | View grades and attendance per course |
| Profile page | Update bio, website, upload profile picture |
| Admin panel | Create/delete courses, assign grades to students |
| Super admin panel | Promote/demote users between student and admin roles |
| SOC dashboard | Real-time traffic monitoring, threat detection, and alert visualization |

---

## Setup

### Prerequisites
- Node.js v18+
- A MongoDB Atlas account (free M0 tier works)

### Installation

```bash
git clone https://github.com/AdebayoAbdulmalik/vulnschool.git
cd vulnschool
npm install
```

### Environment variables

Create a `.env.student` file in the project root:

```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/studentportal?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRY=1h
PORT=5000
SOC_PASSWORD=your_soc_dashboard_password
```

### Run

```bash
npm run dev
```

Visit `http://localhost:5000` in your browser.

### Create a super_admin account

`super_admin` cannot be set via the API — set it directly in MongoDB Atlas:

1. Atlas → Browse Collections → `studentportal` → `users`
2. Find your account → Edit → change `role` field to `"super_admin"`
3. Log out and back in to get a fresh token

---

## Pages

| URL | Description | Access |
|---|---|---|
| `/` | Landing page | Public |
| `/register.html` | Register a new student account | Public |
| `/login.html` | Login | Public |
| `/dashboard.html` | Course list, register/drop | Authenticated |
| `/profile.html` | View/edit profile, upload picture | Authenticated |
| `/results.html` | View grades and attendance | Authenticated |
| `/admin.html` | Course management, assign grades | Admin |
| `/superadmin.html` | User role management | Super Admin |
| `/soc.html` | SOC dashboard — live traffic and alerts | SOC password |

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |

### Students
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | List all students |
| POST | `/api/students` | Create a student |
| GET | `/api/students/:id` | Get a student by ID |
| PUT | `/api/students/:id` | Update a student |
| PUT | `/api/students/:id/promote` | Promote/demote role (super_admin only) |
| GET | `/api/students/:id/preview` | Fetch student's website URL server-side |

### Courses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/courses` | List all courses |
| POST | `/api/courses` | Create a course (admin) |
| GET | `/api/courses/:id` | Get a course by ID |
| PUT | `/api/courses/:id` | Update a course (admin) |
| DELETE | `/api/courses/:id` | Delete a course (admin) |
| POST | `/api/courses/:id/register` | Register for a course |
| POST | `/api/courses/:id/drop` | Drop a course |

### Results
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/results` | Create a result (admin) |
| GET | `/api/results/student/:studentId` | Get results for a student |
| PUT | `/api/results/:id` | Update a result |
| DELETE | `/api/results/:id` | Delete a result |

### Upload
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/upload/profile-picture` | Upload a profile picture |
| GET | `/api/upload/file?name=filename` | Fetch an uploaded file |

### Logs
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/logs` | Get all logs and alerts (SOC password required) |
| GET | `/api/logs/alerts` | Get alerts only (SOC password required) |

---

## Vulnerability Flags (31)

### Authentication
| # | Vulnerability | Endpoint | Method |
|---|---|---|---|
| 1 | No input validation on register | `/api/auth/register` | POST |
| 2 | No input validation on login | `/api/auth/login` | POST |
| 3 | User enumeration via error messages | `/api/auth/login` | POST |
| 4 | No rate limiting on login | `/api/auth/login` | POST |
| 5 | JWT never expires | `/api/auth/login` | POST |
| 6 | JWT stored in localStorage (XSS-stealable) | Client-side | — |

### Students
| # | Vulnerability | Endpoint | Method |
|---|---|---|---|
| 7 | No authentication required | `/api/students` | GET |
| 8 | Broken access control — no role check | `/api/students` | GET |
| 9 | Mass assignment — set role at registration | `/api/students` | POST |
| 10 | IDOR — view any student's profile | `/api/students/:id` | GET |
| 11 | IDOR — edit any student's profile | `/api/students/:id` | PUT |
| 12 | Mass assignment — self-promote to admin | `/api/students/:id` | PUT |
| 13 | SSRF — server fetches user-supplied URL | `/api/students/:id/preview` | GET |
| 14 | Excessive data exposure | `/api/students` | GET |

### Courses
| # | Vulnerability | Endpoint | Method |
|---|---|---|---|
| 15 | No authentication on course list | `/api/courses` | GET |
| 16 | No authentication on single course | `/api/courses/:id` | GET |
| 17 | Mass assignment — overwrite enrolledStudents | `/api/courses/:id` | PUT |
| 18 | IDOR — register another student | `/api/courses/:id/register` | POST |
| 19 | IDOR — drop another student | `/api/courses/:id/drop` | POST |
| 20 | No duplicate registration check | `/api/courses/:id/register` | POST |
| 21 | Race condition — broken capacity check | `/api/courses/:id/register` | POST |

### Results
| # | Vulnerability | Endpoint | Method |
|---|---|---|---|
| 22 | BFLA — student changes own grade | `/api/results/:id` | PUT |
| 23 | BFLA — student deletes any result | `/api/results/:id` | DELETE |
| 24 | IDOR — view any student's results | `/api/results/student/:studentId` | GET |

### Upload
| # | Vulnerability | Endpoint | Method |
|---|---|---|---|
| 25 | Insecure file upload — no type validation | `/api/upload/profile-picture` | POST |
| 26 | Excessive data exposure — full server path | `/api/upload/profile-picture` | POST |
| 27 | Path traversal — read any server file | `/api/upload/file?name=` | GET |
| 28 | Client-side RCE via file upload | `/api/upload/file?name=shell.html` | GET |

### Client-side
| # | Vulnerability | Location | Trigger |
|---|---|---|---|
| 29 | Stored XSS via course title | `dashboard.html`, `admin.html` | Create course with script payload |
| 30 | Stored XSS via student name | `admin.html` | Register with script name |
| 31 | Token theft via XSS | `localStorage` | Chain with flag 29/30 |

---

## SOC Dashboard

VulnSchool ships with a built-in Security Operations Center dashboard at `/soc.html`. Access it with the `SOC_PASSWORD` from your `.env.student` file.

**What it detects:**
- NoSQL injection attempts (`$ne`, `$gt`, `$where` in request bodies)
- XSS payloads (`<script>`, `onerror=` in bodies)
- Path traversal attempts (`../` in query params)
- SSRF attempts (internal IPs/localhost in body fields)
- Mass assignment attempts (`role` field in PUT bodies)
- Brute force login attempts (5+ failed logins from same IP)
- Broken access control probes (403 responses)

**Features:**
- Live request feed with expandable payload details
- Alert cards with threat type labels
- Top endpoints and most active IPs
- Brute force IP detection
- Auto-refreshes every 15 seconds

---

## Built by

**Abdulmalik Adebayo** — BSc Cybersecurity student, Osun State University (Uniosun)

- X: [@malik_cybersec](https://x.com/malik_cybersec)
- GitHub: [AdebayoAbdulmalik](https://github.com/AdebayoAbdulmalik)
- LinkedIn: [malik-cybersec](https://linkedin.com/in/malik-cybersec)
- Medium: [@abdulmalikadebayo](https://medium.com/@abdulmalikadebayo)

---

## License

MIT — use freely for educational and research purposes. Don't be evil.