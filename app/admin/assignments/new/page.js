"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";
import formStyles from "./form.module.css";

// Mock writers list
const mockWriters = [
    { id: "1", name: "Sarah Johnson", status: "probation", workTypes: ["academic", "technical"] },
    { id: "2", name: "Michael Chen", status: "active", workTypes: ["academic"] },
    { id: "5", name: "Lisa Thompson", status: "probation", workTypes: ["academic"] },
];

export default function NewAssignmentPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        writerId: "",
        category: "",
        brief: "",
        wordCount: "",
        citationStyle: "",
        deadline: "",
        priority: "normal",
        attachments: [],
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [errors, setErrors] = useState({});

    const filteredWriters = mockWriters.filter(w =>
        w.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = "Title is required";
        if (!formData.writerId) newErrors.writerId = "Please select a writer";
        if (!formData.category) newErrors.category = "Please select a category";
        if (!formData.brief.trim()) newErrors.brief = "Brief is required";
        if (!formData.wordCount) newErrors.wordCount = "Word count is required";
        if (!formData.deadline) newErrors.deadline = "Deadline is required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setIsSubmitting(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        router.push("/admin/assignments");
    };

    // Close search on click outside
    if (typeof window !== "undefined") {
        window.onclick = (e) => {
            if (!e.target.closest(`.${formStyles.searchableSelect}`)) {
                setIsSearchOpen(false);
                setSearchTerm("");
            }
        };
    }

    const selectedWriter = mockWriters.find((w) => w.id === formData.writerId);

    return (
        <div className={styles.adminLayout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        <span>✍️</span> Writer<span>Integrity</span>
                    </div>
                </div>

                <nav className={styles.sidebarNav}>
                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Overview</span>
                        <Link href="/admin" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            Dashboard
                        </Link>
                    </div>

                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Assignments</span>
                        <Link href="/admin/assignments" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                            </svg>
                            All Assignments
                        </Link>
                        <Link href="/admin/assignments/new" className={`${styles.navItem} ${styles.active}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                            New Assignment
                        </Link>
                    </div>
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>AD</div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>Admin User</div>
                            <div className={styles.userRole}>Administrator</div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.adminMain}>
                {/* Header */}
                <div className={styles.pageHeader}>
                    <div>
                        <h1 className={styles.pageTitle}>Create Assignment</h1>
                        <p className={styles.pageSubtitle}>
                            Assign a new task to a writer.
                        </p>
                    </div>
                </div>

                {/* Form */}
                <div className={formStyles.formContainer}>
                    <form onSubmit={handleSubmit}>
                        <div className={formStyles.formCard}>
                            <div className={formStyles.formSection}>
                                <h3>Assignment Details</h3>

                                <div className="form-group">
                                    <label className="form-label">Assignment Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        className="form-input"
                                        placeholder="e.g., Research Paper on Machine Learning"
                                    />
                                    {errors.title && <span className="form-error">{errors.title}</span>}
                                </div>

                                <div className={formStyles.formRow}>
                                    <div className="form-group">
                                        <label className="form-label">Select Writer *</label>
                                        <div className={formStyles.searchableSelect}>
                                            <input
                                                type="text"
                                                className="form-input"
                                                placeholder="Search writers..."
                                                value={searchTerm || (selectedWriter?.name || "")}
                                                onChange={(e) => {
                                                    setSearchTerm(e.target.value);
                                                    setIsSearchOpen(true);
                                                }}
                                                onFocus={() => setIsSearchOpen(true)}
                                            />
                                            {isSearchOpen && (
                                                <div className={formStyles.dropdownList}>
                                                    {filteredWriters.map((writer) => (
                                                        <div
                                                            key={writer.id}
                                                            className={formStyles.dropdownItem}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, writerId: writer.id }));
                                                                setSearchTerm("");
                                                                setIsSearchOpen(false);
                                                            }}
                                                        >
                                                            <span>{writer.name}</span>
                                                            <span className={`badge badge-${writer.status === "active" ? "success" : "warning"}`}>
                                                                {writer.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    {filteredWriters.length === 0 && (
                                                        <div className={formStyles.noResults}>No writers found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        {errors.writerId && <span className="form-error">{errors.writerId}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Category *</label>
                                        <select
                                            name="category"
                                            value={formData.category}
                                            onChange={handleChange}
                                            className="form-select"
                                            disabled={!formData.writerId}
                                        >
                                            <option value="">Select category...</option>
                                            {selectedWriter?.workTypes.includes("academic") && (
                                                <option value="academic">Academic Writing</option>
                                            )}
                                            {selectedWriter?.workTypes.includes("technical") && (
                                                <option value="technical">Technical Writing</option>
                                            )}
                                        </select>
                                        {errors.category && <span className="form-error">{errors.category}</span>}
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Assignment Brief *</label>
                                    <textarea
                                        name="brief"
                                        value={formData.brief}
                                        onChange={handleChange}
                                        className="form-textarea"
                                        placeholder="Provide detailed instructions for the writer..."
                                        rows={5}
                                    ></textarea>
                                    {errors.brief && <span className="form-error">{errors.brief}</span>}
                                </div>
                            </div>

                            <div className={formStyles.formSection}>
                                <h3>Requirements</h3>

                                <div className={formStyles.formRow}>
                                    <div className="form-group">
                                        <label className="form-label">Word Count *</label>
                                        <input
                                            type="number"
                                            name="wordCount"
                                            value={formData.wordCount}
                                            onChange={handleChange}
                                            className="form-input"
                                            placeholder="e.g., 3000"
                                            min="100"
                                        />
                                        {errors.wordCount && <span className="form-error">{errors.wordCount}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Citation Style</label>
                                        <select
                                            name="citationStyle"
                                            value={formData.citationStyle}
                                            onChange={handleChange}
                                            className="form-select"
                                        >
                                            <option value="">No specific style</option>
                                            <option value="apa">APA (7th Edition)</option>
                                            <option value="mla">MLA</option>
                                            <option value="chicago">Chicago</option>
                                            <option value="harvard">Harvard</option>
                                            <option value="ieee">IEEE</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={formStyles.formRow}>
                                    <div className="form-group">
                                        <label className="form-label">Deadline *</label>
                                        <input
                                            type="datetime-local"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            className="form-input"
                                        />
                                        {errors.deadline && <span className="form-error">{errors.deadline}</span>}
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label">Priority</label>
                                        <select
                                            name="priority"
                                            value={formData.priority}
                                            onChange={handleChange}
                                            className="form-select"
                                        >
                                            <option value="low">Low</option>
                                            <option value="normal">Normal</option>
                                            <option value="high">High</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className={formStyles.formActions}>
                                <Link href="/admin/assignments" className="btn btn-secondary">
                                    Cancel
                                </Link>
                                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner spinner-sm"></span>
                                            Creating...
                                        </>
                                    ) : (
                                        "Create Assignment"
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
