# MediMind AI — Error Handling

## Document Information

| Field | Value |
| --- | --- |
| Document Name | Error Handling |
| Project | MediMind AI |
| Version | 1.0 |
| Status | Draft |
| Author | Purnesh Kalavagunta |
| Last Updated | August 2026 |
| Error Style | Centralized, Secure, Consistent |

---

# 1. Overview

This document defines the application’s standard approach to error handling for MediMind AI.

The primary goals are to:

- Return clear and consistent errors to clients
- Avoid exposing internal implementation details
- Use standard HTTP status codes
- Centralize exception handling
- Log technical details internally for diagnosis
- Provide predictable behavior for API consumers

The platform follows a centralized exception-handling model so business logic, controllers, and services do not each invent their own error format.

```text
Client Request
   |
   v
Controller
   |
   v
Validation / Service Logic
   |
   v
Repository / External Call
   |
   v
Exception Raised
   |
   v
Global Exception Handler
   |
   +----> Log technical details internally
   |
   +----> Build secure API response
   |
   v
Client
```

---

# 2. Error Handling Goals

The system should ensure that errors are:

- Predictable
- Secure
- Easy to debug internally
- Meaningful to end users without exposing internals
- Consistent across endpoints and modules

The API must never leak:

- Stack traces
- SQL queries
- Internal file paths
- Database connection details
- Passwords or secrets
- Debug environment configuration

---

# 3. Standard Error Response

All API errors should follow a consistent format.

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address."
      }
    ],
    "timestamp": "2026-08-28T12:30:45Z",
    "path": "/api/v1/users"
  }
}
```

This structure allows clients to parse errors consistently while keeping internal details restricted to logs.

---

# 4. HTTP Status Codes

The API should use standard HTTP status codes.

| Status Code | Meaning | Typical Use |
| --- | --- | --- |
| 400 | Bad Request | Malformed request or invalid payload |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not allowed |
| 404 | Not Found | Resource missing |
| 409 | Conflict | Duplicate or conflicting state |
| 422 | Unprocessable Entity | Validation failure |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server-side failure |
| 502 | Bad Gateway | Upstream dependency failure |
| 503 | Service Unavailable | Temporary service degradation |

---

# 5. Validation Errors

Invalid input should return 422 Unprocessable Entity.

Example:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "One or more fields are invalid.",
    "details": [
      {
        "field": "email",
        "message": "Invalid email address."
      }
    ]
  }
}
```

Validation should happen before business logic execution, ideally at the controller or service boundary using request schemas and validator rules.

---

# 6. Authentication Errors

Missing or invalid authentication should return 401 Unauthorized.

Example:

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication is required."
  }
}
```

The system should avoid revealing whether the failure was caused by a missing token, invalid token, expired token, or invalid user/password combination.

---

# 7. Authorization Errors

When a user is authenticated but not allowed to perform an action, the API should return 403 Forbidden.

Example:

```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "You do not have permission to perform this action."
  }
}
```

Authorization checks must be enforced on the server and must not trust client-side role information.

---

# 8. Resource Not Found

If a requested resource does not exist, the application should return 404 Not Found.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found."
  }
}
```

For security-sensitive cases, the system may intentionally return a generic 404 even when a resource exists but belongs to another user. This prevents enumeration.

---

# 9. Conflict Errors

When an operation conflicts with the current resource state, return 409 Conflict.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_CONFLICT",
    "message": "The resource already exists."
  }
}
```

Examples include:

- Duplicate email address
- Duplicate appointment slot
- Conflicting account state
- Duplicate patient identity record

---

# 10. Rate Limit Errors

When the client exceeds the configured request limit, return 429 Too Many Requests.

Example:

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

The response may include headers such as:

```http
Retry-After: 60
```

---

# 11. External Service Errors

If an upstream service fails, the API should not expose raw internal details to the client.

Example flow:

```text
External service
   |
   X
 Timeout / failure
   |
   v
Application
   |
   v
Return 502 Bad Gateway
```

Example response:

```json
{
  "success": false,
  "error": {
    "code": "EXTERNAL_SERVICE_ERROR",
    "message": "The requested service is temporarily unavailable."
  }
}
```

Backend logs should contain the actual upstream error details and diagnostics.

---

# 12. Database and Infrastructure Errors

Database exceptions should be handled centrally and reported to clients in a generic way.

The application should typically return 500 Internal Server Error for unexpected failures.

Technical details such as:

- SQL statements
- Connection strings
- Table names
- Stack traces
- Internal hostnames

must remain in internal logs only.

---

# 13. Global Exception Handling

The backend should use a centralized exception handler.

For a Spring Boot application, this is commonly implemented with:

```java
@RestControllerAdvice
```

This handler should map domain and technical exceptions to consistent error responses and HTTP codes.

Example mapping:

```text
BusinessException
   |
   v
GlobalExceptionHandler
   |
   v
HTTP status + error code + message
```

---

# 14. Business Exceptions

Expected business failures should use domain-specific exceptions.

Examples include:

- UserNotFoundException
- PatientNotFoundException
- InvalidCredentialsException
- DuplicateResourceException
- UnauthorizedResourceAccessException
- AppointmentNotAvailableException

These should be translated into predictable API responses instead of raw exceptions leaking to clients.

---

# 15. Security Considerations for Errors

Error responses must be designed to minimize information leakage.

The application should avoid exposing:

- Internal exception names
- Database stack traces
- File system paths
- Secret values
- Detailed business data in failure responses

Sensitive operations such as profile access, document download, or authentication failures should use generic but appropriate responses.

---

# 16. Logging and Diagnostics

Technical errors should be logged internally with structured metadata.

Good log fields include:

- Timestamp
- Service name
- Request ID
- Endpoint
- Method
- User ID or correlation ID where appropriate
- Error code
- Exception type
- Stack trace or diagnostic context

This ensures engineers can investigate issues without exposing the same data to end users.

---

# 17. Error Handling Summary

| Area | Requirement |
| --- | --- |
| Response Format | Consistent JSON error envelope |
| Security | No stack traces or internal details in client responses |
| Validation | 422 for invalid input |
| Auth | 401 for missing/invalid credentials |
| Authorization | 403 for disallowed actions |
| Not Found | 404 for missing resources |
| Conflict | 409 for duplicate or conflicting states |
| Rate Limit | 429 with Retry-After where relevant |
| External Services | 502 or 503 with safe user-facing message |
| Internal Failures | Generic 500 with technical details logged only internally |

---

# 18. Relationship With Other System Design Documents

This document supports the wider system by ensuring each module fails in a secure and consistent way.

```text
01 Requirements
   |
   v
02 Architecture
   |
   v
03 Component Design
   |
   v
04 Data Flow
   |
   v
05 Database Design
   |
   v
06 API Design
   |
   v
07 API Documentation
   |
   v
08 Security Design
   |
   v
09 Caching Strategy
   |
   v
10 Error Handling
   |
   +----> 11 Logging & Monitoring
   |
   +----> 12 Deployment Architecture
   |
   +----> 13 Scalability
   |
   +----> 14 Disaster Recovery
```

A well-designed error-handling strategy is essential for secure operations, customer trust, and operational troubleshooting.
