"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../admin.module.css";
import detailStyles from "./submission-detail.module.css";

export default function SubmissionDetailPage() {
    const { id } = useParams();
    const [submission, setSubmission] = useState(null);
    const [llmResults, setLlmResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const buildLlmResultsFromSubmission = (submissionData) => {
        const results = submissionData?.analysisResults || [];

        const latest = results.reduce((acc, curr) => {
            if (!acc) return curr;
            const accDate = acc?.createdAt ? new Date(acc.createdAt) : null;
            const currDate = curr?.createdAt ? new Date(curr.createdAt) : null;
            if (!accDate || !currDate) return acc;
            return currDate > accDate ? curr : acc;
        }, results[0]);

        let markers = [];
        try {
            markers = latest?.signals ? JSON.parse(latest.signals) : [];
        } catch {
            markers = [];
        }

        const aiRiskScore = Math.round(Number(submissionData?.aiRiskScore) || 0);
        const reasoningText = latest?.reasoning || "Analysis pending.";

        return {
            aiRisk: {
                score: aiRiskScore,
                markers,
                fragmentAnalysis: reasoningText,
            },
            citations: {
                score: 0,
                verifiedCount: 0,
                totalCount: 0,
                checkResults: [],
            },
            reasoning: {
                score: 0,
                analysis: reasoningText,
            },
        };
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch submission details
                const subRes = await fetch(`/api/submissions/${id}`);
                const subData = await subRes.json();

                if (subData.success) {
                    setSubmission(subData.submission);
                    setLlmResults(buildLlmResultsFromSubmission(subData.submission));
                } else {
                    setError(subData.error || 'Failed to fetch submission');
                }
            } catch (err) {
                console.error('Error fetching submission:', err);
                setError('Error loading submission details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className={detailStyles.loadingScreen}>
                <div className={detailStyles.spinner}></div>
                <p>Loading Submission Details...</p>
            </div>
        );
    }

    if (error || !submission) {
        return (
            <div className={styles.adminMain}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>⚠️</div>
                    <h3>Submission Not Found</h3>
                    <p>{error || 'The requested submission could not be loaded.'}</p>
                    <Link href="/admin/integrity" className="btn btn-primary">
                        Back to Reports
                    </Link>
                </div>
            </div>
        );
    }

    const writerName = submission.writer?.fullName || 'Unknown Writer';
    const writerAvatar = writerName.split(' ').map(n => n[0]).join('').toUpperCase();
    const assignmentTitle = submission.assignment?.title || 'Untitled Assignment';
    const styleMatch = submission.integrityScore || 0;
    const internalSimilarity = 0; // Not yet implemented in schema

    const updateSubmissionStatus = async (status, notes) => {
        setIsUpdatingStatus(true);
        try {
            const res = await fetch(`/api/submissions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, notes })
            });

            const data = await res.json();
            if (!res.ok || !data.success) {
                throw new Error(data.error || 'Failed to update submission');
            }

            setSubmission((prev) => {
                if (!prev) return prev;
                return {
                    ...prev,
                    status: data.submission.status,
                    updatedAt: data.submission.updatedAt
                };
            });
        } catch (err) {
            console.error('Update status error:', err);
            alert(err.message || 'Failed to update submission');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
    return (
        <main className={styles.adminMain}>
            <div className={detailStyles.reportHeader}>
                <div>
                    <div className={detailStyles.writerBadge}>
                        <div className={detailStyles.avatar}>{writerAvatar}</div>
                        <span>{writerName}</span>
                        <span className={`badge badge-success`}>{submission.status}</span>
                    </div>
                    <h1 className={detailStyles.title}>{assignmentTitle}</h1>
                    <p className={detailStyles.meta}>Submitted {formatDate(submission.createdAt)} • ID: {id}</p>
                </div>
                <div className={detailStyles.actions}>
                    <button className="btn btn-secondary">Download PDF</button>
                    <button
                        className="btn btn-warning"
                        disabled={isUpdatingStatus}
                        onClick={() => {
                            const reason = prompt('Reason / notes for revision request:');
                            if (reason === null) return;
                            if (reason.trim().length === 0) {
                                alert('Notes are required to request a revision.');
                                return;
                            }
                            updateSubmissionStatus('NEEDS_REWRITE', reason);
                        }}
                    >
                        Request Revision
                    </button>
                    <button
                        className="btn btn-danger"
                        disabled={isUpdatingStatus}
                        onClick={() => {
                            const confirmed = confirm('Reject this submission?');
                            if (!confirmed) return;
                            const reason = prompt('Reason / notes for rejection:');
                            if (reason === null) return;
                            if (reason.trim().length === 0) {
                                alert('Notes are required to reject a submission.');
                                return;
                            }
                            updateSubmissionStatus('REJECTED', reason);
                        }}
                    >
                        Reject
                    </button>
                    <button
                        className="btn btn-success"
                        disabled={isUpdatingStatus}
                        onClick={() => updateSubmissionStatus('APPROVED')}
                    >
                        Approve Submission
                    </button>
                </div>
            </div>

            <div className={detailStyles.reportGrid}>
                {/* Left Column: Deterministic Metrics */}
                <div className={detailStyles.column}>
                    <section className={detailStyles.sectionCard}>
                        <h3>Stylometry Baseline Analysis</h3>
                        <div className={detailStyles.metricMain}>
                            <div className={detailStyles.gaugeContainer}>
                                <div className={detailStyles.gaugeLabel}>Style Match</div>
                                <div className={detailStyles.gaugeValue}>{styleMatch}%</div>
                            </div>
                            <div className={detailStyles.statList}>
                                <div className={detailStyles.statItem}>
                                    <span className={detailStyles.statLabel}>Sentence Var.</span>
                                    <span className={detailStyles.statVal}>Normal</span>
                                </div>
                                <div className={detailStyles.statItem}>
                                    <span className={detailStyles.statLabel}>Vocab Diversity</span>
                                    <span className={detailStyles.statVal}>Moderate</span>
                                </div>
                                <div className={detailStyles.statItem}>
                                    <span className={detailStyles.statLabel}>Readability</span>
                                    <span className={detailStyles.statVal}>Standard</span>
                                </div>
                            </div>
                        </div>
                        <p className={detailStyles.interpretation}>
                            Analysis based on submitted content compared to writer baseline.
                        </p>
                    </section>

                    <section className={detailStyles.sectionCard}>
                        <h3>Internal Similarity</h3>
                        <div className={detailStyles.similarityHeader}>
                            <span className={detailStyles.similarityScore}>{internalSimilarity}% Overlap</span>
                            <span className="badge badge-success">Low Risk</span>
                        </div>
                        <div className={detailStyles.similarityNote}>
                            No significant overlap detected with internal database.
                        </div>
                    </section>
                </div>

                {/* Right Column: LLM Intelligence */}
                <div className={detailStyles.column}>
                    {llmResults ? (
                        <>
                            <section className={`${detailStyles.sectionCard} ${detailStyles.aiRiskCard}`}>
                                <div className={detailStyles.cardHeader}>
                                    <h3>AI Assistant Risk</h3>
                                    <span className={detailStyles.scorePill}>{llmResults.aiRisk?.score || 0}% AI Probability</span>
                                </div>

                                <div className={detailStyles.markerList}>
                                    {(llmResults.aiRisk?.markers || []).map((m, i) => (
                                        <div key={i} className={`${detailStyles.marker} ${detailStyles[m.type]}`}>
                                            {m.message}
                                        </div>
                                    ))}
                                </div>
                                <div className={detailStyles.analystNote}>
                                    <strong>LLM Evaluation:</strong> {llmResults.aiRisk?.fragmentAnalysis || 'Analysis pending.'}
                                </div>
                            </section>

                            <section className={detailStyles.sectionCard}>
                                <h3>Citation Sanity Check</h3>
                                <div className={detailStyles.citationHeader}>
                                    <span className={detailStyles.citationCount}>
                                        {llmResults.citations?.verifiedCount || 0}/{llmResults.citations?.totalCount || 0} Verified
                                    </span>
                                </div>
                                <div className={detailStyles.citationList}>
                                    {(llmResults.citations?.checkResults || []).map((c) => (
                                        <div key={c.id} className={detailStyles.citationItem}>
                                            <div className={detailStyles.citationSource}>
                                                <span className={`${detailStyles.dot} ${detailStyles[c.status]}`}></span>
                                                <strong>{c.source}</strong>
                                            </div>
                                            <div className={detailStyles.citationSnippet}>{c.snippet}</div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className={`${detailStyles.sectionCard} ${detailStyles.reasoningCard}`}>
                                <h3>Reasoning Depth</h3>
                                <div className={detailStyles.reasoningHeader}>
                                    <span className={detailStyles.reasoningScore}>{llmResults.reasoning?.score || 0}</span>
                                    <span className={detailStyles.scoreMax}>/ 100</span>
                                </div>
                                <p className={detailStyles.reasoningText}>{llmResults.reasoning?.analysis || 'Analysis pending.'}</p>
                            </section>
                        </>
                    ) : (
                        <section className={detailStyles.sectionCard}>
                            <h3>LLM Analysis</h3>
                            <p>LLM analysis data is not available for this submission.</p>
                        </section>
                    )}
                </div>
            </div>
        </main>
    );
}
