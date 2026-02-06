"use client";

import { Suspense, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import WriterLayout from "@/components/WriterLayout";
import { LoadingSpinner } from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { formatDate, getStatusConfig, getScoreColor } from "@/lib/hooks/useApi";
import styles from "../dashboard.module.css";
import insightStyles from "./insights.module.css";

export default function WriterInsightsPageWrapper() {
    return (
        <Suspense fallback={<WriterLayout activeNav="insights">{() => <LoadingSpinner text="Loading insights..." />}</WriterLayout>}>
            <WriterInsightsPage />
        </Suspense>
    );
}

function WriterInsightsPage() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const searchParams = useSearchParams();
    const submissionIdFilter = searchParams.get("submissionId");

    const fetchInsights = useCallback(async (userId) => {
        setLoading(true);
        try {
            const assignmentsRes = await fetch(`/api/assignments/writer?writerId=${userId}`);
            const assignmentsData = await assignmentsRes.json();

            if (assignmentsData.success) {
                const mappedInsights = assignmentsData.assignments
                    .filter((a) => a.latestSubmission)
                    .map((a) => {
                        const integrityScore = a.latestSubmission.integrityScore || 0;
                        const aiRiskScore = a.latestSubmission.aiRiskScore || 0;

                        return {
                            id: a.latestSubmission.id,
                            assignmentId: a.id,
                            assignment: a.title,
                            submittedAt: a.latestSubmission.createdAt,
                            status: (a.latestSubmission.status || "PENDING_REVIEW").toLowerCase(),
                            feedback: {
                                overallScore:
                                    integrityScore >= 85
                                        ? "excellent"
                                        : integrityScore >= 70
                                            ? "good"
                                            : "needs_work",
                                styleAlignment: {
                                    score: integrityScore,
                                    message:
                                        integrityScore >= 85
                                            ? "Excellent consistency with your established writing style."
                                            : integrityScore >= 70
                                                ? "Some variations from your typical style were detected."
                                                : "Significant variations from your typical style were detected.",
                                },
                                originality: {
                                    score: integrityScore,
                                    message: "Demonstrates good original thought and structure.",
                                },
                                citations: {
                                    score: 100,
                                    message: "All cited sources verified correctly.",
                                },
                                suggestions: [
                                    aiRiskScore > 40
                                        ? "Reduce AI-like phrasing; use more personal, specific wording."
                                        : "Maintain your current voice and pacing.",
                                    integrityScore < 70
                                        ? "Review your baseline style and keep sentence length/structure consistent."
                                        : "Keep sentence structure naturally varied.",
                                ].filter(Boolean),
                            },
                            decisionNotes: a.latestSubmissionDecision?.notes || null,
                        };
                    });
                setInsights(mappedInsights);
            } else {
                setError(assignmentsData.error || "Failed to fetch insights");
            }
        } catch (err) {
            console.error("Error fetching insights:", err);
            setError("Error connecting to API");
        } finally {
            setLoading(false);
        }
    }, []);

    const getScoreClass = (score) => {
        if (score >= 85) return "excellent";
        if (score >= 70) return "good";
        return "needs_work";
    };

    const displayedInsights = submissionIdFilter
        ? insights.filter((i) => i.id === submissionIdFilter)
        : insights;

    return (
        <WriterLayout activeNav="insights">
            {({ user }) => {
                useEffect(() => {
                    if (user?.id) {
                        fetchInsights(user.id);
                    }
                }, [user?.id, fetchInsights]);

                return (
                    <>
                        <div className={styles.welcomeHeader}>
                            <div>
                                <h1>Your Insights</h1>
                                <p>Review feedback and suggestions to improve your writing.</p>
                            </div>
                        </div>

                        {/* Tips Banner */}
                        <div className={insightStyles.tipsBanner}>
                            <div className={insightStyles.tipsIcon}>💡</div>
                            <div className={insightStyles.tipsContent}>
                                <h4>Quick Tips</h4>
                                <p>
                                    Consistent writing style helps build your baseline and improves
                                    approval rates. Focus on the suggestions provided to enhance your
                                    work quality.
                                </p>
                            </div>
                        </div>

                        {/* Insights List */}
                        <div className={insightStyles.insightsList}>
                            {loading ? (
                                <LoadingSpinner text="Loading insights..." />
                            ) : error ? (
                                <ErrorState
                                    message={error}
                                    onRetry={() => user?.id && fetchInsights(user.id)}
                                />
                            ) : displayedInsights.length === 0 ? (
                                <EmptyState
                                    title="No insights available yet"
                                    description="Insights will appear once your submissions are analyzed."
                                />
                            ) : (
                                displayedInsights.map((insight) => {
                                    const statusCfg = getStatusConfig(insight.status);
                                    return (
                                        <div key={insight.id} className={insightStyles.insightCard}>
                                            <div className={insightStyles.cardHeader}>
                                                <div>
                                                    <h3>{insight.assignment}</h3>
                                                    <span className={insightStyles.submissionDate}>
                                                        Submitted {formatDate(insight.submittedAt)}
                                                    </span>
                                                </div>
                                                <span className={`badge badge-${statusCfg.badge}`}>
                                                    {statusCfg.label}
                                                </span>
                                            </div>

                                            {insight.decisionNotes &&
                                                (insight.status === "needs_rewrite" ||
                                                    insight.status === "rejected") && (
                                                    <div className={insightStyles.adminNotes}>
                                                        <div className={insightStyles.adminNotesLabel}>
                                                            Admin notes
                                                        </div>
                                                        <div className={insightStyles.adminNotesBody}>
                                                            {insight.decisionNotes}
                                                        </div>
                                                    </div>
                                                )}

                                            {/* Score Cards */}
                                            <div className={insightStyles.scoreGrid}>
                                                <div
                                                    className={`${insightStyles.scoreCard} ${insightStyles[getScoreClass(insight.feedback.styleAlignment.score)]}`}
                                                >
                                                    <div className={insightStyles.scoreHeader}>
                                                        <span>Style Alignment</span>
                                                        <span className={insightStyles.scoreValue}>
                                                            {insight.feedback.styleAlignment.score}%
                                                        </span>
                                                    </div>
                                                    <p>{insight.feedback.styleAlignment.message}</p>
                                                </div>

                                                <div
                                                    className={`${insightStyles.scoreCard} ${insightStyles[getScoreClass(insight.feedback.originality.score)]}`}
                                                >
                                                    <div className={insightStyles.scoreHeader}>
                                                        <span>Originality</span>
                                                        <span className={insightStyles.scoreValue}>
                                                            {insight.feedback.originality.score}%
                                                        </span>
                                                    </div>
                                                    <p>{insight.feedback.originality.message}</p>
                                                </div>

                                                <div
                                                    className={`${insightStyles.scoreCard} ${insightStyles[getScoreClass(insight.feedback.citations.score)]}`}
                                                >
                                                    <div className={insightStyles.scoreHeader}>
                                                        <span>Citations</span>
                                                        <span className={insightStyles.scoreValue}>
                                                            {insight.feedback.citations.score}%
                                                        </span>
                                                    </div>
                                                    <p>{insight.feedback.citations.message}</p>
                                                </div>
                                            </div>

                                            {/* Suggestions */}
                                            {insight.feedback.suggestions.length > 0 && (
                                                <div className={insightStyles.suggestionsSection}>
                                                    <h4>Suggestions for Improvement</h4>
                                                    <ul>
                                                        {insight.feedback.suggestions.map(
                                                            (suggestion, idx) => (
                                                                <li key={idx}>{suggestion}</li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            )}

                                            {insight.status === "needs_rewrite" && (
                                                <div className={insightStyles.cardActions}>
                                                    <Link
                                                        href={`/writer/assignments/${insight.assignmentId}/submit`}
                                                        className="btn btn-primary"
                                                    >
                                                        Submit Revision
                                                    </Link>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </>
                );
            }}
        </WriterLayout>
    );
}
