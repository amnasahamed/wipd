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

            <div className={styles.dashboardCard}>
                <div className={styles.cardHeader}>
                    <h3>All Tasks</h3>
                    <div className={styles.headerActions} style={{ gap: '12px' }}>
                        <div style={{ position: 'relative' }}>
                            <input
                                type="text"
                                placeholder="Search by title or writer..."
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
                            <option value="created">Created</option>
                            <option value="in-progress">In Progress</option>
                            <option value="submitted">Submitted</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                <div className={styles.tableResponsive}>
                    <table className={styles.table}>
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
                            {filteredAssignments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                        No assignments found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredAssignments.map((item) => (
                                    <tr key={item.id}>
                                        <td>
                                            <div style={{ fontWeight: 500, color: '#334155', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {item.title}
                                            </div>
                                        </td>
                                        <td>
                                            <div className={styles.writerInfo} style={{ gap: '8px' }}>
                                                <div className={styles.avatar} style={{ width: '28px', height: '28px', fontSize: '11px', background: '#f1f5f9', color: '#64748b' }}>
                                                    {(item.writer[0])}
                                                </div>
                                                <span style={{ fontSize: '13px' }}>{item.writer}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${item.type === 'technical' ? 'badge-primary' : 'badge-neutral'}`} style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td style={{ color: '#64748b', fontSize: '13px' }}>{item.deadline}</td>
                                        <td style={{ fontWeight: 600, color: '#334155' }}>{item.reward}</td>
                                        <td>
                                            <span className={`badge ${item.status === 'completed' ? 'badge-success' : item.status === 'submitted' ? 'badge-warning' : 'badge-neutral'}`}>
                                                {item.status.replace('-', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <div className={styles.actionButtons}>
                                                <button className={styles.actionBtn}>
                                                    Review
                                                </button>
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
