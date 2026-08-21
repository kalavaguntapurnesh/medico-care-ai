# MediMind AI — Business Rules

## Document Information

| Field         | Value               |
| ------------- | ------------------- |
| Document Name | Business Rules      |
| Project       | MediMind AI         |
| Version       | 1.0                 |
| Status        | Draft               |
| Author        | Purnesh Kalavagunta |
| Last Updated  | 21st August 2026         |

---

# 1. Purpose

This document defines the business rules that govern how MediMind AI operates.

Business rules define the conditions, restrictions, permissions, and expected behavior of the application.

These rules will be used as the foundation for:

* Database design
* API design
* Backend validation
* Frontend validation
* Authorization
* Automated testing

---

# 2. General Rules

## BR-GEN-001 — Unique Email

Every user must have a unique email address.

A single email address cannot be associated with multiple user accounts.

---

## BR-GEN-002 — Account Status

Every user account must have an account status.

Possible statuses:

* `PENDING`
* `ACTIVE`
* `SUSPENDED`
* `DEACTIVATED`

Only `ACTIVE` users can access protected application features.

---

## BR-GEN-003 — Role-Based Access

Users can only access functionality permitted by their assigned role.

Roles:

* `PATIENT`
* `DOCTOR`
* `ADMIN`

---

## BR-GEN-004 — User Ownership

Users can modify their own personal information unless an administrator has permission to modify it.

A patient cannot modify another patient's profile.

A doctor cannot modify another doctor's profile.

---

# 3. Authentication Rules

## BR-AUTH-001 — Password Security

Passwords must never be stored in plain text.

Passwords must be securely hashed using BCrypt or an equivalent password hashing algorithm.

---

## BR-AUTH-002 — Login

A user must provide valid credentials to authenticate.

Invalid credentials must not reveal whether the email address exists.

---

## BR-AUTH-003 — Account Verification

New accounts may require email verification before accessing protected functionality.

---

## BR-AUTH-004 — Suspended Accounts

Suspended users cannot authenticate successfully.

---

## BR-AUTH-005 — Token Expiration

Access tokens must expire after a defined period.

Refresh tokens may be used to obtain a new access token while the refresh token remains valid.

---

# 4. Doctor Rules

## BR-DOC-001 — Doctor Approval

A doctor account must be approved by an administrator before the doctor can accept patient appointments.

---

## BR-DOC-002 — Doctor Profile

A doctor profile must contain sufficient information before becoming available for appointment booking.

Required information should include:

* Full name
* Specialization
* Qualification
* Professional experience
* Contact information
* Availability

---

## BR-DOC-003 — Doctor Availability

Doctors can define their available working periods.

Patients can only book appointments during available periods.

---

## BR-DOC-004 — Doctor Suspension

An administrator can suspend a doctor.

A suspended doctor:

* Cannot accept new appointments.
* Cannot appear as available for new bookings.
* Can still have historical records retained.

Existing future appointments require an explicit handling policy.

---

# 5. Patient Rules

## BR-PAT-001 — Patient Profile

A patient should provide required personal information before using appointment-related functionality.

---

## BR-PAT-002 — Medical Information

Patients can maintain information such as:

* Blood group
* Allergies
* Existing medical conditions
* Emergency contact

Patients are responsible for ensuring the accuracy of information they provide.

---

## BR-PAT-003 — Patient Privacy

A patient cannot access another patient's private medical information.

---

# 6. Appointment Rules

## BR-APT-001 — Appointment Ownership

A patient can create appointments only for themselves.

A doctor can manage only appointments associated with their own account.

---

## BR-APT-002 — Appointment Time

An appointment must contain:

* Patient
* Doctor
* Date
* Start time
* End time
* Appointment status

---

## BR-APT-003 — Doctor Availability

An appointment can only be created if the selected doctor is available during the requested time.

---

## BR-APT-004 — Double Booking

A doctor cannot have two confirmed appointments overlapping the same time period.

---

## BR-APT-005 — Patient Double Booking

A patient cannot have two confirmed appointments overlapping the same time period.

---

## BR-APT-006 — Appointment Status

Appointments can have the following statuses:

* `PENDING`
* `CONFIRMED`
* `REJECTED`
* `CANCELLED`
* `COMPLETED`
* `NO_SHOW`

---

## BR-APT-007 — Appointment Confirmation

Depending on the configured workflow, an appointment may require doctor confirmation before becoming `CONFIRMED`.

---

## BR-APT-008 — Cancellation

Patients can cancel their appointments subject to the configured cancellation policy.

Doctors can cancel appointments when necessary.

---

## BR-APT-009 — Completed Appointment

An appointment can only be marked `COMPLETED` after its scheduled appointment time.

---

## BR-APT-010 — Historical Appointments

Completed and cancelled appointments must not be permanently deleted as part of normal user actions.

Historical appointment data should be retained for auditing and medical history purposes.

---

# 7. Medical Record Rules

## BR-MR-001 — Medical Record Ownership

Medical records belong to the patient associated with the record.

---

## BR-MR-002 — Patient Access

A patient can view their own medical records.

A patient cannot access another patient's records.

---

## BR-MR-003 — Doctor Access

A doctor may access a patient's medical records only when the doctor has an authorized relationship with that patient, such as an appointment or explicitly granted access.

---

## BR-MR-004 — File Types

The system should allow approved medical document formats such as:

* PDF
* JPEG
* PNG

Additional formats may be introduced later.

---

## BR-MR-005 — File Size

Uploaded files must comply with a configurable maximum file size.

---

## BR-MR-006 — Secure File Access

Medical files must not be publicly accessible.

