import React, { useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';

const Modal = ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    size = 'md',
    showCloseButton = true,
    closeOnOverlayClick = true,
    className = '',
}) => {
    const modalRef = useRef(null);
    const previousFocus = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previousFocus.current = document.activeElement;
            modalRef.current?.focus();
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            previousFocus.current?.focus();
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleOverlayClick = (e) => {
        if (closeOnOverlayClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            onClose();
        }
    };

    if (!isOpen) return null;

    const sizes = {
        sm: 'modal-sm',
        md: 'modal-md',
        lg: 'modal-lg',
        xl: 'modal-xl',
    };

    return (
        <div
            className="modal-overlay"
            onClick={handleOverlayClick}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'modal-title' : undefined}
        >
            <div 
                className={`modal-content ${sizes[size]} ${className}`}
                ref={modalRef}
                tabIndex={-1}
            >
                <div className="modal-header">
                    {title && <h2 id="modal-title">{title}</h2>}
                    {showCloseButton && (
                        <button className="modal-close" onClick={onClose} aria-label="Close modal">
                            <FaTimes />
                        </button>
                    )}
                </div>
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Add these styles to global.css
const modalStyles = `
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
  padding: var(--spacing-md);
}

.modal-content {
  background: white;
  border-radius: var(--radius-xl);
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    transform: scale(0.95) translateY(-10px);
    opacity: 0;
  }
  to {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.modal-sm { max-width: 400px; width: 100%; }
.modal-md { max-width: 600px; width: 100%; }
.modal-lg { max-width: 800px; width: 100%; }
.modal-xl { max-width: 1000px; width: 100%; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-lg);
  border-bottom: 1px solid var(--neutral-200);
  flex-shrink: 0;
}

.modal-header h2 {
  font-size: var(--font-size-xl);
  color: var(--neutral-800);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--neutral-400);
  cursor: pointer;
  padding: var(--spacing-xs);
  transition: color var(--transition-fast);
}

.modal-close:hover {
  color: var(--neutral-600);
}

.modal-body {
  padding: var(--spacing-lg);
  overflow-y: auto;
  flex: 1;
}
`;

export default Modal;