# MediMind AI — Database Schema

## Document Information

| Field | Value |
|---|---|
| Document Name | Database Design |
| Project | MediMind AI |
| Version | 1.0 |
| Status | Draft |
| Author | Purnesh Kalavagunta |
| Last Updated | August 2026 |
| Database | PostgreSQL |

---

# 1. Purpose

This document defines the relational database architecture for MediMind AI.

It describes:

- Database entities
- Attributes
- Primary Keys
- Foreign Keys
- Relationships
- Constraints
- Indexing Strategy
- Data Integrity Rules

The database is designed to support the Version 1 healthcare management platform while allowing future expansion for AI, mobile applications, payments, telemedicine, and multi-hospital functionality.

---

# 2. Database Technology

## PostgreSQL

PostgreSQL will be used as the primary relational database.

Reasons:

- Strong relational integrity
- ACID transactions
- Excellent support for complex relationships
- Strong indexing capabilities
- JSON/JSONB support
- Full-text search capabilities
- `pgvector` support for future AI/RAG functionality
- Open-source and free for local development

---

# 3. Database Naming Conventions

## Tables

Use `snake_case` and plural table names.

Examples:


users
patients
doctors
appointments
medical_records

---

# 4. Common Audit Fields

Most major entities should contain:

- id
- created_at
- updated_at

Entities that require deletion tracking may also contain:

- deleted_at

Security-sensitive entities may additionally contain:

- created_by
- updated_by

---

# 5. Core Entities

Version 1 will contain the following primary entities:

- users
- roles
- patients
- doctors
- clinics
- doctor_clinics
- doctor_availability
- appointments
- medical_records
- prescriptions
- prescription_items
- medicines
- medicine_reminders
- notifications
- audit_logs

---

# 6. Entity : Users

The users table represent the authentication identity of every platform user.

| Column         | Type         | Constraints      |
| -------------- | ------------ | ---------------- |
| id             | UUID         | PK               |
| email          | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash  | VARCHAR(255) | NOT NULL         |
| first_name     | VARCHAR(100) | NOT NULL         |
| last_name      | VARCHAR(100) | NOT NULL         |
| phone_number   | VARCHAR(30)  | NULL             |
| role_id        | UUID         | FK               |
| status         | VARCHAR(30)  | NOT NULL         |
| email_verified | BOOLEAN      | NOT NULL         |
| last_login_at  | TIMESTAMP    | NULL             |
| created_at     | TIMESTAMP    | NOT NULL         |
| updated_at     | TIMESTAMP    | NOT NULL         |

---

# 7. Entity : roles

Stores application roles.

| Column      | Type         | Constraints      |
| ----------- | ------------ | ---------------- |
| id          | UUID         | PK               |
| name        | VARCHAR(50)  | UNIQUE, NOT NULL |
| description | VARCHAR(255) | NULL             |

---

# 8. Entity : patients

Stores patient-specific information.

| Column                  | Type         | Constraints |
| ----------------------- | ------------ | ----------- |
| id                      | UUID         | PK          |
| user_id                 | UUID         | FK, UNIQUE  |
| date_of_birth           | DATE         | NULL        |
| gender                  | VARCHAR(30)  | NULL        |
| blood_group             | VARCHAR(10)  | NULL        |
| height_cm               | DECIMAL      | NULL        |
| weight_kg               | DECIMAL      | NULL        |
| emergency_contact_name  | VARCHAR(150) | NULL        |
| emergency_contact_phone | VARCHAR(30)  | NULL        |
| created_at              | TIMESTAMP    | NOT NULL    |
| updated_at              | TIMESTAMP    | NOT NULL    |

---

# 9. Entity : doctors

Stores doctor-specific information.

| Column           | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| id               | UUID          | PK          |
| user_id          | UUID          | FK, UNIQUE  |
| specialization   | VARCHAR(150)  | NOT NULL    |
| qualification    | VARCHAR(255)  | NOT NULL    |
| experience_years | INTEGER       | NOT NULL    |
| consultation_fee | DECIMAL(10,2) | NULL        |
| license_number   | VARCHAR(100)  | UNIQUE      |
| approval_status  | VARCHAR(30)   | NOT NULL    |
| bio              | TEXT          | NULL        |
| created_at       | TIMESTAMP     | NOT NULL    |
| updated_at       | TIMESTAMP     | NOT NULL    |

---

# 10. Entity : clinics

Stores clinic information.

| Column         | Type         | Constraints |
| -------------- | ------------ | ----------- |
| id             | UUID         | PK          |
| name           | VARCHAR(255) | NOT NULL    |
| address_line_1 | VARCHAR(255) | NOT NULL    |
| address_line_2 | VARCHAR(255) | NULL        |
| city           | VARCHAR(100) | NOT NULL    |
| postcode       | VARCHAR(30)  | NULL        |
| phone_number   | VARCHAR(30)  | NULL        |
| email          | VARCHAR(255) | NULL        |
| is_active      | BOOLEAN      | NOT NULL    |
| created_at     | TIMESTAMP    | NOT NULL    |
| updated_at     | TIMESTAMP    | NOT NULL    |

---

# 11. Entity : doctor_clinics

Represents the many-to-many relationship between doctors and clinics.

| Column     | Type      | Constraints |
| ---------- | --------- | ----------- |
| doctor_id  | UUID      | PK, FK      |
| clinic_id  | UUID      | PK, FK      |
| created_at | TIMESTAMP | NOT NULL    |


---

# 12. Entity : doctor_availability

Defines when a doctor is available for appointments.

