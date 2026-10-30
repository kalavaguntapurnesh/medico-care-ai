export interface AuditLog {
    id: string,
    userId: string | null,
    userEmail: string | null,
    action: string,
    entityType: string | null,
    entityId: string | null,
    ipAddress: string | null,
    userAgent: string | null,
    metadata: string | null,
    createdAt: string
}