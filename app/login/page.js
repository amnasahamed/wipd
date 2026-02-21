"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import styles from "./login.module.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("writer");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Email validation regex
    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        // Client-side validation
        if (!email.trim()) {
            setError("Email is required");
            return;
        }

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address");
            return;
        }

        if (!password) {
            setError("Password is required");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {
                // Verify role matches selection (security check)
                const userRole = data.user.role.toLowerCase();
                const selectedRole = role.toLowerCase();
                
                if (userRole !== selectedRole) {
                    setError(`This account is a ${data.user.role}, not a ${role}. Please select the correct role.`);
                    setIsLoading(false);
                    return;
                }

                // Redirect based on role
                if (data.user.role === 'ADMIN') {
                    router.push("/admin");
                } else {
                    router.push("/writer");
                }
            } else {
                setError(data.error || 'Invalid email or password');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={styles.loginContainer}>
            <div className={styles.loginCard}>
                <div className={styles.loginHeader}>
                    <div className={styles.logo}>✍️</div>
                    <h1>Welcome Back</h1>
                    <p>Sign in to your Writer Integrity account</p>
                </div>

                <form className={styles.loginForm} onSubmit={handleLogin}>
                    <div className={styles.roleToggle}>
                        <button
                            type="button"
                            className={role === "writer" ? styles.active : ""}
                            onClick={() => setRole("writer")}
                        >
                            Writer
                        </button>
                        <button
                            type="button"
                            className={role === "admin" ? styles.active : ""}
                            onClick={() => setRole("admin")}
                        >
                            Admin
                        </button>
                    </div>

                    {error && (
                        <div className={styles.errorMessage} style={{
                            background: '#fee2e2',
                            color: '#dc2626',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            fontSize: '14px',
                            marginBottom: '16px',
                            border: '1px solid #fecaca'
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isLoading}
                            autoComplete="email"
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isLoading}
                            autoComplete="current-password"
                        />
                    </div>

                    <div className={styles.formOptions}>
                        <label className={styles.rememberMe}>
                            <input type="checkbox" disabled={isLoading} /> Remember me
                        </label>
                        <Link href="#" className={styles.forgotPassword} onClick={(e) => {
                            e.preventDefault();
                            alert('Please contact your administrator to reset your password.');
                        }}>Forgot password?</Link>
                    </div>

                    <button 
                        type="submit" 
                        className={styles.loginButton} 
                        disabled={isLoading}
                        style={{ opacity: isLoading ? 0.7 : 1 }}
                    >
                        {isLoading ? (
                            <>
                                <span className={styles.spinner} style={{
                                    display: 'inline-block',
                                    width: '16px',
                                    height: '16px',
                                    border: '2px solid #ffffff',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite',
                                    marginRight: '8px',
                                    verticalAlign: 'middle'
                                }}></span>
                                Signing in...
                            </>
                        ) : "Sign In"}
                    </button>
                </form>

                <div className={styles.loginFooter}>
                    Don't have an account? <Link href="/onboarding">Get started</Link>
                </div>
            </div>
            
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
