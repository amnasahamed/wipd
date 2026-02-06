"use client";

export default function ConfirmDialog({
    open,
    title = "Confirm Action",
    message = "Are you sure?",
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "primary",
    onConfirm,
    onCancel,
    children,
    isLoading = false,
}) {
    if (!open) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="modal-header">
                    <h3>{title}</h3>
                    <button className="modal-close" onClick={onCancel} aria-label="Close dialog">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    {children || <p>{message}</p>}
                </div>
                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onCancel} disabled={isLoading}>
                        {cancelText}
                    </button>
                    <button
                        className={`btn btn-${variant}`}
                        onClick={onConfirm}
                        disabled={isLoading}
                    >
                        {isLoading && <span className="spinner spinner-sm"></span>}
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
