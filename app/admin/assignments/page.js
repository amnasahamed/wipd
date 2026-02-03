"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import styles from "../admin.module.css";

const formatDate = (value) => {
    if (!value) return "—";
    try {
        return new Date(value).toLocaleDateString();
    } catch {
        return "—";
    }
};

const deriveWorkflowStatus = (assignmentStatus, lastSubmissionStatus) => {
    if (lastSubmissionStatus) {
        switch (lastSubmissionStatus) {
            case "PENDING_REVIEW":
                return "submitted";
            case "NEEDS_REWRITE":
                return "revision";
            case "REJECTED":
                return "rejected";
            case "APPROVED":
                return "completed";
            default:
                break;
        }
    }

    switch (assignmentStatus) {
        case "PENDING":
            return "created";
        case "IN_PROGRESS":
            return "in-progress";
        case "COMPLETED":
            return "completed";
        default:
            return "created";
    }
};

const getWorkflowBadgeClass = (workflowStatus) => {
    switch (workflowStatus) {
        case "completed":
            return "badge-success";
        case "submitted":
            return "badge-warning";
        case "revision":
            return "badge-warning";
        case "rejected":
            return "badge-danger";
        default:
            return "badge-neutral";
    }
};

const getWorkflowLabel = (workflowStatus) => {
    switch (workflowStatus) {
        case "created":
            return "Created";
        case "in-progress":
            return "In Progress";
        case "submitted":
            return "Submitted";
        case "revision":
            return "Revision Requested";
        case "rejected":
            return "Rejected";
        case "completed":
            return "Completed";
        default:
            return "Unknown";
    }
};

const getPriorityBadgeClass = (priority) => {
    switch ((priority || "normal").toLowerCase()) {
        case "urgent":
            return "badge-danger";
        case "high":
            return "badge-warning";
        default:
            return "badge-neutral";
    }
};

const formatCategory = (category) => {
    if (!category) return null;
    const normalized = category.toLowerCase();
    if (normalized === "academic") return "Academic";
    if (normalized === "technical") return "Technical";
    if (normalized === "copywriting") return "Copywriting";
    return category;
};

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssignments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/assignments");
            const data = await res.json();

            if (!data.success) {
                setError(data.error || "Failed to fetch assignments");
                return;
            }

            const formatted = (data.assignments || []).map((a) => {
                const workflowStatus = deriveWorkflowStatus(a.status, a.lastSubmission?.status);
                return {
                    id: a.id,
                    title: a.title,
                    writerName: a.writerName || "Unknown Writer",
                    deadline: a.deadline,
                    category: a.category,
                    wordCount: a.wordCount,
                    citationStyle: a.citationStyle,
                    priority: a.priority || "normal",
                    assignmentStatus: a.status,
                    lastSubmission: a.lastSubmission || null,
                    workflowStatus
                };
            });

            setAssignments(formatted);
        } catch (err) {
            setError("Error connecting to API");
            console.error("Error fetching assignments:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAssignments();
    }, [fetchAssignments]);

    const filteredAssignments = useMemo(() => {
        return assignments.filter((item) => {
            const matchesStatus = statusFilter === "all" || item.workflowStatus === statusFilter;

            const query = searchQuery.trim().toLowerCase();
            const matchesSearch = !query ||
                item.title.toLowerCase().includes(query) ||
                item.writerName.toLowerCase().includes(query) ||
                (item.category || "").toLowerCase().includes(query);

            return matchesStatus && matchesSearch;
        });
    }, [assignments, statusFilter, searchQuery]);

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
                        <button onClick={fetchAssignments} className={styles.actionBtn}>
                            Refresh
                        </button>
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
                            <option value="revision">Revision</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                        <div className="spinner"></div>
                        <p style={{ marginTop: '10px' }}>Loading assignments...</p>
                    </div>
                ) : error ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                        <p>{error}</p>
                        <button onClick={fetchAssignments} className="btn btn-sm btn-outline" style={{ marginTop: '10px' }}>Retry</button>
                    </div>
                ) : (
                    <div className={styles.tableResponsive}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Assignment</th>
                                    <th>Writer</th>
                                    <th>Deadline</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAssignments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                                            No assignments found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssignments.map((item) => (
                                        <tr key={item.id}>
                                            <td>
                                                <div style={{ fontWeight: 500, color: '#334155', maxWidth: '380px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                    {item.title}
                                                </div>
                                                <div style={{ marginTop: '6px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                                    {formatCategory(item.category) ? (
                                                        <span className="badge badge-primary" style={{ fontSize: '10px' }}>
                                                            {formatCategory(item.category)}
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                                                            Uncategorized
                                                        </span>
                                                    )}
                                                    {item.wordCount ? (
                                                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                                                            {item.wordCount} words
                                                        </span>
                                                    ) : null}
                                                    {item.citationStyle ? (
                                                        <span className="badge badge-neutral" style={{ fontSize: '10px' }}>
                                                            {item.citationStyle}
                                                        </span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td>
                                                <div className={styles.writerInfo} style={{ gap: '8px' }}>
                                                    <div className={styles.avatar} style={{ width: '28px', height: '28px', fontSize: '11px', background: '#f1f5f9', color: '#64748b' }}>
                                                        {(item.writerName || "U")[0]}
                                                    </div>
                                                    <span style={{ fontSize: '13px' }}>{item.writerName}</span>
                                                </div>
                                            </td>
                                            <td style={{ color: '#64748b', fontSize: '13px' }}>{formatDate(item.deadline)}</td>
                                            <td>
                                                <span className={`badge ${getPriorityBadgeClass(item.priority)}`} style={{ fontSize: '10px', textTransform: 'capitalize' }}>
                                                    {item.priority}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`badge ${getWorkflowBadgeClass(item.workflowStatus)}`}>
                                                    {getWorkflowLabel(item.workflowStatus)}
                                                </span>
                                            </td>
                                            <td>
                                                <div className={styles.actionButtons}>
                                                    {item.lastSubmission?.id ? (
                                                        <Link href={`/admin/submissions/${item.lastSubmission.id}`} className={styles.actionBtn}>
                                                            Review
                                                        </Link>
                                                    ) : (
                                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>No submission</span>
                                                    )}
                                                </div>
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
