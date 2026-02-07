"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "../admin.module.css";
import auditStyles from "./audit.module.css";



export default function AuditLogsPage() {
    const [logs, setLogs] = useState([]);
    const [actionFilter, setActionFilter] = useState("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await fetch('/api/audit');
                const data = await res.json();
                if (data.success) {
                    setLogs(data.logs);
                }
            } catch (error) {
                console.error('Error fetching audit logs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    const formatTimestamp = (dateString) => {
        return new Date(dateString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getActionBadge = (action) => {
        if (!action) return "neutral";
        const normalized = action.toUpperCase();
        if (normalized.includes("APPROVE")) return "success";
        if (normalized.includes("REJECT")) return "danger";
        if (normalized.includes("STATUS_CHANGE") || normalized.includes("UPDATE")) return "warning";
        if (normalized.includes("CREATE") || normalized.includes("SUBMIT")) return "primary";
        return "neutral";
    };

    const getActionLabel = (action) => {
        if (!action) return "Unknown";
        return action
            .toLowerCase()
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const entityFilterMap = {
        application: ["APPLICATION"],
        submission: ["SUBMISSION"],
        assignment: ["ASSIGNMENT"],
        writer: ["USER", "PROFILE"],
        settings: ["SYSTEMCONFIG", "SYSTEM_CONFIG"],
    };

    const filteredLogs = logs.filter((log) => {
        if (actionFilter === "all") return true;
        const allowedEntityTypes = entityFilterMap[actionFilter];
        if (!allowedEntityTypes) return true;
        return allowedEntityTypes.includes(log.entityType);
    });

    const renderDetails = (details) => {
        if (!details) return "";
        if (typeof details === "string") return details;
        if (typeof details === "object" && details.notes) return details.notes;
        return JSON.stringify(details);
    };

    if (loading) {
        return <div className={styles.adminLayout}><main className={styles.adminMain}>Loading...</main></div>;
    }

    return (
    return (
        <main className={styles.adminMain}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Audit Logs</h1>
                    <p className={styles.pageSubtitle}>
                        Complete history of system actions and changes.
                    </p>
                </div>
                <div className={styles.pageActions}>
                    <select
                        className={styles.filterBtn}
                        value={actionFilter}
                        onChange={(e) => setActionFilter(e.target.value)}
                    >
                        <option value="all">All Actions</option>
                        <option value="application">Applications</option>
                        <option value="submission">Submissions</option>
                        <option value="assignment">Assignments</option>
                        <option value="writer">Writers</option>
                        <option value="settings">Settings</option>
                    </select>
                    <button className="btn btn-secondary">Export CSV</button>
                </div>
            </div>

            {/* Logs Table */}
            <div className={styles.dataTableContainer}>
                <table className={styles.dataTable}>
                    <thead>
                        <tr>
                            <th>Timestamp</th>
                            <th>Action</th>
                            <th>Actor</th>
                            <th>Target</th>
                            <th>Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLogs.map((log) => (
                            <tr key={log.id}>
                                <td className={auditStyles.timestampCell}>
                                    {formatTimestamp(log.timestamp)}
                                </td>
                                <td>
                                    <span className={`badge badge-${getActionBadge(log.action)}`}>
                                        {getActionLabel(log.action)}
                                    </span>
                                </td>
                                <td>
                                    <div className={auditStyles.actorCell}>
                                        <div className={auditStyles.actorAvatar}>
                                            {(log.actor?.name || "System").split(" ").map(n => n[0]).join("")}
                                        </div>
                                        <div className={auditStyles.actorInfo}>
                                            <div className={auditStyles.actorName}>{log.actor?.name || log.user || "System"}</div>
                                            <div className={auditStyles.actorIp}>{log.ip || "127.0.0.1"}</div>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <span className={auditStyles.targetType}>{log.entityType || log.entity?.split(" ")[0]}</span>
                                    <div className={auditStyles.targetName}>
                                        {log.entityType && log.entityId ? `${log.entityType} ${log.entityId.substring(0, 8)}...` : log.entity}
                                    </div>
                                </td>
                                <td className={auditStyles.detailsCell}>
                                    {renderDetails(log.details)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </main>
    );
}
