import React from 'react';

const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    disabled = false,
    loading = false,
    type = 'button',
    onClick,
    className = '',
    ...props 
}) => {
    const variants = {
        primary: 'btn-primary',
        secondary: 'btn-secondary',
        accent: 'btn-accent',
        outline: 'btn-outline',
        danger: 'btn-danger',
        success: 'btn-success',
    };

    const sizes = {
        sm: 'btn-sm',
        md: '',
        lg: 'btn-lg',
    };

    const classes = [
        'btn',
        variants[variant] || 'btn-primary',
        sizes[size] || '',
        fullWidth ? 'btn-full' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <>
                    <span className="spinner spinner-sm"></span>
                    {children}
                </>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;