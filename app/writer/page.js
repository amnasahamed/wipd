"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./dashboard.module.css";

// Mock data
const mockWriter = {
    name: "Sarah Johnson",
    status: "probation",
    email: "sarah.j@example.com",
};

const mockAssignments = [
    {
        id: "1",
        title: "Research Paper on Machine Learning Algorithms",
        category: "academic",
        wordCount: 3000,
        deadline: "2026-02-10T18:00:00Z",
        status: "assigned",
        priority: "high",
        createdAt: "2026-02-02T10:00:00Z",
    },
    {
        id: "2",
        title: "API Documentation for Payment Gateway",
        category: "technical",
        wordCount: 2000,
        deadline: "2026-02-15T12:00:00Z",
        status: "in_progress",
        priority: "normal",
        createdAt: "2026-02-01T14:30:00Z",
    },
    {
        id: "3",
        title: "Case Study on Fintech Adoption",
        category: "academic",
        wordCount: 4000,
        deadline: "2026-02-08T09:00:00Z",
        status: "submitted",
        priority: "urgent",
        createdAt: "2026-01-28T08:00:00Z",
    },
];

const mockStats = [
    { label: "Active Assignments", value: 2, icon: "clipboard" },
    { label: "Completed", value: 12, icon: "check" },
    { label: "Success Rate", value: "98%", icon: "star" },
    { label: "Avg. Rating", value: "4.8", icon: "heart" },
];

const mockNotifications = [
    { id: 1, title: "New Assignment", message: "Research Paper on ML Algorithms has been assigned.", time: "2h ago", unread: true },
    { id: 2, title: "Feedback Received", message: "New insights available for Payment API Docs.", time: "5h ago", unread: true },
    { id: 3, title: "Account Update", message: "Your status has been updated to Probation.", time: "1d ago", unread: false },
];

export default function WriterDashboard() {
    const [assignments] = useState(mockAssignments);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(mockNotifications);

    const toggleNotifications = () => setShowNotifications(!showNotifications);
    const unreadCount = notifications.filter(n => n.unread).length;

    const getStatusClass = (status) => {
        switch (status) {
            case "assigned": return "warning";
            case "in_progress": return "primary";
            case "submitted": return "success";
            case "revision": return "danger";
            default: return "neutral";
        }
    };

    const formatDeadline = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

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
                    <Link href="/writer" className={`${styles.navItem} ${styles.active}`}>
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
                        <span className={styles.navBadge}>2</span>
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
                        <div className={styles.userAvatar}>SJ</div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{mockWriter.name}</span>
                            <span className={`${styles.userStatus} ${styles[mockWriter.status]}`}>
                                {mockWriter.status}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.dashboardMain}>
                {/* Welcome Header */}
                <div className={styles.welcomeHeader}>
                    <div>
                        <h1>Welcome back, {mockWriter.name.split(" ")[0]}! 👋</h1>
                        <p>Here's an overview of your assignments and progress.</p>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.navActionButton} onClick={toggleNotifications}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                            </svg>
                            {unreadCount > 0 && <span className={styles.notificationBadge}>{unreadCount}</span>}
                        </button>
                    </div>
                </div>

                {/* Notifications Sidebar */}
                {showNotifications && (
                    <div className={styles.notificationsOverlay} onClick={toggleNotifications}>
                        <div className={styles.notificationsSidebar} onClick={e => e.stopPropagation()}>
                            <div className={styles.notifHeader}>
                                <h3>Notifications</h3>
                                <button className={styles.closeNotif} onClick={toggleNotifications}>&times;</button>
                            </div>
                            <div className={styles.notifList}>
                                {notifications.map(n => (
                                    <div key={n.id} className={`${styles.notifItem} ${n.unread ? styles.unread : ""}`}>
                                        <div className={styles.notifTitle}>{n.title}</div>
                                        <div className={styles.notifMessage}>{n.message}</div>
                                        <div className={styles.notifTime}>{n.time}</div>
                                    </div>
                                ))}
                            </div>
                            <div className={styles.notifFooter}>
                                <button onClick={() => setNotifications(notifications.map(n => ({ ...n, unread: false })))}>
                                    Mark all as read
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    {mockStats.map((stat, idx) => (
                        <div key={idx} className={styles.statCard}>
                            <div className={styles.statIcon}>
                                {stat.icon === "clipboard" && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m0 0V4.5A2.25 2.25 0 0 0 15 2.25H9A2.25 2.25 0 0 0 6.75 4.5v.108c-.375.024-.75.05-1.124.08C4.095 4.782 3.25 5.745 3.25 6.88V18a2.25 2.25 0 0 0 2.25 2.25h3" />
                                    </svg>
                                )}
                                {stat.icon === "check" && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                )}
                                {stat.icon === "star" && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                    </svg>
                                )}
                                {stat.icon === "heart" && (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
                                    </svg>
                                )}
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={styles.statLabel}>{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Assignments Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>Your Assignments</h2>
                        <Link href="/writer/assignments" className="btn btn-ghost btn-sm">
                            View All
                        </Link>
                    </div>

                    <div className={styles.assignmentsList}>
                        {assignments.map((assignment) => {
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
                                    </div>
                                    <h3 className={styles.assignmentTitle}>{assignment.title}</h3>
                                    <div className={styles.assignmentMeta}>
                                        <span>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                            </svg>
                                            {assignment.wordCount.toLocaleString()} words
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
                                        <span className={`${styles.status} ${styles[getStatusClass(assignment.status)]}`}>
                                            {assignment.status.replace("_", " ")}
                                        </span>
                                        {assignment.status !== "submitted" && (
                                            <Link href={`/writer/assignments/${assignment.id}/submit`} className="btn btn-primary btn-sm">
                                                {assignment.status === "assigned" ? "Start Working" : "Submit Work"}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>
        </div>
    );
}
