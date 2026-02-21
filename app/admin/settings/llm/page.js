"use client";

import { useState, useEffect } from "react";
import styles from "../../admin.module.css";

const PROVIDER_MODELS = {
    openai: [
        { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast & Cheap)' },
        { value: 'gpt-4o', label: 'GPT-4o (Balanced)' },
        { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Most Capable)' }
    ],
    anthropic: [
        { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' },
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku (Fast)' }
    ],
    gemini: [
        { value: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash (Fast)' },
        { value: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro (Capable)' }
    ],
    groq: [
        { value: 'llama-3.1-70b-versatile', label: 'Llama 3.1 70B' },
        { value: 'llama-3.1-8b-instant', label: 'Llama 3.1 8B (Fast)' },
        { value: 'mixtral-8x7b-32768', label: 'Mixtral 8x7B' }
    ],
    mock: [
        { value: 'mock', label: 'Mock Engine (Testing)' }
    ]
};

export default function LLMSettingsPage() {
    const [settings, setSettings] = useState({
        llm_provider: "mock",
        openai_api_key: "",
        openai_model: "gpt-4o-mini",
        anthropic_api_key: "",
        anthropic_model: "claude-3-5-sonnet-20241022",
        gemini_api_key: "",
        gemini_model: "gemini-1.5-flash",
        groq_api_key: "",
        groq_model: "llama-3.1-70b-versatile",
        system_prompt: ""
    });
    
    const [originalSettings, setOriginalSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [testing, setTesting] = useState({});
    const [testResults, setTestResults] = useState({});
    const [saveMessage, setSaveMessage] = useState(null);
    const [configStatus, setConfigStatus] = useState(null);

    useEffect(() => {
        fetchSettings();
        fetchConfigStatus();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/admin/config');
            const data = await res.json();
            if (data.success) {
                const newSettings = { ...settings, ...data.config };
                setSettings(newSettings);
                setOriginalSettings(newSettings);
            }
        } catch (err) {
            console.error('Error fetching settings:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchConfigStatus = async () => {
        try {
            const res = await fetch('/api/admin/config/test');
            const data = await res.json();
            if (data.success) {
                setConfigStatus(data.status);
            }
        } catch (err) {
            console.error('Error fetching config status:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSettings(prev => ({ ...prev, [name]: value }));
        // Clear test result when key changes
        if (name.includes('api_key')) {
            const provider = name.replace('_api_key', '');
            setTestResults(prev => ({ ...prev, [provider]: null }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setSaveMessage(null);
        try {
            const res = await fetch('/api/admin/config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ settings })
            });
            const data = await res.json();
            if (data.success) {
                setSaveMessage({ type: 'success', text: 'Settings saved successfully!' });
                setOriginalSettings(settings);
                fetchConfigStatus();
            } else {
                setSaveMessage({ type: 'error', text: data.error || 'Failed to save settings' });
            }
        } catch (err) {
            setSaveMessage({ type: 'error', text: 'Error saving settings: ' + err.message });
        } finally {
            setSaving(false);
            setTimeout(() => setSaveMessage(null), 5000);
        }
    };

    const testProvider = async (provider) => {
        setTesting(prev => ({ ...prev, [provider]: true }));
        setTestResults(prev => ({ ...prev, [provider]: null }));
        
        try {
            const res = await fetch('/api/admin/config/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ provider })
            });
            const data = await res.json();
            setTestResults(prev => ({ ...prev, [provider]: data }));
        } catch (err) {
            setTestResults(prev => ({ 
                ...prev, 
                [provider]: { success: false, error: err.message } 
            }));
        } finally {
            setTesting(prev => ({ ...prev, [provider]: false }));
        }
    };

    const hasChanges = () => {
        return JSON.stringify(settings) !== JSON.stringify(originalSettings);
    };

    const getProviderStatus = (provider) => {
        if (!configStatus) return null;
        return configStatus.providers[provider];
    };

    const getTestResultDisplay = (provider) => {
        const result = testResults[provider];
        if (!result) return null;
        
        return (
            <span className={`${styles.badge} ${result.success ? styles.badgeSuccess : styles.badgeError}`}>
                {result.success ? '✓ Connected' : `✗ ${result.error}`}
            </span>
        );
    };

    if (loading) {
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
                    <h1 className={styles.pageTitle}>LLM Configuration</h1>
                    <p className={styles.pageSubtitle}>
                        Configure AI providers and system rules for integrity analysis.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    {saveMessage && (
                        <span className={`${styles.alert} ${saveMessage.type === 'success' ? styles.alertSuccess : styles.alertError}`}>
                            {saveMessage.text}
                        </span>
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving || !hasChanges()}
                        className="btn btn-primary"
                    >
                        {saving ? 'Saving...' : hasChanges() ? 'Save Changes' : 'No Changes'}
                    </button>
                </div>
            </div>

            <div className={styles.dashboardGrid}>
                {/* Left Column: Provider Settings */}
                <div style={{ gridColumn: 'span 2' }}>
                    {/* Active Provider Card */}
                    <div className={styles.formCard} style={{ marginBottom: '24px' }}>
                        <div className={styles.cardHeader}>
                            <h3>Active Engine</h3>
                            {configStatus && (
                                <span className={`${styles.badge} ${configStatus.provider !== 'mock' ? styles.badgeSuccess : styles.badgeWarning}`}>
                                    {configStatus.provider === 'mock' ? 'Using Mock' : `Using ${configStatus.provider}`}
                                </span>
                            )}
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

                            {/* Model Selection for Active Provider */}
                            {settings.llm_provider !== 'mock' && (
                                <div className="form-group" style={{ marginTop: '16px' }}>
                                    <label className={styles.label}>Model</label>
                                    <select
                                        name={`${settings.llm_provider}_model`}
                                        value={settings[`${settings.llm_provider}_model`]}
                                        onChange={handleChange}
                                        className={styles.select}
                                    >
                                        {PROVIDER_MODELS[settings.llm_provider]?.map(model => (
                                            <option key={model.value} value={model.value}>
                                                {model.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* API Credentials Vault */}
                    <div className={styles.formCard} style={{ marginBottom: '24px' }}>
                        <div className={styles.cardHeader}>
                            <h3>Credentials Vault</h3>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>
                                Encrypted at rest
                            </span>
                        </div>
                        <div className={styles.formSection}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                {/* OpenAI */}
                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className={styles.label}>OpenAI API Key</label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {getTestResultDisplay('openai')}
                                            {getProviderStatus('openai')?.configured && (
                                                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Saved</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="password"
                                            name="openai_api_key"
                                            value={settings.openai_api_key}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="sk-..."
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            onClick={() => testProvider('openai')}
                                            disabled={testing.openai || !settings.openai_api_key}
                                            className="btn btn-secondary"
                                            style={{ padding: '8px 12px', fontSize: '12px' }}
                                        >
                                            {testing.openai ? 'Testing...' : 'Test'}
                                        </button>
                                    </div>
                                </div>

                                {/* Anthropic */}
                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className={styles.label}>Anthropic API Key</label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {getTestResultDisplay('anthropic')}
                                            {getProviderStatus('anthropic')?.configured && (
                                                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Saved</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="password"
                                            name="anthropic_api_key"
                                            value={settings.anthropic_api_key}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="sk-ant-..."
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            onClick={() => testProvider('anthropic')}
                                            disabled={testing.anthropic || !settings.anthropic_api_key}
                                            className="btn btn-secondary"
                                            style={{ padding: '8px 12px', fontSize: '12px' }}
                                        >
                                            {testing.anthropic ? 'Testing...' : 'Test'}
                                        </button>
                                    </div>
                                </div>

                                {/* Gemini */}
                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className={styles.label}>Google Gemini Key</label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {getTestResultDisplay('gemini')}
                                            {getProviderStatus('gemini')?.configured && (
                                                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Saved</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="password"
                                            name="gemini_api_key"
                                            value={settings.gemini_api_key}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="AI..."
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            onClick={() => testProvider('gemini')}
                                            disabled={testing.gemini || !settings.gemini_api_key}
                                            className="btn btn-secondary"
                                            style={{ padding: '8px 12px', fontSize: '12px' }}
                                        >
                                            {testing.gemini ? 'Testing...' : 'Test'}
                                        </button>
                                    </div>
                                </div>

                                {/* Groq */}
                                <div className="form-group">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <label className={styles.label}>Groq Key</label>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            {getTestResultDisplay('groq')}
                                            {getProviderStatus('groq')?.configured && (
                                                <span className={`${styles.badge} ${styles.badgeSuccess}`}>Saved</span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="password"
                                            name="groq_api_key"
                                            value={settings.groq_api_key}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="gsk_..."
                                            style={{ flex: 1 }}
                                        />
                                        <button
                                            onClick={() => testProvider('groq')}
                                            disabled={testing.groq || !settings.groq_api_key}
                                            className="btn btn-secondary"
                                            style={{ padding: '8px 12px', fontSize: '12px' }}
                                        >
                                            {testing.groq ? 'Testing...' : 'Test'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Configuration Summary */}
                    {configStatus && (
                        <div className={styles.formCard}>
                            <div className={styles.cardHeader}>
                                <h3>Configuration Summary</h3>
                            </div>
                            <div className={styles.formSection}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a' }}>
                                            {Object.values(configStatus.providers).filter(p => p.configured).length}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            Providers Configured
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a' }}>
                                            {Object.values(configStatus.features).filter(f => f).length}
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            Features Enabled
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a' }}>
                                            {configStatus.thresholds.highRisk}%
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            High Risk Threshold
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '24px', fontWeight: '600', color: '#0f172a' }}>
                                            {configStatus.thresholds.lowIntegrity}%
                                        </div>
                                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                            Low Integrity Threshold
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: System Prompt */}
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
                                    rows={20}
                                    placeholder="You are an expert writing analyst..."
                                    style={{ fontFamily: 'monospace', fontSize: '12px' }}
                                />
                                <p style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                                    Instructions for the AI on how to detect stylometric anomalies.
                                    The AI should respond with JSON containing aiRisk, citations, and reasoning fields.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
