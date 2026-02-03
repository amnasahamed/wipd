"use client";

import { useEffect, useState, useCallback } from "react";
import styles from "../admin.module.css";

export default function AnalyticsPage() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/stats');
            const data = await res.json();
            if (data.success) {
                setStats(data.stats);
            } else {
                setError(data.error);
            }
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to connect to analytics API');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    if (loading) return (
        <main className={styles.adminMain}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', width: '100%' }}>
                <div className="spinner"></div>
                <p style={{ marginLeft: '12px' }}>Loading analytics...</p>
            </div>
        </main>
    );

    return (
        <main className={styles.adminMain}>
            <div className={styles.pageHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div>
                        <h1 className={styles.pageTitle}>System Analytics</h1>
                        <p className={styles.pageSubtitle}>
                            Overview of system performance, writer distribution, and quality metrics.
                        </p>
                    </div>
                    <button onClick={fetchStats} className="btn btn-ghost">Refresh</button>
                </div>
            </div>

            <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Avg. Integrity Score</span>
                        <div className={`${styles.statIcon} ${styles.primary}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                            </svg>
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats?.avgIntegrity}%</div>
                    <div className={`${styles.statChange} ${styles.positive}`}>
                        <span>System Average</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>AI Assistance Rate</span>
                        <div className={`${styles.statIcon} ${styles.warning}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                            </svg>
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats?.aiRate}%</div>
                    <div className={`${styles.statChange} ${parseFloat(stats?.aiRate) > 15 ? styles.negative : styles.positive}`}>
                        <span>{parseFloat(stats?.aiRate) > 15 ? 'Attention required' : 'Stable levels'}</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Task Completion Rate</span>
                        <div className={`${styles.statIcon} ${styles.primary}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.091 1.976 1.054 1.976 2.19v2.19a.75.75 0 0 1-.75.75h-4.5a.75.75 0 0 1-.75-.75V6.108c0-1.135-.845-2.098-1.976-2.19a.75.75 0 0 1-.75-.75V2.25" />
                            </svg>
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats?.completionRate}%</div>
                    <div className={`${styles.statChange} ${styles.positive}`}>
                        <span>High efficiency</span>
                    </div>
                </div>

                <div className={styles.statCard}>
                    <div className={styles.statHeader}>
                        <span className={styles.statLabel}>Total Writers</span>
                        <div className={`${styles.statIcon} ${styles.success}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                        </div>
                    </div>
                    <div className={styles.statValue}>{stats?.totalWriters}</div>
                    <div className={`${styles.statChange} ${styles.positive}`}>
                        <span>Active ecosystem</span>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
                <div className={styles.dataTableContainer}>
                    <div className={styles.tableHeader}>
                        <h2 className={styles.tableTitle}>Writer Performance Distribution</h2>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                <span>High Performers (Expert)</span>
                                <span>{stats?.distribution.expert}%</span>
                            </div>
                            <div className={styles.scoreBar} style={{ width: '100%', height: '8px' }}>
                                <div className={styles.scoreFill} style={{ width: `${stats?.distribution.expert}%`, background: 'var(--primary-600)' }}></div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                <span>Standard (Senior)</span>
                                <span>{stats?.distribution.senior}%</span>
                            </div>
                            <div className={styles.scoreBar} style={{ width: '100%', height: '8px' }}>
                                <div className={styles.scoreFill} style={{ width: `${stats?.distribution.senior}%`, background: 'var(--primary-400)' }}></div>
                            </div>
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                                <span>Development Needed (Junior)</span>
                                <span>{stats?.distribution.junior}%</span>
                            </div>
                            <div className={styles.scoreBar} style={{ width: '100%', height: '8px' }}>
                                <div className={styles.scoreFill} style={{ width: `${stats?.distribution.junior}%`, background: 'var(--primary-200)' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.dataTableContainer}>
                    <div className={styles.tableHeader}>
                        <h2 className={styles.tableTitle}>System Health Summary</h2>
                    </div>
                    <div style={{ padding: '24px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Live Assignments</div>
                                <div style={{ fontSize: '24px', fontWeight: 700 }}>{stats?.totalAssignments}</div>
                            </div>
                            <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border-light)' }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Integrity Status</div>
                                <div style={{ color: 'var(--success-600)', fontWeight: 600 }}>Optimal</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}
