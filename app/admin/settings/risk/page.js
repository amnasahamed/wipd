"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";
import settingsStyles from "./settings.module.css";

// Default risk thresholds
const DEFAULT_THRESHOLDS = {
    styleMatch: { low: 80, medium: 60 },
    aiRisk: { low: 20, medium: 50 },
    similarity: { low: 15, medium: 35 },
    citations: { low: 80, medium: 60 },
};

export default function RiskSettingsPage() {
    const [thresholds, setThresholds] = useState(DEFAULT_THRESHOLDS);
    const [originalThresholds, setOriginalThresholds] = useState(DEFAULT_THRESHOLDS);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [saveMessage, setSaveMessage] = useState(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/config');
            const data = await res.json();

            if (data.success) {
                const config = data.config;
                const loadedThresholds = {
                    styleMatch: {
                        low: parseInt(config.integrity_threshold_medium) || 80,
                        medium: parseInt(config.integrity_threshold_low) || 60
                    },
                    aiRisk: {
                        low: parseInt(config.risk_threshold_medium) || 20,
                        medium: parseInt(config.risk_threshold_high) || 50
                    },
                    similarity: { low: 15, medium: 35 },
                    citations: { low: 80, medium: 60 }
                };
                setThresholds(loadedThresholds);
                setOriginalThresholds(loadedThresholds);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleThresholdChange = (metric, level, value) => {
        setThresholds((prev) => ({
            ...prev,
            [metric]: { ...prev[metric], [level]: parseInt(value) || 0 },
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage(null);

        try {
            // Map UI thresholds to config keys
            const settings = {
                risk_threshold_high: thresholds.aiRisk.medium.toString(),
                risk_threshold_medium: thresholds.aiRisk.low.toString(),
                integrity_threshold_low: thresholds.styleMatch.medium.toString(),
                integrity_threshold_medium: thresholds.styleMatch.low.toString(),
            };

            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });

            const data = await res.json();

            if (data.success) {
                setSaveMessage({ type: 'success', text: 'Settings saved successfully' });
                setOriginalThresholds(thresholds);
            } else {
                setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' });
            }
        } catch (err) {
            setSaveMessage({ type: 'error', text: 'Error saving settings: ' + err.message });
        } finally {
            setIsSaving(false);
            setTimeout(() => setSaveMessage(null), 5000);
        }
    };

    const handleReset = () => {
        setThresholds(DEFAULT_THRESHOLDS);
    };

    const hasChanges = () => {
        return JSON.stringify(thresholds) !== JSON.stringify(originalThresholds);
    };

    if (isLoading) {
        return (
            <main className={styles.adminMain}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                    <div className={styles.loadingSpinner}>Loading configuration...</div>
                </div>
            </main>
        );
    }

    return (
        <main className={styles.adminMain}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Risk Decision Engine</h1>
                    <p className={styles.pageSubtitle}>
                        Configure thresholds for automatic risk classification.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {saveMessage && (
                        <span className={`${styles.alert} ${saveMessage.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                            {saveMessage.text}
                        </span>
                    )}
                    <button className="btn btn-secondary" onClick={handleReset}>Reset Defaults</button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={isSaving || !hasChanges()}
                    >
                        {isSaving ? "Saving..." : hasChanges() ? "Save Changes" : "No Changes"}
                    </button>
                </div>
            </div>

            {/* Explanation Card */}
            <div className={settingsStyles.explanationCard}>
                <h3>How Risk Classification Works</h3>
                <p>
                    Each submission is analyzed across multiple metrics. The overall risk level is determined by:
                </p>
                <ul>
                    <li><span className={settingsStyles.riskLow}>LOW RISK</span> — All metrics exceed the &quot;low&quot; threshold</li>
                    <li><span className={settingsStyles.riskMedium}>MEDIUM RISK</span> — Any metric falls between thresholds</li>
                    <li><span className={settingsStyles.riskHigh}>HIGH RISK</span> — Any metric falls below the &quot;medium&quot; threshold</li>
                </ul>
            </div>

            {/* Threshold Settings */}
            <div className={settingsStyles.settingsGrid}>
                {/* Style Match */}
                <div className={settingsStyles.settingCard}>
                    <div className={settingsStyles.settingHeader}>
                        <div className={settingsStyles.settingIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                            </svg>
                        </div>
                        <div>
                            <h4>Style Match</h4>
                            <p>Compares writing style to writer&apos;s baseline</p>
                        </div>
                    </div>
                    <div className={settingsStyles.thresholdInputs}>
                        <div className={settingsStyles.inputGroup}>
                            <label>Low Risk ≥</label>
                            <div className={settingsStyles.inputWrapper}>
                                <input
                                    type="number"
                                    value={thresholds.styleMatch.low}
                                    onChange={(e) => handleThresholdChange("styleMatch", "low", e.target.value)}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                        <div className={settingsStyles.inputGroup}>
                            <label>Medium Risk ≥</label>
                            <div className={settingsStyles.inputWrapper}>
                                <input
                                    type="number"
                                    value={thresholds.styleMatch.medium}
                                    onChange={(e) => handleThresholdChange("styleMatch", "medium", e.target.value)}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* AI Risk */}
                <div className={settingsStyles.settingCard}>
                    <div className={settingsStyles.settingHeader}>
                        <div className={settingsStyles.settingIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z" />
                            </svg>
                        </div>
                        <div>
                            <h4>AI Risk Detection</h4>
                            <p>Likelihood of AI-generated content (inverted)</p>
                        </div>
                    </div>
                    <div className={settingsStyles.thresholdInputs}>
                        <div className={settingsStyles.inputGroup}>
                            <label>Low Risk ≤</label>
                            <div className={settingsStyles.inputWrapper}>
                                <input
                                    type="number"
                                    value={thresholds.aiRisk.low}
                                    onChange={(e) => handleThresholdChange("aiRisk", "low", e.target.value)}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                        <div className={settingsStyles.inputGroup}>
                            <label>Medium Risk ≤</label>
                            <div className={settingsStyles.inputWrapper}>
                                <input
                                    type="number"
                                    value={thresholds.aiRisk.medium}
                                    onChange={(e) => handleThresholdChange("aiRisk", "medium", e.target.value)}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Internal Similarity */}
                <div className={settingsStyles.settingCard}>
                    <div className={settingsStyles.settingHeader}>
                        <div className={settingsStyles.settingIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                            </svg>
                        </div>
                        <div>
                            <h4>Internal Similarity</h4>
                            <p>Overlap with other submissions (inverted)</p>
                        </div>
                    </div>
                    <div className={settingsStyles.thresholdInputs}>
                        <div className={settingsStyles.inputGroup}>
                            <label>Low Risk ≤</label>
                            <div className={settingsStyles.inputWrapper}>
                                <input
                                    type="number"
                                    value={thresholds.similarity.low}
                                    onChange={(e) => handleThresholdChange("similarity", "low", e.target.value)}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                        <div className={settingsStyles.inputGroup}>
                            <label>Medium Risk ≤</label>
                            <div className={settingsStyles.inputWrapper}>
                                <input
                                    type="number"
                                    value={thresholds.similarity.medium}
                                    onChange={(e) => handleThresholdChange("similarity", "medium", e.target.value)}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Citation Score */}
                <div className={settingsStyles.settingCard}>
                    <div className={settingsStyles.settingHeader}>
                        <div className={settingsStyles.settingIcon}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                            </svg>
                        </div>
                        <div>
                            <h4>Citation Quality</h4>
                            <p>Proper citation formatting and verification</p>
                        </div>
                    </div>
                    <div className={settingsStyles.thresholdInputs}>
                        <div className={settingsStyles.inputGroup}>
                            <label>Low Risk ≥</label>
                            <div className={settingsStyles.inputWrapper}>
                                <input
                                    type="number"
                                    value={thresholds.citations.low}
                                    onChange={(e) => handleThresholdChange("citations", "low", e.target.value)}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                        <div className={settingsStyles.inputGroup}>
                            <label>Medium Risk ≥</label>
                            <div className={settingsStyles.inputWrapper}>
                                <input
                                    type="number"
                                    value={thresholds.citations.medium}
                                    onChange={(e) => handleThresholdChange("citations", "medium", e.target.value)}
                                    min="0"
                                    max="100"
                                />
                                <span>%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
