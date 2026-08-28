# MediMind AI — Caching Strategy

## Document Information

| Field | Value |
| --- | --- |
| Document Name | Caching Strategy |
| Project | MediMind AI |
| Version | 1.0 |
| Status | Draft |
| Author | Purnesh Kalavagunta |
| Last Updated | August 2026 |
| Cache Technology | Redis |

---

# 1. Overview

Caching is an important performance optimization for MediMind AI and is used to reduce repeated database queries, improve API latency, and reduce load on backend services and external integrations.

The system uses Redis as the primary in-memory distributed cache for read-heavy, frequently accessed data.

```text
Client
   |
   v
API Server
   |
   v
Redis Cache
   |
   +---- Cache Hit ----> Return data
   |
   +---- Cache Miss
            |
            v
         Database
            |
            v
       Store in Redis
            |
            v
       Return data
```

The caching layer should improve performance without compromising correctness, data integrity, security, or access control.

---

# 2. Caching Goals

The caching strategy should:

- Reduce database load
- Improve API response times
- Support high-traffic reads and repeated queries
- Reduce repeated calls to external services
- Cache data that is frequently requested and relatively stable
- Be easy to invalidate and refresh when data changes

Caching should never bypass authentication, authorization, or ownership validation.

---

# 3. Cache Technology

## Redis

Redis is the preferred cache technology for this platform.

Benefits:

- In-memory storage
- Very low-latency reads and writes
- TTL support
- Distributed caching across application instances
- Atomic operations and lock primitives
- Support for high availability and clustering patterns

---

# 4. Caching Pattern

## 4.1 Cache-Aside Pattern

The system primarily uses the cache-aside pattern for read-heavy data.

```text
Request
   |
   v
Check Redis
   |
   +---- Hit ----> Return cached data
   |
   +---- Miss
           |
           v
        Database
           |
           v
      Store in Redis
           |
           v
      Return data
```

In this pattern, the application is responsible for:

- Checking the cache before querying the database
- Loading data from the source of truth when missing
- Storing the data in the cache with a TTL
- Invalidating or updating the cache when the underlying data changes

---

# 5. What Should Be Cached

Good caching candidates include:

- User profile data
- Frequently accessed configuration values
- Reference tables and static metadata
- Doctor availability listings
- Appointment slots and schedules that are reused often
- Lookup data such as specialties, clinics, or status lists
- External API responses when freshness requirements allow it

Examples of cache keys:

```text
user:profile:{userId}
config:{key}
reference:{type}
clinic:details:{clinicId}
doctor:availability:{doctorId}:{date}
```

---

# 6. What Should Not Be Cached

Highly sensitive, personal, or rapidly changing data should generally not be cached.

Examples:

- Passwords
- Access tokens
- Refresh tokens
- Session secrets
- Full medical records that are frequently updated
- Banking or payment details
- Raw tax documents
- Highly sensitive admin audit data
- Data with strict freshness or compliance requirements

If a value is not safe to expose or if staleness could create security or integrity risk, it should be excluded from cache storage.

---

# 7. Cache Keys and Namespace Design

Cache keys must be unique, predictable, and scoped correctly.

Recommended rules:

- Include entity type and identifier
- Include user or tenant scope when relevant
- Avoid generic keys that could collide across users or resources
- Use consistent naming conventions
- Keep keys concise but descriptive

Examples:

```text
user:profile:123
patient:medical-records:123:page:0:size:20
doctor:availability:456:2026-08-28
```

Keys should include enough scope to avoid cross-user data leakage.

---

# 8. TTL Strategy

Cached items should have a defined expiration time.

Example TTL guidance:

| Data Type | Suggested TTL |
| --- | --- |
| User profile | 5–15 minutes |
| Configuration data | 5–60 minutes |
| Reference metadata | 1–24 hours |
| Availability slots | 1–15 minutes |
| External API responses | Depends on freshness requirements |
| Frequently changing data | Short TTL |

TTL values should be configurable by environment and workload.

---

# 9. Cache Invalidation and Refresh

When the underlying data changes, related cache entries should be invalidated or refreshed.

Example:

```text
Update profile
   |
   v
Update database
   |
   v
Delete cached profile entry
```

The next read then fetches the latest value and repopulates the cache.

