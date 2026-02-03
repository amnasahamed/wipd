"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "./onboarding.module.css";

// Onboarding steps
const STEPS = [
    { id: "profile", label: "Profile" },
    { id: "work-type", label: "Work Type" },
    { id: "grammar-test", label: "Grammar Test" },
    { id: "policy-test", label: "Policy Test" },
    { id: "samples", label: "Samples" },
    { id: "declaration", label: "Declaration" },
];

import { useEffect } from "react";

// Initial form data
const initialFormData = {
    // Profile
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    education: "",
    experience: "",
    timezone: "",
    // Work Types
    workTypes: [],
    // Grammar Test
    grammarAnswers: {},
    // Policy Test
    policyAnswers: {},
    // Samples
    academicSamples: [],
    technicalSamples: [],
    // Declaration
    declarationAccepted: false,
};

// Grammar MCQ Questions
const grammarQuestions = [
    {
        id: 1,
        question: "Choose the correct sentence:",
        options: [
            "Neither the students nor the teacher were present.",
            "Neither the students nor the teacher was present.",
            "Neither the students nor the teacher are present.",
            "Neither the students nor the teacher is present.",
        ],
        correct: 1,
    },
    {
        id: 2,
        question: 'Which word correctly completes the sentence: "The data ____ conclusive."',
        options: ["is", "are", "were", "being"],
        correct: 0,
    },
    {
        id: 3,
        question: "Identify the sentence with correct punctuation:",
        options: [
            "Its important to proofread, your work carefully.",
            "It's important to proofread your work carefully.",
            "Its important to proofread your work, carefully.",
            "It's important, to proofread your work carefully.",
        ],
        correct: 1,
    },
    {
        id: 4,
        question: "Select the sentence with proper parallel structure:",
        options: [
            "She likes swimming, to run, and cycling.",
            "She likes to swim, running, and cycling.",
            "She likes swimming, running, and cycling.",
            "She likes to swim, to run, and cycle.",
        ],
        correct: 2,
    },
    {
        id: 5,
        question: "Which sentence uses the correct form of the verb?",
        options: [
            "The committee have made their decision.",
            "The committee has made its decision.",
            "The committee has made their decision.",
            "The committee have made its decision.",
        ],
        correct: 1,
    },
];

