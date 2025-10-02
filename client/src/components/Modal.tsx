import React from 'react';

export interface ModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    confirmDisabled?: boolean;
}

export default function Modal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmDisabled = false
}: ModalProps) {
    if (!isOpen) return null;

    return (
        <div
            data-automation-id="modal-overlay"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000
            }}
            onClick={onCancel}
        >
            <div
                data-automation-id="modal-dialog"
                style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '8px',
                    minWidth: '400px',
                    maxWidth: '90%',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <h3 data-automation-id="modal-title" style={{ margin: '0 0 16px 0' }}>
                    {title}
                </h3>
                <p data-automation-id="modal-message" style={{ margin: '0 0 24px 0' }}>
                    {message}
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <button
                        data-automation-id="modal-cancel"
                        onClick={onCancel}
                        style={{
                            padding: '8px 16px',
                            cursor: 'pointer',
                            border: '1px solid #ccc',
                            background: 'white',
                            borderRadius: '4px'
                        }}
                    >
                        {cancelText}
                    </button>
                    <button
                        data-automation-id="modal-confirm"
                        onClick={onConfirm}
                        disabled={confirmDisabled}
                        style={{
                            padding: '8px 16px',
                            cursor: confirmDisabled ? 'not-allowed' : 'pointer',
                            border: 'none',
                            background: confirmDisabled ? '#ccc' : '#f44336',
                            color: 'white',
                            borderRadius: '4px',
                            opacity: confirmDisabled ? 0.6 : 1
                        }}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
