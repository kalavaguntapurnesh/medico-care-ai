export interface Notification {
    id: string,
    type: string,
    title: string,
    message: string,
    referenceType: string | null,
    referenceId: string | null,
    read: boolean,
    createdAt: string
}