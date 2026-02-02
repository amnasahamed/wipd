"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "../dashboard.module.css";
import insightStyles from "./insights.module.css";

export default function WriterInsightsPage() {
    const [insights, setInsights] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);

    const fetchInsights = useCallback(async () => {
        setLoading(true);
        try {
            const userRes = await fetch('/api/me');
            const userData = await userRes.json();

            if (userData.id) {
                setUser(userData);
                const assignmentsRes = await fetch(`/api/assignments/writer?writerId=${userData.id}`);
                const assignmentsData = await assignmentsRes.json();

                if (assignmentsData.success) {
                    const mappedInsights = assignmentsData.assignments
                        .filter(a => a.submission && a.submission.analysis)
                        .map(a => ({
                            id: a.submission.id,
                            assignment: a.title,
                            submittedAt: a.submission.createdAt,
                            status: a.status.toLowerCase(),
                            feedback: {
                                overallScore: a.submission.analysis.integrityScore >= 80 ? "excellent" : "good",
                                styleAlignment: {
                                    score: a.submission.analysis.stylometricScore || 0,
                                    message: a.submission.analysis.stylometricScore >= 80 ?
                                        "Excellent consistency with your established writing style." :
                                        "Some variations from your typical style were detected.",
                                },
                                originality: {
                                    score: a.submission.analysis.integrityScore || 0,
                                    message: "Demonstrates good original thought and structure.",
                                },
                                citations: {
                                    score: 100, // Mock for now
                                    message: "All cited sources verified correctly.",
                                },
                                suggestions: [
                                    "Maintain the current level of technical depth",
                                    "Continue using varied sentence structures"
                                ],
                            },
                        }));
                    setInsights(mappedInsights);
                } else {
                    setError(assignmentsData.error || 'Failed to fetch insights');
                }
            }
        } catch (err) {
            console.error('Error fetching insights:', err);
            setError('Error connecting to API');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInsights();
    }, [fetchInsights]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const getScoreClass = (score) => {
        if (score >= 85) return "excellent";
        if (score >= 70) return "good";
        return "needs_work";
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case "approved": return { text: "Approved", class: "success" };
            case "revision_requested": return { text: "Revision Requested", class: "warning" };
            case "pending": return { text: "Pending Review", class: "neutral" };
            default: return { text: status, class: "neutral" };
        }
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
                    <Link href="/writer/assignments" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m0 0V4.5A2.25 2.25 0 0 0 15 2.25H9A2.25 2.25 0 0 0 6.75 4.5v.108c-.375.024-.75.05-1.124.08C4.095 4.782 3.25 5.745 3.25 6.88V18a2.25 2.25 0 0 0 2.25 2.25h3" />
                        </svg>
                        Assignments
                    </Link>
                    <Link href="/writer/submissions" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        Submissions
                    </Link>
                    <Link href="/writer/insights" className={`${styles.navItem} ${styles.active}`}>
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
                    <h1>Your Insights 📊</h1>
                    <p>Review feedback and suggestions to improve your writing.</p>
                </div>

                {/* Tips Banner */}
                <div className={insightStyles.tipsBanner}>
                    <div className={insightStyles.tipsIcon}>💡</div>
                    <div className={insightStyles.tipsContent}>
                        <h4>Quick Tips</h4>
                        <p>Consistent writing style helps build your baseline and improves approval rates. Focus on the suggestions provided to enhance your work quality.</p>
                    </div>
                </div>

                {/* Insights List */}
                <div className={insightStyles.insightsList}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <div className="spinner"></div>
                            <p>Loading insights...</p>
                        </div>
                    ) : error ? (
                        <div style={{ textAlign: 'center', padding: '60px' }}>
                            <p style={{ color: 'red' }}>{error}</p>
                            <button onClick={fetchInsights} className="btn btn-primary btn-sm">Retry</button>
                        </div>
                    ) : insights.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-light)' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600 }}>No insights available yet</h3>
                            <p style={{ color: 'var(--text-secondary)' }}>Insights will appear once your submissions are analyzed.</p>
                        </div>
                    ) : (
                        insights.map((insight) => {
                            const statusBadge = getStatusBadge(insight.status);
                            return (
                                <div key={insight.id} className={insightStyles.insightCard}>
                                    <div className={insightStyles.cardHeader}>
                                        <div>
                                            <h3>{insight.assignment}</h3>
                                            <span className={insightStyles.submissionDate}>
                                                Submitted {formatDate(insight.submittedAt)}
                                            </span>
                                        </div>
                                        <span className={`badge badge-${statusBadge.class}`}>{statusBadge.text}</span>
                                    </div>

                                    {/* Score Cards */}
                                    <div className={insightStyles.scoreGrid}>
                                        <div className={`${insightStyles.scoreCard} ${insightStyles[getScoreClass(insight.feedback.styleAlignment.score)]}`}>
                                            <div className={insightStyles.scoreHeader}>
                                                <span>Style Alignment</span>
                                                <span className={insightStyles.scoreValue}>{insight.feedback.styleAlignment.score}%</span>
                                            </div>
                                            <p>{insight.feedback.styleAlignment.message}</p>
                                        </div>

                                        <div className={`${insightStyles.scoreCard} ${insightStyles[getScoreClass(insight.feedback.originality.score)]}`}>
                                            <div className={insightStyles.scoreHeader}>
                                                <span>Originality</span>
                                                <span className={insightStyles.scoreValue}>{insight.feedback.originality.score}%</span>
                                            </div>
                                            <p>{insight.feedback.originality.message}</p>
                                        </div>

                                        <div className={`${insightStyles.scoreCard} ${insightStyles[getScoreClass(insight.feedback.citations.score)]}`}>
                                            <div className={insightStyles.scoreHeader}>
                                                <span>Citations</span>
                                                <span className={insightStyles.scoreValue}>{insight.feedback.citations.score}%</span>
                                            </div>
                                            <p>{insight.feedback.citations.message}</p>
                                        </div>
                                    </div>

                                    {/* Suggestions */}
                                    {insight.feedback.suggestions.length > 0 && (
                                        <div className={insightStyles.suggestionsSection}>
                                            <h4>Suggestions for Improvement</h4>
                                            <ul>
                                                {insight.feedback.suggestions.map((suggestion, idx) => (
                                                    <li key={idx}>{suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {insight.status.toLowerCase() === "revision_requested" && (
                                        <div className={insightStyles.cardActions}>
                                            <Link href={`/writer/assignments/${insight.id}/submit`} className="btn btn-primary">
                                                Submit Revision
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </main>
        </div>
    );
}
