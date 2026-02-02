import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.homePage}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span>✨</span>
            <span>Writer Integrity Platform</span>
          </div>
          <h1 className={styles.heroTitle}>
            Verify Writers. <span>Ensure Quality.</span> Build Trust.
          </h1>
          <p className={styles.heroDescription}>
            A comprehensive platform for writer onboarding, content verification,
            and integrity assurance. From skill assessment to AI-powered quality checks.
          </p>
          <div className={styles.heroCta}>
            <Link href="/onboarding" className="btn btn-primary btn-lg">
              Get Started →
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={styles.features}>
        <div className={styles.featuresHeader}>
          <h2>Everything You Need</h2>
          <p>
            Comprehensive tools to manage writers, verify content, and maintain quality standards.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
              </svg>
            </div>
            <h3>Writer Onboarding</h3>
            <p>Multi-step registration with skill assessments, grammar tests, and sample uploads.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
              </svg>
            </div>
            <h3>Integrity Verification</h3>
            <p>AI-powered analysis for style fingerprinting, plagiarism detection, and authenticity checks.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h3>Assignment Management</h3>
            <p>Streamlined workflow for assigning work, tracking deadlines, and managing submissions.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
              </svg>
            </div>
            <h3>Performance Tracking</h3>
            <p>Writer scorecards, consistency metrics, and detailed analytics for continuous improvement.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <h3>Citation Analysis</h3>
            <p>Verify reference plausibility, check citation formatting, and detect suspicious sources.</p>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
              </svg>
            </div>
            <h3>AI Risk Detection</h3>
            <p>LLM-powered analysis to identify AI-generated content and unusual writing patterns.</p>
          </div>
        </div>
      </section>

      {/* Phases Section */}
      <section className={styles.phases}>
        <div className={styles.phasesHeader}>
          <h2>How It Works</h2>
        </div>

        <div className={styles.phasesTimeline}>
          <div className={styles.phaseItem}>
            <div className={styles.phaseNumber}>1</div>
            <div className={styles.phaseContent}>
              <h3>Writer Onboarding</h3>
              <p>Profile setup, skill tests, sample uploads, and policy acknowledgment.</p>
            </div>
          </div>

          <div className={styles.phaseItem}>
            <div className={styles.phaseNumber}>2</div>
            <div className={styles.phaseContent}>
              <h3>Admin Review</h3>
              <p>Review applications, approve qualified writers, and establish baselines.</p>
            </div>
          </div>

          <div className={styles.phaseItem}>
            <div className={styles.phaseNumber}>3</div>
            <div className={styles.phaseContent}>
              <h3>Work Assignment</h3>
              <p>Assign tasks with deadlines, word counts, and citation requirements.</p>
            </div>
          </div>

          <div className={styles.phaseItem}>
            <div className={styles.phaseNumber}>4</div>
            <div className={styles.phaseContent}>
              <h3>Integrity Checks</h3>
              <p>Automated verification for consistency, originality, and authenticity.</p>
            </div>
          </div>

          <div className={styles.phaseItem}>
            <div className={styles.phaseNumber}>5</div>
            <div className={styles.phaseContent}>
              <h3>Final Review & Delivery</h3>
              <p>Admin approval, feedback loop, and work delivery with full audit trail.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={styles.ctaSection}>
        <h2>Ready to Get Started?</h2>
        <p>Join our platform and start the onboarding process.</p>
        <Link href="/onboarding" className="btn">
          Begin Writer Onboarding
        </Link>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>© 2026 Writer Integrity System. All rights reserved.</p>
      </footer>
    </div>
  );
}
