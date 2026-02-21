/**
 * Secure Configuration Service
 * Handles encryption/decryption of sensitive configuration values
 * and provides a centralized way to manage system configuration
 */

import CryptoJS from 'crypto-js';
import prisma from '@/lib/prisma';

// Encryption key from environment - must be set in production
const ENCRYPTION_KEY = process.env.CONFIG_ENCRYPTION_KEY || 'default-dev-key-change-in-production';

// Default configuration values
const DEFAULT_CONFIG = {
    // LLM Provider settings
    llm_provider: 'mock',
    openai_api_key: '',
    openai_model: 'gpt-4o-mini',
    anthropic_api_key: '',
    anthropic_model: 'claude-3-5-sonnet-20241022',
    gemini_api_key: '',
    gemini_model: 'gemini-1.5-flash',
    groq_api_key: '',
    groq_model: 'llama-3.1-70b-versatile',
    
    // System prompts and settings
    system_prompt: `You are an expert writing analyst specializing in academic and professional content evaluation.

Your task is to analyze the submitted text and provide a detailed assessment of:
1. AI-generated content probability
2. Citation accuracy and formatting
3. Writing style consistency
4. Reasoning depth and logical flow

Provide specific examples from the text to support your analysis.
Respond in JSON format with the following structure:
{
  "aiRisk": { "score": 0-100, "markers": [{"type": "warning|neutral|positive", "message": "..."}], "fragmentAnalysis": "..." },
  "citations": { "score": 0-100, "verifiedCount": N, "totalCount": N, "checkResults": [...] },
  "reasoning": { "score": 0-100, "analysis": "..." }
}`,
    
    // Risk thresholds
    risk_threshold_high: '50',
    risk_threshold_medium: '20',
    integrity_threshold_low: '60',
    integrity_threshold_medium: '80',
    
    // Feature flags
    enable_llm_analysis: 'true',
    enable_style_analysis: 'true',
    enable_citation_check: 'true',
    
    // Rate limiting
    max_requests_per_minute: '60',
    max_file_size_mb: '10',
};

// Keys that should always be encrypted
const SECRET_KEYS = [
    'openai_api_key',
    'anthropic_api_key',
    'gemini_api_key',
    'groq_api_key',
    'api_secret',
    'jwt_secret',
    'encryption_key'
];

/**
 * Encrypt a value
 * @param {string} value - Value to encrypt
 * @returns {string} - Encrypted value with prefix
 */
function encrypt(value) {
    if (!value || value.startsWith('enc:')) return value;
    try {
        const encrypted = CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
        return `enc:${encrypted}`;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt configuration value');
    }
}

/**
 * Decrypt a value
 * @param {string} value - Value to decrypt (must have 'enc:' prefix)
 * @returns {string} - Decrypted value
 */
function decrypt(value) {
    if (!value || !value.startsWith('enc:')) return value;
    try {
        const encrypted = value.substring(4); // Remove 'enc:' prefix
        const bytes = CryptoJS.AES.decrypt(encrypted, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt configuration value - encryption key may have changed');
    }
}

/**
 * Check if a key should be treated as secret
 * @param {string} key - Configuration key
 * @returns {boolean}
 */
function isSecretKey(key) {
    return SECRET_KEYS.some(secret => key.toLowerCase().includes(secret.toLowerCase()));
}

/**
 * Get all configuration values
 * @param {Object} options - Options
 * @param {boolean} options.decryptSecrets - Whether to decrypt secret values (default: true for server-side)
 * @param {boolean} options.maskSecrets - Whether to mask secret values (default: false)
 * @returns {Promise<Object>} - Configuration object
 */
export async function getAllConfig(options = {}) {
    const { decryptSecrets = true, maskSecrets = false } = options;
    
    try {
        const configs = await prisma.systemConfig.findMany();
        const configMap = { ...DEFAULT_CONFIG };
        
        for (const config of configs) {
            let value = config.value;
            
            if (config.isSecret) {
                if (decryptSecrets && !maskSecrets) {
                    value = decrypt(value);
                } else if (maskSecrets) {
                    value = value ? '********' : '';
                }
            }
            
            configMap[config.key] = value;
        }
        
        return configMap;
    } catch (error) {
        console.error('Error fetching configuration:', error);
        return DEFAULT_CONFIG;
    }
}

/**
 * Get a single configuration value
 * @param {string} key - Configuration key
 * @param {string} defaultValue - Default value if not found
 * @param {boolean} decryptValue - Whether to decrypt if secret (default: true)
 * @returns {Promise<string>} - Configuration value
 */
export async function getConfig(key, defaultValue = '', decryptValue = true) {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key }
        });
        
        if (!config) {
            return DEFAULT_CONFIG[key] || defaultValue;
        }
        
        let value = config.value;
        
        if (config.isSecret && decryptValue) {
            value = decrypt(value);
        }
        
        return value;
    } catch (error) {
        console.error(`Error fetching config for key ${key}:`, error);
        return DEFAULT_CONFIG[key] || defaultValue;
    }
}

