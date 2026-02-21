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

    let workTypes = [];
    try {
        workTypes = application.workTypes ?
            (typeof application.workTypes === 'string' ? JSON.parse(application.workTypes) : application.workTypes)
            : [];
    } catch {
        workTypes = [];
    }

    return (
    return (
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
        </main>
    );
}
