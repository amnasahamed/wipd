"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

// Mock submissions data (kept as fallback or type reference if needed, though API is used)
const mockSubmissions = [
    {
        id: "s1",
        title: "Comparison study of GPT-4 vs Claude 3",
        writer: "Alice Smith",
        submittedAt: "2026-02-02T16:20:00Z",
        integrityScore: 98,
        aiScore: 2,
        plagiarismScore: 0,
        status: "reviewed"
    },
    // ... (rest shortened for brevity, but real data comes from API)
];

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

            <div className={styles.dataTableContainer}>
                <div className={styles.tableHeader}>
                    <h2 className={styles.tableTitle}>Recent Submissions</h2>
                    <div className={styles.tableActions}>
                        <div className={styles.searchInput}>
                            <input
                                type="text"
                                placeholder="Search submissions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <table className={styles.dataTable}>
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
                        {filteredSubmissions.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.title}</div>
                                </td>
                                <td>{item.writer}</td>
                                <td style={{ color: 'var(--text-tertiary)', fontSize: '12px' }}>{formatDate(item.submittedAt)}</td>
                                <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{
                                            fontWeight: 700,
                                            fontSize: '14px',
                                            padding: '2px 8px',
                                            borderRadius: '4px',
                                            background: item.integrityScore >= 90 ? 'var(--success-100)' : item.integrityScore >= 70 ? 'var(--warning-100)' : 'var(--danger-100)',
                                            color: item.integrityScore >= 90 ? 'var(--success-700)' : item.integrityScore >= 70 ? 'var(--warning-700)' : 'var(--danger-700)'
                                        }}>
                                            {item.integrityScore}
                                        </span>
                                    </div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                        AI: <span style={{ color: item.aiScore > 20 ? 'var(--danger-600)' : 'inherit' }}>{item.aiScore}%</span> |
                                        Plag: <span style={{ color: item.plagiarismScore > 5 ? 'var(--danger-600)' : 'inherit' }}>{item.plagiarismScore}%</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`${styles.statusBadge} ${item.status === 'flagged' ? styles.rejected : item.status === 'reviewed' ? styles.approved : styles.pending}`}>
                                        {item.status}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <Link href={`/admin/integrity?id=${item.id}`} className={styles.actionBtn} title="View Integrity Report">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.375M9 18h3.375m1.875-12h-.375a3.375 3.375 0 0 1-3.375-3.375V1.125m1.875 4.875c.068 0 .135.01.201.028a3.375 3.375 0 0 1 6.75 0c.066-.018.133-.028.201-.028H21a3.375 3.375 0 0 1 3.375 3.375v14.25a3.375 3.375 0 0 1-3.375 3.375H9a3.375 3.375 0 0 1-3.375-3.375V8.25A3.375 3.375 0 0 1 9 4.875Z" />
                                            </svg>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
