export function LoadingSpinner({ text = "Loading...", size = "default" }) {
    return (
        <div className="loading-state">
            <div className={`spinner ${size === "small" ? "spinner-sm" : size === "large" ? "spinner-lg" : ""}`}></div>
            {text && <p className="loading-state-text">{text}</p>}
        </div>
    );
}

export function Skeleton({ width = "100%", height = "20px", borderRadius = "var(--radius-md)" }) {
    return (
        <div
            className="skeleton"
            style={{ width, height, borderRadius }}
            aria-hidden="true"
        />
    );
}

export function SkeletonCard() {
    return (
        <div className="skeleton-card" aria-hidden="true">
            <div className="skeleton-card-header">
                <Skeleton width="60px" height="24px" borderRadius="var(--radius-full)" />
                <Skeleton width="80px" height="24px" borderRadius="var(--radius-full)" />
            </div>
            <Skeleton width="70%" height="20px" />
            <div className="skeleton-card-meta">
                <Skeleton width="100px" height="16px" />
                <Skeleton width="80px" height="16px" />
            </div>
            <div className="skeleton-card-footer">
                <Skeleton width="90px" height="28px" borderRadius="var(--radius-full)" />
                <Skeleton width="100px" height="32px" borderRadius="var(--radius-lg)" />
            </div>
        </div>
    );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
    return (
        <div className="skeleton-table" aria-hidden="true">
            <div className="skeleton-table-header">
                {Array.from({ length: cols }).map((_, i) => (
                    <Skeleton key={i} width={`${60 + Math.random() * 40}px`} height="14px" />
                ))}
            </div>
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="skeleton-table-row">
                    {Array.from({ length: cols }).map((_, c) => (
                        <Skeleton key={c} width={`${50 + Math.random() * 50}%`} height="16px" />
                    ))}
                </div>
            ))}
        </div>
    );
}

export function SkeletonStats({ count = 4 }) {
    return (
        <div className="skeleton-stats" aria-hidden="true">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="skeleton-stat-card">
                    <Skeleton width="40px" height="40px" borderRadius="var(--radius-lg)" />
                    <div style={{ flex: 1 }}>
                        <Skeleton width="60px" height="28px" />
                        <Skeleton width="100px" height="14px" />
                    </div>
                </div>
            ))}
        </div>
    );
}
