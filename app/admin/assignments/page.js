"use client";

import { useState } from "react";
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
        return <div className={styles.adminLayout}><main className={styles.adminMain}>Loading...</main></div>;
    }

    return (
        <div className={styles.adminLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        <span>✍️</span> Writer<span>Integrity</span>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Overview</span>
                        <Link href="/admin" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            Dashboard
                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Writers</span>
                        <Link href="/admin/applications" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                            </svg>
                            Applications
                        </Link>
                        <Link href="/admin/writers" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
                            </svg>
                            All Writers
                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Tasks</span>
                        <Link href="/admin/assignments" className={`${styles.navItem} ${styles.active}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                            </svg>
                            Assignments
                        </Link>
                        <Link href="/admin/submissions" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                            </svg>
                            Submissions
                        </Link>
                    </div>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>AD</div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>Admin User</div>
                            <div className={styles.userRole}>Administrator</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
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
        </div>
    );
}

