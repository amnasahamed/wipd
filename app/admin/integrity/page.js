"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import styles from "../admin.module.css";
import reportStyles from "./report.module.css";

export default function IntegrityReportsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [selectedRisk, setSelectedRisk] = useState("all");
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const fetchReports = useCallback(async () => {
        setLoading(true);
        try {
            const url = selectedRisk === 'all'
                ? '/api/admin/integrity'
                : `/api/admin/integrity?risk=${selectedRisk}`;

            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setSubmissions(data.reports);
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
        } finally {
            setLoading(false);
        }
    }, [selectedRisk]);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
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

    const updateSubmissionStatus = useCallback(async (submissionId, status, notes) => {
        setActionLoadingId(submissionId);
        try {
            const res = await fetch(`/api/submissions/${submissionId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, notes })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to update submission');
            }

            await fetchReports();
        } catch (error) {
            console.error('Update status error:', error);
            alert(error.message || 'Failed to update submission');
        } finally {
            setActionLoadingId(null);
        }
    }, [fetchReports]);

    return (
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
                    <button onClick={fetchReports} className="btn btn-ghost">Refresh</button>
                </div>
            </div>

            {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                    <div className="spinner"></div>
                    <p style={{ marginLeft: '12px' }}>Loading reports...</p>
                </div>
            ) : submissions.length === 0 ? (
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>✓</div>
                    <h3>No reports found</h3>
                    <p>There are no submissions matching the selected filters.</p>
                </div>
            ) : (
                /* Submissions List */
                <div className={reportStyles.submissionsList}>
                    {submissions.map((submission) => (
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
                                    <button
                                        className="btn btn-success btn-sm"
                                        disabled={actionLoadingId === submission.id}
                                        onClick={() => updateSubmissionStatus(submission.id, 'APPROVED')}
                                    >
                                        Approve
                                    </button>
                                    <button
                                        className="btn btn-warning btn-sm"
                                        disabled={actionLoadingId === submission.id}
                                        onClick={() => {
                                            const reason = prompt('Reason / notes for revision request:');
                                            if (reason === null) return;
                                            if (reason.trim().length === 0) {
                                                alert('Notes are required to request a revision.');
                                                return;
                                            }
                                            updateSubmissionStatus(submission.id, 'NEEDS_REWRITE', reason);
                                        }}
                                    >
                                        Request Revision
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        disabled={actionLoadingId === submission.id}
                                        onClick={() => {
                                            const confirmed = confirm('Reject this submission?');
                                            if (!confirmed) return;
                                            const reason = prompt('Reason / notes for rejection:');
                                            if (reason === null) return;
                                            if (reason.trim().length === 0) {
                                                alert('Notes are required to reject a submission.');
                                                return;
                                            }
                                            updateSubmissionStatus(submission.id, 'REJECTED', reason);
                                        }}
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </main>
    );
}
