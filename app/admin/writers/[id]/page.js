"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";

export default function WriterDetailPage({ params }) {
    // Unwrap params using React.use() as per Next.js 15+ conventions or async component
    // Since this is a client component, we treat params as a promise in recent versions,
    // but in Page props it's often passed directly. 
    // SAFEST APPROACH: `use(params)` if available, or just async fetch with params.id
    // Wait, params is a Promise in Next.js 15. Let's unwrap it.
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const router = useRouter();
    const [writer, setWriter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchWriterDetails();
    }, [id]);

    const fetchWriterDetails = async () => {
        try {
            const res = await fetch(`/api/writers/${id}`);
            const data = await res.json();
            if (data.success) {
                setWriter(data.writer);
            } else {
                setError(data.error || 'Failed to fetch writer details');
            }
        } catch (err) {
            console.error(err);
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!confirm(`Are you sure you want to mark this writer as ${newStatus}?`)) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/writers/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();
            if (data.success) {
                // Refresh local data
                setWriter(prev => ({
                    ...prev,
                    profile: { ...prev.profile, status: newStatus }
                }));
                alert('Status updated successfully');
            } else {
                alert(data.error || 'Update failed');
            }
        } catch (err) {
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        const confirmMsg = "WARNING: This will PERMANENTLY DELETE this writer account and all associated profile data. This action cannot be undone.\n\nType 'DELETE' to confirm.";
        const input = prompt(confirmMsg);

        if (input !== 'DELETE') return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/writers/${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (data.success) {
                alert('Writer deleted successfully');
                router.push('/admin/writers');
            } else {
                alert(data.error || 'Delete failed');
            }
        } catch (err) {
            alert('Failed to delete writer');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return (
        <main className={styles.adminMain}>
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
                <div className="spinner"></div>
                Loading Profile...
            </div>
        </main>
    );

    if (error || !writer) return (
        <main className={styles.adminMain}>
            <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444' }}>
                <h3>Error Loading Profile</h3>
                <p>{error}</p>
                <Link href="/admin/writers" className="btn btn-secondary" style={{ marginTop: '20px' }}>
                    &larr; Back to Writers
                </Link>
            </div>
        </main>
    );

    const { profile } = writer;
    let workTypes = [];
    try {
        workTypes = profile.workTypes ? JSON.parse(profile.workTypes) : [];
    } catch {
        workTypes = [];
    }

    return (
        <main className={styles.adminMain}>
            {/* Breadcrumb / Header */}
            <div className={styles.pageHeader}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontSize: '14px', color: '#64748b' }}>
                        <Link href="/admin/writers" style={{ textDecoration: 'none', color: 'inherit' }}>Writers</Link>
                        <span>/</span>
                        <span>{profile.fullName}</span>
                    </div>
                    <h1 className={styles.pageTitle}>{profile.fullName}</h1>
                    <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                        <span className={`badge ${profile.status === 'ACTIVE' ? 'badge-success' : profile.status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning'}`}>
                            {profile.status}
                        </span>
                        <span style={{ fontSize: '13px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            📧 {writer.email}
                        </span>
                    </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Link href={`mailto:${writer.email}`} className="btn btn-outline">
                        Contact Writer
                    </Link>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>

                {/* Left Column: Stats & Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    {/* Stats Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                        <div className={styles.dashboardCard} style={{ padding: '20px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Submissions</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                                {profile.stats.totalSubmissions}
                            </div>
                        </div>
                        <div className={styles.dashboardCard} style={{ padding: '20px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Approval Rate</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#1e293b', marginTop: '4px' }}>
                                {profile.stats.approvalRate}%
                            </div>
                        </div>
                        <div className={styles.dashboardCard} style={{ padding: '20px' }}>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Integrity Score</div>
                            <div style={{ fontSize: '24px', fontWeight: 700, color: '#22c55e', marginTop: '4px' }}>
                                {profile.stats.integrityScore}
                            </div>
                        </div>
                    </div>

                    {/* Work & Education */}
                    <div className={styles.dashboardCard}>
                        <div className={styles.cardHeader}>
                            <h3>Profile Overview</h3>
                        </div>
                        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Specializations</h4>
                                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                    {workTypes.map(t => (
                                        <span key={t} style={{ padding: '4px 10px', background: '#f1f5f9', borderRadius: '100px', fontSize: '12px', fontWeight: 500, color: '#475569', textTransform: 'capitalize' }}>
                                            {t}
                                        </span>
                                    ))}
                                    {workTypes.length === 0 && <span style={{ fontSize: '13px', color: '#94a3b8' }}>None listed</span>}
                                </div>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Education & Experience</h4>
                                <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 4px 0' }}>
                                    <strong>Education:</strong> {profile.education ? <span style={{ textTransform: 'capitalize' }}>{profile.education.replace(/-/g, ' ')}</span> : 'N/A'}
                                </p>
                                <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
                                    <strong>Experience:</strong> {profile.experience ? `${profile.experience} years` : 'N/A'}
                                </p>
                            </div>

                            <div>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Contact Details</h4>
                                <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 4px 0' }}>
                                    <strong>Phone:</strong> {profile.phone || 'N/A'}
                                </p>
                                <p style={{ fontSize: '14px', color: '#475569', margin: 0 }}>
                                    <strong>Timezone:</strong> {profile.timezone || 'N/A'}
                                </p>
                            </div>

                            <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>Assessment Scores</h4>
                                <div style={{ display: 'flex', gap: '24px' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                                            <span>Grammar</span>
                                            <span style={{ fontWeight: 600 }}>{profile.grammarScore || 0}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                                            <div style={{ width: `${profile.grammarScore || 0}%`, height: '100%', background: '#3b82f6', borderRadius: '3px' }}></div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '13px' }}>
                                            <span>Policy Knowledge</span>
                                            <span style={{ fontWeight: 600 }}>{profile.policyScore || 0}%</span>
                                        </div>
                                        <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px' }}>
                                            <div style={{ width: `${profile.policyScore || 0}%`, height: '100%', background: '#8b5cf6', borderRadius: '3px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recent Submissions */}
                    <div className={styles.dashboardCard}>
                        <div className={styles.cardHeader}>
                            <h3>Recent Submissions</h3>
                        </div>
                        <div className={styles.tableResponsive}>
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Assignment</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                        <th>Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {writer.recentActivity.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>
                                                No submissions yet.
                                            </td>
                                        </tr>
                                    ) : (
                                        writer.recentActivity.map(sub => (
                                            <tr key={sub.id}>
                                                <td style={{ fontWeight: 500 }}>{sub.assignmentTitle}</td>
                                                <td style={{ color: '#64748b' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge ${sub.status === 'APPROVED' ? 'badge-success' :
                                                        sub.status === 'REJECTED' ? 'badge-danger' : 'badge-warning'
                                                        }`}>
                                                        {sub.status}
                                                    </span>
                                                </td>
                                                <td>{sub.score}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                </div>

                {/* Right Column: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                    <div className={styles.dashboardCard}>
                        <div className={styles.cardHeader}>
                            <h3>Account Actions</h3>
                        </div>
                        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

                            {/* Activate / Suspend Toggle */}
                            {profile.status === 'ACTIVE' ? (
                                <div>
                                    <button
                                        onClick={() => handleStatusChange("SUSPENDED")}
                                        disabled={actionLoading}
                                        className="btn"
                                        style={{ width: '100%', background: '#fffbeb', color: '#b45309', border: '1px solid #fcd34d' }}
                                    >
                                        Suspend Writer
                                    </button>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                        Prevents the writer from accepting new assignments. Existing assignments remain active.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <button
                                        onClick={() => handleStatusChange("ACTIVE")}
                                        disabled={actionLoading}
                                        className="btn"
                                        style={{ width: '100%', background: '#f0fdf4', color: '#166534', border: '1px solid #86efac' }}
                                    >
                                        Activate Writer
                                    </button>
                                    <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
                                        Allows the writer to access the platform and accept assignments.
                                    </p>
                                </div>
                            )}

                            <hr style={{ border: '0', borderTop: '1px solid #f1f5f9', margin: '8px 0' }} />

                            {/* Delete Section */}
                            <div>
                                <button
                                    onClick={handleDelete}
                                    disabled={actionLoading}
                                    className="btn"
                                    style={{ width: '100%', background: '#fef2f2', color: '#b91c1c', border: '1px solid #fecaca' }}
                                >
                                    Delete Account
                                </button>
                                <p style={{ fontSize: '12px', color: '#ef4444', marginTop: '8px' }}>
                                    Warning: This action is permanent and cannot be undone. All writer data will be erased.
                                </p>
                            </div>

                        </div>
                    </div>

                </div>
            </div>
        </main>
    );
}