// Policy MCQ Questions
const policyQuestions = [
    {
        id: 1,
        question: "What is the policy on using AI assistance for writing?",
        options: [
            "AI can be used freely without disclosure",
            "AI use is strictly prohibited under all circumstances",
            "AI may assist with grammar but not content generation",
            "AI misuse is prohibited and all work must be original",
        ],
        correct: 3,
    },
    {
        id: 2,
        question: "What happens if plagiarism is detected in your work?",
        options: [
            "A warning is issued for the first offense",
            "The work is returned for revision only",
            "Immediate termination without review",
            "Consequences escalate from warning to removal",
        ],
        correct: 3,
    },
    {
        id: 3,
        question: "Who is responsible for ensuring proper citations?",
        options: [
            "The platform administrators",
            "The writer submitting the work",
            "The client requesting the work",
            "The review team",
        ],
        correct: 1,
    },
    {
        id: 4,
        question: "Can you reuse content from your previous submissions?",
        options: [
            "Yes, all previous work can be reused freely",
            "Yes, with proper self-citation",
            "No, each submission must be unique",
            "Only if the client approves",
        ],
        correct: 2,
    },
    {
        id: 5,
        question: "What should you do if you're unsure about citation requirements?",
        options: [
            "Skip citations if unsure",
            "Use any format you prefer",
            "Contact admin for clarification before submitting",
            "Submit without citations",
        ],
        correct: 2,
    },
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [currentPolicy, setCurrentPolicy] = useState(null);

    const currentStepData = STEPS[currentStep];
    const progress = ((currentStep + 1) / STEPS.length) * 100;

    // Fetch current policy
    useEffect(() => {
        if (currentStepData.id === "policy-test" || currentStepData.id === "declaration") {
            fetch("/api/policy/current")
                .then(res => res.json())
                .then(data => setCurrentPolicy(data))
                .catch(err => console.error("Failed to fetch policy", err));
        }
    }, [currentStepData.id]);

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: null }));
        }
    };

    // Handle work type selection
    const handleWorkTypeChange = (type) => {
        setFormData((prev) => {
            const types = prev.workTypes.includes(type)
                ? prev.workTypes.filter((t) => t !== type)
                : [...prev.workTypes, type];
            return { ...prev, workTypes: types };
        });
    };

    // Handle MCQ answers
    const handleMcqAnswer = (testType, questionId, answerIndex) => {
        const key = testType === "grammar" ? "grammarAnswers" : "policyAnswers";
        setFormData((prev) => ({
            ...prev,
            [key]: { ...prev[key], [questionId]: answerIndex },
        }));
    };

    // Handle file upload
    const handleFileUpload = (category, files) => {
        const key = category === "academic" ? "academicSamples" : "technicalSamples";
        const newFiles = Array.from(files).filter(
            (file) =>
                file.name.endsWith(".doc") ||
                file.name.endsWith(".docx")
        );
        setFormData((prev) => ({
            ...prev,
            [key]: [...prev[key], ...newFiles].slice(0, 3),
        }));
    };

    // Remove file
    const removeFile = (category, index) => {
        const key = category === "academic" ? "academicSamples" : "technicalSamples";
        setFormData((prev) => ({
            ...prev,
            [key]: prev[key].filter((_, i) => i !== index),
        }));
    };

    // Validate current step
    const validateStep = () => {
        const newErrors = {};

        switch (currentStepData.id) {
            case "profile":
                if (!formData.name.trim()) newErrors.name = "Name is required";
                if (!formData.email.trim()) newErrors.email = "Email is required";
                else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                    newErrors.email = "Invalid email format";
                }
                if (!formData.password) newErrors.password = "Password is required";
                else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
                if (formData.password !== formData.confirmPassword) {
                    newErrors.confirmPassword = "Passwords do not match";
                }
                if (!formData.education) newErrors.education = "Education level is required";
                if (!formData.timezone) newErrors.timezone = "Timezone is required";
                break;

            case "work-type":
                if (formData.workTypes.length === 0) {
                    newErrors.workTypes = "Please select at least one work type";
                }
                break;

            case "grammar-test":
                const grammarAnswered = Object.keys(formData.grammarAnswers).length;
                if (grammarAnswered < grammarQuestions.length) {
                    newErrors.grammar = "Please answer all questions";
                }
                break;

            case "policy-test":
                const policyAnswered = Object.keys(formData.policyAnswers).length;
                if (policyAnswered < policyQuestions.length) {
                    newErrors.policy = "Please answer all questions";
                }
                break;

            case "samples":
                if (formData.workTypes.includes("academic") && formData.academicSamples.length < 2) {
                    newErrors.academicSamples = "Upload at least 2 academic samples";
                }
                if (formData.workTypes.includes("technical") && formData.technicalSamples.length < 2) {
                    newErrors.technicalSamples = "Upload at least 2 technical samples";
                }
                break;

            case "declaration":
                if (!formData.declarationAccepted) {
                    newErrors.declaration = "You must accept the declaration";
                }
                break;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Navigate steps
    const nextStep = () => {
        if (validateStep()) {
            if (currentStep < STEPS.length - 1) {
                setCurrentStep((prev) => prev + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    // Submit form
    const handleSubmit = async () => {
        setIsSubmitting(true);
        setErrors({});

        try {
            // 1. Create User & Profile
            const userRes = await fetch("/api/onboarding/start", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    name: formData.name,
                    phone: formData.phone,
                    education: formData.education,
                    experience: formData.experience,
                    timezone: formData.timezone,
                    workTypes: formData.workTypes,
                    role: "WRITER"
                })
            });

            const userData = await userRes.json();
            if (!userData.success) throw new Error(userData.error || "Failed to create account");

            const userId = userData.user.id; // Get real ID from DB

            // 2. Submit Assessment Results (Module 04)
            await fetch("/api/tests/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId, // Pass the real user ID
                    testType: "grammar",
                    responses: formData.grammarAnswers
                })
            });

            await fetch("/api/tests/submit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId, // Pass the real user ID
                    testType: "policy",
                    responses: formData.policyAnswers
                })
            });

            // 3. Upload Samples & Create Baselines (Module 05)
            const allSamples = [...formData.academicSamples, ...formData.technicalSamples];
            for (const file of allSamples) {
                const sampleData = new FormData();
                sampleData.append("file", file);
                sampleData.append("writerId", userId); // Pass the real user ID

                await fetch("/api/baseline/upload", {
                    method: "POST",
                    body: sampleData
                });
            }

            setIsCompleted(true);
        } catch (error) {
            console.error("Submission failed", error);
            setErrors({ submit: error.message || "There was an error submitting your application. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Calculate test scores
    const calculateScore = (answers, questions) => {
        let correct = 0;
        questions.forEach((q) => {
            if (answers[q.id] === q.correct) correct++;
        });
        return { correct, total: questions.length };
    };

    // Render step content
    const renderStepContent = () => {
        if (isCompleted) {
            return (
                <div className={styles.successState}>
                    <div className={styles.successIcon}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </div>
                    <h1>Application Submitted!</h1>
                    <p>
                        Your onboarding application has been submitted successfully.
                        Our team will review your profile and samples. You'll receive an email notification once a decision is made.
                    </p>
                    <Link href="/" className="btn btn-primary btn-lg">
                        Return to Home
                    </Link>
                </div>
            );
        }

        switch (currentStepData.id) {
            case "profile":
                return <ProfileStep formData={formData} onChange={handleInputChange} errors={errors} />;
            case "work-type":
                return (
                    <WorkTypeStep
                        selected={formData.workTypes}
                        onChange={handleWorkTypeChange}
                        error={errors.workTypes}
                    />
                );
            case "grammar-test":
                return (
                    <McqTestStep
                        title="Grammar & Language Assessment"
                        description="Answer all questions to test your grammar and language skills."
                        questions={grammarQuestions}
                        answers={formData.grammarAnswers}
                        onAnswer={(qId, aIdx) => handleMcqAnswer("grammar", qId, aIdx)}
                        error={errors.grammar}
                    />
                );
            case "policy-test":
                return (
                    <McqTestStep
                        title="Content Writing Policy"
                        description="Demonstrate your understanding of our content policies and guidelines."
                        questions={policyQuestions}
                        answers={formData.policyAnswers}
                        onAnswer={(qId, aIdx) => handleMcqAnswer("policy", qId, aIdx)}
                        error={errors.policy}
                    />
                );
            case "samples":
                return (
                    <SamplesStep
                        workTypes={formData.workTypes}
                        academicSamples={formData.academicSamples}
                        technicalSamples={formData.technicalSamples}
                        onUpload={handleFileUpload}
                        onRemove={removeFile}
                        errors={errors}
                    />
                );
            case "declaration":
                return (
                    <DeclarationStep
                        accepted={formData.declarationAccepted}
                        onChange={(accepted) =>
                            setFormData((prev) => ({ ...prev, declarationAccepted: accepted }))
                        }
                        error={errors.declaration}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <div className={styles.onboardingLayout}>
            {/* Header */}
            <header className={styles.onboardingHeader}>
                <div className={styles.onboardingHeaderInner}>
                    <Link href="/" className={styles.onboardingLogo}>
                        <span>✍️</span> Writer<span>Integrity</span>
                    </Link>
                    <div className={styles.timer}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                        </svg>
                        <span>~15 min remaining</span>
                    </div>
                </div>
            </header>

            {/* Progress */}
            {!isCompleted && (
                <div className={styles.progressSection}>
                    <div className={styles.progressSectionInner}>
                        <div className={styles.progressContainer}>
                            <div className={styles.progressInfo}>
                                <span className={styles.progressStep}>
                                    Step {currentStep + 1}: {STEPS[currentStep].label}
                                </span>
                                <span className={styles.progressPercent}>{Math.round(progress)}% complete</span>
                            </div>
                            <div className="progress">
                                <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>

                        <nav className={styles.stepsNav}>
                            {STEPS.map((step, index) => (
                                <div key={step.id} className={styles.stepWrapper}>
                                    {index > 0 && (
                                        <div
                                            className={`${styles.stepConnector} ${index <= currentStep ? styles.active : ""
                                                }`}
                                        ></div>
                                    )}
                                    <div
                                        className={`${styles.stepItem} ${index === currentStep
                                            ? styles.active
                                            : index < currentStep
                                                ? styles.completed
                                                : ""
                                            }`}
                                    >
                                        <span className={styles.stepDot}></span>
                                        <span>{step.label}</span>
                                    </div>
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className={styles.onboardingMain}>
                <div className={styles.onboardingCard}>
                    {!isCompleted && (
                        <div className={styles.onboardingCardHeader}>
                            <h1>{getStepTitle(currentStepData.id)}</h1>
                            <p>{getStepDescription(currentStepData.id)}</p>
                        </div>
                    )}

                    <div className={styles.onboardingCardBody}>{renderStepContent()}</div>

                    {!isCompleted && (
                        <div className={styles.onboardingCardFooter}>
                            {currentStep > 0 ? (
                                <button onClick={prevStep} className="btn btn-secondary">
                                    ← Back
                                </button>
                            ) : (
                                <div></div>
                            )}
                            <button
                                onClick={nextStep}
                                className="btn btn-primary"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner spinner-sm"></span>
                                        Submitting...
                                    </>
                                ) : currentStep === STEPS.length - 1 ? (
                                    "Submit Application"
                                ) : (
                                    "Continue →"
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

// Helper function for step titles
function getStepTitle(stepId) {
    const titles = {
        profile: "Create Your Profile",
        "work-type": "Select Work Types",
        "grammar-test": "Grammar Assessment",
        "policy-test": "Policy Understanding",
        samples: "Upload Work Samples",
        declaration: "Final Declaration",
    };
    return titles[stepId] || "";
}

// Helper function for step descriptions
function getStepDescription(stepId) {
    const descriptions = {
        profile: "Tell us about yourself and your background.",
        "work-type": "Choose the types of writing you want to do.",
        "grammar-test": "Complete this assessment to demonstrate your language skills.",
        "policy-test": "Show that you understand our content policies.",
        samples: "Upload samples of your previous work (DOC/DOCX only).",
        declaration: "Review and confirm your submission.",
    };
    return descriptions[stepId] || "";
}

// Profile Step Component
function ProfileStep({ formData, onChange, errors }) {
    return (
        <div>
            <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={onChange}
                    className={`form-input ${errors.name ? "error" : ""}`}
                    placeholder="Enter your full name"
                />
                {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className={styles.formRow}>
                <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        className={`form-input ${errors.email ? "error" : ""}`}
                        placeholder="you@example.com"
                    />
                    {errors.email && <span className="form-error">{errors.email}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={onChange}
                        className="form-input"
                        placeholder="+1 (555) 000-0000"
                    />
                </div>
            </div>

            <div className={styles.formRow}>
                <div className="form-group">
                    <label className="form-label">Password *</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        className={`form-input ${errors.password ? "error" : ""}`}
                        placeholder="Enter a secure password"
                    />
                    {errors.password && <span className="form-error">{errors.password}</span>}
                    <small className="form-hint">Minimum 8 characters</small>
                </div>

                <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={onChange}
                        className={`form-input ${errors.confirmPassword ? "error" : ""}`}
                        placeholder="Re-enter your password"
                    />
                    {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
                </div>
            </div>

            <div className={styles.formRow}>
                <div className="form-group">
                    <label className="form-label">Education Level *</label>
                    <select
                        name="education"
                        value={formData.education}
                        onChange={onChange}
                        className={`form-select ${errors.education ? "error" : ""}`}
                    >
                        <option value="">Select education level</option>
                        <option value="high-school">High School</option>
                        <option value="bachelors">Bachelor's Degree</option>
                        <option value="masters">Master's Degree</option>
                        <option value="phd">Ph.D. / Doctorate</option>
                        <option value="other">Other</option>
                    </select>
                    {errors.education && <span className="form-error">{errors.education}</span>}
                </div>

                <div className="form-group">
                    <label className="form-label">Years of Experience</label>
                    <select
                        name="experience"
                        value={formData.experience}
                        onChange={onChange}
                        className="form-select"
                    >
                        <option value="">Select experience</option>
                        <option value="0-1">Less than 1 year</option>
                        <option value="1-3">1-3 years</option>
                        <option value="3-5">3-5 years</option>
                        <option value="5-10">5-10 years</option>
                        <option value="10+">10+ years</option>
                    </select>
                </div>
            </div>

            <div className="form-group">
                <label className="form-label">Timezone *</label>
                <select
                    name="timezone"
                    value={formData.timezone}
                    onChange={onChange}
                    className={`form-select ${errors.timezone ? "error" : ""}`}
                >
                    <option value="">Select your timezone</option>
                    <option value="UTC-8">Pacific Time (UTC-8)</option>
                    <option value="UTC-5">Eastern Time (UTC-5)</option>
                    <option value="UTC+0">GMT (UTC+0)</option>
                    <option value="UTC+1">Central European Time (UTC+1)</option>
                    <option value="UTC+5:30">India Standard Time (UTC+5:30)</option>
                    <option value="UTC+8">China Standard Time (UTC+8)</option>
                    <option value="UTC+9">Japan Standard Time (UTC+9)</option>
                </select>
                {errors.timezone && <span className="form-error">{errors.timezone}</span>}
            </div>
        </div>
    );
}

// Work Type Step Component
function WorkTypeStep({ selected, onChange, error }) {
    const workTypes = [
        {
            id: "academic",
            title: "Academic Writing",
            description: "Research papers, essays, dissertations",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
            ),
        },
        {
            id: "technical",
            title: "Technical Writing",
            description: "Documentation, guides, manuals",
            icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
            ),
        },
    ];

    return (
        <div>
            <div className={styles.workTypeGrid}>
                {workTypes.map((type) => (
                    <label
                        key={type.id}
                        className={`${styles.workTypeCard} ${selected.includes(type.id) ? styles.selected : ""
                            }`}
                    >
                        <input
                            type="checkbox"
                            checked={selected.includes(type.id)}
                            onChange={() => onChange(type.id)}
                        />
                        <div className={styles.workTypeIcon}>{type.icon}</div>
                        <h3>{type.title}</h3>
                        <p>{type.description}</p>
                        <div className={styles.workTypeCheck}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        </div>
                    </label>
                ))}
            </div>
            {error && (
                <div className="alert alert-danger mt-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}
            <div className="alert alert-info mt-6">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>You can select both types if you're capable of both academic and technical writing.</span>
            </div>
        </div>
    );
}

// MCQ Test Step Component
function McqTestStep({ title, description, questions, answers, onAnswer, error }) {
    return (
        <div className={styles.mcqContainer}>
            {error && (
                <div className="alert alert-danger">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    {error}
                </div>
            )}

            {questions.map((q, qIndex) => (
                <div key={q.id} className={styles.mcqQuestion}>
                    <div className={styles.mcqQuestionHeader}>
                        <span className={styles.mcqQuestionNumber}>Q{qIndex + 1}</span>
                    </div>
                    <p className={styles.mcqQuestionText}>{q.question}</p>
                    <div className={styles.mcqOptions}>
                        {q.options.map((option, oIndex) => (
                            <label
                                key={oIndex}
                                className={`${styles.mcqOption} ${answers[q.id] === oIndex ? styles.selected : ""
                                    }`}
                            >
                                <input
                                    type="radio"
                                    name={`question-${q.id}`}
                                    checked={answers[q.id] === oIndex}
                                    onChange={() => onAnswer(q.id, oIndex)}
                                />
                                <span className={styles.mcqOptionIndicator}></span>
                                <span className={styles.mcqOptionText}>{option}</span>
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            <div className="text-sm text-secondary text-center">
                {Object.keys(answers).length} of {questions.length} questions answered
            </div>
        </div>
    );
}

// Samples Step Component
function SamplesStep({ workTypes, academicSamples, technicalSamples, onUpload, onRemove, errors }) {
    const handleDrop = (category) => (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        onUpload(category, files);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className={styles.uploadZone}>
            {workTypes.includes("academic") && (
                <div>
                    <h4 className="mb-4">Academic Writing Samples</h4>
                    <div
                        className={styles.uploadArea}
                        onDrop={handleDrop("academic")}
                        onDragOver={handleDragOver}
                    >
                        <input
                            type="file"
                            accept=".doc,.docx"
                            multiple
                            onChange={(e) => onUpload("academic", e.target.files)}
                        />
                        <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                        </svg>
                        <div className={styles.uploadText}>
                            <h4>Drop files here or <span>browse</span></h4>
                            <p>Upload 2-3 academic writing samples (DOC/DOCX only)</p>
                        </div>
                    </div>

                    {academicSamples.length > 0 && (
                        <div className={`${styles.uploadedFiles} mt-4`}>
                            {academicSamples.map((file, index) => (
                                <div key={index} className={styles.uploadedFile}>
                                    <div className={styles.uploadedFileIcon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                    </div>
                                    <div className={styles.uploadedFileInfo}>
                                        <div className={styles.uploadedFileName}>{file.name}</div>
                                        <div className={styles.uploadedFileSize}>
                                            {(file.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                    <button
                                        className={styles.uploadedFileRemove}
                                        onClick={() => onRemove("academic", index)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {errors.academicSamples && (
                        <div className="form-error mt-2">{errors.academicSamples}</div>
                    )}
                </div>
            )}

            {workTypes.includes("technical") && (
                <div className="mt-6">
                    <h4 className="mb-4">Technical Writing Samples</h4>
                    <div
                        className={styles.uploadArea}
                        onDrop={handleDrop("technical")}
                        onDragOver={handleDragOver}
                    >
                        <input
                            type="file"
                            accept=".doc,.docx"
                            multiple
                            onChange={(e) => onUpload("technical", e.target.files)}
                        />
                        <svg className={styles.uploadIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
                        </svg>
                        <div className={styles.uploadText}>
                            <h4>Drop files here or <span>browse</span></h4>
                            <p>Upload 2-3 technical writing samples (DOC/DOCX only)</p>
                        </div>
                    </div>

                    {technicalSamples.length > 0 && (
                        <div className={`${styles.uploadedFiles} mt-4`}>
                            {technicalSamples.map((file, index) => (
                                <div key={index} className={styles.uploadedFile}>
                                    <div className={styles.uploadedFileIcon}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                        </svg>
                                    </div>
                                    <div className={styles.uploadedFileInfo}>
                                        <div className={styles.uploadedFileName}>{file.name}</div>
                                        <div className={styles.uploadedFileSize}>
                                            {(file.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                    <button
                                        className={styles.uploadedFileRemove}
                                        onClick={() => onRemove("technical", index)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="18" y1="6" x2="6" y2="18"></line>
                                            <line x1="6" y1="6" x2="18" y2="18"></line>
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {errors.technicalSamples && (
                        <div className="form-error mt-2">{errors.technicalSamples}</div>
                    )}
                </div>
            )}
        </div>
    );
}

// Declaration Step Component
function DeclarationStep({ accepted, onChange, error }) {
    return (
        <div>
            <div className={styles.declarationBox}>
                <h3>Important Notice</h3>
                <p>
                    Before submitting your application, please read and acknowledge the following:
                </p>
            </div>

            <div className={`${styles.declarationBox} mb-6`}>
                <h4 className="mb-3">By submitting this application, you confirm that:</h4>
                <ul style={{ paddingLeft: "1.25rem", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
                    <li style={{ marginBottom: "0.5rem" }}>
                        All writing samples provided are your original work and represent your natural writing style.
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                        You have not used AI tools to generate the sample content.
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                        You understand and agree to comply with our content policies.
                    </li>
                    <li style={{ marginBottom: "0.5rem" }}>
                        All information provided in this application is accurate and truthful.
                    </li>
                    <li>
                        You understand that violations may result in removal from the platform.
                    </li>
                </ul>
            </div>

            <label className={styles.declarationCheckbox}>
                <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => onChange(e.target.checked)}
                />
                <span>
                    I confirm that these samples are my original work and represent my natural writing style.
                    I agree to abide by all platform policies.
                </span>
            </label>

            {error && <div className="form-error mt-2">{error}</div>}
        </div>
    );
}
