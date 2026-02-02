"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import styles from "../../admin.module.css";
import detailStyles from "./submission-detail.module.css";
import { analyzeSubmissionLLM } from "../../../../lib/intelligence/llm-adapter";

// Mock deterministic data (from Module 08)
const mockDeterministicData = {
    id: "2",
    writer: { name: "Michael Chen", avatar: "MC", status: "active" },
    assignment: "Technical Documentation for Payment API",
    submittedAt: "2026-02-02T14:00:00Z",
    deterministicResults: {
        styleMatch: 72,
        internalSimilarity: 15,
        stylometry: {
            sentenceLengthVariance: "High",
            vocabularyDiversity: "Moderate",
            vocabularyRichness: 0.68,
            readabilityIndex: "12.4",
        },
    },
};

export default function SubmissionDetailPage() {
    const { id } = useParams();
    const [llmResults, setLlmResults] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchLLMData = async () => {
            const data = await analyzeSubmissionLLM(id);
            setLlmResults(data);
            setIsLoading(false);
        };
        fetchLLMData();
    }, [id]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    if (isLoading) {
        return (
            <div className={detailStyles.loadingScreen}>
                <div className={detailStyles.spinner}></div>
                <p>Running LLM Intelligence Analysis...</p>
            </div>
        );
    }

    return (
        <div className={styles.adminLayout}>
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <div className={styles.sidebarLogo}>
                        <span>✍️</span> Writer<span>Integrity</span>
                    </div>
                </div>
                <nav className={styles.sidebarNav}>
                    <div className={styles.navSection}>
                        <span className={styles.navSectionTitle}>Navigation</span>
                        <Link href="/admin/integrity" className={styles.navItem}>
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                            </svg>
                            Back to Reports
                        </Link>
                    </div>
                </nav>
            </aside>

            <main className={styles.adminMain}>
                <div className={detailStyles.reportHeader}>
                    <div>
                        <div className={detailStyles.writerBadge}>
                            <div className={detailStyles.avatar}>{mockDeterministicData.writer.avatar}</div>
                            <span>{mockDeterministicData.writer.name}</span>
                            <span className={`badge badge-success`}>{mockDeterministicData.writer.status}</span>
                        </div>
                        <h1 className={detailStyles.title}>{mockDeterministicData.assignment}</h1>
                        <p className={detailStyles.meta}>Submitted {formatDate(mockDeterministicData.submittedAt)} • ID: {id}</p>
                    </div>
                    <div className={detailStyles.actions}>
                        <button className="btn btn-secondary">Download PDF</button>
                        <button className="btn btn-danger">Reject</button>
                        <button className="btn btn-success">Approve Submission</button>
                    </div>
                </div>

                <div className={detailStyles.reportGrid}>
                    {/* Left Column: Deterministic Metrics */}
                    <div className={detailStyles.column}>
                        <section className={detailStyles.sectionCard}>
                            <h3>Stylometry Baseline Analysis</h3>
                            <div className={detailStyles.metricMain}>
                                <div className={detailStyles.gaugeContainer}>
                                    <div className={detailStyles.gaugeLabel}>Style Match</div>
                                    <div className={detailStyles.gaugeValue}>{mockDeterministicData.deterministicResults.styleMatch}%</div>
                                </div>
                                <div className={detailStyles.statList}>
                                    <div className={detailStyles.statItem}>
                                        <span className={detailStyles.statLabel}>Sentence Var.</span>
                                        <span className={detailStyles.statVal}>{mockDeterministicData.deterministicResults.stylometry.sentenceLengthVariance}</span>
                                    </div>
                                    <div className={detailStyles.statItem}>
                                        <span className={detailStyles.statLabel}>Vocab Diversity</span>
                                        <span className={detailStyles.statVal}>{mockDeterministicData.deterministicResults.stylometry.vocabularyDiversity}</span>
                                    </div>
                                    <div className={detailStyles.statItem}>
                                        <span className={detailStyles.statLabel}>Readability</span>
                                        <span className={detailStyles.statVal}>{mockDeterministicData.deterministicResults.stylometry.readabilityIndex}</span>
                                    </div>
                                </div>
                            </div>
                            <p className={detailStyles.interpretation}>
                                Writer deviates from baseline in <strong>Complex Terminology</strong> usage compared to previous samples.
                            </p>
                        </section>

                        <section className={detailStyles.sectionCard}>
                            <h3>Internal Similarity</h3>
                            <div className={detailStyles.similarityHeader}>
                                <span className={detailStyles.similarityScore}>{mockDeterministicData.deterministicResults.internalSimilarity}% Overlap</span>
                                <span className="badge badge-success">Low Risk</span>
                            </div>
                            <div className={detailStyles.similarityNote}>
                                Overlap detected only in technical boilerplate and standard API response schemas.
                            </div>
                        </section>
                    </div>

                    {/* Right Column: LLM Intelligence (Module 09) */}
                    <div className={detailStyles.column}>
                        <section className={`${detailStyles.sectionCard} ${detailStyles.aiRiskCard}`}>
                            <div className={detailStyles.cardHeader}>
                                <h3>AI Assistant Risk</h3>
                                <span className={detailStyles.scorePill}>{llmResults.aiRisk.score}% AI Probability</span>
                            </div>

                            <div className={detailStyles.markerList}>
                                {llmResults.aiRisk.markers.map((m, i) => (
                                    <div key={i} className={`${detailStyles.marker} ${detailStyles[m.type]}`}>
                                        {m.message}
                                    </div>
                                ))}
                            </div>
                            <div className={detailStyles.analystNote}>
                                <strong>LLM Evaluation:</strong> {llmResults.aiRisk.fragmentAnalysis}
                            </div>
                        </section>

                        <section className={detailStyles.sectionCard}>
                            <h3>Citation Sanity Check</h3>
                            <div className={detailStyles.citationHeader}>
                                <span className={detailStyles.citationCount}>{llmResults.citations.verifiedCount}/{llmResults.citations.totalCount} Verified</span>
                            </div>
                            <div className={detailStyles.citationList}>
                                {llmResults.citations.checkResults.map((c) => (
                                    <div key={c.id} className={detailStyles.citationItem}>
                                        <div className={detailStyles.citationSource}>
                                            <span className={`${detailStyles.dot} ${detailStyles[c.status]}`}></span>
                                            <strong>{c.source}</strong>
                                        </div>
                                        <div className={detailStyles.citationSnippet}>{c.snippet}</div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className={`${detailStyles.sectionCard} ${detailStyles.reasoningCard}`}>
                            <h3>Reasoning Depth</h3>
                            <div className={detailStyles.reasoningHeader}>
                                <span className={detailStyles.reasoningScore}>{llmResults.reasoning.score}</span>
                                <span className={detailStyles.scoreMax}>/ 100</span>
                            </div>
                            <p className={detailStyles.reasoningText}>{llmResults.reasoning.analysis}</p>
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
