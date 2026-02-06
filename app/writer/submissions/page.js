"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import WriterLayout from "@/components/WriterLayout";
import { LoadingSpinner, SkeletonTable } from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { formatDate, getStatusConfig, getScoreColor } from "@/lib/hooks/useApi";
import styles from "../dashboard.module.css";

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchSubmissions = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const assignmentsRes = await fetch(`/api/assignments/writer?writerId=${userId}`);
            const assignmentsData = await assignmentsRes.json();

            if (assignmentsData.success) {
                const subs = assignmentsData.assignments
                    .filter(a => a.latestSubmission)
                    .map(a => ({
                        id: a.latestSubmission.id,
                        assignmentId: a.id,
                        title: a.title,
                        submittedAt: a.latestSubmission.createdAt,
                        integrityScore: a.latestSubmission.integrityScore || 0,
                        aiProbability: `${Math.round(a.latestSubmission.aiRiskScore || 0)}%`,
                        plagiarism: "0%",
                        status: (a.latestSubmission.status || "PENDING_REVIEW").toLowerCase(),
                        decisionNotes: a.latestSubmissionDecision?.notes || null,
                        wordCount: a.wordCount,
                    }));
                setSubmissions(subs);
            } else {
                setError(assignmentsData.error || "Failed to fetch submissions");
            }
        } catch (err) {
            setError("Error connecting to API");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    const filteredSubmissions = submissions.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <WriterLayout activeNav="submissions">
            {({ user }) => {
                useEffect(() => {
                    if (user?.id) {
                        fetchSubmissions(user.id);
                    }
                }, [user?.id]);

                return (
                    <>
                        <div className={styles.welcomeHeader}>
                            <div>
                                <h1>Submission History</h1>
                                <p>Track your submitted work and integrity analysis scores.</p>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className="search-input-wrap" style={{ width: "100%" }}>
                                    <svg
                                        className="search-icon"
                                        width="18"
                                        height="18"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                    >
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        type="text"
                                        placeholder="Search submissions..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>

                            {loading ? (
                                <SkeletonTable rows={5} cols={6} />
                            ) : error ? (
                                <ErrorState
                                    message={error}
                                    onRetry={() => user?.id && fetchSubmissions(user.id)}
                                />
                            ) : filteredSubmissions.length === 0 ? (
                                <EmptyState
                                    title="No submissions found"
                                    description="You haven't submitted any work matching your search."
                                />
                            ) : (
                                <div className="data-table-wrap">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>SUBMISSION TITLE</th>
                                                <th>DATE SUBMITTED</th>
                                                <th>INTEGRITY</th>
                                                <th>AI/PLAGIARISM</th>
                                                <th>STATUS</th>
                                                <th>ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubmissions.map((item) => {
                                                const statusConfig = getStatusConfig(item.status);
                                                const score = item.integrityScore;

                                                return (
                                                    <tr key={item.id}>
                                                        <td>
                                                            <div className="cell-title">{item.title}</div>
                                                            <div className="cell-subtitle">
                                                                {(item.wordCount || 0).toLocaleString()} words
                                                            </div>
                                                            {item.status === "needs_rewrite" && item.decisionNotes && (
                                                                <div className="cell-subtitle" style={{ color: "var(--warning-700)", marginTop: "4px" }}>
                                                                    Revision requested: {item.decisionNotes}
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td>{formatDate(item.submittedAt)}</td>
                                                        <td>
                                                            <span className={`score-badge ${score >= 85 ? "high" : score >= 70 ? "medium" : "low"}`}>
                                                                {score}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <div className="cell-subtitle">
                                                                AI: <span style={{ fontWeight: 500 }}>{item.aiProbability}</span>
                                                                <br />
                                                                Plag: <span style={{ fontWeight: 500 }}>{item.plagiarism}</span>
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <span className={`badge badge-${statusConfig.badge}`}>
                                                                {statusConfig.label}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            {item.status === "needs_rewrite" ? (
                                                                <Link
                                                                    href={`/writer/assignments/${item.assignmentId}/submit`}
                                                                    className="btn btn-primary btn-sm"
                                                                >
                                                                    Submit Revision
                                                                </Link>
                                                            ) : (
                                                                <Link
                                                                    href={`/writer/insights?submissionId=${item.id}`}
                                                                    className="btn btn-ghost btn-sm"
                                                                >
                                                                    View Report
                                                                </Link>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </>
                );
            }}
        </WriterLayout>
    );
}
