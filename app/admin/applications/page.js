"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

export default function ApplicationsPage() {
    const [applications, setApplications] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/applications');
            const data = await response.json();
            if (data.success) {
                setApplications(data.applications);
            } else {
                setError(data.error || 'Failed to fetch applications');
            }
        } catch (err) {
            setError('Error connecting to API');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredApplications = applications.filter((app) => {
        const status = app.status || '';
        const name = app.name || '';
        const email = app.email || '';

        const matchesStatus = statusFilter === "all" || status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    const getScoreClass = (score) => {
        if (score >= 90) return styles.high;
        if (score >= 80) return styles.medium;
        return styles.low;
    };

    return (
        <main className={styles.adminMain}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Writer Applications</h1>
                    <p className={styles.pageSubtitle}>
                        Review and process new writer applications.
                    </p>
                </div>
            </div>

            <div className={styles.dashboardCard}>
                <div className={styles.cardHeader}>
                    <h3>All Applications</h3>
                    <div className={styles.headerActions} style={{ gap: '12px' }}>
                        <button onClick={fetchApplications} className={styles.actionBtn}>
                            Refresh
                        </button>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #e2e8f0',
                                    fontSize: '13px',
                                    width: '240px'
                                }}
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            style={{
                                padding: '8px 12px',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0',
                                fontSize: '13px',
                                backgroundColor: '#fff'
                            }}
                        >
                            <option value="all">All Status</option>
                            <option value="onboarding">Onboarding</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '10px' }}>Loading applications...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                        <p>{error}</p>
                        <button onClick={fetchApplications} className="btn btn-sm btn-outline" style={{ marginTop: '10px' }}>Retry</button>
                    </div>
                ) : (
                    <div className={styles.tableResponsive}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Applied Date</th>
                                    <th>Test Scores</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredApplications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No applications found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredApplications.map((app) => (
                                        <tr key={app.id}>
                                            <td>
                                                <div className={styles.writerInfo}>
                                                    <div className={styles.avatar}>
                                                        {(app.name || "?").split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <div className={styles.writerName}>{app.name || "Unknown"}</div>
                                                        <div className={styles.writerEmail}>{app.email || "No Email"}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ color: '#64748b', fontSize: '13px' }}>{formatDate(app.appliedAt)}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '16px' }}>
                                                    <div>
                                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Grammar</div>
                                                        <div style={{ width: '60px', height: '4px', background: '#e2e8f0', borderRadius: '2px' }}>
                                                            <div style={{ width: `${app.grammarScore || 0}%`, height: '100%', background: app.grammarScore >= 80 ? '#22c55e' : '#f59e0b', borderRadius: '2px' }}></div>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Policy</div>
                                                        <div style={{ width: '60px', height: '4px', background: '#e2e8f0', borderRadius: '2px' }}>
                                                            <div style={{ width: `${app.policyScore || 0}%`, height: '100%', background: app.policyScore >= 80 ? '#22c55e' : '#f59e0b', borderRadius: '2px' }}></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${(app.status || '').toLowerCase() === 'active' ? 'badge-success' : (app.status || '').toLowerCase() === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                                                    {app.status || 'Pending'}
                                                </span>
                                            </td>
                                            <td>
                                                <Link href={`/admin/applications/${app.id}`} className={styles.actionBtn}>
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </main>
    );
}
