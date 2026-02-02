"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "../dashboard.module.css";

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const fetchSubmissions = useCallback(async () => {
        setLoading(true);
        try {
            const userRes = await fetch('/api/me');
            const userData = await userRes.json();

            if (userData.id) {
                setUser(userData);
                const assignmentsRes = await fetch(`/api/assignments/writer?writerId=${userData.id}`);
                const assignmentsData = await assignmentsRes.json();

                if (assignmentsData.success) {
                    // Filter for assignments that have submissions
                    const subs = assignmentsData.assignments
                        .filter(a => a.submission)
                        .map(a => ({
                            id: a.submission.id,
                            title: a.title,
                            submittedAt: a.submission.createdAt,
                            integrityScore: a.submission.analysis?.integrityScore || 0,
                            aiProbability: `${a.submission.analysis?.aiRiskScore || 0}%`,
                            plagiarism: "0%", // Placeholder for now
                            status: a.status.toLowerCase(),
                            wordCount: a.wordCount
                        }));
                    setSubmissions(subs);
                } else {
                    setError(assignmentsData.error || 'Failed to fetch submissions');
                }
            } else {
                setError('User not found');
            }
        } catch (err) {
            setError('Error connecting to API');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubmissions();
    }, [fetchSubmissions]);

    const filteredSubmissions = submissions.filter((item) => {
        return item.title.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getScoreColor = (score) => {
        if (score >= 90) return "var(--success-600)";
        if (score >= 70) return "var(--warning-600)";
        return "var(--danger-600)";
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved": return "success";
            case "under_review": return "primary";
            case "flagged": return "danger";
            default: return "neutral";
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <div className={styles.dashboardLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        <span>✍️</span> WriterHub
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <Link href="/writer" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link href="/writer/assignments" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                        </svg>
                        Assignments
                    </Link>
                    <Link href="/writer/submissions" className={`${styles.navItem} ${styles.active}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        Submissions
                    </Link>
                    <Link href="/writer/insights" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
                        </svg>
                        Insights
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("") : 'U'}
                        </div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{user?.fullName || 'User'}</span>
                            <span className={`${styles.userStatus} ${styles[(user?.profile?.status || 'ONBOARDING').toLowerCase()]}`}>
                                {user?.profile?.status || 'ONBOARDING'}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.dashboardMain}>
                <div className={styles.welcomeHeader}>
                    <div>
                        <h1>Submission History</h1>
                        <p>Track your submitted work and integrity analysis scores.</p>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div style={{ position: 'relative', width: '100%' }}>
                            <input
                                type="text"
                                className="input"
                                placeholder="Search submissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{ width: '100%', paddingLeft: '40px' }}
                            />
                            <svg
                                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}
                            >
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="spinner"></div>
                            <p>Loading submissions...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <p style={{ color: 'red' }}>{error}</p>
                            <button onClick={fetchSubmissions} className="btn btn-primary btn-sm">Retry</button>
                        </div>
                    ) : (
                        <div className={styles.dataTableContainer} style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)', overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-secondary)' }}>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>SUBMISSION TITLE</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>DATE SUBMITTED</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>INTEGRITY</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>AI/PLAGIARISM</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>STATUS</th>
                                        <th style={{ padding: '16px 24px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredSubmissions.map((item) => (
                                        <tr key={item.id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</div>
                                                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{(item.wordCount || 0).toLocaleString()} words</div>
                                            </td>
                                            <td style={{ padding: '20px 24px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                                {formatDate(item.submittedAt)}
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <span style={{
                                                        fontWeight: 700,
                                                        fontSize: '16px',
                                                        color: getScoreColor(item.integrityScore),
                                                        background: `${getScoreColor(item.integrityScore)}15`,
                                                        padding: '4px 8px',
                                                        borderRadius: '4px'
                                                    }}>
                                                        {item.integrityScore}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                    AI: <span style={{ fontWeight: 500 }}>{item.aiProbability}</span><br />
                                                    Plag: <span style={{ fontWeight: 500 }}>{item.plagiarism}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <span className={`badge badge-${getStatusBadge(item.status)}`}>
                                                    {item.status.replace("_", " ")}
                                                </span>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <Link href={`/writer/insights?submissionId=${item.id}`} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }}>
                                                    View Report
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredSubmissions.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No submissions found</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>You haven't submitted any work matching your search.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
