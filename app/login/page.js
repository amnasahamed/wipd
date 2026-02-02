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
    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (data.success) {
                // Redirect based on role
                if (data.user.role === 'ADMIN') {
                    router.push("/admin");
                } else {
                    router.push("/writer");
                }
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (err) {
            console.error('Login error:', err);
            alert('An error occurred during login');
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

                    <div className={styles.inputGroup}>
                        <label>Email Address</label>
                        <input
                            type="email"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className={styles.formOptions}>
                        <label className={styles.rememberMe}>
                            <input type="checkbox" /> Remember me
                        </label>
                        <Link href="#" className={styles.forgotPassword}>Forgot password?</Link>
                    </div>

                    <button type="submit" className={styles.loginButton} disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <div className={styles.loginFooter}>
                    Don't have an account? <Link href="/onboarding">Get started</Link>
                </div>
            </div>
        </div>
    );
}