## 9.1 Write Strategy

For normal CRUD operations:

```text
Write request
   |
   v
Update database
   |
   v
Invalidate or update cache
```

The database remains the source of truth. Redis is a performance layer, not an authority on business data.

---

# 10. Cache Consistency

Redis should not become the source of record for application data.

```text
Database = Source of Truth
Redis = Performance Layer
```

If Redis becomes unavailable, the application should still function using the database, where possible.

The cache may be temporarily stale, but it must not be allowed to override business correctness or authorization logic.

---

# 11. Cache Failure Handling

Cache failures should not normally cause the application to fail.

```text
API
  |
  v
Redis
  |
  +---- Available --> Use cache
  |
  +---- Unavailable
            |
            v
         Database
```

Redis errors should be:

- Logged
- Monitored
- Alerted when they exceed threshold
- Treated as a degraded mode rather than a fatal failure

---

# 12. Cache Stampede Protection

When a popular cache entry expires, many requests may simultaneously attempt to load the same data.

This can create a cache stampede and increase database pressure.

Protection techniques include:

- Distributed locks
- Request coalescing
- TTL jitter
- Background refresh
- Staggered expiration windows

Example flow:

```text
Many requests
   |
   v
Cache miss
   |
   v
One request loads data from database
   |
   v
Populate Redis
   |
   v
Other requests receive cached value
```

---

# 13. Cache Eviction and Capacity Planning

Redis should use an eviction policy suitable for the workload.

The system should define:

- Maximum memory usage
- Eviction policy
- TTL requirements
- Key retention strategy
- Memory and latency monitoring thresholds

Important data should not rely solely on unlimited in-memory retention.

---

# 14. Distributed Caching

When multiple API instances run together, they should use the same shared Redis layer.

```text
           Redis Cluster
          /      |      \
         /       |       \
      API 1    API 2    API 3
```

This ensures that cached values remain available across application nodes and reduce redundant database access.

---

# 15. Security of the Caching Layer

Redis must not be publicly accessible.

It should be placed inside the private application network and protected with:

- Authentication
- Network restrictions
- TLS where appropriate
- Access control
- Secret management

Sensitive data should be minimized in cache values. Passwords, tokens, or confidential medical data should not be stored unless there is a clear and justified requirement.

---

# 16. Monitoring and Operational Observability

The caching layer should be monitored for:

- Cache hit rate
- Cache miss rate
- Memory usage
- Evictions
- Redis latency
- Connection failures
- Key count
- CPU usage
- Availability

A sustained drop in cache hit rate should trigger investigation, because it may indicate:

- Incorrect invalidation logic
- Overly short TTLs
- High churn patterns
- Backend saturation
- Misconfigured cache keys

---

# 17. Recommended Cache Flow

## 17.1 Read Flow

```text
Request
   |
   v
Check Redis
   |
   +---- Hit ----> Return data
   |
   +---- Miss
           |
           v
       Query PostgreSQL
           |
           v
        Store in Redis
           |
           v
       Return data
```

## 17.2 Write Flow

```text
Write request
   |
   v
Update PostgreSQL
   |
   v
Invalidate or refresh Redis
```

---

# 18. Caching Strategy Summary

| Area | Strategy |
| --- | --- |
| Technology | Redis |
| Pattern | Cache-Aside |
| Source of Truth | PostgreSQL |
| Expiration | TTL-based |
| Write Handling | Database first, then invalidate or refresh cache |
| Distribution | Shared Redis across app instances |
| Failure Handling | Fall back to database |
| Security | Private network + authentication + access restrictions |
| Monitoring | Hit rate, misses, latency, memory, failures |
| Sensitive Data | Avoid caching unless required and safe |

The caching layer is a performance optimization only and must never bypass authentication, authorization, or data ownership rules.

---

# 19. Relationship With Other System Design Documents

This document supports the broader architecture and depends on the data and security decisions made in the rest of the design set.

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
   +----> 10 Error Handling
   |
   +----> 11 Logging & Monitoring
   |
   +----> 12 Deployment Architecture
   |
   +----> 13 Scalability
   |
   +----> 14 Disaster Recovery
```

The caching strategy must align with both the application’s security constraints and the operational requirements of the system.
