"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../admin.module.css";
import reportStyles from "./report.module.css";

// Mock submission data with integrity analysis
const mockSubmissions = [
    {
        id: "1",
        writer: { name: "Sarah Johnson", avatar: "SJ" },
        assignment: "Research Paper on Machine Learning Algorithms",
        category: "academic",
        submittedAt: "2026-02-02T15:30:00Z",
        status: "pending_review",
        integrityReport: {
            overallRisk: "low",
            styleMatch: 94,
            internalSimilarity: 8,
            aiRiskScore: 12,
            citationScore: 96,
            wordCount: 3245,
            signals: [
                { type: "positive", message: "Writing style matches baseline (94% similarity)" },
                { type: "positive", message: "No significant AI-generated content detected" },
                { type: "neutral", message: "8% overlap with internal database" },
                { type: "positive", message: "All citations verified and properly formatted" },
            ],
        },
    },
    {
        id: "2",
        writer: { name: "Michael Chen", avatar: "MC" },
        assignment: "Technical Documentation for Payment API",
        category: "technical",
        submittedAt: "2026-02-02T14:00:00Z",
        status: "pending_review",
        integrityReport: {
            overallRisk: "medium",
            styleMatch: 72,
            internalSimilarity: 15,
            aiRiskScore: 35,
            citationScore: 88,
            wordCount: 2100,
            signals: [
                { type: "warning", message: "Style deviation detected (72% match)" },
                { type: "warning", message: "Moderate AI-assistance risk (35%)" },
                { type: "neutral", message: "15% overlap with internal database" },
                { type: "positive", message: "Citations properly formatted" },
            ],
        },
    },
    {
        id: "3",
        writer: { name: "Emily Rodriguez", avatar: "ER" },
        assignment: "Case Study on Fintech Adoption",
        category: "academic",
        submittedAt: "2026-02-02T10:15:00Z",
        status: "pending_review",
        integrityReport: {
            overallRisk: "high",
            styleMatch: 45,
            internalSimilarity: 42,
            aiRiskScore: 78,
            citationScore: 52,
            wordCount: 4200,
            signals: [
                { type: "danger", message: "Significant style deviation (45% match)" },
                { type: "danger", message: "High AI-assistance risk detected (78%)" },
                { type: "danger", message: "42% overlap with internal submissions" },
                { type: "warning", message: "Some citations could not be verified" },
            ],
        },
    },
];

