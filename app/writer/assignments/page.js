"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import WriterLayout from "@/components/WriterLayout";
import { useToast } from "@/components/Toast";
import { LoadingSpinner, SkeletonCard } from "@/components/LoadingState";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import { formatDeadline, getStatusConfig, getAssignmentStatusKey } from "@/lib/hooks/useApi";
import styles from "../dashboard.module.css";

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const toast = useToast();

    const fetchAssignments = useCallback(async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/assignments/writer?writerId=${userId}`);
            const data = await res.json();

            if (data.success) {
                setAssignments(data.assignments);
            } else {
                setError(data.error || "Failed to fetch assignments");
                toast.error(data.error || "Failed to fetch assignments");
            }
        } catch (err) {
            setError("Error connecting to API");
            toast.error("Error connecting to API");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [toast]);

    const filteredAssignments = assignments.filter((item) => {
        const statusKey = getAssignmentStatusKey(item);
        const matchesStatus =
            statusFilter === "all" || statusKey === statusFilter.toLowerCase();
        const matchesSearch = item.title
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    return (
        <WriterLayout activeNav="assignments">
            {({ user }) => {
                // Trigger fetch once we have the user
                useEffect(() => {
                    if (user?.id) {
                        fetchAssignments(user.id);
                    }
                }, [user?.id]);

                const handleRefresh = () => {
                    if (user?.id) {
                        fetchAssignments(user.id);
                        toast.info("Refreshing assignments...");
                    }
                };

                return (
                    <>
                        <div className={styles.welcomeHeader}>
                            <div>
                                <h1>All Assignments</h1>
                                <p>Browse and manage your writing tasks.</p>
                            </div>
                        </div>

                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div className={styles.headerActions} style={{ width: "100%", gap: "16px" }}>
                                    <button
                                        onClick={handleRefresh}
                                        className="btn btn-neutral btn-sm"
                                    >
                                        Refresh
                                    </button>
                                    <div style={{ position: "relative", flex: 1 }}>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="Search assignments..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            style={{ width: "100%", paddingLeft: "40px" }}
                                        />
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            style={{
                                                position: "absolute",
                                                left: "12px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                opacity: 0.5,
                                            }}
                                        >
                                            <circle cx="11" cy="11" r="8"></circle>
                                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                        </svg>
                                    </div>
                                    <select
                                        className="select"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        style={{ width: "200px" }}
                                    >
                                        <option value="all">All Status</option>
                                        <option value="assigned">Assigned</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="submitted">Submitted</option>
                                        <option value="revision">Revision Requested</option>
                                        <option value="completed">Completed</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>

                            {loading ? (
                                <div className={styles.assignmentsList}>
                                    {Array.from({ length: 6 }).map((_, i) => (
                                        <SkeletonCard key={i} />
                                    ))}
                                </div>
                            ) : error ? (
                                <ErrorState
                                    message={error}
                                    onRetry={handleRefresh}
                                />
                            ) : filteredAssignments.length === 0 ? (
                                <EmptyState
                                    icon={
                                        <svg
                                            width="48"
                                            height="48"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                        >
                                            <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m0 0V4.5A2.25 2.25 0 0 0 15 2.25H9A2.25 2.25 0 0 0 6.75 4.5v.108c-.375.024-.75.05-1.124.08C4.095 4.782 3.25 5.745 3.25 6.88V18a2.25 2.25 0 0 0 2.25 2.25h3" />
                                        </svg>
                                    }
                                    title="No assignments found"
                                    description="Try adjusting your search or filters."
                                />
                            ) : (
                                <div className={styles.assignmentsList}>
                                    {filteredAssignments.map((assignment) => {
                                        const deadline = formatDeadline(assignment.deadline);
                                        const statusKey = getAssignmentStatusKey(assignment);
                                        const statusCfg = getStatusConfig(statusKey);
                                        const canSubmit =
                                            statusKey === "assigned" ||
                                            statusKey === "in_progress" ||
                                            statusKey === "revision";

                                        return (
                                            <div key={assignment.id} className={styles.assignmentCard}>
                                                <div className={styles.assignmentHeader}>
                                                    <span
                                                        className={`badge badge-${
                                                            assignment.category === "academic"
                                                                ? "primary"
                                                                : "secondary"
                                                        }`}
                                                    >
                                                        {assignment.category}
                                                    </span>
                                                    <span
                                                        className={`badge badge-${
                                                            assignment.priority === "urgent"
                                                                ? "danger"
                                                                : assignment.priority === "high"
                                                                ? "warning"
                                                                : "neutral"
                                                        }`}
                                                    >
                                                        {assignment.priority}
                                                    </span>
                                                    <span
                                                        style={{
                                                            marginLeft: "auto",
                                                            fontWeight: 600,
                                                            color: "var(--primary-700)",
                                                        }}
                                                    >
                                                        ${assignment.reward || "0.00"}
                                                    </span>
                                                </div>
                                                <h3 className={styles.assignmentTitle}>
                                                    {assignment.title}
                                                </h3>
                                                <div className={styles.assignmentMeta}>
                                                    <span>
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                        </svg>
                                                        {(assignment.wordCount || 0).toLocaleString()} words
                                                    </span>
                                                    <span className={deadline.urgent ? styles.urgent : ""}>
                                                        <svg
                                                            width="14"
                                                            height="14"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="currentColor"
                                                            strokeWidth="2"
                                                        >
                                                            <circle cx="12" cy="12" r="10"></circle>
                                                            <polyline points="12 6 12 12 16 14"></polyline>
                                                        </svg>
                                                        {deadline.text}
                                                    </span>
                                                </div>
                                                <div className={styles.assignmentFooter}>
                                                    <span
                                                        className={`${styles.status} ${
                                                            styles[statusCfg.badge]
                                                        }`}
                                                    >
                                                        {statusCfg.label}
                                                    </span>
                                                    {canSubmit && (
                                                        <Link
                                                            href={`/writer/assignments/${assignment.id}/submit`}
                                                            className="btn btn-primary btn-sm"
                                                        >
                                                            {statusKey === "assigned"
                                                                ? "Start Working"
                                                                : statusKey === "revision"
                                                                ? "Submit Revision"
                                                                : "Submit Work"}
                                                        </Link>
                                                    )}
                                                    {statusKey === "completed" && (
                                                        <span
                                                            style={{
                                                                fontSize: "12px",
                                                                color: "var(--success-600)",
                                                                fontWeight: 500,
                                                            }}
                                                        >
                                                            Payment Released
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                );
            }}
        </WriterLayout>
    );
}
