# MediMind AI — Database Design

## Document Information

| Field         | Value               |
| ------------- | ------------------- |
| Document Name | Database Design     |
| Project       | MediMind AI         |
| Version       | 1.0                 |
| Status        | Draft               |
| Author        | Purnesh Kalavagunta |
| Last Updated  | August 2026         |
| Database      | PostgreSQL          |

---

# 1. Purpose

This document defines the relational database architecture for MediMind AI.

It describes:

* Database entities
* Attributes
* Primary keys
* Foreign keys
* Relationships
* Constraints
* Indexing strategy
* Data integrity rules

The database is designed to support the Version 1 healthcare management platform while allowing future expansion for AI, mobile applications, payments, telemedicine, and multi-hospital functionality.

---

# 2. Database Technology

## PostgreSQL

PostgreSQL will be used as the primary relational database.

Reasons:

* Strong relational integrity
* ACID transactions
* Excellent support for complex relationships
* Strong indexing capabilities
* JSON/JSONB support
* Full-text search capabilities
* `pgvector` support for future AI/RAG functionality
* Open-source and free for local development

---

# 3. Database Naming Conventions

## Tables

Use `snake_case` and plural table names.

Examples:

```text
users
patients
doctors
appointments
medical_records
```

---

## Columns

Use `snake_case`.

Examples:

```text
first_name
created_at
appointment_date
doctor_id
```

---

## Primary Keys

Every primary entity will use:

```text
id
```

For V1, UUIDs are recommended.

Example:

```text
id UUID PRIMARY KEY
```

UUIDs provide several advantages for a healthcare application:

* Avoid exposing sequential IDs
* Better suited for distributed systems
* Easier future integration with multiple services

---

# 4. Common Audit Fields

Most major entities should contain:

```text
id
created_at
updated_at
```

Entities that require deletion tracking may also contain:

```text
deleted_at
```

Security-sensitive entities may additionally contain:

```text
created_by
updated_by
```

---

# 5. Core Entities

Version 1 will contain the following primary entities:

```text
users
roles
patients
doctors
doctor_availability
appointments
medical_records
prescriptions
prescription_items
medicines
medicine_reminders
notifications
audit_logs
```

---

# 6. Entity: users

The `users` table represents the authentication identity of every platform user.

## Fields

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

# 7. Entity: roles

Stores application roles.

## Fields

| Column      | Type         | Constraints      |
| ----------- | ------------ | ---------------- |
| id          | UUID         | PK               |
| name        | VARCHAR(50)  | UNIQUE, NOT NULL |
| description | VARCHAR(255) | NULL             |

Initial roles:

```text
PATIENT
DOCTOR
ADMIN
```

---

# 8. Entity: patients

Stores patient-specific information.

## Fields

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

### Relationship

```text
users 1 ───── 1 patients
```

A patient profile belongs to exactly one user account.

---

# 9. Entity: doctors

Stores doctor-specific information.

## Fields

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

Possible approval states:

```text
PENDING
APPROVED
REJECTED
SUSPENDED
```

---

# 10. Entity: doctor_availability

Defines when a doctor is available for appointments.

## Fields

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

Example:

```text
Monday
09:00
17:00
```

---

# 11. Entity: appointments

Stores patient-doctor appointments.

## Fields

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

Possible statuses:

```text
PENDING
CONFIRMED
REJECTED
CANCELLED
COMPLETED
NO_SHOW
```

### Relationships

```text
patients 1 ───── * appointments

doctors  1 ───── * appointments
```

---

# 12. Entity: medical_records

Stores metadata for uploaded medical documents.

The actual files should not be stored directly in PostgreSQL.

Files will eventually be stored in AWS S3.

## Fields

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

Possible record types:

```text
BLOOD_TEST
XRAY
MRI
CT_SCAN
ECG
PRESCRIPTION
VACCINATION
OTHER
```

### Important

For local development:

```text
Local File System
        ↓
Spring Boot
        ↓
PostgreSQL metadata
```

For production:

```text
User
 ↓
Spring Boot
 ↓
AWS S3
 ↓
PostgreSQL stores file metadata
```

---

# 13. Entity: prescriptions

Represents a prescription issued by a doctor.

## Fields

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

Possible statuses:

```text
ACTIVE
COMPLETED
CANCELLED
```

---

# 14. Entity: prescription_items

A prescription can contain multiple medicines.

## Fields

| Column          | Type         | Constraints |
| --------------- | ------------ | ----------- |
| id              | UUID         | PK          |
| prescription_id | UUID         | FK          |
| medicine_id     | UUID         | FK          |
| dosage          | VARCHAR(100) | NOT NULL    |
| frequency       | VARCHAR(100) | NOT NULL    |
| duration_days   | INTEGER      | NULL        |
| instructions    | TEXT         | NULL        |

### Relationship

```text
prescriptions 1 ───── * prescription_items

medicines     1 ───── * prescription_items
```

---

# 15. Entity: medicines

Stores medicine information.

## Fields

| Column       | Type         | Constraints |
| ------------ | ------------ | ----------- |
| id           | UUID         | PK          |
| name         | VARCHAR(255) | NOT NULL    |
| generic_name | VARCHAR(255) | NULL        |
| description  | TEXT         | NULL        |
| created_at   | TIMESTAMP    | NOT NULL    |
| updated_at   | TIMESTAMP    | NOT NULL    |

---

# 16. Entity: medicine_reminders

Stores patient medication reminders.

## Fields

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

# 17. Entity: notifications

Stores user notifications.

## Fields