export default function IntegrityReportsPage() {
    const [submissions] = useState(mockSubmissions);
    const [selectedRisk, setSelectedRisk] = useState("all");

    const filteredSubmissions = submissions.filter((s) => {
        if (selectedRisk === "all") return true;
        return s.integrityReport.overallRisk === selectedRisk;
    });

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getRiskColor = (risk) => {
        switch (risk) {
            case "low": return "success";
            case "medium": return "warning";
            case "high": return "danger";
            default: return "neutral";
        }
    };

    const getScoreColor = (score, inverse = false) => {
        if (inverse) {
            if (score <= 15) return "success";
            if (score <= 40) return "warning";
            return "danger";
        }
        if (score >= 80) return "success";
        if (score >= 60) return "warning";
        return "danger";
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
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            Dashboard
                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Reports</span>
                        <Link href="/admin/integrity" className={`${styles.navItem} ${styles.active}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                            </svg>
                            Integrity Reports
                            <span className={styles.navBadge}>3</span>
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
                        <h1 className={styles.pageTitle}>Integrity Reports</h1>
                        <p className={styles.pageSubtitle}>
                            Review submissions flagged by the integrity analysis system.
                        </p>
                    </div>
                    <div className={styles.pageActions}>
                        <select
                            className={styles.filterBtn}
                            value={selectedRisk}
                            onChange={(e) => setSelectedRisk(e.target.value)}
                        >
                            <option value="all">All Risk Levels</option>
                            <option value="high">High Risk</option>
                            <option value="medium">Medium Risk</option>
                            <option value="low">Low Risk</option>
                        </select>
                    </div>
                </div>

                {/* Submissions List */}
                <div className={reportStyles.submissionsList}>
                    {filteredSubmissions.map((submission) => (
                        <div key={submission.id} className={reportStyles.submissionCard}>
                            <div className={reportStyles.cardHeader}>
                                <div className={reportStyles.writerInfo}>
                                    <div className={reportStyles.writerAvatar}>{submission.writer.avatar}</div>
                                    <div>
                                        <div className={reportStyles.writerName}>{submission.writer.name}</div>
                                        <div className={reportStyles.submissionMeta}>
                                            <span className={`badge badge-${submission.category === "academic" ? "primary" : "secondary"}`}>
                                                {submission.category}
                                            </span>
                                            <span>{formatDate(submission.submittedAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${reportStyles.riskBadge} ${reportStyles[submission.integrityReport.overallRisk]}`}>
                                    {submission.integrityReport.overallRisk.toUpperCase()} RISK
                                </div>
                            </div>

                            <h3 className={reportStyles.assignmentTitle}>{submission.assignment}</h3>

                            {/* Metrics Grid */}
                            <div className={reportStyles.metricsGrid}>
                                <div className={reportStyles.metric}>
                                    <div className={reportStyles.metricHeader}>
                                        <span>Style Match</span>
                                        <span className={`${reportStyles.metricValue} ${reportStyles[getScoreColor(submission.integrityReport.styleMatch)]}`}>
                                            {submission.integrityReport.styleMatch}%
                                        </span>
                                    </div>
                                    <div className={reportStyles.metricBar}>
                                        <div
                                            className={`${reportStyles.metricFill} ${reportStyles[getScoreColor(submission.integrityReport.styleMatch)]}`}
                                            style={{ width: `${submission.integrityReport.styleMatch}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className={reportStyles.metric}>
                                    <div className={reportStyles.metricHeader}>
                                        <span>AI Risk</span>
                                        <span className={`${reportStyles.metricValue} ${reportStyles[getScoreColor(submission.integrityReport.aiRiskScore, true)]}`}>
                                            {submission.integrityReport.aiRiskScore}%
                                        </span>
                                    </div>
                                    <div className={reportStyles.metricBar}>
                                        <div
                                            className={`${reportStyles.metricFill} ${reportStyles[getScoreColor(submission.integrityReport.aiRiskScore, true)]}`}
                                            style={{ width: `${submission.integrityReport.aiRiskScore}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className={reportStyles.metric}>
                                    <div className={reportStyles.metricHeader}>
                                        <span>Internal Similarity</span>
                                        <span className={`${reportStyles.metricValue} ${reportStyles[getScoreColor(submission.integrityReport.internalSimilarity, true)]}`}>
                                            {submission.integrityReport.internalSimilarity}%
                                        </span>
                                    </div>
                                    <div className={reportStyles.metricBar}>
                                        <div
                                            className={`${reportStyles.metricFill} ${reportStyles[getScoreColor(submission.integrityReport.internalSimilarity, true)]}`}
                                            style={{ width: `${submission.integrityReport.internalSimilarity}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className={reportStyles.metric}>
                                    <div className={reportStyles.metricHeader}>
                                        <span>Citation Score</span>
                                        <span className={`${reportStyles.metricValue} ${reportStyles[getScoreColor(submission.integrityReport.citationScore)]}`}>
                                            {submission.integrityReport.citationScore}%
                                        </span>
                                    </div>
                                    <div className={reportStyles.metricBar}>
                                        <div
                                            className={`${reportStyles.metricFill} ${reportStyles[getScoreColor(submission.integrityReport.citationScore)]}`}
                                            style={{ width: `${submission.integrityReport.citationScore}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Signals */}
                            <div className={reportStyles.signalsList}>
                                {submission.integrityReport.signals.map((signal, idx) => (
                                    <div key={idx} className={`${reportStyles.signal} ${reportStyles[signal.type]}`}>
                                        {signal.type === "positive" && "✓"}
                                        {signal.type === "neutral" && "○"}
                                        {signal.type === "warning" && "⚠"}
                                        {signal.type === "danger" && "✗"}
                                        <span>{signal.message}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className={reportStyles.cardActions}>
                                <Link href={`/admin/submissions/${submission.id}`} className="btn btn-secondary btn-sm">
                                    View Full Report
                                </Link>
                                <div className={reportStyles.actionGroup}>
                                    <button className="btn btn-success btn-sm">Approve</button>
                                    <button className="btn btn-warning btn-sm">Request Revision</button>
                                    <button className="btn btn-danger btn-sm">Reject</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}
