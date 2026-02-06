"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import styles from "@/app/writer/dashboard.module.css";

export default function WriterLayout({ children, activeNav }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const router = useRouter();

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch("/api/me");
            const data = await res.json();
            if (data.authenticated && data.user) {
                setUser({
                    id: data.user.id,
                    email: data.user.email,
                    role: data.user.role,
                    fullName: data.user.profile?.fullName || "Writer",
                    profile: data.user.profile,
                });
            } else {
                router.push("/login");
            }
        } catch {
            router.push("/login");
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch {
            // Clear cookie client-side as fallback
        }
        router.push("/login");
    };

    const getActive = (nav) => {
        if (activeNav) return activeNav === nav ? styles.active : "";
        if (nav === "dashboard" && pathname === "/writer") return styles.active;
        if (nav === "assignments" && pathname.startsWith("/writer/assignments")) return styles.active;
        if (nav === "submissions" && pathname === "/writer/submissions") return styles.active;
        if (nav === "insights" && pathname === "/writer/insights") return styles.active;
        return "";
    };

    const initials = user?.fullName
        ? user.fullName.split(" ").map((n) => n[0]).join("").toUpperCase()
        : "U";

    return (
        <div className={styles.dashboardLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Z" />
                        </svg>
                        WriterHub
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <Link href="/writer" className={`${styles.navItem} ${getActive("dashboard")}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        Dashboard
                    </Link>
                    <Link href="/writer/assignments" className={`${styles.navItem} ${getActive("assignments")}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                        </svg>
                        Assignments
                    </Link>
                    <Link href="/writer/submissions" className={`${styles.navItem} ${getActive("submissions")}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                        </svg>
                        Submissions
                    </Link>
                    <Link href="/writer/insights" className={`${styles.navItem} ${getActive("insights")}`}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
                        </svg>
                        Insights
                    </Link>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>{initials}</div>
                        <div className={styles.userDetails}>
                            <span className={styles.userName}>{user?.fullName || "User"}</span>
                            <span className={`${styles.userStatus} ${styles[(user?.profile?.status || "ONBOARDING").toLowerCase()]}`}>
                                {user?.profile?.status || "ONBOARDING"}
                            </span>
                        </div>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn} title="Sign out">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                        </svg>
                    </button>
                </div>
            </aside>

            <main className={styles.dashboardMain}>
                {typeof children === "function" ? children({ user, loading }) : children}
            </main>
        </div>
    );
}
