import api from './api';

import type { Notification } from '../types/notification';

export const getMyNotifications = async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications/me');
    return response.data
}


export const getMyUnreadNotifications = async (): Promise<Notification[]> => {
    const response = await api.get<Notification[]>('/notifications/me/unread');
    return response.data
}


export const markNotificationsAsRead = async (
    notificationId: string,
): Promise<Notification> => {
    const response = await api.patch<Notification>(
        `/notifications/me/${notificationId}/read`
    );

    return response.data
}


export const markAllNotificationsAsRead = async (): Promise<void> => {
    await api.patch('/notifications/me/read-all');
}