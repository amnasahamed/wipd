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
        const matchesStatus = statusFilter === "all" || app.status.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.email.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const formatDate = (dateString) => {
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

            <div className={styles.dataTableContainer}>
                <div className={styles.tableHeader}>
                    <h2 className={styles.tableTitle}>All Applications</h2>
                    <div className={styles.tableActions}>
                        <button onClick={fetchApplications} className={styles.filterBtn} style={{ marginRight: '10px' }}>
                            Refresh
                        </button>
                        <div className={styles.searchInput}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className={styles.filterBtn}
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="all">All Status</option>
                            <option value="onboarding">Onboarding</option>
                            <option value="active">Active</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.emptyState}>
                        <div className="spinner"></div>
                        <p>Loading applications...</p>
                    </div>
                ) : error ? (
                    <div className={styles.emptyState}>
                        <p style={{ color: 'red' }}>{error}</p>
                        <button onClick={fetchApplications} className={styles.filterBtn}>Retry</button>
                    </div>
                ) : (
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Applicant</th>
                                <th>Applied Date</th>
                                <th>Test Scores</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredApplications.map((app) => (
                                <tr key={app.id}>
                                    <td>
                                        <div className={styles.applicantInfo}>
                                            <div className={styles.applicantAvatar}>
                                                {app.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <div className={styles.applicantName}>{app.name}</div>
                                                <div className={styles.applicantEmail}>{app.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{formatDate(app.appliedAt)}</td>
                                    <td>
                                        <div className={styles.testScore}>
                                            <div className={styles.scoreText}>G: {app.grammarScore || 0}%</div>
                                            <div className={styles.scoreBar}>
                                                <div
                                                    className={`${styles.scoreFill} ${getScoreClass(app.grammarScore || 0)}`}
                                                    style={{ width: `${app.grammarScore || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className={styles.testScore} style={{ marginTop: '4px' }}>
                                            <div className={styles.scoreText}>P: {app.policyScore || 0}%</div>
                                            <div className={styles.scoreBar}>
                                                <div
                                                    className={`${styles.scoreFill} ${getScoreClass(app.policyScore || 0)}`}
                                                    style={{ width: `${app.policyScore || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[app.status.toLowerCase()]}`}>
                                            {app.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <Link href={`/admin/applications/${app.id}`} className={`${styles.actionBtn} ${styles.view}`} title="View Details">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {filteredApplications.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                        </div>
                        <h3>No applications found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                )}

                <div className={styles.tablePagination}>
                    <div className={styles.paginationInfo}>
                        Showing {filteredApplications.length} of {applications.length} applications
                    </div>
                    <div className={styles.paginationControls}>
                        <button className={styles.paginationBtn} disabled>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                            </svg>
                        </button>
                        <button className={`${styles.paginationBtn} ${styles.active}`}>1</button>
                        <button className={styles.paginationBtn} disabled>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}
