"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

// Mock assignments data
const mockAssignments = [
    {
        id: "a1",
        title: "Comparison study of GPT-4 vs Claude 3",
        writer: "Alice Smith",
        type: "technical",
        status: "in-progress",
        deadline: "2026-02-05",
        reward: "$120.00"
    },
    {
        id: "a2",
        title: "Policy brief on AI ethics in healthcare",
        writer: "Charlie Davis",
        type: "academic",
        status: "submitted",
        deadline: "2026-02-02",
        reward: "$150.00"
    },
    {
        id: "a3",
        title: "Technical documentation for API integration",
        writer: "Diana Prince",
        type: "technical",
        status: "completed",
        deadline: "2026-01-30",
        reward: "$85.00"
    },
    {
        id: "a4",
        title: "Analysis of market trends in SaaS 2026",
        writer: "Bob Johnson",
        type: "academic",
        status: "created",
        deadline: "2026-02-10",
        reward: "$95.00"
    },
    {
        id: "a5",
        title: "Whitepaper on zero-knowledge proofs",
        writer: "Alice Smith",
        type: "technical",
        status: "completed",
        deadline: "2026-01-25",
        reward: "$200.00"
    }
];

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const res = await fetch('/api/assignments');
                const data = await res.json();
                if (data.success) {
                    // Transform API data to match UI expectations if needed
                    // API returns: { id, title, writerName, deadline, status, lastSubmission }
                    const formatted = data.assignments.map(a => ({
                        id: a.id,
                        title: a.title,
                        writer: a.writerName,
                        type: "technical", // Default or fetch if available
                        status: a.status.toLowerCase(),
                        deadline: new Date(a.deadline).toLocaleDateString(),
                        reward: "$100.00" // Placeholder or fetch
                    }));
                    setAssignments(formatted);
                }
            } catch (error) {
                console.error('Error fetching assignments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssignments();
    }, []);

    const filteredAssignments = assignments.filter((item) => {
        const matchesStatus = statusFilter === "all" || item.status === statusFilter;
        const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.writer.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusStyle = (status) => {
        switch (status) {
            case 'completed': return styles.approved;
            case 'submitted': return styles.probation;
            case 'in-progress': return styles.pending;
            default: return 'badge-neutral';
        }
    };

    if (loading) {
        return <main className={styles.adminMain}>Loading...</main>;
    }

    return (
        <main className={styles.adminMain}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Assignments Overview</h1>
                    <p className={styles.pageSubtitle}>
                        Monitor and manage writing tasks across the system.
                    </p>
                </div>
                <Link href="/admin/assignments/new" className="btn btn-primary">
                    Create New Assignment
                </Link>
            </div>

            <div className={styles.dataTableContainer}>
                <div className={styles.tableHeader}>
                    <h2 className={styles.tableTitle}>All Tasks</h2>
                    <div className={styles.tableActions}>
                        <div className={styles.searchInput}>
                            <input
                                type="text"
                                placeholder="Search by title or writer..."
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
                            <option value="created">Created</option>
                            <option value="in-progress">In Progress</option>
                            <option value="submitted">Submitted</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Assignment Title</th>
                            <th>Writer</th>
                            <th>Type</th>
                            <th>Deadline</th>
                            <th>Reward</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredAssignments.map((item) => (
                            <tr key={item.id}>
                                <td>
                                    <div style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {item.title}
                                    </div>
                                </td>
                                <td>{item.writer}</td>
                                <td>
                                    <span className={`badge ${item.type === 'technical' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '10px' }}>
                                        {item.type}
                                    </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>{item.deadline}</td>
                                <td style={{ fontWeight: 600, color: 'var(--primary-700)' }}>{item.reward}</td>
                                <td>
                                    <span className={`${styles.statusBadge} ${getStatusStyle(item.status)}`}>
                                        {item.status.replace('-', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button className={styles.actionBtn}>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="16" height="16">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredAssignments.length === 0 && (
                    <div className={styles.emptyState}>
                        <h3>No assignments found</h3>
                    </div>
                )}
            </div>
        </main>
    );
}
