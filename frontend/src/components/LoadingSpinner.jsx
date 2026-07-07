import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading...', fullPage = false }) => {
    const sizes = {
        sm: 'spinner-sm',
        md: '',
        lg: 'spinner-lg',
    };

    const spinner = <div className={`spinner ${sizes[size]}`}></div>;

    if (fullPage) {
        return (
            <div className="loading-full-page">
                {spinner}
                {text && <p className="loading-text">{text}</p>}
            </div>
        );
    }

    return (
        <div className="loading-container">
            {spinner}
            {text && <span className="loading-text ml-2">{text}</span>}
        </div>
    );
};

// Add these styles to global.css
const styles = `
.loading-full-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: var(--spacing-lg);
}

.loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-text {
  color: var(--neutral-500);
  font-size: var(--font-size-sm);
}

.ml-2 {
  margin-left: var(--spacing-sm);
}
`;

export default LoadingSpinner;