# MediMind AI — API Design

## Document Information

| Field | Value |
| --- | --- |
| Document Name | API Design |
| Project | MediMind AI |
| Version | 1.0 |
| Status | Draft |
| Author | Purnesh Kalavagunta |
| Last Updated | August 2026 |
| API Version | v1 |

---

# 1. Overview

The API layer provides the communication interface between the client applications and the backend services.

The system follows a RESTful API architecture and exposes HTTP endpoints for:

- Authentication
- User management
- Profiles
- Properties
- Property management
- Tenants
- Applications
- Leases
- Maintenance requests
- Payments
- Documents
- Notifications
- Admin operations

The API is designed with the following principles:

- RESTful architecture
- JSON request and response bodies
- Stateless communication
- JWT-based authentication
- Role-based authorization
- Consistent error responses
- Input validation
- Pagination for large collections
- Versioned APIs
- Secure handling of sensitive information
- Idempotency for operations where required

---

# 2. API Base URL

All APIs are exposed under a versioned API prefix.

```text
/api/v1
```

For example:

```text
GET /api/v1/properties
```

Production:

```text
https://api.example.com/api/v1
```

Development:

```text
http://localhost:8080/api/v1
```

The API version is included in the URL to allow future versions to coexist without breaking existing clients.

---

# 3. API Architecture

The API follows a layered architecture.

```text
Client
   |
   v
API Gateway / Load Balancer
   |
   v
Controller Layer
   |
   v
Service Layer
   |
   v
Repository Layer
   |
   v
PostgreSQL
```

Additional infrastructure:

```text
                    +----------------+
                    |    Client      |
                    +-------+--------+
                            |
                            v
                    +----------------+
                    | Load Balancer  |
                    +-------+--------+
                            |
                            v
                    +----------------+
                    | Spring Boot API|
                    +-------+--------+
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
    PostgreSQL          Redis Cache        AWS S3
          |
          v
    Persistent Data
```

---

# 4. HTTP Methods

The API uses standard HTTP methods.

| Method | Purpose |
| --- | --- |
| GET | Retrieve resources |
| POST | Create resources |
| PUT | Replace/update resources |
| PATCH | Partially update resources |
| DELETE | Delete resources |

Examples:

- `GET /api/v1/properties` — Retrieve properties.
- `GET /api/v1/properties/{propertyId}` — Retrieve a specific property.
- `POST /api/v1/properties` — Create a property.
- `PATCH /api/v1/properties/{propertyId}` — Update selected property fields.
- `DELETE /api/v1/properties/{propertyId}` — Delete a property.

---

# 5. Resource Naming Convention

Resource names use plural nouns.

Correct:

```text
/users
/properties
/tenants
/applications
/payments
/documents
```

Avoid:

```text
/getUsers
/createProperty
/deleteTenant
```

The HTTP method already describes the operation.

For example:

```text
GET /api/v1/users
POST /api/v1/users
DELETE /api/v1/users/{id}
```

---

# 6. Authentication API

Authentication endpoints are publicly accessible unless otherwise specified.

## 6.1 Register User

`POST /api/v1/auth/register`

Request:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Response:

```http
201 Created
```

```json
{
  "message": "User registered successfully"
}
```

## 6.2 Login

`POST /api/v1/auth/login`

Request:

```json
{
  "email": "john@example.com",
  "password": "SecurePassword123"
}
```

Response:

