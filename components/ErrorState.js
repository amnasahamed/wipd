export default function ErrorState({ message = "Something went wrong", onRetry = null }) {
    return (
        <div className="error-state">
            <div className="error-state-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
            </div>
            <h3 className="error-state-title">Error</h3>
            <p className="error-state-message">{message}</p>
            {onRetry && (
                <button onClick={onRetry} className="btn btn-primary btn-sm">
                    Try Again
                </button>
            )}
        </div>
    );
}
