"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

export default function WritersPage() {
    const [writers, setWriters] = useState([]);
    const [levelFilter, setLevelFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWriters();
    }, []);

    const fetchWriters = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/writers');
            const data = await response.json();
            if (data.success) {
                setWriters(data.writers);
            } else {
                setError(data.error || 'Failed to fetch writers');
            }
        } catch (err) {
            setError('Error connecting to API');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filteredWriters = writers.filter((writer) => {
        // Map status to what's expected in the filter or DB
        const statusMatch = statusFilter === "all" ||
            (statusFilter === "approved" && writer.status === "ACTIVE") ||
            (statusFilter === "probation" && writer.status === "ONBOARDING");

        const matchesSearch = writer.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            writer.email.toLowerCase().includes(searchQuery.toLowerCase());

        return statusMatch && matchesSearch;
    });

    const getScoreClass = (score) => {
        if (score >= 90) return styles.high;
        if (score >= 80) return styles.medium;
        return styles.low;
    };

    return (
        <main className={styles.adminMain}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Writer Management</h1>
                    <p className={styles.pageSubtitle}>
                        Manage active writers, monitor performance, and handle probation cases.
                    </p>
                </div>
            </div>

            <div className={styles.dataTableContainer}>
                <div className={styles.tableHeader}>
                    <h2 className={styles.tableTitle}>All Writers</h2>
                    <div className={styles.tableActions}>
                        <button onClick={fetchWriters} className={styles.filterBtn} style={{ marginRight: '10px' }}>
                            Refresh
                        </button>
                        <div className={styles.searchInput}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search writers..."
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
                            <option value="approved">Active</option>
                            <option value="probation">Onboarding</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className={styles.emptyState}>
                        <div className="spinner"></div>
                        <p>Loading writers...</p>
                    </div>
                ) : error ? (
                    <div className={styles.emptyState}>
                        <p style={{ color: 'red' }}>{error}</p>
                        <button onClick={fetchWriters} className={styles.filterBtn}>Retry</button>
                    </div>
                ) : (
                    <table className={styles.dataTable}>
                        <thead>
                            <tr>
                                <th>Writer</th>
                                <th>Avg. Score</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredWriters.map((writer) => (
                                <tr key={writer.id}>
                                    <td>
                                        <div className={styles.applicantInfo}>
                                            <div className={styles.applicantAvatar} style={{ background: 'var(--success-100)', color: 'var(--success-700)' }}>
                                                {(writer.fullName || 'U').split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <div className={styles.applicantName}>{writer.fullName || 'No Name'}</div>
                                                <div className={styles.applicantEmail}>{writer.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className={styles.testScore}>
                                            <div className={styles.scoreText}>G: {writer.grammarScore || 0}%</div>
                                            <div className={styles.scoreBar} style={{ width: '80px' }}>
                                                <div
                                                    className={`${styles.scoreFill} ${getScoreClass(writer.grammarScore || 0)}`}
                                                    style={{ width: `${writer.grammarScore || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[writer.status.toLowerCase() === 'active' ? 'approved' : 'probation']}`}>
                                            {writer.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className={styles.actionButtons}>
                                            <Link href={`/admin/writers/${writer.id}`} className={`${styles.actionBtn} ${styles.view}`} title="View Profile">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                                </svg>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {filteredWriters.length === 0 && (
                    <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                        <h3>No writers found</h3>
                        <p>Try adjusting your search or filters.</p>
                    </div>
                )}
            </div>
        </main>
    );
}
