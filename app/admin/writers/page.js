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

            <div className={styles.dashboardCard}>
                <div className={styles.cardHeader}>
                    <h3>All Writers</h3>
                    <div className={styles.headerActions} style={{ gap: '12px' }}>
                        <button onClick={fetchWriters} className={styles.actionBtn}>
                            Refresh
                        </button>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search writers..."
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
                            <option value="approved">Active</option>
                            <option value="probation">Onboarding</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '10px' }}>Loading writers...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                        <p>{error}</p>
                        <button onClick={fetchWriters} className="btn btn-sm btn-outline" style={{ marginTop: '10px' }}>Retry</button>
                    </div>
                ) : (
                    <div className={styles.tableResponsive}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Writer</th>
                                    <th>Avg. Score</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredWriters.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No writers found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredWriters.map((writer) => (
                                        <tr key={writer.id}>
                                            <td>
                                                <div className={styles.writerInfo}>
                                                    <div className={styles.avatar} style={{ background: '#dcfce7', color: '#166534' }}>
                                                        {(writer.fullName || 'U').split(" ").map(n => n[0]).join("")}
                                                    </div>
                                                    <div>
                                                        <div className={styles.writerName}>{writer.fullName || 'No Name'}</div>
                                                        <div className={styles.writerEmail}>{writer.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                                                        <div style={{ width: `${writer.grammarScore || 0}%`, height: '100%', background: writer.grammarScore >= 80 ? '#22c55e' : '#f59e0b', borderRadius: '3px' }}></div>
                                                    </div>
                                                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569' }}>{writer.grammarScore}%</span>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`badge ${writer.status.toLowerCase() === 'active' ? 'badge-success' : 'badge-warning'}`}>
                                                    {writer.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Link href={`/admin/writers/${writer.id}`} className={styles.actionBtn}>
                                                    View Profile
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