| Column      | Type      | Constraints |
| ----------- | --------- | ----------- |
| id          | UUID      | PK          |
| doctor_id   | UUID      | FK          |
| day_of_week | SMALLINT  | NOT NULL    |
| start_time  | TIME      | NOT NULL    |
| end_time    | TIME      | NOT NULL    |
| is_active   | BOOLEAN   | NOT NULL    |
| created_at  | TIMESTAMP | NOT NULL    |
| updated_at  | TIMESTAMP | NOT NULL    |

---

# 13. Entity : appointments

Stores patient-doctor appointments.

| Column           | Type        | Constraints |
| ---------------- | ----------- | ----------- |
| id               | UUID        | PK          |
| patient_id       | UUID        | FK          |
| doctor_id        | UUID        | FK          |
| appointment_date | DATE        | NOT NULL    |
| start_time       | TIME        | NOT NULL    |
| end_time         | TIME        | NOT NULL    |
| status           | VARCHAR(30) | NOT NULL    |
| reason           | TEXT        | NULL        |
| notes            | TEXT        | NULL        |
| created_at       | TIMESTAMP   | NOT NULL    |
| updated_at       | TIMESTAMP   | NOT NULL    |

---

# 14. Entity : medical_records

Stores metadata for uploaded medical documents.

The actual files should not be stored directly in PostgreSQL

Files will eventually stored in AWS S3

| Column      | Type         | Constraints |
| ----------- | ------------ | ----------- |
| id          | UUID         | PK          |
| patient_id  | UUID         | FK          |
| uploaded_by | UUID         | FK          |
| record_type | VARCHAR(50)  | NOT NULL    |
| title       | VARCHAR(255) | NOT NULL    |
| description | TEXT         | NULL        |
| file_name   | VARCHAR(255) | NOT NULL    |
| file_path   | TEXT         | NOT NULL    |
| mime_type   | VARCHAR(100) | NOT NULL    |
| file_size   | BIGINT       | NOT NULL    |
| record_date | DATE         | NULL        |
| created_at  | TIMESTAMP    | NOT NULL    |
| updated_at  | TIMESTAMP    | NOT NULL    |
| deleted_at  | TIMESTAMP    | NULL        |

---

# 15. Entity : prescriptions

Represents a prescription issued by a doctor

| Column            | Type        | Constraints |
| ----------------- | ----------- | ----------- |
| id                | UUID        | PK          |
| patient_id        | UUID        | FK          |
| doctor_id         | UUID        | FK          |
| appointment_id    | UUID        | FK          |
| prescription_date | DATE        | NOT NULL    |
| notes             | TEXT        | NULL        |
| status            | VARCHAR(30) | NOT NULL    |
| created_at        | TIMESTAMP   | NOT NULL    |
| updated_at        | TIMESTAMP   | NOT NULL    |

---

# 16. Entity : prescription_items

A prescription can contain multiple medicines.

| Column          | Type         | Constraints |
| --------------- | ------------ | ----------- |
| id              | UUID         | PK          |
| prescription_id | UUID         | FK          |
| medicine_id     | UUID         | FK          |
| dosage          | VARCHAR(100) | NOT NULL    |
| frequency       | VARCHAR(100) | NOT NULL    |
| duration_days   | INTEGER      | NULL        |
| instructions    | TEXT         | NULL        |

---

# 17. Entity : medicines

Stores medicine information.

| Column          | Type         | Constraints |
| --------------- | ------------ | ----------- |
| id              | UUID         | PK          |
| prescription_id | UUID         | FK          |
| medicine_id     | UUID         | FK          |
| dosage          | VARCHAR(100) | NOT NULL    |
| frequency       | VARCHAR(100) | NOT NULL    |
| duration_days   | INTEGER      | NULL        |
| instructions    | TEXT         | NULL        |

---

# 18. Entity : medicine_reminders

Stores patient medication reminders.

| Column        | Type         | Constraints |
| ------------- | ------------ | ----------- |
| id            | UUID         | PK          |
| patient_id    | UUID         | FK          |
| medicine_id   | UUID         | FK          |
| dosage        | VARCHAR(100) | NOT NULL    |
| frequency     | VARCHAR(100) | NOT NULL    |
| start_date    | DATE         | NOT NULL    |
| end_date      | DATE         | NULL        |
| reminder_time | TIME         | NULL        |
| is_active     | BOOLEAN      | NOT NULL    |
| created_at    | TIMESTAMP    | NOT NULL    |
| updated_at    | TIMESTAMP    | NOT NULL    |


---

# 19. Entity : notifications

Stores user notifications.

| Column         | Type         | Constraints |
| -------------- | ------------ | ----------- |
| id             | UUID         | PK          |
| user_id        | UUID         | FK          |
| type           | VARCHAR(50)  | NOT NULL    |
| title          | VARCHAR(255) | NOT NULL    |
| message        | TEXT         | NOT NULL    |
| reference_type | VARCHAR(50)  | NULL        |
| reference_id   | UUID         | NULL        |
| is_read        | BOOLEAN      | NOT NULL    |
| created_at     | TIMESTAMP    | NOT NULL    |

---

# 20. Entity : audit_logs

Tracks security-sensitive and administrative operations.

| Column      | Type         | Constraints |
| ----------- | ------------ | ----------- |
| id          | UUID         | PK          |
| user_id     | UUID         | FK          |
| action      | VARCHAR(100) | NOT NULL    |
| entity_type | VARCHAR(100) | NULL        |
| entity_id   | UUID         | NULL        |
| ip_address  | VARCHAR(45)  | NULL        |
| user_agent  | TEXT         | NULL        |
| metadata    | JSONB        | NULL        |
| created_at  | TIMESTAMP    | NOT NULL    |
