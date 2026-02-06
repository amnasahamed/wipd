"use client";

import { useState, useCallback } from "react";

/**
 * Generic API hook for data fetching with loading/error states
 */
export function useApi() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (url, options = {}) => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch(url, {
                headers: {
                    "Content-Type": "application/json",
                    ...options.headers,
                },
                ...options,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || data.message || `Request failed (${res.status})`);
            }

            return data;
        } catch (err) {
            const message = err.message || "An error occurred";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const get = useCallback((url) => request(url), [request]);

    const post = useCallback(
        (url, body) =>
            request(url, {
                method: "POST",
                body: JSON.stringify(body),
            }),
        [request]
    );

    const patch = useCallback(
        (url, body) =>
            request(url, {
                method: "PATCH",
                body: JSON.stringify(body),
            }),
        [request]
    );

    const del = useCallback(
        (url) => request(url, { method: "DELETE" }),
        [request]
    );

    const upload = useCallback(async (url, formData) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(url, {
                method: "POST",
                body: formData,
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || `Upload failed (${res.status})`);
            }
            return data;
        } catch (err) {
            const message = err.message || "Upload failed";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { loading, error, setError, get, post, patch, del, upload, request };
}

/**
 * Formats deadline into human-readable text with urgency
 */
export function formatDeadline(dateString) {
    if (!dateString) return { text: "No deadline", urgent: false };
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: "Overdue", urgent: true };
    if (diffDays === 0) return { text: "Due today", urgent: true };
    if (diffDays === 1) return { text: "Due tomorrow", urgent: true };
    if (diffDays <= 3) return { text: `${diffDays} days left`, urgent: true };
    return { text: `${diffDays} days left`, urgent: false };
}

/**
 * Formats a date string to a short locale format
 */
export function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

/**
 * Formats file size in bytes to human-readable
 */
export function formatFileSize(bytes) {
    if (!bytes) return "0 B";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

/**
 * Maps assignment/submission status to badge class
 */
export function getStatusConfig(statusKey) {
    const config = {
        assigned: { label: "Assigned", badge: "warning" },
        in_progress: { label: "In Progress", badge: "primary" },
        submitted: { label: "Pending Review", badge: "primary" },
        pending_review: { label: "Pending Review", badge: "warning" },
        revision: { label: "Revision Requested", badge: "warning" },
        needs_rewrite: { label: "Revision Requested", badge: "warning" },
        completed: { label: "Completed", badge: "success" },
        approved: { label: "Approved", badge: "success" },
        rejected: { label: "Rejected", badge: "danger" },
        pending: { label: "Pending", badge: "neutral" },
        active: { label: "Active", badge: "success" },
        onboarding: { label: "Onboarding", badge: "primary" },
        suspended: { label: "Suspended", badge: "danger" },
    };
    const key = statusKey?.toLowerCase?.() || "pending";
    return config[key] || { label: statusKey?.replace(/_/g, " ") || "Unknown", badge: "neutral" };
}

/**
 * Gets score color based on threshold
 */
export function getScoreColor(score) {
    if (score >= 85) return "var(--success-600)";
    if (score >= 70) return "var(--warning-600)";
    return "var(--danger-600)";
}

/**
 * Resolves the effective status key for assignments considering their latest submission
 */
export function getAssignmentStatusKey(assignment) {
    const submissionStatus = assignment.latestSubmission?.status;
    if (submissionStatus === "PENDING_REVIEW") return "submitted";
    if (submissionStatus === "NEEDS_REWRITE") return "revision";
    if (submissionStatus === "APPROVED") return "completed";
    if (submissionStatus === "REJECTED") return "rejected";

    const assignmentStatus = assignment.status;
    if (assignmentStatus === "PENDING") return "assigned";
    if (assignmentStatus === "IN_PROGRESS") return "in_progress";
    if (assignmentStatus === "COMPLETED") return "completed";
    return "assigned";
}