| Column       | Type         | Constraints |
| ------------ | ------------ | ----------- |
| id           | UUID         | PK          |
| user_id      | UUID         | FK          |
| type         | VARCHAR(50)  | NOT NULL    |
| title        | VARCHAR(255) | NOT NULL    |
| message      | TEXT         | NOT NULL    |
| reference_id | UUID         | NULL        |
| is_read      | BOOLEAN      | NOT NULL    |
| created_at   | TIMESTAMP    | NOT NULL    |

---

# 18. Entity: audit_logs

Tracks security-sensitive and administrative operations.

## Fields

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

Examples:

```text
LOGIN
LOGOUT
MEDICAL_RECORD_VIEW
MEDICAL_RECORD_UPLOAD
PRESCRIPTION_CREATED
DOCTOR_APPROVED
USER_SUSPENDED
```

---

# 19. Entity Relationships

The initial relationship model is:

```text
                    ┌─────────────┐
                    │    roles    │
                    └──────┬──────┘
                           │
                           │
                    ┌──────▼──────┐
                    │    users    │
                    └───┬─────┬───┘
                        │     │
              ┌─────────┘     └─────────┐
              ▼                         ▼
        ┌───────────┐             ┌───────────┐
        │ patients  │             │  doctors  │
        └─────┬─────┘             └─────┬─────┘
              │                         │
              │                         │
              └──────────┐   ┌──────────┘
                         ▼   ▼
                    ┌─────────────┐
                    │appointments │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │prescriptions│
                    └──────┬──────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │prescription_items│
                  └────────┬────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  medicines  │
                    └─────────────┘

        patients
           │
           ├──────────────► medical_records
           │
           ├──────────────► medicine_reminders
           │
           └──────────────► appointments

        users
           │
           ├──────────────► notifications
           │
           └──────────────► audit_logs
```

---

# 20. Referential Integrity

Foreign keys must be enforced by PostgreSQL.

Examples:

```text
patients.user_id
    → users.id

doctors.user_id
    → users.id

appointments.patient_id
    → patients.id

appointments.doctor_id
    → doctors.id

medical_records.patient_id
    → patients.id

prescriptions.patient_id
    → patients.id

prescriptions.doctor_id
    → doctors.id

prescriptions.appointment_id
    → appointments.id
```

---

# 21. Important Constraints

## Unique Constraints

The following should be unique:

```text
users.email

doctors.license_number

patients.user_id

doctors.user_id
```

---

## Appointment Integrity

The application and database layer must prevent overlapping confirmed appointments.

Rules:

* A doctor cannot have overlapping confirmed appointments.
* A patient cannot have overlapping confirmed appointments.
* Appointment end time must be greater than start time.

---

# 22. Indexing Strategy

Indexes should be added to frequently queried columns.

Initial indexes:

```text
users.email

appointments.patient_id

appointments.doctor_id

appointments.appointment_date

medical_records.patient_id

prescriptions.patient_id

prescriptions.doctor_id

notifications.user_id

notifications.is_read
```

Composite indexes may be introduced after query patterns are established.

---

# 23. Soft Deletion

Important healthcare records should generally not be physically deleted immediately.

For appropriate entities we may use:

```text
deleted_at TIMESTAMP NULL
```

A record is considered active when:

```text
deleted_at IS NULL
```

The exact retention policy will be finalized before production deployment.

---

# 24. Local Development

During development:

```text
Application
     │
     ▼
Spring Boot
     │
     ▼
PostgreSQL
     │
     ▼
DBeaver
```

PostgreSQL will run locally.

No paid database service is required.

---

# 25. Production Architecture

The initial production architecture will use:

```text
React
   │
   ▼
Nginx
   │
   ▼
Spring Boot
   │
   ├──────────────► PostgreSQL / AWS RDS
   │
   └──────────────► AWS S3
```

---

# 26. Future AI Database Extensions

AI functionality will introduce additional entities later.

Potential tables:

```text
ai_conversations

ai_messages

ai_document_chunks

ai_embeddings

ai_health_insights

ai_processing_jobs
```

These will not be added to the Version 1 schema until the AI architecture is designed.

---

# 27. Future Scalability

The database should be designed so future features can introduce:

* Hospitals
* Clinics
* Departments
* Healthcare providers
* Family accounts
* Insurance
* Payments
* Telemedicine
* AI document processing

without requiring a complete database redesign.

---

# 28. Database Design Principles

The following principles will be followed:

1. Maintain referential integrity.
2. Avoid unnecessary data duplication.
3. Use UUID primary keys.
4. Use explicit foreign keys.
5. Use database constraints for data integrity.
6. Keep healthcare files outside the relational database.
7. Maintain auditability for sensitive operations.
8. Avoid permanent deletion of important healthcare records.
9. Add indexes based on actual query patterns.
10. Keep AI-specific data isolated from core healthcare entities.
11. Use database migrations rather than manually modifying production schemas.
12. Prefer normalized relational structures for transactional data.

---

# 29. Database Migration Strategy

Flyway will be used to manage schema changes.

Example:

```text
db/migration/

V1__create_roles.sql
V2__create_users.sql
V3__create_patients.sql
V4__create_doctors.sql
V5__create_appointments.sql
...
```

Database changes must be version-controlled.

---

# 30. Next Step

The database design will be reviewed against the Business Rules document before implementation.

After approval, the next design phase will define:

* REST API endpoints
* HTTP methods
* Request DTOs
* Response DTOs
* Validation rules
* Authentication requirements
* Authorization requirements
* Error responses
* API versioning
