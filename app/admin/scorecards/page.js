"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../admin.module.css";
import scorecardStyles from "./scorecard.module.css";

export default function WriterScorecardsPage() {
    const [writers, setWriters] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWriters = async () => {
            try {
                const res = await fetch('/api/writers');
                const data = await res.json();
                if (data.success) {
                    setWriters(data.writers);
                }
            } catch (error) {
                console.error('Error fetching writers:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWriters();
    }, []);

    const filteredWriters = writers.filter((w) => {
        if (statusFilter === "all") return true;
        return w.status === statusFilter;
    });

    const getApprovalRate = (stats) => {
        if (!stats || stats.totalSubmissions === 0) return 0;
        return Math.round((stats.approved / stats.totalSubmissions) * 100);
    };

    const getTrendIcon = (trend) => {
        switch (trend) {
            case "improving":
                return { icon: "↑", class: "success" };
            case "declining":
                return { icon: "↓", class: "danger" };
            default:
                return { icon: "→", class: "neutral" };
        }
    };

    const getScoreClass = (score, inverse = false) => {
        if (inverse) {
            if (score <= 15) return "excellent";
            if (score <= 40) return "good";
            return "poor";
        }
        if (score >= 85) return "excellent";
        if (score >= 60) return "good";
        return "poor";
    };

    if (loading) return <div className={styles.adminLayout}><main className={styles.adminMain}>Loading...</main></div>;

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
                        <Link href="/admin/audit" className={styles.navItem}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            Audit Logs
                        </Link>
                        <Link href="/admin/scorecards" className={`${styles.navItem} ${styles.active}`}>
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
                        <h1 className={styles.pageTitle}>Writer Scorecards</h1>
                        <p className={styles.pageSubtitle}>
                            Track writer performance and integrity metrics.
                        </p>
                    </div>
                    <div className={styles.pageActions}>
                        <select
                            className={styles.filterBtn}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Writers</option>
                            <option value="active">Active</option>
                            <option value="probation">Probation</option>
                        </select>
                    </div>
                </div>

                {/* Scorecards Grid */}
                <div className={scorecardStyles.scorecardsGrid}>
                    {filteredWriters.map((writer) => {
                        const trend = getTrendIcon(writer.recentTrend);
                        const approvalRate = getApprovalRate(writer.stats);
                        // Mock fallback for name/email
                        const displayName = writer.name || "Unknown Writer";
                        const displayEmail = writer.email || "no-email";

                        return (
                            <div key={writer.id} className={scorecardStyles.scorecardCard}>
                                <div className={scorecardStyles.cardHeader}>
                                    <div className={scorecardStyles.writerInfo}>
                                        <div className={scorecardStyles.writerAvatar}>
                                            {displayName.split(" ").map((n) => n[0]).join("")}
                                        </div>
                                        <div>
                                            <h3>{displayName}</h3>
                                            <span className={scorecardStyles.email}>{displayEmail}</span>
                                        </div>
                                    </div>
                                    <div className={scorecardStyles.statusGroup}>
                                        <span className={`badge badge-${writer.status === "active" ? "success" : "warning"}`}>
                                            {writer.status}
                                        </span>
                                        <span className={`${scorecardStyles.trendBadge} ${scorecardStyles[trend.class]}`}>
                                            {trend.icon} {writer.recentTrend}
                                        </span>
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div className={scorecardStyles.summaryStats}>
                                    <div className={scorecardStyles.statBox}>
                                        <span className={scorecardStyles.statNumber}>{writer.stats.totalSubmissions}</span>
                                        <span className={scorecardStyles.statLabel}>Submissions</span>
                                    </div>
                                    <div className={scorecardStyles.statBox}>
                                        <span className={`${scorecardStyles.statNumber} ${scorecardStyles.success}`}>
                                            {approvalRate}%
                                        </span>
                                        <span className={scorecardStyles.statLabel}>Approval Rate</span>
                                    </div>
                                    <div className={scorecardStyles.statBox}>
                                        <span className={scorecardStyles.statNumber}>{writer.stats.revisions}</span>
                                        <span className={scorecardStyles.statLabel}>Revisions</span>
                                    </div>
                                    <div className={scorecardStyles.statBox}>
                                        <span className={`${scorecardStyles.statNumber} ${writer.stats.rejected > 0 ? scorecardStyles.danger : ""}`}>
                                            {writer.stats.rejected}
                                        </span>
                                        <span className={scorecardStyles.statLabel}>Rejected</span>
                                    </div>
                                </div>

                                {/* Integrity Metrics */}
                                <div className={scorecardStyles.metricsSection}>
                                    <h4>Integrity Metrics (Avg)</h4>
                                    <div className={scorecardStyles.metricRow}>
                                        <span>Style Match</span>
                                        <div className={scorecardStyles.metricBar}>
                                            <div
                                                className={`${scorecardStyles.metricFill} ${scorecardStyles[getScoreClass(writer.stats.avgStyleMatch)]}`}
                                                style={{ width: `${writer.stats.avgStyleMatch}%` }}
                                            ></div>
                                        </div>
                                        <span className={scorecardStyles[getScoreClass(writer.stats.avgStyleMatch)]}>{writer.stats.avgStyleMatch}%</span>
                                    </div>
                                    <div className={scorecardStyles.metricRow}>
                                        <span>AI Risk</span>
                                        <div className={scorecardStyles.metricBar}>
                                            <div
                                                className={`${scorecardStyles.metricFill} ${scorecardStyles[getScoreClass(writer.stats.avgAiRisk, true)]}`}
                                                style={{ width: `${writer.stats.avgAiRisk}%` }}
                                            ></div>
                                        </div>
                                        <span className={scorecardStyles[getScoreClass(writer.stats.avgAiRisk, true)]}>{writer.stats.avgAiRisk}%</span>
                                    </div>
                                    <div className={scorecardStyles.metricRow}>
                                        <span>Citations</span>
                                        <div className={scorecardStyles.metricBar}>
                                            <div
                                                className={`${scorecardStyles.metricFill} ${scorecardStyles[getScoreClass(writer.stats.avgCitations)]}`}
                                                style={{ width: `${writer.stats.avgCitations}%` }}
                                            ></div>
                                        </div>
                                        <span className={scorecardStyles[getScoreClass(writer.stats.avgCitations)]}>{writer.stats.avgCitations}%</span>
                                    </div>
                                </div>

                                <div className={scorecardStyles.cardActions}>
                                    <Link href={`/admin/writers/${writer.id}`} className="btn btn-secondary btn-sm btn-full">
                                        View Full Profile
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
