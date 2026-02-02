"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "../dashboard.module.css";

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const fetchUserAndAssignments = useCallback(async () => {
        setLoading(true);
        try {
            // Get current user
            const userRes = await fetch('/api/me');
            const userData = await userRes.json();

            if (userData.id) {
                setUser(userData);
                // Get assignments for this writer
                const assignmentsRes = await fetch(`/api/assignments/writer?writerId=${userData.id}`);
                const assignmentsData = await assignmentsRes.json();

                if (assignmentsData.success) {
                    setAssignments(assignmentsData.assignments);
                } else {
                    setError(assignmentsData.error || 'Failed to fetch assignments');
                }
            } else {
                setError('User not found. Please log in.');
            }
        } catch (err) {
            setError('Error connecting to API');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUserAndAssignments();
    }, [fetchUserAndAssignments]);

    const filteredAssignments = assignments.filter((item) => {
        const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusClass = (status) => {
        switch (status) {
            case "assigned": return "warning";
            case "in_progress": return "primary";
            case "submitted": return "success";
            case "completed": return "success";
            case "revision": return "danger";
            default: return "neutral";
        }
    };

    const formatDeadline = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: "Overdue", urgent: true };
        if (diffDays === 0) return { text: "Due today", urgent: true };
        if (diffDays === 1) return { text: "Due tomorrow", urgent: true };
        if (diffDays <= 3) return { text: `${diffDays} days left`, urgent: true };
        return { text: `${diffDays} days left`, urgent: false };
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
                    <Link href="/writer/assignments" className={`${styles.navItem} ${styles.active}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                        </svg>
                        Assignments
                    </Link>
                    <Link href="/writer/submissions" className={styles.navItem}>
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
                        <h1>All Assignments</h1>
                        <p>Browse and manage your writing tasks.</p>
                    </div>
                </div>

                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.headerActions} style={{ width: '100%', gap: '16px' }}>
                            <button onClick={fetchUserAndAssignments} className="btn btn-neutral btn-sm">Refresh</button>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Search assignments..."
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
                            <select
                                className="select"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                style={{ width: '200px' }}
                            >
                                <option value="all">All Status</option>
                                <option value="assigned">Assigned</option>
                                <option value="in_progress">In Progress</option>
                                <option value="submitted">Submitted</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="spinner"></div>
                            <p>Loading assignments...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <p style={{ color: 'red' }}>{error}</p>
                            <button onClick={fetchUserAndAssignments} className="btn btn-primary btn-sm">Retry</button>
                        </div>
                    ) : (
                        <div className={styles.assignmentsList}>
                            {filteredAssignments.map((assignment) => {
                                const deadline = formatDeadline(assignment.deadline);
                                return (
                                    <div key={assignment.id} className={styles.assignmentCard}>
                                        <div className={styles.assignmentHeader}>
                                            <span className={`badge badge-${assignment.category === "academic" ? "primary" : "secondary"}`}>
                                                {assignment.category}
                                            </span>
                                            <span className={`badge badge-${assignment.priority === "urgent" ? "danger" : assignment.priority === "high" ? "warning" : "neutral"}`}>
                                                {assignment.priority}
                                            </span>
                                            <span style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--primary-700)' }}>
                                                ${assignment.reward || '0.00'}
                                            </span>
                                        </div>
                                        <h3 className={styles.assignmentTitle}>{assignment.title}</h3>
                                        <div className={styles.assignmentMeta}>
                                            <span>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                </svg>
                                                {(assignment.wordCount || 0).toLocaleString()} words
                                            </span>
                                            <span className={deadline.urgent ? styles.urgent : ""}>
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                    <polyline points="12 6 12 12 16 14"></polyline>
                                                </svg>
                                                {deadline.text}
                                            </span>
                                        </div>
                                        <div className={styles.assignmentFooter}>
                                            <span className={`${styles.status} ${styles[getStatusClass(assignment.status.toLowerCase())]}`}>
                                                {assignment.status.replace("_", " ")}
                                            </span>
                                            {assignment.status.toLowerCase() !== "submitted" && assignment.status.toLowerCase() !== "completed" && (
                                                <Link href={`/writer/assignments/${assignment.id}/submit`} className="btn btn-primary btn-sm">
                                                    {assignment.status.toLowerCase() === "assigned" ? "Start Working" : "Submit Work"}
                                                </Link>
                                            )}
                                            {assignment.status.toLowerCase() === "completed" && (
                                                <span style={{ fontSize: '12px', color: 'var(--success-600)', fontWeight: 500 }}>
                                                    Payment Released
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {filteredAssignments.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.2, marginBottom: '16px' }}>
                                <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m0 0V4.5A2.25 2.25 0 0 0 15 2.25H9A2.25 2.25 0 0 0 6.75 4.5v.108c-.375.024-.75.05-1.124.08C4.095 4.782 3.25 5.745 3.25 6.88V18a2.25 2.25 0 0 0 2.25 2.25h3" />
                            </svg>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No assignments found</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Try adjusting your search or filters.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
