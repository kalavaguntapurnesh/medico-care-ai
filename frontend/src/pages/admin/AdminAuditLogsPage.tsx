
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    Activity,
    AlertCircle,
    CalendarDays,
    ChevronDown,
    ChevronUp,
    Clock3,
    Database,
    FileText,
    Filter,
    Globe,
    RefreshCw,
    Search,
    ShieldCheck,
    UserRound,
    X,
} from 'lucide-react';

import type { AuditLog } from '../../types/auditLog';
import { getAllAuditLogs } from '../../services/auditLog.service';

export default function AdminAuditLogsPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('ALL');
    const [entityFilter, setEntityFilter] = useState('ALL');
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadAuditLogs = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const data = await getAllAuditLogs();
            setLogs(data);
        } catch {
            setError('Unable to load audit logs. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadAuditLogs();
    }, [loadAuditLogs]);

    const actions = useMemo(
        () => [...new Set(logs.map((log) => log.action).filter(Boolean))].sort(),
        [logs]
    );

    const entityTypes = useMemo(
        () =>
            [
                ...new Set(
                    logs.map((log) => log.entityType).filter(
                        (value): value is string => Boolean(value)
                    )
                ),
            ].sort(),
        [logs]
    );

    const filteredLogs = useMemo(() => {
        const query = search.trim().toLowerCase();

        return logs.filter((log) => {
            const matchesSearch =
                !query ||
                [
                    log.userEmail,
                    log.userId,
                    log.action,
                    log.entityType,
                    log.entityId,
                    log.ipAddress,
                    log.metadata,
                ].some((value) => value?.toLowerCase().includes(query));

            const matchesAction =
                actionFilter === 'ALL' || log.action === actionFilter;

            const matchesEntity =
                entityFilter === 'ALL' || log.entityType === entityFilter;

            return matchesSearch && matchesAction && matchesEntity;
        });
    }, [logs, search, actionFilter, entityFilter]);

    const uniqueUsers = new Set(
        logs.map((log) => log.userId).filter(Boolean)
    ).size;

    const todayCount = logs.filter((log) => {
        const date = new Date(log.createdAt);
        const today = new Date();

        return date.toDateString() === today.toDateString();
    }).length;

    const formatDate = (value: string) => {
        const date = new Date(value);

        if (Number.isNaN(date.getTime())) return value;

        return new Intl.DateTimeFormat(undefined, {
            dateStyle: 'medium',
            timeStyle: 'short',
        }).format(date);
    };

    const formatAction = (action: string) =>
        action
            .replace(/[_-]/g, ' ')
            .toLowerCase()
            .replace(/\b\w/g, (letter) => letter.toUpperCase());

    const getActionStyle = (action: string) => {
        const value = action.toLowerCase();

        if (value.includes('delete') || value.includes('deactivate')) {
            return 'bg-red-50 text-red-700';
        }

        if (value.includes('create') || value.includes('register')) {
            return 'bg-green-50 text-green-700';
        }

        if (value.includes('update') || value.includes('edit')) {
            return 'bg-blue-50 text-blue-700';
        }

        if (value.includes('login') || value.includes('logout')) {
            return 'bg-purple-50 text-purple-700';
        }

        return 'bg-slate-100 text-slate-700';
    };

    const clearFilters = () => {
        setSearch('');
        setActionFilter('ALL');
        setEntityFilter('ALL');
    };

    const hasFilters =
        search !== '' ||
        actionFilter !== 'ALL' ||
        entityFilter !== 'ALL';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <ShieldCheck size={22} />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                Audit Logs
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                Monitor and review system activities.
                            </p>
                        </div>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => void loadAuditLogs()}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                    <RefreshCw
                        size={16}
                        className={loading ? 'animate-spin' : ''}
                    />
                    {loading ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard
                    title="Total Events"
                    value={logs.length}
                    icon={<Activity size={21} />}
                    color="blue"
                />

                <StatCard
                    title="Today's Events"
                    value={todayCount}
                    icon={<CalendarDays size={21} />}
                    color="green"
                />

                <StatCard
                    title="Unique Users"
                    value={uniqueUsers}
                    icon={<UserRound size={21} />}
                    color="purple"
                />

                <StatCard
                    title="Entity Types"
                    value={entityTypes.length}
                    icon={<Database size={21} />}
                    color="orange"
                />
            </div>

            {/* Filters */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-slate-500" />
                        <h2 className="font-semibold text-slate-800">
                            Filter audit logs
                        </h2>
                    </div>

                    {hasFilters && (
                        <button
                            type="button"
                            onClick={clearFilters}
                            className="inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:text-blue-800"
                        >
                            <X size={15} />
                            Clear filters
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="relative">
                        <Search
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search users, actions, IDs..."
                            className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    <select
                        value={actionFilter}
                        onChange={(event) => setActionFilter(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All actions</option>
                        {actions.map((action) => (
                            <option key={action} value={action}>
                                {formatAction(action)}
                            </option>
                        ))}
                    </select>

                    <select
                        value={entityFilter}
                        onChange={(event) => setEntityFilter(event.target.value)}
                        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
                    >
                        <option value="ALL">All entity types</option>
                        {entityTypes.map((entity) => (
                            <option key={entity} value={entity}>
                                {entity}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div
                    role="alert"
                    className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                    <AlertCircle size={20} className="shrink-0" />
                    <div>
                        <p>{error}</p>
                        <button
                            type="button"
                            onClick={() => void loadAuditLogs()}
                            className="mt-2 font-semibold underline"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            )}

            {/* Audit log list */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h2 className="font-semibold text-slate-900">
                            Activity History
                        </h2>
                        <p className="mt-1 text-xs text-slate-500">
                            Review recorded system events and their details.
                        </p>
                    </div>

                    <span className="text-sm text-slate-500">
                        {filteredLogs.length} of {logs.length} records
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw
                            size={25}
                            className="mx-auto animate-spin text-blue-600"
                        />
                        <p className="mt-3 text-sm text-slate-500">
                            Loading audit logs...
                        </p>
                    </div>
                ) : !error && filteredLogs.length === 0 ? (
                    <div className="p-12 text-center">
                        <FileText
                            size={36}
                            className="mx-auto text-slate-300"
                        />
                        <h3 className="mt-3 font-semibold text-slate-800">
                            {hasFilters
                                ? 'No matching audit logs'
                                : 'No audit logs available'}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                            {hasFilters
                                ? 'Try changing your search or filters.'
                                : 'System activity records will appear here.'}
                        </p>
                    </div>
                ) : !error ? (
                    <div className="divide-y divide-slate-100">
                        {filteredLogs.map((log) => {
                            const isExpanded = expandedLog === log.id;

                            return (
                                <div key={log.id}>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setExpandedLog(
                                                isExpanded ? null : log.id
                                            )
                                        }
                                        aria-expanded={isExpanded}
                                        className="grid w-full grid-cols-1 gap-3 px-5 py-4 text-left transition hover:bg-slate-50 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)_auto] md:items-center"
                                    >
                                        <div className="min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getActionStyle(log.action)}`}
                                                >
                                                    {formatAction(log.action)}
                                                </span>
                                            </div>

                                            <p className="mt-2 truncate text-sm font-medium text-slate-800">
                                                {log.userEmail || 'System / Unknown user'}
                                            </p>
                                            <p className="mt-1 text-xs text-slate-400">
                                                {log.userId || 'No user ID'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Entity
                                            </p>
                                            <p className="mt-1 text-sm font-medium text-slate-700">
                                                {log.entityType || 'N/A'}
                                            </p>
                                            <p className="mt-1 break-all text-xs text-slate-400">
                                                {log.entityId || 'No entity ID'}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs text-slate-400">
                                                Timestamp
                                            </p>
                                            <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-600">
                                                <Clock3
                                                    size={14}
                                                    className="shrink-0 text-slate-400"
                                                />
                                                {formatDate(log.createdAt)}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-end">
                                            {isExpanded ? (
                                                <ChevronUp
                                                    size={19}
                                                    className="text-slate-400"
                                                />
                                            ) : (
                                                <ChevronDown
                                                    size={19}
                                                    className="text-slate-400"
                                                />
                                            )}
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="border-t border-slate-100 bg-slate-50 px-5 py-5">
                                            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                                                <DetailItem
                                                    label="Audit Log ID"
                                                    value={log.id}
                                                />
                                                <DetailItem
                                                    label="User ID"
                                                    value={log.userId}
                                                />
                                                <DetailItem
                                                    label="User Email"
                                                    value={log.userEmail}
                                                />
                                                <DetailItem
                                                    label="Action"
                                                    value={log.action}
                                                />
                                                <DetailItem
                                                    label="Entity Type"
                                                    value={log.entityType}
                                                />
                                                <DetailItem
                                                    label="Entity ID"
                                                    value={log.entityId}
                                                />
                                                <DetailItem
                                                    label="IP Address"
                                                    value={log.ipAddress}
                                                    icon={<Globe size={15} />}
                                                />
                                                <DetailItem
                                                    label="Timestamp"
                                                    value={formatDate(log.createdAt)}
                                                />
                                            </div>

                                            <div className="mt-5">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    User Agent
                                                </p>
                                                <div className="break-all rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
                                                    {log.userAgent || 'Not available'}
                                                </div>
                                            </div>

                                            <div className="mt-5">
                                                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                    Metadata
                                                </p>
                                                <MetadataViewer metadata={log.metadata} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                ) : null}
            </div>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, icon, color }: StatCardProps) {
    const styles = {
        blue: 'bg-blue-50 text-blue-700',
        green: 'bg-green-50 text-green-700',
        purple: 'bg-purple-50 text-purple-700',
        orange: 'bg-orange-50 text-orange-700',
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <div className={`rounded-lg p-2.5 ${styles[color]}`}>
                    {icon}
                </div>
            </div>

            <p className="mt-3 text-3xl font-bold text-slate-900">
                {value.toLocaleString()}
            </p>
        </div>
    );
}

interface DetailItemProps {
    label: string;
    value: string | null;
    icon?: React.ReactNode;
}

function DetailItem({ label, value, icon }: DetailItemProps) {
    return (
        <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
            </p>
            <div className="mt-1 flex items-start gap-2 text-sm text-slate-700">
                {icon && <span className="mt-0.5 shrink-0 text-slate-400">{icon}</span>}
                <span className="break-all">{value || 'Not available'}</span>
            </div>
        </div>
    );
}

function MetadataViewer({ metadata }: { metadata: string | null }) {
    if (!metadata) {
        return (
            <p className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-400">
                No metadata available.
            </p>
        );
    }

    try {
        const parsed = JSON.parse(metadata);

        return (
            <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-700">
                {JSON.stringify(parsed, null, 2)}
            </pre>
        );
    } catch {
        return (
            <pre className="overflow-x-auto whitespace-pre-wrap break-all rounded-lg border border-slate-200 bg-white p-4 text-xs leading-6 text-slate-700">
                {metadata}
            </pre>
        );
    }
}
