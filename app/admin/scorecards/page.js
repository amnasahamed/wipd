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
    );
}
