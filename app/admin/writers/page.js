"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

// Mock writers data
const mockWriters = [
    {
        id: "w1",
        name: "Alice Smith",
        email: "alice.smith@example.com",
        level: "Senior",
        status: "approved",
        joinedAt: "2025-10-12",
        avgScore: 94.5,
        assignments: 42,
        timezone: "GMT-5"
    },
    {
        id: "w2",
        name: "Bob Johnson",
        email: "bob.j@example.com",
        level: "Junior",
        status: "probation",
        joinedAt: "2026-01-05",
        avgScore: 82.1,
        assignments: 5,
        timezone: "GMT+1"
    },
    {
        id: "w3",
        name: "Charlie Davis",
        email: "charlie.d@example.com",
        level: "Expert",
        status: "approved",
        joinedAt: "2024-05-20",
        avgScore: 98.2,
        assignments: 156,
        timezone: "GMT+8"
    },
    {
        id: "w4",
        name: "Diana Prince",
        email: "diana.p@example.com",
        level: "Senior",
        status: "approved",
        joinedAt: "2025-12-01",
        avgScore: 91.0,
        assignments: 28,
        timezone: "GMT-8"
    },
    {
        id: "w5",
        name: "Edward Norton",
        email: "ed.norton@example.com",
        level: "Junior",
        status: "probation",
        joinedAt: "2026-01-20",
        avgScore: 78.5,
        assignments: 3,
        timezone: "GMT+0"
    }
];

export default function WritersPage() {
    const [writers, setWriters] = useState(mockWriters);
    const [levelFilter, setLevelFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    const filteredWriters = writers.filter((writer) => {
        const matchesLevel = levelFilter === "all" || writer.level === levelFilter;
        const matchesStatus = statusFilter === "all" || writer.status === statusFilter;
        const matchesSearch = writer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            writer.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesLevel && matchesStatus && matchesSearch;
    });

    const getScoreClass = (score) => {
        if (score >= 90) return styles.high;
        if (score >= 80) return styles.medium;
        return styles.low;
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
                        <Link href="/admin" className={styles.navItem}>
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
                        <Link href="/admin/writers" className={`${styles.navItem} ${styles.active}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                            All Writers
                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Tasks</span>
                        <Link href="/admin/assignments" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                            </svg>
                            Assignments
                        </Link>
                        <Link href="/admin/submissions" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                            </svg>
                            Submissions
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
                        <h1 className={styles.pageTitle}>Writer Management</h1>
                        <p className={styles.pageSubtitle}>
                            Manage active writers, monitor performance, and handle probation cases.
                        </p>
                    </div>
                </div>

                <div className={styles.dataTableContainer}>
                    <div className={styles.tableHeader}>
                        <h2 className={styles.tableTitle}>All Writers</h2>
                        <div className={styles.tableActions}>
                            <div className={styles.searchInput}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Search writers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <select
                                className={styles.filterBtn}
                                value={levelFilter}
                                onChange={(e) => setLevelFilter(e.target.value)}
                            >
                                <option value="all">All Levels</option>
                                <option value="Expert">Expert</option>
                                <option value="Senior">Senior</option>
                                <option value="Junior">Junior</option>
                            </select>
                            <select
                                className={styles.filterBtn}
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="approved">Active</option>
                                <option value="probation">Probation</option>
                            </select>
                        </div>
                    </div>

                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Writer</th>
                                <th>Level</th>
                                <th>Joined Date</th>
                                <th>Avg. Score</th>
                                <th>Tasks</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWriters.map((writer) => (
                                <tr key={writer.id}>
                                    <td>
                                        <div className={styles.applicantInfo}>
                                            <div className={styles.applicantAvatar} style={{ background: 'var(--success-100)', color: 'var(--success-700)' }}>
                                                {writer.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <div className={styles.applicantName}>{writer.name}</div>
                                                <div className={styles.applicantEmail}>{writer.timezone}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`badge ${writer.level === 'Expert' ? 'badge-primary' : 'badge-neutral'}`}>
                                            {writer.level}
                                        </span>
                                    </td>
                                    <td>{writer.joinedAt}</td>
                                    <td>
                                        <div className={styles.testScore}>
                                            <div className={styles.scoreText}>{writer.avgScore}%</div>
                                            <div className={styles.scoreBar} style={{ width: '80px' }}>
                                                <div
                                                    className={`${styles.scoreFill} ${getScoreClass(writer.avgScore)}`}
                                                    style={{ width: `${writer.avgScore}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '500' }}>{writer.assignments}</div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[writer.status]}`}>
                                            {writer.status === 'approved' ? 'Active' : 'Probation'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <Link href={`/admin/writers/${writer.id}`} className={`${styles.actionBtn} ${styles.view}`} title="View Profile">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredWriters.length === 0 && (
                        <div className={styles.emptyState}>
                            <div className={styles.emptyIcon}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                                </svg>
                            </div>
                            <h3>No writers found</h3>
                            <p>Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
