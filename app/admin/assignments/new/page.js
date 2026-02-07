"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../../admin.module.css";
import formStyles from "./form.module.css";

// Mock writers list
export default function NewAssignmentPage() {
    const router = useRouter();
    const [writers, setWriters] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [formData, setFormData] = useState({
        title: "",
        writerId: "",
        category: "",
        brief: "",
        wordCount: "",
        citationStyle: "",
        deadline: "",
        priority: "normal"
    });

    useEffect(() => {
        const fetchWriters = async () => {
            try {
                const res = await fetch('/api/writers');
                const data = await res.json();
                // Filter for active/probation writers only? Assuming API returns all.
                // Let's filter client side or assume API handles it. 
                // For safety:
                if (data.writers) {
                    setWriters(data.writers);
                }
            } catch (err) {
                console.error("Failed to fetch writers", err);
            }
        };
        fetchWriters();
    }, []);

    const filteredWriters = writers.filter(w =>
        w.fullName.toLowerCase().includes(searchTerm.toLowerCase())
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
        try {
            const res = await fetch('/api/assignments', { // Need to check if this route exists! usually app/api/assignments/route.js
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                router.push("/admin/assignments");
            } else {
                console.error("Submit failed");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSubmitting(false);
        }
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

    const selectedWriter = writers.find((w) => w.id === formData.writerId);

    return (
    return (
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
                                            value={searchTerm || (selectedWriter?.fullName || "")}
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
                                                        <span>{writer.fullName}</span>
                                                        <span className={`badge badge-${writer.status === "ACTIVE" ? "success" : "warning"}`}>
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
                                    >
                                        <option value="">Select category...</option>
                                        <option value="academic">Academic Writing</option>
                                        <option value="technical">Technical Writing</option>
                                        <option value="copywriting">Copywriting</option>
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
    );
}
