"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import WriterLayout from "@/components/WriterLayout";
import { useToast } from "@/components/Toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { LoadingSpinner } from "@/components/LoadingState";
import ErrorState from "@/components/ErrorState";
import { formatFileSize } from "@/lib/hooks/useApi";
import styles from "../../../dashboard.module.css";
import submitStyles from "./submit.module.css";

export default function SubmitWorkPage() {
    const router = useRouter();
    const params = useParams();
    const fileInputRef = useRef(null);
    const toast = useToast();

    const [assignment, setAssignment] = useState(null);
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [declaration, setDeclaration] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const latestSubmissionStatus = assignment?.latestSubmission?.status || null;
    const canSubmit = !loading && !!assignment && (!latestSubmissionStatus || latestSubmissionStatus === 'NEEDS_REWRITE');
    const isRevision = latestSubmissionStatus === 'NEEDS_REWRITE';

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
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
        if (!canSubmit) {
            toast.warning('You can submit again only if a revision is requested.');
            return;
        }

        const validTypes = [
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!validTypes.includes(file.type)) {
            toast.error("Please upload a DOC or DOCX file");
            return;
        }

        setFile(file);
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
        if (!canSubmit) {
            toast.warning('You can submit again only if a revision is requested.');
            return;
        }
        if (!file || !declaration) return;
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setIsSubmitting(true);
        setShowConfirmModal(false);

        try {
            if (!canSubmit) {
                toast.warning('You can submit again only if a revision is requested.');
                return;
            }

            const formData = new FormData();
            formData.append("file", file);
            formData.append("assignmentId", params.id);

            const response = await fetch("/api/submissions/upload", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                setSubmitSuccess(true);
            } else {
                toast.error(data.error || "Upload failed. Please try again.");
            }
        } catch (error) {
            console.error("Upload error", error);
            toast.error("An error occurred during upload.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitSuccess) {
        return (
            <WriterLayout activeNav="assignments">
                {({ user }) => (
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
                                <span className={submitStyles.stepComplete}>&#10003;</span>
                                <span>File Uploaded</span>
                            </div>
                            <div className={submitStyles.analysisStep}>
                                <span className={submitStyles.stepProgress}>
                                    <span className="spinner spinner-sm"></span>
                                </span>
                                <span>Integrity Analysis in Progress</span>
                            </div>
                            <div className={submitStyles.analysisStep}>
                                <span className={submitStyles.stepPending}>&#9675;</span>
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
                )}
            </WriterLayout>
        );
    }

    return (
        <WriterLayout activeNav="assignments">
            {({ user }) => (
                <>
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
                                <LoadingSpinner text="Loading assignment details..." />
                            </div>
                        ) : error ? (
                            <div className={submitStyles.assignmentPanel}>
                                <ErrorState message={error} onRetry={fetchData} />
                            </div>
                        ) : assignment ? (
                            <div className={submitStyles.assignmentPanel}>
                                <div className={submitStyles.panelHeader}>
                                    <span className={`badge badge-${assignment.category === "academic" ? "primary" : "secondary"}`}>
                                        {assignment.category}
                                    </span>
                                    <h2>{assignment.title}</h2>
                                </div>

                                {assignment.latestSubmission?.status === 'NEEDS_REWRITE' && assignment.latestSubmissionDecision?.notes && (
                                    <div className={submitStyles.revisionNotice}>
                                        <div className={submitStyles.revisionNoticeTitle}>Revision requested</div>
                                        <div className={submitStyles.revisionNoticeBody}>{assignment.latestSubmissionDecision.notes}</div>
                                    </div>
                                )}

                                {!!assignment.latestSubmission?.status && assignment.latestSubmission.status !== 'NEEDS_REWRITE' && (
                                    <div className={submitStyles.statusNotice}>
                                        {assignment.latestSubmission.status === 'PENDING_REVIEW' && (
                                            <div>
                                                <strong>Pending review:</strong> your latest submission is being reviewed. You can submit again only if a revision is requested.
                                            </div>
                                        )}
                                        {assignment.latestSubmission.status === 'APPROVED' && (
                                            <div>
                                                <strong>Approved:</strong> this assignment has been approved and is closed.
                                            </div>
                                        )}
                                        {assignment.latestSubmission.status === 'REJECTED' && (
                                            <div>
                                                <strong>Rejected:</strong> this submission was rejected. If you believe this is a mistake, contact the admin.
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                <ErrorState message="Assignment not found." />
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
                                onClick={() => {
                                    if (!canSubmit) return;
                                    fileInputRef.current?.click();
                                }}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".doc,.docx"
                                    onChange={handleFileSelect}
                                    disabled={!canSubmit}
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
                                disabled={!canSubmit || !file || !declaration || isSubmitting}
                                onClick={handleSubmit}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner spinner-sm"></span>
                                        Uploading...
                                    </>
                                ) : (
                                    isRevision ? "Submit Revision" : "Submit Work"
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirmation Modal */}
                    <ConfirmDialog
                        open={showConfirmModal}
                        title="Confirm Submission"
                        confirmText="Confirm & Submit"
                        onConfirm={confirmSubmit}
                        onCancel={() => setShowConfirmModal(false)}
                        isLoading={isSubmitting}
                    >
                        <p>You are about to submit:</p>
                        <div className={submitStyles.modalFileInfo}>
                            <strong>{file?.name}</strong>
                            <span>{formatFileSize(file?.size || 0)}</span>
                        </div>
                        <p className={submitStyles.modalWarning}>
                            Once submitted, your work will undergo integrity analysis. This action cannot be undone.
                        </p>
                    </ConfirmDialog>
                </>
            )}
        </WriterLayout>
    );
}
