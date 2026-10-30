import api from "./api"
import type { AuditLog } from "../types/auditLog"

const BASE_PATH = '/audit-logs'

export async function getAllAuditLogs(): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>(BASE_PATH);
    return response.data

}

export async function getAuditLogsByUser(userId: string): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>(`${BASE_PATH}/user/${userId}`);
    return response.data
}


export async function getAuditLogsByAction(
    action: string
): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>(
        `${BASE_PATH}/action/${encodeURIComponent(action)}`
    );
    return response.data;
}


export async function getAuditLogsByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    const response = await api.get<AuditLog[]>(`${BASE_PATH}/${encodeURIComponent(entityType)}/${entityId}`);
    return response.data

}