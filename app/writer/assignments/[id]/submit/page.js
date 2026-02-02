"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import styles from "../../../dashboard.module.css";
import submitStyles from "./submit.module.css";

export default function SubmitWorkPage() {
    const router = useRouter();
    const params = useParams();
    const fileInputRef = useRef(null);

    const [assignment, setAssignment] = useState(null);
    const [user, setUser] = useState(null);
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [declaration, setDeclaration] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Get current user
            const userRes = await fetch('/api/me');
            const userData = await userRes.json();
            if (userData.id) {
                setUser(userData);
            }

            // Get assignment details
            const assignmentRes = await fetch(`/api/assignments/${params.id}`);
            const assignmentData = await assignmentRes.json();

            if (assignmentData.success) {
                setAssignment(assignmentData.assignment);
            } else {
                setError(assignmentData.error || 'Failed to fetch assignment');
            }
        } catch (err) {
            setError('Error connecting to API');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        validateAndSetFile(droppedFile);
    };

    const handleFileSelect = (e) => {
        const selectedFile = e.target.files[0];
        validateAndSetFile(selectedFile);
    };

    const validateAndSetFile = (file) => {
        if (!file) return;

        const validTypes = [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!validTypes.includes(file.type)) {
            alert("Please upload a DOC or DOCX file");
            return;
        }

        setFile(file);
    };

    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const formatDeadline = (dateString) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleSubmit = () => {
        if (!file || !declaration) return;
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        setShowConfirmModal(false);

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("assignmentId", params.id);
            formData.append("writerId", user.id);

            const response = await fetch("/api/submissions/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSubmitSuccess(true);
            } else {
                alert(data.error || "Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Upload error", error);
            alert("An error occurred during upload.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <div className={styles.dashboardLayout}>
                <aside className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <div className={styles.sidebarLogo}>
                            <span>✍️</span> WriterHub
                        </div>
                    </div>
                    <nav className={styles.sidebarNav}>
                        <Link href="/writer" className={styles.navItem}>Dashboard</Link>
                        <Link href="/writer/assignments" className={`${styles.navItem} ${styles.active}`}>Assignments</Link>
                        <Link href="/writer/submissions" className={styles.navItem}>Submissions</Link>
                    </nav>
                </aside>

                <main className={styles.dashboardMain}>
                    <div className={submitStyles.successState}>
                        <div className={submitStyles.successIcon}>
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                        </div>
                        <h1>Submission Received!</h1>
                        <p>Your work has been submitted successfully and is now being analyzed.</p>

                        <div className={submitStyles.analysisStatus}>
                            <div className={submitStyles.analysisStep}>
                                <span className={submitStyles.stepComplete}>✓</span>
                                <span>File Uploaded</span>
                            </div>
                            <div className={submitStyles.analysisStep}>
                                <span className={submitStyles.stepProgress}>
                                    <span className="spinner spinner-sm"></span>
                                </span>
                                <span>Integrity Analysis in Progress</span>
                            </div>
                            <div className={submitStyles.analysisStep}>
                                <span className={submitStyles.stepPending}>○</span>
                                <span>Admin Review</span>
                            </div>
                        </div>

                        <p className={submitStyles.noteText}>
                            You will receive feedback within 24-48 hours. Check your dashboard for updates.
                        </p>

                        <Link href="/writer" className="btn btn-primary">
                            Return to Dashboard
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.dashboardLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        <span>✍️</span> WriterHub
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <Link href="/writer" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link href="/writer/assignments" className={`${styles.navItem} ${styles.active}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m0 0V4.5A2.25 2.25 0 0 0 15 2.25H9A2.25 2.25 0 0 0 6.75 4.5v.108c-.375.024-.75.05-1.124.08C4.095 4.782 3.25 5.745 3.25 6.88V18a2.25 2.25 0 0 0 2.25 2.25h3" />
                        </svg>
                        Assignments
                    </Link>
                    <Link href="/writer/submissions" className={styles.navItem}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        Submissions
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("") : 'U'}
                        </div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{user?.fullName || 'User'}</span>
                            <span className={`${styles.userStatus} ${styles[(user?.profile?.status || 'ONBOARDING').toLowerCase()]}`}>
                                {user?.profile?.status || 'ONBOARDING'}
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.dashboardMain}>
                {/* Breadcrumb */}
                <nav className={submitStyles.breadcrumb}>
                    <Link href="/writer">Dashboard</Link>
                    <span>/</span>
                    <Link href="/writer/assignments">Assignments</Link>
                    <span>/</span>
                    <span>Submit Work</span>
                </nav>

                <div className={submitStyles.submitGrid}>
                    {/* Assignment Details */}
                    {loading ? (
                        <div className={submitStyles.assignmentPanel}>
                            <div className="spinner"></div>
                            <p>Loading assignment details...</p>
                        </div>
                    ) : error ? (
                        <div className={submitStyles.assignmentPanel}>
                            <p style={{ color: 'red' }}>{error}</p>
                            <button onClick={fetchData} className="btn btn-primary btn-sm">Retry</button>
                        </div>
                    ) : assignment ? (
                        <div className={submitStyles.assignmentPanel}>
                            <div className={submitStyles.panelHeader}>
                                <span className={`badge badge-${assignment.category === "academic" ? "primary" : "secondary"}`}>
                                    {assignment.category}
                                </span>
                                <h2>{assignment.title}</h2>
                            </div>

                            <div className={submitStyles.assignmentMeta}>
                                <div className={submitStyles.metaItem}>
                                    <span className={submitStyles.metaLabel}>Word Count</span>
                                    <span className={submitStyles.metaValue}>{(assignment.wordCount || 0).toLocaleString()} words</span>
                                </div>
                                <div className={submitStyles.metaItem}>
                                    <span className={submitStyles.metaLabel}>Citation Style</span>
                                    <span className={submitStyles.metaValue}>{assignment.citationStyle || 'APA 7th'}</span>
                                </div>
                                <div className={submitStyles.metaItem}>
                                    <span className={submitStyles.metaLabel}>Deadline</span>
                                    <span className={submitStyles.metaValue}>{formatDeadline(assignment.deadline)}</span>
                                </div>
                            </div>

                            <div className={submitStyles.briefSection}>
                                <h3>Assignment Brief</h3>
                                <pre className={submitStyles.briefText}>{assignment.notes || 'No notes provided.'}</pre>
                            </div>
                        </div>
                    ) : (
                        <div className={submitStyles.assignmentPanel}>
                            <p>Assignment not found.</p>
                        </div>
                    )}

                    {/* Upload Section */}
                    <div className={submitStyles.uploadPanel}>
                        <div className={submitStyles.panelHeader}>
                            <h2>Submit Your Work</h2>
                            <p>Upload your completed document for review.</p>
                        </div>

                        {/* Upload Zone */}
                        <div
                            className={`${submitStyles.uploadZone} ${isDragging ? submitStyles.dragging : ""} ${file ? submitStyles.hasFile : ""}`}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".doc,.docx"
                                onChange={handleFileSelect}
                                hidden
                            />

                            {file ? (
                                <div className={submitStyles.uploadedFileDisplay}>
                                    <div className={submitStyles.fileIcon}>
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                    </div>
                                    <div className={submitStyles.fileDetails}>
                                        <span className={submitStyles.fileName}>{file.name}</span>
                                        <span className={submitStyles.fileSize}>{formatFileSize(file.size)}</span>
                                    </div>
                                    <button
                                        className={submitStyles.removeFile}
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className={submitStyles.uploadIcon}>
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                            <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                                        </svg>
                                    </div>
                                    <p className={submitStyles.uploadText}>
                                        <strong>Click to upload</strong> or drag and drop
                                    </p>
                                    <p className={submitStyles.uploadHint}>DOC or DOCX (Max 10MB)</p>
                                </>
                            )}
                        </div>

                        {/* Integrity Notice */}
                        <div className={submitStyles.integrityNotice}>
                            <div className={submitStyles.noticeIcon}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                                </svg>
                            </div>
                            <div className={submitStyles.noticeContent}>
                                <h4>Integrity Check Notice</h4>
                                <p>Your submission will be automatically analyzed for:</p>
                                <ul>
                                    <li>Writing style consistency with your baseline</li>
                                    <li>AI-assistance risk assessment</li>
                                    <li>Citation and source verification</li>
                                    <li>Internal similarity check</li>
                                </ul>
                            </div>
                        </div>

                        {/* Declaration */}
                        <label className={submitStyles.declaration}>
                            <input
                                type="checkbox"
                                checked={declaration}
                                onChange={(e) => setDeclaration(e.target.checked)}
                            />
                            <span>
                                I confirm this work is my own original writing, completed without unauthorized AI assistance, and adheres to all content writing policies.
                            </span>
                        </label>

                        {/* Submit Button */}
                        <button
                            className="btn btn-primary btn-lg btn-full"
                            disabled={!file || !declaration || isSubmitting}
                            onClick={handleSubmit}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner spinner-sm"></span>
                                    Uploading...
                                </>
                            ) : (
                                "Submit Work"
                            )}
                        </button>
                    </div>
                </div>
            </main>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className={submitStyles.modalOverlay}>
                    <div className={submitStyles.modal}>
                        <div className={submitStyles.modalHeader}>
                            <h3>Confirm Submission</h3>
                        </div>
                        <div className={submitStyles.modalBody}>
                            <p>You are about to submit:</p>
                            <div className={submitStyles.modalFileInfo}>
                                <strong>{file?.name}</strong>
                                <span>{formatFileSize(file?.size || 0)}</span>
                            </div>
                            <p className={submitStyles.modalWarning}>
                                ⚠️ Once submitted, your work will undergo integrity analysis. This action cannot be undone.
                            </p>
                        </div>
                        <div className={submitStyles.modalFooter}>
                            <button className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                                Cancel
                            </button>
                            <button className="btn btn-primary" onClick={confirmSubmit}>
                                Confirm &amp; Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
