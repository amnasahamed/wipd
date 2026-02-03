"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";

export default function LLMSettingsPage() {
    const [settings, setSettings] = useState({
        llm_provider: "mock",
        openai_api_key: "",
        anthropic_api_key: "",
        gemini_api_key: "",
        groq_api_key: "",
        system_prompt: ""
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/config');
            const data = await res.json();
            if (data.success) {
                setSettings(prev => ({ ...prev, ...data.config }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });
            if (res.ok) {
                alert('Settings saved successfully');
            } else {
                alert('Failed to save settings');
            }
        } catch (err) {
            alert('Error saving settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <main className={styles.adminMain}>
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>LLM Configuration</h1>
                    <p className={styles.pageSubtitle}>
                        Configure AI providers and system rules for integrity analysis.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn btn-primary"
                >
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className={styles.dashboardGrid}>
                {/* Left Col: Settings */}
                <div style={{ gridColumn: 'span 2' }}>
                    {/* Active Provider Card */}
                    <div className={styles.formCard} style={{ marginBottom: '24px' }}>
                        <div className={styles.cardHeader}>
                            <h3>Active Engine</h3>
                        </div>
                        <div className={styles.formSection}>
                            <div className="form-group">
                                <label className={styles.label}>Select Provider</label>
                                <select
                                    name="llm_provider"
                                    value={settings.llm_provider}
                                    onChange={handleChange}
                                    className={styles.select}
                                >
                                    <option value="mock">✨ Mock Engine (Free / Test)</option>
                                    <option value="openai">🧠 OpenAI (GPT-4)</option>
                                    <option value="anthropic">🍄 Anthropic (Claude 3.5)</option>
                                    <option value="gemini">🌟 Google Gemini (Pro)</option>
                                    <option value="groq">⚡ Groq (Llama 3)</option>
                                </select>
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                    This provider will be used for all new submission analyses.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* API Credentials Vault */}
                    <div className={styles.formCard} style={{ marginBottom: '24px' }}>
                        <div className={styles.cardHeader}>
                            <h3>Credentials Vault</h3>
                        </div>
                        <div className={styles.formSection}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <div className="form-group">
                                    <label className={styles.label}>OpenAI API Key</label>
                                    <input
                                        type="password"
                                        name="openai_api_key"
                                        value={settings.openai_api_key}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="sk-..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className={styles.label}>Anthropic API Key</label>
                                    <input
                                        type="password"
                                        name="anthropic_api_key"
                                        value={settings.anthropic_api_key}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="sk-ant-..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className={styles.label}>Google Gemini Key</label>
                                    <input
                                        type="password"
                                        name="gemini_api_key"
                                        value={settings.gemini_api_key}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="AI..."
                                    />
                                </div>
                                <div className="form-group">
                                    <label className={styles.label}>Groq Key</label>
                                    <input
                                        type="password"
                                        name="groq_api_key"
                                        value={settings.groq_api_key}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="gsk_..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Col: System Prompt */}
                <div>
                    <div className={styles.formCard}>
                        <div className={styles.cardHeader}>
                            <h3>System Instructions</h3>
                        </div>
                        <div className={styles.formSection}>
                            <div className="form-group">
                                <label className={styles.label}>Prompt Definition</label>
                                <textarea
                                    name="system_prompt"
                                    value={settings.system_prompt}
                                    onChange={handleChange}
                                    className={styles.textarea}
                                    rows={15}
                                    placeholder="You are an expert writing analyst..."
                                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                />
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                    Instructions for the AI on how to detect stylometric anomalies.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
