"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            try {
                const res = await fetch('/api/submissions');
                const data = await res.json();
                if (data.success) {
                    setSubmissions(data.submissions);
                }
            } catch (error) {
                console.error('Error fetching submissions:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchSubmissions();
    }, []);

    const filteredSubmissions = submissions.filter((item) => {
        return item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.writer.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const getScoreColor = (score) => {
        if (score >= 90) return styles.approved;
        if (score >= 70) return styles.pending;
        return styles.rejected;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    if (loading) {
        return <main className={styles.adminMain}>Loading...</main>;
    }

    return (
        <main className={styles.adminMain}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Submissions Analytics</h1>
                    <p className={styles.pageSubtitle}>
                        Track submitted work and automated integrity analysis results.
                    </p>
                </div>
            </div>

            <div className={styles.dashboardCard}>
                <div className={styles.cardHeader}>
                    <h3>Recent Submissions</h3>
                    <div className={styles.headerActions}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search submissions..."
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
                    </div>
                </div>

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Submission</th>
                                <th>Writer</th>
                                <th>Submitted At</th>
                                <th>Integrity Score</th>
                                <th>AI/Plagiarism</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSubmissions.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No submissions found.
                                    </td>
                                </tr>
                            ) : (
                                filteredSubmissions.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{ fontWeight: 500, color: '#334155', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.title}</div>
                                        </td>
                                        <td>{item.writer}</td>
                                        <td style={{ color: '#64748b', fontSize: '12px' }}>{formatDate(item.submittedAt)}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span style={{
                                                    fontWeight: 700,
                                                    fontSize: '14px',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    background: item.integrityScore >= 90 ? '#dcfce7' : item.integrityScore >= 70 ? '#fef9c3' : '#fee2e2',
                                                    color: item.integrityScore >= 90 ? '#166534' : item.integrityScore >= 70 ? '#854d0e' : '#991b1b'
                                                }}>
                                                    {item.integrityScore}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '11px', color: '#64748b' }}>
                                                AI: <span style={{ color: item.aiScore > 20 ? '#ef4444' : 'inherit', fontWeight: item.aiScore > 20 ? 600 : 400 }}>{item.aiScore}%</span> |
                                                Plag: <span style={{ color: item.plagiarismScore > 5 ? '#ef4444' : 'inherit', fontWeight: item.plagiarismScore > 5 ? 600 : 400 }}>{item.plagiarismScore}%</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${item.status === 'flagged' ? 'badge-error' : item.status === 'reviewed' ? 'badge-success' : 'badge-warning'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <Link href={`/admin/integrity?id=${item.id}`} className={styles.actionBtn} title="View Integrity Report">
                                                    View Report
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
