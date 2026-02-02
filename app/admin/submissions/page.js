"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

// Mock submissions data
const mockSubmissions = [
    {
        id: "s1",
        title: "Comparison study of GPT-4 vs Claude 3",
        writer: "Alice Smith",
        submittedAt: "2026-02-02T16:20:00Z",
        integrityScore: 98,
        aiScore: 2,
        plagiarismScore: 0,
        status: "reviewed"
    },
    {
        id: "s2",
        title: "Policy brief on AI ethics in healthcare",
        writer: "Charlie Davis",
        submittedAt: "2026-02-02T10:05:00Z",
        integrityScore: 72,
        aiScore: 24,
        plagiarismScore: 4,
        status: "pending"
    },
    {
        id: "s3",
        title: "Technical documentation for API integration",
        writer: "Diana Prince",
        submittedAt: "2026-01-30T14:50:00Z",
        integrityScore: 95,
        aiScore: 0,
        plagiarismScore: 5,
        status: "reviewed"
    },
    {
        id: "s4",
        title: "Analysis of market trends in SaaS 2026",
        writer: "Bob Johnson",
        submittedAt: "2026-01-28T09:15:00Z",
        integrityScore: 45,
        aiScore: 52,
        plagiarismScore: 3,
        status: "flagged"
    },
    {
        id: "s5",
        title: "Deep Learning Foundations - Essay",
        writer: "Michael Chen",
        submittedAt: "2026-01-25T13:40:00Z",
        integrityScore: 88,
        aiScore: 10,
        plagiarismScore: 2,
        status: "reviewed"
    }
];

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await fetch('/api/submissions');
                const data = await res.json();
                if (data.success) {
                    setSubmissions(data.submissions);
                }
            } catch (error) {
                console.error('Error fetching submissions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const filteredSubmissions = submissions.filter((item) => {
        return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.writer.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getScoreColor = (score) => {
        if (score >= 90) return styles.approved;
        if (score >= 70) return styles.pending;
        return styles.rejected;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

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
                        <span className={styles.navSectionTitle}>Tasks</span>
                        <Link href="/admin/assignments" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                            </svg>
                            Assignments
                        </Link>
                        <Link href="/admin/submissions" className={`${styles.navItem} ${styles.active}`}>
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
                        <h1 className={styles.pageTitle}>Submissions Analytics</h1>
                        <p className={styles.pageSubtitle}>
                            Track submitted work and automated integrity analysis results.
                        </p>
                    </div>
                </div>

                <div className={styles.dataTableContainer}>
                    <div className={styles.tableHeader}>
                        <h2 className={styles.tableTitle}>Recent Submissions</h2>
                        <div className={styles.tableActions}>
                            <div className={styles.searchInput}>
                                <input
                                    type="text"
                                    placeholder="Search submissions..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Submission</th>
                                <th>Writer</th>
                                <th>Submitted At</th>
                                <th>Integrity Score</th>
                                <th>AI/Plagiarism</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubmissions.map((item) => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</div>
                                    </td>
                                    <td>{item.writer}</td>
                                    <td style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{formatDate(item.submittedAt)}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <span style={{
                                                fontWeight: 700,
                                                fontSize: '14px',
                                                padding: '2px 8px',
                                                borderRadius: '4px',
                                                background: item.integrityScore >= 90 ? 'var(--success-100)' : item.integrityScore >= 70 ? 'var(--warning-100)' : 'var(--danger-100)',
                                                color: item.integrityScore >= 90 ? 'var(--success-700)' : item.integrityScore >= 70 ? 'var(--warning-700)' : 'var(--danger-700)'
                                            }}>
                                                {item.integrityScore}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                            AI: <span style={{ color: item.aiScore > 20 ? 'var(--danger-600)' : 'inherit' }}>{item.aiScore}%</span> |
                                            Plag: <span style={{ color: item.plagiarismScore > 5 ? 'var(--danger-600)' : 'inherit' }}>{item.plagiarismScore}%</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${item.status === 'flagged' ? styles.rejected : item.status === 'reviewed' ? styles.approved : styles.pending}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <Link href={`/admin/integrity?id=${item.id}`} className={styles.actionBtn} title="View Integrity Report">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m1.875-12h-.375a3.375 3.375 0 0 1-3.375-3.375V1.125m1.875 4.875c.068 0 .135.01.201.028a3.375 3.375 0 0 1 6.75 0c.066-.018.133-.028.201-.028H21a3.375 3.375 0 0 1 3.375 3.375v14.25a3.375 3.375 0 0 1-3.375 3.375H9a3.375 3.375 0 0 1-3.375-3.375V8.25A3.375 3.375 0 0 1 9 4.875Z" />
                                                </svg>
                                            </Link>
                                        </div>
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
