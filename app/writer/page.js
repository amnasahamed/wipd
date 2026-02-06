"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import WriterLayout from "@/components/WriterLayout";
import { useToast } from "@/components/Toast";
import { LoadingSpinner, SkeletonCard, SkeletonStats } from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import { formatDeadline, getStatusConfig, getAssignmentStatusKey } from "@/lib/hooks/useApi";
import styles from "./dashboard.module.css";

function StatIcon({ icon }) {
    if (icon === "clipboard") {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m0 0V4.5A2.25 2.25 0 0 0 15 2.25H9A2.25 2.25 0 0 0 6.75 4.5v.108c-.375.024-.75.05-1.124.08C4.095 4.782 3.25 5.745 3.25 6.88V18a2.25 2.25 0 0 0 2.25 2.25h3" />
            </svg>
        );
    }
    if (icon === "check") {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
        );
    }
    if (icon === "star") {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.563.563 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.563.563 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
            </svg>
        );
    }
    if (icon === "heart") {
        return (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
            </svg>
        );
    }
    return null;
}

export default function WriterDashboard() {
    return (
        <WriterLayout activeNav="dashboard">
            {({ user, loading: userLoading }) => (
                <DashboardContent user={user} userLoading={userLoading} />
            )}
        </WriterLayout>
    );
}

function DashboardContent({ user, userLoading }) {
    const toast = useToast();
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats] = useState([
        { label: "Active Assignments", value: 0, icon: "clipboard" },
        { label: "Completed", value: 0, icon: "check" },
        { label: "Success Rate", value: "0%", icon: "star" },
        { label: "Grammar Score", value: "0", icon: "heart" },
    ]);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([
        { id: 1, title: "Welcome", message: "Welcome to the new WriterHub dashboard!", time: "Recently", unread: true },
    ]);

    const fetchAssignments = useCallback(async (writerId) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/assignments/writer?writerId=${writerId}`);
            const data = await res.json();

            if (data.success) {
                const allAssignments = data.assignments;
                setAssignments(allAssignments.slice(0, 5));

                const activeCount = allAssignments.filter(a =>
                    ["PENDING", "IN_PROGRESS", "ASSIGNED"].includes(a.status)
                ).length;
                const completedCount = allAssignments.filter(a => a.status === "COMPLETED").length;
                const grammarScore = user?.profile?.grammarScore || 0;

                setStats([
                    { label: "Active Assignments", value: activeCount, icon: "clipboard" },
                    { label: "Completed", value: completedCount, icon: "check" },
                    { label: "Success Rate", value: completedCount > 0 ? "100%" : "N/A", icon: "star" },
                    { label: "Grammar Score", value: `${grammarScore}%`, icon: "heart" },
                ]);
            }
        } catch (err) {
            console.error("Error fetching assignments:", err);
            toast.error("Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [user, toast]);

    useEffect(() => {
        if (user?.id) {
            fetchAssignments(user.id);
        }
    }, [user, fetchAssignments]);

    const toggleNotifications = () => setShowNotifications(!showNotifications);
    const unreadCount = notifications.filter(n => n.unread).length;

    const isLoading = userLoading || loading;

    return (
        <>
            {/* Welcome Header */}
            <div className={styles.welcomeHeader}>
                <div>
                    <h1>Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}! 👋</h1>
                    <p>Here&apos;s an overview of your assignments and progress.</p>
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
            {isLoading ? (
                <SkeletonStats count={4} />
            ) : (
                <div className={styles.statsGrid}>
                    {stats.map((stat, idx) => (
                        <div key={idx} className={styles.statCard}>
                            <div className={styles.statIcon}>
                                <StatIcon icon={stat.icon} />
                            </div>
                            <div className={styles.statContent}>
                                <span className={styles.statValue}>{stat.value}</span>
                                <span className={styles.statLabel}>{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Assignments Section */}
            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Your Assignments</h2>
                    <Link href="/writer/assignments" className="btn btn-ghost btn-sm">
                        View All
                    </Link>
                </div>

                <div className={styles.assignmentsList}>
                    {isLoading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : assignments.length === 0 ? (
                        <EmptyState
                            title="No assignments yet"
                            description="You don't have any assignments right now. Check back later!"
                        />
                    ) : (
                        assignments.map((assignment) => {
                            const deadline = formatDeadline(assignment.deadline);
                            const statusKey = getAssignmentStatusKey(assignment);
                            const statusConfig = getStatusConfig(statusKey);
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
                                        <span className={`${styles.status} ${styles[statusConfig.badge]}`}>
                                            {statusConfig.label}
                                        </span>
                                        {statusKey !== "submitted" && statusKey !== "completed" && (
                                            <Link href={`/writer/assignments/${assignment.id}/submit`} className="btn btn-primary btn-sm">
                                                {statusKey === "assigned" ? "Start Working" : "Submit Work"}
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </>
    );
}