/**
 * Set a configuration value
 * @param {string} key - Configuration key
 * @param {string} value - Configuration value
 * @param {Object} options - Options
 * @param {string} options.category - Configuration category
 * @param {string} options.description - Configuration description
 * @param {string} options.updatedBy - User ID who made the update
 * @returns {Promise<Object>} - Updated config
 */
export async function setConfig(key, value, options = {}) {
    const { category = 'general', description = '', updatedBy = null } = options;
    
    // Skip if value is masked (not changed)
    if (value === '********') {
        return null;
    }
    
    const isSecret = isSecretKey(key);
    const valueToStore = isSecret ? encrypt(value) : value;
    
    try {
        const config = await prisma.systemConfig.upsert({
            where: { key },
            update: { 
                value: valueToStore, 
                isSecret,
                updatedAt: new Date()
            },
            create: { 
                key, 
                value: valueToStore, 
                isSecret,
                category,
                description,
                updatedBy
            }
        });
        
        return config;
    } catch (error) {
        console.error(`Error setting config for key ${key}:`, error);
        throw new Error(`Failed to save configuration: ${error.message}`);
    }
}

/**
 * Set multiple configuration values at once
 * @param {Object} settings - Object with key-value pairs
 * @param {Object} options - Options
 * @param {string} options.updatedBy - User ID who made the update
 * @returns {Promise<Object>} - Result
 */
export async function setMultipleConfig(settings, options = {}) {
    const { updatedBy = null } = options;
    const results = [];
    const errors = [];
    
    for (const [key, value] of Object.entries(settings)) {
        try {
            // Skip empty values for secrets (don't overwrite with empty)
            if (isSecretKey(key) && !value) {
                continue;
            }
            
            // Skip masked values (not changed)
            if (value === '********') {
                continue;
            }
            
            const result = await setConfig(key, value, { updatedBy });
            if (result) results.push(result);
        } catch (error) {
            errors.push({ key, error: error.message });
        }
    }
    
    return { success: errors.length === 0, results, errors };
}

/**
 * Delete a configuration value
 * @param {string} key - Configuration key to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteConfig(key) {
    try {
        await prisma.systemConfig.delete({
            where: { key }
        });
        return true;
    } catch (error) {
        console.error(`Error deleting config for key ${key}:`, error);
        return false;
    }
}

/**
 * Initialize default configuration
 * Useful for first-time setup
 * @returns {Promise<void>}
 */
export async function initializeDefaultConfig() {
    const keys = Object.keys(DEFAULT_CONFIG);
    
    for (const key of keys) {
        const exists = await prisma.systemConfig.findUnique({
            where: { key }
        });
        
        if (!exists) {
            await setConfig(key, DEFAULT_CONFIG[key], {
                category: key.includes('api_key') ? 'llm' : 
                          key.includes('threshold') ? 'risk' : 
                          key.includes('prompt') ? 'llm' : 'general',
                description: `Default value for ${key}`
            });
        }
    }
}

/**
 * Test if configuration encryption is working properly
 * @returns {boolean}
 */
export function testEncryption() {
    try {
        const testValue = 'test-encryption-123';
        const encrypted = encrypt(testValue);
        const decrypted = decrypt(encrypted);
        return decrypted === testValue;
    } catch (error) {
        console.error('Encryption test failed:', error);
        return false;
    }
}

/**
 * Get configuration summary for health checks (no sensitive data)
 * @returns {Promise<Object>}
 */
export async function getConfigSummary() {
    try {
        const configs = await prisma.systemConfig.findMany();
        const summary = {
            total: configs.length,
            categories: {},
            providers: [],
            features: {}
        };
        
        for (const config of configs) {
            // Count by category
            summary.categories[config.category] = (summary.categories[config.category] || 0) + 1;
            
            // Track configured providers
            if (config.key === 'llm_provider') {
                summary.providers.push(config.value);
            }
            
            // Track feature flags
            if (config.key.startsWith('enable_')) {
                summary.features[config.key] = config.value === 'true';
            }
        }
        
        return summary;
    } catch (error) {
        console.error('Error getting config summary:', error);
        return { total: 0, categories: {}, providers: [], features: {} };
    }
}

export default {
    getAllConfig,
    getConfig,
    setConfig,
    setMultipleConfig,
    deleteConfig,
    initializeDefaultConfig,
    testEncryption,
    getConfigSummary,
    DEFAULT_CONFIG
};
