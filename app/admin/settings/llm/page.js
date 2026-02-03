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
                        Configure AI providers and system prompts for integrity analysis.
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

            <div className={styles.dashboardCard}>
                <div className={styles.cardHeader}>
                    <h3>Provider Settings</h3>
                </div>
                <div style={{ padding: '24px', maxWidth: '600px' }}>
                    <div className="form-group">
                        <label className="form-label">Active Provider</label>
                        <select
                            name="llm_provider"
                            value={settings.llm_provider}
                            onChange={handleChange}
                            className="form-select"
                        >
                            <option value="mock">Mock / Default</option>
                            <option value="openai">OpenAI (GPT-4)</option>
                            <option value="anthropic">Anthropic (Claude 3.5)</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="groq">Groq (Llama 3)</option>
                        </select>
                    </div>

                    {settings.llm_provider === 'openai' && (
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">OpenAI API Key</label>
                            <input
                                type="password"
                                name="openai_api_key"
                                value={settings.openai_api_key}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="sk-..."
                            />
                        </div>
                    )}

                    {settings.llm_provider === 'anthropic' && (
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">Anthropic API Key</label>
                            <input
                                type="password"
                                name="anthropic_api_key"
                                value={settings.anthropic_api_key}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="sk-ant-..."
                            />
                        </div>
                    )}

                    {settings.llm_provider === 'gemini' && (
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">Gemini API Key</label>
                            <input
                                type="password"
                                name="gemini_api_key"
                                value={settings.gemini_api_key}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="AI..."
                            />
                        </div>
                    )}

                    {settings.llm_provider === 'groq' && (
                        <div className="form-group" style={{ marginTop: '16px' }}>
                            <label className="form-label">Groq API Key</label>
                            <input
                                type="password"
                                name="groq_api_key"
                                value={settings.groq_api_key}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="gsk_..."
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.dashboardCard} style={{ marginTop: '24px' }}>
                <div className={styles.cardHeader}>
                    <h3>Analysis Prompts</h3>
                </div>
                <div style={{ padding: '24px', maxWidth: '800px' }}>
                    <div className="form-group">
                        <label className="form-label">System Prompt</label>
                        <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '8px' }}>
                            Define the instructions given to the LLM for analyzing submissions.
                        </p>
                        <textarea
                            name="system_prompt"
                            value={settings.system_prompt}
                            onChange={handleChange}
                            className="form-input"
                            rows={8}
                            placeholder="You are an expert writing analyst..."
                            style={{ fontFamily: 'monospace', fontSize: '13px' }}
                        />
                    </div>
                </div>
            </div>
        </main>
    );
}