```json
{
  "accessToken": "jwt-access-token",
  "refreshToken": "refresh-token",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

## 6.3 Refresh Access Token

`POST /api/v1/auth/refresh`

Request:

```json
{
  "refreshToken": "refresh-token"
}
```

Response:

```json
{
  "accessToken": "new-access-token",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

## 6.4 Logout

`POST /api/v1/auth/logout`

Authentication:

```http
Authorization: Bearer <access-token>
```

The server invalidates the refresh token/session.

Response:

```http
204 No Content
```

## 6.5 Forgot Password

`POST /api/v1/auth/forgot-password`

Request:

```json
{
  "email": "john@example.com"
}
```

The API should return a generic response regardless of whether the email exists.

```json
{
  "message": "If the account exists, a password reset link has been sent."
}
```

This prevents account enumeration.

## 6.6 Reset Password

`POST /api/v1/auth/reset-password`

Request:

```json
{
  "token": "password-reset-token",
  "newPassword": "NewSecurePassword123"
}
```

Response:

```http
204 No Content
```

---

# 7. User API

## 7.1 Get Current User

`GET /api/v1/users/me`

Authentication required.

Response:

```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "role": "TENANT",
  "status": "ACTIVE"
}
```

## 7.2 Update Current User

`PATCH /api/v1/users/me`

Request:

```json
{
  "firstName": "John",
  "lastName": "Smith"
}
```

Response:

```json
{
  "id": "uuid",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john@example.com"
}
```

## 7.3 Get User

`GET /api/v1/users/{userId}`

Authorization depends on the requesting user's role and permissions.

## 7.4 Delete User

`DELETE /api/v1/users/{userId}`

Administrative authorization required.

---

# 8. Profile API

## 8.1 Get Profile

`GET /api/v1/profile`

Response:

```json
{
  "userId": "uuid",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+441234567890",
  "profileImageUrl": "https://...",
  "address": {
    "line1": "Example Street",
    "city": "London",
    "postcode": "SW1A 1AA",
    "country": "UK"
  }
}
```

## 8.2 Update Profile

`PATCH /api/v1/profile`

Request:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+441234567890"
}
```

## 8.3 Upload Profile Image

`POST /api/v1/profile/image`

Content type:

```text
multipart/form-data
```

The image is uploaded to object storage and the resulting reference is stored against the user profile.

---

# 9. Property API

## 9.1 Create Property

`POST /api/v1/properties`

Request:

```json
{
  "name": "London Apartment",
  "address": {
    "line1": "123 Example Street",
    "city": "London",
    "postcode": "SW1A 1AA",
    "country": "UK"
  },
  "propertyType": "APARTMENT"
}
```

Response:

```http
201 Created
```

```json
{
  "id": "uuid",
  "name": "London Apartment",
  "propertyType": "APARTMENT",
  "status": "ACTIVE"
}
```

## 9.2 Get Properties

`GET /api/v1/properties`

Supported query parameters:

```text
?page=0
&size=20
&sort=name,asc
&status=ACTIVE
&propertyType=APARTMENT
```

Example:

```text
GET /api/v1/properties?page=0&size=20&sort=name,asc
```

## 9.3 Get Property

`GET /api/v1/properties/{propertyId}`

## 9.4 Update Property

`PATCH /api/v1/properties/{propertyId}`

## 9.5 Delete Property

`DELETE /api/v1/properties/{propertyId}`

Deletion should normally be implemented as a soft delete where business requirements require historical records to remain available.

---

# 10. Property Units API

If a property contains multiple units, units are managed separately.

### Create Unit

`POST /api/v1/properties/{propertyId}/units`

Request:

```json
{
  "unitNumber": "12A",
  "floor": 2,
  "bedrooms": 2,
  "bathrooms": 1,
  "monthlyRent": 1500.00
}
```

### Get Units

`GET /api/v1/properties/{propertyId}/units`

### Get Unit

`GET /api/v1/units/{unitId}`

### Update Unit

`PATCH /api/v1/units/{unitId}`

### Delete Unit

`DELETE /api/v1/units/{unitId}`

---

# 11. Tenant API

## Get Tenants

`GET /api/v1/tenants`

Supported parameters:

```text
?page=0
&size=20
&status=ACTIVE
&search=john
```

## Get Tenant

`GET /api/v1/tenants/{tenantId}`

## Create Tenant

`POST /api/v1/tenants`

## Update Tenant

`PATCH /api/v1/tenants/{tenantId}`

---

# 12. Application API

Property applicants can submit applications for available properties or units.

## Create Application

`POST /api/v1/applications`

Request:

```json
{
  "propertyId": "uuid",
  "unitId": "uuid",
  "message": "I am interested in renting this property."
}
```

## Get Applications

`GET /api/v1/applications`

Supported filters:

```text
?page=0
&size=20
&status=PENDING
&propertyId={propertyId}
```

## Get Application

`GET /api/v1/applications/{applicationId}`

## Update Application Status

`PATCH /api/v1/applications/{applicationId}/status`

Request:

```json
{
  "status": "APPROVED"
}
```

Allowed statuses:

- PENDING
- UNDER_REVIEW
- APPROVED
- REJECTED
- WITHDRAWN

---

# 13. Lease API

## Create Lease

`POST /api/v1/leases`

Request:

```json
{
  "tenantId": "uuid",
  "unitId": "uuid",
  "startDate": "2026-09-01",
  "endDate": "2027-08-31",
  "monthlyRent": 1500.00
}
```

## Get Leases

`GET /api/v1/leases`

Supported filters:

```text
?page=0
&size=20
&status=ACTIVE
&tenantId={tenantId}
&propertyId={propertyId}
```

## Get Lease

`GET /api/v1/leases/{leaseId}`

## Update Lease

`PATCH /api/v1/leases/{leaseId}`

## Terminate Lease

`POST /api/v1/leases/{leaseId}/terminate`

Request:

```json
{
  "terminationDate": "2027-03-31",
  "reason": "Tenant requested termination"
}
```

---

# 14. Maintenance API

Tenants can submit maintenance requests.

## Create Maintenance Request

`POST /api/v1/maintenance-requests`

Request:

```json
{
  "propertyId": "uuid",
  "unitId": "uuid",
  "title": "Leaking kitchen tap",
  "description": "The kitchen tap has been leaking since yesterday.",
  "priority": "MEDIUM"
}
```

## Get Maintenance Requests

`GET /api/v1/maintenance-requests`

Supported filters:

```text
?page=0
&size=20
&status=OPEN
&priority=HIGH
&propertyId={propertyId}
```

## Get Maintenance Request

`GET /api/v1/maintenance-requests/{requestId}`

## Update Maintenance Request

`PATCH /api/v1/maintenance-requests/{requestId}`

## Assign Maintenance Request

`POST /api/v1/maintenance-requests/{requestId}/assign`

Request:

```json
{
  "assignedTo": "uuid"
}
```

## Complete Maintenance Request

`POST /api/v1/maintenance-requests/{requestId}/complete`

---

# 15. Payment API

Payment operations must be handled through the configured payment provider.

The application should never store raw card numbers, CVVs, or other sensitive card information.

## Create Payment

`POST /api/v1/payments`

Request:

```json
{
  "leaseId": "uuid",
  "amount": 1500.00,
  "currency": "GBP"
}
```

Response:

```json
{
  "paymentId": "uuid",
  "status": "PENDING",
  "paymentUrl": "https://..."
}
```

## Get Payment

`GET /api/v1/payments/{paymentId}`

## Get Payment History

`GET /api/v1/payments`

Supported parameters:

```text
?page=0
&size=20
&status=COMPLETED
&tenantId={tenantId}
```

## Payment Webhook

`POST /api/v1/payments/webhook`

This endpoint is called by the payment provider.

Webhook signatures must be verified before processing.

The endpoint must be idempotent so that duplicate webhook events do not result in duplicate payments or state changes.

---

# 16. Document API

Documents may include:

- Lease agreements
- Identity documents
- Property documents
- Maintenance images
- Payment receipts
- Tax documents

## Upload Document

`POST /api/v1/documents`

Content type:

```text
multipart/form-data
```

## Get Document

`GET /api/v1/documents/{documentId}`

## Delete Document

`DELETE /api/v1/documents/{documentId}`

## Get Documents

`GET /api/v1/documents`

Supported parameters:

```text
?page=0
&size=20
&type=LEASE
&ownerId={userId}
```

---

# 17. Notification API

## Get Notifications

`GET /api/v1/notifications`

## Mark Notification as Read

`PATCH /api/v1/notifications/{notificationId}/read`

## Mark All Notifications as Read

`POST /api/v1/notifications/read-all`

---

# 18. Admin API

Administrative operations are protected using role-based authorization.

## Get Users

`GET /api/v1/admin/users`

## Update User Status

`PATCH /api/v1/admin/users/{userId}/status`

Request:

```json
{
  "status": "SUSPENDED"
}
```

## Get System Statistics

`GET /api/v1/admin/statistics`

Possible response:

```json
{
  "totalUsers": 1200,
  "totalProperties": 450,
  "activeLeases": 380,
  "openMaintenanceRequests": 42
}
```

---

# 19. Pagination

All endpoints returning potentially large collections must support pagination.

Example:

```text
GET /api/v1/properties?page=0&size=20
```

Response:

```json
{
  "content": [
    {
      "id": "uuid",
      "name": "Property 1"
    },
    {
      "id": "uuid",
      "name": "Property 2"
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 125,
  "totalPages": 7,
  "first": true,
  "last": false
}
```

Default:

- `page = 0`
- `size = 20`

Maximum page size:

- `size = 100`

The API should reject or cap excessively large page sizes.

---

# 20. Sorting

Collections support sorting using:

```text
?sort=field,direction
```

Example:

```text
GET /api/v1/properties?sort=name,asc
```

Multiple sorting fields may be supported:

```text
GET /api/v1/properties?sort=status,asc&sort=name,asc
```

Only whitelisted fields should be allowed for sorting.

---

# 21. Filtering

Filtering is performed through query parameters.

Example:

```text
GET /api/v1/maintenance-requests?status=OPEN&priority=HIGH
```

Filters should be validated against supported fields.

Unsupported filters should return:

```http
400 Bad Request
```

---

# 22. Searching

Search functionality should use a dedicated query parameter.

Example:

```text
GET /api/v1/properties?search=london
```

For users:

```text
GET /api/v1/users?search=john
```

Search implementation may use PostgreSQL indexes initially and can be migrated to a dedicated search engine if the system grows.

---

# 23. Standard Response Format

Successful responses should use predictable JSON structures.

Example:

```json
{
  "id": "uuid",
  "name": "London Apartment",
  "status": "ACTIVE"
}
```

For collections:

```json
{
  "content": [],
  "page": 0,
  "size": 20,
  "totalElements": 0,
  "totalPages": 0
}
```

---

# 24. HTTP Status Codes

The API uses standard HTTP status codes.

| Status | Meaning |
| --- | --- |
| 200 | Successful request |
| 201 | Resource created |
| 202 | Request accepted for asynchronous processing |
| 204 | Successful request with no response body |
| 400 | Invalid request |
| 401 | Authentication required/failed |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 409 | Resource conflict |
| 422 | Validation/business-rule failure |
| 429 | Too many requests |
| 500 | Internal server error |
| 503 | Service temporarily unavailable |

---

# 25. Error Response Format

All API errors should use a consistent format.

Example:

```json
{
  "timestamp": "2026-08-28T20:15:30Z",
  "status": 400,
  "error": "BAD_REQUEST",
  "message": "Invalid request",
  "path": "/api/v1/properties",
  "requestId": "req-123456"
}
```

Validation errors:

```json
{
  "timestamp": "2026-08-28T20:15:30Z",
  "status": 400,
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "path": "/api/v1/properties",
  "requestId": "req-123456",
  "fieldErrors": [
    {
      "field": "name",
      "message": "Name is required"
    },
    {
      "field": "postcode",
      "message": "Invalid postcode"
    }
  ]
}
```

---

# 26. Authentication Header

Protected endpoints require:

```http
Authorization: Bearer <access-token>
```

Example:

```http
GET /api/v1/properties
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

The API must reject requests containing:

- Missing tokens
- Expired tokens
- Invalid tokens
- Malformed tokens

---

# 27. Role-Based Authorization

The API supports role-based access control.

Example roles:

- TENANT
- PROPERTY_OWNER
- PROPERTY_MANAGER
- ADMIN
- SUPER_ADMIN

Example:

| Resource | Tenant | Owner | Manager | Admin |
| --- | --- | --- | --- | --- |
| Own Profile | ✓ | ✓ | ✓ | ✓ |
| Properties | Read | Full | Full | Full |
| Applications | Own | Property | Property | Full |
| Leases | Own | Property | Property | Full |
| Maintenance | Create/View Own | View | Manage | Full |
| Payments | Own | View | View | Full |
| Users | Own | Limited | Limited | Full |

Authorization must be enforced on the server.

The client must never be trusted to enforce permissions.

---

# 28. Request Validation

All incoming requests must be validated.

Validation includes:

- Required fields
- String length
- Email format
- Phone number format
- Numeric ranges
- Date validation
- Enum validation
- UUID validation
- File type validation
- File size validation

Example:

```json
{
  "email": "invalid-email"
}
```

Response:

```http
400 Bad Request
```

---

# 29. Idempotency

Certain operations must support idempotency.

This is especially important for:

- Payments
- Payment webhooks
- Lease creation
- External integrations

Example:

```http
POST /api/v1/payments
Idempotency-Key: 7b8e9c...
```

If the same request is submitted multiple times using the same idempotency key, the server must not create multiple payment records.

---

# 30. API Versioning

The API uses URL-based versioning.

Current version:

```text
/api/v1
```

Future version:

```text
/api/v2
```

Example:

```text
/api/v1/properties
/api/v2/properties
```

Breaking changes should require a new API version.

Non-breaking changes can generally be introduced without creating a new version.

---

# 31. Content Type

The API primarily accepts and returns:

```text
Content-Type: application/json
```

File upload endpoints use:

```text
Content-Type: multipart/form-data
```

Clients should explicitly specify the content type.

---

# 32. CORS

Cross-Origin Resource Sharing must be configured at the backend.

Only approved frontend origins should be allowed.

Development:

```text
http://localhost:3000
```

Production:

```text
https://app.example.com
```

Wildcard configuration should not be used in production:

```text
Access-Control-Allow-Origin: *
```

---

# 33. Rate Limiting

Rate limiting should be applied to protect the API from abuse.

Higher protection should be applied to sensitive endpoints such as:

- `POST /auth/login`
- `POST /auth/register`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Example conceptual limits:

- Login: 5 attempts / minute / IP
- Registration: 10 requests / hour / IP
- General API: 100 requests / minute / user

Exact limits can be adjusted after observing production traffic.

---

# 34. Request Correlation

Every request should receive a unique request ID.

Example:

```http
X-Request-ID: 4f8c1b3e-...
```

The request ID should be included in:

- Application logs
- Error responses
- Distributed tracing
- Monitoring systems

Example:

```json
{
  "status": 500,
  "message": "Internal server error",
  "requestId": "4f8c1b3e-..."
}
```

This allows developers to trace a user-facing error back to server logs.

---

# 35. API Documentation

The API should be documented using OpenAPI.

The documentation should include:

- Endpoint descriptions
- HTTP methods
- Request parameters
- Request bodies
- Response bodies
- Authentication requirements
- Status codes
- Validation rules
- Example requests
- Example responses

Swagger UI can be provided for development and testing.

Production access should be restricted or disabled unless explicitly required.

---

# 36. DTO Strategy

The API should use Data Transfer Objects instead of exposing database entities directly.

```text
Entity
   |
   v
Service
   |
   v
Response DTO
   |
   v
Controller
```

Example entity:

```text
UserEntity
```

Response DTO:

```text
UserResponse
```

Request DTO:

```text
CreateUserRequest
```

This prevents internal database structures from becoming part of the public API contract.

---

# 37. API Layer Package Structure

The Spring Boot application should follow a structure similar to:

```text
src/main/java/com/example/application/

├── controller/
│   ├── AuthController.java
│   ├── UserController.java
│   ├── ProfileController.java
│   ├── PropertyController.java
│   ├── UnitController.java
│   ├── TenantController.java
│   ├── ApplicationController.java
│   ├── LeaseController.java
│   ├── MaintenanceController.java
│   ├── PaymentController.java
│   ├── DocumentController.java
│   ├── NotificationController.java
│   └── AdminController.java
│
├── dto/
│   ├── request/
│   └── response/
│
├── service/
├── repository/
├── entity/
├── security/
├── exception/
└── config/
```

---

# 38. Controller Responsibilities

Controllers should remain thin.

The controller is responsible for:

- Receiving HTTP requests
- Validating input
- Calling the appropriate service
- Returning HTTP responses

Controllers should not contain:

- Business logic
- Database queries
- Complex calculations
- Payment processing logic

Example:

```java
@PostMapping
public ResponseEntity<PropertyResponse> createProperty(
        @Valid @RequestBody CreatePropertyRequest request) {

    PropertyResponse response =
            propertyService.createProperty(request);

    return ResponseEntity
            .status(HttpStatus.CREATED)
            .body(response);
}
```

Business logic belongs in:

```text
PropertyService
```

---

# 39. Service Layer

The service layer contains business rules.

```text
PropertyController
        |
        v
PropertyService
        |
        +---- PropertyRepository
        |
        +---- UserRepository
        |
        +---- NotificationService
```

For example, creating a lease may require:

- Validate tenant
- Validate property/unit
- Check unit availability
- Validate dates
- Create lease
- Update unit status
- Send notification
- Create audit record

These operations belong in the service layer rather than the controller.

---

# 40. Transaction Management

Operations that modify multiple related records should use database transactions.

Example:

```text
Create Lease
    |
    +-- Create Lease Record
    |
    +-- Update Unit Status
    |
    +-- Update Application Status
    |
    +-- Create Audit Record
```

If one operation fails, the transaction should roll back where appropriate.

Example:

```java
@Transactional
public LeaseResponse createLease(...) {
    ...
}
```

---

# 41. API Security Principles

The API must follow these security principles:

- Never trust client-side authorization.
- Never expose database entities directly.
- Never store plaintext passwords.
- Never store raw payment card details.
- Validate every request.
- Use HTTPS in production.
- Protect sensitive endpoints with authentication.
- Apply role-based authorization.
- Rate-limit authentication endpoints.
- Do not expose sensitive information in error messages.
- Do not log passwords or access tokens.
- Verify external webhook signatures.
- Validate uploaded files.
- Use secure secret management.
- Maintain audit logs for sensitive operations.

Detailed security architecture will be documented separately in:

```text
08-security-design.md
```

---

# 42. API Request Flow

A typical authenticated request follows this flow:

```text
Client
  |
  | HTTP Request
  v
Load Balancer
  |
  v
Spring Security Filter
  |
  | Validate JWT
  v
Controller
  |
  | Validate DTO
  v
Service
  |
  | Business Logic
  v
Repository
  |
  v
PostgreSQL
  |
  v
Repository
  |
  v
Service
  |
  v
Response DTO
  |
  v
Controller
  |
  v
Client
```

---

# 43. Example Complete API Flow

Example: Tenant creates a maintenance request.

## Step 1 — Client sends request

```http
POST /api/v1/maintenance-requests
Authorization: Bearer <access-token>
Content-Type: application/json
```

Request:

```json
{
  "propertyId": "property-uuid",
  "unitId": "unit-uuid",
  "title": "Broken heater",
  "description": "The heater is not working.",
  "priority": "HIGH"
}
```

## Step 2 — Authentication

Spring Security validates the JWT.

```text
JWT
 |
 +-- Valid
 |
 +-- User ID
 |
 +-- Role = TENANT
```

## Step 3 — Authorization

The system verifies that:

```text
Tenant
   |
   +-- Has access to unit
```

## Step 4 — Validation

The request is validated.

- `propertyId` -> required
- `unitId` -> required
- `title` -> required
- `description` -> required
- `priority` -> valid enum

## Step 5 — Business Logic

The service:

1. Verify property
2. Verify unit
3. Verify tenant relationship
4. Create maintenance request
5. Create audit record
6. Trigger notification

## Step 6 — Database

The request is stored in PostgreSQL.

## Step 7 — Response

```http
201 Created
```

```json
{
  "id": "maintenance-uuid",
  "status": "OPEN",
  "priority": "HIGH",
  "createdAt": "2026-08-28T20:30:00Z"
}
```

---

# 44. API Design Principles Summary

The API follows these principles:

```text
RESTful
   +
Versioned
   +
Secure
   +
Stateless
   +
Validated
   +
Consistent
   +
Observable
   +
Scalable
```

The API should remain simple for clients while keeping business logic and security enforcement inside the backend.

---

# 45. Future API Considerations

As the platform grows, the following capabilities may be introduced:

- GraphQL for complex client queries
- WebSocket APIs for real-time notifications
- Server-Sent Events
- Bulk operations
- Advanced search
- API gateway
- Distributed rate limiting
- External partner APIs
- Webhook subscriptions
- Machine-to-machine authentication
- OAuth 2.0 / OpenID Connect
- API analytics
- Distributed tracing

These should only be introduced when justified by actual system requirements.

---

# 46. Final API Architecture

The final conceptual API architecture is:

```text
                         CLIENT APPLICATIONS
                                |
                                v
                       +------------------+
                       |   HTTPS / TLS    |
                       +--------+---------+
                                |
                                v
                       +------------------+
                       | Load Balancer /  |
                       |   API Gateway    |
                       +--------+---------+
                                |
                                v
                       +------------------+
                       |  Spring Boot API |
                       +--------+---------+
                                |
                     +----------+----------+
                     |                     |
                     v                     v
              +-------------+       +-------------+
              |   Security  |       | Validation  |
              | JWT / RBAC  |       |    DTOs     |
              +------+------+       +------+------+
                     |                     |
                     +----------+----------+
                                |
                                v
                       +------------------+
                       |   Controllers    |
                       +--------+---------+
                                |
                                v
                       +------------------+
                       |    Services      |
                       | Business Logic   |
                       +--------+---------+
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
      +-------------+    +-------------+    +-------------+
      | PostgreSQL  |    |    Redis    |    |    AWS S3   |
      |  Database   |    |   Cache     |    |   Storage   |
      +-------------+    +-------------+    +-------------+
```

This design provides a clear separation between the public API contract, authentication/authorization, business logic, persistence, caching, and file storage.
