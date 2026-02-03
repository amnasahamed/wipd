"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminDashboard() {
    const [applications, setApplications] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Get stats
            const statsRes = await fetch('/api/admin/stats');
            const statsDataObj = await statsRes.json();

            if (statsDataObj.success) {
                const s = statsDataObj.stats;
                setStats([
                    { label: "Pending Applications", value: s.totalAssignments, change: "Live", positive: true, icon: "clock", color: "warning" },
                    { label: "Active Writers", value: s.totalWriters, change: "Live", positive: true, icon: "users", color: "success" },
                    { label: "Completion Rate", value: `${s.completionRate}%`, change: "Optimal", positive: true, icon: "check", color: "primary" },
                    { label: "Avg Integrity", value: `${s.avgIntegrity}%`, change: "Stable", positive: true, icon: "shield", color: "success" },
                ]);
            }

            // Get recent applications
            const appsRes = await fetch('/api/applications');
            const appsData = await appsRes.json();
            if (appsData.success) {
                setApplications(appsData.applications.slice(0, 5));
            }
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setError('Failed to load dashboard');
            setLoading(false);
        }
    }, []);

    const fetchAlerts = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/alerts');
            const data = await res.json();
            if (data.success) {
                setAlerts(data.alerts);
            }
        } catch (err) {
            console.error('Error fetching alerts:', err);
        }
    }, []);

    useEffect(() => {
        fetchData();
        fetchAlerts();
    }, [fetchData, fetchAlerts]);

    // Filter applications
    const filteredApplications = applications.filter((app) => {
        const name = app.fullName || "";
        const email = app.email || "";
        const matchesSearch =
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === "all" || (app.profile?.status || "").toLowerCase() === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    const getInitials = (name) => {
        if (!name) return "U";
        return name.split(" ").map((n) => n[0]).join("").toUpperCase();
    };

    const getScoreClass = (score) => {
        if (score >= 85) return "high";
        if (score >= 70) return "medium";
        return "low";
    };

    return (
        <main className={styles.adminMain}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Dashboard</h1>
                    <p className={styles.pageSubtitle}>
                        Welcome back, Admin. Here's what's happening today.
                    </p>
                </div>
                <div className={styles.headerActions}>
                    <button className="btn btn-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" width="20" height="20">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        Refresh Data
                    </button>
                    <Link href="/admin/assignments/new" className="btn btn-primary">
                        + New Assignment
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div key={index} className={styles.statCard}>
                        <div className={styles.statIcon} data-color={stat.color}>
                            {stat.icon === 'users' && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                                </svg>
                            )}
                            {stat.icon === 'clock' && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            )}
                            {stat.icon === 'check' && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            )}
                            {stat.icon === 'shield' && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                </svg>
                            )}
                        </div>
                        <div className={styles.statContent}>
                            <div className={styles.statLabel}>{stat.label}</div>
                            <div className={styles.statValue}>{stat.value}</div>
                            <div className={`${styles.statChange} ${stat.positive ? styles.positive : styles.negative}`}>
                                {stat.positive ? '↑' : '↓'} {stat.change}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.dashboardGrid}>
                {/* Recent Applications */}
                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <h3>Recent Writer Applications</h3>
                        <Link href="/admin/applications" className={styles.linkButton}>View All</Link>
                    </div>

                    <div className={styles.tableResponsive}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Writer</th>
                                    <th>Status</th>
                                    <th>Submitted</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="4">Loading...</td></tr>
                                ) : filteredApplications.length === 0 ? (
                                    <tr><td colSpan="4">No interactions found.</td></tr>
                                ) : (
                                    filteredApplications.map((app) => (
                                        <tr key={app.id}>
                                            <td>
                                                <div className={styles.writerInfo}>
                                                    <div className={styles.avatar}>{getInitials(app.fullName)}</div>
                                                    <div>
                                                        <div className={styles.writerName}>{app.fullName}</div>
                                                        <div className={styles.writerEmail}>{app.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${app.profile?.status === 'approved' ? 'badge-success' : 'badge-warning'}`}>
                                                    {app.profile?.status || 'Active'}
                                                </span>
                                            </td>
                                            <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <Link href={`/admin/applications/${app.id}`} className={styles.actionBtn}>
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className={styles.dashboardCard}>
                    <div className={styles.cardHeader}>
                        <h3>Integrity Alerts</h3>
                        {alerts.length > 0 && <span className="badge badge-error">{alerts.length} Critical</span>}
                    </div>

                    <div className={styles.activityList}>
                        {alerts.length === 0 ? (
                            <div className={styles.emptyState} style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                No critical alerts at this time.
                            </div>
                        ) : (
                            alerts.map((alert) => (
                                <div key={alert.id} className={styles.activityItem}>
                                    <div className={styles.activityIcon}>{alert.icon}</div>
                                    <div className={styles.activityContent}>
                                        <div className={styles.activityTitle}>{alert.title}</div>
                                        <div className={styles.activityMeta}>{alert.message}</div>
                                    </div>
                                    <div className={styles.activityAction}>
                                        <Link href={alert.link} className="btn btn-sm btn-outline">
                                            {alert.actionLabel}
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
