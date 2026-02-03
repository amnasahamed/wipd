"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import styles from "../../admin.module.css";
import detailStyles from "./detail.module.css";

export default function ApplicationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApproveModal, setShowApproveModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        const fetchApplication = async () => {
            try {
                const res = await fetch(`/api/applications/${params.id}`);
                const data = await res.json();

                if (data.success) {
                    setApplication(data.application);
                } else {
                    setError(data.error || 'Failed to fetch application');
                }
            } catch (err) {
                console.error('Error fetching application:', err);
                setError('Error loading application details');
            } finally {
                setLoading(false);
            }
        };
        fetchApplication();
    }, [params.id]);

    const handleApprove = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/applications/${params.id}/approve`, {
                method: 'POST'
            });
            const data = await res.json();
            if (data.success) {
                setApplication(prev => ({ ...prev, status: 'ACTIVE' }));
                setShowApproveModal(false);
            }
        } catch (err) {
            console.error('Error approving:', err);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        setProcessing(true);
        try {
            const res = await fetch(`/api/applications/${params.id}/reject`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason: rejectReason })
            });
            const data = await res.json();
            if (data.success) {
                setApplication(prev => ({ ...prev, status: 'REJECTED' }));
                setShowRejectModal(false);
            }
        } catch (err) {
            console.error('Error rejecting:', err);
        } finally {
            setProcessing(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatFileSize = (bytes) => {
        return (bytes / 1024).toFixed(1) + " KB";
    };

    if (loading) {
        return (
            <div className={styles.adminMain}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px' }}>
                    <div className="spinner"></div>
                    <p style={{ marginLeft: '12px' }}>Loading application...</p>
                </div>
            </div>
        );
    }

    if (error || !application) {
        return (
            <div className={styles.adminMain}>
                <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>⚠️</div>
                    <h3>Application Not Found</h3>
                    <p>{error || 'The requested application could not be loaded.'}</p>
                    <Link href="/admin/applications" className="btn btn-primary">
                        Back to Applications
                    </Link>
                </div>
            </div>
        );
    }

    const workTypes = application.workTypes ?
        (typeof application.workTypes === 'string' ? JSON.parse(application.workTypes) : application.workTypes)
        : [];

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
                        <Link href="/admin/applications" className={`${styles.navItem} ${styles.active}`}>
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
                {/* Breadcrumb */}
                <nav className={detailStyles.breadcrumb}>
                    <Link href="/admin">Dashboard</Link>
                    <span>/</span>
                    <Link href="/admin/applications">Applications</Link>
                    <span>/</span>
                    <span className={detailStyles.current}>{application.fullName || 'Applicant'}</span>
                </nav>

                {/* Header */}
                <div className={detailStyles.detailHeader}>
                    <div className={detailStyles.applicantHeader}>
                        <div className={detailStyles.largeAvatar}>
                            {(application.fullName || 'U').split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className={detailStyles.applicantMeta}>
                            <h1>{application.fullName || 'Unknown Applicant'}</h1>
                            <p>{application.email}</p>
                            <div className={detailStyles.badges}>
                                <span className={`${styles.statusBadge} ${styles[application.status?.toLowerCase()]}`}>
                                    {application.status}
                                </span>
                                {workTypes.map((type) => (
                                    <span key={type} className="badge badge-neutral">{type}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {application.status === "ONBOARDING" && (
                        <div className={detailStyles.headerActions}>
                            <button className="btn btn-secondary" onClick={() => setShowRejectModal(true)}>
                                Reject Application
                            </button>
                            <button className="btn btn-success" onClick={() => setShowApproveModal(true)}>
                                Approve Application
                            </button>
                        </div>
                    )}
                </div>

                {/* Content Grid */}
                <div className={detailStyles.contentGrid}>
                    {/* Profile Info */}
                    <div className={detailStyles.card}>
                        <div className={detailStyles.cardHeader}>
                            <h3>Profile Information</h3>
                        </div>
                        <div className={detailStyles.cardBody}>
                            <div className={detailStyles.infoGrid}>
                                <div className={detailStyles.infoItem}>
                                    <span className={detailStyles.infoLabel}>Email</span>
                                    <span className={detailStyles.infoValue}>{application.email}</span>
                                </div>
                                <div className={detailStyles.infoItem}>
                                    <span className={detailStyles.infoLabel}>Phone</span>
                                    <span className={detailStyles.infoValue}>{application.phone || 'Not provided'}</span>
                                </div>
                                <div className={detailStyles.infoItem}>
                                    <span className={detailStyles.infoLabel}>Education</span>
                                    <span className={detailStyles.infoValue}>{application.education || 'Not provided'}</span>
                                </div>
                                <div className={detailStyles.infoItem}>
                                    <span className={detailStyles.infoLabel}>Experience</span>
                                    <span className={detailStyles.infoValue}>{application.experience || 'Not provided'}</span>
                                </div>
                                <div className={detailStyles.infoItem}>
                                    <span className={detailStyles.infoLabel}>Timezone</span>
                                    <span className={detailStyles.infoValue}>{application.timezone || 'Not provided'}</span>
                                </div>
                                <div className={detailStyles.infoItem}>
                                    <span className={detailStyles.infoLabel}>Applied</span>
                                    <span className={detailStyles.infoValue}>{formatDate(application.createdAt)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Scores */}
                    <div className={detailStyles.card}>
                        <div className={detailStyles.cardHeader}>
                            <h3>Assessment Scores</h3>
                        </div>
                        <div className={detailStyles.cardBody}>
                            <div className={detailStyles.scoreSection}>
                                <div className={detailStyles.scoreHeader}>
                                    <span>Grammar Test</span>
                                    <span className={detailStyles.scoreValue}>{application.grammarScore || 0}%</span>
                                </div>
                                <div className="progress">
                                    <div
                                        className={`progress-bar ${(application.grammarScore || 0) >= 80 ? "success" : ""}`}
                                        style={{ width: `${application.grammarScore || 0}%` }}
                                    ></div>
                                </div>
                            </div>

                            <div className={detailStyles.scoreSection}>
                                <div className={detailStyles.scoreHeader}>
                                    <span>Policy Test</span>
                                    <span className={detailStyles.scoreValue}>{application.policyScore || 0}%</span>
                                </div>
                                <div className="progress">
                                    <div
                                        className={`progress-bar ${(application.policyScore || 0) >= 80 ? "success" : ""}`}
                                        style={{ width: `${application.policyScore || 0}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bio */}
                    {application.bio && (
                        <div className={detailStyles.card}>
                            <div className={detailStyles.cardHeader}>
                                <h3>Bio</h3>
                            </div>
                            <div className={detailStyles.cardBody}>
                                <p>{application.bio}</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Approve Modal */}
            {showApproveModal && (
                <div className={detailStyles.modalOverlay}>
                    <div className={detailStyles.modal}>
                        <div className={detailStyles.modalHeader}>
                            <h3>Approve Application</h3>
                            <button className={detailStyles.modalClose} onClick={() => setShowApproveModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className={detailStyles.modalBody}>
                            <p>Are you sure you want to approve <strong>{application.fullName}</strong>?</p>
                            <p className="text-secondary text-sm mt-2">
                                The writer will be activated and will be able to receive assignments.
                            </p>
                        </div>
                        <div className={detailStyles.modalFooter}>
                            <button className="btn btn-secondary" onClick={() => setShowApproveModal(false)} disabled={processing}>
                                Cancel
                            </button>
                            <button className="btn btn-success" onClick={handleApprove} disabled={processing}>
                                {processing ? 'Processing...' : 'Approve Writer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reject Modal */}
            {showRejectModal && (
                <div className={detailStyles.modalOverlay}>
                    <div className={detailStyles.modal}>
                        <div className={detailStyles.modalHeader}>
                            <h3>Reject Application</h3>
                            <button className={detailStyles.modalClose} onClick={() => setShowRejectModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className={detailStyles.modalBody}>
                            <p>Are you sure you want to reject <strong>{application.fullName}</strong>'s application?</p>
                            <div className="form-group mt-4">
                                <label className="form-label">Reason for Rejection</label>
                                <textarea
                                    className="form-textarea"
                                    placeholder="Provide a reason for rejection..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    rows={3}
                                ></textarea>
                            </div>
                        </div>
                        <div className={detailStyles.modalFooter}>
                            <button className="btn btn-secondary" onClick={() => setShowRejectModal(false)} disabled={processing}>
                                Cancel
                            </button>
                            <button className="btn btn-danger" onClick={handleReject} disabled={processing}>
                                {processing ? 'Processing...' : 'Reject Application'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
