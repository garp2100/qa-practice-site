import React, { useEffect } from 'react';

export interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColors = {
        success: '#4caf50',
        error: '#f44336',
        info: '#2196f3',
        warning: '#ff9800'
    };

    return (
        <div
            data-automation-id={`toast-${type}`}
            style={{
                position: 'fixed',
                top: '20px',
                right: '20px',
                backgroundColor: bgColors[type],
                color: 'white',
                padding: '16px 24px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                zIndex: 9999,
                minWidth: '250px',
                animation: 'slideIn 0.3s ease-out'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span data-automation-id="toast-message">{message}</span>
                <button
                    data-automation-id="toast-close"
                    onClick={onClose}
                    style={{
                        marginLeft: '16px',
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '18px'
                    }}
                >
                    ×
                </button>
            </div>
        </div>
    );
}