File access must be authorized by the backend.

---

## BR-MR-007 — File Deletion

Deleting a medical record should remove or deactivate the application's reference to the file.

Permanent physical deletion may be subject to retention and audit policies.

---

# 8. Prescription Rules

## BR-PRES-001 — Prescription Creation

Only authorized doctors can create prescriptions.

Patients cannot create prescriptions for themselves.

---

## BR-PRES-002 — Prescription Association

Every prescription must be associated with:

* Patient
* Doctor
* Appointment or consultation
* Prescription date

---

## BR-PRES-003 — Prescription Items

A prescription may contain one or more medicines.

Each medicine entry should contain information such as:

* Medicine name
* Dosage
* Frequency
* Duration
* Instructions

---

## BR-PRES-004 — Prescription Modification

Once a prescription has been finalized, it should not be silently modified.

If changes are required, the system should maintain an appropriate version or amendment history.

---

## BR-PRES-005 — Patient Access

Patients can view prescriptions associated with their own account.

---

# 9. Medicine Reminder Rules

## BR-MED-001 — Reminder Ownership

Medicine reminders belong to the patient who created them.

---

## BR-MED-002 — Reminder Information

A reminder should contain:

* Medicine name
* Dosage
* Frequency
* Start date
* End date
* Reminder time
* Active status

---

## BR-MED-003 — Reminder Notifications

The system should generate a notification when an active reminder reaches its scheduled time.

---

## BR-MED-004 — Expired Reminders

Reminders should automatically become inactive after their configured end date.

---

# 10. Notification Rules

## BR-NOT-001 — Notification Ownership

Notifications must belong to a specific user.

---

## BR-NOT-002 — Notification Types

The initial system should support notifications for:

* Appointment booked
* Appointment confirmed
* Appointment rejected
* Appointment cancelled
* Appointment reminder
* Medicine reminder
* System announcements

---

## BR-NOT-003 — Read Status

Notifications should maintain a read/unread state.

---

## BR-NOT-004 — Notification History

Notifications should not disappear simply because the user has read them.

They should remain available according to the system's retention policy.

---

# 11. Administrator Rules

## BR-ADMIN-001 — User Management

Administrators can:

* View users
* Activate users
* Suspend users
* Deactivate users

---

## BR-ADMIN-002 — Doctor Approval

Administrators can approve or reject doctor accounts.

---

## BR-ADMIN-003 — Administrative Access

Administrative access must be protected using role-based authorization.

---

## BR-ADMIN-004 — Auditability

Important administrative actions should be recorded in an audit log.

Examples:

* Doctor approval
* User suspension
* User deactivation
* Permission changes

---

# 12. Data Integrity Rules

## BR-DATA-001 — Required Relationships

Records that depend on another entity must reference a valid existing entity.

For example:

An appointment cannot exist without a valid patient and doctor.

---

## BR-DATA-002 — Referential Integrity

Database foreign-key constraints should be used wherever appropriate.

---

## BR-DATA-003 — Soft Deletion

Important healthcare and audit-related records should generally not be physically deleted immediately.

Where appropriate, records should use a soft-delete or archival mechanism.

---

## BR-DATA-004 — Timestamps

Important entities should maintain:

* `created_at`
* `updated_at`

Relevant records may additionally maintain:

* `deleted_at`
* `created_by`
* `updated_by`

---

# 13. Security and Privacy Rules

## BR-SEC-001 — Least Privilege

Users should receive only the permissions required for their role.

---

## BR-SEC-002 — Sensitive Data

Healthcare information must be treated as sensitive data.

The application must restrict access to authorized users.

---

## BR-SEC-003 — API Authorization

Authentication alone is not sufficient.

Every protected API must verify that the authenticated user has permission to perform the requested action.

---

## BR-SEC-004 — Audit Logging

Sensitive operations should be auditable.

Examples:

* Medical record access
* Medical record upload
* Prescription creation
* Prescription modification
* User permission changes

---

# 14. Future AI Rules

AI functionality will be introduced after Version 1.

## BR-AI-001 — AI Is Assistive

AI-generated information must be presented as assistance and not as a replacement for a qualified healthcare professional.

---

## BR-AI-002 — No Autonomous Diagnosis

The initial AI system must not present an AI response as a confirmed medical diagnosis.

---

## BR-AI-003 — Human Oversight

Clinical decisions remain the responsibility of qualified healthcare professionals.

---

## BR-AI-004 — AI Response Disclaimer

Healthcare-related AI features should clearly communicate appropriate limitations and encourage professional medical advice when necessary.

---

# 15. Business Rule Identification

Business rules use the following naming convention:

```text
BR-[MODULE]-[NUMBER]
```

Examples:

```text
BR-AUTH-001
BR-APT-004
BR-MR-003
BR-PRES-001
```

This allows requirements, APIs, database constraints, and tests to reference specific business rules.

---

# 16. Future Business Rules

The following rules will be defined when the corresponding functionality is introduced:

* Payment rules
* Hospital rules
* Insurance rules
* Telemedicine rules
* Family account rules
* AI rules
* Wearable integration rules
* Multi-hospital rules
* Healthcare provider verification rules

```

This is now a **very useful document**, because when we design the database, we can explicitly ask: *"Which business rule does this column/constraint support?"*

### Next: Database Design

Now I recommend we move to **`04-database-design.md`** and design the database carefully.

We'll do it in this order:

**Entities → relationships → columns → primary keys → foreign keys → indexes → constraints → ER diagram → PostgreSQL schema**

And importantly, we should **not rush the schema**. For a healthcare system, getting the relationships and access model right now will save us significant refactoring later.
```
