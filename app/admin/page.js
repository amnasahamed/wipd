"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "./admin.module.css";

export default function AdminDashboard() {
    const [applications, setApplications] = useState([]);
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
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                        <Link href="/admin" className={`${styles.navItem} ${styles.active}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            Dashboard
                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Writers</span>
                        <Link href="/admin/applications" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            Applications

                        </Link>
                        <Link href="/admin/writers" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                            All Writers
                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Assignments</span>
                        <Link href="/admin/assignments" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                            </svg>
                            Assignments
                        </Link>
                        <Link href="/admin/submissions" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                            </svg>
                            Submissions

                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Reports</span>
                        <Link href="/admin/integrity" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                            </svg>
                            Integrity Reports
                        </Link>
                        <Link href="/admin/analytics" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                            </svg>
                            Analytics
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
                {/* Page Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Dashboard</h1>
                        <p className={styles.pageSubtitle}>
                            Monitor writer applications, assignments, and integrity reports.
                        </p>
                    </div>
                    <div className={styles.pageActions}>
                        <Link href="/admin/assignments/new" className="btn btn-primary">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            New Assignment
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    {stats.map((stat, index) => (
                        <div key={index} className={styles.statCard}>
                            <div className={styles.statHeader}>
                                <span className={styles.statLabel}>{stat.label}</span>
                                <div className={`${styles.statIcon} ${styles[stat.color]}`}>
                                    {stat.icon === "clock" && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <polyline points="12 6 12 12 16 14"></polyline>
                                        </svg>
                                    )}
                                    {stat.icon === "users" && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                    )}
                                    {stat.icon === "check" && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M20 6L9 17l-5-5"></path>
                                        </svg>
                                    )}
                                    {stat.icon === "shield" && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                        </svg>
                                    )}
                                </div>
                            </div>
                            <div className={styles.statValue}>{stat.value}</div>
                            <div className={`${styles.statChange} ${stat.positive ? styles.positive : styles.negative}`}>
                                {stat.change} status
                            </div>
                        </div>
                    ))}
                </div>

                {/* Applications Table */}
                <div className={styles.dataTableContainer}>
                    <div className={styles.tableHeader}>
                        <h2 className={styles.tableTitle}>Recent Applications</h2>
                        <div className={styles.tableActions}>
                            <div className={styles.searchInput}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search applicants..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className={styles.filterBtn}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="probation">Probation</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                    </div>

                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Education</th>
                                <th>Work Types</th>
                                <th>Grammar</th>
                                <th>Policy</th>
                                <th>Samples</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        <div className="spinner"></div>
                                        <p>Loading applications...</p>
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
                                        {error}
                                    </td>
                                </tr>
                            ) : filteredApplications.length === 0 ? (
                                <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}>
                                        No applications found.
                                    </td>
                                </tr>
                            ) : filteredApplications.map((app) => (
                                <tr key={app.id}>
                                    <td>
                                        <div className={styles.applicantInfo}>
                                            <div className={styles.applicantAvatar}>{getInitials(app.fullName)}</div>
                                            <div>
                                                <div className={styles.applicantName}>{app.fullName}</div>
                                                <div className={styles.applicantEmail}>{app.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{app.profile?.education || 'N/A'}</td>
                                    <td>
                                        <div className="flex gap-1">
                                            {(app.profile?.workTypes || []).map((type) => (
                                                <span key={type} className="badge badge-neutral">
                                                    {type}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.testScore}>
                                            <div className={styles.scoreBar}>
                                                <div
                                                    className={`${styles.scoreFill} ${styles[getScoreClass(app.profile?.grammarScore || 0)]}`}
                                                    style={{ width: `${app.profile?.grammarScore || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className={styles.scoreText}>{app.profile?.grammarScore || 0}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.testScore}>
                                            <div className={styles.scoreBar}>
                                                <div
                                                    className={`${styles.scoreFill} ${styles[getScoreClass(app.profile?.policyScore || 0)]}`}
                                                    style={{ width: `${app.profile?.policyScore || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className={styles.scoreText}>{app.profile?.policyScore || 0}%</span>
                                        </div>
                                    </td>
                                    <td>{app.samples?.length || 0} files</td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[(app.profile?.status || 'PENDING').toLowerCase()]}`}>
                                            {app.profile?.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <Link href={`/admin/applications/${app.id}`} className={`${styles.actionBtn} ${styles.view}`} title="View Details">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className={styles.tablePagination}>
                        <span className={styles.paginationInfo}>
                            Showing {filteredApplications.length} of {applications.length} applications
                        </span>
                        <div className={styles.paginationControls}>
                            <button className={styles.paginationBtn} disabled>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="15 18 9 12 15 6"></polyline>
                                </svg>
                            </button>
                            <button className={`${styles.paginationBtn} ${styles.active}`}>1</button>
                            <button className={styles.paginationBtn}>2</button>
                            <button className={styles.paginationBtn}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
