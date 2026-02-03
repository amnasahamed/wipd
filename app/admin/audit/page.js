"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../admin.module.css";
import auditStyles from "./audit.module.css";



export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [actionFilter, setActionFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/audit');
                const data = await res.json();
                if (data.success) {
                    setLogs(data.logs);
                }
            } catch (error) {
                console.error('Error fetching audit logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const formatTimestamp = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getActionBadge = (action) => {
        if (!action) return "neutral";
        if (action.includes("approved") || action.includes("created")) return "success";
        if (action.includes("rejected")) return "danger";
        if (action.includes("reviewed") || action.includes("updated")) return "warning";
        return "neutral";
    };

    const getActionLabel = (action) => {
        if (!action) return "Unknown";
        return action.split(".").map((word) =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(" ");
    };

    const filteredLogs = logs.filter((log) => {
        if (actionFilter === "all") return true;
        return log.action.startsWith(actionFilter);
    });

    if (loading) {
        return <div className={styles.adminLayout}><main className={styles.adminMain}>Loading...</main></div>;
    }

    return (
        <div className={styles.adminLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        <span>✍️</span> Writer<span>Integrity</span>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Overview</span>
                        <Link href="/admin" className={styles.navItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75" />
                            </svg>
                            Dashboard
                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>System</span>
                        <Link href="/admin/audit" className={`${styles.navItem} ${styles.active}`}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            Audit Logs
                        </Link>
                        <Link href="/admin/scorecards" className={styles.navItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                            </svg>
                            Writer Scorecards
                        </Link>
                    </div>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>AD</div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>Admin User</div>
                            <div className={styles.userRole}>Administrator</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.adminMain}>
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Audit Logs</h1>
                        <p className={styles.pageSubtitle}>
                            Complete history of system actions and changes.
                        </p>
                    </div>
                    <div className={styles.pageActions}>
                        <select
                            className={styles.filterBtn}
                            value={actionFilter}
                            onChange={(e) => setActionFilter(e.target.value)}
                        >
                            <option value="all">All Actions</option>
                            <option value="application">Applications</option>
                            <option value="submission">Submissions</option>
                            <option value="assignment">Assignments</option>
                            <option value="writer">Writers</option>
                            <option value="settings">Settings</option>
                        </select>
                        <button className="btn btn-secondary">Export CSV</button>
                    </div>
                </div>

                {/* Logs Table */}
                <div className={styles.dataTableContainer}>
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Action</th>
                                <th>Actor</th>
                                <th>Target</th>
                                <th>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id}>
                                    <td className={auditStyles.timestampCell}>
                                        {formatTimestamp(log.timestamp)}
                                    </td>
                                    <td>
                                        <span className={`badge badge-${getActionBadge(log.action)}`}>
                                            {getActionLabel(log.action)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={auditStyles.actorCell}>
                                            <div className={auditStyles.actorAvatar}>
                                                {(log.actor?.name || "System").split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div className={auditStyles.actorInfo}>
                                                <div className={auditStyles.actorName}>{log.actor?.name || log.user || "System"}</div>
                                                <div className={auditStyles.actorIp}>{log.ip || "127.0.0.1"}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={auditStyles.targetType}>{log.entity?.split(" ")[0]}</span>
                                        <div className={auditStyles.targetName}>{log.entity}</div>
                                    </td>
                                    <td className={auditStyles.detailsCell}>
                                        {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
}
