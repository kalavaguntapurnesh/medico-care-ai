# Software Requirements Specification (SRS)

# MediMind AI

## Document Information

| Field | Value |
|-------|-------|
| Document Name | Software Requirements Specification |
| Project | MediMind AI |
| Version | 1.0 |
| Status | Draft |
| Author | Purnesh Kalavagunta |
| Last Updated | August 2026 |

---

# 1. Introduction

## 1.1 Purpose

This document defines the functional and non-functional requirements for MediMind AI. It serves as the primary reference for the design, development, testing, and maintenance of the system.

---

## 1.2 Project Scope

MediMind AI is a web-based healthcare management platform that enables patients, doctors, and administrators to manage healthcare information efficiently.

The first version focuses on:

- User authentication
- Patient management
- Doctor management
- Appointment scheduling
- Medical record management
- Prescription management
- Medicine reminders
- Notifications

Artificial Intelligence features will be introduced in later versions.

---

# 2. Stakeholders

| Stakeholder | Responsibility |
|-------------|----------------|
| Patient | Manage personal healthcare information |
| Doctor | Manage appointments and patient records |
| Administrator | Manage users and system operations |
| Development Team | Design, build, test and maintain the application |

---

# 3. User Roles

## 3.1 Administrator

The administrator has complete access to the platform.

Responsibilities include:

- Manage users
- Manage doctors
- Activate or deactivate accounts
- View system analytics
- Manage notifications
- Monitor application activity

---

## 3.2 Doctor

Doctors can:

- Manage profile
- View appointments
- Accept appointments
- Reject appointments
- Complete appointments
- View patient records
- Upload prescriptions
- Add consultation notes

---

## 3.3 Patient

Patients can:

- Register
- Login
- Update profile
- Search doctors
- Book appointments
- Upload medical records
- View prescriptions
- Manage medicine reminders
- Receive notifications

---

# 4. Functional Requirements

## Module 1 – Authentication

### Features

- User Registration
- Login
- Logout
- Forgot Password
- Reset Password
- Email Verification
- Refresh Token

### Business Rules

- Email must be unique.
- Password must be encrypted.
- JWT authentication is required.
- Only verified users can log in.

---

## Module 2 – User Profile

Users shall be able to:

- View profile
- Edit profile
- Upload profile picture
- Change password
- Update contact information

---

## Module 3 – Doctor Management

Doctors shall be able to:

- Create profile
- Update profile
- Manage availability
- Set consultation timings
- Update qualifications
- Update specialization

Administrators shall:

- Approve doctors
- Suspend doctors
- Delete doctors

---

## Module 4 – Patient Management

Patients shall be able to:

- Manage personal information
- Update emergency contact
- Manage allergies
- View medical history

---

## Module 5 – Appointment Management

Patients shall:

- Search doctors
- Filter by specialization
- Select date
- Select available time slot
- Book appointment
- Cancel appointment
- Reschedule appointment

Doctors shall:

- Accept appointments
- Reject appointments
- Mark appointments completed

---

## Module 6 – Medical Records

Patients shall:

- Upload PDF reports
- Upload image reports
- Download reports
- Delete reports

Doctors shall:

- View reports
- Add medical notes

---

## Module 7 – Prescriptions

Doctors shall:

- Create prescriptions
- Update prescriptions
- View previous prescriptions

Patients shall:

- View prescriptions
- Download prescriptions

---

## Module 8 – Medicine Reminders

Patients shall:

- Add medicine
- Set dosage
- Set reminder frequency
- Edit reminder
- Delete reminder

System shall:

- Notify users at scheduled times

---

## Module 9 – Notifications

The system shall send notifications for:

- Appointment booked
- Appointment cancelled
- Appointment approved
- Appointment rejected
- Upcoming appointment
- Medicine reminder

---

# 5. Non-Functional Requirements

## Performance

- API response time should be less than 2 seconds under normal load.
- Dashboard should load within 3 seconds.

---

## Security

- JWT Authentication
- Password hashing (BCrypt)
- HTTPS in production
- Role-Based Access Control
- Secure file uploads
- Input validation

---

## Reliability

- Daily database backups (production)
- Graceful error handling
- Audit logging for critical actions

---

## Scalability

The architecture should support:

- Multiple hospitals (future)
- Mobile applications
- AI services
- Cloud deployment

---

## Availability

Target uptime:

99.9%

---

## Maintainability

- Layered architecture
- Modular codebase
- RESTful APIs
- Documentation
- Unit tests

---

# 6. Constraints

Version 1 will not include:

- AI Chat
- OCR
- Video consultation
- Online payment
- Wearable integration
- Multi-hospital support

---

# 7. Assumptions

- Internet connection is available.
- Users possess valid email addresses.
- Doctors are verified by administrators before using the system.

---

# 8. Future Enhancements

Version 2:

- AI Medical Assistant
- AI Symptom Checker
- OCR Prescription Reader
- Medical Report Summarization
- Voice Assistant
- Telemedicine
- Health Analytics
- Family Accounts

---

# 9. Acceptance Criteria

The system shall be considered Version 1 complete when:

✓ Patients can register and login.

✓ Doctors can manage appointments.

✓ Patients can upload medical records.

✓ Prescriptions can be managed.

✓ Medicine reminders function correctly.

✓ Notifications are delivered.

✓ Role-based authorization is enforced.

✓ REST APIs are documented.

✓ The application is deployable to production.