# PROJECT SPECIFICATION DOCUMENT
## Faculty of Pharmacy Academic Portal

**Date:** March 28, 2026  
**Project Name:** Pharmacy Portal (Integrated Academic Management System)  
**Developed By:** SoftSols PK  
**Status:** Production Ready  

---

## 1. Project Overview
### Description
The Pharmacy Portal is a high-fidelity, dual-platform (Web & Mobile) ecosystem designed specifically for the Faculty of Pharmacy. It addresses the unique needs of pharmaceutical education through advanced simulations, real-time broadcasting, and AI-driven academic support. The system ensures a seamless flow of information between administration, faculty, and students, maintaining full functional parity across all devices.

---

## 2. System Overview
### How the System Works
The system operates on an synchronized monorepo architecture. When a faculty member uploads a resource or starts a live session on the web, students receive instant notifications and can join/access the content via their mobile application. All data is persisted in a real-time PostgreSQL database with Cloudinary-backed secure storage for academic materials.

---

## 3. User Roles & Navigation Matrix

| User Role | Designation | Key Access Areas |
| :--- | :--- | :--- |
| **Vice Chancellor (V.C.)** | Executive Head | Global Analytics, Faculty Performance, System Audit. |
| **Super Admin** | IT / Root Admin | Full System Control, Database Management, Security. |
| **Sub-Admin** | Dean Office / Admin | Enrollments, Fee Management, Academic Reports, Exams. |
| **HOD** | Dept. Head | Faculty Assignment, Dept. Analytics, Course Oversight. |
| **Faculty Member** | Teacher | Assigned Courses, Live Classes, Labs, Assessments. |
| **Student** | Learner | Course Hub, Virtual Lab, AI Tutor, Live Attendance. |

---

## 4. Detailed Role-Based Menus

### A. Sub-Admin (Dean Office / Admin Role)
Responsible for the operational heart of the faculty.
*   **Dashboard:** Enrollment trends and fee collection overview.
*   **Enrollments:** Manage student registrations and role approvals.
*   **Attendance:** Faculty and student attendance monitoring.
*   **Academic Reports:** Deep-dive reports into course progress and department performance.
*   **Fee Management:** Tracking payments, dues, and financial status.
*   **Examination:** Scheduling global exams and managing datesheets.
*   **Results:** Verifying and publishing semester results.
*   **Time Table:** Configuring the master academic schedule.
*   **Settings:** System-level configuration.

### B. HOD (Head of Department)
Focuses on departmental excellence and faculty coordination.
*   **Dashboard:** Department-specific analytics and performance metrics.
*   **Course Catalogue:** View all active courses within the relevant department.
*   **Assign Course:** **[Key Feature]** Assign specific courses to any registered faculty member within the department.
*   **Attendance:** Monitor attendance for department-specific courses.
*   **Live Chat & Classes:** Oversee ongoing live interactions.
*   **Visual Lab:** Review lab experiment submissions for the department.
*   **Academic Reports:** Generate reports for departmental KPIs.
*   **Examination & Results:** Department-level result management.
*   **Time Table:** Departmental lecture scheduling.

### C. Faculty Member (Teacher)
Focuses on course delivery and student engagement.
*   **Dashboard:** Teacher performance analytics and recent class stats.
*   **Course Catalogue:** View and manage only active, **assigned** courses.
*   **Attendance:** Mark and track attendance for assigned classes.
*   **Live Chat & Classes:** Host Agora-powered video sessions and real-time chat.
*   **Visual Lab:** Manage simulations and review student lab reports.
*   **Academic Reports:** Track progress of students in assigned modules.
*   **Examination & Results:** Grading for specific course assessments.

---

## 5. Modules & Features Breakdown

### I. Course Management Hub
*   **Resource Manager:** Unified module for PDF/Video/Slide management with "Downloadable" toggles.
*   **Expiration Control:** Set "Time-to-Live" for resources to protect intellectual property.
*   **Assignments:** Automated submission portal with deadline enforcement and status badges.

### II. Live Session Module (Agora Powered)
*   **HD Broadcasting:** High-fidelity video stage for faculty.
*   **Resource Sync:** Share files directly from the Course Resource hub into the live chat flow.
*   **Participant Tracking:** Real-time visibility of students currently in the session.

### III. Virtual Lab (Pharmacy Simulations)
*   **Interactive Simulations:** Dissolution, Tablet Formulation, and Emulsion Stability modules.
*   **Auto-Plotting:** Real-time graph generation based on student inputs.
*   **Digital Reports:** Formal observation and result submission integrated with grading.

### IV. AI Academic Tutor (Gemini Integration)
*   **Contextual Support:** Specifically trained for Pharmacy curriculum assistance.
*   **24/7 Availability:** Instant support for students on both Web and Mobile.

---

## 6. System Workflow / Process Flow

### Step 1: User Onboarding
*   Student/Faculty registers -> Sub-Admin receives notification -> Role and status are approved.

### Step 2: Course Assignment
*   HOD views "Assign Course" -> Selects active course -> Assigns to a specific Faculty member.
*   Course immediately appears in the Faculty's "Course Catalogue."

### Step 3: Academic Delivery
*   Faculty schedules a **Live Class** or uploads a **Lab Resource**.
*   Students receive instant push notifications (Mobile) or dashboard Alerts (Web).

### Step 4: Engagement & Submission
*   Student joins Live Session -> Completes assigned Virtual Lab -> Submits Lab Report.
*   Faculty reviews the submission and assigns a **Grade**.

### Step 5: Assessment & Reporting
*   Admin/Sub-Admin monitors overall attendance and results.
*   Detailed **Academic Reports** are generated for V.C. and Dean Office review.

---

## 7. Administrative Credentials Matrix

| Designation | Email Address | Password | Role |
| :--- | :--- | :--- | :--- |
| **Vice Chancellor (V.C.)** | `vc@uok.edu.pk` | `Softsols@123` | MAIN_ADMIN |
| **Super Admin** | `admin@uok.edu.pk` | `Softsols@123` | SUPER_ADMIN |
| **Dean Office (Sub-Admin)**| `dean@uok.edu.pk` | `Softsols@123` | SUB_ADMIN |
| **General Admin** | `sysadmin@uok.edu.pk` | `Softsols@123` | SUB_ADMIN |
| **HOD (Pharmacology)** | `hod.pharma@uok.edu.pk` | `Softsols@123` | HOD |

---
**Note:** The system is fully synchronized. Changes on Web reflect instantly on Mobile.
