
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Bell,
    Check,
    CheckCheck,
    Clock,
    RefreshCw,
    AlertCircle,
    CalendarDays,
} from 'lucide-react';

import { getMyNotifications, markAllNotificationsAsRead, markNotificationsAsRead } from '../../services/notification.service';

import type { Notification } from '../../types/notification';

type NotificationFilter = 'ALL' | 'UNREAD';

const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = (
            error as { response?: { data?: { message?: string } } }
        ).response;

        if (response?.data?.message) {
            return response.data.message;
        }
    }

    if (error instanceof Error) {
        return error.message;
    }

    return 'Something went wrong. Please try again.';
};

const formatDate = (value: string): string => {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(date);
};

const getNotificationIcon = (type: string) => {
    const normalizedType = type.toLowerCase();

    if (normalizedType.includes('appointment')) {
        return CalendarDays;
    }

    return Bell;
};

export default function NotificationCenterPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<NotificationFilter>('ALL');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [markingAll, setMarkingAll] = useState(false);
    const [markingId, setMarkingId] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const loadNotifications = useCallback(async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError('');

        try {
            const data = await getMyNotifications();
            setNotifications(data);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        void loadNotifications();
    }, [loadNotifications]);

    const unreadCount = useMemo(
        () => notifications.filter((notification) => !notification.read).length,
        [notifications],
    );

    const visibleNotifications = useMemo(() => {
        if (filter === 'UNREAD') {
            return notifications.filter((notification) => !notification.read);
        }

        return notifications;
    }, [notifications, filter]);

    const handleMarkAsRead = async (notificationId: string) => {
        setError('');
        setSuccess('');
        setMarkingId(notificationId);

        try {
            const updated = await markNotificationsAsRead(notificationId);

            setNotifications((current) =>
                current.map((notification) =>
                    notification.id === notificationId ? updated : notification,
                ),
            );

            setSuccess('Notification marked as read.');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setMarkingId(null);
        }
    };

    const handleMarkAllAsRead = async () => {
        if (unreadCount === 0) return;

        setError('');
        setSuccess('');
        setMarkingAll(true);

        try {
            await markAllNotificationsAsRead();

            setNotifications((current) =>
                current.map((notification) => ({
                    ...notification,
                    read: true,
                })),
            );

            setSuccess('All notifications marked as read.');
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setMarkingAll(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-64 items-center justify-center gap-3 text-slate-600">
                <RefreshCw className="animate-spin" size={20} />
                <span>Loading notifications...</span>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-blue-100 p-3 text-blue-700">
                            <Bell size={24} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Notification Center
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Stay up to date with your appointments and important updates.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => void loadNotifications(true)}
                    disabled={refreshing}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={refreshing ? 'animate-spin' : ''}
                    />
                    Refresh
                </button>
            </header>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Total notifications</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {notifications.length}
                    </p>
                </div>

                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                    <p className="text-sm text-blue-700">Unread notifications</p>
                    <p className="mt-2 text-3xl font-bold text-blue-900">
                        {unreadCount}
                    </p>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5">
                    <p className="text-sm text-slate-500">Read notifications</p>
                    <p className="mt-2 text-3xl font-bold text-slate-900">
                        {notifications.length - unreadCount}
                    </p>
                </div>
            </section>

            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div
                    role="status"
                    className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700"
                >
                    {success}
                </div>
            )}

            <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4 sm:p-5">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setFilter('ALL')}
                            className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === 'ALL'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            All ({notifications.length})
                        </button>

                        <button
                            type="button"
                            onClick={() => setFilter('UNREAD')}
                            className={`rounded-lg px-4 py-2 text-sm font-medium ${filter === 'UNREAD'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                }`}
                        >
                            Unread ({unreadCount})
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => void handleMarkAllAsRead()}
                        disabled={unreadCount === 0 || markingAll}
                        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <CheckCheck size={17} />
                        {markingAll ? 'Marking all...' : 'Mark all as read'}
                    </button>
                </div>

                {visibleNotifications.length === 0 ? (
                    <div className="px-6 py-14 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                            {filter === 'UNREAD' ? (
                                <CheckCheck size={26} />
                            ) : (
                                <Bell size={26} />
                            )}
                        </div>

                        <h2 className="mt-4 font-semibold text-slate-900">
                            {filter === 'UNREAD'
                                ? 'You are all caught up!'
                                : 'No notifications yet'}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            {filter === 'UNREAD'
                                ? 'You have no unread notifications.'
                                : 'Appointment updates and other notifications will appear here.'}
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {visibleNotifications.map((notification) => {
                            const Icon = getNotificationIcon(notification.type);

                            return (
                                <article
                                    key={notification.id}
                                    className={`flex gap-3 p-4 transition-colors sm:gap-4 sm:p-5 ${notification.read
                                            ? 'bg-white'
                                            : 'bg-blue-50/70'
                                        }`}
                                >
                                    <div
                                        className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${notification.read
                                                ? 'bg-slate-100 text-slate-500'
                                                : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        <Icon size={20} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold text-slate-900">
                                                {notification.title}
                                            </h3>

                                            {!notification.read && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                                                    <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                                    Unread
                                                </span>
                                            )}
                                        </div>

                                        <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600">
                                            {notification.message}
                                        </p>

                                        <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                                            <Clock size={14} />
                                            {formatDate(notification.createdAt)}
                                        </p>
                                    </div>

                                    {!notification.read && (
                                        <button
                                            type="button"
                                            onClick={() => void handleMarkAsRead(notification.id)}
                                            disabled={
                                                markingId === notification.id || markingAll
                                            }
                                            aria-label={`Mark ${notification.title} as read`}
                                            title="Mark as read"
                                            className="flex h-9 shrink-0 items-center gap-1.5 self-start rounded-lg border border-blue-200 bg-white px-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 disabled:opacity-50 sm:px-3"
                                        >
                                            <Check size={16} />
                                            <span className="hidden sm:inline">
                                                {markingId === notification.id
                                                    ? 'Saving...'
                                                    : 'Mark as read'}
                                            </span>
                                        </button>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}
